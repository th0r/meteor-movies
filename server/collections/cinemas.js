Meteor.publish('cinemas', function () {
    return Cinemas.find({});
});