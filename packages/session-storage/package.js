Package.describe({
    summary: 'A Meteor.Session with browser localStorage support.'
});

Package.on_use(function (api) {
    
    api.use(['session', 'store']);
    api.add_files('session-storage.js', 'client');
    
});