const toast = {
    init() {
        this.hideTimeout = null;
        
        this.el = document.createElement('div');
        this.el.className = 'toast-notif';
        document.body.appendChild(this.el);
    },

    showError(message) {
        clearTimeout(this.hideTimeout);

        this.el.textContent = message;
        this.el.className = 'toast-notif toast-notif-vis toast-err';

        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove('toast-notif-vis')
        }, 5000);
    },

    showWarning(message) {
        clearTimeout(this.hideTimeout);

        this.el.textContent = message;
        this.el.className = 'toast-notif toast-notif-vis toast-warn';

        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove('toast-notif-vis')
        }, 3000);
    },

    show(message) {
        clearTimeout(this.hideTimeout);

        this.el.textContent = message;
        this.el.className = 'toast-notif toast-notif-vis';

        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove('toast-notif-vis')
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => toast.init());

function tError(message) {
    toast.showError(message);
}

function tWarning(message) {
    toast.showWarning(message);
}

function show(message) {
    toast.show(message);
}

export {tError, tWarning, show};