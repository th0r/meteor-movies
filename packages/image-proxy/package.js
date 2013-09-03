Package.describe({
    summary: 'Connect middleware to proxy images from other domains.'
});

Npm.depends({
    'connect': '2.7.10'
});

Package.on_use(function (api) {

    api.use(['underscore', 'request'], 'server');
    api.export('ImageProxy', 'server');
    api.add_files('image-proxy.js', 'server');
    
});