var request = Npm.require('request'),
    connect = Npm.require('connect'),
    app = __meteor_bootstrap__.app;

ImageProxy = function(opts) {
    var self = this;
    
    this.path = opts.path;
    this.param = opts.param;
    this.modifier = opts.modifier;

    app
        .use(this.path, connect.query())
        .use(this.path, function (req, res) {
            var query = req.query,
                imgUrl = query && query[self.param],
                requestInfo;

            if (imgUrl) {
                requestInfo = {
                    url: imgUrl
                };
                // Modifying request object
                if (self.modifier) {
                    self.modifier(requestInfo);
                }
                request(requestInfo).pipe(res);
            } else {
                res.end(404);
            }
        });
};

_.extend(ImageProxy.prototype, {
    
    getImageUrl: function (imageSrc) {
        return this.path + '?' + encodeURIComponent(this.param) + '=' + encodeURIComponent(imageSrc);
    }
    
});