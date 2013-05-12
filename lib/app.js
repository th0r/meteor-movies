var WHOLE_DAY_MINUTES = 24 * 60,
    DAY_START_MINUTES = 8 * 60,
    DAY_END_MINUTES = WHOLE_DAY_MINUTES + 3 * 60;

function convertMinuteToMoment(minutes) {
    return moment().startOf('day').minutes(minutes);
}

function getMinutes(date) {
    date = moment(date);

    var minutes = date.hours() * 60 + date.minutes(),
        dayEndMinutes = (DAY_END_MINUTES > WHOLE_DAY_MINUTES) ? DAY_END_MINUTES - WHOLE_DAY_MINUTES : DAY_END_MINUTES;

    if (minutes <= dayEndMinutes) {
        minutes += WHOLE_DAY_MINUTES;
    }

    return minutes;
}

function getShowingsFetchDate(date) {
    date = moment(date);

    var day = moment(date).startOf('day'),
        fetchMinutes = App.getMinutes(date);

    if (fetchMinutes < App.DAY_END_MINUTES) {
        if (fetchMinutes >= App.WHOLE_DAY_MINUTES) {
            day.subtract('days', 1);
        }
    }

    return day;
}

// Setting application namespace
App = {
    WHOLE_DAY_MINUTES: WHOLE_DAY_MINUTES,
    DAY_START_MINUTES: DAY_START_MINUTES,
    DAY_END_MINUTES: DAY_END_MINUTES,

    convertMinuteToMoment: convertMinuteToMoment,
    getMinutes: getMinutes,
    getShowingsFetchDate: getShowingsFetchDate
};

// Setting `moment` language
moment.lang('ru');