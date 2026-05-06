# 🎬 CineFlix Hub

Plataforma de streaming de filmes, séries e canais ao vivo com sistema de pagamento integrado via Mercado Pago.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação completo (login/registro)
- ✅ Catálogo de filmes e séries integrado com TMDB
- ✅ Canais ao vivo
- ✅ Sistema de perfis de usuário
- ✅ Painel administrativo completo
- ✅ Sistema de pagamento PIX via Mercado Pago
- ✅ Conteúdo premium exclusivo para assinantes VIP
- ✅ Player de vídeo integrado
- ✅ Design responsivo e moderno

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python 3 (servidor HTTP nativo)
- **API**: TMDB (The Movie Database)
- **Pagamentos**: Mercado Pago API
- **Deploy**: Render

## 📦 Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cineflix-hub.git
cd cineflix-hub
```

2. Execute o servidor:
```bash
python streamflix/proxy.py
```

3. Acesse no navegador:
```
http://localhost:3000
```

## 🌐 Deploy na Render

### Opção 1: Deploy Automático

1. Faça fork deste repositório
2. Acesse [Render Dashboard](https://dashboard.render.com/)
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: cineflix-hub
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python streamflix/proxy.py`
6. Clique em "Create Web Service"

### Opção 2: Deploy via render.yaml

O projeto já inclui o arquivo `render.yaml` configurado. Basta conectar o repositório e a Render detectará automaticamente as configurações.

## 🔑 Configuração

### API TMDB

1. Crie uma conta em [TMDB](https://www.themoviedb.org/)
2. Obtenha sua API Key em Settings → API
3. Substitua a chave no arquivo `streamflix/js/tmdb.js`

### Mercado Pago

1. Crie uma conta em [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obtenha seu Access Token de produção
3. Substitua o token no arquivo `streamflix/proxy.py` (variável `MP_TOKEN`)

## 👤 Credenciais de Teste

**Admin:**
- Email: admin@cineflix.com
- Senha: admin123

**Usuário:**
- Email: user@cineflix.com
- Senha: user123

## 📱 Estrutura do Projeto

```
cineflix-hub/
├── streamflix/
│   ├── css/              # Estilos
│   ├── js/               # Scripts
│   ├── index.html        # Página de login
│   ├── home.html         # Página principal
│   ├── dashboard.html    # Painel admin
│   ├── player.html       # Player de vídeo
│   ├── premium.html      # Página de assinatura
│   ├── profiles.html     # Gerenciamento de perfis
│   ├── settings.html     # Configurações
│   └── proxy.py          # Servidor backend
├── requirements.txt      # Dependências Python
├── runtime.txt          # Versão do Python
├── render.yaml          # Configuração Render
└── README.md            # Este arquivo
```

## 🎯 Funcionalidades do Admin

- Gerenciamento de conteúdo (filmes, séries, canais)
- Gerenciamento de usuários
- Configuração de conteúdo premium
- Estatísticas e métricas
- Configurações do sistema

## 💳 Sistema de Pagamento

O sistema utiliza PIX via Mercado Pago:
- Plano Mensal: R$ 19,90
- Plano Anual: R$ 99,90

## 📄 Licença

Este projeto é apenas para fins educacionais e demonstração.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do email: suporte@cineflixhub.com

---

Desenvolvido com ❤️ para demonstração de conceitos de desenvolvimento web full-stack
