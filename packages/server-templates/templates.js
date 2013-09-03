var Handlebars = Npm.require('handlebars');

Templates = {

    _appAssets: null,
    _textCache: {},
    _tmplCache: {},
    
    config: {
        rootDirectory: 'templates',
        extension: '.html'
    },
    
    init: function (appAssets, config) {
        this._appAssets = appAssets;
        _.extend(this.config, config);
    },
    
    getAssetPath: function (tmplName) {
        return this.config.rootDirectory + '/' + tmplName + this.config.extension;
    },
    
    getText: function (tmplName) {
        var tmplPath = this.getAssetPath(tmplName),
            tmplText = this._textCache[tmplPath];

        if (!tmplText) {
            tmplText = this._textCache[tmplPath] = this._appAssets.getText(tmplPath);
        }
        
        return tmplText;
    },
    
    get: function (tmplName) {
        var tmplPath = this.getAssetPath(tmplName),
            tmpl = this._tmplCache[tmplPath];
        
        if (!tmpl) {
            tmpl = this._tmplCache[tmplPath] = Handlebars.compile(this.getText(tmplName));
        }
        
        return tmpl;
    },
    
    render: function (tmplName, data) {
        return this.get(tmplName)(data);
    }
    
};