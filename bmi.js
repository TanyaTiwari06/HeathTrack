/* bmi page logic. Shared utilities are loaded from common.js. */
    function renderBMI() {
        const form = $('#bmi-form');
        if (!form)
            return;
        const saved = read(STORE.bmi, null);
        if (saved) {
            $('#bmi-height').value = saved.height || '';
            $('#bmi-weight').value = saved.weight || '';
            showBMI(saved);
        }
        form.addEventListener('submit', e => {
            e.preventDefault();
            const h = Number($('#bmi-height').value), w = Number($('#bmi-weight').value);
            if (!h || !w || h < 50 || h > 260 || w < 10 || w > 500) {
                showMessage('#bmi-message', 'Enter a height from 50–260 cm and weight from 10–500 kg.', 'error');
                return;
            }
            const value = Number((w / ((h / 100) ** 2)).toFixed(1));
            const result = { height: h, weight: w, value, date: today() };
            write(STORE.bmi, result);
            showBMI(result);
            pushNotice('BMI calculated', 'Your BMI result was calculated in this browser.');
        });
    }

    function showBMI(r) {
        const el = $('#bmi-result');
        if (!el)
            return;
        let cat, desc;
        if (r.value < 18.5) {
            cat = 'Below the standard adult range';
            desc = 'A lower BMI can have different causes. Consider discussing your overall health and nutrition with a qualified professional.';
        }
        else if (r.value < 25) {
            cat = 'Within the standard adult range';
            desc = 'BMI is only one screening measure and does not fully describe health or body composition.';
        }
        else if (r.value < 30) {
            cat = 'Above the standard adult range';
            desc = 'BMI alone cannot determine health. A healthcare professional can consider your overall health and risk factors.';
        }
        else {
            cat = 'In the higher adult BMI range';
            desc = 'BMI alone is not a diagnosis. A healthcare professional can help interpret it alongside other health information.';
        }
        el.innerHTML = `<div class="bmi-result"><div class="muted">Your BMI</div><div class="bmi-value">${r.value}</div><div><span class="pill ${r.value >= 18.5 && r.value < 25 ? 'good' : 'unknown'}">${cat}</span></div><p style="margin:14px auto 0;max-width:520px">${desc}</p><small class="muted">Calculated from ${r.height} cm and ${r.weight} kg · ${fmtDate(r.date)}</small></div>`;
    }
    // Load and save the user's profile details and photo.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    renderBMI();
});
