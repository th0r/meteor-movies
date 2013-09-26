Meteor.startup(function () {
    var ADMIN_EMAIL = App.ADMIN_EMAIL,
        user;
    
    if (!ADMIN_EMAIL) {
        return;
    }
    
    // Checking for user with provided email
    user = Meteor.users.findOne({'emails.address': ADMIN_EMAIL});
    
    // Admin is already created
    if (user && user.admin) {
        if (!user.emails[0].verified) {
            // Sending enrollment email, because admin have's verified it's email yet
            Accounts.sendEnrollmentEmail(user);
        }
        
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