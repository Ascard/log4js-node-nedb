"use strict";

var log4js = require('log4js');
var lxHelpers = require('lx-helpers');
var BSON = require('bson');
var nedb = require('nedb');

/**
 * Returns a function to log data in nedb.
 *
 * @param {Object} config The configuration object.
 * @param {string} config.filename The filename to the nedb db.
 * @param {Object} config.database The pre-initialized nedb database.
 * @param {string=} config.layout The log4js layout.
 * @returns {Function}
 */
function nedbAppender(config) {
    if (!config || (!config.filename && !config.database)) {
        throw new Error('filename or database is missing in config. Cannot open nedb database.');
    }

    var database;
    var cache = [];
    var layout = config.layout || log4js.layouts.messagePassThroughLayout;

    function ERROR(err) {
        Error.call(this);
        Error.captureStackTrace(this, this.constructor);

        this.name = err.toString();
        this.message = err.message || 'error';
    }

    function replaceKeys(src) {
        var result = {};

        function mixin(dest, source, cloneFunc) {
            if (lxHelpers.isObject(source)) {
                lxHelpers.forEach(source, function (value, key) {
                    // replace $ at start
                    if (key[0] === '$') {
                        key = key.replace('$', '_dollar_');
                    }

                    // replace all dots
                    key = key.replace(/\./g, '_dot_');

                    dest[key] = cloneFunc ? cloneFunc(value) : value;
                });
            }

            return dest;
        }

        if (!src || typeof src !== 'object' || typeof src === 'function' || src instanceof Date || src instanceof RegExp || src instanceof BSON.ObjectID) {
            return src;
        }

        // wrap Errors in a new object because otherwise they are saved as an empty object {}
        if (lxHelpers.getType(src) === 'error') {
            return new ERROR(src);
        }

        // Array
        if (lxHelpers.isArray(src)) {
            result = [];

            lxHelpers.arrayForEach(src, function (item) {
                result.push(replaceKeys(item));
            });
        }

        return mixin(result, src, replaceKeys);
    }

    function insert(loggingEvent) {
        if (database) {
            database.insert({
                timestamp: loggingEvent.startTime,
                data: loggingEvent.data,
                level: loggingEvent.level,
                category: loggingEvent.logger.category
            }, function (error) {
                if (error) {
                    console.error('log: Error writing data to log!');
                    console.error(error);
                    console.log('log: Filename: %s, data: %j', config.filename, loggingEvent);
                }
            });
        } else {
            cache.push(loggingEvent);
        }
    }

    // connect to nedb
    if (config.filename) {
        database = new nedb({filename: config.filename});

        database.loadDatabase(function (err) {
            if (err) {
                console.error('Error opening nedb database file! Filename: %s', config.filename);
                console.error(err);
            }
        });
    } else {
        database = config.database;
    }

    // process cache
    cache.forEach(function (loggingEvent) {
        setImmediate(function () {
            insert(loggingEvent);
        });
    });

    return function (loggingEvent) {
        // get the information to log
        if (Object.prototype.toString.call(loggingEvent.data[0]) === '[object String]') {
            // format string with layout
            loggingEvent.data = layout(loggingEvent);
        } else if (loggingEvent.data.length === 1) {
            loggingEvent.data = loggingEvent.data[0];
        }

        loggingEvent.data = replaceKeys(loggingEvent.data);

        // save in db
        insert(loggingEvent);
    };
}

function configure(config) {
    if (config.layout) {
        config.layout = log4js.layouts.layout(config.layout.type, config.layout);
    }

    return nedbAppender(config);
}

exports.appender = nedbAppender;
exports.configure = configure;
