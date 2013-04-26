Meteor.startup(function () {
    var TMPL_DEBUG = false,
        SESSION_DEFAULTS = {
            sorting: {
                by: 'movie-name',
                order: 1
            },
            autoTime: true,
            disabledCinemas: {}
        };

    // Setting default session values
    _.each(SESSION_DEFAULTS, function (value, key) {
        Session.setDefault(key, value);
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
    
});