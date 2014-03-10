Package.describe({
    summary: 'A "store" library with "in-memory" fallback.'
});

Npm.depends({
    'store': '1.3.14'
});

Package.on_use(function (api) {

    api.add_files('.npm/package/node_modules/store/store.js', 'client');
    api.add_files('store-memory-fallback.js', 'client');
    
});