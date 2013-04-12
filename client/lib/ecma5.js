(function () {
    
    var FP = Function.prototype,
        SP = String.prototype,
        AP = Array.prototype,
        DP = Date.prototype,
        slice = AP.slice,
        toString = Object.prototype.toString,
        REDUCE_ERROR = 'reduce of empty array with no initial value';

    // ==================================== Function.prototype ======================================
    /**
     * Создает новую функцию, которая во время вызова, вызывает исходную функцию в контексте `thisObj`.
     * Параметры, переданные после `thisObj`, будут добавлены перед параметрами вызываемой функции.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind)
     *
     *     var bounded = fn.bind(that, 1, 2);
     *     bounded(3, 4);
     *     // вызовет fn(1, 2, 3, 4) в контексте that, что равносильно fn.call(that, 1, 2, 3, 4)
     *
     * @member Function
     * @param thisObj
     * @param {Mixed...} [argN]
     * @return {Function}
     */
    FP.bind = FP.bind || function (thisObj) {
        var fn = this,
            args = slice.call(arguments, 1);

        return function () {
            return fn.apply(thisObj, args.concat(slice.call(arguments)));
        };
    };


    // ==================================== Object ====================================
    /**
     * Формирует массив с названиями личных свойств объекта `obj`.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)
     *
     *     Object.keys({a: 1, b: 2});
     *     // ==> ['a', 'b']
     *
     * @member Object
     * @static
     * @param {Object} obj
     * @return {Array}
     */
    Object.keys = Object.keys || function (obj) {
        var keys = [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    };


    // ==================================== String.prototype ====================================
    /**
     * Обрезает пробельные символы вначале и вконце строки.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim),
     * [Описание реализации](http://blog.stevenlevithan.com/archives/faster-trim-javascript)
     *
     * @member String
     * @return {String}
     */
    SP.trim = SP.trim || function () {
        return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };


    // ==================================== Array ====================================
    /**
     * Проверяет, является ли аргумент `obj` массивом.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray)
     *
     * @member Array
     * @static
     * @param obj
     * @return {Boolean}
     */
    Array.isArray = Array.isArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };


    // ==================================== Array.prototype ====================================
    /**
     * Ищет элемент в текущем массиве слева направо по строгому соответствию (`===`).
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf)
     *
     * @member Array
     * @param searchElement  Искомый элемент.
     * @param [fromIndex=0]  С какой позиции начинать поиск. Может быть отрицательным, тогда позиция будет отсчитываться с конца.
     * @return {Number}  Индекс первого найденного элемента либо -1, если элемент не найден.
     */
    AP.indexOf = AP.indexOf || function (searchElement, fromIndex) {
        var len = this.length,
            i;

        if (!len) {
            return -1;
        }

        i = +fromIndex || 0;
        if (i < 0) {
            i = Math.max(0, len + i);
        }

        for (; i < len; ++i) {
            if (this[i] === searchElement) {
                return i;
            }
        }

        return -1;
    };

    /**
     * Ищет элемент в текущем массиве справа налево по строгому соответствию (`===`).
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     *
     * @member Array
     * @param searchElement  Искомый элемент.
     * @param [fromIndex=0]  С какой позиции начинать поиск. Может быть отрицательным, тогда позиция будет отсчитываться с начала.
     * @return {Number}  Индекс первого найденного элемента либо -1, если элемент не найден.
     */
    AP.lastIndexOf = AP.lastIndexOf || function (searchElement, fromIndex) {
        var len = this.length,
            i;

        if (!len) {
            return -1;
        }

        i = len - 1;
        if (arguments.length > 1) {
            i = Math.min(i, +fromIndex || 0);
        }
        i = (i >= 0) ? i : len + i;

        for (; i >= 0; i--) {
            if (this[i] === searchElement) {
                return i;
            }
        }

        return -1;
    };

    /**
     * Проверяет, все ли элементы массива удовлетворяют условию, реализованному в функции `callback`.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every)
     *
     * @member Array
     * @param {Function} callback  Функция, вызываемая для проверки значений массива.
     *   Вызывается с 3-мя аргументами: значение элемента массива, индекс этого элемента, сам массив.
     * @param [thisObj]  Если указан, то функция `callback` будет вызываться в контексте `thisObj`.
     * @return {Boolean}  Возвращает `true`, если все вызовы `callback` возвратили `true`. Иначе - `false`.
     */
    AP.every = AP.every || function (callback, thisObj) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (!callback.call(thisObj, this[i], i, this)) {
                return false;
            }
        }

        return true;
    };

    /**
     * Проверяет, удовлетворяет ли хотя бы один элемент массива условию, реализованному в функции `callback`.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some)
     *
     * @member Array
     * @param {Function} callback  Функция, вызываемая для проверки значений массива.
     *   Вызывается с 3-мя аргументами: значение элемента массива, индекс этого элемента, сам массив.
     * @param [thisObj]  Если указан, то функция `callback` будет вызываться в контексте `thisObj`.
     * @return {Boolean}  Возвращает `true`, если хотя бы один вызов `callback` возвратил `true`. Иначе - `false`.
     */
    AP.some = AP.some || function (callback, thisObj) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (callback.call(thisObj, this[i], i, this)) {
                return true;
            }
        }

        return false;
    };

    /**
     * Вызывает функцию `callback` для каждого элемента массива.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach)
     *
     * @member Array
     * @param {Function} callback  Вызывается с 3-мя аргументами: значение элемента массива, индекс этого элемента, сам массив.
     * @param [thisObj]  Если указан, то функция `callback` будет вызываться в контексте `thisObj`.
     * @return {undefined}
     */
    AP.forEach = AP.forEach || function (callback, thisObj) {
        for (var i = 0, len = this.length; i < len; i++) {
            callback.call(thisObj, this[i], i, this);
        }
    };

    /**
     * Создает новый массив, состоящий из результатов вызова функции `callback` для каждого элемента массива.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map)
     *
     * @member Array
     * @param {Function} callback  Функция, вызываемая для получения нового элемента массива.
     *   Вызывается с 3-мя аргументами: значение элемента массива, индекс этого элемента, сам массив.
     * @param [thisObj]  Если указан, то функция `callback` будет вызываться в контексте `thisObj`.
     * @return {Array}
     */
    AP.map = AP.map || function (callback, thisObj) {
        var len = this.length,
            results = new Array(len);

        for (var i = 0; i < len; i++) {
            results[i] = callback.call(thisObj, this[i], i, this);
        }

        return results;
    };


    /**
     * Создает новый массив из элементов исходного массива, для которых функция `callback` вернула `true`.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter)
     *
     * @member Array
     * @param {Function} callback  Функция, вызываемая для фильтрации массива.
     *   Вызывается с 3-мя аргументами: значение элемента массива, индекс этого элемента, сам массив.
     * @param [thisObj]  Если указан, то функция `callback` будет вызываться в контексте `thisObj`.
     * @return {Array}  Отфильтрованный массив.
     */
    AP.filter = AP.filter || function (callback, thisObj) {
        var len = this.length,
            results = [],
            val;

        for (var i = 0; i < len; i++) {
            val = this[i];
            if (callback.call(thisObj, val, i, this)) {
                results.push(val);
            }
        }

        return results;
    };

    /**
     * Применяет функцию `callback` к каждому элементу массива слева направо, чтобы в итоге преобразовать массив в единственное значение.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce)
     *
     *     var arr = [1, 2, 3],
     *     arr.reduce(function(acc, val, i, arr) {
     *         return acc + val;
     *     });
     *     // ==> 6 (1+2+3)
     *
     * @member Array
     * @param {Function} callback  Вызывается с 3-мя аргументами: аккумулятор, текущее значение элемента массива, индекс этого элемента, сам массив.
     *   Возвращаемое значение запоминается и пробрасывается в следующий вызов в качестве аккумулятора.
     * @param [initialValue]  Если указано, то оно будет использовано в качестве начального значения аккумулятора,
     *   иначе начальным значением будет первый элемент массива.
     * @return Значение, возвращенное из последнего вызова `callback`.
     */
    AP.reduce = AP.reduce || function (callback, initialValue) {
        var len = this.length,
            initialValuePassed = (arguments.length > 1),
            val;

        if (len === 0 && !initialValuePassed) {
            throw new TypeError(REDUCE_ERROR);
        }

        val = initialValuePassed ? initialValue : this[0];
        for (var i = initialValuePassed ? 0 : 1; i < len; i++) {
            val = callback(val, this[i], i, this);
        }

        return val;
    };

    /**
     * Применяет функцию `callback` к каждому элементу массива справа налево, чтобы в итоге преобразовать массив в единственное значение.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduceRight)
     *
     * @member Array
     * @param {Function} callback  Вызывается с 3-мя аргументами: аккумулятор, текущее значение элемента массива, индекс этого элемента, сам массив.
     *   Возвращаемое значение запоминается и пробрасывается в следующий вызов в качестве аккумулятора.
     * @param [initialValue]  Если указано, то оно будет использовано в качестве начального значения аккумулятора,
     *   иначе начальным значением будет последний элемент массива.
     * @return Значение, возвращенное из последнего вызова `callback`.
     */
    AP.reduceRight = AP.reduceRight || function (callback, initialValue) {
        var len = this.length,
            initialValuePassed = (arguments.length > 1);

        if (len === 0 && !initialValuePassed) {
            throw new TypeError(REDUCE_ERROR);
        }

        var i = initialValuePassed ? len : len - 1,
            val = initialValuePassed ? initialValue : this[len - 1];

        while (i--) {
            val = callback(val, this[i], i, this);
        }

        return val;
    };


    // ==================================== Date ====================================
    Date.now = Date.now || function () {
        return +new Date();
    };


    // ==================================== Date.prototype ====================================
    /**
     * Преобразует объект даты в строку в ISO-формате.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toISOString)
     *
     * @member Date
     * @return {String}
     */
    DP.toISOString = DP.toISOString || (function () {
        var str = function (n, l) {
            var str = String(n),
                len = l || 2;

            while (str.length < len) {
                str = '0' + str;
            }

            return str;
        };

        return function () {
            return this.getUTCFullYear() +
                '-' + str(this.getUTCMonth() + 1) +
                '-' + str(this.getUTCDate()) +
                'T' + str(this.getUTCHours()) +
                ':' + str(this.getUTCMinutes()) +
                ':' + str(this.getUTCSeconds()) +
                '.' + str(this.getUTCMilliseconds(), 3) +
                'Z';
        };
    }());

    /**
     * Преобразует объект даты в значение, используемое для ее представления в JSON.
     *
     * [Описание в MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toJSON)
     *
     * @member Date
     * @return {String}
     */
    DP.toJSON = DP.toJSON || function () {
        return this.toISOString();
    };

});