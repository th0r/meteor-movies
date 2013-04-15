Meteor.publish('movie-synonyms', function () {
    return MovieSynonyms.find({});
});

Meteor.methods({

    'addMovieSynonym': function (original, synonym) {
        var doc = {from: synonym, to: original};

        if (!MovieSynonyms.find(doc, {limit: 1}).count()) {
            MovieSynonyms.insert(doc);
        }
    },

    'removeAllMovieSynonyms': function () {
        MovieSynonyms.remove({});
    }

});