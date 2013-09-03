Package.describe({
    summary: 'A Meteor.Session with browser localStorage support.'
});

Npm.depends({
    'store': '1.3.8',
    // JSON shim for old browsers
    'json3': '3.2.4'
});

Package.on_use(function (api) {
    
    api.use('session');
    api.add_files('.npm/package/node_modules/json3/lib/json3.js', 'client');
    api.add_files('.npm/package/node_modules/store/store.js', 'client');
    api.add_files('session-storage.js', 'client');
    
});