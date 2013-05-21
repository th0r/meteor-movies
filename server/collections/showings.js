var Fiber = Npm.require('fibers'),
    SHOWINGS_UPDATE_INTERVAL = 15 * 60 * 1000;

Meteor.publish('showings', function () {
    return Showings.find({});
});

Meteor.methods({
    'refreshShowings': function (forceFetchAll) {
        Showings.refresh(forceFetchAll);
    }
});

Meteor.startup(function () {

    function updateShowings(cinemaId, showings, synonyms) {
        Fiber(function () {
            Showings.remove({cinemaId: cinemaId});
            showings.forEach(function (showing) {
                var changedMovieName = synonyms[showing.movie];

                if (changedMovieName) {
                    showing.originalMovie = showing.movie;
                    showing.movie = changedMovieName;
                }
                showing.cinemaId = cinemaId;
                Showings.insert(showing);
                MoviesManager.addMovie(showing.movie);
            });
        }).run();
    }

    function getSynonymsHash() {
        var synonyms = {};

        MovieSynonyms.find({}).fetch().forEach(function (doc) {
            synonyms[doc.from] = doc.to;
        });

        return synonyms;
    }

    /**
     * @param [forceFetchAll=false]
     */
    Showings.refresh = function (forceFetchAll) {
        var synonyms = getSynonymsHash(),
            method = forceFetchAll ? 'fetchAllShowings' : 'fetchOverdueShowings';

        console.log(forceFetchAll ? 'Fetching showings for all cinemas...' : 'Updating showings...');
        CinemasManager
            [method](function (cinemaId, error, showings) {
                if (error) {
                    console.log('Error while fetching showings for "' + cinemaId + '" cinema');
                } else {
                    console.log('Updating showings for "' + cinemaId + '" cinema');
                    updateShowings(cinemaId, showings, synonyms);
                }
            })
            .done(function (status) {
                if (status === true) {
                    console.log('All showings are actual');
                }
                console.log(forceFetchAll ? 'Showings fetching done' : 'Showings updating done');
            });
    };

    // Automatically updating showings on add/remove movie synonym
    var initialChanges = true;
    MovieSynonyms
        .find({})
        .observe({
            'added': function (doc) {
                if (!initialChanges) {
                    Showings
                        .find({movie: doc.from, originalMovie: {$exists: false}})
                        .fetch()
                        .forEach(function (showing) {
                            Showings.update(showing._id, {
                                $set: {originalMovie: showing.movie, movie: doc.to}
                            });
                        });
                }
            },
            removed: function (doc) {
                if (!initialChanges) {
                    Showings
                        .find({movie: doc.to, originalMovie: doc.from})
                        .fetch()
                        .forEach(function (showing) {
                            Showings.update(showing._id, {
                                $set: {movie: showing.originalMovie},
                                $unset: {originalMovie: 1}
                            });
                        });
                }
            }
        });
    initialChanges = false;

    Showings.refresh();

    Meteor.setInterval(function () {
        console.log('Showings update timer:');
        Showings.refresh();
    }, SHOWINGS_UPDATE_INTERVAL);

});