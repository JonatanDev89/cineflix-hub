// ===== AUTH SYSTEM =====
const Auth = (() => {

  // Sem contas pré-definidas — apenas o que estiver no localStorage
  function getUsers() {
    const stored = localStorage.getItem('sf_users');
    return stored ? JSON.parse(stored) : [];
  }

  function saveUsers(users) {
    localStorage.setItem('sf_users', JSON.stringify(users));
  }

  function getCurrentUser() {
    const data = sessionStorage.getItem('sf_current_user') || localStorage.getItem('sf_current_user');
    if (!data) return null;
    try { return JSON.parse(data); } catch(e) { return null; }
  }

  function login(email, password, remember = false) {
    if (!email || !password) return { success: false, message: 'Preencha todos os campos.' };
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, message: 'E-mail ou senha incorretos.' };
    const session = { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('sf_current_user', JSON.stringify(session));
    const profiles = getProfiles(user.id);
    if (!profiles.length) {
      saveProfiles(user.id, [{ id: Date.now(), name: user.name, avatar: 0, pin: null, isKids: false }]);
    }
    return { success: true, user: session };
  }

  function register(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser = {
      id: Date.now(),
      email,
      password,
      name,
      role: 'user',       // todos começam como user
      avatar: name.charAt(0).toUpperCase(),
      isPremium: false,
    };
    users.push(newUser);
    saveUsers(users);
    saveProfiles(newUser.id, [{ id: Date.now() + 1, name, avatar: 0, pin: null, isKids: false }]);
    return { success: true, message: 'Conta criada com sucesso!' };
  }

  function logout() {
    clearProfile();
    sessionStorage.removeItem('sf_current_user');
    localStorage.removeItem('sf_current_user');
    window.location.href = 'index.html';
  }

  function requireAuth(redirectTo = 'index.html') {
    const user = getCurrentUser();
    if (!user || !user.id || !user.email || !user.role) {
      // Limpa qualquer dado corrompido
      sessionStorage.removeItem('sf_current_user');
      localStorage.removeItem('sf_current_user');
      window.location.replace(redirectTo);
      return null;
    }
    // Verifica se o usuário ainda existe no storage
    const users = getUsers();
    const exists = users.find(u => u.id === user.id && u.email === user.email);
    if (!exists) {
      sessionStorage.removeItem('sf_current_user');
      localStorage.removeItem('sf_current_user');
      window.location.replace(redirectTo);
      return null;
    }
    return user;
  }

  function requireAdmin(redirectTo = 'index.html') {
    const user = requireAuth(redirectTo);
    if (!user) return null;
    if (user.role !== 'admin') {
      // Não é admin — redireciona para home, não para login
      window.location.replace('home.html');
      return null;
    }
    // Double-check: verifica no storage se realmente é admin
    const users = getUsers();
    const dbUser = users.find(u => u.id === user.id);
    if (!dbUser || dbUser.role !== 'admin') {
      sessionStorage.removeItem('sf_current_user');
      localStorage.removeItem('sf_current_user');
      window.location.replace('index.html');
      return null;
    }
    return user;
  }

  // ===== PROFILE SYSTEM =====
  function getProfiles(userId) {
    const stored = localStorage.getItem(`cf_profiles_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  function saveProfiles(userId, profiles) {
    localStorage.setItem(`cf_profiles_${userId}`, JSON.stringify(profiles));
  }

  function getCurrentProfile() {
    const data = sessionStorage.getItem('cf_profile');
    return data ? JSON.parse(data) : null;
  }

  function setCurrentProfile(profile) {
    sessionStorage.setItem('cf_profile', JSON.stringify(profile));
  }

  function clearProfile() {
    sessionStorage.removeItem('cf_profile');
  }

  // ===== PREMIUM SYSTEM =====
  function isPremium(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return user ? !!user.isPremium : false;
  }

  function setPremium(userId, value) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx].isPremium = !!value;
    users[idx].premiumSince = value ? Date.now() : null;
    saveUsers(users);
    return true;
  }

  function getPremiumContent() {
    const stored = localStorage.getItem('cf_premium_content');
    return stored ? JSON.parse(stored) : {};
  }

  function savePremiumContent(data) {
    localStorage.setItem('cf_premium_content', JSON.stringify(data));
  }

  function getPremiumReleaseDate(tmdbId, type) {
    const data = getPremiumContent();
    const key = `${tmdbId}_${type}`;
    return data[key] ? data[key].releaseDate : null;
  }

  function setPremiumContent(tmdbId, type, releaseDate, title) {
    const data = getPremiumContent();
    const key = `${tmdbId}_${type}`;
    data[key] = { releaseDate, title: title || '', addedAt: Date.now() };
    savePremiumContent(data);
  }

  function removePremiumContent(tmdbId, type) {
    const data = getPremiumContent();
    delete data[`${tmdbId}_${type}`];
    savePremiumContent(data);
  }

  function isContentPremiumLocked(tmdbId, type, userId, releaseDate) {
    // Se o usuário é VIP, nunca bloqueia
    if (userId && isPremium(userId)) return false;

    // 1. Verifica bloqueio manual (cadastrado no dashboard)
    const manualRelease = getPremiumReleaseDate(tmdbId, type);
    if (manualRelease && new Date() < new Date(manualRelease)) {
      return { locked: true, releaseDate: manualRelease };
    }

    // 2. Bloqueio automático: conteúdo lançado há menos de 3 dias
    if (releaseDate) {
      const launch = new Date(releaseDate);
      const now    = new Date();
      const diffMs = now - launch;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      // Se lançou há menos de 3 dias E já foi lançado (não é futuro)
      if (diffMs > 0 && diffDays < 3) {
        // Data de liberação = data de lançamento + 3 dias
        const freeDate = new Date(launch.getTime() + 3 * 24 * 60 * 60 * 1000);
        return { locked: true, releaseDate: freeDate.toISOString() };
      }
    }

    return false;
  }

  // ===== PROGRESS / CONTINUE WATCHING =====
  function saveProgress(profileId, item) {
    const key = `cf_progress_${profileId}`;
    let list = getProgress(profileId);
    list = list.filter(i => !(i.id === item.id && i.type === item.type));
    list.unshift({ ...item, timestamp: Date.now() });
    if (list.length > 20) list = list.slice(0, 20);
    localStorage.setItem(key, JSON.stringify(list));
  }

  function getProgress(profileId) {
    const stored = localStorage.getItem(`cf_progress_${profileId}`);
    return stored ? JSON.parse(stored) : [];
  }

  function removeProgress(profileId, id, type) {
    const key = `cf_progress_${profileId}`;
    let list = getProgress(profileId);
    list = list.filter(i => !(i.id === id && i.type === type));
    localStorage.setItem(key, JSON.stringify(list));
  }

  // Sem init automático — usuários criados apenas via registro

  return {
    login, register, logout,
    getCurrentUser, requireAuth, requireAdmin,
    getUsers, saveUsers,
    getProfiles, saveProfiles,
    getCurrentProfile, setCurrentProfile, clearProfile,
    isPremium, setPremium,
    getPremiumContent, savePremiumContent,
    getPremiumReleaseDate, setPremiumContent, removePremiumContent,
    isContentPremiumLocked,
    saveProgress, getProgress, removeProgress,
  };
})();

// ===== COOKIE MANAGER =====
const CookieManager = (() => {
  const KEY = 'sf_cookie_consent';
  function getConsent() { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : null; }
  function saveConsent(p) {
    const c = { timestamp: new Date().toISOString(), necessary: true, analytics: p.analytics||false, marketing: p.marketing||false, preferences: p.preferences||false };
    localStorage.setItem(KEY, JSON.stringify(c)); return c;
  }
  function hasConsent() { return !!getConsent(); }
  function acceptAll() { return saveConsent({ analytics: true, marketing: true, preferences: true }); }
  return { getConsent, saveConsent, hasConsent, acceptAll };
})();
