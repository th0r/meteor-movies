var FROM = App.APP_EMAIL,
    EMAIL_TMPLS_DIR = 'emails',
    SUBJECT_TMPL_SUFFIX = '-subject',
    BODY_TMPL_SUFFIX = '-body';

App.sendEmail = function (to, messageTmplName, tmplData) {
    var tmplPrefix = EMAIL_TMPLS_DIR + '/' + messageTmplName;
    
    if (!_.isArray(to)) {
        to = [to];
    }
    try {
        var message = {
            from: FROM,
            subject: Templates.render(tmplPrefix + SUBJECT_TMPL_SUFFIX, tmplData),
            html: Templates.render(tmplPrefix + BODY_TMPL_SUFFIX, tmplData)
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