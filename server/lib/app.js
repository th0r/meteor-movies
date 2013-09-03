App = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || null,
    APP_EMAIL: 'movies@grunin-ya.ru'
};

Accounts.emailTemplates.from = App.APP_EMAIL;

// Initing server-side templates
Templates.init(Assets);