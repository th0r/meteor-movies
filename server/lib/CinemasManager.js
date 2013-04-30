CinemasManager = {

    cinemas: {},

    parsers: {
        'html': function (id, cinema, dfd) {
            jsdom.env(
                _.result(cinema, 'showingsUrl'),
                function (errors, window) {
                    if (errors) {
                        dfd.reject('Error while downloading web page', errors);
                    } else {
                        try {
                            dfd.resolve(cinema.parseShowingsPage(window.document));
                        } catch(e) {
                            dfd.reject('Error while parsing showings for cinema with id "' + id + '"', e);
                        }
                    }
                }
            );
        },
        'json': function (id, cinema, dfd) {
            Meteor.http.get(cinema.showingsUrl, function (error, result) {
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
            } else {
                dfd.reject('There is no parser for response type "' + responseType + '"');
            }
        } else {
            dfd.reject('There is no registered cinema with id "' + id + '"');
        }

        return dfd;
    }

};