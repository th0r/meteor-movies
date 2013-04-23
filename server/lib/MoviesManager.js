var IMDB_RATING_REGEXP = /\s(\d\.\d\d)\s/,
    HTML_TAGS = /<\/?\s*(.*?)\s*\/?>/ig,
    SAFE_TAGS = {
        'br': 1,
        'p': 1
    },
    POSTER_PROXY_PREFIX = '/poster/',
    Fiber = Npm.require('fibers'),
    request = Npm.require('request'),
    connect = Npm.require('connect'),
    app = __meteor_bootstrap__.app;

// Adding poster images proxy to kinopoisk.ru
app.use(POSTER_PROXY_PREFIX, function (req, res) {
    var kinopoiskSrc = req.url.slice(1);
    
    if (kinopoiskSrc) {
        request({
            url: kinopoiskSrc,
            headers: {
                'host': 'st.kinopoisk.ru'
            }
        }).pipe(res);
    } else {
        res.end(404);
    }
});

MoviesManager = {
    
    fetching: {},
    
    getMovieUrl: function (title) {
        return 'http://www.kinopoisk.ru/index.php?first=yes&kp_query=' + encodeURIComponent(title);
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
                var converter,
                    html;

                if (err || res.statusCode !== 200) {
                    err = err || 'response with code ' + response.statusCode + ' returned';
                    console.log('Error getting info for movie "' + title + '": ', err);
                } else {
                    // Converting response to utf8
                    converter = new iconv.Iconv('CP1251', 'UTF8//TRANSLIT//IGNORE');
                    html = converter.convert(new Buffer(body, 'binary')).toString();

                    jsdom.env(
                        html,
                        function (errors, window) {
                            if (errors) {
                                console.log('Error while converting movie page HTML into DOM:', errors);
                            } else {
                                try {
                                    self._parseMovieInfo(window.document, title, docId);
                                } catch(e) {
                                    console.log('Error while parsing info for movie "' + title + '"', e);
                                }
                            }
                        }
                    );
                }
        });
        
    },
    
    _parseMovieInfo: function (doc, title, docId) {
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
            poster: posterElem && posterElem.src ? POSTER_PROXY_PREFIX + posterElem.src : null,
            description: description || null,
            rating: {
                kinopoisk: ratingKinopoiskElem ? parseFloat(ratingKinopoiskElem.textContent) || null : null,
                imdb: ratingImdbElem ? parseFloat(ratingImdb[1]) || null : null
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