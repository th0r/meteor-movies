fetchShowings = function(cb) {
    jsdom.env(
        'http://www.matrix-cinema.ru/?thea=domodedovo&page=seanses',
        function (errors, window) {
            var document,
                showingsRows,
                fetchDate = new Date(),
                showings;
            
            if (errors) {
                cb(errors, null);
            } else {
                document = window.document;
                showingsRows = _.toArray(document.querySelectorAll('td[width="50"]'))
                    .slice(1)
                    .map(function (td) {
                        return td.parentNode;
                    });
                showings = showingsRows.map(function (tr) {
                    var showing = {};

                    showing.movie = tr.querySelector('td[width="270"] font').textContent;
                    showing.showings = _.compact(tr.lastChild.textContent.split(/\s+/g)).map(function (showings) {
                        var hours = +showings.slice(0, 2);

                        return moment().startOf('day').add({
                            days: (hours < 4) ? 1 : 0,
                            hours: hours,
                            minutes: +showings.slice(2)
                        }).toDate();
                    });
                    showing.fetchDate = fetchDate;

                    return showing;
                });
                
                cb(null, showings);
            }
        }
    );
};