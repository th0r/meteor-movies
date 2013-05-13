var TO = 'grunin.ya@yandex.ru',
    FROM = 'movies@grunin-ya.ru',
    
    TMPL_DIR = 'server/email/templates',
    TMPL_EXT = '.html',
    SUBJECT_TMPL_SUFFIX = '-subject',
    BODY_TMPL_SUFFIX = '-body',
    
    fs = Npm.require('fs'),
    path = Npm.require('path'),
    Handlebars = Npm.require('handlebars');

function getTemplate(tmplName) {
    var tmplFile = path.resolve(TMPL_DIR, tmplName + TMPL_EXT),
        tmpl = fs.readFileSync(tmplFile, 'utf8');
    
    return Handlebars.compile(tmpl);
}

App.sendEmail = function (messageTmplName, tmplData) {
    try {
        var message = {
            from: FROM,
            to: TO,
            subject: getTemplate(messageTmplName + SUBJECT_TMPL_SUFFIX)(tmplData),
            html: getTemplate(messageTmplName + BODY_TMPL_SUFFIX)(tmplData)
        };

        Email.send(message);
    } catch (e) {
        console.log('Error sending email: ', e);
    }
};