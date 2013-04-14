Showings = new Meteor.Collection('showings');

if (Meteor.isClient) {
    Meteor.subscribe('showings');
}