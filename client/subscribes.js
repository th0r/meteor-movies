Meteor.subscribe('cinemas');
Meteor.subscribe('movies');
Meteor.autorun(function () {
    var currentShowingsDate = Session.get('currentShowingsDate');
    
    if (currentShowingsDate) {
        Meteor.subscribe('showings', currentShowingsDate);
    }
});
Meteor.subscribe('userData');
Meteor.subscribe('movie-synonyms');