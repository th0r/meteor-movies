Template.cinemas_list.cinemas = function () {
    var cinemas = Cinemas.find({}).fetch(),
        disabledCinemas;

    Session.setDefault('disabledCinemas', {});
    disabledCinemas = Session.get('disabledCinemas');

    cinemas.forEach(function (cinema) {
        cinema.selected = !disabledCinemas[cinema.id];
    });

    return cinemas;
};

Template.cinema.events = {
    'change .cinema-button': function (event) {
        var disabledCinemas = Session.get('disabledCinemas');

        disabledCinemas[this.id] = !event.currentTarget.checked;
        Session.set('disabledCinemas', disabledCinemas);
    }
};

Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};