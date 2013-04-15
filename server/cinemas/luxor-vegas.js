var SESSION_3D = /\s3D$/;

CinemasManager.addCinema('luxor-vegas', {

    name: 'Люксор Vegas',
    shortName: 'Vegas',

    showingsUrl: 'http://www.luxorfilm.ru/cinema/vegas/',
    parseShowingsPage: function (document) {
        var showingsRows = _.toArray(document.querySelectorAll('.cinema_time_info'));

        return showingsRows.map(function (rowElem) {
            var is3D = false,
                movieName = rowElem.querySelector('h3 a').textContent
                    .trim()
                    .replace(SESSION_3D, function () {
                        is3D = true;
                        
                        return '';
                    });
            
            return {
                movie: movieName,
                sessions: _.toArray(rowElem.querySelectorAll('.time_of_day_shedule .shedule-data'))
                    .map(function (timeElem) {
                        var time = timeElem.firstChild.textContent.trim().split(':'),
                            hours = +time[0],
                            sessionDate = moment().startOf('day').add({
                                days: (hours < 4) ? 1 : 0,
                                hours: hours,
                                minutes: +time[1]
                            }).toDate();

                        return {
                            time: sessionDate,
                            is3D: is3D
                        };
                    })
            }
        });
    }

});