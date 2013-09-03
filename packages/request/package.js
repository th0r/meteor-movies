Package.describe({
    summary: 'Simplified HTTP request client.'
});

Npm.depends({
    'request': '2.27.0'
});

Package.on_use(function (api) {

    api.export('request', 'server');
    api.add_files('request.js', 'server');
    
});