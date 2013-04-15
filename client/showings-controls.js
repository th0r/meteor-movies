Template.cinemas_list.preserve(['.cinemas']);

Template.cinemas_list.created = function () {
    var self = this;
    
    // Automatically refreshing buttonset widget
    this.buttonRefreshHandler = Deps.autorun(function () {
        Session.get('disabledCinemas');
        if (self.$buttons) {
            self.$buttons.buttonset('refresh');
        }
    });
};

Template.cinemas_list.destroyed = function () {
    this.buttonRefreshHandler.stop();
    this.$buttons.buttonset('destroy');
};

Template.cinemas_list.rendered = function () {
    if (this.$buttons) {
        // Destroying old widget
        this.$buttons.buttonset('destroy');
    }
    // Making buttonset widget from checkboxes
    this.$buttons = $(this.find('.cinemas')).buttonset();
};

Template.cinemas_list.events = {
    'change .cinema-button': function (event) {
        var disabledCinemas = Session.get('disabledCinemas');

        disabledCinemas[this.id] = !event.currentTarget.checked;
        Session.set('disabledCinemas', disabledCinemas);
    }
};

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


Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};