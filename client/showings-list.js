var RATING_SITES_MAP = {
        'kinopoisk': 'Кинопоиск',
        'imdb': 'IMDB'
    },
    RATINGS_HEADERS = ['kinopoisk', 'imdb'],
    RATING_GROUPS = [7, 5, 0];

function getRatingGroup(rating) {
    var i = 0;

    if (!rating) {
        return 'unrated';
    }
    
    while (rating < RATING_GROUPS[i++]) {}
    
    return i;
}

function formRatingArray(ratingObj) {
    return RATINGS_HEADERS.map(function (ratingId) {
        var rating = ratingObj ? ratingObj[ratingId] : null;
        
        return {
            name: RATING_SITES_MAP[ratingId],
            rating: rating,
            ratingGroup: getRatingGroup(rating)
        }
    });
}

Template.sort_icon.sortInfo = function () {
    if (this.sortId) {
        var sorting = Session.get('sorting');
        
        return sorting.by === this.sortId ? sorting : null;
    } else {
        return null;
    }
};

Template.showings_list.headers = function () {
    var headers = [
            {
                name: 'Название',
                sortId: 'movie-name'
            },
            {
                name: 'Сеансы'
            }
        ],
        withRatingHeaders = Template.showings_list.withRatingHeaders();

    if (withRatingHeaders) {
        // Making rating headers
        var i = 1;
        RATINGS_HEADERS.forEach(function (ratingId) {
            headers.splice(i++, 0, {
                name: RATING_SITES_MAP[ratingId],
                sortId: 'rating-' + ratingId,
                defaultSortOrder: -1
            });
        });
    }

    return headers;
};

Template.showings_list.events = {
    'click .showing-list-header.sortable': function () {
        var sorting = Session.get('sorting');

        if (sorting.by === this.sortId) {
            sorting.order *= -1;
        } else {
            sorting.by = this.sortId;
            sorting.order = this.defaultSortOrder || 1;
        }

        Session.set('sorting', sorting);
    }
};

Template.showings_list.withRatingHeaders = function () {
    return !!Movies.findOne({'info.rating': {$exists: true}});
};

Template.showings_list.hasShowings = function () {
    return !!Showings.findOne({});
};

Template.showings_list.showings = function () {
    var movies = {},
        moviesArray = [],
        disabledCinemas = [],
        sorting = Session.get('sorting');

    _.each(Session.get('disabledCinemas') || {}, function (disabled, cinemaId) {
        if (disabled) {
            disabledCinemas.push(cinemaId);
        }
    });

    Showings
        .find({
            cinemaId: {$nin: disabledCinemas}
        })
        .fetch()
        .forEach(function (showing) {
            var sessions = movies[showing.movie] = movies[showing.movie] || [];

            showing.sessions.forEach(function (session) {
                session.cinemaId = showing.cinemaId;
                sessions.push(session);
            });
        });

    // Converting movies to array, sorted by movie name
    _.each(movies, function (sessions, movieName) {
        var movie = Movies.findOne({title: movieName, 'info.rating': {$exists: true}});

        moviesArray.push({
            movie: movieName,
            sessions: sessions,
            rating: formRatingArray(movie && movie.info.rating)
        });
    });

    // Sorting list
    if (sorting.by === 'movie-name') {
        moviesArray = _.sortBy(moviesArray, 'movie');
    } else if (/^rating-(\w+)/.test(sorting.by)) {
        var ratingId = RegExp.$1;

        moviesArray = _.sortBy(moviesArray, function (movie) {
            return movie.rating[RATINGS_HEADERS.indexOf(ratingId)].rating;
        });
    }

    if (sorting.order === -1) {
        moviesArray = moviesArray.reverse();
    }

    return moviesArray;
};

Template.movie_name.rendered = function () {
    var self = this,
        $movie = $(this.find('.movie'));

    $movie
        .draggable({
            addClasses: false,
            axis: 'y',
            containment: $movie.closest('.showings-list'),
            cursor: 'move',
            opacity: 0.5,
            revert: 'invalid',
            revertDuration: 300,
            scope: 'movie-name'
        })
        .droppable({
            hoverClass: 'drop-allowed',
            addClasses: false,
            scope: 'movie-name',
            tolerance: 'pointer',
            drop: function (event, ui) {
                var originalName = self.data.movie,
                    synonym = ui.draggable.data('movie');

                MovieSynonyms.insert({
                    from: synonym,
                    to: originalName
                });
            }
        });
};

Template.movie_name.movieUrl = function () {
    var movie = Movies.findOne({title: this.movie});

    return movie && movie.info ? movie.info.url : 'http://www.kinopoisk.ru/index.php?first=yes&kp_query=' + encodeURIComponent(this.movie);
};

Template.movie_info.movie = function () {
    var movie = Movies.findOne({title: this.movie});
    
    return movie && movie.info ? movie : null;
};

Template.movie_rating.ratings = function () {
    return formRatingArray(this.rating);
};

Template.movie_info.events = {
    
    'click .movie-info-icon': function (event, tmpl) {
        var $dialog = tmpl.$dialog;
        
        if (!$dialog) {
            var iconNode = event.target,
                $dialogContent = $(iconNode).find('.movie-info');

            $dialog = tmpl.$dialog = $dialogContent
                .dialog({
                    autoOpen: false,
                    position: {
                        my: 'left center',
                        at: 'right center',
                        of: iconNode
                    },
                    minWidth: 350,
                    width: 550
                });
        }
        
        if ($dialog.dialog('isOpen')) {
            $dialog.dialog('close');
        } else {
            $dialog.dialog('open');
        }
    }
    
};

Template.showing_times.times = function () {
    var from = Session.get('showingsFrom') || Number.NEGATIVE_INFINITY,
        to = Session.get('showingsTo') || Number.POSITIVE_INFINITY;

    return this.sessions
        .filter(function (showing) {
            return showing.time >= from && showing.time <= to;
        })
        .sort(function (showing1, showing2) {
            return showing1.time - showing2.time;
        });
};

Template.showing_times.time = function () {
    return moment(this.time).format('HH:mm');
};