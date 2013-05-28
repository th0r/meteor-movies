Meteor.startup(function () {

    var TMPL_DEBUG = false,
        SESSION_DEFAULTS = {
            moviesFilter: ''
        },
        STORAGE_DEFAULTS = {
            isControlsShown: false
        },
        SESSION_DEFAULTS_WITH_STORAGE = {
            sorting: {
                by: 'movie-name',
                order: 'new'
            },
            showingsFrom: App.DAY_START_MINUTES,
            showingsTo: App.DAY_END_MINUTES,
            autoTime: true,
            disabledCinemas: {}
        },
        undefined = void 0;

    // Setting default session values
    _.each(SESSION_DEFAULTS, function (value, key) {
        Session.setDefault(key, value);
    });
    _.each(STORAGE_DEFAULTS, function (value, key) {
        if (store.get(key) === undefined) {
            store.set(key, value);
        } 
    });
    _.each(SESSION_DEFAULTS_WITH_STORAGE, function (value, key) {
        Session.setDefault(key, value, true);
    });

    // Templates rendering watcher
    if (TMPL_DEBUG) {

        _.each(Template, function (tmpl, name) {
            var _rendered = tmpl.rendered;

            tmpl.rendered = function () {
                console.log('Template "' + name + '" rendered', this.firstNode, this.lastNode);
                if (_rendered) {
                    _rendered.apply(this, arguments);
                }
            }
        });

    }
    
    // Icon buttons highlighting on hover
    $(document).on({
        'mouseenter': function () {
            $(this).addClass('ui-state-hover');
        },
        'mouseleave': function () {
            $(this).removeClass('ui-state-hover');
        }
    }, '.icon-button');

});