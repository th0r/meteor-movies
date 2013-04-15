MovieSynonyms = new Meteor.Collection('movie-synonyms');

if (Meteor.isClient) {
    Meteor.subscribe('movie-synonyms');
}