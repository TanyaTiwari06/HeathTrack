/* records page logic. Shared utilities are loaded from common.js. */
    function renderRecords() {
        const list = $('#report-list');
        if (!list)
            return;
        const search = $('#report-search'), filter = $('#report-type-filter');
        function render() {
            const q = (search?.value || '').toLowerCase(), f = filter?.value || '';
            const all = reports().filter(r => (!q || `${r.name} ${r.lab || ''} ${r.type || ''}`.toLowerCase().includes(q)) && (!f || r.type === f));
            const types = [...new Set(reports().map(r => r.type || 'General'))];
            if (filter) {
                const current = filter.value;
                filter.innerHTML = '<option value="">All report types</option>' + types.map(t => `<option>${esc(t)}</option>`).join('');
                filter.value = current;
            }
            list.innerHTML = all.length ? all.map(r => `<div class="quick-link"><div style="min-width:0"><strong>${esc(r.name)}</strong><small>${fmtDate(r.date)} · ${esc(r.type || 'General')} · ${(r.params || []).length} parameters</small></div><div class="row wrap"><a class="btn secondary small" href="summary.html?id=${encodeURIComponent(r.id)}">View summary</a><button class="btn danger small delete-report" data-id="${esc(r.id)}">Delete</button></div></div>`).join('') : `<div class="empty">${reports().length ? 'No reports match your search.' : 'No saved reports yet. Add your first report to see it here.'}</div>`;
            $$('.delete-report', list).forEach(b => b.addEventListener('click', () => {
                if (confirm('Delete this saved report? This cannot be undone.')) {
                    write(STORE.reports, reports().filter(r => r.id !== b.dataset.id));
                    render();
                    pushNotice('Report deleted', 'A saved report was removed.');
                }
            }));
        }
        search?.addEventListener('input', render);
        filter?.addEventListener('change', render);
        render();
        renderChart();
    }

    function renderChart() {
        const host = $('#trend-chart');
        if (!host)
            return;
        const all = reports().slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        const params = [...new Set(all.flatMap(r => (r.params || []).map(p => p.name)))];
        const selector = $('#trend-parameter');
        if (!params.length) {
            host.innerHTML = '<div class="empty">Your trend chart will appear after you save reports with numeric results. No sample data is shown.</div>';
            if (selector)
                selector.innerHTML = '<option>No parameters yet</option>';
            return;
        }
        if (selector) {
            const prev = selector.value;
            selector.innerHTML = params.map(p => `<option>${esc(p)}</option>`).join('');
            if (params.includes(prev))
                selector.value = prev;
        }
        function draw() {
            const name = selector?.value || params[0];
            const points = all.map(r => { const p = (r.params || []).find(x => x.name === name && x.value !== ''); return p ? { date: r.date || '', value: Number(p.value), unit: p.unit || '', low: p.low !== '' ? Number(p.low) : null, high: p.high !== '' ? Number(p.high) : null, report: r.name } : null; }).filter(Boolean);
            if (points.length < 2) {
                host.innerHTML = `<div class="empty">Add at least two saved results for <strong>${esc(name)}</strong> on different report entries to see a trend. Your data is not being replaced with sample values.</div>`;
                return;
            }
            const W = 700, H = 260, L = 48, R = 18, T = 20, B = 44, vals = points.map(p => p.value), min = Math.min(...vals), max = Math.max(...vals), pad = (max - min || Math.max(1, Math.abs(max) * .08)) * .2, ymin = min - pad, ymax = max + pad;
            const x = i => L + i * (W - L - R) / (points.length - 1), y = v => T + (ymax - v) * (H - T - B) / (ymax - ymin);
            const grid = [0, 1, 2, 3].map(i => { const v = ymin + (ymax - ymin) * i / 3, yy = y(v); return `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="#E6EEEB"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" fill="#72818A" font-size="10">${v.toFixed(1)}</text>`; }).join('');
            const line = points.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
            host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend line for ${esc(name)}">${grid}<path d="${line}" fill="none" stroke="#2AA198" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.map((p, i) => `<circle class="chart-point" cx="${x(i)}" cy="${y(p.value)}" r="5" fill="#153E46" tabindex="0"><title>${esc(fmtDate(p.date))}: ${p.value} ${esc(p.unit)} — ${esc(p.report)}</title></circle><text x="${x(i)}" y="${H - 20}" text-anchor="middle" fill="#72818A" font-size="10">${esc((p.date || '').slice(5))}</text>`).join('')}</svg><div class="tooltip">Showing ${esc(name)} (${esc(points[0].unit)}). Select or hover over a point to see its value. Reference ranges may vary by lab and are not drawn as a universal band.</div>`;
        }
        selector?.addEventListener('change', draw);
        draw();
    }
    // Calculate BMI from the height and weight entered by the user.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    renderRecords();
});
