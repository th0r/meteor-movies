CinemasManager.addCinema('matrix-domodedovo', {
    
    name: 'Матрица (Домодедово)',
    
    showingsUrl: 'http://www.matrix-cinema.ru/?thea=domodedovo&page=seanses',
    
    parseShowingsPage: function (document) {
        var showingsRows = _.toArray(document.querySelectorAll('td[width="50"]'))
            .slice(1)
            .map(function (td) {
                return td.parentNode;
            });
            
        return showingsRows.map(function (tr) {
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

            return showing;
        });
    }
    
});