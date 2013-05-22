// ==================================== Login/register form ====================================

function showError(error) {
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
        debugger;
        if (error) {
            showError(error.message);
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
            showError(error.message);
            dfd.reject(error);
        } else {
            dfd.resolve();
        }
    });

    return dfd;
}

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