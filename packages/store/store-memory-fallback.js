if (!store.enabled) {
    var storage = {};

    store.set = function (key, val) {
        if (val === undefined) {
            return store.remove(key);
        }
        storage[key] = val;

        return val;
    };

    store.get = function (key) {
        return storage[key];
    };

    store.remove = function (key) {
        delete storage[key];
    };

    store.clear = function () {
        storage = {};
    };

    store.forEach = function (callback) {
        for (var key in storage) {
            if (storage.hasOwnProperty(key)) {
                callback(key, store.get(key));
            }
        }
    };
}