Package.describe({
    summary: 'Parse, manipulate, and display dates.'
});

Npm.depends({
    'moment': '2.0.0'
});

Package.on_use(function (api) {
    api.add_files('moment.js', 'server');
    api.add_files('.npm/node_modules/moment/moment.js', 'client');
});