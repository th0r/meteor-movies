function userIsNotAdmin(userId) {
    return !(userId && Meteor.user().admin); 
}

// Deny synonyms updates for non-admins
MovieSynonyms.deny({
    
    insert: userIsNotAdmin,
    update: userIsNotAdmin,
    remove: userIsNotAdmin
    
});

MovieSynonyms.allow({

    insert: function (userId, doc) {
        return doc.from !== doc.to && !MovieSynonyms.find({
            from: doc.from,
            to: doc.to
        }, {limit: 1}).count();
    },
    
    update: function () {
        return true;
    },

    remove: function () {
        return true;
    }

});

Meteor.publish('movie-synonyms', function () {
    if (this.userId) {
        var user = Meteor.users.findOne(this.userId);
        
        if (user && user.admin) {
            // Returning the whole collection
            return MovieSynonyms.find({});
        }
    }
    // Don't send anything to ordinary user
    this.ready();
});