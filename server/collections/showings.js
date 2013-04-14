var Fiber = Npm.require('fibers');

Meteor.publish('showings', function () {
    return Showings.find({});
});

Meteor.methods({
    'refreshShowings': function () {
        Showings.refresh();
    }
});

Meteor.startup(function () {

    Showings.fetchAll = function () {
        var synonyms = {};

        // Making synonyms object
        MovieSynonyms.find({}).fetch().forEach(function (doc) {
            synonyms[doc.from] = doc.to;
        });

        CinemasManager
            .fetchAllShowings(function (cinemaId, error, showings) {
                if (showings && showings.length) {
                    Fiber(function () {
                        showings.forEach(function (showing) {
                            var changedMovieName = synonyms[showing.movie];

                            if (changedMovieName) {
                                showing.originalMovie = showing.movie;
                                showing.movie = changedMovieName;
                            }
                            showing.cinemaId = cinemaId;
                            Showings.insert(showing);
                        });
                    }).run();
                }
            })
            .done(function () {
                console.log('Everything fetched fine');
            })
            .fail(function () {
                console.log('Fetch error: ', arguments);
            });
    };

    Showings.clear = function () {
        Showings.remove({});
    };

    Showings.refresh = function () {
        this.clear();
        this.fetchAll();
    };

    // Automatically updating showings on add/remove movie synonym
    var initialChanges = true;
    MovieSynonyms
        .find({})
        .observe({
            'added': function (doc) {
                if (initialChanges) {
                    return;
                }
                Showings
                    .find({
                        movie: doc.from,
                        originalMovie: {
                            $exists: false
                        }
                    })
                    .fetch()
                    .forEach(function (showing) {
                        Showings.update(showing._id, {
                            $set: {
                                originalMovie: showing.movie,
                                movie: doc.to
                            }
                        });
                    });
            },
            removed: function (doc) {
                if (initialChanges) {
                    return;
                }
                Showings
                    .find({
                        movie: doc.to,
                        originalMovie: doc.from
                    })
                    .fetch()
                    .forEach(function (showing) {
                        Showings.update(showing._id, {
                            $set: {
                                movie: showing.originalMovie
                            },
                            $unset: {
                                originalMovie: 1
                            }
                        });
                    });
            }
        });
    initialChanges = false;

    var fetchingNeeded = true,
        lastShowing = Showings.findOne({}, {$sort: {fetchDate: -1}});

    if (lastShowing) {
        // Checking, if fetching has already been done today
        if (moment().isSame(lastShowing.fetchDate, 'day')) {
            fetchingNeeded = false;
        }
    }

    if (true || fetchingNeeded) {
        // Filling DB with new showings
        Showings.refresh();
    }
});