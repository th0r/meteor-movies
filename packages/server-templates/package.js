Package.describe({
    summary: 'Server-side handlebars templates.'
});

Npm.depends({
    'handlebars': '1.0.12'
});

Package.on_use(function (api) {

    api.use('underscore', 'server');
    api.export('Templates', 'server');
    api.add_files('templates.js', 'server');
    
});