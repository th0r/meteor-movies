var EMAIL_TMPLS_DIR = 'emails',
    SUBJECT_TMPL_SUFFIX = '-subject',
    BODY_TMPL_SUFFIX = '-body';

App.sendEmail = function (to, messageTmplName, tmplData) {
    var from = App.APP_EMAIL,
        tmplPrefix = EMAIL_TMPLS_DIR + '/' + messageTmplName;
    
    if (!from) {
        return console.log("Can't send email, because APP_EMAIL environment variable is not set.");
    }
    
    if (!_.isArray(to)) {
        to = [to];
    }
    try {
        var message = {
            from: from,
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