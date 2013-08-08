var REQUESTS_TIMEOUT = 30 * 1000,
    SESSION_TYPE = /\s(2D|3D)$/,
    PHP_SESSION_ID = /^PHPSESSID=([a-f0-9]+)/,
    SESSIONS_RESPONSE_TEST = /array_films/,
    SHOWINGS_SCRIPT_SRC_VALID_LINE = /^array_films/,
    vm = Npm.require('vm');

CinemasManager.addCinema('matrix-domodedovo', {

    name: 'Матрица Домодедово',
    shortName: 'Матрица',

    showingsPageUrl: 'http://www.matrix-cinema.ru/?page=multiplexes&name=domodedovo',
    showingsDataUrl: 'http://www.matrix-cinema.ru/main/guru.php',
    
    grabber: function (dfd) {
        var self = this;
        
        Meteor.http.get(this.showingsPageUrl, { timeout: REQUESTS_TIMEOUT }, function (error, result) {
            var phpSessionId,
                showingsDate;

            if (error) {
                dfd.reject(error);
            } else {
                // Searching for PHP session value
                result.headers['set-cookie'].some(function (cookie) {
                    if (PHP_SESSION_ID.test(cookie)) {
                        phpSessionId = RegExp.$1;
                        
                        return true;
                    }
                });

                if (phpSessionId) {
                    showingsDate = App.getShowingsFetchDate();

                    Meteor.http.get(self.showingsDataUrl, {
                        timeout: REQUESTS_TIMEOUT,
                        params: {
                            type: 'showtheafilms',
                            actions: 'thea',
                            name: '100_111_109_111_100_101_100_111_118_111',
                            date: showingsDate.format('YYYY.') + showingsDate.month() + showingsDate.format('.D|H.m.s'),
                            PHPSESSID: phpSessionId
                        },
                        headers: {
                            'Referer': self.showingsPageUrl
                        }
                    }, function (error, result) {
                        if (error) {
                            dfd.reject(error);
                        } else if (!SESSIONS_RESPONSE_TEST.test(result.content)) {
                            dfd.reject('Malformed response from matrix cinema: ', result);
                        } else {
                            dfd.resolve(result.content);
                        }
                    });
                } else {
                    dfd.reject('Cannot find PHP Session ID in matrix cinema page to request showings');
                }
            }
        });
    },

    parseShowings: function (showingsScriptSrc) {
        var sandbox = {},
            showingsDate = App.getShowingsFetchDate(),
            showings = [];
        
        showingsScriptSrc = showingsScriptSrc
            .split(/\n+/)
            .filter(function (line) {
                return SHOWINGS_SCRIPT_SRC_VALID_LINE.test(line);
            })
            .join('\n');
        
        vm.runInNewContext(showingsScriptSrc, sandbox);
        sandbox.array_films.forEach(function (movie) {
            var is3D = false,
                movieName = movie.Name.replace(SESSION_TYPE, function (match, type) {
                    is3D = (type === '3D');
                    
                    return '';
                }),
                sessionsByDay = movie.Seances,
                sessions = [];

            for (var day in sessionsByDay) {
                sessionsByDay[day].forEach(function (session) {
                    if (moment(session.ShowDate, 'DD.MM.YYYY').isSame(showingsDate)) {
                        // This showing is for current showings day
                        sessions.push({
                            time: moment(session.ShowDateTime, 'DD/MM/YYYY HH:mm:dd').toDate(),
                            is3D: is3D
                        });
                    }
                });
            }
            
            if (sessions.length) {
                showings.push({
                    movie: movieName,
                    sessions: sessions
                });
            }
        });

        return showings;
    }

});