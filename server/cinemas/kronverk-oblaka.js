CinemasManager.addCinema('kronverk-oblaka', {

    name: 'Кронверк Синема Облака',
    shortName: 'Облака',

    showingsUrl: 'http://www.kronverkcinema.ru/schedule/city_id_1_delta_days_0.json?_=1365778365703',
    responseType: 'json',
    parseShowingsPage: function (data) {
        var movies = {};
        
        data.movies
            .forEach(function (movie) {
                movie.sessions.forEach(function (session) {
                    // Расписание идет для всех кинотеатров. Нам нужно только для нашего.
                    if (session.cinema_id === 58) {
                        // Добавляем приставку 3D, если это 3D сеанс
                        var movieName = movie.name,
                            sessions = movies[movieName] = movies[movieName] || [],
                            time = session.time.split(':'),
                            hours = +time[0],
                            sessionDate = moment().startOf('day').add({
                                days: (hours < 4) ? 1 : 0,
                                hours: hours,
                                minutes: +time[1]
                            }).toDate();

                        sessions.push({
                            time: sessionDate,
                            is3D: (movie.type === '3D')
                        });
                    }
                });
            });
        
        // Конвертируем в нужный нам формат
        var moviesArray = [];
        _.each(movies, function (sessions, movie) {
            moviesArray.push({
                movie: movie,
                sessions: _.sortBy(sessions, 'time')
            });
        });
        
        return moviesArray;
    }

});