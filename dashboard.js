/* dashboard page logic. Shared utilities are loaded from common.js. */
    function updateDashboard() {
        $('#report-count') && ($('#report-count').textContent = number(reports().length));
        const w = trackerTotal(dailyEntries(STORE.water)), s = trackerTotal(dailyEntries(STORE.steps)), g = goals();
        $('#water-total') && ($('#water-total').textContent = number(w));
        $('#step-total') && ($('#step-total').textContent = number(s));
        const wb = $('#water-progress'), sb = $('#step-progress');
        if (wb)
            wb.style.width = g.water ? `${Math.min(100, w / g.water * 100)}%` : '0%';
        if (sb)
            sb.style.width = g.steps ? `${Math.min(100, s / g.steps * 100)}%` : '0%';
        $('#water-goal-text') && ($('#water-goal-text').textContent = g.water ? `Goal: ${number(g.water)} ml` : 'Set your daily goal');
        $('#steps-goal-text') && ($('#steps-goal-text').textContent = g.steps ? `Goal: ${number(g.steps)} steps` : 'Set your daily goal');
        const b = read(STORE.bmi, null), bmiEl = $('#dashboard-bmi');
        if (bmiEl)
            bmiEl.textContent = b?.value ? b.value : '—';
        const greet = $('#greeting');
        if (greet) {
            const h = new Date().getHours();
            greet.textContent = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, ${(currentProfile().name || 'there').split(' ')[0]}`;
        }
        renderRecent();
    }

    function renderRecent() {
        const host = $('#recent-reports');
        if (!host)
            return;
        const all = reports().slice(0, 4);
        host.innerHTML = all.length ? `<div class="stack">${all.map(r => `<a class="quick-link" href="summary.html?id=${encodeURIComponent(r.id)}"><div><strong>${esc(r.name)}</strong><small>${fmtDate(r.date)} · ${(r.params || []).length} parameters</small></div><span>→</span></a>`).join('')}</div>` : `<div class="empty">No reports saved yet. Add your first report to get started.</div>`;
    }
    // Refresh the water or step total, progress bar and history.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    updateDashboard();
});
