var SESSION_TYPE = /\s(2D|3D)$/;

CinemasManager.addCinema('matrix-domodedovo', {

    name: 'Матрица Домодедово',
    shortName: 'Матрица',

    showingsUrl: 'http://www.matrix-cinema.ru/?thea=domodedovo&page=seanses',

    parseShowingsPage: function ($doc) {
        var showingsRows = $doc.find('td[width="50"]')
            .slice(1)
            .map(function (i, elem) {
                return elem.parent;
            });

        return $(showingsRows).map(function () {
            var is3D = false,
                movieName = this.find('td[width="270"] font[size="3"]')
                    .text()
                    .trim()
                    .replace(SESSION_TYPE, function (match, type) {
                        is3D = (type === '3D');
                        
                        return '';
                    });

            return {
                movie: movieName,
                sessions: _.compact(this.children().last().text().split(/\s+/g)).map(function (showings) {
                    var hours = +showings.slice(0, 2),
                        sessionDate = moment().startOf('day').add({
                            days: (hours < 4) ? 1 : 0,
                            hours: hours,
                            minutes: +showings.slice(2)
                        }).toDate();

                    return {
                        time: sessionDate,
                        is3D: is3D
                    }
                })
            }
        });
    }

});