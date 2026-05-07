// ===== LOGIN PAGE LOGIC =====

// ===== FUNÇÃO DE LOADING OAUTH (definida primeiro para poder ser chamada imediatamente) =====
function showOAuthLoading(show) {
  let overlay = document.getElementById('oauthLoadingOverlay');
  if (show && !overlay) {
    const insert = () => {
      overlay = document.createElement('div');
      overlay.id = 'oauthLoadingOverlay';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.92);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:16px;
        backdrop-filter:blur(8px);
      `;
      overlay.innerHTML = `
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" style="animation:oauthSpin 0.8s linear infinite">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#e50914" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <p style="color:#fff;font-size:1rem;font-weight:600;font-family:sans-serif;">Autenticando com Google...</p>
        <style>@keyframes oauthSpin { to { transform: rotate(360deg); } }</style>
      `;
      document.body.appendChild(overlay);
    };
    if (document.body) insert();
    else document.addEventListener('DOMContentLoaded', insert);
  } else if (!show && overlay) {
    overlay.remove();
  }
}

// ===== DETECTA CALLBACK OAUTH ANTES DO DOM =====
const _isOAuthCallback = window.location.hash.includes('access_token') ||
                         window.location.search.includes('code=');

if (_isOAuthCallback) {
  showOAuthLoading(true);
}

// ===== MAIN =====
document.addEventListener('DOMContentLoaded', async () => {

  console.log('🔵 Login: Página carregada');

  // ===== HANDLER DO CALLBACK OAUTH =====
  if (_isOAuthCallback) {
    console.log('🟡 Login OAuth: Processando callback...');

    try {
      // Aguardar Supabase inicializar
      let sb = null;
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, 100));

        // Tentar pegar cliente já inicializado
        if (window.supabaseClient) {
          sb = window.supabaseClient;
          break;
        }

        // Tentar inicializar manualmente se o CDN já carregou
        if (window.supabase) {
          const url = (window.CONFIG || {}).SUPABASE_URL || 'https://lynltvzimbqltpafunmu.supabase.co';
          const key = (window.CONFIG || {}).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bmx0dnppbWJxbHRwYWZ1bm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzE2MzIsImV4cCI6MjA5MzYwNzYzMn0.XuF30WIDCYKtC9gD7ZNc03LqMNvw9o0Ujp7ptlxqk30';
          window.supabaseClient = window.supabase.createClient(url, key);
          sb = window.supabaseClient;
          break;
        }
      }

      if (!sb) throw new Error('Supabase não inicializou após 10s');

      console.log('🟢 Login OAuth: Supabase pronto, buscando sessão...');

      // Supabase SDK processa o hash automaticamente
      const { data: { session }, error } = await sb.auth.getSession();

      if (error || !session) {
        console.error('🔴 Login OAuth: Sem sessão válida', error?.message);
        showOAuthLoading(false);
        history.replaceState(null, '', window.location.pathname);
        showAlert('loginAlert', 'error', '❌ Falha ao autenticar com Google. Tente novamente.');
        return;
      }

      console.log('🟢 Login OAuth: Sessão OK para', session.user.email);

      // Buscar dados do usuário na tabela users
      const { data: userData } = await sb
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Criar registro se for primeiro login com Google
      if (!userData) {
        console.log('🟡 Login OAuth: Primeiro login, criando usuário...');
        const nomeNovo = session.user.user_metadata?.full_name
          || session.user.user_metadata?.name
          || session.user.email.split('@')[0];
        await sb.from('users').insert([{
          id: session.user.id,
          email: session.user.email,
          name: nomeNovo,
          role: 'user',
          is_premium: false,
          avatar: nomeNovo[0].toUpperCase()
        }]);
      }

      const nome = userData?.name
        || session.user.user_metadata?.full_name
        || session.user.user_metadata?.name
        || 'Usuário';

      const user = {
        id: session.user.id,
        email: session.user.email,
        name: nome,
        role: userData?.role || 'user',
        avatar: userData?.avatar || nome[0].toUpperCase(),
        isPremium: userData?.is_premium || false,
        picture: session.user.user_metadata?.avatar_url || null
      };

      console.log('🟢 Login OAuth: Usuário processado:', user.email, '| role:', user.role);

      // Salvar sessão
      sessionStorage.setItem('sf_current_user', JSON.stringify(user));
      sessionStorage.removeItem('from_protected_page');

      // Limpar hash da URL
      history.replaceState(null, '', window.location.pathname);

      showOAuthLoading(false);
      showAlert('loginAlert', 'success', `✓ Bem-vindo, ${nome.split(' ')[0]}! Redirecionando...`);

      await new Promise(r => setTimeout(r, 700));

      const dest = user.role === 'admin' ? 'dashboard.html' : 'profiles.html';
      console.log('🟢 Login OAuth: Redirecionando para', dest);
      window.location.replace(dest);
      return;

    } catch (err) {
      console.error('🔴 Login OAuth: Erro crítico', err);
      showOAuthLoading(false);
      history.replaceState(null, '', window.location.pathname);
      showAlert('loginAlert', 'error', '❌ Erro ao processar login com Google. Tente novamente.');
    }
  }

  // ===== FLUXO NORMAL =====

  if (sessionStorage.getItem('from_protected_page')) {
    console.log('🟡 Login: Limpando sessão (veio de página protegida)');
    sessionStorage.clear();
    localStorage.removeItem('sf_current_user');
  }

  console.log('✅ Login: Formulário pronto');

  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      loginForm.style.display = target === 'login' ? 'block' : 'none';
      registerForm.style.display = target === 'register' ? 'block' : 'none';
      clearAlerts();
    });
  });

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const formGroup = btn.closest('.form-group');
      const input = formGroup.querySelector('input[type="password"], input[type="text"]');
      if (input) {
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.textContent = isText ? 'MOSTRAR' : 'OCULTAR';
      }
    });
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    if (!validateEmail(email)) { showFieldError('loginEmail', 'Digite um e-mail válido.'); return; }
    if (!password) { showFieldError('loginPassword', 'Digite sua senha.'); return; }
    const btn = loginForm.querySelector('.btn-primary');
    setLoading(btn, true);
    console.log('🔵 Login: Tentando fazer login...');
    const result = await Auth.login(email, password, remember);
    setLoading(btn, false);
    if (result.success) {
      showAlert('loginAlert', 'success', '✓ Login realizado! Redirecionando...');
      sessionStorage.removeItem('from_protected_page');
      await new Promise(resolve => setTimeout(resolve, 500));
      const dest = result.user.role === 'admin' ? 'dashboard.html' : 'profiles.html';
      window.location.replace(dest);
    } else {
      showAlert('loginAlert', 'error', result.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const terms = document.getElementById('acceptTerms').checked;
    let valid = true;
    if (!name || name.length < 2) { showFieldError('regName', 'Digite seu nome completo.'); valid = false; }
    if (!validateEmail(email)) { showFieldError('regEmail', 'Digite um e-mail válido.'); valid = false; }
    if (password.length < 6) { showFieldError('regPassword', 'A senha deve ter pelo menos 6 caracteres.'); valid = false; }
    if (password !== confirm) { showFieldError('regConfirm', 'As senhas não coincidem.'); valid = false; }
    if (!terms) { showAlert('registerAlert', 'error', 'Você precisa aceitar os Termos de Uso para continuar.'); return; }
    if (!valid) return;
    const btn = registerForm.querySelector('.btn-primary');
    setLoading(btn, true);
    const result = await Auth.register(name, email, password);
    setLoading(btn, false);
    if (result.success) {
      showAlert('registerAlert', 'success', '✓ Conta criada! Verifique seu e-mail ou faça login.');
      registerForm.reset();
      setTimeout(() => tabs[0].click(), 1500);
    } else {
      showAlert('registerAlert', 'error', result.message);
    }
  });

  if (!CookieManager.hasConsent()) {
    setTimeout(() => document.getElementById('cookieBanner').classList.add('show'), 1200);
  }

  document.getElementById('btnAcceptAll').addEventListener('click', () => { CookieManager.acceptAll(); hideCookieBanner(); });
  document.getElementById('btnCookieSettings').addEventListener('click', () => openModal('cookieModal'));
  document.getElementById('btnSaveCookies').addEventListener('click', () => {
    CookieManager.saveConsent({
      analytics: document.getElementById('cookieAnalytics').checked,
      marketing: document.getElementById('cookieMarketing').checked,
      preferences: document.getElementById('cookiePreferences').checked
    });
    closeModal('cookieModal'); hideCookieBanner();
  });
  document.getElementById('btnAcceptAllModal').addEventListener('click', () => { CookieManager.acceptAll(); closeModal('cookieModal'); hideCookieBanner(); });

  document.querySelectorAll('[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); openModal(link.dataset.modal); });
  });
  document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show')));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
  });

  // ===== HELPERS =====
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = input.parentElement.querySelector('.field-error');
    input.classList.add('error');
    if (error) { error.textContent = message; error.classList.add('show'); }
  }

  function clearAlerts() {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
    document.querySelectorAll('.form-group input').forEach(i => i.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
  }

  function showAlert(id, type, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert alert-${type} show`;
    el.innerHTML = message;
  }

  function setLoading(btn, loading) { btn.disabled = loading; btn.classList.toggle('loading', loading); }
  function hideCookieBanner() { document.getElementById('cookieBanner').classList.remove('show'); }
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
});
