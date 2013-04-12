(function (global, undefined) {
    
    var Du = global.Du = {};

    // ==================================== Du.extend ====================================

    /**
     * Функция для работы с классами.
     *
     * @param {Function} Class  Расширяемый класс.
      * @param {Function} [SuperClass]  Если указан, то класс Class будет унаследован он данного класса.
     * @param {Array} [Mixins]
      * @param {Object} instanceAttributes  Объект со свойствами и методами создаваемого класса (будет вмержен в прототип класса).
      */
    Du.extend = function (Class, SuperClass, Mixins, instanceAttributes) {
        var argsLen = arguments.length,
            mixedAttributes,
            proto;

        if (argsLen < 3) {
            instanceAttributes = SuperClass;
            SuperClass = null;
        } else if (argsLen < 4) {
            instanceAttributes = Mixins;
            if (Array.isArray(SuperClass)) {
                Mixins = SuperClass;
                SuperClass = null;
            } else {
                Mixins = null;
            }
        }

        // Extending
        if (SuperClass) {
            Empty.prototype = SuperClass.prototype;
            Class.prototype = new Empty();
        }

        // Mixins
        if (Mixins) {
            mixedAttributes = {};
            Mixins.forEach(function (Mixin) {
                // TODO: must be deep extend
                _.extend(mixedAttributes, Mixin);
            });
            // TODO: must be deep extend
            instanceAttributes = _.extend(mixedAttributes, instanceAttributes);
        }

        // Adding class attributes
        proto = Class.fn = Class.prototype;
        _.extend(proto, instanceAttributes);

        proto.constructor = Class;
        if (SuperClass) {
            proto.$super = SuperClass.prototype;
        }
    };

    // ==================================== Deferred ====================================

    var UNRESOLVED = 'unresolved',
        RESOLVED = 'resolved',
        REJECTED = 'rejected';

    function makeCallbackMethod(prop, callStatus) {
        return function (callback) {
            var status = this._status,
                context;

            if (status === UNRESOLVED) {
                this[prop].push(callback);
            } else if (status === callStatus) {
                context = (this._context === undefined) ? this : this._context;
                callback.apply(context, this._args);
            }

            return this;
        };
    }

    function makeResolveMethod(prop, resolveStatus, contextPassed) {
        return function () {
            var context,
                args;

            if (this._status === UNRESOLVED) {
                this._status = resolveStatus;
                if (contextPassed) {
                    context = this._context = arguments[0];
                }
                context = (context === undefined) ? this : context;
                args = this._args = _.toArray(arguments).slice(+contextPassed);
                this[prop].forEach(function (callback) {
                    callback.apply(context, args);
                });
                delete this._done;
                delete this._fail;
            }

            return this;
        };
    }

    function makePipeMethod(methodName, filter, finalDeferred) {
        return function () {
            var args = _.toArray(arguments),
                filteredResult;

            if (filter) {
                filteredResult = filter.apply(this, args);
                if (filteredResult && filteredResult instanceof Deferred) {
                    // Waiting for given deferred and piping it's results
                    return pipeDeferred(filteredResult, null, null, finalDeferred);
                } else if (Array.isArray(filteredResult)) {
                    // Changing resolved arguments
                    args = filteredResult;
                }
            }

            // Resolving deferred, returned to user
            finalDeferred[methodName + 'With'].apply(finalDeferred, [this].concat(args));
        };
    }

    function pipeDeferred(deferred, doneFilter, failFilter, finalDeferred) {
        deferred.then(
            makePipeMethod('resolve', doneFilter, finalDeferred),
            makePipeMethod('reject', failFilter, finalDeferred)
        );

        return finalDeferred;
    }

    function when() {
        var finalDef = new Deferred(),
            defs = _.toArray(arguments),
            unresolved = defs.length,
            args = new Array(unresolved);

        function fail() {
            var args = _.toArray(arguments);
            args.unshift(this);
            finalDef.reject.apply(finalDef, args);
        }

        defs.forEach(function (def, i) {
            if (def instanceof Deferred) {
                def.done(function () {
                    args[i] = _.toArray(arguments);
                    if (!--unresolved) {
                        finalDef.resolve.apply(finalDef, args);
                    }
                });
                def.fail(fail);
            } else {
                args[i] = def;
                unresolved--;
            }
        });
        if (!unresolved) {
            finalDef.resolve.apply(finalDef, args);
        }
        
        return finalDef;
    }

    function Deferred() {
        this._done = [];
        this._fail = [];
        this._status = UNRESOLVED;
        this._args = null;
        this._context = undefined;
    }

    Du.extend(Deferred, {
        done: makeCallbackMethod('_done', RESOLVED),
        fail: makeCallbackMethod('_fail', REJECTED),
        then: function (doneCallback, failCallback) {
            return this.done(doneCallback).fail(failCallback);
        },
        always: function (callback) {
            return this.done(callback).fail(callback);
        },
        resolve: makeResolveMethod('_done', RESOLVED),
        resolveWith: makeResolveMethod('_done', RESOLVED, true),
        reject: makeResolveMethod('_fail', REJECTED),
        rejectWith: makeResolveMethod('_fail', REJECTED, true),
        status: function () {
            return this._status;
        },
        pipe: function (doneFilter, failFilter) {
            return pipeDeferred(this, doneFilter, failFilter, new Deferred());
        }
    });

    Du.Deferred = Deferred;
    Du.when = when;
    
}(this));