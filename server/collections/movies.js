var EMAIL_SEND_DELAY = 5 * 60 * 1000,
    newMovies = [],
    sendDelayedEmailNotifications = Du.debounce(function () {
        // Removing `isNew` marker
        newMovies.forEach(function (movie) {
            Movies.update(movie._id, {$unset: {isNew: 1}});
        });
        // Sending notification email
        console.log('Sending email about new movies...');
        App.sendEmail('new-movies', {
            movies: newMovies
        });
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