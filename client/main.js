Meteor.startup(function () {

    var SESSION_DEFAULTS = {
        'autoTime': true,
        'disabledCinemas': {}
    };

    // Setting default session values
    _.each(SESSION_DEFAULTS, function (value, key) {
        Session.setDefault(key, value);
    });
    
});