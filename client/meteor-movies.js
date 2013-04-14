function updateTimeRange(values) {
    var from = moment().hours(0).seconds(0).minutes(values[0]),
        to = moment().hours(0).seconds(0).minutes(values[1]);

    $('#timeRangeText').text('С ' + from.format('HH:mm') + ' по ' + to.format('HH:mm'));
    Session.set('showingsFrom', +from);
    Session.set('showingsTo', +to);
}

Meteor.startup(function () {
    var now = moment(),
        dayStart = 9 * 60,
        dayEnd = (24 + 3) * 60,
        step = 30,
        initialValues = [Math.ceil((now.hours() * 60 + now.minutes()) / step) * step, dayEnd];

    $('#timeRange').slider({
        range: true,
        min: dayStart,
        max: dayEnd,
        values: initialValues,
        step: step,
        orientation: 'horizontal',
        slide: function (event, ui) {
            updateTimeRange(ui.values);
        }
    });

    updateTimeRange(initialValues);
});

Template.showings_list.showings = function () {
    var movies = {},
        moviesArray = [];

    Showings.find({}).fetch().forEach(function (showing) {
        var sessions = movies[showing.movie] = movies[showing.movie] || [];

        showing.sessions.forEach(function (time) {
            sessions.push({
                time: time,
                cinemaId: showing.cinemaId
            });
        });
    });

    // Converting movies to array, sorted by movie name
    _.each(movies, function (sessions, movie) {
        moviesArray.push({
            movie: movie,
            sessions: sessions
        });
    });
    moviesArray.sort(function (movie1, movie2) {
        if (movie1.movie < movie2.movie) {
            return -1;
        } else {
            return 1;
        }
    });

    return moviesArray;
};

Template.showing_times.times = function () {
    var from = Session.get('showingsFrom') || Number.NEGATIVE_INFINITY,
        to = Session.get('showingsTo') || Number.POSITIVE_INFINITY;

    return this.sessions
            .filter(function (showing) {
                return showing.time >= from && showing.time <= to;
            })
            .sort(function (showing1, showing2) {
                return showing1.time - showing2.time;
            });
};

Template.showing_times.time = function () {
    return moment(this.time).format('HH:mm');
};