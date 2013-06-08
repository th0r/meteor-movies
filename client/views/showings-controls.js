// ==================================== Showings controls ====================================

Template.showings_controls.rendered = function () {
    var self = this,
        $tabs = this.$tabs;

    if ($tabs) {
        $tabs.tabs('destroy');
    } else {
        $tabs = this.$tabs = $(this.find('.control-tabs'));
    }
    $tabs.tabs({
        create: function () {
            if (self.activeTab) {
                $tabs.tabs('option', 'active', self.activeTab);
            }
        },
        activate: function () {
            self.activeTab = $tabs.tabs('option', 'active');
        }
    });
};

// ==================================== Cinemas List ====================================

Template.cinemas_list.preserve(['.cinemas']);

Template.cinemas_list.created = function () {
    var self = this;

    // Automatically refreshing buttonset widget
    this.buttonRefreshHandler = Deps.autorun(function () {
        Session.get('disabledCinemas', true);
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
        var disabledCinemas = Session.get('disabledCinemas', true);

        disabledCinemas[this.id] = !event.currentTarget.checked;
        Session.set('disabledCinemas', disabledCinemas, true);
    }
};

Template.cinemas_list.cinemas = function () {
    var cinemas = Cinemas.find({}).fetch(),
        disabledCinemas;

    disabledCinemas = Session.get('disabledCinemas', true);

    cinemas.forEach(function (cinema) {
        cinema.disabled = !Showings.findOne({cinemaId: cinema.id});
        cinema.selected = !cinema.disabled && !disabledCinemas[cinema.id];
        cinema.lastUpdate = cinema.fetchDate ? moment(cinema.fetchDate).calendar().toLowerCase() : null;
    });

    return cinemas;
};

// ==================================== Time slider ====================================

var TIME_STEP_MINUTES = 30,
    DAY_START_MINUTES = App.DAY_START_MINUTES,
    DAY_END_MINUTES = App.DAY_END_MINUTES,
    SLIDER_AUTOUPDATE_INTERVAL_MINUTES = 0.1;

function getClosestMinute() {
    var nowMinutes = App.getMinutes();

    if (nowMinutes > DAY_END_MINUTES) {
        nowMinutes = DAY_START_MINUTES;
    }

    return Math.ceil(nowMinutes / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
}

function updateTimeRange(values, $timeText) {
    var from = App.convertMinuteToMoment(values[0]),
        to = App.convertMinuteToMoment(values[1]);

    $timeText.text('С ' + from.format('HH:mm') + ' по ' + to.format('HH:mm'));
    Session.set('showingsFrom', values[0], true);
    Session.set('showingsTo', values[1], true);
}

function autoUpdateTime($slider) {
    if (Session.get('autoTime', true)) {
        var values = $slider.slider('values'),
            startValue = getClosestMinute(),
            endValue = Math.min(DAY_END_MINUTES, Math.max(values[1], startValue));

        $slider.slider('values', [startValue, endValue]);
    }
}

Template.time_slider.rendered = function () {
    var $slider = this.$slider;

    if (!$slider) {
        var from = Session.get('showingsFrom', true),
            to = Session.get('showingsTo', true),
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
                    Session.set('autoTime', false, true);
                }
                updateTimeRange(ui.values, $timeText);
            }
        });

        updateTimeRange(initialValues, $timeText);

        // Auto time checkbox update
        this.autoTimeUpdateHandler = Deps.autorun(function () {
            var autoTime = !!Session.get('autoTime', true);

            autoTimeCheckbox.checked = !!Session.get('autoTime', true);
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
        Session.set('autoTime', event.currentTarget.checked, true);
    }
};

// ==================================== Movies filter ====================================

var setMovieFilter = function (value) {
        Session.set('moviesFilter', value);
    },
    clearMovieFilter = function (tmpl) {
        setMovieFilterDelayed.reset();
        $(tmpl.find('#moviesFilter')).val('');
        setMovieFilter('');
    },
    setMovieFilterDelayed = Du.debounce(setMovieFilter, 200);

Template.movies_filter.events = {

    'input, keyup #moviesFilter': function (event, tmpl) {
        if (event.type === 'keyup' && event.keyCode === 27) {
            clearMovieFilter(tmpl);
        } else {
            setMovieFilterDelayed(event.target.value);
        }
    },

    'click .clear-filter': function (event, tmpl) {
        clearMovieFilter(tmpl);
    }
};

Template.movies_filter.moviesFilter = function () {
    return Session.get('moviesFilter');
};

// ==================================== Settings ====================================

// ==================================== Notifications ====================================

Template.notification_settings.events = {

    'change #emailNewMovies': function (event) {
        Meteor.call('updateUserNotifications', {
            newMovies: event.target.checked
        });
    }

};

Template.notification_settings.notifyAbout = function () {
    var user = Meteor.user();

    return user && user.notifyAbout || {};
};