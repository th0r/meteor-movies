CinemasManager.addCinema('luxor-vegas', {
    
    name: 'Люксор (Vegas)',
    
    showingsUrl: 'http://www.luxorfilm.ru/cinema/vegas/',
    
    parseShowingsPage: function (document) {
        var showingsRows = _.toArray(document.querySelectorAll('.cinema_time_info'));

        return showingsRows.map(function (rowElem) {
            var showing = {};

            showing.movie = rowElem.querySelector('h3 a').textContent;
            showing.showings = _.toArray(rowElem.querySelectorAll('.time_of_day_shedule .shedule-data'))
                .map(function (timeElem) {
                    var time = timeElem.firstChild.textContent.trim().split(':'),
                        hours = +time[0];
    
                    return moment().startOf('day').add({
                        days: (hours < 4) ? 1 : 0,
                        hours: hours,
                        minutes: +time[1]
                    }).toDate();
                });

            return showing;
        });
    }
    
});