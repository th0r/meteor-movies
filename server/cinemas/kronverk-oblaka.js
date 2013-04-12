CinemasManager.addCinema('kronverk-oblaka', {
    
    name: 'Кронверк Синема (Облака)',
    
    showingsUrl: 'http://www.kronverkcinema.ru/schedule/city_id_1_delta_days_0.json?_=1365778365703',
    
    responseType: 'json',
    
    parseShowingsPage: function (data) {
        return data.movies
            .filter(function (movie) {
                return movie.sessions.length;
            })
            .map(function (movie) {
                return {
                    movie: movie.name,
                    showings: movie.sessions.map(function (session) {
                        var time = session.time.split(':'),
                            hours = +time[0];
        
                        return moment().startOf('day').add({
                            days: (hours < 4) ? 1 : 0,
                            hours: hours,
                            minutes: +time[1]
                        }).toDate();
                    })
                }
        });
    }
    
});