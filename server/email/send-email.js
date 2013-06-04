var FROM = 'movies@grunin-ya.ru',
    SUBJECT_TMPL_SUFFIX = '-subject',
    BODY_TMPL_SUFFIX = '-body',
    templates = Handlebars.templates;

function getTemplate(tmplName) {
    var tmplFile = path.resolve(TMPL_DIR, tmplName + TMPL_EXT),
        tmpl = fs.readFileSync(tmplFile, 'utf8');
    
    return Handlebars.compile(tmpl);
}

App.sendEmail = function (to, messageTmplName, tmplData) {
    if (!_.isArray(to)) {
        to = [to];
    }
    try {
        var message = {
            from: FROM,
            subject: templates[messageTmplName + SUBJECT_TMPL_SUFFIX](tmplData),
            html: templates[messageTmplName + BODY_TMPL_SUFFIX](tmplData)
        };

        to.forEach(function (to) {
            Email.send(_.extend({}, message, {
                to: to
            }));
        });
    } catch (e) {
        console.log('Error sending email: ', e);
    }
};