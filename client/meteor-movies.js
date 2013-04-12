function updateTimeRange(values) {
    var from = moment().hours(0).seconds(0).minutes(values[0]),
        to = moment().hours(0).seconds(0).minutes(values[1]);

    $('#timeRangeText').text('С ' + from.format('HH:mm') + ' по ' + to.format('HH:mm'));
    Session.set('showingsFrom', +from);
    Session.set('showingsTo', +to);
}

Meteor.startup(function () {
    var now = moment(),
        step = 30,
        initialValues = [Math.ceil((now.hours() * 60 + now.minutes()) / step) * step, 1439];
    
    $('#timeRange').slider({
        range: true,
        min: 0,
        max: 1439,
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
    return Showings.find({});
};

Template.showing_times.times = function () {
    var from = Session.get('showingsFrom') || Number.NEGATIVE_INFINITY,
        to = Session.get('showingsTo') || Number.POSITIVE_INFINITY;
    
    return this.showings
        .filter(function (showing) {
            return showing >= from && showing <= to;
        })
        .map(function (showing) {
            return moment(showing).format('HH:mm');
        })
        .join(' ');
};

Template.showings_controls.events = {
    'click #refreshShowings': function () {
        Meteor.call('refreshShowings');
    }
};