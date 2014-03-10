// Overriding Meteor session's methods
var _get = Session.get,
    _set = Session.set;

Session.set = function (key, value, useLocalStorage) {
    _set.apply(Session, arguments);
    if (useLocalStorage) {
        store.set(key, value);
    }
};

Session.get = function (key, useLocalStorage) {
    var result = _get.apply(Session, arguments);

    if (result === undefined && useLocalStorage) {
        result = store.get(key);
        if (result !== undefined) {
            _set.apply(Session, [key, result]);
        }
    }

    return result;
};

Session.setDefault = function (key, value, useLocalStorage) {
    var result = Session.get(key, useLocalStorage);

    if (result === undefined) {
        Session.set(key, value, useLocalStorage);
    }
};