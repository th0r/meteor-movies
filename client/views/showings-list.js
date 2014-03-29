var RATING_SITES_MAP = {
        'kinopoisk': 'Кинопоиск',
        'imdb': 'IMDB'
    },
    RATINGS_HEADERS = ['kinopoisk', 'imdb'],
    RATING_GROUPS = [7, 5, 0],
    SORT_ICONS_MAP = {
        '-1': 'ui-icon-circle-triangle-n',
        '1': 'ui-icon-circle-triangle-s',
        'new': 'ui-icon-notice'
    },
    SORTING_BY_NAME_ORDER = ['new', 1, -1],
    DAYS_MOVIE_IS_NEW = 3;

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
    var sortInfo = null;
    
    if (this.sortId) {
        var sorting = Session.get('sorting', true);
        
        if (sorting.by === this.sortId) {
            sortInfo = {
                iconClass: SORT_ICONS_MAP[sorting.order]
            }
        }
    }
    
    return sortInfo;
};

Template.showings_list.headers = function () {
    var headers = [
            {
                // Header for "new" column
                name: null
            },
            {
                name: 'Название',
                sortId: 'movie-name',
                defaultSortOrder: 'new'
            },
            {
                name: 'Сеансы'
            }
        ],
        withRatingHeaders = Template.showings_list.withRatingHeaders();

    if (withRatingHeaders) {
        // Making rating headers
        var i = 2;
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
        var sorting = Session.get('sorting', true),
            currentOrderIndex;

        if (sorting.by === this.sortId) {
            if (this.sortId === 'movie-name') {
                // Toggling through ordering values
                currentOrderIndex = SORTING_BY_NAME_ORDER.indexOf(sorting.order);
                sorting.order = SORTING_BY_NAME_ORDER[(currentOrderIndex + 1) % SORTING_BY_NAME_ORDER.length];
            } else {
                sorting.order *= -1;
            }
        } else {
            sorting.by = this.sortId;
            sorting.order = this.defaultSortOrder || 1;
        }

        Session.set('sorting', sorting, true);
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
        moviesFilter = new RegExp(Du.escapeRegexp(Session.get('moviesFilter')), 'i'),
        disabledCinemas = [],
        sorting = Session.get('sorting', true),
        now = moment();

    _.each(Session.get('disabledCinemas', true) || {}, function (disabled, cinemaId) {
        if (disabled) {
            disabledCinemas.push(cinemaId);
        }
    });

    Showings
        .find({
            cinemaId: {$nin: disabledCinemas},
            movie: {$regex: moviesFilter}
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
        var movie = Movies.findOne({title: movieName}),
            dateAdded = movie && movie.dateAdded;

        moviesArray.push({
            movie: movieName,
            dateAdded: dateAdded,
            isNew: !dateAdded || now.diff(dateAdded, 'days') < DAYS_MOVIE_IS_NEW,
            sessions: sessions,
            rating: formRatingArray(movie && movie.info && movie.info.rating)
        });
    });

    // Sorting list
    if (sorting.by === 'movie-name') {
        moviesArray = _.sortBy(moviesArray, (sorting.order === 'new') ? 'dateAdded' : 'movie');
    } else if (/^rating-(\w+)/.test(sorting.by)) {
        var ratingId = RegExp.$1;

        moviesArray = _.sortBy(moviesArray, function (movie) {
            return movie.rating[RATINGS_HEADERS.indexOf(ratingId)].rating;
        });
    }

    if (sorting.order === -1 || sorting.order === 'new') {
        moviesArray = moviesArray.reverse();
    }

    return moviesArray;
};

// ==================================== Movie name (drag/drop to create synonyms) ====================================

function destroyDraggable($elem) {
    $elem
        .draggable('destroy')
        .droppable('destroy');
}

Template.movie_name.rendered = function () {
    var self = this,
        $movie = this.$movie = $(this.find('.movie'));
    
    this.dragHandlerBound = false;
    this.dragHandlerBinder = Meteor.autorun(function () {
        var user = Meteor.user(),
            bindingNeeded = !!(user && user.admin);

        if (bindingNeeded !== self.dragHandlerBound) {
            self.dragHandlerBound = bindingNeeded;
            if (bindingNeeded) {
                $movie
                    .draggable({
                        addClasses: false,
                        axis: 'y',
                        containment: $movie.closest('.showings-list'),
                        cursor: 'move',
                        opacity: 0.5,
                        revert: true,
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
            } else {
                destroyDraggable($movie);
            }
        }
    });
};

Template.movie_name.destroyed = function () {
    this.dragHandlerBinder.stop();
};

Template.movie_name.movieUrl = function () {
    var movie = Movies.findOne({title: this.movie});

    return movie && movie.info ? movie.info.url : 'http://www.kinopoisk.ru/index.php?first=yes&kp_query=' + encodeURIComponent(this.movie);
};

// ==================================== Movie info ====================================

Template.movie_info.movie = function () {
    var movie = Movies.findOne({title: this.movie});
    
    if (movie && movie.info) {
        movie.dateInfoUpdatedText = 'Информация обновлена ' + moment(movie.dateInfoUpdated).calendar().toLowerCase();
        
        return movie
    } else {
        return null;
    }
};

// ==================================== Movie rating ====================================

Template.movie_info.events = {

    'click .movie-info-icon': function (event, tmpl) {
        var data = this,
            $dialog = tmpl.$dialog;
        
        if (!$dialog) {
            var iconNode = event.target,
                $dialogContent = $(Template.movie_info_content.extend({
                    data: function () { return data; }
                }).render().toHTML()),
                position = {
                    my: 'left center',
                    at: 'right center',
                    of: iconNode
                };
                    
            $dialog = tmpl.$dialog = $dialogContent
                .dialog({
                    autoOpen: false,
                    position: position,
                    minWidth: 350,
                    width: 550,
                    open: function () {
                        $dialogContent.find('img')
                            .one('load', function () {
                                $dialog.dialog('option', 'position', position);
                            });
                    },
                    close: function () {
                        tmpl.$dialog.remove();
                        tmpl.$dialog = null;
                    }
                });
        }

        if ($dialog.dialog('isOpen')) {
            $dialog.dialog('close');
        } else {
            $dialog.dialog('open');
        }
    }

};

// ==================================== Movie info ratings ====================================

Template.movie_rating.ratings = function () {
    return formRatingArray(this.rating);
};

// ==================================== Showing times ====================================

Template.showing_times.times = function () {
    var from = +App.convertMinuteToMoment(Session.get('showingsFrom', true)),
        to = +App.convertMinuteToMoment(Session.get('showingsTo', true));

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