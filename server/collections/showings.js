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
        var fetchDate = new Date();
        
        CinemasManager.fetchAllShowings()
            .done(function (allShowings) {
                Fiber(function () {
                    _.each(allShowings, function (showings) {
                        showings.forEach(function (showing) {
                            showings.fetchDate = fetchDate;
                            Showings.insert(showing);
                        });
                    });
                }).run();
            })
            .fail(function () {
                console.log.apply(null, arguments);
            });
    },
    
    'refreshShowings': function () {
        Showings.remove({});
        Meteor.call('fetchShowings');
    }
});