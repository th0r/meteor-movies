CinemasManager.addCinema('kronverk-oblaka', {

    name: 'Кронверк Синема Облака',
    shortName: 'Облака',

    showingsUrl: 'http://www.kronverkcinema.ru/cinemas/',
    requestParams: {
        headers: {
            'Host': 'www.kronverkcinema.ru',
            'Cookie': 'city=1;kinoCinemaId=182'
        }
    },
    responseType: 'html',
    
    parseShowings: function ($html) {
        return $html.find('.cinemas .item').map(function () {
            var movieName = this.find('.name').text().trim();

            return {
                movie: movieName,
                sessions: this.find('.date.active .session-time.hide320')
                    .map(function () {
                        var time = this.find('a')[0].children[0].data.trim().split(':'),
                            is3D = !!this.find('.marker.marker-3d').length,
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
