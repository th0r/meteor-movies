var IMDB_RATING_REGEXP = /\s(\d\.\d\d)\s/,
    HTML_TAGS = /<\/?\s*(.*?)\s*\/?>/ig,
    SAFE_TAGS = {
        'br': 1,
        'p': 1
    },
    MOVIE_INFO_OVERDUE_HOURS = 6,
    MOVIE_INFO_OVERDUE_CHECK_INTERVAL_HOURS = 1,
    Fiber = Npm.require('fibers'),
    request = Npm.require('request'),
    kinopoiskPosterProxy = new ImageProxy({
        path: '/poster',
        param: 'src',
        modifier: function (request) {
            request.headers = {
                'host': 'st.kinopoisk.ru'
            }
        }
    });

MoviesManager = {

    fetching: {},

    getMovieUrl: function (title) {
        var toYear = moment().year();

        return 'http://www.kinopoisk.ru/index.php?level=7&m_act[what]=content&m_act[content_find]=film&first=yes&m_act[find]=' + encodeURIComponent(title) + '&m_act[from_year]=' + (toYear - 1) + '&m_act[to_year]=' + toYear;
    },

    addMovie: function (title) {
        var movie = Movies.findOne({title: title}),
            id = movie && movie._id;

        if (!movie) {
            movie = {
                title: title,
                isNew: true,
                dateAdded: new Date()
            };
            id = Movies.insert(movie);
        }

        if (!movie.info) {
            this.updateMovieInfo(id);
        }
    },

    /**
     * @param {String|Object} movie  Either movie id or movie document.
     * @private
     */
    updateMovieInfo: function (movie) {
        if (typeof movie === 'string') {
            movie = Movies.findOne(movie);
        }

        if (movie && !this.fetching[movie.title]) {
            this._fetchMovieInfo(movie.title)
                .done(function (info) {
                    Fiber(function () {
                        Movies.update(movie._id, {
                            $set: {
                                info: info,
                                dateInfoUpdated: new Date()
                            }
                        });
                    }).run();
                })
                .fail(function (errorMessage, error) {
                    console.log(errorMessage + ': ', error);
                });
        }
    },

    _fetchMovieInfo: function (title) {
        var self = this,
            dfd = this.fetching[title],
            errorMessage;

        if (!dfd) {
            dfd = this.fetching[title] = new Du.Deferred();
            dfd.always(function () {
                delete self.fetching[title];
            });

            request(
                {
                    url: this.getMovieUrl(title),
                    headers: {
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:20.0) Gecko/20100101 Firefox/20.0',
                        'host': 'www.kinopoisk.ru',
                        'accept-language': 'ru-RU,ru',
                        'accept': 'text/html'
                    },
                    encoding: 'binary'
                }, function (err, res, body) {
                    var pageHTML,
                        movieUrl,
                        movieInfo;

                    if (err || res.statusCode !== 200) {
                        err = err || 'response with code ' + response.statusCode + ' returned';
                        errorMessage = 'Error getting info for movie "' + title + '"';
                        dfd.rejectWith(self, errorMessage, err);
                    } else {
                        movieUrl = res.request.uri.href;
                        // Converting response to utf8
                        pageHTML = iconv.decode(new Buffer(body, 'binary'), 'win1251');

                        try {
                            movieInfo = self._parseMovieInfo($(pageHTML));
                            movieInfo.url = movieUrl;
                            dfd.resolveWith(self, movieInfo);
                        } catch (e) {
                            errorMessage = 'Error while parsing info for movie "' + title + '"';
                            dfd.rejectWith(self, errorMessage, e);
                        }
                    }
            });
        }

        return dfd;
    },

    _parseMovieInfo: function ($doc) {
        var posterSrc = $doc.find('.popupBigImage img').attr('src'),
            description = $doc.find('.brand_words')
                .html()
                .replace(HTML_TAGS, function (match, tagName) {
                    return SAFE_TAGS.hasOwnProperty(tagName.toLowerCase()) ? match : '';
                }),
            $ratingKinopoisk = $doc.find('.rating_ball'),
            $ratingImdb = $doc.find('#block_rating .block_2 .div1 + div'),
            ratingImdb = $ratingImdb.length ? IMDB_RATING_REGEXP.exec($ratingImdb.text()) : null;

        return {
            poster: posterSrc ? kinopoiskPosterProxy.getImageUrl(posterSrc) : null,
            description: description || null,
            rating: {
                kinopoisk: parseFloat($ratingKinopoisk.text()) || null,
                imdb: ratingImdb ? parseFloat(ratingImdb[1]) || null : null
            }
        };
    }

};

// Periodic movie info updates
Meteor.setInterval(function () {
    console.log('Movies info update...');
    var infoOverdueDate = moment().subtract('hours', MOVIE_INFO_OVERDUE_HOURS).toDate(),
        moviesUpdatedCount = 0;

    Movies
        .find({dateInfoUpdated: {$lt: infoOverdueDate}})
        .forEach(function (movie) {
            console.log('Updating info for movie "' + movie.title + '"...');
            moviesUpdatedCount++;
            MoviesManager.updateMovieInfo(movie);
        });

    if (!moviesUpdatedCount) {
        console.log('All info is up to date');
    }

}, MOVIE_INFO_OVERDUE_CHECK_INTERVAL_HOURS * 60 * 60 * 1000);