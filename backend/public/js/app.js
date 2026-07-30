// ===== STATE =====
let token = null;
let configs = [];
let users = [];
let logs = [];
let currentSection = 'dashboard';

// ===== DOM REFS =====
const loginScreen = document.getElementById('loginScreen');
const panelScreen = document.getElementById('panelScreen');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');

const sectionLinks = document.querySelectorAll('.sidebar-nav a');
const sectionTitle = document.getElementById('sectionTitle');

const totalConfigsEl = document.getElementById('totalConfigs');
const totalUsersEl = document.getElementById('totalUsers');
const totalTrafficEl = document.getElementById('totalTraffic');
const totalLogsEl = document.getElementById('totalLogs');

const configsList = document.getElementById('configsList');
const usersList = document.getElementById('usersList');
const logsList = document.getElementById('logsList');

const configModal = document.getElementById('configModal');
const userModal = document.getElementById('userModal');
const configForm = document.getElementById('configForm');
const userForm = document.getElementById('userForm');

// ===== API HELPERS =====
const api = {
    request: async (method, endpoint, body = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`/api${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }
        return response.json();
    },
    login: (password) => api.request('POST', '/auth/login', { password }),
    getConfigs: () => api.request('GET', '/configs'),
    createConfig: (data) => api.request('POST', '/configs', data),
    updateConfig: (id, data) => api.request('PUT', `/configs/${id}`, data),
    deleteConfig: (id) => api.request('DELETE', `/configs/${id}`),
    getUsers: () => api.request('GET', '/users'),
    createUser: (data) => api.request('POST', '/users', data),
    updateUser: (id, data) => api.request('PUT', `/users/${id}`, data),
    deleteUser: (id) => api.request('DELETE', `/users/${id}`),
    getLogs: () => api.request('GET', '/logs'),
    clearLogs: (days) => api.request('DELETE', `/logs/cleanup?days=${days || 30}`)
};

// ===== AUTH =====
async function login(password) {
    try {
        const result = await api.login(password);
        token = result.token;
        localStorage.setItem('token', token);
        showPanel();
        loadAllData();
    } catch (error) {
        loginError.textContent = '❌ رمز عبور اشتباه است!';
        loginError.style.color = '#ff6b6b';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function logout() {
    token = null;
    localStorage.removeItem('token');
    showLogin();
}

function showLogin() {
    loginScreen.style.display = 'flex';
    panelScreen.style.display = 'none';
}

function showPanel() {
    loginScreen.style.display = 'none';
    panelScreen.style.display = 'flex';
}

// ===== CHECK AUTH ON LOAD =====
const savedToken = localStorage.getItem('token');
if (savedToken) {
    token = savedToken;
    showPanel();
    loadAllData();
}

// ===== LOGIN HANDLER =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    login(passwordInput.value);
});

logoutBtn.addEventListener('click', logout);

// ===== SECTION NAVIGATION =====
sectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    currentSection = section;
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    sectionLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
    const titles = {
        dashboard: 'داشبورد',
        configs: 'کانفیگ‌ها',
        users: 'کاربران',
        logs: 'لاگ‌ها',
        settings: 'تنظیمات'
    };
    sectionTitle.textContent = titles[section] || 'داشبورد';
    
    if (section === 'dashboard') loadDashboard();
    if (section === 'configs') loadConfigs();
    if (section === 'users') loadUsers();
    if (section === 'logs') loadLogs();
}

// ===== LOAD ALL DATA =====
async function loadAllData() {
    await Promise.all([
        loadDashboard(),
        loadConfigs(),
        loadUsers(),
        loadLogs()
    ]);
}

refreshBtn.addEventListener('click', loadAllData);

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const [configsRes, usersRes, logsRes] = await Promise.all([
            api.getConfigs(),
            api.getUsers(),
            api.getLogs()
        ]);
        const totalTraffic = configsRes.reduce((sum, c) => sum + (c.totalTraffic || 0), 0);
        totalConfigsEl.textContent = configsRes.length;
        totalUsersEl.textContent = usersRes.length;
        totalTrafficEl.textContent = totalTraffic.toFixed(1);
        totalLogsEl.textContent = logsRes.length;
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// ===== CONFIGS =====
async function loadConfigs() {
    try {
        const data = await api.getConfigs();
        configs = data;
        renderConfigs(data);
    } catch (error) {
        console.error('Configs error:', error);
    }
}

function renderConfigs(data) {
    if (!data || data.length === 0) {
        configsList.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:40px;">📭 هیچ کانفیگی وجود ندارد</p>`;
        return;
    }
    configsList.innerHTML = data.map(c => `
        <div class="config-card">
            <div class="card-header">
                <span class="card-name">${c.name}</span>
                <span class="card-type">${c.type}</span>
            </div>
            <div class="card-details">
                🌐 ${c.server}:${c.port}<br>
                🆔 ${c.uuid?.substring(0, 12)}...<br>
                📊 ${c.totalTraffic || 0} GB
                ${c.isActive ? '🟢' : '🔴'}
            </div>
            <div class="card-actions">
                <button class="btn-gold btn-sm" onclick="copyConfig('${c.link}')">📋 کپی</button>
                <button class="btn-gold btn-sm" onclick="editConfig('${c.id}')">✏️</button>
                <button class="btn-secondary btn-sm" onclick="deleteConfig('${c.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function copyConfig(link) {
    navigator.clipboard.writeText(link).then(() => {
        showToast('✅ کانفیگ کپی شد!');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ کانفیگ کپی شد!');
    });
}

// ===== USERS =====
async function loadUsers() {
    try {
        const data = await api.getUsers();
        users = data;
        renderUsers(data);
        populateUserSelect(data);
    } catch (error) {
        console.error('Users error:', error);
    }
}

function renderUsers(data) {
    if (!data || data.length === 0) {
        usersList.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:40px;">📭 هیچ کاربری وجود ندارد</p>`;
        return;
    }
    usersList.innerHTML = data.map(u => `
        <div class="user-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${u.username}</strong>
                <span style="font-size:0.8rem;color:var(--text-secondary);">${u.role || 'user'}</span>
            </div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">
                📧 ${u.email || '—'}
                📦 ${u.Configs?.length || 0} کانفیگ
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="btn-gold btn-sm" onclick="editUser('${u.id}')">✏️</button>
                <button class="btn-secondary btn-sm" onclick="deleteUser('${u.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function populateUserSelect(data) {
    const select = document.getElementById('configUser');
    select.innerHTML = data.map(u => 
        `<option value="${u.id}">${u.username}</option>`
    ).join('');
}

// ===== LOGS =====
async function loadLogs() {
    try {
        const data = await api.getLogs();
        logs = data;
        renderLogs(data);
    } catch (error) {
        console.error('Logs error:', error);
    }
}

function renderLogs(data) {
    if (!data || data.length === 0) {
        logsList.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:40px;">📭 هیچ لاگی وجود ندارد</p>`;
        return;
    }
    logsList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>زمان</th>
                    <th>کاربر</th>
                    <th>عملیات</th>
                    <th>وضعیت</th>
                </tr>
            </thead>
            <tbody>
                ${data.slice(0, 50).map(l => `
                    <tr>
                        <td>${new Date(l.createdAt).toLocaleString('fa-IR')}</td>
                        <td>${l.User?.username || '—'}</td>
                        <td>${l.action}</td>
                        <td>${l.status || '—'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ===== CONFIG MODAL =====
document.getElementById('addConfigBtn').addEventListener('click', () => {
    configModal.style.display = 'flex';
    document.getElementById('configForm').reset();
    document.querySelector('#configModal h3').textContent = 'کانفیگ جدید';
});

document.getElementById('quickAddConfig').addEventListener('click', () => {
    document.getElementById('addConfigBtn').click();
});

document.querySelectorAll('.modal-close, .modal-close-btn').forEach(el => {
    el.addEventListener('click', () => {
        configModal.style.display = 'none';
        userModal.style.display = 'none';
    });
});

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const data = {
            name: document.getElementById('configName').value,
            type: document.getElementById('configType').value,
            server: document.getElementById('configServer').value,
            port: parseInt(document.getElementById('configPort').value),
            userId: document.getElementById('configUser').value
        };
        await api.createConfig(data);
        configModal.style.display = 'none';
        showToast('✅ کانفیگ ایجاد شد!');
        loadConfigs();
        loadDashboard();
    } catch (error) {
        showToast('❌ خطا: ' + error.message, 'error');
    }
});

// ===== USER MODAL =====
document.getElementById('addUserBtn').addEventListener('click', () => {
    userModal.style.display = 'flex';
    document.getElementById('userForm').reset();
});

document.getElementById('quickAddUser').addEventListener('click', () => {
    document.getElementById('addUserBtn').click();
});

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const data = {
            username: document.getElementById('userUsername').value,
            password: document.getElementById('userPassword').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value
        };
        await api.createUser(data);
        userModal.style.display = 'none';
        showToast('✅ کاربر ایجاد شد!');
        loadUsers();
        loadDashboard();
    } catch (error) {
        showToast('❌ خطا: ' + error.message, 'error');
    }
});

// ===== SETTINGS =====
document.getElementById('regenerateApiKey').addEventListener('click', async () => {
    // Placeholder for API key regeneration
    showToast('🔄 API Key بازنشانی شد (شبیه‌سازی)');
});

document.getElementById('connectTelegram').addEventListener('click', () => {
    showToast('🤖 ربات تلگرام متصل شد (شبیه‌سازی)');
});

document.getElementById('updatePassword').addEventListener('click', async () => {
    const newPass = document.getElementById('changePassword').value;
    if (!newPass || newPass.length < 4) {
        showToast('❌ رمز باید حداقل ۴ کاراکتر باشد', 'error');
        return;
    }
    // Placeholder: در نسخه واقعی باید API تغییر رمز داشته باشیم
    showToast('✅ رمز عبور تغییر کرد (شبیه‌سازی)');
    document.getElementById('changePassword').value = '';
});

// ===== CLEAR LOGS =====
document.getElementById('clearLogsBtn').addEventListener('click', async () => {
    if (!confirm('آیا از پاکسازی لاگ‌ها مطمئنی؟')) return;
    try {
        await api.clearLogs(30);
        showToast('🗑️ لاگ‌ها پاکسازی شدند');
        loadLogs();
        loadDashboard();
    } catch (error) {
        showToast('❌ خطا: ' + error.message, 'error');
    }
});

// ===== TOAST =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'error' ? '#ff6b6b' : '#1a1a1a'};
        border: 1px solid ${type === 'error' ? '#ff6b6b' : 'var(--gold)'};
        border-radius: 12px;
        padding: 14px 24px;
        color: #fff;
        font-size: 0.95rem;
        box-shadow: ${type === 'error' ? '0 0 30px rgba(255,107,107,0.2)' : 'var(--shadow-gold)'};
        z-index: 1000;
        animation: fadeUp 0.3s ease;
        max-width: 90vw;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        configModal.style.display = 'none';
        userModal.style.display = 'none';
    }
});
