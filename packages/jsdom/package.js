Package.describe({
    summary: 'A JavaScript implementation of the W3C DOM.'
});

Npm.depends({
    'jsdom': '0.5.5'
});

Package.on_use(function (api) {
    api.add_files('jsdom.js', 'server');
});