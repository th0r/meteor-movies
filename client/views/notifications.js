var notifier = null,
    pending = [];

function show(type, info, options) {
    notifier.notify('create', type, info, options);
}

Template.notifications.rendered = function () {
    notifier = $(this.find('.notifications-container')).notify({
        custom: true
    });
    // Showing pending events
    pending.forEach(function (args) {
        show.apply(null, args);
    });
    pending = null;
};

/**
 * @param {String} type
 * @param {Object} info
 * @param {Object} [options]
 */
App.showNotification = function (type, info, options) {
    if (notifier) {
        show(type, info, options);
    } else {
        pending.push(arguments);
    }
};