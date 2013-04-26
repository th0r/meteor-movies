// ==================================== Showings controls ====================================

Template.showings_controls.rendered = function () {
    $(this.find('.control-tabs'))
        .tabs();
};

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

    disabledCinemas = Session.get('disabledCinemas');

    cinemas.forEach(function (cinema) {
        cinema.disabled = !Showings.findOne({cinemaId: cinema.id});
        cinema.selected = !cinema.disabled && !disabledCinemas[cinema.id];
    });

    return cinemas;
};

// ==================================== Time slider ====================================

var TIME_STEP_MINUTES = 30,
    DAY_START_MINUTES = 9 * 60,
    DAY_END_MINUTES = (24 + 3) * 60,
    SLIDER_AUTOUPDATE_INTERVAL_MINUTES = 1;

function convertMinuteToMoment(minutes) {
    return moment().startOf('day').minutes(minutes);
}

function updateTimeRange(values, $timeText) {
    var from = convertMinuteToMoment(values[0]),
        to = convertMinuteToMoment(values[1]);

    $timeText.text('С ' + from.format('HH:mm') + ' по ' + to.format('HH:mm'));
    Session.set('showingsFrom', +from);
    Session.set('showingsTo', +to);
}

function getClosestMinute(to) {
    to = moment(to);

    var nowMinutes = to.hours() * 60 + to.minutes();

    if (nowMinutes < DAY_START_MINUTES) {
        nowMinutes += 24 * 60;
    }

    return Math.ceil(nowMinutes / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
}

function autoUpdateTime($slider) {
    if (Session.get('autoTime')) {
        var values = $slider.slider('values'),
            startValue = getClosestMinute(),
            endValue = Math.min(DAY_END_MINUTES, Math.max(values[1], startValue));

        $slider.slider('values', [startValue, endValue]);
    }
}

Session.setDefault('showingsFrom', +convertMinuteToMoment(DAY_START_MINUTES));
Session.setDefault('showingsTo', +convertMinuteToMoment(DAY_END_MINUTES));

Template.time_slider.rendered = function () {
    var $slider = this.$slider;

    if (!$slider) {
        var from = getClosestMinute(Session.get('showingsFrom')),
            to = getClosestMinute(Session.get('showingsTo')),
            initialValues = [from, to],
            $timeText = $(this.find('.control-time-text')),
            autoTimeCheckbox = this.find('.control-time-auto');

        $slider = this.$slider = $(this.find('.control-time-slider')).slider({
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
                var handleIndex = $(ui.handle).data('uiSliderHandleIndex');

                if (handleIndex === 0) {
                    // If left handler was moved, resetting auto time
                    Session.set('autoTime', false);
                }
                updateTimeRange(ui.values, $timeText);
            }
        });

        updateTimeRange(initialValues, $timeText);

        // Auto time checkbox update
        this.autoTimeUpdateHandler = Deps.autorun(function () {
            var autoTime = !!Session.get('autoTime');

            autoTimeCheckbox.checked = !!Session.get('autoTime');
            autoUpdateTime($slider);
        });

        this.sliderUpdateInterval = Meteor.setInterval(autoUpdateTime.bind(null, $slider), SLIDER_AUTOUPDATE_INTERVAL_MINUTES * 60 * 1000);
    }
};

Template.time_slider.destroyed = function () {
    Meteor.clearInterval(this.sliderUpdateInterval);
    this.autoTimeUpdateHandler.stop();
    this.$slider.slider('destroy');
};

Template.time_slider.events = {
    'change .control-time-auto': function (event) {
        Session.set('autoTime', event.currentTarget.checked);
    }
};

// ==================================== Settings ====================================

Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};

Template.movies_synonyms_list.movies = function () {
    var movies = {},
        moviesArray = [];

    MovieSynonyms.find({}).fetch().forEach(function (doc) {
        var synonyms = movies[doc.to] = movies[doc.to] || [];

        synonyms.push(doc);
    });

    _.each(movies, function (docs, original) {
        moviesArray.push({
            original: original,
            docs: docs
        });
    });

    return moviesArray;
};

Template.movie_synonyms.events = {
    'click .remove': function () {
        MovieSynonyms.remove(this._id);
    }
};