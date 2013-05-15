Meteor.startup(function () {

    var TMPL_DEBUG = false,
        SESSION_DEFAULTS = {
            moviesFilter: ''
        },
        SESSION_DEFAULTS_WITH_STORAGE = {
            sorting: {
                by: 'movie-name',
                order: 1
            },
            showingsFrom: App.DAY_START_MINUTES,
            showingsTo: App.DAY_END_MINUTES,
            autoTime: true,
            disabledCinemas: {}
        };

    // Setting default session values
    _.each(SESSION_DEFAULTS, function (value, key) {
        Session.setDefault(key, value);
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