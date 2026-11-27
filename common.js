/* Shared HealthTrack logic and utilities. Page-specific behaviour is in js/<page>.js. */
    const $ = (s, root = document) => root.querySelector(s);

    const $$ = (s, root = document) => [...root.querySelectorAll(s)];

    const STORE = { reports: 'ht_reports_v1', profile: 'ht_profile_v1', water: 'ht_water_v1', steps: 'ht_steps_v1', goals: 'ht_goals_v1', notices: 'ht_notices_v1', session: 'ht_session_v1', bmi: 'ht_bmi_v1' };

    const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const read = (key, fallback) => {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        }
        catch {
            return fallback;
        }
    };

    const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

    const fmtDate = d => {
        if (!d)
            return 'Date not set';
        const x = new Date(d + 'T12:00:00');
        return Number.isNaN(x.getTime()) ? d : x.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const number = n => Number(n || 0).toLocaleString();

    const currentProfile = () => read(STORE.profile, { name: 'Guest User', email: '' });

    const reports = () => read(STORE.reports, []);

    const iconSvg = (name) => ({
        dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        trends: '<path d="M3 17 9 11l4 4 8-9"/><path d="M15 6h6v6"/>', 'add-report': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11v6M9 14h6"/>', records: '<path d="M8 3h8l4 4v14H4V3z"/><path d="M8 3v5h8V3M8 13h8M8 17h8"/>', water: '<path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5Z"/><path d="M9 16a3 3 0 0 0 3 3"/>', steps: '<path d="M7.1 2.8c-1.7.2-2.7 2.1-2.4 4.5.3 2.1 1.5 3.5 3 3.3 1.7-.2 2.6-2.2 2.3-4.4-.3-2.2-1.4-3.6-2.9-3.4Z"/><path d="M4.7 12.2c-1.6 1-2.7 3.1-2.4 5 .3 1.8 1.7 2.8 3.3 2.5 1.7-.3 2.8-2 2.5-3.8-.3-1.8-1.8-3.2-3.4-3.7Z"/><path d="M16.9 2.8c1.7.2 2.7 2.1 2.4 4.5-.3 2.1-1.5 3.5-3 3.3-1.7-.2-2.6-2.2-2.3-4.4.3-2.2 1.4-3.6 2.9-3.4Z"/><path d="M19.3 12.2c1.6 1 2.7 3.1 2.4 5-.3 1.8-1.7 2.8-3.3 2.5-1.7-.3-2.8-2-2.5-3.8.3-1.8 1.8-3.2 3.4-3.7Z"/>', bmi: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h2m4 0h2M8 14h2m4 0h2M8 18h2"/>', profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>', files: '<path d="M8 3H4v18h14v-4M8 3h8l4 4v8M8 3v5h8V3M8 12h8M8 16h8"/>', heart: '<path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z"/><path d="M3 12h5l2-3 3 6 2-3h6"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/>', file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
        home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
        logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
    })[name] || '<circle cx="12" cy="12" r="9"/>';

    const icon = (name) => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconSvg(name)}</svg>`;

    const navItems = [['dashboard', 'Dashboard', 'dashboard.html'], ['add-report', 'Add New Report', 'add-report.html'], ['records', 'My Health', 'records.html'], ['trends', 'Health Trends', 'records.html#trend-section'], ['water', 'Water Tracker', 'water.html'], ['steps', 'Step Tracker', 'steps.html'], ['bmi', 'BMI Calculator', 'bmi.html'], ['profile', 'Profile & Settings', 'profile.html']];
    // Build the top bar, sidebar, menu and notification panel.

    function shell() {
        const page = document.body.dataset.page, p = currentProfile(), names = (p.name || 'Guest User').trim().split(/\s+/).filter(Boolean), initials = (names.length > 1 ? names[0][0] + names[1][0] : ((names[0] || 'G').slice(0, 1))).toUpperCase();
        const top = $('#topbar'), side = $('#sidebar');
        const logo = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" focusable="false"><path d="M3 21h8l4-10 6 19 5-12 3 3h8" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        if (top)
            top.innerHTML = `<div class="topbar-inner"><div class="row" style="justify-content:flex-start;gap:12px"><button class="icon-btn nav-menu-toggle" id="nav-menu-toggle" aria-label="Open navigation menu" aria-expanded="false" title="Toggle navigation">☰</button><a class="brand" href="dashboard.html">${logo}<span class="brand-word">Health<span>Track</span></span></a></div><div class="top-actions"><div class="notification-wrap"><button class="icon-btn" id="notification-toggle" aria-label="Notifications">${icon('bell')}<span class="dot hidden" id="notification-dot"></span></button><div class="notification-panel hidden" id="notification-panel"><div class="row"><strong>Notifications</strong><button class="btn ghost small" id="mark-notifications-read">Mark read</button></div><div id="notification-list"></div></div></div><a href="profile.html" aria-label="Profile">${p.photo ? `<img class="avatar" src="${p.photo}" alt="Profile photo">` : `<span class="avatar">${esc(initials)}</span>`}</a></div></div>`;
        if (side)
            side.innerHTML = `${navItems.map(([key, label, url]) => `<a title="${label}" class="nav-link ${(page === key || (key === 'trends' && page === 'records' && location.hash === '#trend-section')) ? 'active' : ''}" href="${url}"><span class="nav-icon" aria-hidden="true">${icon(key === 'records' ? 'heart' : key === 'profile' ? 'profile' : key === 'add-report' ? 'add-report' : key === 'trends' ? 'trends' : key)}</span><span class="nav-label-text">${label}</span></a>`).join('')}<div class="nav-label">ACCOUNT</div><a class="nav-link" href="index.html" title="Visit Homepage"><span class="nav-icon">${icon('home')}</span><span class="nav-label-text">Visit Homepage</span></a><a class="nav-link" href="login.html" id="logout-link" title="Log Out"><span class="nav-icon">${icon('logout')}</span><span class="nav-label-text">Log Out</span></a>`;
        const layout = $('.app-layout'), menu = $('#nav-menu-toggle');
        const isMobile = () => window.matchMedia('(max-width: 720px)').matches;
        menu?.addEventListener('click', () => {
            if (isMobile()) {
                side?.classList.toggle('open');
                menu.setAttribute('aria-expanded', side?.classList.contains('open') ? 'true' : 'false');
                menu.setAttribute('aria-label', side?.classList.contains('open') ? 'Close navigation menu' : 'Open navigation menu');
            }
            else {
                layout?.classList.toggle('sidebar-collapsed');
                menu.setAttribute('aria-expanded', layout?.classList.contains('sidebar-collapsed') ? 'false' : 'true');
                menu.setAttribute('aria-label', layout?.classList.contains('sidebar-collapsed') ? 'Expand sidebar' : 'Collapse sidebar');
            }
        });
        side?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { side.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Open navigation menu'); }));
        document.addEventListener('click', e => {
            if (isMobile() && side?.classList.contains('open') && !side.contains(e.target) && !menu?.contains(e.target)) {
                side.classList.remove('open');
                menu?.setAttribute('aria-expanded', 'false');
                menu?.setAttribute('aria-label', 'Open navigation menu');
            }
        });
        const nt = $('#notification-toggle');
        if (nt)
            nt.addEventListener('click', () => { $('#notification-panel')?.classList.toggle('hidden'); renderNotifications(); });
        $('#mark-notifications-read')?.addEventListener('click', () => { write(STORE.notices, read(STORE.notices, []).map(n => ({ ...n, read: true }))); renderNotifications(); });
        $('#logout-link')?.addEventListener('click', () => sessionStorage.removeItem(STORE.session));
        renderNotifications();
    }
    // Save a notification and refresh the notification list.

    function pushNotice(title, message) {
        const ns = read(STORE.notices, []);
        ns.unshift({ id: Date.now() + Math.random(), title, message, date: new Date().toISOString(), read: false });
        write(STORE.notices, ns.slice(0, 30));
        renderNotifications();
    }
    // Show saved notifications on the page.

    function renderNotifications() {
        const list = $('#notification-list');
        if (!list)
            return;
        const ns = read(STORE.notices, []);
        const dot = $('#notification-dot');
        if (dot)
            dot.classList.toggle('hidden', !ns.some(n => !n.read));
        list.innerHTML = ns.length ? ns.slice(0, 8).map(n => `<div class="notification-item"><strong>${esc(n.title)}</strong>${esc(n.message)}<br><small>${new Date(n.date).toLocaleString()}</small></div>`).join('') : `<div class="empty" style="padding:18px">You're all caught up. Useful updates will appear here.</div>`;
    }

    const parameterHelp = {
        'Hemoglobin': 'Hemoglobin is a protein in red blood cells that carries oxygen. Interpretation depends on factors such as age, sex, pregnancy status, and the laboratory range.',
        'Blood Glucose': 'Blood glucose measures sugar in the blood. Meaning depends on whether the sample was fasting, random, or taken after a meal.',
        'Total Cholesterol': 'Total cholesterol measures several types of cholesterol in the blood. A clinician interprets it alongside other lipid results and personal risk factors.',
        'HDL': 'HDL is often called “good” cholesterol because it helps carry cholesterol away from tissues. Interpretation depends on the overall lipid profile.',
        'LDL': 'LDL is often called “bad” cholesterol because higher levels can contribute to plaque in arteries. Targets depend on individual cardiovascular risk.',
        'Vitamin D': 'Vitamin D supports bone health and other body functions. Units and laboratory reference ranges matter when interpreting a result.'
    };

    function statusOf(v, low, high, rangeText = '') {
        if (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)))
            return { key: 'unknown', label: 'Range not set' };
        const n = Number(v);
        if (rangeText) {
            const m = String(rangeText).match(/(?:below|less than|under|<)\s*(\d+(?:\.\d+)?)/i);
            if (m)
                return n < Number(m[1]) ? { key: 'good', label: 'Within range' } : { key: 'high', label: 'Above range' };
        }
        if (low === '' || low === null || low === undefined || high === '' || high === null || high === undefined || !Number.isFinite(Number(low)) || !Number.isFinite(Number(high)))
            return { key: 'unknown', label: 'Range not provided' };
        const l = Number(low), h = Number(high);
        if (n < l)
            return { key: 'low', label: 'Below range' };
        if (n > h)
            return { key: 'high', label: 'Above range' };
        return { key: 'good', label: 'Within range' };
    }
    // Add one row where a user can enter a test result.

    function showMessage(selector, message, type = 'info') {
        const el = $(selector);
        if (el) {
            el.className = `notice ${type}`;
            el.textContent = message;
            el.classList.remove('hidden');
        }
    }
    // Display the report selected from the saved records.

    function goals() {
        const saved = read(STORE.goals, { water: null, steps: null });
        return saved && typeof saved === 'object' ? { water: Number(saved.water) > 0 ? Number(saved.water) : null, steps: Number(saved.steps) > 0 ? Number(saved.steps) : null } : { water: null, steps: null };
    }

    function trackerEntries(key) {
        const rows = read(key, []);
        return Array.isArray(rows) ? rows.filter(x => x && typeof x === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(String(x.date || '')) && Number.isFinite(Number(x.amount)) && Number(x.amount) > 0) : [];
    }

    function dailyEntries(key) { return trackerEntries(key).filter(x => x.date === today()); }

    function trackerTotal(rows) { return rows.reduce((sum, x) => sum + Number(x.amount), 0); }

    function trackerId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

    function addTrackerEntry(key, amount) {
        const rows = trackerEntries(key);
        rows.push({ id: trackerId(), date: today(), time: new Date().toISOString(), amount: Number(amount) });
        write(key, rows);
    }

    function trackerTime(value) {
        if (!value)
            return 'Logged today';
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? 'Logged today' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    // Update the totals and recent reports on the dashboard.

    function publicAuth() {
        const signupForm = $('#signup-form');
        const loginForm = $('#login-form');
        // Create a profile and save the password for this browser.
        if (signupForm) {
            signupForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const name = $('#signup-name').value.trim();
                const email = $('#signup-email').value.trim().toLowerCase();
                const password = $('#signup-password').value;
                const confirmPassword = $('#signup-confirm').value;
                const oldProfile = currentProfile();
                if (!name || !email || !password) {
                    showMessage('#auth-message', 'Complete the required fields.', 'error');
                    return;
                }
                if (password.length < 8) {
                    showMessage('#auth-message', 'Use at least 8 characters for your password.', 'error');
                    return;
                }
                if (password !== confirmPassword) {
                    showMessage('#auth-message', 'Passwords do not match.', 'error');
                    return;
                }
                if (oldProfile.email && oldProfile.password && oldProfile.email.toLowerCase() === email) {
                    showMessage('#auth-message', 'An account with this email already exists. Please log in.', 'error');
                    return;
                }
                const profile = {
                    name: name,
                    email: email,
                    phone: $('#signup-phone').value.trim(),
                    password: password
                };
                write(STORE.profile, profile);
                sessionStorage.setItem(STORE.session, JSON.stringify({ email: email }));
                showMessage('#auth-message', 'Your profile has been created. Opening your dashboard...', 'success');
                setTimeout(function () {
                    location.href = 'dashboard.html';
                }, 700);
            });
        }
        // Check both the email and password before opening the dashboard.
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const email = $('#login-email').value.trim().toLowerCase();
                const password = $('#login-password').value;
                const profile = currentProfile();
                if (!email || !password) {
                    showMessage('#auth-message', 'Enter your email and password.', 'error');
                    return;
                }
                if (!profile.email || !profile.password) {
                    showMessage('#auth-message', 'No account found. Please create a profile first.', 'error');
                    return;
                }
                if (email !== profile.email.toLowerCase() || password !== profile.password) {
                    showMessage('#auth-message', 'Incorrect email or password. Please try again.', 'error');
                    return;
                }
                sessionStorage.setItem(STORE.session, JSON.stringify({ email: email }));
                showMessage('#auth-message', 'Login successful. Opening your dashboard...', 'success');
                setTimeout(function () {
                    location.href = 'dashboard.html';
                }, 700);
            });
        }
    }
    // Check whether this browser tab has an active login session.

    function hasLoginSession() {
        try {
            return Boolean(JSON.parse(sessionStorage.getItem(STORE.session)));
        }
        catch (error) {
            return false;
        }
    }
    // Keep dashboard pages available only after a successful login.

    function requireLogin() {
        const page = document.body.dataset.page;
        const publicPages = ['home', 'login', 'signup'];
        if (publicPages.indexOf(page) === -1 && !hasLoginSession()) {
            location.href = 'login.html';
            return false;
        }
        return true;
    }
    // Read text from a PDF or image. The user must check the extracted values.
