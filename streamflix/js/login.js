// ===== LOGIN PAGE LOGIC =====

// ===== GOOGLE LOGIN via Google Identity Services (GSI) =====
// Chamada automaticamente pelo SDK do Google após o usuário escolher a conta
function handleGoogleLogin(response) {
  try {
    // Decodifica o JWT retornado pelo Google
    const base64 = response.credential.split('.')[1];
    const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));

    const googleId = payload.sub;
    const email    = payload.email;
    const name     = payload.name || email.split('@')[0];
    const picture  = payload.picture || null;

    console.log('🟢 Google GSI: Login recebido para', email);

    // Busca usuário existente no localStorage
    let users = [];
    try { users = JSON.parse(localStorage.getItem('sf_users') || '[]'); } catch(e) {}

    let user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() || u.googleId === googleId
    );

    if (!user) {
      // Cria conta automaticamente
      user = {
        id:        Date.now(),
        email,
        name,
        password:  null,
        role:      'user',
        avatar:    name.charAt(0).toUpperCase(),
        isPremium: false,
        googleId,
        picture,
      };
      users.push(user);
      localStorage.setItem('sf_users', JSON.stringify(users));

      // Cria perfil padrão
      const profileKey = `cf_profiles_${user.id}`;
      if (!localStorage.getItem(profileKey)) {
        localStorage.setItem(profileKey, JSON.stringify([{
          id: Date.now() + 1, name, avatar: 0, pin: null, isKids: false
        }]));
      }
      console.log('🟡 Google GSI: Novo usuário criado:', email);
    } else {
      // Atualiza dados do Google
      user.googleId = googleId;
      if (picture) user.picture = picture;
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) users[idx] = user;
      localStorage.setItem('sf_users', JSON.stringify(users));
      console.log('🟢 Google GSI: Usuário existente:', email);
    }

    // Salva sessão
    const session = {
      id:      user.id,
      email:   user.email,
      name:    user.name,
      role:    user.role,
      avatar:  user.avatar,
      picture: user.picture || null
    };
    sessionStorage.setItem('sf_current_user', JSON.stringify(session));
    sessionStorage.removeItem('from_protected_page');

    console.log('🟢 Google GSI: Sessão salva, redirecionando...');
    window.location.replace(user.role === 'admin' ? 'dashboard.html' : 'profiles.html');

  } catch(e) {
    console.error('🔴 Google GSI: Erro no login:', e);
    const alertEl = document.getElementById('loginAlert');
    if (alertEl) {
      alertEl.className = 'alert alert-error show';
      alertEl.textContent = '❌ Erro ao fazer login com Google. Tente novamente.';
    }
  }
}

// ===== MAIN =====
document.addEventListener('DOMContentLoaded', async () => {

  console.log('🔵 Login: Página carregada');

  // Remove flag sem limpar sessão
  if (sessionStorage.getItem('from_protected_page')) {
    sessionStorage.removeItem('from_protected_page');
  }

  // Se já tem usuário logado, redireciona direto
  const cachedUser = sessionStorage.getItem('sf_current_user') || localStorage.getItem('sf_current_user');
  if (cachedUser) {
    try {
      const u = JSON.parse(cachedUser);
      if (u && u.id) {
        console.log('🟢 Login: Usuário já logado, redirecionando...');
        window.location.replace(u.role === 'admin' ? 'dashboard.html' : 'profiles.html');
        return;
      }
    } catch(e) {}
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
      window.location.replace(result.user.role === 'admin' ? 'dashboard.html' : 'profiles.html');
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
      showAlert('registerAlert', 'success', '✓ Conta criada! Faça login para continuar.');
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
