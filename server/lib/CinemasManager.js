var Fibers = Npm.require('fibers'),
    REQUESTS_TIMEOUT = 30 * 1000,
    SHOWINGS_OVERDUE_HOURS = 4;

CinemasManager = {

    cinemas: {},

    grabbers: {
        'html': function (dfd) {
            HTTP.get(_.result(this, 'showingsUrl'), { timeout: REQUESTS_TIMEOUT }, function (error, result) {
                if (error) {
                    dfd.reject(error);
                } else {
                    dfd.resolve($(result.content));
                }
            });
        },
        'json': function (dfd) {
            HTTP.get(_.result(this, 'showingsUrl'), { timeout: REQUESTS_TIMEOUT }, function (error, result) {
                if (error || !result.data) {
                    dfd.reject(error);
                } else {
                    dfd.resolve(result.data);
                }
            });
        }
    },

    addCinema: function (id, cinema) {
        this.cinemas[id] = cinema;
        cinema.id = id;

        // Filling `Cinemas` collection
        Meteor.startup(function () {
            if (!Cinemas.findOne({id: id})) {
                Cinemas.insert({
                    id: id,
                    name: cinema.name,
                    shortName: cinema.shortName
                });
            }
        });
    },

    fetchAllShowings: function (cb) {
        var dfds = [];

        _.each(this.cinemas, function (cinema, id) {
            var dfd = this.fetchShowings(id)
                .then(function (showings) {
                    cb(id, null, showings);
                }, function (error) {
                    cb(id, error, null);
                })
                .pipe(function (showings) {
                    return [id, showings];
                }, function () {
                    return [id].concat(_.toArray(arguments));
                });

            dfds.push(dfd);
        }, this);

        return Du.when(dfds).pipe(function () {
            return _.toArray(arguments);
        }, function (dfd) {
            return _.toArray(arguments).slice(1);
        })
    },

    fetchOverdueShowings: function (cb) {
        var dfds = [],
            now = moment();

        _.each(this.cinemas, function (cinema, id) {
            var cinemaDoc = Cinemas.findOne({id: id}),
                fetchDate = cinemaDoc && cinemaDoc.fetchDate;

            if (!fetchDate ||
                !App.getShowingsFetchDate(fetchDate).isSame(App.getShowingsFetchDate(now)) || 
                now.diff(fetchDate, 'hours') >= SHOWINGS_OVERDUE_HOURS) {
                // Updating showings if it's another "showings day" or a SHOWINGS_OVERDUE_HOURS has been passed since last fetch
                var dfd = this.fetchShowings(id)
                    .then(function (showings) {
                        cb(id, null, showings);
                    }, function (error) {
                        cb(id, error, null);
                    })
                    .pipe(function (showings) {
                        return [id, showings];
                    }, function () {
                        return [id].concat(_.toArray(arguments));
                    });

                dfds.push(dfd);
            }

        }, this);

        if (!dfds.length) {
            dfds.push(true);
        }

        return Du.when(dfds).pipe(function () {
            return _.toArray(arguments);
        }, function (dfd) {
            return _.toArray(arguments).slice(1);
        })
    },

    fetchShowings: function (id) {
        var dfd = new Du.Deferred(),
            grabberDfd = new Du.Deferred(),
            cinema = this.cinemas[id],
            responseType,
            grabber;

        if (cinema) {
            responseType = cinema.responseType || 'html';
            grabber = cinema.grabber || this.grabbers[responseType];
            if (grabber) {
                grabber.call(cinema, grabberDfd);
                grabberDfd
                    .pipe(function (result) {
                        // Successful grabbing
                        // Parsing showings...
                        return Du.when([cinema.parseShowings(result)]);
                    })
                    .then(function (showings) {
                        // Sucessful parsing
                        Fibers(function () {
                            Cinemas.update({id: id}, {$set: {fetchDate: new Date()}});
                        }).run();
                        dfd.resolve(showings);
                    }, function (error) {
                        // Error while grabbing or parsing
                        dfd.reject('Error while grabbing/parsing showings for cinema with id "' + id + '": ' + error);
                    });
            } else {
                dfd.reject('There is no grabber for cinema with id "' + id + '"');
            }
        } else {
            dfd.reject('There is no registered cinema with id "' + id + '"');
        }

        return dfd;
    }

};