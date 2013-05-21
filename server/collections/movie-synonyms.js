Meteor.publish('movie-synonyms', function () {
    return MovieSynonyms.find({});
});