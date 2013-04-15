var SESSION_TYPE = /\s(2D|3D)$/;

CinemasManager.addCinema('matrix-domodedovo', {

    name: 'Матрица Домодедово',
    shortName: 'Матрица',

    showingsUrl: 'http://www.matrix-cinema.ru/?thea=domodedovo&page=seanses',

    parseShowingsPage: function (document) {
        var showingsRows = _.toArray(document.querySelectorAll('td[width="50"]'))
            .slice(1)
            .map(function (td) {
                return td.parentNode;
            });

        return showingsRows.map(function (tr) {
            var is3D = false,
                movieName = tr.querySelector('td[width="270"] font').textContent
                    .trim()
                    .replace(SESSION_TYPE, function (match, type) {
                        is3D = (type === '3D');
                        
                        return '';
                    });
            
            return {
                movie: movieName,
                sessions: _.compact(tr.lastChild.textContent.split(/\s+/g)).map(function (showings) {
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