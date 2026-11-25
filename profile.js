/* profile page logic. Shared utilities are loaded from common.js. */
    function renderProfile() {
        const form = $('#profile-form');
        if (!form)
            return;
        const p = currentProfile();
        $('#profile-name').value = p.name || '';
        $('#profile-email').value = p.email || '';
        $('#profile-phone').value = p.phone || '';
        const photo = $('#photo-preview');
        if (p.photo) {
            photo.src = p.photo;
            photo.classList.remove('hidden');
            $('#photo-initials').classList.add('hidden');
        }
        else {
            photo.classList.add('hidden');
            $('#photo-initials').classList.remove('hidden');
            $('#photo-initials').textContent = (p.name || 'G').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
        }
        $('#photo-file')?.addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f)
                return;
            if (!f.type.startsWith('image/')) {
                showMessage('#profile-message', 'Choose an image file.', 'error');
                return;
            }
            if (f.size > 1024 * 1024) {
                showMessage('#profile-message', 'Please choose an image under 1 MB so browser storage is not overloaded.', 'error');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => { const np = { ...currentProfile(), photo: reader.result }; write(STORE.profile, np); photo.src = reader.result; photo.classList.remove('hidden'); $('#photo-initials').classList.add('hidden'); };
            reader.readAsDataURL(f);
        });
        $('#remove-photo')?.addEventListener('click', () => { const np = { ...currentProfile() }; delete np.photo; write(STORE.profile, np); photo.classList.add('hidden'); $('#photo-initials').classList.remove('hidden'); const nm = (currentProfile().name || 'Guest User').trim().split(/\s+/).filter(Boolean); $('#photo-initials').textContent = (nm.length > 1 ? nm[0][0] + nm[1][0] : (nm[0] || 'G')[0]).toUpperCase(); });
        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#profile-name').value.trim(), email = $('#profile-email').value.trim();
            if (!name || !email) {
                showMessage('#profile-message', 'Name and email are required.', 'error');
                return;
            }
            write(STORE.profile, { ...currentProfile(), name, email, phone: $('#profile-phone').value.trim() });
            showMessage('#profile-message', 'Profile updated in this browser.', 'success');
            shell();
        });
        $('#reset-demo')?.addEventListener('click', () => {
            if (confirm('Clear all HealthTrack demo data stored in this browser? This cannot be undone.')) {
                Object.values(STORE).forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
                location.href = 'index.html';
            }
        });
    }
    // Sign-up and login use a profile saved in this browser.
    // This is only a front-end demo, not secure real-world authentication.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    renderProfile();
});
