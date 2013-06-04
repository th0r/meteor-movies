// ==================================== Login/register form ====================================

var ENROLL_ACCOUNT_TOKEN = Accounts._enrollAccountToken;

function showError(error) {
    if (error) {
        error = App.stripErrorCode(error);
    }
    Session.set('loginFormError', error || null);
}

function getFormInfo(form) {
    return {
        email: form.email.value,
        password: form.password.value
    }
}

function makeAction(action, form) {
    if (!Meteor.loggingIn()) {
        action = (action === 'login') ? login : register;
        showError(null);
        action(getFormInfo(form));
    }
}

function login(info) {
    var dfd = new Du.Deferred();
    
    Meteor.loginWithPassword(info.email, info.password, function (error) {
        if (error) {
            showError(error);
            dfd.reject(error);
        } else {
            dfd.resolve();
        }
    });
    
    return dfd;
}

function logout() {
    var dfd = new Du.Deferred();

    Meteor.logout(function (error) {
        if (error) {
            alert('Ошибка! ' + error.message);
            dfd.reject(error);
        } else {
            dfd.resolve();
        }
    });

    return dfd;
}

function register(info) {
    var dfd = new Du.Deferred();

    Accounts.createUser({
        email: info.email,
        password: info.password
    }, function (error) {
        if (error) {
            showError(error);
            dfd.reject(error);
        } else {
            dfd.resolve();
        }
    });

    return dfd;
}

// ==================================== Login form ====================================

Template.login_form.rendered = function () {
    $('button').button();
};

Template.login_form.events = {
    
    'submit': function (event, tmpl) {
        event.preventDefault();
        makeAction('login', tmpl.find('.login-form'));
    },
    
    'click button.login': function (event, tmpl) {
        makeAction('login', tmpl.find('.login-form'));
    },
    
    'click button.register': function (event, tmpl) {
        makeAction('register', tmpl.find('.login-form'));
    }
        
};

Template.login_form.formError = function () {
    return Session.get('loginFormError');
};

// ==================================== Enroll account dialog ====================================

function enrollAccount(password) {
    var dfd = new Du.Deferred();

    Accounts.resetPassword(ENROLL_ACCOUNT_TOKEN, password, function (error) {
        if (error) {
            App.showNotification('error', {
                message: App.stripErrorCode(error)
            });
            dfd.reject(error);
        } else {
            dfd.resolve();
        }
    });
    
    return dfd;
}

Template.enroll_account.enrollAccountToken = ENROLL_ACCOUNT_TOKEN;

Template.enroll_account_dialog.rendered = function () {
    this.$dialog = $(this.find('.enroll-account-dialog'))
        .dialog({
            title: 'Установка пароля для учетной записи',
            resizable: false,
            draggable: false,
            modal: true,
            width: 350,
            buttons: [{
                text: 'Установить пароль',
                click: function () {
                    var $dialog = $(this);
                    
                    enrollAccount($dialog.find('.password').val())
                        .always(function () {
                            $dialog.dialog('close');
                        });
                }
            }]
        });
};

Template.enroll_account_dialog.events = {
    
    'submit form': function (event, tmpl) {
        event.preventDefault();
        enrollAccount(tmpl.find('.password').value)
            .always(function () {
                tmpl.$dialog.dialog('close');
            });
    }
    
};

// ==================================== Login info ====================================

Template.login_email.email = function () {
    var currentUser = Meteor.user();
    
    return currentUser ? currentUser.emails[0].address : 'не залогинен';
};

// ==================================== Logout ====================================

Template.logout_button.events = {
    
    'click': function () {
        logout();
    }
    
};