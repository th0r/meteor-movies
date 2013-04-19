Template.showings_list.showings = function () {
    var movies = {},
        moviesArray = [],
        disabledCinemas = [];

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
    _.each(movies, function (sessions, movie) {
        moviesArray.push({
            movie: movie,
            sessions: sessions
        });
    });

    return _.sortBy(moviesArray, 'movie');
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
    return 'http://www.kinopoisk.ru/index.php?first=yes&kp_query=' + encodeURIComponent(this.movie);
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