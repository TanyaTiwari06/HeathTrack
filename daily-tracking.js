/* daily-tracking page logic. Shared utilities are loaded from common.js. */
    function paintTracker(kind) {
        const key = kind === 'water' ? STORE.water : STORE.steps, goalKey = kind, unit = kind === 'water' ? 'ml' : 'steps';
        const rows = trackerEntries(key), todayRows = rows.filter(x => x.date === today()), total = trackerTotal(todayRows), goal = goals()[goalKey];
        const totalEl = $(`#${kind}-today`), goalEl = $(`#${kind}-goal-label`), bar = $(`#${kind}-bar`), history = $(`#${kind}-history`);
        if (totalEl)
            totalEl.textContent = number(total);
        if (goalEl)
            goalEl.textContent = goal ? `Goal: ${number(goal)} ${unit}` : 'Set your daily goal to get started.';
        const percent = goal ? Math.min(100, Math.round(total / goal * 100)) : 0;
        if (bar)
            bar.style.width = `${percent}%`;
        if (bar?.parentElement)
            bar.parentElement.setAttribute('aria-valuenow', String(percent));
        const progressText = $(`#${kind}-progress-text`);
        if (progressText)
            progressText.textContent = goal ? `${percent}% of your daily goal` : 'Set a goal to see your progress';
        if (history) {
            history.innerHTML = todayRows.length ? todayRows.slice().reverse().map(x => `<div class="tracker-log-row"><span class="tracker-log-icon" aria-hidden="true">${kind === 'water' ? '💧' : '👣'}</span><span class="tracker-log-detail"><strong>${number(x.amount)} ${unit}</strong><small>${trackerTime(x.time)}</small></span><button type="button" class="tracker-remove delete-entry" data-id="${esc(x.id)}" aria-label="Remove ${number(x.amount)} ${unit}" title="Remove entry">×</button></div>`).join('') : `<div class="empty">Nothing logged today yet.</div>`;
            history.querySelectorAll('.delete-entry').forEach(btn => btn.addEventListener('click', () => { write(key, trackerEntries(key).filter(x => x.id !== btn.dataset.id)); paintTracker(kind); updateDashboard(); }));
        }
        const days = {};
        rows.forEach(x => { days[x.date] = (days[x.date] || 0) + Number(x.amount); });
        const dayHost = $(`#${kind}-history-days`);
        if (dayHost) {
            const dates = Object.keys(days).sort().reverse().slice(0, 7);
            dayHost.innerHTML = dates.length ? dates.map(d => `<div class="tracker-day-row"><strong>${fmtDate(d)}</strong><span>${number(days[d])} ${unit}</span></div>`).join('') : `<div class="empty">History will appear after you log entries.</div>`;
        }
    }

    function renderDailyTracking() {
        const waterGoal = $('#water-goal'), stepsGoal = $('#steps-goal'), saved = goals();
        if (waterGoal)
            waterGoal.value = saved.water || '';
        if (stepsGoal)
            stepsGoal.value = saved.steps || '';
        paintTracker('water');
        paintTracker('steps');
        $('#goal-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const w = Number(waterGoal?.value), s = Number(stepsGoal?.value);
            if (!Number.isInteger(w) || w <= 0 || !Number.isInteger(s) || s <= 0) {
                showMessage('#tracking-message', 'Enter a whole-number goal greater than zero for both trackers.', 'error');
                return;
            }
            write(STORE.goals, { ...goals(), water: w, steps: s });
            showMessage('#tracking-message', 'Your daily goals have been saved.', 'success');
            paintTracker('water');
            paintTracker('steps');
            updateDashboard();
        });
        ['water', 'steps'].forEach(kind => {
            const amountInput = $(`#${kind}-amount`), form = $(`#${kind}-form`), key = kind === 'water' ? STORE.water : STORE.steps;
            $$(`[data-quick-add="${kind}"]`).forEach(btn => btn.addEventListener('click', () => {
                const amount = Number(btn.dataset.amount);
                if (!Number.isInteger(amount) || amount <= 0)
                    return;
                addTrackerEntry(key, amount);
                paintTracker(kind);
                updateDashboard();
                pushNotice(kind === 'water' ? 'Water logged' : 'Steps logged', `${number(amount)} ${kind === 'water' ? 'ml' : 'steps'} added to today's log.`);
            }));
            form?.addEventListener('submit', e => {
                e.preventDefault();
                const amount = Number(amountInput?.value);
                if (!Number.isInteger(amount) || amount <= 0) {
                    showMessage('#tracking-message', kind === 'water' ? 'Enter a whole water amount greater than zero.' : 'Enter a whole step count greater than zero.', 'error');
                    return;
                }
                addTrackerEntry(key, amount);
                if (amountInput)
                    amountInput.value = '';
                showMessage('#tracking-message', `${number(amount)} ${kind === 'water' ? 'ml of water' : 'steps'} added to today’s total.`, 'success');
                paintTracker(kind);
                updateDashboard();
                pushNotice(kind === 'water' ? 'Water logged' : 'Steps logged', `${number(amount)} ${kind === 'water' ? 'ml' : 'steps'} added to today's log.`);
            });
        });
    }

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    renderDailyTracking();
});
