Movies = new Meteor.Collection('movies');

if (Meteor.isClient) {
    Meteor.subscribe('movies');
}