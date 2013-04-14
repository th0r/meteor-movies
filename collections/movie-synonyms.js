MovieSynonyms = new Meteor.Collection('movie-synonyms');

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

if (Meteor.isClient) {
    Meteor.subscribe('movie-synonyms');
}