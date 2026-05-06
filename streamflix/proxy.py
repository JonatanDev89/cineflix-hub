#!/usr/bin/env python3
"""
CineFlix Hub — Servidor com proxy de pagamento Mercado Pago
Porta: 3000
"""

import http.server
import urllib.request
import urllib.parse
import urllib.error
import json
import os
import time
import threading
import uuid

PORT       = int(os.environ.get("PORT", 3000))
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# ===== MERCADO PAGO CONFIG =====
# Token mantido no servidor — nunca exposto ao frontend
MP_TOKEN = "APP_USR-8056159904642779-121712-97635788558ef7b14683ec3b2a3b4e20-1076799609"
MP_API   = "https://api.mercadopago.com"

# Planos disponíveis
PLANS = {
    "monthly": {"title": "CineFlix VIP — 1 Mês",  "price": 19.90, "days": 30},
    "yearly":  {"title": "CineFlix VIP — 1 Ano",   "price": 99.90, "days": 365},
}

# Pagamentos pendentes em memória: {payment_id: {user_id, plan, status, created_at}}
pending_payments = {}
_lock = threading.Lock()


def mp_request(method, path, body=None):
    """Faz requisição autenticada para a API do Mercado Pago."""
    url = MP_API + path
    data = json.dumps(body).encode("utf-8") if body else None
    req  = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {MP_TOKEN}",
            "Content-Type":  "application/json",
            "X-Idempotency-Key": str(uuid.uuid4()),
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return json.loads(body), e.code
        except Exception:
            return {"error": body}, e.code
    except Exception as e:
        return {"error": str(e)}, 500


def create_pix_payment(user_id, user_email, user_name, plan_key):
    """Cria um pagamento PIX via Mercado Pago e retorna QR code."""
    plan = PLANS.get(plan_key)
    if not plan:
        return None, "Plano inválido"

    idempotency = f"cineflix-{user_id}-{plan_key}-{int(time.time())}"

    payload = {
        "transaction_amount": plan["price"],
        "description":        plan["title"],
        "payment_method_id":  "pix",
        "payer": {
            "email": user_email or f"user{user_id}@cineflixhub.com",
            "first_name": (user_name or "Usuario").split()[0],
            "last_name":  (user_name or "Demo").split()[-1] if len((user_name or "").split()) > 1 else "Demo",
            "identification": {
                "type":   "CPF",
                "number": "00000000000"  # placeholder — em produção pedir CPF real
            }
        },
        "metadata": {
            "user_id":  str(user_id),
            "plan_key": plan_key,
        }
    }

    data, status = mp_request("POST", "/v1/payments", payload)

    if status not in (200, 201):
        print(f"  [MP] Erro ao criar pagamento: {status} — {data}")
        return None, data.get("message", "Erro ao criar pagamento")

    payment_id = data.get("id")
    qr_data    = data.get("point_of_interaction", {}).get("transaction_data", {})
    qr_code    = qr_data.get("qr_code")
    qr_base64  = qr_data.get("qr_code_base64")

    if not payment_id or not qr_code:
        return None, "QR code não gerado"

    # Salva pagamento pendente
    with _lock:
        pending_payments[str(payment_id)] = {
            "user_id":    str(user_id),
            "plan_key":   plan_key,
            "plan":       plan,
            "status":     "pending",
            "created_at": time.time(),
        }

    print(f"  [MP] Pagamento criado: id={payment_id} user={user_id} plano={plan_key}")

    return {
        "payment_id": payment_id,
        "qr_code":    qr_code,
        "qr_base64":  qr_base64,
        "amount":     plan["price"],
        "title":      plan["title"],
        "expires_in": 600,  # 10 minutos
    }, None


def check_payment_status(payment_id):
    """Verifica o status de um pagamento no Mercado Pago."""
    data, status = mp_request("GET", f"/v1/payments/{payment_id}")
    if status != 200:
        return None, f"Erro {status}"

    mp_status = data.get("status")  # pending, approved, rejected, cancelled
    return mp_status, None


# ===== HTTP HANDLER =====
class Handler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def log_message(self, fmt, *args):
        status = args[1] if len(args) > 1 else ''
        print(f"  {self.command:6} {self.path[:70]:70} {status}")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/payment/status"):
            self._payment_status()
        elif self.path.startswith("/api/plans"):
            self._get_plans()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/payment/create"):
            self._create_payment()
        elif self.path.startswith("/api/payment/webhook"):
            self._webhook()
        else:
            self.send_error(404)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def _get_plans(self):
        self._json({"plans": PLANS})

    def _create_payment(self):
        """POST /api/payment/create — cria pagamento PIX."""
        try:
            body     = self._read_body()
            user_id  = body.get("user_id")
            email    = body.get("email", "")
            name     = body.get("name", "")
            plan_key = body.get("plan", "monthly")

            if not user_id:
                self._json({"error": "user_id obrigatório"}, 400)
                return

            result, err = create_pix_payment(user_id, email, name, plan_key)
            if err:
                self._json({"error": err}, 400)
                return

            self._json(result)

        except Exception as e:
            print(f"  [CREATE ERROR] {e}")
            self._json({"error": str(e)}, 500)

    def _payment_status(self):
        """GET /api/payment/status?id=PAYMENT_ID — verifica status."""
        try:
            qs         = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            payment_id = qs.get("id", [None])[0]

            if not payment_id:
                self._json({"error": "id obrigatório"}, 400)
                return

            # Verifica no Mercado Pago
            mp_status, err = check_payment_status(payment_id)
            if err:
                self._json({"error": err}, 400)
                return

            # Atualiza cache local
            with _lock:
                if payment_id in pending_payments:
                    pending_payments[payment_id]["status"] = mp_status

            response = {
                "payment_id": payment_id,
                "status":     mp_status,
                "approved":   mp_status == "approved",
            }

            # Se aprovado, inclui info do plano para o frontend ativar o VIP
            if mp_status == "approved":
                with _lock:
                    info = pending_payments.get(payment_id, {})
                response["user_id"]  = info.get("user_id")
                response["plan_key"] = info.get("plan_key")
                response["plan"]     = info.get("plan")
                print(f"  [MP] ✓ Pagamento aprovado: id={payment_id} user={info.get('user_id')}")

            self._json(response)

        except Exception as e:
            print(f"  [STATUS ERROR] {e}")
            self._json({"error": str(e)}, 500)

    def _webhook(self):
        """POST /api/payment/webhook — recebe notificações do Mercado Pago."""
        try:
            body = self._read_body()
            print(f"  [WEBHOOK] {body}")
            # Apenas confirma recebimento
            self._json({"ok": True})
        except Exception as e:
            self._json({"error": str(e)}, 500)


if __name__ == "__main__":
    os.chdir(STATIC_DIR)
    print(f"\n  CineFlix Hub — http://0.0.0.0:{PORT}")
    print(f"  API Mercado Pago: /api/payment/create | /api/payment/status")
    print(f"  Pressione Ctrl+C para parar\n")
    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Encerrado.")
