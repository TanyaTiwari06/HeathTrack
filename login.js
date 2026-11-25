/* login page logic. Shared utilities are loaded from common.js. */

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;
    shell();
    publicAuth();
});
