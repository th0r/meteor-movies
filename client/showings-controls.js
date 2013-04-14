Template.cinemas_list.cinemas = function () {
    return Cinemas.find({});
};

Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};