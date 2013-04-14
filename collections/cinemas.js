Cinemas = new Meteor.Collection('cinemas');

if (Meteor.isClient) {
    Meteor.subscribe('cinemas');
}