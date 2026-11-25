/* summary page logic. Shared utilities are loaded from common.js. */
    function renderSummary() {
        const host = $('#summary-content');
        if (!host)
            return;
        const id = new URLSearchParams(location.search).get('id') || sessionStorage.getItem('ht_current_report');
        const report = reports().find(r => r.id === id) || reports()[0];
        if (!report) {
            host.innerHTML = `<div class="empty">No report is selected yet. <a href="add-report.html">Add a report</a> to generate a summary.</div>`;
            return;
        }
        const items = report.params || [];
        host.innerHTML = `<div class="card"><div class="row wrap"><div><div class="muted" style="font-size:12px">${esc(report.type || 'Health report')} · ${fmtDate(report.date)}</div><h2 style="margin-top:5px">${esc(report.name)}</h2><p class="muted">${esc(report.lab || 'Laboratory not specified')} ${report.filename ? '· File: ' + esc(report.filename) : ''}</p></div><div class="row wrap"><a class="btn secondary small" href="records.html">All reports</a><a class="btn small" href="add-report.html">Add another</a></div></div><div class="notice info" style="margin:18px 0">This is an informational comparison with the ranges entered from the report. It is not a diagnosis. If the lab's range is missing or units differ, the status cannot be reliably assessed.</div><div class="table-wrap"><table><thead><tr><th>Parameter</th><th>Result</th><th>Reference range</th><th>Status</th></tr></thead><tbody>${items.map(p => { const st = statusOf(p.value, p.low, p.high, p.rangeText); return `<tr><td><strong>${esc(p.name)}</strong><button class="parameter-info" type="button" data-help="${esc(p.name)}" aria-label="About ${esc(p.name)}">i</button><div class="info-pop hidden">${esc(parameterHelp[p.name] || `${p.name} is a health measurement. Check the lab report for the correct unit and reference range, and ask a healthcare professional if you are unsure how to interpret it.`)}</div></td><td><strong>${esc(p.value)}</strong> ${esc(p.unit)}</td><td>${p.rangeText ? esc(p.rangeText) : p.low !== '' && p.high !== '' ? `${esc(p.low)}–${esc(p.high)} ${esc(p.unit)}` : 'Not provided'}</td><td><span class="pill ${st.key}">${st.label}</span></td></tr>`; }).join('')}</tbody></table></div></div>`;
        $$('.parameter-info', host).forEach(btn => btn.addEventListener('click', () => btn.nextElementSibling.classList.toggle('hidden')));
    }
    // Display saved reports and prepare the health-trend chart.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    renderSummary();
});
