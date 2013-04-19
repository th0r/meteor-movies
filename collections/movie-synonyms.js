MovieSynonyms = new Meteor.Collection('movie-synonyms');

MovieSynonyms.allow({
    
    insert: function (userId, doc) {
        return !MovieSynonyms.find({
            from: doc.from,
            to: doc.to
        }, {limit: 1}).count();
    }

});

if (Meteor.isClient) {
    Meteor.subscribe('movie-synonyms');
}