// Overriding Meteor session's methods
var _get = Session.get,
    _set = Session.set,
    undefined = void 0;

Session.set = function (key, value) {
    _set.apply(Session, arguments);
    store.set(key, value);
};

Session.get = function (key) {
    var result = _get.apply(Session, arguments);
    
    if (result === undefined) {
        result = store.get(key);
        if (result !== undefined) {
            _set.apply(Session, [key, result]);
        }
    }
    
    return result;
};

Session.setDefault = function (key, value) {
    var result = Session.get(key);
    
    if (result === undefined) {
        Session.set(key, value);
    }
};