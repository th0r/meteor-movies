var WHOLE_DAY_MINUTES = 24 * 60,
    DAY_START_MINUTES = 8 * 60,
    DAY_END_MINUTES = WHOLE_DAY_MINUTES + 3 * 60,
    ERROR_CODE_IN_MESSAGE = /\s*\[\d+]$/;

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
        fetchMinutes = getMinutes(date);

    if (fetchMinutes < DAY_END_MINUTES) {
        if (fetchMinutes >= WHOLE_DAY_MINUTES) {
            day.subtract('days', 1);
        }
    }

    return day;
}

// Setting application namespace
_.extend(App, {
    WHOLE_DAY_MINUTES: WHOLE_DAY_MINUTES,
    DAY_START_MINUTES: DAY_START_MINUTES,
    DAY_END_MINUTES: DAY_END_MINUTES,
    
    convertMinuteToMoment: convertMinuteToMoment,
    getMinutes: getMinutes,
    getShowingsFetchDate: getShowingsFetchDate,

    stripErrorCode: function (error) {
        if (error && error.message) {
            error = error.message;
        }

        if (error) {
            error = error.replace(ERROR_CODE_IN_MESSAGE, '');
        }

        return error || 'Unknown error';
    }
});

// Setting `moment` language
moment.lang('ru');