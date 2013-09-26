var EMAIL_SEND_DELAY = 5 * 1000,
    newMovies = [],
    sendDelayedEmailNotifications = Du.debounce(function () {
        // Removing `isNew` marker
        newMovies.forEach(function (movie) {
            Movies.update(movie._id, {$unset: {isNew: 1}});
        });
        
        // Sending notification email
        console.log('Notifying users about new movies...');
        // Collecting subscribers
        var subscribers = Meteor.users
            .find({
                'notifyAbout.newMovies': true
            }, {
                fields: {emails: 1}
            })
            .fetch();
        if (subscribers.length) {
            var emails = subscribers.map(function (subscriber) {
                return subscriber.emails[0].address;
            });
            console.log('Sending emails to: ', emails);
            App.sendEmail(emails, 'new-movies', {
                movies: newMovies,
                rootUrl: Meteor.absoluteUrl()
            });
        } else {
            console.log('There are no subscribers for new movies email');
        }
        newMovies = [];
    }, EMAIL_SEND_DELAY);

Meteor.publish('movies', function () {
    return Movies.find({});
});

Meteor.startup(function () {

    // Sending email if new movies has been added
    Movies
        .find({isNew: true, info: {$exists: true}})
        .observe({
            'added': function (movie) {
                console.log('New movie added: "' + movie.title + '"');
                newMovies.push(movie);
                sendDelayedEmailNotifications();
            }
        });
    
});