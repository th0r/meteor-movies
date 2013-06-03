var SESSION_3D = /\s3D$/;

CinemasManager.addCinema('luxor-vegas', {

    name: 'Люксор Vegas',
    shortName: 'Vegas',

    showingsUrl: 'http://www.luxorfilm.ru/cinema/vegas/',
    parseShowingsPage: function ($html) {
        return $html.find('.cinema_time_info').map(function () {
            var is3D = false,
                movieName = this.find('h3 a').text()
                    .trim()
                    .replace(SESSION_3D, function () {
                        is3D = true;
                        
                        return '';
                    });

            return {
                movie: movieName,
                sessions: this.find('.time_of_day_shedule .shedule-data')
                    .map(function (i, elem) {
                        var time = elem.children[0].data.trim().split(':'),
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