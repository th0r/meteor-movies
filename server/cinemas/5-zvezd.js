CinemasManager.addCinema('5-zvezd', {

    name: '5 звезд (Бирюлево)',
    shortName: '5 звезд',

    showingsUrl: 'http://www.5zvezd.ru/ajax/scheduleFilter.php',
    requestType: 'POST',
    requestParams: function () {
        return {
            headers: {
                'Host': 'www.5zvezd.ru',
                'Referer': 'http://www.5zvezd.ru/schedule/',
                'Cookie': 'BITRIX_SM_ACTUAL_CITY_ID_1=2; BITRIX_SM_COORDINATE_X=55.755768; BITRIX_SM_COORDINATE_Y=37.617671; BITRIX_SM_ACTUAL_CINEMA_ID=3076',
            },
            data: {
                DATE: App.getShowingsFetchDate().format('DD.MM.YYYY')
            }
        }
    },
    
    parseShowings: function ($html) {
        return $html.filter('.sh_film').map(function () {
            var movieName = this.find('.sh_film_name h5 a').text().trim();

            return {
                movie: movieName,
                sessions: this.find('.sh_film_cimena .sh_film_time')
                    .find('span.disable, span.dotted')
                    .map(function () {
                        var time = this.text().trim().trim().split(':'),
                            hours = +time[0],
                            sessionDate = moment().startOf('day').add({
                                days: (hours < 4) ? 1 : 0,
                                hours: hours,
                                minutes: +time[1]
                            }).toDate();

                        return {
                            time: sessionDate,
                            is3D: false
                        };
                    })
            }
        });
    }

});
