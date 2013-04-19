Meteor.publish('movie-synonyms', function () {
    return MovieSynonyms.find({});
});

Meteor.methods({

    'removeAllMovieSynonyms': function () {
        MovieSynonyms.remove({});
    }

});