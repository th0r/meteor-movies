Package.describe({
    summary: 'Convert character encodings in pure javascript.'
});

Npm.depends({
    'iconv-lite': '0.2.8'
});

Package.on_use(function (api) {
    api.add_files('iconv-lite.js', 'server');
});