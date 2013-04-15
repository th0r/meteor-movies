// ==================================== Cinemas List ====================================

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

// ==================================== Time slider ====================================

var TIME_STEP_MINUTES = 30,
    DAY_START_MINUTES = 9 * 60,
    DAY_END_MINUTES = (24 + 3) * 60,
    SLIDER_AUTOUPDATE_INTERVAL_MIN = /*Math.max(1, TIME_STEP_MINUTES / 10)*/ 0.1;

function updateTimeRange(values, $timeText) {
    var from = moment().hours(0).seconds(0).minutes(values[0]),
        to = moment().hours(0).seconds(0).minutes(values[1]);

    $timeText.text('С ' + from.format('HH:mm') + ' по ' + to.format('HH:mm'));
    Session.set('showingsFrom', +from);
    Session.set('showingsTo', +to);
}

/**
 * @param {Date|Number} [to=Date.now()]  Date or timestamp to get closest minute to.
 * @return {Number}  Closest time in minutes.
 */
function getClosestMinute(to) {
    to = moment(to);
    
    return Math.ceil((to.hours() * 60 + to.minutes()) / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
}

Template.time_slider.created = function () {
    var self = this;
    
    this.sliderUpdateInterval = Meteor.setInterval(function () {
        // TODO: сделать чекбокс, юзать ли текущее время или нет
        if (self.useCurrentTime && self.$slider) {
            self.$slider.slider('values', 0, getClosestMinute());
        }
    }, SLIDER_AUTOUPDATE_INTERVAL_MIN * 60 * 1000);
};

Template.time_slider.rendered = function () {
    if (!this.$slider) {
        var initialValues = [getClosestMinute(), DAY_END_MINUTES],
            $timeText = $(this.find('.control-time-text'));

        this.$slider = $(this.find('.control-time-slider')).slider({
            range: true,
            min: DAY_START_MINUTES,
            max: DAY_END_MINUTES,
            values: initialValues,
            step: TIME_STEP_MINUTES,
            orientation: 'horizontal',
            change: function (event, ui) {
                updateTimeRange(ui.values, $timeText);
            },
            slide: function (event, ui) {
                updateTimeRange(ui.values, $timeText);
            }
        });

        updateTimeRange(initialValues, $timeText);
    }
};

Template.time_slider.destroyed = function () {
    Meteor.clearInterval(this.sliderUpdateInterval);
    this.$slider.slider('destroy');
};

// ==================================== Actions ====================================

Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};