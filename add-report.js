/* add-report page logic. Shared utilities are loaded from common.js. */
    const knownParams = [
        { name: 'Hemoglobin', unit: 'g/dL', low: '', high: '' }, { name: 'White Blood Cell Count', unit: 'cells/µL', low: '', high: '' }, { name: 'Platelet Count', unit: '×10³/µL', low: '', high: '' }, { name: 'Red Blood Cell Count', unit: '×10⁶/µL', low: '', high: '' }, { name: 'Hematocrit', unit: '%', low: '', high: '' }, { name: 'Blood Glucose', unit: 'mg/dL', low: '', high: '' }, { name: 'Total Cholesterol', unit: 'mg/dL', low: '', high: '' }, { name: 'HDL', unit: 'mg/dL', low: '', high: '' }, { name: 'LDL', unit: 'mg/dL', low: '', high: '' }, { name: 'Triglycerides', unit: 'mg/dL', low: '', high: '' }, { name: 'Vitamin D', unit: 'ng/mL', low: '', high: '' }, { name: 'Creatinine', unit: 'mg/dL', low: '', high: '' }, { name: 'Urea', unit: 'mg/dL', low: '', high: '' }, { name: 'TSH', unit: 'µIU/mL', low: '', high: '' }, { name: 'HbA1c', unit: '%', low: '', high: '' }, { name: 'ALT (SGPT)', unit: 'U/L', low: '', high: '' }, { name: 'AST (SGOT)', unit: 'U/L', low: '', high: '' }, { name: 'Ferritin', unit: 'ng/mL', low: '', high: '' }, { name: 'Vitamin B12', unit: 'pg/mL', low: '', high: '' }
    ];
    // Compare a result with the reference range entered for it.

    function addParamRow(data = {}) {
        const host = $('#parameter-list');
        if (!host)
            return;
        const row = document.createElement('div');
        row.className = 'parameter-row';
        const options = knownParams.map(p => `<option value="${esc(p.name)}" ${data.name === p.name ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
        row.innerHTML = `<div class="field"><label>Parameter</label><select class="p-name"><option value="">Custom parameter…</option>${options}</select><input class="p-custom ${data.name && !knownParams.some(p => p.name === data.name) ? '' : 'hidden'}" placeholder="Enter parameter name" value="${esc(data.name && !knownParams.some(p => p.name === data.name) ? data.name : '')}"></div><div class="field"><label>Result</label><input class="p-value" type="number" step="any" placeholder="e.g. 13.5" value="${esc(data.value ?? '')}"></div><div class="field"><label>Unit</label><input class="p-unit" placeholder="e.g. g/dL" value="${esc(data.unit ?? '')}"></div><div class="field"><label>Lower range</label><input class="p-low" type="number" step="any" placeholder="Optional" value="${esc(data.low ?? '')}"></div><div class="field"><label>Upper range</label><input class="p-high" type="number" step="any" placeholder="Optional" value="${esc(data.high ?? '')}"><input class="p-range-text" type="hidden" value="${esc(data.rangeText ?? '')}"></div><button class="btn danger small remove-param" type="button" title="Remove parameter">×</button>`;
        host.appendChild(row);
        const select = $('.p-name', row), custom = $('.p-custom', row), unit = $('.p-unit', row), low = $('.p-low', row), high = $('.p-high', row);
        function selected() {
            const item = knownParams.find(p => p.name === select.value);
            custom.classList.toggle('hidden', !!item || !select.value);
            if (item) {
                unit.value = item.unit;
                if (item.low)
                    low.value = item.low;
                if (item.high)
                    high.value = item.high;
            }
        }
        select.addEventListener('change', selected);
        row.querySelector('.remove-param').addEventListener('click', () => row.remove());
        if (data.name && !knownParams.some(p => p.name === data.name)) {
            select.value = '';
            custom.classList.remove('hidden');
        }
    }

    function readParamRows() {
        return $$('.parameter-row').map(r => ({ name: $('.p-name', r).value ? $('.p-name', r).value : $('.p-custom', r).value.trim(), value: $('.p-value', r).value, unit: $('.p-unit', r).value.trim(), low: $('.p-low', r).value, high: $('.p-high', r).value, rangeText: $('.p-range-text', r)?.value || '' })).filter(p => p.name && p.value !== '');
    }
    // Save the report and its test results in this browser.

    function saveReportForm() {
        const form = $('#report-form');
        if (!form)
            return;
        const fileInput = $('#reportFile');
        const fileNameDisplay = $('#fileName');
        fileInput?.addEventListener('change', () => {
            if (fileInput.files.length) {
                fileNameDisplay.textContent = fileInput.files[0].name;
            }
            else {
                fileNameDisplay.textContent = 'No file chosen';
            }
        });
        const date = $('#report-date');
        if (date && !date.value)
            date.value = today();
        if (!$('#parameter-list .parameter-row'))
            addParamRow();
        $('#add-parameter')?.addEventListener('click', () => addParamRow());
        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#report-name').value.trim(), dt = $('#report-date').value, type = $('#report-type')?.value || 'General', lab = $('#lab-name')?.value.trim() || '';
            const params = readParamRows();
            if (!name || !dt) {
                showMessage('#report-message', 'Please enter the report name and date.', 'error');
                return;
            }
            if (!params.length) {
                showMessage('#report-message', 'Add at least one parameter with a numeric result.', 'error');
                return;
            }
            const file = $('#reportFile')?.files?.[0];
            const report = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, date: dt, type, lab, params, filename: file?.name || '', createdAt: new Date().toISOString() };
            const all = reports();
            all.unshift(report);
            write(STORE.reports, all);
            sessionStorage.setItem('ht_current_report', report.id);
            pushNotice('Report saved', `${name} was saved. Review extracted or manually entered values.`);
            location.href = 'summary.html';
        });
    }

    async function extractFile(file) {
        const message = $('#upload-message');
        showMessage('#upload-message', 'Reading the report file… This may take a little while.', 'info');
        try {
            let text = '';
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                if (!window.pdfjsLib)
                    throw new Error('PDF text reader did not load. Check your internet connection or enter the values manually.');
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const data = await file.arrayBuffer(), pdf = await pdfjsLib.getDocument({ data }).promise;
                for (let i = 1; i <= Math.min(pdf.numPages, 12); i++) {
                    const page = await pdf.getPage(i), content = await page.getTextContent();
                    const rows = new Map();
                    for (const it of content.items) {
                        const y = Math.round(it.transform?.[5] || 0);
                        if (!rows.has(y))
                            rows.set(y, []);
                        rows.get(y).push(it.str);
                    }
                    text += [...rows.entries()].sort((a, b) => b[0] - a[0]).map(([, parts]) => parts.join(' ')).join('\n') + '\n';
                }
                if (text.trim().length < 30) {
                    if (!window.Tesseract)
                        throw new Error('This appears to be a scanned PDF. OCR could not load; enter values manually.');
                    let ocr = '';
                    for (let i = 1; i <= Math.min(pdf.numPages, 8); i++) {
                        const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: 1.5 }), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
                        canvas.width = vp.width;
                        canvas.height = vp.height;
                        await pg.render({ canvasContext: ctx, viewport: vp }).promise;
                        const result = await Tesseract.recognize(canvas, 'eng', { logger: m => {
                                if (m.status === 'recognizing text')
                                    showMessage('#upload-message', `Reading scanned page ${i}… ${Math.round((m.progress || 0) * 100)}%`, 'info');
                            } });
                        ocr += '\n' + (result.data.text || '');
                    }
                    text = ocr;
                }
            }
            else if (file.type.startsWith('image/')) {
                if (!window.Tesseract)
                    throw new Error('Image text reader did not load. Check your internet connection or enter the values manually.');

                // Enlarge and sharpen the image before OCR so small table values
                // and reference ranges are easier for the text reader to recognise.
                const image = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = image.width * 2;
                canvas.height = image.height * 2;
                const context = canvas.getContext('2d');
                context.filter = 'grayscale(1) contrast(1.4)';
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                image.close();

                const result = await Tesseract.recognize(canvas, 'eng', { logger: m => {
                        if (m.status === 'recognizing text')
                            showMessage('#upload-message', `Reading image… ${Math.round((m.progress || 0) * 100)}%`, 'info');
                    } });
                text = result.data.text || '';
            }
            else
                throw new Error('Please select a PDF, PNG, or JPG/JPEG file.');
            const found = parseReportText(text);
            if (!found.length)
                throw new Error('The file was read, but no familiar parameter values were recognised. You can enter the values manually below.');
            $$('.parameter-row').forEach(row => {
                const name = $('.p-name', row)?.value || $('.p-custom', row)?.value || '', value = $('.p-value', row)?.value || '';
                if (!name && !value)
                    row.remove();
            });
            found.forEach(p => addParamRow(p));
            showMessage('#upload-message', `Found ${found.length} possible parameter(s). Please verify every value against the original report and add any unlisted parameters manually before saving.`, 'success');
        }
        catch (err) {
            showMessage('#upload-message', err.message || 'Could not read the file. Please enter values manually.', 'warn');
        }
    }
    // Find familiar test names and values in the extracted report text.

    function parseReportText(text) {
        const source = String(text || '').replace(/\u00a0/g, ' ').replace(/[–—−]/g, '-').replace(/[×xX]\s*10\s*\^?\s*3/gi, '×10^3').replace(/\s+/g, ' ').trim();
        if (!source)
            return [];
        const defs = [
            { name: 'Hemoglobin', aliases: ['hemoglobin', 'haemoglobin'], unit: 'g/dL' },
            { name: 'White Blood Cell Count', aliases: ['white blood cell count', 'total leukocyte count', 'total leucocyte count', 'wbc', 'tlc'], unit: 'cells/µL' },
            { name: 'Platelet Count', aliases: ['platelet count', 'platelets', 'platelet'], unit: '×10³/µL' },
            { name: 'Red Blood Cell Count', aliases: ['red blood cell count', 'erythrocyte count', 'rbc'], unit: '×10⁶/µL' },
            { name: 'Hematocrit', aliases: ['hematocrit', 'haematocrit', 'pcv'], unit: '%' },
            { name: 'Blood Glucose', aliases: ['fasting blood sugar', 'random blood sugar', 'fasting glucose', 'blood glucose', 'glucose', 'fbs', 'rbs'], unit: 'mg/dL' },
            { name: 'Total Cholesterol', aliases: ['total cholesterol', 'cholesterol total'], unit: 'mg/dL' },
            { name: 'HDL', aliases: ['hdl cholesterol', 'hdl'], unit: 'mg/dL' }, { name: 'LDL', aliases: ['ldl cholesterol', 'ldl'], unit: 'mg/dL' },
            { name: 'Triglycerides', aliases: ['triglycerides', 'triglyceride'], unit: 'mg/dL' },
            { name: 'Vitamin D', aliases: ['25-hydroxy vitamin d', '25 hydroxy vitamin d', '25-oh vitamin d', 'vitamin d'], unit: 'ng/mL' },
            { name: 'Creatinine', aliases: ['serum creatinine', 'creatinine'], unit: 'mg/dL' },
            { name: 'Urea', aliases: ['blood urea nitrogen', 'serum urea', 'urea', 'bun'], unit: 'mg/dL' },
            { name: 'TSH', aliases: ['thyroid stimulating hormone', 'tsh'], unit: 'µIU/mL' },
            { name: 'HbA1c', aliases: ['glycated hemoglobin', 'glycated haemoglobin', 'hba1c'], unit: '%' },
            { name: 'ALT (SGPT)', aliases: ['alanine aminotransferase', 'alt (sgpt)', 'sgpt'], unit: 'U/L' },
            { name: 'AST (SGOT)', aliases: ['aspartate aminotransferase', 'ast (sgot)', 'sgot'], unit: 'U/L' },
            { name: 'Ferritin', aliases: ['ferritin'], unit: 'ng/mL' }, { name: 'Vitamin B12', aliases: ['vitamin b12', 'cobalamin'], unit: 'pg/mL' }
        ];
        const occurrences = [];
        for (const def of defs) {
            const aliases = [...def.aliases].sort((a, b) => b.length - a.length);
            for (const alias of aliases) {
                const re = new RegExp('(^|[^a-z0-9])(' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^a-z0-9])', 'i');
                const m = re.exec(source);
                if (m) {
                    occurrences.push({ def, start: m.index + m[1].length, labelEnd: m.index + m[1].length + m[2].length, alias: m[2] });
                    break;
                }
            }
        }
        occurrences.sort((a, b) => a.start - b.start);
        const out = [], seen = new Set();
        for (let i = 0; i < occurrences.length; i++) {
            const o = occurrences[i];
            if (seen.has(o.def.name))
                continue;
            const segment = source.slice(o.labelEnd, occurrences[i + 1]?.start ?? source.length).trim();
            // Keep only the first numeric result, then parse a range from the remainder.
            const valueMatch = segment.match(/(?:^|[^a-z])(-?\d+(?:[.,]\d+)?)(?=$|[^a-z])/i);
            if (!valueMatch)
                continue;
            const value = valueMatch[1].replace(',', '.');
            const afterValue = segment.slice(valueMatch.index + valueMatch[0].length);
            const rangeMatch = afterValue.match(/(?:reference\s*(?:range)?\s*)?(\d+(?:[.,]\d+)?)\s*(?:-|to)\s*(\d+(?:[.,]\d+)?)/i);
            const oneSided = afterValue.match(/(?:below|less than|under|up to|<=|<)\s*(\d+(?:[.,]\d+)?)/i);
            let low = '', high = '', rangeText = '';
            if (oneSided)
                rangeText = 'Below ' + oneSided[1].replace(',', '.');
            else if (rangeMatch) {
                low = rangeMatch[1].replace(',', '.');
                high = rangeMatch[2].replace(',', '.');
            }
            const unitText = segment.match(/(cells?\s*\/\s*[µuμ]?l|×?\s*10\s*\^?\s*[36]\s*\/\s*[µuμ]?l|mg\s*\/\s*dl|g\s*\/\s*dl|ng\s*\/\s*ml|nmol\s*\/\s*l|mmol\s*\/\s*l|µ?iu\s*\/\s*ml|miu\s*\/\s*l|pg\s*\/\s*ml|u\s*\/\s*l|%)/i);
            let unit = o.def.unit;
            if (unitText) {
                unit = unitText[1].replace(/\s+/g, '').replace(/cells?\/[uµμ]?l/i, 'cells/µL').replace(/mg\/dl/i, 'mg/dL').replace(/g\/dl/i, 'g/dL').replace(/ng\/ml/i, 'ng/mL').replace(/nmol\/l/i, 'nmol/L').replace(/mmol\/l/i, 'mmol/L').replace(/pg\/ml/i, 'pg/mL').replace(/u\/l/i, 'U/L').replace(/µ?iu\/ml/i, 'µIU/mL').replace(/10\^?3/i, '10³').replace(/10\^?6/i, '10⁶');
            }
            if (/below|less than|under|up to|<=|</i.test(segment) && !rangeText) {
                const m = segment.match(/(?:below|less than|under|up to|<=|<)\s*(\d+(?:[.,]\d+)?)/i);
                if (m)
                    rangeText = 'Below ' + m[1].replace(',', '.');
            }
            out.push({ name: o.def.name, value, unit, low, high, rangeText });
            seen.add(o.def.name);
        }
        // Fallback preserves clearly structured unknown parameters rather than silently discarding them.
        const lines = String(text || '').replace(/\u00a0/g, ' ').replace(/[–—−]/g, '-').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        for (const line of lines) {
            const m = line.match(/^([A-Za-z][A-Za-z0-9 ()/%.-]{2,35}?)\s+(-?\d+(?:[.,]\d+)?)\s*([A-Za-zµ%/³²0-9]+)?\s+(?:(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)|below\s+(\d+(?:[.,]\d+)?))/i);
            if (m && !/patient|report|date|result|reference|range|sample|test name/i.test(m[1]) && !defs.some(d => d.aliases.some(a => new RegExp('(^|[^a-z0-9])' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^a-z0-9])', 'i').test(m[1]))) && !out.some(p => p.name.toLowerCase() === m[1].trim().toLowerCase()))
                out.push({ name: m[1].trim(), value: m[2].replace(',', '.'), unit: m[3] || '', low: m[4] || '', high: m[5] || '', rangeText: m[6] ? 'Below ' + m[6] : '' });
        }
        return out;
    }
    // Connect the file picker and drag-and-drop upload area.

    function setupUpload() {
        const file = $('#reportFile'), drop = $('#drop-zone'), fileName = $('#selected-file-name'), buttonName = $('#fileName');
        if (file) {
            file.addEventListener('change', () => {
                const f = file.files[0];
                if (!f)
                    return;
                const label = `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`;
                if (fileName)
                    fileName.textContent = label;
                if (buttonName)
                    buttonName.textContent = f.name;
                extractFile(f);
            });
        }
        if (drop && file) {
            drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
            drop.addEventListener('drop', e => {
                e.preventDefault();
                drop.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    file.files = e.dataTransfer.files;
                    file.dispatchEvent(new Event('change'));
                }
            });
        }
    }
    // Run the code needed for the page that has just loaded.

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
    const d = $('#report-date');
    if (d && !d.value) d.value = today();
    if ($('#parameter-list') && !$('.parameter-row')) addParamRow();
    saveReportForm();
    setupUpload();
});
