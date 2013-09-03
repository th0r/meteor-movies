Package.describe({
    summary: 'Tiny, fast, and elegant implementation of core jQuery designed specifically for the server'
});

Npm.depends({
    'cheerio': '0.12.1'
});

Package.on_use(function (api) {
    api.export('$', 'server');
    api.add_files('cheerio.js', 'server');
});