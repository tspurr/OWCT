
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
    //console.error(message);
    toast.showError(message);
}

function tWarning(message) {
    //console.log(message);
    toast.showWarning(message);
}

function show(message) {
    //console.log(message);
    toast.show(message);
}

module.exports.tError = tError;
module.exports.tWarning = tWarning;
module.exports.show = show;