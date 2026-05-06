// ===== LOGIN PAGE LOGIC =====
document.addEventListener('DOMContentLoaded', async () => {

  console.log('🔵 Login: Verificando se já está logado...');
  
  // Flag para evitar múltiplos redirecionamentos
  if (window.isRedirecting) {
    console.log('🟡 Login: Já está redirecionando, aguardando...');
    return;
  }
  
  // Verificar se já está logado (async agora)
  try {
    const currentUser = await Auth.getCurrentUser();
    console.log('🔵 Login: Usuário atual:', currentUser);
    
    if (currentUser && currentUser.id && currentUser.role) {
      console.log('🟢 Login: Usuário logado, redirecionando para:', currentUser.role === 'admin' ? 'dashboard.html' : 'profiles.html');
      
      // Limpar timestamps de loop detection antes de redirecionar
      sessionStorage.removeItem('dashboard_last_check');
      sessionStorage.removeItem('profiles_last_check');
      console.log('🟢 Login: Timestamps de loop detection limpos');
      
      // Marcar que está redirecionando
      window.isRedirecting = true;
      
      // Aguardar 500ms antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.location.href = currentUser.role === 'admin' ? 'dashboard.html' : 'profiles.html';
      return;
    } else {
      console.log('🟡 Login: Nenhum usuário logado');
    }
  } catch (error) {
    console.log('🟡 Login: Erro ao verificar usuário (normal se não estiver logado):', error.message);
  }

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
      const input = btn.previousElementSibling;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.textContent = isText ? 'MOSTRAR' : 'OCULTAR';
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
    
    // Login agora é async
    const result = await Auth.login(email, password, remember);
    
    setLoading(btn, false);
    if (result.success) {
      showAlert('loginAlert', 'success', '✓ Login realizado! Redirecionando...');
      
      // Limpar timestamps de loop detection antes de redirecionar
      sessionStorage.removeItem('dashboard_last_check');
      sessionStorage.removeItem('profiles_last_check');
      console.log('🟢 Login: Timestamps de loop detection limpos');
      
      // Aguardar 1 segundo antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dest = result.user.role === 'admin' ? 'dashboard.html' : 'profiles.html';
      console.log('🟢 Login: Redirecionando para:', dest);
      window.location.href = dest;
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
    
    // Register agora é async
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
    CookieManager.saveConsent({ analytics: document.getElementById('cookieAnalytics').checked, marketing: document.getElementById('cookieMarketing').checked, preferences: document.getElementById('cookiePreferences').checked });
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
  function showAlert(id, type, message) { const el = document.getElementById(id); el.className = `alert alert-${type} show`; el.innerHTML = message; }
  function setLoading(btn, loading) { btn.disabled = loading; btn.classList.toggle('loading', loading); }
  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function hideCookieBanner() { document.getElementById('cookieBanner').classList.remove('show'); }
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
});
