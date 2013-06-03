var Fibers = Npm.require('fibers'),
    SHOWINGS_OVERDUE_HOURS = 4;

CinemasManager = {

    cinemas: {},

    parsers: {
        'html': function (id, cinema, dfd) {
            Meteor.http.get(_.result(cinema, 'showingsUrl'), function (error, result) {
                if (error) {
                    dfd.reject('Error while downloading web page', error);
                } else {
                    try {
                        dfd.resolve(cinema.parseShowingsPage($(result.content)));
                    } catch (e) {
                        dfd.reject('Error while parsing showings for cinema with id "' + id + '"', e);
                    }
                }
            });
        },
        'json': function (id, cinema, dfd) {
            Meteor.http.get(_.result(cinema, 'showingsUrl'), function (error, result) {
                if (error || !result.data) {
                    dfd.reject('Error while parsing showings for cinema with id "' + id + '"', error);
                } else {
                    dfd.resolve(cinema.parseShowingsPage(result.data));
                }
            });
        }
    },

    addCinema: function (id, cinema) {
        this.cinemas[id] = cinema;

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
            cinema = this.cinemas[id],
            responseType,
            parser;

        if (cinema) {
            responseType = cinema.responseType || 'html';
            parser = this.parsers[responseType];
            if (parser) {
                parser(id, cinema, dfd);
                dfd.done(function () {
                    Fibers(function () {
                        Cinemas.update({id: id}, {$set: {fetchDate: new Date()}});
                    }).run();
                });
            } else {
                dfd.reject('There is no parser for response type "' + responseType + '"');
            }
        } else {
            dfd.reject('There is no registered cinema with id "' + id + '"');
        }

        return dfd;
    }

};