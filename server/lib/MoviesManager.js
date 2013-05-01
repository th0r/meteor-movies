var IMDB_RATING_REGEXP = /\s(\d\.\d\d)\s/,
    HTML_TAGS = /<\/?\s*(.*?)\s*\/?>/ig,
    SAFE_TAGS = {
        'br': 1,
        'p': 1
    },
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

        if (movie && (movie.info || this.fetching[id])) {
            return;
        }

        if (!movie) {
            id = Movies.insert({
                title: title
            });
        }

        this._fetchMovieInfo(title, id);
    },

    _fetchMovieInfo: function (title, docId) {
        var self = this;

        this.fetching[docId] = true;

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
                var html,
                    movieUrl;

                if (err || res.statusCode !== 200) {
                    err = err || 'response with code ' + response.statusCode + ' returned';
                    console.log('Error getting info for movie "' + title + '": ', err);
                } else {
                    movieUrl = res.request.uri.href;
                    // Converting response to utf8
                    html = iconv.decode(new Buffer(body, 'binary'), 'win1251');

                    jsdom.env(
                        html,
                        function (errors, window) {
                            if (errors) {
                                console.log('Error while converting movie page HTML into DOM:', errors);
                            } else {
                                try {
                                    self._parseMovieInfo(window.document, title, docId, movieUrl);
                                } catch(e) {
                                    console.log('Error while parsing info for movie "' + title + '"', e);
                                }
                            }
                        }
                    );
                }
        });

    },

    _parseMovieInfo: function (doc, title, docId, movieUrl) {
        var posterElem = doc.querySelector('.popupBigImage img'),
            descriptionElem = doc.querySelector('.brand_words'),
            description,
            ratingKinopoiskElem = doc.querySelector('.rating_ball'),
            ratingImdbElem = doc.querySelector('#block_rating .block_2 .div1 + div'),
            ratingImdb = ratingImdbElem ? IMDB_RATING_REGEXP.exec(ratingImdbElem.textContent) : null;

        if (descriptionElem) {
            description = descriptionElem.innerHTML.replace(HTML_TAGS, function (match, tagName) {
                return SAFE_TAGS.hasOwnProperty(tagName.toLowerCase()) ? match : '';
            });
        }

        var info = {
            url: movieUrl,
            poster: posterElem && posterElem.src ? kinopoiskPosterProxy.getImageUrl(posterElem.src) : null,
            description: description || null,
            rating: {
                kinopoisk: ratingKinopoiskElem ? parseFloat(ratingKinopoiskElem.textContent) || null : null,
                imdb: ratingImdb ? parseFloat(ratingImdb[1]) || null : null
            }
        };

        Fiber(function () {
            Movies.update(docId, {
                $set: {
                    info: info
                }
            });
        }).run();

    }

};