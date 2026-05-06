// ===== DASHBOARD LOGIC =====
document.addEventListener('DOMContentLoaded', () => {

  const user = Auth.requireAdmin('index.html');
  if (!user) return;

  document.getElementById('sidebarUserName').textContent = user.name;
  document.getElementById('sidebarUserRole').textContent = user.role === 'admin' ? 'Administrador' : 'Usuário';
  document.getElementById('sidebarUserAvatar').textContent = user.avatar;

  // ---- NAVIGATION ----
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.section');

  function showSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    const section = document.getElementById('section-' + id);
    const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');
    document.getElementById('pageTitle').textContent = navItem ? navItem.querySelector('.nav-label').textContent : 'Dashboard';
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
  }

  navItems.forEach(item => item.addEventListener('click', () => showSection(item.dataset.section)));
  document.getElementById('btnMenuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('btnLogout').addEventListener('click', () => { if (confirm('Deseja sair do painel?')) Auth.logout(); });

  // ---- CONTENT DATA ----
  let contentData = JSON.parse(localStorage.getItem('sf_content') || 'null') || [
    { id: 1, title: 'Stranger Things', type: 'serie',  genre: 'Ficção Científica', year: 2016, status: 'ativo',   views: 128400, rating: 4.8 },
    { id: 2, title: 'Oppenheimer',     type: 'filme',  genre: 'Drama',            year: 2023, status: 'ativo',   views: 89200,  rating: 4.7 },
    { id: 3, title: 'The Last of Us',  type: 'serie',  genre: 'Ação',             year: 2023, status: 'ativo',   views: 210000, rating: 4.9 },
    { id: 4, title: 'Barbie',          type: 'filme',  genre: 'Comédia',          year: 2023, status: 'ativo',   views: 67800,  rating: 4.2 },
    { id: 5, title: 'CNN Brasil',      type: 'canal',  genre: 'Notícias',         year: 2020, status: 'ao vivo', views: 45000,  rating: 4.0 },
    { id: 6, title: 'Breaking Bad',    type: 'serie',  genre: 'Drama',            year: 2008, status: 'ativo',   views: 156000, rating: 5.0 },
    { id: 7, title: 'Duna: Parte 2',   type: 'filme',  genre: 'Ficção Científica', year: 2024, status: 'ativo',  views: 93400,  rating: 4.6 },
    { id: 8, title: 'ESPN',            type: 'canal',  genre: 'Esportes',         year: 2010, status: 'ao vivo', views: 78000,  rating: 4.3 },
  ];

  function saveContent() { localStorage.setItem('sf_content', JSON.stringify(contentData)); }

  function getUsersData() {
    return Auth.getUsers().map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: 'ativo', joined: '2024-01-15' }));
  }

  // ---- RENDER CONTENT TABLE ----
  function renderContentTable(filter = 'all', search = '') {
    const tbody = document.getElementById('contentTableBody');
    let data = contentData;
    if (filter !== 'all') data = data.filter(c => c.type === filter);
    if (search) data = data.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    tbody.innerHTML = data.map(item => `
      <tr>
        <td><div class="td-title"><div class="td-thumb">${item.type === 'filme' ? '🎬' : item.type === 'serie' ? '📺' : '📡'}</div><div><div class="td-name">${item.title}</div><div class="td-sub">${item.year}</div></div></div></td>
        <td><span class="badge ${item.type === 'filme' ? 'badge-blue' : item.type === 'serie' ? 'badge-purple' : 'badge-orange'}">${item.type}</span></td>
        <td>${item.genre}</td>
        <td><span class="badge ${item.status === 'ativo' ? 'badge-green' : item.status === 'ao vivo' ? 'badge-red' : 'badge-gray'}">${item.status}</span></td>
        <td>${formatNumber(item.views)}</td>
        <td>⭐ ${item.rating}</td>
        <td><div style="display:flex;gap:6px;"><button class="btn-sm ghost" onclick="editContent(${item.id})">✏️</button><button class="btn-sm ghost" style="color:#ff6b6b;" onclick="deleteContent(${item.id})">🗑️</button></div></td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Nenhum conteúdo encontrado</td></tr>';
  }

  // ---- RENDER USERS TABLE ----
  function renderUsersTable(search = '') {
    const tbody = document.getElementById('usersTableBody');
    let data = getUsersData();
    if (search) data = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    tbody.innerHTML = data.map(u => {
      const vip = Auth.isPremium(u.id);
      const isAdmin = u.role === 'admin';
      return `<tr>
        <td><div class="td-title"><div class="user-avatar" style="width:32px;height:32px;font-size:0.8rem;">${u.name.charAt(0)}</div><div><div class="td-name">${u.name}</div><div class="td-sub">${u.email}</div></div></div></td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="badge ${isAdmin ? 'badge-red' : 'badge-blue'}">${u.role}</span>
            <button class="btn-sm ghost" style="font-size:0.7rem;padding:3px 8px;" onclick="toggleAdmin(${u.id})" title="${isAdmin ? 'Remover admin' : 'Tornar admin'}">
              ${isAdmin ? '↓ User' : '↑ Admin'}
            </button>
          </div>
        </td>
        <td><div style="display:flex;align-items:center;gap:8px;">
          <span class="badge ${vip ? 'badge-vip' : 'badge-gray'}">${vip ? '👑 VIP' : 'Free'}</span>
          <button class="btn-vip-toggle ${vip ? 'active' : ''}" onclick="toggleVip(${u.id})">${vip ? 'Remover VIP' : 'Ativar VIP'}</button>
        </div></td>
        <td><span class="badge badge-green">${u.status}</span></td>
        <td>${u.joined}</td>
        <td><div style="display:flex;gap:6px;"><button class="btn-sm ghost" onclick="showToast('Funcionalidade em breve!','info')">✏️</button><button class="btn-sm ghost" style="color:#ff6b6b;" onclick="deleteUser(${u.id})">🗑️</button></div></td>
      </tr>`;
    }).join('');
  }

  window.toggleAdmin = (userId) => {
    const users = Auth.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    // Não pode remover o próprio admin logado
    const currentUser = Auth.getCurrentUser();
    if (currentUser && currentUser.id === userId && users[idx].role === 'admin') {
      showToast('Você não pode remover seu próprio acesso admin.', 'error');
      return;
    }
    users[idx].role = users[idx].role === 'admin' ? 'user' : 'admin';
    Auth.saveUsers(users);
    renderUsersTable(document.getElementById('usersSearch').value);
    showToast(users[idx].role === 'admin' ? '✓ Usuário promovido a Admin!' : 'Usuário rebaixado para User.', 'success');
  };

  window.deleteUser = (userId) => {
    const currentUser = Auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      showToast('Você não pode excluir sua própria conta.', 'error');
      return;
    }
    if (!confirm('Excluir este usuário permanentemente?')) return;
    const users = Auth.getUsers().filter(u => u.id !== userId);
    Auth.saveUsers(users);
    renderUsersTable(document.getElementById('usersSearch').value);
    updateStats();
    showToast('Usuário removido.', 'success');
  };

  window.toggleVip = (userId) => {
    const current = Auth.isPremium(userId);
    Auth.setPremium(userId, !current);
    renderUsersTable(document.getElementById('usersSearch').value);
    showToast(current ? 'VIP removido do usuário.' : '👑 VIP ativado para o usuário!', current ? 'info' : 'success');
  };

  // ---- PREMIUM CONTENT ----
  function renderPremiumContent() {
    const data = Auth.getPremiumContent();
    const keys = Object.keys(data);
    const tbody = document.getElementById('premiumContentBody');
    const countEl = document.getElementById('premiumCount');
    if (countEl) countEl.textContent = `${keys.length} ${keys.length === 1 ? 'item' : 'itens'}`;
    if (!keys.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Nenhum conteúdo premium cadastrado</td></tr>';
      return;
    }
    tbody.innerHTML = keys.map(key => {
      const item = data[key];
      const [tmdbId, type] = key.split('_');
      const releaseDate = new Date(item.releaseDate);
      const isLocked = new Date() < releaseDate;
      const dateStr = releaseDate.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
      return `<tr>
        <td><strong>${tmdbId}</strong></td>
        <td>${item.title || '—'}</td>
        <td><span class="badge ${type === 'movie' ? 'badge-blue' : 'badge-purple'}">${type === 'movie' ? 'Filme' : 'Série'}</span></td>
        <td>${dateStr}</td>
        <td><span class="badge ${isLocked ? 'badge-vip' : 'badge-green'}">${isLocked ? '🔒 Bloqueado' : '✓ Liberado'}</span></td>
        <td><button class="btn-sm ghost" style="color:#ff6b6b;" onclick="removePremiumItem('${tmdbId}','${type}')">🗑️ Remover</button></td>
      </tr>`;
    }).join('');
  }

  window.removePremiumItem = (tmdbId, type) => {
    if (!confirm('Remover este conteúdo premium?')) return;
    Auth.removePremiumContent(tmdbId, type);
    renderPremiumContent();
    showToast('Conteúdo premium removido!', 'success');
  };

  window.renderPremiumContent = renderPremiumContent;

  const premiumForm = document.getElementById('premiumContentForm');
  if (premiumForm) {
    premiumForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tmdbId = parseInt(document.getElementById('pcTmdbId').value);
      const type = document.getElementById('pcType').value;
      const title = document.getElementById('pcTitle').value;
      const releaseDate = document.getElementById('pcReleaseDate').value;
      if (!tmdbId || !releaseDate) { showToast('Preencha todos os campos obrigatórios.', 'error'); return; }
      Auth.setPremiumContent(tmdbId, type, releaseDate, title);
      renderPremiumContent();
      premiumForm.reset();
      showToast('✓ Conteúdo marcado como premium!', 'success');
    });
  }

  // ---- FILTERS ----
  document.getElementById('contentFilter').addEventListener('change', (e) => renderContentTable(e.target.value, document.getElementById('contentSearch').value));
  document.getElementById('contentSearch').addEventListener('input', (e) => renderContentTable(document.getElementById('contentFilter').value, e.target.value));
  document.getElementById('usersSearch').addEventListener('input', (e) => renderUsersTable(e.target.value));

  // ---- ADD/EDIT CONTENT ----
  let editingId = null;

  document.getElementById('btnAddContent').addEventListener('click', () => {
    editingId = null;
    document.getElementById('contentModalTitle').textContent = '➕ Adicionar Conteúdo';
    document.getElementById('contentForm').reset();
    openModal('contentModal');
  });

  document.getElementById('contentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      id: editingId || Date.now(),
      title: document.getElementById('fTitle').value,
      type: document.getElementById('fType').value,
      genre: document.getElementById('fGenre').value,
      year: parseInt(document.getElementById('fYear').value),
      status: document.getElementById('fStatus').value,
      views: parseInt(document.getElementById('fViews').value) || 0,
      rating: parseFloat(document.getElementById('fRating').value) || 0,
    };
    if (editingId) {
      const idx = contentData.findIndex(c => c.id === editingId);
      if (idx !== -1) contentData[idx] = item;
      showToast('Conteúdo atualizado!', 'success');
    } else {
      contentData.unshift(item);
      showToast('Conteúdo adicionado!', 'success');
    }
    saveContent(); renderContentTable(); updateStats(); closeModal('contentModal');
  });

  window.editContent = (id) => {
    const item = contentData.find(c => c.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('contentModalTitle').textContent = '✏️ Editar Conteúdo';
    document.getElementById('fTitle').value  = item.title;
    document.getElementById('fType').value   = item.type;
    document.getElementById('fGenre').value  = item.genre;
    document.getElementById('fYear').value   = item.year;
    document.getElementById('fStatus').value = item.status;
    document.getElementById('fViews').value  = item.views;
    document.getElementById('fRating').value = item.rating;
    openModal('contentModal');
  };

  window.deleteContent = (id) => {
    if (!confirm('Remover este conteúdo?')) return;
    contentData = contentData.filter(c => c.id !== id);
    saveContent(); renderContentTable(); updateStats();
    showToast('Conteúdo removido!', 'success');
  };

  // ---- STATS ----
  function updateStats() {
    document.getElementById('statMovies').textContent   = formatNumber(contentData.filter(c => c.type === 'filme').length);
    document.getElementById('statSeries').textContent   = formatNumber(contentData.filter(c => c.type === 'serie').length);
    document.getElementById('statChannels').textContent = formatNumber(contentData.filter(c => c.type === 'canal').length);
    document.getElementById('statUsers').textContent    = formatNumber(Auth.getUsers().length);
    document.getElementById('statViews').textContent    = formatNumber(contentData.reduce((a, c) => a + c.views, 0));
  }

  // ---- MODALS ----
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
  window.openModal  = openModal;
  window.closeModal = closeModal;

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show')));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
  });

  // ---- TOAST ----
  window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(20px)'; toast.style.transition='all 0.3s'; setTimeout(()=>toast.remove(),300); }, 3000);
  };

  function formatNumber(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
    if (n >= 1000) return (n/1000).toFixed(1)+'K';
    return n.toString();
  }

  // ---- INIT ----
  renderContentTable();
  renderUsersTable();
  renderPremiumContent();
  updateStats();
  showSection('overview');
});
