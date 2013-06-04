var ADMIN_EMAIL = App.ADMIN_EMAIL;

if (ADMIN_EMAIL) {
    Meteor.startup(function () {
        // Checking for user with provided email
        var user = Meteor.users.findOne({'emails.address': ADMIN_EMAIL});

        // Admin is already created
        if (user && user.admin) {
            return;
        }
        
        // User is created, but it's not admin
        // Removing it
        if (user) {
            Meteor.users.remove(user._id);
        }
        
        // Creating admin user...
        user = Accounts.createUser({
            email: ADMIN_EMAIL
        });
        // ...and sending email to set password
        Accounts.sendEnrollmentEmail(user);
    });
}