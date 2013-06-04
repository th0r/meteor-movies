Accounts.onCreateUser(function (options, user) {
    var userProfile = user.profile = {},
        passedProfile = options.profile;

    if (passedProfile) {
        userProfile.name = passedProfile.name || '';
        userProfile.surname = passedProfile.surname || '';
        userProfile.nickname = passedProfile.nickname || '';
    }

    user.notifyAbout = {
        newMovies: true
    };

    if (App.ADMIN_EMAIL && options.email === App.ADMIN_EMAIL) {
        user.admin = true;
    }

    return user;
});

// Publishing "admin" field
Meteor.publish('userData', function () {
    return Meteor.users.find({
        _id: this.userId
    }, {
        fields: {
            'admin': 1,
            'notifyAbout': 1
        }
    });
});

// Deny any user object modifications
Meteor.users.deny({
    update: function () {
        return true;
    }
});

Meteor.methods({
    
    updateUserNotifications: function (notifyAbout) {
        if (this.userId) {
            check(notifyAbout, {
                newMovies: Match.Optional(Boolean)
            });
            var currentSettings = Meteor.user().notifyAbout || {},
                newSettings = _.extend({}, currentSettings, notifyAbout);

            Meteor.users.update(this.userId, {$set: {notifyAbout: newSettings}});
        }
    }
    
});