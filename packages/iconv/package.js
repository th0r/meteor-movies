Package.describe({
    summary: 'Text recoding in JavaScript for fun and profit!'
});

Npm.depends({
    'iconv': '2.0.5'
});

Package.on_use(function (api) {
    api.add_files('iconv.js', 'server');
});