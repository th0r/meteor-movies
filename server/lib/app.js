App = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || null,
    APP_EMAIL: process.env.APP_EMAIL || null
};

Accounts.emailTemplates.from = App.APP_EMAIL;

// Initing server-side templates
Templates.init(Assets, {
    extension: '.hbs.html'
});