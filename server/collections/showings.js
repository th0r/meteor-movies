var Fiber = Npm.require('fibers');

Meteor.startup(function () {
    var fetchingNeeded = true,
        lastShowing = Showings.findOne({}, {$sort: {fetchDate: -1}});

    if (lastShowing) {
        // Checking, if fetching has already been done today
        if (moment().isSame(lastShowing.fetchDate, 'day')) {
            fetchingNeeded = false;
        }
    }

    if (fetchingNeeded) {
        // Filling DB with new showings
        Meteor.call('fetchShowings');
    }
});

Meteor.methods({
    'clearShowings': function () {
        Showings.remove({});
    },
    
    'fetchShowings': function () {
        fetchShowings(function (err, showings) {
            if (showings) {
                Fiber(function () {
                    showings.forEach(function (showing) {
                        Showings.insert(showing);
                    });
                }).run();
            }
        });
    },
    
    'refreshShowings': function () {
        Showings.remove({});
        Meteor.call('fetchShowings');
    }
});