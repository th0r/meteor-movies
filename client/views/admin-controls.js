
// ==================================== Commands ====================================

Template.admin_commands.rendered = function () {
    $(this.findAll('button')).button();
};

Template.admin_commands.events = {
    'click .refresh-showings': function () {
        console.log(1);
        Meteor.call('refreshShowings', true);
    }
};

// ==================================== Movie synonyms ====================================

Template.movies_synonyms_list.movies = function () {
    var movies = {},
        moviesArray = [];

    MovieSynonyms.find({}).fetch().forEach(function (doc) {
        var synonyms = movies[doc.to] = movies[doc.to] || [];

        synonyms.push(doc);
    });

    _.each(movies, function (docs, original) {
        moviesArray.push({
            original: original,
            docs: docs
        });
    });

    return moviesArray;
};

Template.movie_synonyms.events = {

    'click .remove': function () {
        MovieSynonyms.remove(this._id);
    }

};