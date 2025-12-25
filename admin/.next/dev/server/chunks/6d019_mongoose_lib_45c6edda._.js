module.exports = [
"[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/bulkWriteResult.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const BulkWriteResult = __turbopack_context__.r("[project]/backend/node_modules/mongodb/lib/bulk/common.js [app-route] (ecmascript)").BulkWriteResult;
module.exports = BulkWriteResult;
}),
"[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseCollection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/collection.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const Collection = __turbopack_context__.r("[project]/backend/node_modules/mongodb/lib/index.js [app-route] (ecmascript)").Collection;
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const formatToObjectOptions = Object.freeze({
    ...internalToObjectOptions,
    copyTrustedSymbol: false
});
/**
 * A [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) collection implementation.
 *
 * All methods methods from the [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) driver are copied and wrapped in queue management.
 *
 * @inherits Collection https://mongodb.github.io/node-mongodb-native/4.9/classes/Collection.html
 * @api private
 */ function NativeCollection(name, conn, options) {
    this.collection = null;
    this.Promise = options.Promise || Promise;
    this.modelName = options.modelName;
    delete options.modelName;
    this._closed = false;
    MongooseCollection.apply(this, arguments);
}
/*!
 * Inherit from abstract Collection.
 */ Object.setPrototypeOf(NativeCollection.prototype, MongooseCollection.prototype);
/**
 * Called when the connection opens.
 *
 * @api private
 */ NativeCollection.prototype.onOpen = function() {
    this.collection = this.conn.db.collection(this.name);
    MongooseCollection.prototype.onOpen.call(this);
    return this.collection;
};
/**
 * Called when the connection closes
 *
 * @api private
 */ NativeCollection.prototype.onClose = function(force) {
    MongooseCollection.prototype.onClose.call(this, force);
};
/**
 * Helper to get the collection, in case `this.collection` isn't set yet.
 * May happen if `bufferCommands` is false and created the model when
 * Mongoose was disconnected.
 *
 * @api private
 */ NativeCollection.prototype._getCollection = function _getCollection() {
    if (this.collection) {
        return this.collection;
    }
    if (this.conn.db != null) {
        this.collection = this.conn.db.collection(this.name);
        return this.collection;
    }
    return null;
};
/*!
 * ignore
 */ const syncCollectionMethods = {
    watch: true,
    find: true,
    aggregate: true
};
/**
 * Copy the collection methods and make them subject to queues
 * @param {Number|String} I
 * @api private
 */ function iter(i) {
    NativeCollection.prototype[i] = function() {
        const collection = this._getCollection();
        const args = Array.from(arguments);
        const _this = this;
        const globalDebug = _this && _this.conn && _this.conn.base && _this.conn.base.options && _this.conn.base.options.debug;
        const connectionDebug = _this && _this.conn && _this.conn.options && _this.conn.options.debug;
        const debug = connectionDebug == null ? globalDebug : connectionDebug;
        const lastArg = arguments[arguments.length - 1];
        const opId = new ObjectId();
        // If user force closed, queueing will hang forever. See #5664
        if (this.conn.$wasForceClosed) {
            const error = new MongooseError('Connection was force closed');
            if (args.length > 0 && typeof args[args.length - 1] === 'function') {
                args[args.length - 1](error);
                return;
            } else {
                throw error;
            }
        }
        let _args = args;
        let callback = null;
        if (this._shouldBufferCommands() && this.buffer) {
            this.conn.emit('buffer', {
                _id: opId,
                modelName: _this.modelName,
                collectionName: _this.name,
                method: i,
                args: args
            });
            let callback;
            let _args = args;
            let promise = null;
            let timeout = null;
            if (syncCollectionMethods[i] && typeof lastArg === 'function') {
                this.addQueue(i, _args);
                callback = lastArg;
            } else if (syncCollectionMethods[i]) {
                promise = new this.Promise((resolve, reject)=>{
                    callback = function collectionOperationCallback(err, res) {
                        if (timeout != null) {
                            clearTimeout(timeout);
                        }
                        if (err != null) {
                            return reject(err);
                        }
                        resolve(res);
                    };
                    _args = args.concat([
                        callback
                    ]);
                    this.addQueue(i, _args);
                });
            } else if (typeof lastArg === 'function') {
                callback = function collectionOperationCallback() {
                    if (timeout != null) {
                        clearTimeout(timeout);
                    }
                    return lastArg.apply(this, arguments);
                };
                _args = args.slice(0, args.length - 1).concat([
                    callback
                ]);
            } else {
                promise = new Promise((resolve, reject)=>{
                    callback = function collectionOperationCallback(err, res) {
                        if (timeout != null) {
                            clearTimeout(timeout);
                        }
                        if (err != null) {
                            return reject(err);
                        }
                        resolve(res);
                    };
                    _args = args.concat([
                        callback
                    ]);
                    this.addQueue(i, _args);
                });
            }
            const bufferTimeoutMS = this._getBufferTimeoutMS();
            timeout = setTimeout(()=>{
                const removed = this.removeQueue(i, _args);
                if (removed) {
                    const message = 'Operation `' + this.name + '.' + i + '()` buffering timed out after ' + bufferTimeoutMS + 'ms';
                    const err = new MongooseError(message);
                    this.conn.emit('buffer-end', {
                        _id: opId,
                        modelName: _this.modelName,
                        collectionName: _this.name,
                        method: i,
                        error: err
                    });
                    callback(err);
                }
            }, bufferTimeoutMS);
            if (!syncCollectionMethods[i] && typeof lastArg === 'function') {
                this.addQueue(i, _args);
                return;
            }
            return promise;
        } else if (!syncCollectionMethods[i] && typeof lastArg === 'function') {
            callback = function collectionOperationCallback(err, res) {
                if (err != null) {
                    _this.conn.emit('operation-end', {
                        _id: opId,
                        modelName: _this.modelName,
                        collectionName: _this.name,
                        method: i,
                        error: err
                    });
                } else {
                    _this.conn.emit('operation-end', {
                        _id: opId,
                        modelName: _this.modelName,
                        collectionName: _this.name,
                        method: i,
                        result: res
                    });
                }
                return lastArg.apply(this, arguments);
            };
            _args = args.slice(0, args.length - 1).concat([
                callback
            ]);
        }
        if (debug) {
            if (typeof debug === 'function') {
                let argsToAdd = null;
                if (typeof args[args.length - 1] == 'function') {
                    argsToAdd = args.slice(0, args.length - 1);
                } else {
                    argsToAdd = args;
                }
                debug.apply(_this, [
                    _this.name,
                    i
                ].concat(argsToAdd));
            } else if (debug instanceof stream.Writable) {
                this.$printToStream(_this.name, i, args, debug);
            } else {
                const color = debug.color == null ? true : debug.color;
                const shell = debug.shell == null ? false : debug.shell;
                this.$print(_this.name, i, args, color, shell);
            }
        }
        this.conn.emit('operation-start', {
            _id: opId,
            modelName: _this.modelName,
            collectionName: this.name,
            method: i,
            params: _args
        });
        try {
            if (collection == null) {
                const message = 'Cannot call `' + this.name + '.' + i + '()` before initial connection ' + 'is complete if `bufferCommands = false`. Make sure you `await mongoose.connect()` if ' + 'you have `bufferCommands = false`.';
                throw new MongooseError(message);
            }
            if (syncCollectionMethods[i] && typeof lastArg === 'function') {
                const result = collection[i].apply(collection, _args.slice(0, _args.length - 1));
                this.conn.emit('operation-end', {
                    _id: opId,
                    modelName: _this.modelName,
                    collectionName: this.name,
                    method: i,
                    result
                });
                return lastArg.call(this, null, result);
            }
            const ret = collection[i].apply(collection, _args);
            if (ret != null && typeof ret.then === 'function') {
                return ret.then((result)=>{
                    if (typeof lastArg === 'function') {
                        lastArg(null, result);
                    } else {
                        this.conn.emit('operation-end', {
                            _id: opId,
                            modelName: _this.modelName,
                            collectionName: this.name,
                            method: i,
                            result
                        });
                    }
                    return result;
                }, (error)=>{
                    if (typeof lastArg === 'function') {
                        lastArg(error);
                        return;
                    } else {
                        this.conn.emit('operation-end', {
                            _id: opId,
                            modelName: _this.modelName,
                            collectionName: this.name,
                            method: i,
                            error
                        });
                    }
                    throw error;
                });
            }
            return ret;
        } catch (error) {
            // Collection operation may throw because of max bson size, catch it here
            // See gh-3906
            if (typeof lastArg === 'function') {
                return lastArg(error);
            } else {
                this.conn.emit('operation-end', {
                    _id: opId,
                    modelName: _this.modelName,
                    collectionName: this.name,
                    method: i,
                    error: error
                });
                throw error;
            }
        }
    };
}
for (const key of Object.getOwnPropertyNames(Collection.prototype)){
    // Janky hack to work around gh-3005 until we can get rid of the mongoose
    // collection abstraction
    const descriptor = Object.getOwnPropertyDescriptor(Collection.prototype, key);
    // Skip properties with getters because they may throw errors (gh-8528)
    if (descriptor.get !== undefined) {
        continue;
    }
    if (typeof Collection.prototype[key] !== 'function') {
        continue;
    }
    iter(key);
}
/**
 * Debug print helper
 *
 * @api public
 * @method $print
 */ NativeCollection.prototype.$print = function(name, i, args, color, shell) {
    const moduleName = color ? '\x1B[0;36mMongoose:\x1B[0m ' : 'Mongoose: ';
    const functionCall = [
        name,
        i
    ].join('.');
    const _args = [];
    for(let j = args.length - 1; j >= 0; --j){
        if (this.$format(args[j]) || _args.length) {
            _args.unshift(this.$format(args[j], color, shell));
        }
    }
    const params = '(' + _args.join(', ') + ')';
    console.info(moduleName + functionCall + params);
};
/**
 * Debug print helper
 *
 * @api public
 * @method $print
 */ NativeCollection.prototype.$printToStream = function(name, i, args, stream) {
    const functionCall = [
        name,
        i
    ].join('.');
    const _args = [];
    for(let j = args.length - 1; j >= 0; --j){
        if (this.$format(args[j]) || _args.length) {
            _args.unshift(this.$format(args[j]));
        }
    }
    const params = '(' + _args.join(', ') + ')';
    stream.write(functionCall + params, 'utf8');
};
/**
 * Formatter for debug print args
 *
 * @api public
 * @method $format
 */ NativeCollection.prototype.$format = function(arg, color, shell) {
    const type = typeof arg;
    if (type === 'function' || type === 'undefined') return '';
    return format(arg, false, color, shell);
};
/**
 * Debug print helper
 * @param {Any} representation
 * @api private
 */ function inspectable(representation) {
    const ret = {
        inspect: function() {
            return representation;
        }
    };
    if (util.inspect.custom) {
        ret[util.inspect.custom] = ret.inspect;
    }
    return ret;
}
function map(o) {
    return format(o, true);
}
function formatObjectId(x, key) {
    x[key] = inspectable('ObjectId("' + x[key].toHexString() + '")');
}
function formatDate(x, key, shell) {
    if (shell) {
        x[key] = inspectable('ISODate("' + x[key].toUTCString() + '")');
    } else {
        x[key] = inspectable('new Date("' + x[key].toUTCString() + '")');
    }
}
function format(obj, sub, color, shell) {
    if (obj && typeof obj.toBSON === 'function') {
        obj = obj.toBSON();
    }
    if (obj == null) {
        return obj;
    }
    const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
    // `sub` indicates `format()` was called recursively, so skip cloning because we already
    // did a deep clone on the top-level object.
    let x = sub ? obj : clone(obj, formatToObjectOptions);
    const constructorName = getConstructorName(x);
    if (constructorName === 'Binary') {
        x = 'BinData(' + x.sub_type + ', "' + x.toString('base64') + '")';
    } else if (constructorName === 'ObjectId') {
        x = inspectable('ObjectId("' + x.toHexString() + '")');
    } else if (constructorName === 'Date') {
        x = inspectable('new Date("' + x.toUTCString() + '")');
    } else if (constructorName === 'Object') {
        const keys = Object.keys(x);
        const numKeys = keys.length;
        let key;
        for(let i = 0; i < numKeys; ++i){
            key = keys[i];
            if (x[key]) {
                let error;
                if (typeof x[key].toBSON === 'function') {
                    try {
                        // `session.toBSON()` throws an error. This means we throw errors
                        // in debug mode when using transactions, see gh-6712. As a
                        // workaround, catch `toBSON()` errors, try to serialize without
                        // `toBSON()`, and rethrow if serialization still fails.
                        x[key] = x[key].toBSON();
                    } catch (_error) {
                        error = _error;
                    }
                }
                const _constructorName = getConstructorName(x[key]);
                if (_constructorName === 'Binary') {
                    x[key] = 'BinData(' + x[key].sub_type + ', "' + x[key].buffer.toString('base64') + '")';
                } else if (_constructorName === 'Object') {
                    x[key] = format(x[key], true);
                } else if (_constructorName === 'ObjectId') {
                    formatObjectId(x, key);
                } else if (_constructorName === 'Date') {
                    formatDate(x, key, shell);
                } else if (_constructorName === 'ClientSession') {
                    x[key] = inspectable('ClientSession("' + (x[key] && x[key].id && x[key].id.id && x[key].id.id.buffer || '').toString('hex') + '")');
                } else if (Array.isArray(x[key])) {
                    x[key] = x[key].map(map);
                } else if (error != null) {
                    // If there was an error with `toBSON()` and the object wasn't
                    // already converted to a string representation, rethrow it.
                    // Open to better ideas on how to handle this.
                    throw error;
                }
            }
        }
    }
    if (sub) {
        return x;
    }
    return util.inspect(x, false, 10, color).replace(/\n/g, '').replace(/\s{2,}/g, ' ');
}
/**
 * Retrieves information about this collections indexes.
 *
 * @method getIndexes
 * @api public
 */ NativeCollection.prototype.getIndexes = NativeCollection.prototype.indexInformation;
/*!
 * Module exports.
 */ module.exports = NativeCollection;
}),
"[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/connection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseConnection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connection.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const STATES = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connectionState.js [app-route] (ecmascript)");
const mongodb = __turbopack_context__.r("[project]/backend/node_modules/mongodb/lib/index.js [app-route] (ecmascript)");
const pkg = __turbopack_context__.r("[project]/backend/node_modules/mongoose/package.json (json)");
const processConnectionOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/processConnectionOptions.js [app-route] (ecmascript)");
const setTimeout = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/timers.js [app-route] (ecmascript)").setTimeout;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const Schema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)");
/**
 * A [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) connection implementation.
 *
 * @inherits Connection
 * @api private
 */ function NativeConnection() {
    MongooseConnection.apply(this, arguments);
    this._listening = false;
    // Tracks the last time (as unix timestamp) the connection received a
    // serverHeartbeatSucceeded or serverHeartbeatFailed event from the underlying MongoClient.
    // If we haven't received one in a while (like due to a frozen AWS Lambda container) then
    // `readyState` is likely stale.
    this._lastHeartbeatAt = null;
}
/**
 * Expose the possible connection states.
 * @api public
 */ NativeConnection.STATES = STATES;
/*!
 * Inherits from Connection.
 */ Object.setPrototypeOf(NativeConnection.prototype, MongooseConnection.prototype);
/**
 * Switches to a different database using the same connection pool.
 *
 * Returns a new connection object, with the new db. If you set the `useCache`
 * option, `useDb()` will cache connections by `name`.
 *
 * **Note:** Calling `close()` on a `useDb()` connection will close the base connection as well.
 *
 * @param {String} name The database name
 * @param {Object} [options]
 * @param {Boolean} [options.useCache=false] If true, cache results so calling `useDb()` multiple times with the same name only creates 1 connection object.
 * @param {Boolean} [options.noListener=false] If true, the new connection object won't listen to any events on the base connection. This is better for memory usage in cases where you're calling `useDb()` for every request.
 * @return {Connection} New Connection Object
 * @api public
 */ NativeConnection.prototype.useDb = function(name, options) {
    // Return immediately if cached
    options = options || {};
    if (options.useCache && this.relatedDbs[name]) {
        return this.relatedDbs[name];
    }
    // we have to manually copy all of the attributes...
    const newConn = new this.constructor();
    newConn.name = name;
    newConn.base = this.base;
    newConn.collections = {};
    newConn.models = {};
    newConn.replica = this.replica;
    newConn.config = Object.assign({}, this.config, newConn.config);
    newConn.name = this.name;
    newConn.options = this.options;
    newConn._readyState = this._readyState;
    newConn._closeCalled = this._closeCalled;
    newConn._hasOpened = this._hasOpened;
    newConn._listening = false;
    newConn._parent = this;
    newConn.host = this.host;
    newConn.port = this.port;
    newConn.user = this.user;
    newConn.pass = this.pass;
    // First, when we create another db object, we are not guaranteed to have a
    // db object to work with. So, in the case where we have a db object and it
    // is connected, we can just proceed with setting everything up. However, if
    // we do not have a db or the state is not connected, then we need to wait on
    // the 'open' event of the connection before doing the rest of the setup
    // the 'connected' event is the first time we'll have access to the db object
    const _this = this;
    newConn.client = _this.client;
    if (this.db && this._readyState === STATES.connected) {
        wireup();
    } else {
        this._queue.push({
            fn: wireup
        });
    }
    function wireup() {
        newConn.client = _this.client;
        const _opts = {};
        if (options.hasOwnProperty('noListener')) {
            _opts.noListener = options.noListener;
        }
        newConn.db = _this.client.db(name, _opts);
        newConn._lastHeartbeatAt = _this._lastHeartbeatAt;
        newConn.onOpen();
    }
    newConn.name = name;
    // push onto the otherDbs stack, this is used when state changes and when heartbeat is received
    if (options.noListener !== true) {
        this.otherDbs.push(newConn);
    }
    newConn.otherDbs.push(this);
    // push onto the relatedDbs cache, this is used when state changes
    if (options && options.useCache) {
        this.relatedDbs[newConn.name] = newConn;
        newConn.relatedDbs = this.relatedDbs;
    }
    return newConn;
};
/**
 * Runs a [db-level aggregate()](https://www.mongodb.com/docs/manual/reference/method/db.aggregate/) on this connection's underlying `db`
 *
 * @param {Array} pipeline
 * @param {Object} [options]
 */ NativeConnection.prototype.aggregate = function aggregate(pipeline, options) {
    return new this.base.Aggregate(null, this).append(pipeline).option(options ?? {});
};
/**
 * Removes the database connection with the given name created with `useDb()`.
 *
 * Throws an error if the database connection was not found.
 *
 * #### Example:
 *
 *     // Connect to `initialdb` first
 *     const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/initialdb').asPromise();
 *
 *     // Creates an un-cached connection to `mydb`
 *     const db = conn.useDb('mydb');
 *
 *     // Closes `db`, and removes `db` from `conn.relatedDbs` and `conn.otherDbs`
 *     await conn.removeDb('mydb');
 *
 * @method removeDb
 * @memberOf Connection
 * @param {String} name The database name
 * @return {Connection} this
 */ NativeConnection.prototype.removeDb = function removeDb(name) {
    const dbs = this.otherDbs.filter((db)=>db.name === name);
    if (!dbs.length) {
        throw new MongooseError(`No connections to database "${name}" found`);
    }
    for (const db of dbs){
        db._closeCalled = true;
        db._destroyCalled = true;
        db._readyState = STATES.disconnected;
        db.$wasForceClosed = true;
    }
    delete this.relatedDbs[name];
    this.otherDbs = this.otherDbs.filter((db)=>db.name !== name);
};
/**
 * Closes the connection
 *
 * @param {Boolean} [force]
 * @return {Connection} this
 * @api private
 */ NativeConnection.prototype.doClose = async function doClose(force) {
    if (this.client == null) {
        return this;
    }
    let skipCloseClient = false;
    if (force != null && typeof force === 'object') {
        skipCloseClient = force.skipCloseClient;
        force = force.force;
    }
    if (skipCloseClient) {
        return this;
    }
    await this.client.close(force);
    // Defer because the driver will wait at least 1ms before finishing closing
    // the pool, see https://github.com/mongodb-js/mongodb-core/blob/a8f8e4ce41936babc3b9112bf42d609779f03b39/lib/connection/pool.js#L1026-L1030.
    // If there's queued operations, you may still get some background work
    // after the callback is called.
    await new Promise((resolve)=>setTimeout(resolve, 1));
    return this;
};
/**
 * Implementation of `listDatabases()` for MongoDB driver
 *
 * @return Promise
 * @api public
 */ NativeConnection.prototype.listDatabases = async function listDatabases() {
    await this._waitForConnect();
    return await this.db.admin().listDatabases();
};
/*!
 * ignore
 */ NativeConnection.prototype.createClient = async function createClient(uri, options) {
    if (typeof uri !== 'string') {
        throw new MongooseError('The `uri` parameter to `openUri()` must be a ' + `string, got "${typeof uri}". Make sure the first parameter to ` + '`mongoose.connect()` or `mongoose.createConnection()` is a string.');
    }
    if (this._destroyCalled) {
        throw new MongooseError('Connection has been closed and destroyed, and cannot be used for re-opening the connection. ' + 'Please create a new connection with `mongoose.createConnection()` or `mongoose.connect()`.');
    }
    if (this.readyState === STATES.connecting || this.readyState === STATES.connected) {
        if (this._connectionString !== uri) {
            throw new MongooseError('Can\'t call `openUri()` on an active connection with ' + 'different connection strings. Make sure you aren\'t calling `mongoose.connect()` ' + 'multiple times. See: https://mongoosejs.com/docs/connections.html#multiple_connections');
        }
    }
    options = processConnectionOptions(uri, options);
    if (options) {
        const autoIndex = options.config && options.config.autoIndex != null ? options.config.autoIndex : options.autoIndex;
        if (autoIndex != null) {
            this.config.autoIndex = autoIndex !== false;
            delete options.config;
            delete options.autoIndex;
        }
        if ('autoCreate' in options) {
            this.config.autoCreate = !!options.autoCreate;
            delete options.autoCreate;
        }
        if ('sanitizeFilter' in options) {
            this.config.sanitizeFilter = options.sanitizeFilter;
            delete options.sanitizeFilter;
        }
        if ('autoSearchIndex' in options) {
            this.config.autoSearchIndex = options.autoSearchIndex;
            delete options.autoSearchIndex;
        }
        if ('bufferTimeoutMS' in options) {
            this.config.bufferTimeoutMS = options.bufferTimeoutMS;
            delete options.bufferTimeoutMS;
        }
        // Backwards compat
        if (options.user || options.pass) {
            options.auth = options.auth || {};
            options.auth.username = options.user;
            options.auth.password = options.pass;
            this.user = options.user;
            this.pass = options.pass;
        }
        delete options.user;
        delete options.pass;
        if (options.bufferCommands != null) {
            this.config.bufferCommands = options.bufferCommands;
            delete options.bufferCommands;
        }
    } else {
        options = {};
    }
    this._connectionOptions = options;
    const dbName = options.dbName;
    if (dbName != null) {
        this.$dbName = dbName;
    }
    delete options.dbName;
    if (!utils.hasUserDefinedProperty(options, 'driverInfo')) {
        options.driverInfo = {
            name: 'Mongoose',
            version: pkg.version
        };
    }
    const { schemaMap, encryptedFieldsMap } = this._buildEncryptionSchemas();
    if ((Object.keys(schemaMap).length > 0 || Object.keys(encryptedFieldsMap).length) && !options.autoEncryption) {
        throw new Error('Must provide `autoEncryption` when connecting with encrypted schemas.');
    }
    if (Object.keys(schemaMap).length > 0) {
        options.autoEncryption.schemaMap = schemaMap;
    }
    if (Object.keys(encryptedFieldsMap).length > 0) {
        options.autoEncryption.encryptedFieldsMap = encryptedFieldsMap;
    }
    this.readyState = STATES.connecting;
    this._connectionString = uri;
    let client;
    try {
        client = new mongodb.MongoClient(uri, options);
    } catch (error) {
        this.readyState = STATES.disconnected;
        throw error;
    }
    this.client = client;
    client.setMaxListeners(0);
    await client.connect();
    _setClient(this, client, options, dbName);
    for (const db of this.otherDbs){
        _setClient(db, client, {}, db.name);
    }
    return this;
};
/**
 * Given a connection, which may or may not have encrypted models, build
 * a schemaMap and/or an encryptedFieldsMap for the connection, combining all models
 * into a single schemaMap and encryptedFields map.
 *
 * @returns the generated schemaMap and encryptedFieldsMap
  */ NativeConnection.prototype._buildEncryptionSchemas = function() {
    const qeMappings = {};
    const csfleMappings = {};
    const encryptedModels = Object.values(this.models).filter((model)=>model.schema._hasEncryptedFields());
    // If discriminators are configured for the collection, there might be multiple models
    // pointing to the same namespace.  For this scenario, we merge all the schemas for each namespace
    // into a single schema and then generate a schemaMap/encryptedFieldsMap for the combined schema.
    for (const model of encryptedModels){
        const { schema, collection: { collectionName } } = model;
        const namespace = `${this.$dbName}.${collectionName}`;
        const mappings = schema.encryptionType() === 'csfle' ? csfleMappings : qeMappings;
        mappings[namespace] ??= new Schema({}, {
            encryptionType: schema.encryptionType()
        });
        const isNonRootDiscriminator = schema.discriminatorMapping && !schema.discriminatorMapping.isRoot;
        if (isNonRootDiscriminator) {
            const rootSchema = schema._baseSchema;
            schema.eachPath((pathname)=>{
                if (rootSchema.path(pathname)) return;
                if (!mappings[namespace]._hasEncryptedField(pathname)) return;
                throw new Error(`Cannot have duplicate keys in discriminators with encryption. key=${pathname}`);
            });
        }
        mappings[namespace].add(schema);
    }
    const schemaMap = Object.fromEntries(Object.entries(csfleMappings).map(([namespace, schema])=>[
            namespace,
            schema._buildSchemaMap()
        ]));
    const encryptedFieldsMap = Object.fromEntries(Object.entries(qeMappings).map(([namespace, schema])=>[
            namespace,
            schema._buildEncryptedFields()
        ]));
    return {
        schemaMap,
        encryptedFieldsMap
    };
};
/*!
 * ignore
 */ NativeConnection.prototype.setClient = function setClient(client) {
    if (!(client instanceof mongodb.MongoClient)) {
        throw new MongooseError('Must call `setClient()` with an instance of MongoClient');
    }
    if (this.readyState !== STATES.disconnected) {
        throw new MongooseError('Cannot call `setClient()` on a connection that is already connected.');
    }
    if (client.topology == null) {
        throw new MongooseError('Cannot call `setClient()` with a MongoClient that you have not called `connect()` on yet.');
    }
    this._connectionString = client.s.url;
    _setClient(this, client, {}, client.s.options.dbName);
    for (const model of Object.values(this.models)){
        // Errors handled internally, so safe to ignore error
        model.init().catch(function $modelInitNoop() {});
    }
    return this;
};
/*!
 * ignore
 */ function _setClient(conn, client, options, dbName) {
    const db = dbName != null ? client.db(dbName) : client.db();
    conn.db = db;
    conn.client = client;
    conn.host = client && client.s && client.s.options && client.s.options.hosts && client.s.options.hosts[0] && client.s.options.hosts[0].host || void 0;
    conn.port = client && client.s && client.s.options && client.s.options.hosts && client.s.options.hosts[0] && client.s.options.hosts[0].port || void 0;
    conn.name = dbName != null ? dbName : db.databaseName;
    conn._closeCalled = client._closeCalled;
    const _handleReconnect = ()=>{
        // If we aren't disconnected, we assume this reconnect is due to a
        // socket timeout. If there's no activity on a socket for
        // `socketTimeoutMS`, the driver will attempt to reconnect and emit
        // this event.
        if (conn.readyState !== STATES.connected) {
            conn.readyState = STATES.connected;
            conn.emit('reconnect');
            conn.emit('reconnected');
            conn.onOpen();
        }
    };
    const type = client && client.topology && client.topology.description && client.topology.description.type || '';
    if (type === 'Single') {
        client.on('serverDescriptionChanged', (ev)=>{
            const newDescription = ev.newDescription;
            if (newDescription.type === 'Unknown') {
                conn.readyState = STATES.disconnected;
            } else {
                _handleReconnect();
            }
        });
    } else if (type.startsWith('ReplicaSet')) {
        client.on('topologyDescriptionChanged', (ev)=>{
            // Emit disconnected if we've lost connectivity to the primary
            const description = ev.newDescription;
            if (conn.readyState === STATES.connected && description.type !== 'ReplicaSetWithPrimary') {
                // Implicitly emits 'disconnected'
                conn.readyState = STATES.disconnected;
            } else if (conn.readyState === STATES.disconnected && description.type === 'ReplicaSetWithPrimary') {
                _handleReconnect();
            }
        });
    }
    conn._lastHeartbeatAt = null;
    client.on('serverHeartbeatSucceeded', ()=>{
        conn._lastHeartbeatAt = Date.now();
        for (const otherDb of conn.otherDbs){
            otherDb._lastHeartbeatAt = conn._lastHeartbeatAt;
        }
    });
    if (options.monitorCommands) {
        client.on('commandStarted', (data)=>conn.emit('commandStarted', data));
        client.on('commandFailed', (data)=>conn.emit('commandFailed', data));
        client.on('commandSucceeded', (data)=>conn.emit('commandSucceeded', data));
    }
    conn.onOpen();
    for(const i in conn.collections){
        if (utils.object.hasOwnProperty(conn.collections, i)) {
            conn.collections[i].onOpen();
        }
    }
}
/*!
 * Module exports.
 */ module.exports = NativeConnection;
}),
"[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module exports.
 */ exports.BulkWriteResult = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/bulkWriteResult.js [app-route] (ecmascript)");
exports.Collection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js [app-route] (ecmascript)");
exports.Connection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/connection.js [app-route] (ecmascript)");
exports.ClientEncryption = __turbopack_context__.r("[project]/backend/node_modules/mongodb/lib/index.js [app-route] (ecmascript)").ClientEncryption;
}),
"[project]/backend/node_modules/mongoose/lib/connectionState.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Connection states
 */ const STATES = module.exports = exports = Object.create(null);
const disconnected = 'disconnected';
const connected = 'connected';
const connecting = 'connecting';
const disconnecting = 'disconnecting';
const uninitialized = 'uninitialized';
STATES[0] = disconnected;
STATES[1] = connected;
STATES[2] = connecting;
STATES[3] = disconnecting;
STATES[99] = uninitialized;
STATES[disconnected] = 0;
STATES[connected] = 1;
STATES[connecting] = 2;
STATES[disconnecting] = 3;
STATES[uninitialized] = 99;
}),
"[project]/backend/node_modules/mongoose/lib/collection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const STATES = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connectionState.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
/**
 * Abstract Collection constructor
 *
 * This is the base class that drivers inherit from and implement.
 *
 * @param {String} name name of the collection
 * @param {Connection} conn A MongooseConnection instance
 * @param {Object} [opts] optional collection options
 * @api public
 */ function Collection(name, conn, opts) {
    if (opts === void 0) {
        opts = {};
    }
    this.opts = opts;
    this.name = name;
    this.collectionName = name;
    this.conn = conn;
    this.queue = [];
    this.buffer = !conn?._hasOpened;
    this.emitter = new EventEmitter();
    if (STATES.connected === this.conn.readyState) {
        this.onOpen();
    }
}
/**
 * The collection name
 *
 * @api public
 * @property name
 */ Collection.prototype.name;
/**
 * The collection name
 *
 * @api public
 * @property collectionName
 */ Collection.prototype.collectionName;
/**
 * The Connection instance
 *
 * @api public
 * @property conn
 */ Collection.prototype.conn;
/**
 * Called when the database connects
 *
 * @api private
 */ Collection.prototype.onOpen = function() {
    this.buffer = false;
    immediate(()=>this.doQueue());
};
/**
 * Called when the database disconnects
 *
 * @api private
 */ Collection.prototype.onClose = function() {};
/**
 * Queues a method for later execution when its
 * database connection opens.
 *
 * @param {String} name name of the method to queue
 * @param {Array} args arguments to pass to the method when executed
 * @api private
 */ Collection.prototype.addQueue = function(name, args) {
    this.queue.push([
        name,
        args
    ]);
    return this;
};
/**
 * Removes a queued method
 *
 * @param {String} name name of the method to queue
 * @param {Array} args arguments to pass to the method when executed
 * @api private
 */ Collection.prototype.removeQueue = function(name, args) {
    const index = this.queue.findIndex((v)=>v[0] === name && v[1] === args);
    if (index === -1) {
        return false;
    }
    this.queue.splice(index, 1);
    return true;
};
/**
 * Executes all queued methods and clears the queue.
 *
 * @api private
 */ Collection.prototype.doQueue = function() {
    for (const method of this.queue){
        if (typeof method[0] === 'function') {
            method[0].apply(this, method[1]);
        } else {
            this[method[0]].apply(this, method[1]);
        }
    }
    this.queue = [];
    const _this = this;
    immediate(function() {
        _this.emitter.emit('queue');
    });
    return this;
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.ensureIndex = function() {
    throw new Error('Collection#ensureIndex unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.createIndex = function() {
    throw new Error('Collection#createIndex unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.findAndModify = function() {
    throw new Error('Collection#findAndModify unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.findOneAndUpdate = function() {
    throw new Error('Collection#findOneAndUpdate unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.findOneAndDelete = function() {
    throw new Error('Collection#findOneAndDelete unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.findOneAndReplace = function() {
    throw new Error('Collection#findOneAndReplace unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.findOne = function() {
    throw new Error('Collection#findOne unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.find = function() {
    throw new Error('Collection#find unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.insert = function() {
    throw new Error('Collection#insert unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.insertOne = function() {
    throw new Error('Collection#insertOne unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.insertMany = function() {
    throw new Error('Collection#insertMany unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.save = function() {
    throw new Error('Collection#save unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.updateOne = function() {
    throw new Error('Collection#updateOne unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.updateMany = function() {
    throw new Error('Collection#updateMany unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.deleteOne = function() {
    throw new Error('Collection#deleteOne unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.deleteMany = function() {
    throw new Error('Collection#deleteMany unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.getIndexes = function() {
    throw new Error('Collection#getIndexes unimplemented by driver');
};
/**
 * Abstract method that drivers must implement.
 */ Collection.prototype.watch = function() {
    throw new Error('Collection#watch unimplemented by driver');
};
/*!
 * ignore
 */ Collection.prototype._shouldBufferCommands = function _shouldBufferCommands() {
    const opts = this.opts;
    if (opts.bufferCommands != null) {
        return opts.bufferCommands;
    }
    if (opts && opts.schemaUserProvidedOptions != null && opts.schemaUserProvidedOptions.bufferCommands != null) {
        return opts.schemaUserProvidedOptions.bufferCommands;
    }
    return this.conn._shouldBufferCommands();
};
/*!
 * ignore
 */ Collection.prototype._getBufferTimeoutMS = function _getBufferTimeoutMS() {
    const conn = this.conn;
    const opts = this.opts;
    if (opts.bufferTimeoutMS != null) {
        return opts.bufferTimeoutMS;
    }
    if (opts && opts.schemaUserProvidedOptions != null && opts.schemaUserProvidedOptions.bufferTimeoutMS != null) {
        return opts.schemaUserProvidedOptions.bufferTimeoutMS;
    }
    return conn._getBufferTimeoutMS();
};
/*!
 * Module exports.
 */ module.exports = Collection;
}),
"[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ class MongooseError extends Error {
}
Object.defineProperty(MongooseError.prototype, 'name', {
    value: 'MongooseError'
});
module.exports = MongooseError;
}),
"[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * Casting Error constructor.
 *
 * @param {String} type
 * @param {String} value
 * @inherits MongooseError
 * @api private
 */ class CastError extends MongooseError {
    constructor(type, value, path, reason, schemaType){
        // If no args, assume we'll `init()` later.
        if (arguments.length > 0) {
            const valueType = getValueType(value);
            const messageFormat = getMessageFormat(schemaType);
            const msg = formatMessage(null, type, value, path, messageFormat, valueType, reason);
            super(msg);
            this.init(type, value, path, reason, schemaType);
        } else {
            super(formatMessage());
        }
    }
    toJSON() {
        return {
            stringValue: this.stringValue,
            valueType: this.valueType,
            kind: this.kind,
            value: this.value,
            path: this.path,
            reason: this.reason,
            name: this.name,
            message: this.message
        };
    }
    /*!
   * ignore
   */ init(type, value, path, reason, schemaType) {
        this.stringValue = getStringValue(value);
        this.messageFormat = getMessageFormat(schemaType);
        this.kind = type;
        this.value = value;
        this.path = path;
        this.reason = reason;
        this.valueType = getValueType(value);
    }
    /**
   * ignore
   * @param {Readonly<CastError>} other
   * @api private
   */ copy(other) {
        this.messageFormat = other.messageFormat;
        this.stringValue = other.stringValue;
        this.kind = other.kind;
        this.value = other.value;
        this.path = other.path;
        this.reason = other.reason;
        this.message = other.message;
        this.valueType = other.valueType;
    }
    /*!
   * ignore
   */ setModel(model) {
        this.message = formatMessage(model, this.kind, this.value, this.path, this.messageFormat, this.valueType);
    }
}
Object.defineProperty(CastError.prototype, 'name', {
    value: 'CastError'
});
function getStringValue(value) {
    let stringValue = util.inspect(value);
    stringValue = stringValue.replace(/^'|'$/g, '"');
    if (!stringValue.startsWith('"')) {
        stringValue = '"' + stringValue + '"';
    }
    return stringValue;
}
function getValueType(value) {
    if (value == null) {
        return '' + value;
    }
    const t = typeof value;
    if (t !== 'object') {
        return t;
    }
    if (typeof value.constructor !== 'function') {
        return t;
    }
    return value.constructor.name;
}
function getMessageFormat(schemaType) {
    const messageFormat = schemaType && schemaType._castErrorMessage || null;
    if (typeof messageFormat === 'string' || typeof messageFormat === 'function') {
        return messageFormat;
    }
}
/*!
 * ignore
 */ function formatMessage(model, kind, value, path, messageFormat, valueType, reason) {
    if (typeof messageFormat === 'string') {
        const stringValue = getStringValue(value);
        let ret = messageFormat.replace('{KIND}', kind).replace('{VALUE}', stringValue).replace('{PATH}', path);
        if (model != null) {
            ret = ret.replace('{MODEL}', model.modelName);
        }
        return ret;
    } else if (typeof messageFormat === 'function') {
        return messageFormat(value, path, model, kind);
    } else {
        const stringValue = getStringValue(value);
        const valueTypeMsg = valueType ? ' (type ' + valueType + ')' : '';
        let ret = 'Cast to ' + kind + ' failed for value ' + stringValue + valueTypeMsg + ' at path "' + path + '"';
        if (model != null) {
            ret += ' for model "' + model.modelName + '"';
        }
        if (reason != null && typeof reason.constructor === 'function' && reason.constructor.name !== 'AssertionError' && reason.constructor.name !== 'Error') {
            ret += ' because of "' + reason.constructor.name + '"';
        }
        return ret;
    }
}
/*!
 * exports
 */ module.exports = CastError;
}),
"[project]/backend/node_modules/mongoose/lib/error/messages.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * The default built-in validator error messages. These may be customized.
 *
 *     // customize within each schema or globally like so
 *     const mongoose = require('mongoose');
 *     mongoose.Error.messages.String.enum  = "Your custom message for {PATH}.";
 *
 * Error messages support basic templating. Mongoose will replace the following strings with the corresponding value.
 *
 * - `{PATH}` is replaced with the invalid document path
 * - `{VALUE}` is replaced with the invalid value
 * - `{TYPE}` is replaced with the validator type such as "regexp", "min", or "user defined"
 * - `{MIN}` is replaced with the declared min value for the Number.min validator
 * - `{MAX}` is replaced with the declared max value for the Number.max validator
 *
 * Click the "show code" link below to see all defaults.
 *
 * @static
 * @memberOf MongooseError
 * @api public
 */ const msg = module.exports = exports = {};
msg.DocumentNotFoundError = null;
msg.general = {};
msg.general.default = 'Validator failed for path `{PATH}` with value `{VALUE}`';
msg.general.required = 'Path `{PATH}` is required.';
msg.Number = {};
msg.Number.min = 'Path `{PATH}` ({VALUE}) is less than minimum allowed value ({MIN}).';
msg.Number.max = 'Path `{PATH}` ({VALUE}) is more than maximum allowed value ({MAX}).';
msg.Number.enum = '`{VALUE}` is not a valid enum value for path `{PATH}`.';
msg.Date = {};
msg.Date.min = 'Path `{PATH}` ({VALUE}) is before minimum allowed value ({MIN}).';
msg.Date.max = 'Path `{PATH}` ({VALUE}) is after maximum allowed value ({MAX}).';
msg.String = {};
msg.String.enum = '`{VALUE}` is not a valid enum value for path `{PATH}`.';
msg.String.match = 'Path `{PATH}` is invalid ({VALUE}).';
msg.String.minlength = 'Path `{PATH}` (`{VALUE}`, length {LENGTH}) is shorter than the minimum allowed length ({MINLENGTH}).';
msg.String.maxlength = 'Path `{PATH}` (`{VALUE}`, length {LENGTH}) is longer than the maximum allowed length ({MAXLENGTH}).';
}),
"[project]/backend/node_modules/mongoose/lib/error/notFound.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * OverwriteModel Error constructor.
 * @api private
 */ class DocumentNotFoundError extends MongooseError {
    constructor(filter, model, numAffected, result){
        let msg;
        const messages = MongooseError.messages;
        if (messages.DocumentNotFoundError != null) {
            msg = typeof messages.DocumentNotFoundError === 'function' ? messages.DocumentNotFoundError(filter, model) : messages.DocumentNotFoundError;
        } else {
            msg = 'No document found for query "' + util.inspect(filter) + '" on model "' + model + '"';
        }
        super(msg);
        this.result = result;
        this.numAffected = numAffected;
        this.filter = filter;
        // Backwards compat
        this.query = filter;
    }
}
Object.defineProperty(DocumentNotFoundError.prototype, 'name', {
    value: 'DocumentNotFoundError'
});
/*!
 * exports
 */ module.exports = DocumentNotFoundError;
}),
"[project]/backend/node_modules/mongoose/lib/error/validation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const combinePathErrors = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/error/combinePathErrors.js [app-route] (ecmascript)");
/**
 * Document Validation Error
 *
 * @api private
 * @param {Document} [instance]
 * @inherits MongooseError
 */ class ValidationError extends MongooseError {
    constructor(instance){
        let _message;
        if (getConstructorName(instance) === 'model') {
            _message = instance.constructor.modelName + ' validation failed';
        } else {
            _message = 'Validation failed';
        }
        super(_message);
        this.errors = {};
        this._message = _message;
        if (instance) {
            instance.$errors = this.errors;
        }
    }
    /**
   * Console.log helper
   */ toString() {
        return this.name + ': ' + combinePathErrors(this);
    }
    /**
   * inspect helper
   * @api private
   */ inspect() {
        return Object.assign(new Error(this.message), this);
    }
    /**
  * add message
  * @param {String} path
  * @param {String|Error} error
  * @api private
  */ addError(path, error) {
        if (error instanceof ValidationError) {
            const { errors } = error;
            for (const errorPath of Object.keys(errors)){
                this.addError(`${path}.${errorPath}`, errors[errorPath]);
            }
            return;
        }
        this.errors[path] = error;
        this.message = this._message + ': ' + combinePathErrors(this);
    }
}
if (util.inspect.custom) {
    // Avoid Node deprecation warning DEP0079
    ValidationError.prototype[util.inspect.custom] = ValidationError.prototype.inspect;
}
/**
 * Helper for JSON.stringify
 * Ensure `name` and `message` show up in toJSON output re: gh-9847
 * @api private
 */ Object.defineProperty(ValidationError.prototype, 'toJSON', {
    enumerable: false,
    writable: false,
    configurable: true,
    value: function() {
        return Object.assign({}, this, {
            name: this.name,
            message: this.message
        });
    }
});
Object.defineProperty(ValidationError.prototype, 'name', {
    value: 'ValidationError'
});
/*!
 * Module exports
 */ module.exports = ValidationError;
}),
"[project]/backend/node_modules/mongoose/lib/error/validator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Schema validator error
 *
 * @param {Object} properties
 * @param {Document} doc
 * @api private
 */ class ValidatorError extends MongooseError {
    constructor(properties, doc){
        let msg = properties.message;
        if (!msg) {
            msg = MongooseError.messages.general.default;
        }
        const message = formatMessage(msg, properties, doc);
        super(message);
        properties = Object.assign({}, properties, {
            message: message
        });
        this.properties = properties;
        this.kind = properties.type;
        this.path = properties.path;
        this.value = properties.value;
        this.reason = properties.reason;
    }
    /**
   * toString helper
   * TODO remove? This defaults to `${this.name}: ${this.message}`
   * @api private
   */ toString() {
        return this.message;
    }
    /**
   * Ensure `name` and `message` show up in toJSON output re: gh-9296
   * @api private
   */ toJSON() {
        return Object.assign({
            name: this.name,
            message: this.message
        }, this);
    }
}
Object.defineProperty(ValidatorError.prototype, 'name', {
    value: 'ValidatorError'
});
/**
 * The object used to define this validator. Not enumerable to hide
 * it from `require('util').inspect()` output re: gh-3925
 * @api private
 */ Object.defineProperty(ValidatorError.prototype, 'properties', {
    enumerable: false,
    writable: true,
    value: null
});
// Exposed for testing
ValidatorError.prototype.formatMessage = formatMessage;
/**
 * Formats error messages
 * @api private
 */ function formatMessage(msg, properties, doc) {
    if (typeof msg === 'function') {
        return msg(properties, doc);
    }
    const propertyNames = Object.keys(properties);
    for (const propertyName of propertyNames){
        if (propertyName === 'message') {
            continue;
        }
        msg = msg.replace('{' + propertyName.toUpperCase() + '}', properties[propertyName]);
    }
    return msg;
}
/*!
 * exports
 */ module.exports = ValidatorError;
}),
"[project]/backend/node_modules/mongoose/lib/error/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Version Error constructor.
 *
 * @param {Document} doc
 * @param {Number} currentVersion
 * @param {Array<String>} modifiedPaths
 * @api private
 */ class VersionError extends MongooseError {
    constructor(doc, currentVersion, modifiedPaths){
        const modifiedPathsStr = modifiedPaths.join(', ');
        super('No matching document found for id "' + doc._doc._id + '" version ' + currentVersion + ' modifiedPaths "' + modifiedPathsStr + '"');
        this.version = currentVersion;
        this.modifiedPaths = modifiedPaths;
    }
}
Object.defineProperty(VersionError.prototype, 'name', {
    value: 'VersionError'
});
/*!
 * exports
 */ module.exports = VersionError;
}),
"[project]/backend/node_modules/mongoose/lib/error/parallelSave.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * ParallelSave Error constructor.
 *
 * @param {Document} doc
 * @api private
 */ class ParallelSaveError extends MongooseError {
    constructor(doc){
        const msg = 'Can\'t save() the same doc multiple times in parallel. Document: ';
        super(msg + doc._doc._id);
    }
}
Object.defineProperty(ParallelSaveError.prototype, 'name', {
    value: 'ParallelSaveError'
});
/*!
 * exports
 */ module.exports = ParallelSaveError;
}),
"[project]/backend/node_modules/mongoose/lib/error/overwriteModel.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * OverwriteModel Error constructor.
 * @param {String} name
 * @api private
 */ class OverwriteModelError extends MongooseError {
    constructor(name){
        super('Cannot overwrite `' + name + '` model once compiled.');
    }
}
Object.defineProperty(OverwriteModelError.prototype, 'name', {
    value: 'OverwriteModelError'
});
/*!
 * exports
 */ module.exports = OverwriteModelError;
}),
"[project]/backend/node_modules/mongoose/lib/error/missingSchema.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * MissingSchema Error constructor.
 * @param {String} name
 * @api private
 */ class MissingSchemaError extends MongooseError {
    constructor(name){
        const msg = 'Schema hasn\'t been registered for model "' + name + '".\n' + 'Use mongoose.model(name, schema)';
        super(msg);
    }
}
Object.defineProperty(MissingSchemaError.prototype, 'name', {
    value: 'MissingSchemaError'
});
/*!
 * exports
 */ module.exports = MissingSchemaError;
}),
"[project]/backend/node_modules/mongoose/lib/error/bulkSaveIncompleteError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * If the underwriting `bulkWrite()` for `bulkSave()` succeeded, but wasn't able to update or
 * insert all documents, we throw this error.
 *
 * @api private
 */ class MongooseBulkSaveIncompleteError extends MongooseError {
    constructor(modelName, documents, bulkWriteResult){
        const matchedCount = bulkWriteResult?.matchedCount ?? 0;
        const insertedCount = bulkWriteResult?.insertedCount ?? 0;
        let preview = documents.map((doc)=>doc._id).join(', ');
        if (preview.length > 100) {
            preview = preview.slice(0, 100) + '...';
        }
        const numDocumentsNotUpdated = documents.length - matchedCount - insertedCount;
        super(`${modelName}.bulkSave() was not able to update ${numDocumentsNotUpdated} of the given documents due to incorrect version or optimistic concurrency, document ids: ${preview}`);
        this.modelName = modelName;
        this.documents = documents;
        this.bulkWriteResult = bulkWriteResult;
        this.numDocumentsNotUpdated = numDocumentsNotUpdated;
    }
}
Object.defineProperty(MongooseBulkSaveIncompleteError.prototype, 'name', {
    value: 'MongooseBulkSaveIncompleteError'
});
/*!
 * exports
 */ module.exports = MongooseBulkSaveIncompleteError;
}),
"[project]/backend/node_modules/mongoose/lib/error/serverSelection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const allServersUnknown = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/topology/allServersUnknown.js [app-route] (ecmascript)");
const isAtlas = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/topology/isAtlas.js [app-route] (ecmascript)");
const isSSLError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/topology/isSSLError.js [app-route] (ecmascript)");
/*!
 * ignore
 */ const atlasMessage = 'Could not connect to any servers in your MongoDB Atlas cluster. ' + 'One common reason is that you\'re trying to access the database from ' + 'an IP that isn\'t whitelisted. Make sure your current IP address is on your Atlas ' + 'cluster\'s IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/';
const sslMessage = 'Mongoose is connecting with SSL enabled, but the server is ' + 'not accepting SSL connections. Please ensure that the MongoDB server you are ' + 'connecting to is configured to accept SSL connections. Learn more: ' + 'https://mongoosejs.com/docs/tutorials/ssl.html';
class MongooseServerSelectionError extends MongooseError {
    /**
   * MongooseServerSelectionError constructor
   *
   * @api private
   */ assimilateError(err) {
        const reason = err.reason;
        // Special message for a case that is likely due to IP whitelisting issues.
        const isAtlasWhitelistError = isAtlas(reason) && allServersUnknown(reason) && err.message.indexOf('bad auth') === -1 && err.message.indexOf('Authentication failed') === -1;
        if (isAtlasWhitelistError) {
            this.message = atlasMessage;
        } else if (isSSLError(reason)) {
            this.message = sslMessage;
        } else {
            this.message = err.message;
        }
        for(const key in err){
            if (key !== 'name') {
                this[key] = err[key];
            }
        }
        this.cause = reason;
        return this;
    }
}
Object.defineProperty(MongooseServerSelectionError.prototype, 'name', {
    value: 'MongooseServerSelectionError'
});
module.exports = MongooseServerSelectionError;
}),
"[project]/backend/node_modules/mongoose/lib/error/divergentArray.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * DivergentArrayError constructor.
 * @param {Array<String>} paths
 * @api private
 */ class DivergentArrayError extends MongooseError {
    constructor(paths){
        const msg = 'For your own good, using `document.save()` to update an array ' + 'which was selected using an $elemMatch projection OR ' + 'populated using skip, limit, query conditions, or exclusion of ' + 'the _id field when the operation results in a $pop or $set of ' + 'the entire array is not supported. The following ' + 'path(s) would have been modified unsafely:\n' + '  ' + paths.join('\n  ') + '\n' + 'Use Model.updateOne() to update these arrays instead. ' + 'See https://mongoosejs.com/docs/faq.html#divergent-array-error for more information.';
        super(msg);
    }
}
Object.defineProperty(DivergentArrayError.prototype, 'name', {
    value: 'DivergentArrayError'
});
/*!
 * exports
 */ module.exports = DivergentArrayError;
}),
"[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Strict mode error constructor
 *
 * @param {String} path
 * @param {String} [msg]
 * @param {Boolean} [immutable]
 * @inherits MongooseError
 * @api private
 */ class StrictModeError extends MongooseError {
    constructor(path, msg, immutable){
        msg = msg || 'Field `' + path + '` is not in schema and strict ' + 'mode is set to throw.';
        super(msg);
        this.isImmutableError = !!immutable;
        this.path = path;
    }
}
Object.defineProperty(StrictModeError.prototype, 'name', {
    value: 'StrictModeError'
});
module.exports = StrictModeError;
}),
"[project]/backend/node_modules/mongoose/lib/error/strictPopulate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Strict mode error constructor
 *
 * @param {String} path
 * @param {String} [msg]
 * @inherits MongooseError
 * @api private
 */ class StrictPopulateError extends MongooseError {
    constructor(path, msg){
        msg = msg || 'Cannot populate path `' + path + '` because it is not in your schema. ' + 'Set the `strictPopulate` option to false to override.';
        super(msg);
        this.path = path;
    }
}
Object.defineProperty(StrictPopulateError.prototype, 'name', {
    value: 'StrictPopulateError'
});
module.exports = StrictPopulateError;
}),
"[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * MongooseError constructor. MongooseError is the base class for all
 * Mongoose-specific errors.
 *
 * #### Example:
 *
 *     const Model = mongoose.model('Test', new mongoose.Schema({ answer: Number }));
 *     const doc = new Model({ answer: 'not a number' });
 *     const err = doc.validateSync();
 *
 *     err instanceof mongoose.Error.ValidationError; // true
 *
 * @constructor Error
 * @param {String} msg Error message
 * @inherits Error https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * The name of the error. The name uniquely identifies this Mongoose error. The
 * possible values are:
 *
 * - `MongooseError`: general Mongoose error
 * - `CastError`: Mongoose could not convert a value to the type defined in the schema path. May be in a `ValidationError` class' `errors` property.
 * - `DivergentArrayError`: You attempted to `save()` an array that was modified after you loaded it with a `$elemMatch` or similar projection
 * - `MissingSchemaError`: You tried to access a model with [`mongoose.model()`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.model()) that was not defined
 * - `DocumentNotFoundError`: The document you tried to [`save()`](https://mongoosejs.com/docs/api/document.html#Document.prototype.save()) was not found
 * - `ValidatorError`: error from an individual schema path's validator
 * - `ValidationError`: error returned from [`validate()`](https://mongoosejs.com/docs/api/document.html#Document.prototype.validate()) or [`validateSync()`](https://mongoosejs.com/docs/api/document.html#Document.prototype.validateSync()). Contains zero or more `ValidatorError` instances in `.errors` property.
 * - `MissingSchemaError`: You called `mongoose.Document()` without a schema
 * - `ObjectExpectedError`: Thrown when you set a nested path to a non-object value with [strict mode set](https://mongoosejs.com/docs/guide.html#strict).
 * - `ObjectParameterError`: Thrown when you pass a non-object value to a function which expects an object as a paramter
 * - `OverwriteModelError`: Thrown when you call [`mongoose.model()`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.model()) to re-define a model that was already defined.
 * - `ParallelSaveError`: Thrown when you call [`save()`](https://mongoosejs.com/docs/api/model.html#Model.prototype.save()) on a document when the same document instance is already saving.
 * - `StrictModeError`: Thrown when you set a path that isn't the schema and [strict mode](https://mongoosejs.com/docs/guide.html#strict) is set to `throw`.
 * - `VersionError`: Thrown when the [document is out of sync](https://mongoosejs.com/docs/guide.html#versionKey)
 *
 * @api public
 * @property {String} name
 * @memberOf Error
 * @instance
 */ /*!
 * Module exports.
 */ module.exports = exports = MongooseError;
/**
 * The default built-in validator error messages.
 *
 * @see Error.messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.messages = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/messages.js [app-route] (ecmascript)");
// backward compat
MongooseError.Messages = MongooseError.messages;
/**
 * An instance of this error class will be thrown when mongoose failed to
 * cast a value.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
/**
 * An instance of this error class will be thrown when `save()` fails
 * because the underlying
 * document was not found. The constructor takes one parameter, the
 * conditions that mongoose passed to `updateOne()` when trying to update
 * the document.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.DocumentNotFoundError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/notFound.js [app-route] (ecmascript)");
/**
 * An instance of this error class will be thrown when [validation](https://mongoosejs.com/docs/validation.html) failed.
 * The `errors` property contains an object whose keys are the paths that failed and whose values are
 * instances of CastError or ValidationError.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.ValidationError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/validation.js [app-route] (ecmascript)");
/**
 * A `ValidationError` has a hash of `errors` that contain individual
 * `ValidatorError` instances.
 *
 * #### Example:
 *
 *     const schema = Schema({ name: { type: String, required: true } });
 *     const Model = mongoose.model('Test', schema);
 *     const doc = new Model({});
 *
 *     // Top-level error is a ValidationError, **not** a ValidatorError
 *     const err = doc.validateSync();
 *     err instanceof mongoose.Error.ValidationError; // true
 *
 *     // A ValidationError `err` has 0 or more ValidatorErrors keyed by the
 *     // path in the `err.errors` property.
 *     err.errors['name'] instanceof mongoose.Error.ValidatorError;
 *
 *     err.errors['name'].kind; // 'required'
 *     err.errors['name'].path; // 'name'
 *     err.errors['name'].value; // undefined
 *
 * Instances of `ValidatorError` have the following properties:
 *
 * - `kind`: The validator's `type`, like `'required'` or `'regexp'`
 * - `path`: The path that failed validation
 * - `value`: The value that failed validation
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.ValidatorError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/validator.js [app-route] (ecmascript)");
/**
 * An instance of this error class will be thrown when you call `save()` after
 * the document in the database was changed in a potentially unsafe way. See
 * the [`versionKey` option](https://mongoosejs.com/docs/guide.html#versionKey) for more information.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.VersionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/version.js [app-route] (ecmascript)");
/**
 * An instance of this error class will be thrown when you call `save()` multiple
 * times on the same document in parallel. See the [FAQ](https://mongoosejs.com/docs/faq.html) for more
 * information.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.ParallelSaveError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/parallelSave.js [app-route] (ecmascript)");
/**
 * Thrown when a model with the given name was already registered on the connection.
 * See [the FAQ about `OverwriteModelError`](https://mongoosejs.com/docs/faq.html#overwrite-model-error).
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.OverwriteModelError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/overwriteModel.js [app-route] (ecmascript)");
/**
 * Thrown when you try to access a model that has not been registered yet
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.MissingSchemaError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/missingSchema.js [app-route] (ecmascript)");
/**
 * Thrown when some documents failed to save when calling `bulkSave()`
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.MongooseBulkSaveIncompleteError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/bulkSaveIncompleteError.js [app-route] (ecmascript)");
/**
 * Thrown when the MongoDB Node driver can't connect to a valid server
 * to send an operation to.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.MongooseServerSelectionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/serverSelection.js [app-route] (ecmascript)");
/**
 * An instance of this error will be thrown if you used an array projection
 * and then modified the array in an unsafe way.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.DivergentArrayError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/divergentArray.js [app-route] (ecmascript)");
/**
 * Thrown when your try to pass values to model constructor that
 * were not specified in schema or change immutable properties when
 * `strict` mode is `"throw"`
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
/**
 * An instance of this error class will be returned when mongoose failed to
 * populate with a path that is not existing.
 *
 * @api public
 * @memberOf Error
 * @static
 */ MongooseError.StrictPopulateError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strictPopulate.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/mongoose/lib/error/objectExpected.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Strict mode error constructor
 *
 * @param {string} type
 * @param {string} value
 * @api private
 */ class ObjectExpectedError extends MongooseError {
    constructor(path, val){
        const typeDescription = Array.isArray(val) ? 'array' : 'primitive value';
        super('Tried to set nested object field `' + path + `\` to ${typeDescription} \`` + val + '`');
        this.path = path;
    }
}
Object.defineProperty(ObjectExpectedError.prototype, 'name', {
    value: 'ObjectExpectedError'
});
module.exports = ObjectExpectedError;
}),
"[project]/backend/node_modules/mongoose/lib/error/objectParameter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * Constructor for errors that happen when a parameter that's expected to be
 * an object isn't an object
 *
 * @param {Any} value
 * @param {String} paramName
 * @param {String} fnName
 * @api private
 */ class ObjectParameterError extends MongooseError {
    constructor(value, paramName, fnName){
        super('Parameter "' + paramName + '" to ' + fnName + '() must be an object, got "' + value.toString() + '" (type ' + typeof value + ')');
    }
}
Object.defineProperty(ObjectParameterError.prototype, 'name', {
    value: 'ObjectParameterError'
});
module.exports = ObjectParameterError;
}),
"[project]/backend/node_modules/mongoose/lib/error/parallelValidate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * ParallelValidate Error constructor.
 *
 * @param {Document} doc
 * @api private
 */ class ParallelValidateError extends MongooseError {
    constructor(doc){
        const msg = 'Can\'t validate() the same doc multiple times in parallel. Document: ';
        super(msg + doc._doc._id);
    }
}
Object.defineProperty(ParallelValidateError.prototype, 'name', {
    value: 'ParallelValidateError'
});
/*!
 * exports
 */ module.exports = ParallelValidateError;
}),
"[project]/backend/node_modules/mongoose/lib/error/invalidSchemaOption.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * InvalidSchemaOption Error constructor.
 * @param {String} name
 * @api private
 */ class InvalidSchemaOptionError extends MongooseError {
    constructor(name, option){
        const msg = `Cannot create use schema for property "${name}" because the schema has the ${option} option enabled.`;
        super(msg);
    }
}
Object.defineProperty(InvalidSchemaOptionError.prototype, 'name', {
    value: 'InvalidSchemaOptionError'
});
/*!
 * exports
 */ module.exports = InvalidSchemaOptionError;
}),
"[project]/backend/node_modules/mongoose/lib/error/bulkWriteError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
/**
 * If `bulkWrite()` or `insertMany()` has validation errors, but
 * all valid operations succeed, and 'throwOnValidationError' is true,
 * Mongoose will throw this error.
 *
 * @api private
 */ class MongooseBulkWriteError extends MongooseError {
    constructor(validationErrors, results, rawResult, operation){
        let preview = validationErrors.map((e)=>e.message).join(', ');
        if (preview.length > 200) {
            preview = preview.slice(0, 200) + '...';
        }
        super(`${operation} failed with ${validationErrors.length} Mongoose validation errors: ${preview}`);
        this.validationErrors = validationErrors;
        this.results = results;
        this.rawResult = rawResult;
        this.operation = operation;
    }
}
Object.defineProperty(MongooseBulkWriteError.prototype, 'name', {
    value: 'MongooseBulkWriteError'
});
/*!
 * exports
 */ module.exports = MongooseBulkWriteError;
}),
"[project]/backend/node_modules/mongoose/lib/error/syncIndexes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * SyncIndexes Error constructor.
 *
 * @param {String} message
 * @param {String} errorsMap
 * @inherits MongooseError
 * @api private
 */ class SyncIndexesError extends MongooseError {
    constructor(message, errorsMap){
        super(message);
        this.errors = errorsMap;
    }
}
Object.defineProperty(SyncIndexesError.prototype, 'name', {
    value: 'SyncIndexesError'
});
module.exports = SyncIndexesError;
}),
"[project]/backend/node_modules/mongoose/lib/error/createCollectionsError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * createCollections Error constructor
 *
 * @param {String} message
 * @param {String} errorsMap
 * @inherits MongooseError
 * @api private
 */ class CreateCollectionsError extends MongooseError {
    constructor(message, errorsMap){
        super(message);
        this.errors = errorsMap;
    }
}
Object.defineProperty(CreateCollectionsError.prototype, 'name', {
    value: 'CreateCollectionsError'
});
module.exports = CreateCollectionsError;
}),
"[project]/backend/node_modules/mongoose/lib/error/eachAsyncMultiError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/**
 * If `eachAsync()` is called with `continueOnError: true`, there can be
 * multiple errors. This error class contains an `errors` property, which
 * contains an array of all errors that occurred in `eachAsync()`.
 *
 * @api private
 */ class EachAsyncMultiError extends MongooseError {
    /**
   * @param {String} connectionString
   */ constructor(errors){
        let preview = errors.map((e)=>e.message).join(', ');
        if (preview.length > 50) {
            preview = preview.slice(0, 50) + '...';
        }
        super(`eachAsync() finished with ${errors.length} errors: ${preview}`);
        this.errors = errors;
    }
}
Object.defineProperty(EachAsyncMultiError.prototype, 'name', {
    value: 'EachAsyncMultiError'
});
/*!
 * exports
 */ module.exports = EachAsyncMultiError;
}),
"[project]/backend/node_modules/mongoose/lib/error/setOptionError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const combinePathErrors = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/error/combinePathErrors.js [app-route] (ecmascript)");
/**
 * Mongoose.set Error
 *
 * @api private
 * @inherits MongooseError
 */ class SetOptionError extends MongooseError {
    constructor(){
        super('');
        this.errors = {};
    }
    /**
   * Console.log helper
   */ toString() {
        return combinePathErrors(this);
    }
    /**
   * inspect helper
   * @api private
   */ inspect() {
        return Object.assign(new Error(this.message), this);
    }
    /**
  * add message
  * @param {String} key
  * @param {String|Error} error
  * @api private
  */ addError(key, error) {
        if (error instanceof SetOptionError) {
            const { errors } = error;
            for (const optionKey of Object.keys(errors)){
                this.addError(optionKey, errors[optionKey]);
            }
            return;
        }
        this.errors[key] = error;
        this.message = combinePathErrors(this);
    }
}
if (util.inspect.custom) {
    // Avoid Node deprecation warning DEP0079
    SetOptionError.prototype[util.inspect.custom] = SetOptionError.prototype.inspect;
}
/**
 * Helper for JSON.stringify
 * Ensure `name` and `message` show up in toJSON output re: gh-9847
 * @api private
 */ Object.defineProperty(SetOptionError.prototype, 'toJSON', {
    enumerable: false,
    writable: false,
    configurable: true,
    value: function() {
        return Object.assign({}, this, {
            name: this.name,
            message: this.message
        });
    }
});
Object.defineProperty(SetOptionError.prototype, 'name', {
    value: 'SetOptionError'
});
class SetOptionInnerError extends MongooseError {
    /**
   * Error for the "errors" array in "SetOptionError" with consistent message
   * @param {String} key
   */ constructor(key){
        super(`"${key}" is not a valid option to set`);
    }
}
SetOptionError.SetOptionInnerError = SetOptionInnerError;
/*!
 * Module exports
 */ module.exports = SetOptionError;
}),
"[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * ObjectId type constructor
 *
 * #### Example:
 *
 *     const id = new mongoose.Types.ObjectId;
 *
 * @constructor ObjectId
 */ const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").ObjectId;
const objectIdSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").objectIdSymbol;
/**
 * Getter for convenience with populate, see gh-6115
 * @api private
 */ Object.defineProperty(ObjectId.prototype, '_id', {
    enumerable: false,
    configurable: true,
    get: function() {
        return this;
    }
});
/*!
 * Convenience `valueOf()` to allow comparing ObjectIds using double equals re: gh-7299
 */ if (!ObjectId.prototype.hasOwnProperty('valueOf')) {
    ObjectId.prototype.valueOf = function objectIdValueOf() {
        return this.toString();
    };
}
ObjectId.prototype[objectIdSymbol] = true;
module.exports = ObjectId;
}),
"[project]/backend/node_modules/mongoose/lib/types/decimal128.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Decimal128 type constructor
 *
 * #### Example:
 *
 *     const id = new mongoose.Types.Decimal128('3.1415');
 *
 * @constructor Decimal128
 */ module.exports = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").Decimal128;
}),
"[project]/backend/node_modules/mongoose/lib/types/array/isMongooseArray.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.isMongooseArray = function(mongooseArray) {
    return Array.isArray(mongooseArray) && mongooseArray.isMongooseArray;
};
}),
"[project]/backend/node_modules/mongoose/lib/types/documentArray/isMongooseDocumentArray.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.isMongooseDocumentArray = function(mongooseDocumentArray) {
    return Array.isArray(mongooseDocumentArray) && mongooseDocumentArray.isMongooseDocumentArray;
};
}),
"[project]/backend/node_modules/mongoose/lib/types/buffer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const Binary = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").Binary;
const UUID = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").UUID;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/**
 * Mongoose Buffer constructor.
 *
 * Values always have to be passed to the constructor to initialize.
 *
 * @param {Buffer} value
 * @param {String} encode
 * @param {Number} offset
 * @api private
 * @inherits Buffer https://nodejs.org/api/buffer.html
 * @see https://bit.ly/f6CnZU
 */ function MongooseBuffer(value, encode, offset) {
    let val = value;
    if (value == null) {
        val = 0;
    }
    let encoding;
    let path;
    let doc;
    if (Array.isArray(encode)) {
        // internal casting
        path = encode[0];
        doc = encode[1];
    } else {
        encoding = encode;
    }
    let buf;
    if (typeof val === 'number' || val instanceof Number) {
        buf = Buffer.alloc(val);
    } else {
        buf = Buffer.from(val, encoding, offset);
    }
    utils.decorate(buf, MongooseBuffer.mixin);
    buf.isMongooseBuffer = true;
    // make sure these internal props don't show up in Object.keys()
    buf[MongooseBuffer.pathSymbol] = path;
    buf[parentSymbol] = doc;
    buf._subtype = 0;
    return buf;
}
const pathSymbol = Symbol.for('mongoose#Buffer#_path');
const parentSymbol = Symbol.for('mongoose#Buffer#_parent');
MongooseBuffer.pathSymbol = pathSymbol;
/*!
 * Inherit from Buffer.
 */ MongooseBuffer.mixin = {
    /**
   * Default subtype for the Binary representing this Buffer
   *
   * @api private
   * @property _subtype
   * @memberOf MongooseBuffer.mixin
   * @static
   */ _subtype: undefined,
    /**
   * Marks this buffer as modified.
   *
   * @api private
   * @method _markModified
   * @memberOf MongooseBuffer.mixin
   * @static
   */ _markModified: function() {
        const parent = this[parentSymbol];
        if (parent) {
            parent.markModified(this[MongooseBuffer.pathSymbol]);
        }
        return this;
    },
    /**
   * Writes the buffer.
   *
   * @api public
   * @method write
   * @memberOf MongooseBuffer.mixin
   * @static
   */ write: function() {
        const written = Buffer.prototype.write.apply(this, arguments);
        if (written > 0) {
            this._markModified();
        }
        return written;
    },
    /**
   * Copies the buffer.
   *
   * #### Note:
   *
   * `Buffer#copy` does not mark `target` as modified so you must copy from a `MongooseBuffer` for it to work as expected. This is a work around since `copy` modifies the target, not this.
   *
   * @return {Number} The number of bytes copied.
   * @param {Buffer} target
   * @method copy
   * @memberOf MongooseBuffer.mixin
   * @static
   */ copy: function(target) {
        const ret = Buffer.prototype.copy.apply(this, arguments);
        if (target && target.isMongooseBuffer) {
            target._markModified();
        }
        return ret;
    }
};
/*!
 * Compile other Buffer methods marking this buffer as modified.
 */ utils.each([
    // node < 0.5
    'writeUInt8',
    'writeUInt16',
    'writeUInt32',
    'writeInt8',
    'writeInt16',
    'writeInt32',
    'writeFloat',
    'writeDouble',
    'fill',
    'utf8Write',
    'binaryWrite',
    'asciiWrite',
    'set',
    // node >= 0.5
    'writeUInt16LE',
    'writeUInt16BE',
    'writeUInt32LE',
    'writeUInt32BE',
    'writeInt16LE',
    'writeInt16BE',
    'writeInt32LE',
    'writeInt32BE',
    'writeFloatLE',
    'writeFloatBE',
    'writeDoubleLE',
    'writeDoubleBE'
], function(method) {
    if (!Buffer.prototype[method]) {
        return;
    }
    MongooseBuffer.mixin[method] = function() {
        const ret = Buffer.prototype[method].apply(this, arguments);
        this._markModified();
        return ret;
    };
});
/**
 * Converts this buffer to its Binary type representation.
 *
 * #### SubTypes:
 *
 *     const bson = require('bson')
 *     bson.BSON_BINARY_SUBTYPE_DEFAULT
 *     bson.BSON_BINARY_SUBTYPE_FUNCTION
 *     bson.BSON_BINARY_SUBTYPE_BYTE_ARRAY
 *     bson.BSON_BINARY_SUBTYPE_UUID
 *     bson.BSON_BINARY_SUBTYPE_MD5
 *     bson.BSON_BINARY_SUBTYPE_USER_DEFINED
 *     doc.buffer.toObject(bson.BSON_BINARY_SUBTYPE_USER_DEFINED);
 *
 * @see bsonspec https://bsonspec.org/#/specification
 * @param {Hex} [subtype]
 * @return {Binary}
 * @api public
 * @method toObject
 * @memberOf MongooseBuffer
 */ MongooseBuffer.mixin.toObject = function(options) {
    const subtype = typeof options === 'number' ? options : this._subtype || 0;
    return new Binary(Buffer.from(this), subtype);
};
MongooseBuffer.mixin.$toObject = MongooseBuffer.mixin.toObject;
/**
 * Converts this buffer for storage in MongoDB, including subtype
 *
 * @return {Binary}
 * @api public
 * @method toBSON
 * @memberOf MongooseBuffer
 */ MongooseBuffer.mixin.toBSON = function() {
    return new Binary(this, this._subtype || 0);
};
/**
 * Converts this buffer to a UUID. Throws an error if subtype is not 4.
 *
 * @return {UUID}
 * @api public
 * @method toUUID
 * @memberOf MongooseBuffer
 */ MongooseBuffer.mixin.toUUID = function() {
    if (this._subtype !== 4) {
        throw new Error('Cannot convert a Buffer with subtype ' + this._subtype + ' to a UUID');
    }
    return new UUID(this);
};
/**
 * Determines if this buffer is equals to `other` buffer
 *
 * @param {Buffer} other
 * @return {Boolean}
 * @method equals
 * @memberOf MongooseBuffer
 */ MongooseBuffer.mixin.equals = function(other) {
    if (!Buffer.isBuffer(other)) {
        return false;
    }
    if (this.length !== other.length) {
        return false;
    }
    for(let i = 0; i < this.length; ++i){
        if (this[i] !== other[i]) {
            return false;
        }
    }
    return true;
};
/**
 * Sets the subtype option and marks the buffer modified.
 *
 * #### SubTypes:
 *
 *     const bson = require('bson')
 *     bson.BSON_BINARY_SUBTYPE_DEFAULT
 *     bson.BSON_BINARY_SUBTYPE_FUNCTION
 *     bson.BSON_BINARY_SUBTYPE_BYTE_ARRAY
 *     bson.BSON_BINARY_SUBTYPE_UUID
 *     bson.BSON_BINARY_SUBTYPE_MD5
 *     bson.BSON_BINARY_SUBTYPE_USER_DEFINED
 *
 *     doc.buffer.subtype(bson.BSON_BINARY_SUBTYPE_UUID);
 *
 * @see bsonspec https://bsonspec.org/#/specification
 * @param {Hex} subtype
 * @api public
 * @method subtype
 * @memberOf MongooseBuffer
 */ MongooseBuffer.mixin.subtype = function(subtype) {
    if (typeof subtype !== 'number') {
        throw new TypeError('Invalid subtype. Expected a number');
    }
    if (this._subtype !== subtype) {
        this._markModified();
    }
    this._subtype = subtype;
};
/*!
 * Module exports.
 */ MongooseBuffer.Binary = Binary;
module.exports = MongooseBuffer;
}),
"[project]/backend/node_modules/mongoose/lib/types/subdocument.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
module.exports = Subdocument;
/**
 * Subdocument constructor.
 *
 * @inherits Document
 * @api private
 */ function Subdocument(value, fields, parent, skipId, options) {
    if (typeof skipId === 'object' && skipId != null && options == null) {
        options = skipId;
        skipId = undefined;
    }
    if (parent != null) {
        // If setting a nested path, should copy isNew from parent re: gh-7048
        const parentOptions = {
            isNew: parent.isNew
        };
        if ('defaults' in parent.$__) {
            parentOptions.defaults = parent.$__.defaults;
        }
        options = Object.assign(parentOptions, options);
    }
    if (options != null && options.path != null) {
        this.$basePath = options.path;
    }
    if (options != null && options.pathRelativeToParent != null) {
        this.$pathRelativeToParent = options.pathRelativeToParent;
    }
    // Don't pass `path` to Document constructor: path is used for storing the
    // absolute path to this schematype relative to the top-level document, but
    // subdocuments use relative paths (relative to the parent document) to track changes.
    // This avoids the subdocument's fields receiving the subdocument's path as options.path.
    let documentOptions = options;
    if (options != null && options.path != null) {
        documentOptions = Object.assign({}, options);
        delete documentOptions.path;
    }
    Document.call(this, value, fields, skipId, documentOptions);
    delete this.$__.priorDoc;
}
Subdocument.prototype = Object.create(Document.prototype);
Object.defineProperty(Subdocument.prototype, '$isSubdocument', {
    configurable: false,
    writable: false,
    value: true
});
Object.defineProperty(Subdocument.prototype, '$isSingleNested', {
    configurable: false,
    writable: false,
    value: true
});
/*!
 * ignore
 */ Subdocument.prototype.toBSON = function() {
    return this.toObject(internalToObjectOptions);
};
/**
 * Used as a stub for middleware
 *
 * #### Note:
 *
 * _This is a no-op. Does not actually save the doc to the db._
 *
 * @param {Function} [fn]
 * @return {Promise} resolved Promise
 * @api private
 */ Subdocument.prototype.save = async function save(options) {
    options = options || {};
    if (!options.suppressWarning) {
        utils.warn('mongoose: calling `save()` on a subdoc does **not** save ' + 'the document to MongoDB, it only runs save middleware. ' + 'Use `subdoc.save({ suppressWarning: true })` to hide this warning ' + 'if you\'re sure this behavior is right for your app.');
    }
    return new Promise((resolve, reject)=>{
        this.$__save((err)=>{
            if (err != null) {
                return reject(err);
            }
            resolve(this);
        });
    });
};
/**
 * Given a path relative to this document, return the path relative
 * to the top-level document.
 * @param {String} path
 * @method $__fullPath
 * @memberOf Subdocument
 * @instance
 * @returns {String}
 * @api private
 */ Subdocument.prototype.$__fullPath = function(path) {
    if (!this.$__.fullPath) {
        this.ownerDocument();
    }
    return path ? this.$__.fullPath + '.' + path : this.$__.fullPath;
};
/**
 * Given a path relative to this document, return the path relative
 * to the parent document.
 * @param {String} p
 * @returns {String}
 * @method $__pathRelativeToParent
 * @memberOf Subdocument
 * @instance
 * @api private
 */ Subdocument.prototype.$__pathRelativeToParent = function(p) {
    // If this subdocument has a stored relative path (set by map when subdoc is created),
    // use it directly to avoid string operations
    if (this.$pathRelativeToParent != null) {
        return p == null ? this.$pathRelativeToParent : this.$pathRelativeToParent + '.' + p;
    }
    if (p == null) {
        return this.$basePath;
    }
    if (!this.$basePath) {
        return p;
    }
    return [
        this.$basePath,
        p
    ].join('.');
};
/**
 * Used as a stub for middleware
 *
 * #### Note:
 *
 * _This is a no-op. Does not actually save the doc to the db._
 *
 * @param {Function} [fn]
 * @method $__save
 * @api private
 */ Subdocument.prototype.$__save = function(fn) {
    return immediate(()=>fn(null, this));
};
/*!
 * ignore
 */ Subdocument.prototype.$isValid = function(path) {
    const parent = this.$parent();
    const fullPath = this.$__pathRelativeToParent(path);
    if (parent != null && fullPath != null) {
        return parent.$isValid(fullPath);
    }
    return Document.prototype.$isValid.call(this, path);
};
/*!
 * ignore
 */ Subdocument.prototype.markModified = function(path) {
    Document.prototype.markModified.call(this, path);
    const parent = this.$parent();
    if (parent == null) {
        return;
    }
    const pathToMark = this.$__pathRelativeToParent(path);
    if (pathToMark == null) {
        return;
    }
    const myPath = this.$__pathRelativeToParent().replace(/\.$/, '');
    if (parent.isDirectModified(myPath) || this.isNew) {
        return;
    }
    this.$__parent.markModified(pathToMark, this);
};
/*!
 * ignore
 */ Subdocument.prototype.isModified = function(paths, options, modifiedPaths) {
    const parent = this.$parent();
    if (parent != null) {
        if (Array.isArray(paths) || typeof paths === 'string') {
            paths = Array.isArray(paths) ? paths : paths.split(' ');
            paths = paths.map((p)=>this.$__pathRelativeToParent(p)).filter((p)=>p != null);
        } else if (!paths) {
            paths = this.$__pathRelativeToParent();
        }
        return parent.$isModified(paths, options, modifiedPaths);
    }
    return Document.prototype.isModified.call(this, paths, options, modifiedPaths);
};
/**
 * Marks a path as valid, removing existing validation errors.
 *
 * @param {String} path the field to mark as valid
 * @api private
 * @method $markValid
 * @memberOf Subdocument
 */ Subdocument.prototype.$markValid = function(path) {
    Document.prototype.$markValid.call(this, path);
    const parent = this.$parent();
    const fullPath = this.$__pathRelativeToParent(path);
    if (parent != null && fullPath != null) {
        parent.$markValid(fullPath);
    }
};
/*!
 * ignore
 */ Subdocument.prototype.invalidate = function(path, err, val) {
    Document.prototype.invalidate.call(this, path, err, val);
    const parent = this.$parent();
    const fullPath = this.$__pathRelativeToParent(path);
    if (parent != null && fullPath != null) {
        parent.invalidate(fullPath, err, val);
    } else if (err.kind === 'cast' || err.name === 'CastError' || fullPath == null) {
        throw err;
    }
    return this.ownerDocument().$__.validationError;
};
/*!
 * ignore
 */ Subdocument.prototype.$ignore = function(path) {
    Document.prototype.$ignore.call(this, path);
    const parent = this.$parent();
    const fullPath = this.$__pathRelativeToParent(path);
    if (parent != null && fullPath != null) {
        parent.$ignore(fullPath);
    }
};
/**
 * Returns the top level document of this sub-document.
 *
 * @return {Document}
 */ Subdocument.prototype.ownerDocument = function() {
    if (this.$__.ownerDocument) {
        return this.$__.ownerDocument;
    }
    let parent = this; // eslint-disable-line consistent-this
    const paths = [];
    const seenDocs = new Set([
        parent
    ]);
    while(true){
        if (typeof parent.$__pathRelativeToParent !== 'function') {
            break;
        }
        paths.unshift(parent.$__pathRelativeToParent(void 0, true));
        const _parent = parent.$parent();
        if (_parent == null) {
            break;
        }
        parent = _parent;
        if (seenDocs.has(parent)) {
            throw new Error('Infinite subdocument loop: subdoc with _id ' + parent._id + ' is a parent of itself');
        }
        seenDocs.add(parent);
    }
    this.$__.fullPath = paths.join('.');
    this.$__.ownerDocument = parent;
    return this.$__.ownerDocument;
};
/*!
 * ignore
 */ Subdocument.prototype.$__fullPathWithIndexes = function() {
    let parent = this; // eslint-disable-line consistent-this
    const paths = [];
    const seenDocs = new Set([
        parent
    ]);
    while(true){
        if (typeof parent.$__pathRelativeToParent !== 'function') {
            break;
        }
        paths.unshift(parent.$__pathRelativeToParent(void 0, false));
        const _parent = parent.$parent();
        if (_parent == null) {
            break;
        }
        parent = _parent;
        if (seenDocs.has(parent)) {
            throw new Error('Infinite subdocument loop: subdoc with _id ' + parent._id + ' is a parent of itself');
        }
        seenDocs.add(parent);
    }
    return paths.join('.');
};
/**
 * Returns this sub-documents parent document.
 *
 * @api public
 */ Subdocument.prototype.parent = function() {
    return this.$__parent;
};
/**
 * Returns this sub-documents parent document.
 *
 * @api public
 * @method $parent
 */ Subdocument.prototype.$parent = Subdocument.prototype.parent;
/**
 * no-op for hooks
 * @param {Function} cb
 * @method $__deleteOne
 * @memberOf Subdocument
 * @instance
 * @api private
 */ Subdocument.prototype.$__deleteOne = function(cb) {
    if (cb == null) {
        return;
    }
    return cb(null, this);
};
/**
 * ignore
 * @method $__removeFromParent
 * @memberOf Subdocument
 * @instance
 * @api private
 */ Subdocument.prototype.$__removeFromParent = function() {
    this.$__parent.set(this.$basePath, null);
};
/**
 * Null-out this subdoc
 *
 * @param {Object} [options]
 * @param {Function} [callback] optional callback for compatibility with Document.prototype.remove
 */ Subdocument.prototype.deleteOne = function(options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    registerRemoveListener(this);
    // If removing entire doc, no need to remove subdoc
    if (!options || !options.noop) {
        this.$__removeFromParent();
        const owner = this.ownerDocument();
        owner.$__.removedSubdocs = owner.$__.removedSubdocs || [];
        owner.$__.removedSubdocs.push(this);
    }
    return this.$__deleteOne(callback);
};
/*!
 * ignore
 */ Subdocument.prototype.populate = function() {
    throw new Error('Mongoose does not support calling populate() on nested ' + 'docs. Instead of `doc.nested.populate("path")`, use ' + '`doc.populate("nested.path")`');
};
/**
 * Helper for console.log
 *
 * @api public
 */ Subdocument.prototype.inspect = function() {
    return this.toObject();
};
if (util.inspect.custom) {
    // Avoid Node deprecation warning DEP0079
    Subdocument.prototype[util.inspect.custom] = Subdocument.prototype.inspect;
}
/**
 * Override `$toObject()` to handle minimizing the whole path. Should not minimize if schematype-level minimize
 * is set to false re: gh-11247, gh-14058, gh-14151
 */ Subdocument.prototype.$toObject = function $toObject(options, json) {
    const ret = Document.prototype.$toObject.call(this, options, json);
    // If `$toObject()` was called recursively, respect the minimize option, including schematype level minimize.
    // If minimize is set, then we can minimize out the whole object.
    if (Object.keys(ret).length === 0 && options?._calledWithOptions != null) {
        const minimize = options._calledWithOptions?.minimize ?? this?.$__schemaTypeOptions?.minimize ?? options.minimize;
        if (minimize && !this.constructor.$__required) {
            return undefined;
        }
    }
    return ret;
};
/**
 * Registers remove event listeners for triggering
 * on subdocuments.
 *
 * @param {Subdocument} sub
 * @api private
 */ function registerRemoveListener(sub) {
    const owner = sub.ownerDocument();
    function emitRemove() {
        owner.$removeListener('save', emitRemove);
        owner.$removeListener('deleteOne', emitRemove);
        sub.emit('deleteOne', sub);
        sub.constructor.emit('deleteOne', sub);
    }
    owner.$on('save', emitRemove);
    owner.$on('deleteOne', emitRemove);
}
}),
"[project]/backend/node_modules/mongoose/lib/types/arraySubdocument.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const Subdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/subdocument.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const documentArrayParent = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").documentArrayParent;
/**
 * A constructor.
 *
 * @param {Object} obj js object returned from the db
 * @param {MongooseDocumentArray} parentArr the parent array of this document
 * @param {Boolean} skipId
 * @param {Object} fields
 * @param {Number} index
 * @inherits Document
 * @api private
 */ function ArraySubdocument(obj, parentArr, skipId, fields, index) {
    if (utils.isMongooseDocumentArray(parentArr)) {
        this.__parentArray = parentArr;
        this[documentArrayParent] = parentArr.$parent();
    } else {
        this.__parentArray = undefined;
        this[documentArrayParent] = undefined;
    }
    this.$setIndex(index);
    this.$__parent = this[documentArrayParent];
    let options;
    if (typeof skipId === 'object' && skipId != null) {
        options = {
            isNew: true,
            ...skipId
        };
        skipId = undefined;
    } else {
        options = {
            isNew: true
        };
    }
    Subdocument.call(this, obj, fields, this[documentArrayParent], skipId, options);
}
/*!
 * Inherit from Subdocument
 */ ArraySubdocument.prototype = Object.create(Subdocument.prototype);
ArraySubdocument.prototype.constructor = ArraySubdocument;
Object.defineProperty(ArraySubdocument.prototype, '$isSingleNested', {
    configurable: false,
    writable: false,
    value: false
});
Object.defineProperty(ArraySubdocument.prototype, '$isDocumentArrayElement', {
    configurable: false,
    writable: false,
    value: true
});
for(const i in EventEmitter.prototype){
    ArraySubdocument[i] = EventEmitter.prototype[i];
}
/*!
 * ignore
 */ ArraySubdocument.prototype.$setIndex = function(index) {
    this.__index = index;
    if (this.$__ != null && this.$__.validationError != null) {
        const keys = Object.keys(this.$__.validationError.errors);
        for (const key of keys){
            this.invalidate(key, this.$__.validationError.errors[key]);
        }
    }
};
/*!
 * ignore
 */ ArraySubdocument.prototype.populate = function() {
    throw new Error('Mongoose does not support calling populate() on nested ' + 'docs. Instead of `doc.arr[0].populate("path")`, use ' + '`doc.populate("arr.0.path")`');
};
/*!
 * ignore
 */ ArraySubdocument.prototype.$__removeFromParent = function() {
    const _id = this._doc._id;
    if (!_id) {
        throw new Error('For your own good, Mongoose does not know ' + 'how to remove an ArraySubdocument that has no _id');
    }
    this.__parentArray.pull({
        _id: _id
    });
};
/**
 * Returns the full path to this document. If optional `path` is passed, it is appended to the full path.
 *
 * @param {String} [path]
 * @param {Boolean} [skipIndex] Skip adding the array index. For example `arr.foo` instead of `arr.0.foo`.
 * @return {String}
 * @api private
 * @method $__fullPath
 * @memberOf ArraySubdocument
 * @instance
 */ ArraySubdocument.prototype.$__fullPath = function(path, skipIndex) {
    if (this.__index == null) {
        return null;
    }
    if (!this.$__.fullPath) {
        this.ownerDocument();
    }
    if (skipIndex) {
        return path ? this.$__.fullPath + '.' + path : this.$__.fullPath;
    }
    return path ? this.$__.fullPath + '.' + this.__index + '.' + path : this.$__.fullPath + '.' + this.__index;
};
/**
 * Given a path relative to this document, return the path relative
 * to the top-level document.
 * @method $__pathRelativeToParent
 * @memberOf ArraySubdocument
 * @instance
 * @api private
 */ ArraySubdocument.prototype.$__pathRelativeToParent = function(path, skipIndex) {
    if (this.__index == null || !this.__parentArray || !this.__parentArray.$path) {
        return null;
    }
    if (skipIndex) {
        return path == null ? this.__parentArray.$path() : this.__parentArray.$path() + '.' + path;
    }
    if (path == null) {
        return this.__parentArray.$path() + '.' + this.__index;
    }
    return this.__parentArray.$path() + '.' + this.__index + '.' + path;
};
/**
 * Returns this sub-documents parent document.
 * @method $parent
 * @memberOf ArraySubdocument
 * @instance
 * @api public
 */ ArraySubdocument.prototype.$parent = function() {
    return this[documentArrayParent];
};
/**
 * Returns this subdocument's parent array.
 *
 * #### Example:
 *
 *     const Test = mongoose.model('Test', new Schema({
 *       docArr: [{ name: String }]
 *     }));
 *     const doc = new Test({ docArr: [{ name: 'test subdoc' }] });
 *
 *     doc.docArr[0].parentArray() === doc.docArr; // true
 *
 * @api public
 * @method parentArray
 * @returns DocumentArray
 */ ArraySubdocument.prototype.parentArray = function() {
    return this.__parentArray;
};
/*!
 * Module exports.
 */ module.exports = ArraySubdocument;
}),
"[project]/backend/node_modules/mongoose/lib/types/array/methods/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const ArraySubdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/arraySubdocument.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const cleanModifiedSubpaths = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/cleanModifiedSubpaths.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const arrayParentSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayParentSymbol;
const arrayPathSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayPathSymbol;
const arraySchemaSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arraySchemaSymbol;
const populateModelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").populateModelSymbol;
const slicedSymbol = Symbol('mongoose#Array#sliced');
const _basePush = Array.prototype.push;
/*!
 * ignore
 */ const methods = {
    /**
   * Depopulates stored atomic operation values as necessary for direct insertion to MongoDB.
   *
   * If no atomics exist, we return all array values after conversion.
   *
   * @return {Array}
   * @method $__getAtomics
   * @memberOf MongooseArray
   * @instance
   * @api private
   */ $__getAtomics () {
        const ret = [];
        const keys = Object.keys(this[arrayAtomicsSymbol] || {});
        let i = keys.length;
        const opts = Object.assign({}, internalToObjectOptions, {
            _isNested: true
        });
        if (i === 0) {
            ret[0] = [
                '$set',
                this.toObject(opts)
            ];
            return ret;
        }
        while(i--){
            const op = keys[i];
            let val = this[arrayAtomicsSymbol][op];
            // the atomic values which are arrays are not MongooseArrays. we
            // need to convert their elements as if they were MongooseArrays
            // to handle populated arrays versus DocumentArrays properly.
            if (utils.isMongooseObject(val)) {
                val = val.toObject(opts);
            } else if (Array.isArray(val)) {
                val = this.toObject.call(val, opts);
            } else if (val != null && Array.isArray(val.$each)) {
                val.$each = this.toObject.call(val.$each, opts);
            } else if (val != null && typeof val.valueOf === 'function') {
                val = val.valueOf();
            }
            if (op === '$addToSet') {
                val = {
                    $each: val
                };
            }
            ret.push([
                op,
                val
            ]);
        }
        return ret;
    },
    /*!
   * ignore
   */ $atomics () {
        return this[arrayAtomicsSymbol];
    },
    /*!
   * ignore
   */ $parent () {
        return this[arrayParentSymbol];
    },
    /*!
   * ignore
   */ $path () {
        return this[arrayPathSymbol];
    },
    /*!
   * ignore
   */ $schemaType () {
        return this[arraySchemaSymbol];
    },
    /**
   * Atomically shifts the array at most one time per document `save()`.
   *
   * #### Note:
   *
   * _Calling this multiple times on an array before saving sends the same command as calling it once._
   * _This update is implemented using the MongoDB [$pop](https://www.mongodb.com/docs/manual/reference/operator/update/pop/) method which enforces this restriction._
   *
   *      doc.array = [1,2,3];
   *
   *      const shifted = doc.array.$shift();
   *      console.log(shifted); // 1
   *      console.log(doc.array); // [2,3]
   *
   *      // no affect
   *      shifted = doc.array.$shift();
   *      console.log(doc.array); // [2,3]
   *
   *      doc.save(function (err) {
   *        if (err) return handleError(err);
   *
   *        // we saved, now $shift works again
   *        shifted = doc.array.$shift();
   *        console.log(shifted ); // 2
   *        console.log(doc.array); // [3]
   *      })
   *
   * @api public
   * @memberOf MongooseArray
   * @instance
   * @method $shift
   * @see mongodb https://www.mongodb.com/docs/manual/reference/operator/update/pop/
   */ $shift () {
        this._registerAtomic('$pop', -1);
        this._markModified();
        // only allow shifting once
        const __array = this.__array;
        if (__array._shifted) {
            return;
        }
        __array._shifted = true;
        return [].shift.call(__array);
    },
    /**
   * Pops the array atomically at most one time per document `save()`.
   *
   * #### NOTE:
   *
   * _Calling this multiple times on an array before saving sends the same command as calling it once._
   * _This update is implemented using the MongoDB [$pop](https://www.mongodb.com/docs/manual/reference/operator/update/pop/) method which enforces this restriction._
   *
   *      doc.array = [1,2,3];
   *
   *      const popped = doc.array.$pop();
   *      console.log(popped); // 3
   *      console.log(doc.array); // [1,2]
   *
   *      // no affect
   *      popped = doc.array.$pop();
   *      console.log(doc.array); // [1,2]
   *
   *      doc.save(function (err) {
   *        if (err) return handleError(err);
   *
   *        // we saved, now $pop works again
   *        popped = doc.array.$pop();
   *        console.log(popped); // 2
   *        console.log(doc.array); // [1]
   *      })
   *
   * @api public
   * @method $pop
   * @memberOf MongooseArray
   * @instance
   * @see mongodb https://www.mongodb.com/docs/manual/reference/operator/update/pop/
   * @method $pop
   * @memberOf MongooseArray
   */ $pop () {
        this._registerAtomic('$pop', 1);
        this._markModified();
        // only allow popping once
        if (this._popped) {
            return;
        }
        this._popped = true;
        return [].pop.call(this);
    },
    /*!
   * ignore
   */ $schema () {
        return this[arraySchemaSymbol];
    },
    /**
   * Casts a member based on this arrays schema.
   *
   * @param {any} value
   * @return value the casted value
   * @method _cast
   * @api private
   * @memberOf MongooseArray
   */ _cast (value) {
        let populated = false;
        let Model;
        const parent = this[arrayParentSymbol];
        if (parent) {
            populated = parent.$populated(this[arrayPathSymbol], true);
        }
        if (populated && value !== null && value !== undefined) {
            // cast to the populated Models schema
            Model = populated.options[populateModelSymbol];
            if (Model == null) {
                throw new MongooseError('No populated model found for path `' + this[arrayPathSymbol] + '`. This is likely a bug in Mongoose, please report an issue on github.com/Automattic/mongoose.');
            }
            // only objects are permitted so we can safely assume that
            // non-objects are to be interpreted as _id
            if (Buffer.isBuffer(value) || isBsonType(value, 'ObjectId') || !utils.isObject(value)) {
                value = {
                    _id: value
                };
            }
            // gh-2399
            // we should cast model only when it's not a discriminator
            const isDisc = value.schema && value.schema.discriminatorMapping && value.schema.discriminatorMapping.key !== undefined;
            if (!isDisc) {
                value = new Model(value);
            }
            return this[arraySchemaSymbol].caster.applySetters(value, parent, true);
        }
        return this[arraySchemaSymbol].caster.applySetters(value, parent, false);
    },
    /**
   * Internal helper for .map()
   *
   * @api private
   * @return {Number}
   * @method _mapCast
   * @memberOf MongooseArray
   */ _mapCast (val, index) {
        return this._cast(val, this.length + index);
    },
    /**
   * Marks this array as modified.
   *
   * If it bubbles up from an embedded document change, then it takes the following arguments (otherwise, takes 0 arguments)
   *
   * @param {ArraySubdocument} subdoc the embedded doc that invoked this method on the Array
   * @param {String} embeddedPath the path which changed in the subdoc
   * @method _markModified
   * @api private
   * @memberOf MongooseArray
   */ _markModified (elem) {
        const parent = this[arrayParentSymbol];
        let dirtyPath;
        if (parent) {
            dirtyPath = this[arrayPathSymbol];
            if (arguments.length) {
                dirtyPath = dirtyPath + '.' + elem;
            }
            if (dirtyPath != null && dirtyPath.endsWith('.$')) {
                return this;
            }
            parent.markModified(dirtyPath, arguments.length !== 0 ? elem : parent);
        }
        return this;
    },
    /**
   * Register an atomic operation with the parent.
   *
   * @param {Array} op operation
   * @param {any} val
   * @method _registerAtomic
   * @api private
   * @memberOf MongooseArray
   */ _registerAtomic (op, val) {
        if (this[slicedSymbol]) {
            return;
        }
        if (op === '$set') {
            // $set takes precedence over all other ops.
            // mark entire array modified.
            this[arrayAtomicsSymbol] = {
                $set: val
            };
            cleanModifiedSubpaths(this[arrayParentSymbol], this[arrayPathSymbol]);
            this._markModified();
            return this;
        }
        const atomics = this[arrayAtomicsSymbol];
        // reset pop/shift after save
        if (op === '$pop' && !('$pop' in atomics)) {
            const _this = this;
            this[arrayParentSymbol].once('save', function() {
                _this._popped = _this._shifted = null;
            });
        }
        // check for impossible $atomic combos (Mongo denies more than one
        // $atomic op on a single path
        if (atomics.$set || Object.keys(atomics).length && !(op in atomics)) {
            // a different op was previously registered.
            // save the entire thing.
            this[arrayAtomicsSymbol] = {
                $set: this
            };
            return this;
        }
        let selector;
        if (op === '$pullAll' || op === '$addToSet') {
            atomics[op] || (atomics[op] = []);
            atomics[op] = atomics[op].concat(val);
        } else if (op === '$pullDocs') {
            const pullOp = atomics['$pull'] || (atomics['$pull'] = {});
            if (val[0] instanceof ArraySubdocument) {
                selector = pullOp['$or'] || (pullOp['$or'] = []);
                Array.prototype.push.apply(selector, val.map((v)=>{
                    return v.toObject({
                        transform: (doc, ret)=>{
                            if (v == null || v.$__ == null) {
                                return ret;
                            }
                            Object.keys(v.$__.activePaths.getStatePaths('default')).forEach((path)=>{
                                mpath.unset(path, ret);
                                _minimizePath(ret, path);
                            });
                            return ret;
                        },
                        virtuals: false
                    });
                }));
            } else {
                selector = pullOp['_id'] || (pullOp['_id'] = {
                    $in: []
                });
                selector['$in'] = selector['$in'].concat(val);
            }
        } else if (op === '$push') {
            atomics.$push = atomics.$push || {
                $each: []
            };
            if (val != null && utils.hasUserDefinedProperty(val, '$each')) {
                atomics.$push = val;
            } else {
                if (val.length === 1) {
                    atomics.$push.$each.push(val[0]);
                } else if (val.length < 10000) {
                    atomics.$push.$each.push(...val);
                } else {
                    for (const v of val){
                        atomics.$push.$each.push(v);
                    }
                }
            }
        } else {
            atomics[op] = val;
        }
        return this;
    },
    /**
   * Adds values to the array if not already present.
   *
   * #### Example:
   *
   *     console.log(doc.array) // [2,3,4]
   *     const added = doc.array.addToSet(4,5);
   *     console.log(doc.array) // [2,3,4,5]
   *     console.log(added)     // [5]
   *
   * @param {...any} [args]
   * @return {Array} the values that were added
   * @memberOf MongooseArray
   * @api public
   * @method addToSet
   */ addToSet () {
        _checkManualPopulation(this, arguments);
        _depopulateIfNecessary(this, arguments);
        const values = [].map.call(arguments, this._mapCast, this);
        const added = [];
        let type = '';
        if (values[0] instanceof ArraySubdocument) {
            type = 'doc';
        } else if (values[0] instanceof Date) {
            type = 'date';
        } else if (isBsonType(values[0], 'ObjectId')) {
            type = 'ObjectId';
        }
        const rawValues = utils.isMongooseArray(values) ? values.__array : values;
        const rawArray = utils.isMongooseArray(this) ? this.__array : this;
        rawValues.forEach(function(v) {
            let found;
            const val = +v;
            switch(type){
                case 'doc':
                    found = this.some(function(doc) {
                        return doc.equals(v);
                    });
                    break;
                case 'date':
                    found = this.some(function(d) {
                        return +d === val;
                    });
                    break;
                case 'ObjectId':
                    found = this.find((o)=>o.toString() === v.toString());
                    break;
                default:
                    found = ~this.indexOf(v);
                    break;
            }
            if (!found) {
                this._markModified();
                rawArray.push(v);
                this._registerAtomic('$addToSet', v);
                [].push.call(added, v);
            }
        }, this);
        return added;
    },
    /**
   * Returns the number of pending atomic operations to send to the db for this array.
   *
   * @api private
   * @return {Number}
   * @method hasAtomics
   * @memberOf MongooseArray
   */ hasAtomics () {
        if (!utils.isPOJO(this[arrayAtomicsSymbol])) {
            return 0;
        }
        return Object.keys(this[arrayAtomicsSymbol]).length;
    },
    /**
   * Return whether or not the `obj` is included in the array.
   *
   * @param {Object} obj the item to check
   * @param {Number} fromIndex
   * @return {Boolean}
   * @api public
   * @method includes
   * @memberOf MongooseArray
   */ includes (obj, fromIndex) {
        const ret = this.indexOf(obj, fromIndex);
        return ret !== -1;
    },
    /**
   * Return the index of `obj` or `-1` if not found.
   *
   * @param {Object} obj the item to look for
   * @param {Number} fromIndex
   * @return {Number}
   * @api public
   * @method indexOf
   * @memberOf MongooseArray
   */ indexOf (obj, fromIndex) {
        if (isBsonType(obj, 'ObjectId')) {
            obj = obj.toString();
        }
        fromIndex = fromIndex == null ? 0 : fromIndex;
        const len = this.length;
        for(let i = fromIndex; i < len; ++i){
            if (obj == this[i]) {
                return i;
            }
        }
        return -1;
    },
    /**
   * Helper for console.log
   *
   * @api public
   * @method inspect
   * @memberOf MongooseArray
   */ inspect () {
        return JSON.stringify(this);
    },
    /**
   * Pushes items to the array non-atomically.
   *
   * #### Note:
   *
   * _marks the entire array as modified, which if saved, will store it as a `$set` operation, potentially overwritting any changes that happen between when you retrieved the object and when you save it._
   *
   * @param {...any} [args]
   * @api public
   * @method nonAtomicPush
   * @memberOf MongooseArray
   */ nonAtomicPush () {
        const values = [].map.call(arguments, this._mapCast, this);
        this._markModified();
        const ret = [].push.apply(this, values);
        this._registerAtomic('$set', this);
        return ret;
    },
    /**
   * Wraps [`Array#pop`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop) with proper change tracking.
   *
   * #### Note:
   *
   * _marks the entire array as modified which will pass the entire thing to $set potentially overwriting any changes that happen between when you retrieved the object and when you save it._
   *
   * @see MongooseArray#$pop https://mongoosejs.com/docs/api/array.html#MongooseArray.prototype.$pop()
   * @api public
   * @method pop
   * @memberOf MongooseArray
   */ pop () {
        this._markModified();
        const ret = [].pop.call(this);
        this._registerAtomic('$set', this);
        return ret;
    },
    /**
   * Pulls items from the array atomically. Equality is determined by casting
   * the provided value to an embedded document and comparing using
   * [the `Document.equals()` function.](https://mongoosejs.com/docs/api/document.html#Document.prototype.equals())
   *
   * #### Example:
   *
   *     doc.array.pull(ObjectId)
   *     doc.array.pull({ _id: 'someId' })
   *     doc.array.pull(36)
   *     doc.array.pull('tag 1', 'tag 2')
   *
   * To remove a document from a subdocument array we may pass an object with a matching `_id`.
   *
   *     doc.subdocs.push({ _id: 4815162342 })
   *     doc.subdocs.pull({ _id: 4815162342 }) // removed
   *
   * Or we may passing the _id directly and let mongoose take care of it.
   *
   *     doc.subdocs.push({ _id: 4815162342 })
   *     doc.subdocs.pull(4815162342); // works
   *
   * The first pull call will result in a atomic operation on the database, if pull is called repeatedly without saving the document, a $set operation is used on the complete array instead, overwriting possible changes that happened on the database in the meantime.
   *
   * @param {...any} [args]
   * @see mongodb https://www.mongodb.com/docs/manual/reference/operator/update/pull/
   * @api public
   * @method pull
   * @memberOf MongooseArray
   */ pull () {
        const values = [].map.call(arguments, (v, i)=>this._cast(v, i, {
                defaults: false
            }), this);
        let cur = this;
        if (utils.isMongooseArray(cur)) {
            cur = cur.__array;
        }
        let i = cur.length;
        let mem;
        this._markModified();
        while(i--){
            mem = cur[i];
            if (mem instanceof Document) {
                const some = values.some(function(v) {
                    return mem.equals(v);
                });
                if (some) {
                    cur.splice(i, 1);
                }
            } else if (~this.indexOf.call(values, mem)) {
                cur.splice(i, 1);
            }
        }
        if (values[0] instanceof ArraySubdocument) {
            this._registerAtomic('$pullDocs', values.map(function(v) {
                const _id = v.$__getValue('_id');
                if (_id === undefined || v.$isDefault('_id')) {
                    return v;
                }
                return _id;
            }));
        } else {
            this._registerAtomic('$pullAll', values);
        }
        // Might have modified child paths and then pulled, like
        // `doc.children[1].name = 'test';` followed by
        // `doc.children.remove(doc.children[0]);`. In this case we fall back
        // to a `$set` on the whole array. See #3511
        if (cleanModifiedSubpaths(this[arrayParentSymbol], this[arrayPathSymbol]) > 0) {
            this._registerAtomic('$set', this);
        }
        return this;
    },
    /**
   * Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push) with proper change tracking.
   *
   * #### Example:
   *
   *     const schema = Schema({ nums: [Number] });
   *     const Model = mongoose.model('Test', schema);
   *
   *     const doc = await Model.create({ nums: [3, 4] });
   *     doc.nums.push(5); // Add 5 to the end of the array
   *     await doc.save();
   *
   *     // You can also pass an object with `$each` as the
   *     // first parameter to use MongoDB's `$position`
   *     doc.nums.push({
   *       $each: [1, 2],
   *       $position: 0
   *     });
   *     doc.nums; // [1, 2, 3, 4, 5]
   *
   * @param {...Object} [args]
   * @api public
   * @method push
   * @memberOf MongooseArray
   */ push () {
        let values = arguments;
        let atomic = values;
        const isOverwrite = values[0] != null && utils.hasUserDefinedProperty(values[0], '$each');
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        if (isOverwrite) {
            atomic = values[0];
            values = values[0].$each;
        }
        if (this[arraySchemaSymbol] == null) {
            return _basePush.apply(this, values);
        }
        _checkManualPopulation(this, values);
        _depopulateIfNecessary(this, values);
        values = [].map.call(values, this._mapCast, this);
        let ret;
        const atomics = this[arrayAtomicsSymbol];
        this._markModified();
        if (isOverwrite) {
            atomic.$each = values;
            if ((atomics.$push && atomics.$push.$each && atomics.$push.$each.length || 0) !== 0 && atomics.$push.$position != atomic.$position) {
                if (atomic.$position != null) {
                    [].splice.apply(arr, [
                        atomic.$position,
                        0
                    ].concat(values));
                    ret = arr.length;
                } else {
                    ret = [].push.apply(arr, values);
                }
                this._registerAtomic('$set', this);
            } else if (atomic.$position != null) {
                [].splice.apply(arr, [
                    atomic.$position,
                    0
                ].concat(values));
                ret = this.length;
            } else {
                ret = [].push.apply(arr, values);
            }
        } else {
            atomic = values;
            ret = _basePush.apply(arr, values);
        }
        this._registerAtomic('$push', atomic);
        return ret;
    },
    /**
   * Alias of [pull](https://mongoosejs.com/docs/api/array.html#MongooseArray.prototype.pull())
   *
   * @see MongooseArray#pull https://mongoosejs.com/docs/api/array.html#MongooseArray.prototype.pull()
   * @see mongodb https://www.mongodb.com/docs/manual/reference/operator/update/pull/
   * @api public
   * @memberOf MongooseArray
   * @instance
   * @method remove
   */ remove () {
        return this.pull.apply(this, arguments);
    },
    /**
   * Sets the casted `val` at index `i` and marks the array modified.
   *
   * #### Example:
   *
   *     // given documents based on the following
   *     const Doc = mongoose.model('Doc', new Schema({ array: [Number] }));
   *
   *     const doc = new Doc({ array: [2,3,4] })
   *
   *     console.log(doc.array) // [2,3,4]
   *
   *     doc.array.set(1,"5");
   *     console.log(doc.array); // [2,5,4] // properly cast to number
   *     doc.save() // the change is saved
   *
   *     // VS not using array#set
   *     doc.array[1] = "5";
   *     console.log(doc.array); // [2,"5",4] // no casting
   *     doc.save() // change is not saved
   *
   * @return {Array} this
   * @api public
   * @method set
   * @memberOf MongooseArray
   */ set (i, val, skipModified) {
        const arr = this.__array;
        if (skipModified) {
            arr[i] = val;
            return this;
        }
        const value = methods._cast.call(this, val, i);
        methods._markModified.call(this, i);
        arr[i] = value;
        return this;
    },
    /**
   * Wraps [`Array#shift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift) with proper change tracking.
   *
   * #### Example:
   *
   *     doc.array = [2,3];
   *     const res = doc.array.shift();
   *     console.log(res) // 2
   *     console.log(doc.array) // [3]
   *
   * #### Note:
   *
   * _marks the entire array as modified, which if saved, will store it as a `$set` operation, potentially overwritting any changes that happen between when you retrieved the object and when you save it._
   *
   * @api public
   * @method shift
   * @memberOf MongooseArray
   */ shift () {
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        this._markModified();
        const ret = [].shift.call(arr);
        this._registerAtomic('$set', this);
        return ret;
    },
    /**
   * Wraps [`Array#sort`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) with proper change tracking.
   *
   * #### Note:
   *
   * _marks the entire array as modified, which if saved, will store it as a `$set` operation, potentially overwritting any changes that happen between when you retrieved the object and when you save it._
   *
   * @api public
   * @method sort
   * @memberOf MongooseArray
   * @see MasteringJS: Array sort https://masteringjs.io/tutorials/fundamentals/array-sort
   */ sort () {
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        const ret = [].sort.apply(arr, arguments);
        this._registerAtomic('$set', this);
        return ret;
    },
    /**
   * Wraps [`Array#splice`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice) with proper change tracking and casting.
   *
   * #### Note:
   *
   * _marks the entire array as modified, which if saved, will store it as a `$set` operation, potentially overwritting any changes that happen between when you retrieved the object and when you save it._
   *
   * @api public
   * @method splice
   * @memberOf MongooseArray
   * @see MasteringJS: Array splice https://masteringjs.io/tutorials/fundamentals/array-splice
   */ splice () {
        let ret;
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        this._markModified();
        _checkManualPopulation(this, Array.prototype.slice.call(arguments, 2));
        if (arguments.length) {
            let vals;
            if (this[arraySchemaSymbol] == null) {
                vals = arguments;
            } else {
                vals = [];
                for(let i = 0; i < arguments.length; ++i){
                    vals[i] = i < 2 ? arguments[i] : this._cast(arguments[i], arguments[0] + (i - 2));
                }
            }
            ret = [].splice.apply(arr, vals);
            this._registerAtomic('$set', this);
        }
        return ret;
    },
    /*!
   * ignore
   */ toBSON () {
        return this.toObject(internalToObjectOptions);
    },
    /**
   * Returns a native js Array.
   *
   * @param {Object} options
   * @return {Array}
   * @api public
   * @method toObject
   * @memberOf MongooseArray
   */ toObject (options) {
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        if (options && options.depopulate) {
            options = clone(options);
            options._isNested = true;
            // Ensure return value is a vanilla array, because in Node.js 6+ `map()`
            // is smart enough to use the inherited array's constructor.
            return [].concat(arr).map(function(doc) {
                return doc instanceof Document ? doc.toObject(options) : doc;
            });
        }
        return [].concat(arr);
    },
    $toObject () {
        return this.constructor.prototype.toObject.apply(this, arguments);
    },
    /**
   * Wraps [`Array#unshift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift) with proper change tracking.
   *
   * #### Note:
   *
   * _marks the entire array as modified, which if saved, will store it as a `$set` operation, potentially overwriting any changes that happen between when you retrieved the object and when you save it._
   *
   * @api public
   * @method unshift
   * @memberOf MongooseArray
   */ unshift () {
        _checkManualPopulation(this, arguments);
        let values;
        if (this[arraySchemaSymbol] == null) {
            values = arguments;
        } else {
            values = [].map.call(arguments, this._cast, this);
        }
        const arr = utils.isMongooseArray(this) ? this.__array : this;
        this._markModified();
        [].unshift.apply(arr, values);
        this._registerAtomic('$set', this);
        return this.length;
    }
};
/*!
 * ignore
 */ function _isAllSubdocs(docs, ref) {
    if (!ref) {
        return false;
    }
    for (const arg of docs){
        if (arg == null) {
            return false;
        }
        const model = arg.constructor;
        if (!(arg instanceof Document) || model.modelName !== ref && model.baseModelName !== ref) {
            return false;
        }
    }
    return true;
}
/*!
 * Minimize _just_ empty objects along the path chain specified
 * by `parts`, ignoring all other paths. Useful in cases where
 * you want to minimize after unsetting a path.
 *
 * #### Example:
 *
 *     const obj = { foo: { bar: { baz: {} } }, a: {} };
 *     _minimizePath(obj, 'foo.bar.baz');
 *     obj; // { a: {} }
 */ function _minimizePath(obj, parts, i) {
    if (typeof parts === 'string') {
        if (parts.indexOf('.') === -1) {
            return;
        }
        parts = mpath.stringToParts(parts);
    }
    i = i || 0;
    if (i >= parts.length) {
        return;
    }
    if (obj == null || typeof obj !== 'object') {
        return;
    }
    _minimizePath(obj[parts[0]], parts, i + 1);
    if (obj[parts[0]] != null && typeof obj[parts[0]] === 'object' && Object.keys(obj[parts[0]]).length === 0) {
        delete obj[parts[0]];
    }
}
/*!
 * ignore
 */ function _checkManualPopulation(arr, docs) {
    const ref = arr == null ? null : arr[arraySchemaSymbol] && arr[arraySchemaSymbol].caster && arr[arraySchemaSymbol].caster.options && arr[arraySchemaSymbol].caster.options.ref || null;
    if (arr.length === 0 && docs.length !== 0) {
        if (_isAllSubdocs(docs, ref)) {
            arr[arrayParentSymbol].$populated(arr[arrayPathSymbol], [], {
                [populateModelSymbol]: docs[0].constructor
            });
        }
    }
}
/*!
 * If `docs` isn't all instances of the right model, depopulate `arr`
 */ function _depopulateIfNecessary(arr, docs) {
    const ref = arr == null ? null : arr[arraySchemaSymbol] && arr[arraySchemaSymbol].caster && arr[arraySchemaSymbol].caster.options && arr[arraySchemaSymbol].caster.options.ref || null;
    const parentDoc = arr[arrayParentSymbol];
    const path = arr[arrayPathSymbol];
    if (!ref || !parentDoc.populated(path)) {
        return;
    }
    for (const doc of docs){
        if (doc == null) {
            continue;
        }
        if (typeof doc !== 'object' || doc instanceof String || doc instanceof Number || doc instanceof Buffer || utils.isMongooseType(doc)) {
            parentDoc.depopulate(path);
            break;
        }
    }
}
const returnVanillaArrayMethods = [
    'filter',
    'flat',
    'flatMap',
    'map',
    'slice'
];
for (const method of returnVanillaArrayMethods){
    if (Array.prototype[method] == null) {
        continue;
    }
    methods[method] = function() {
        const _arr = utils.isMongooseArray(this) ? this.__array : this;
        const arr = [].concat(_arr);
        return arr[method].apply(arr, arguments);
    };
}
module.exports = methods;
}),
"[project]/backend/node_modules/mongoose/lib/types/array/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const mongooseArrayMethods = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/methods/index.js [app-route] (ecmascript)");
const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const arrayAtomicsBackupSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsBackupSymbol;
const arrayParentSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayParentSymbol;
const arrayPathSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayPathSymbol;
const arraySchemaSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arraySchemaSymbol;
/**
 * Mongoose Array constructor.
 *
 * #### Note:
 *
 * _Values always have to be passed to the constructor to initialize, otherwise `MongooseArray#push` will mark the array as modified._
 *
 * @param {Array} values
 * @param {String} path
 * @param {Document} doc parent document
 * @api private
 * @inherits Array https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * @see https://bit.ly/f6CnZU
 */ const _basePush = Array.prototype.push;
const numberRE = /^\d+$/;
function MongooseArray(values, path, doc, schematype) {
    let __array;
    if (Array.isArray(values)) {
        const len = values.length;
        // Perf optimizations for small arrays: much faster to use `...` than `for` + `push`,
        // but large arrays may cause stack overflows. And for arrays of length 0/1, just
        // modifying the array is faster. Seems small, but adds up when you have a document
        // with thousands of nested arrays.
        if (len === 0) {
            __array = new Array();
        } else if (len === 1) {
            __array = new Array(1);
            __array[0] = values[0];
        } else if (len < 10000) {
            __array = new Array();
            _basePush.apply(__array, values);
        } else {
            __array = new Array();
            for(let i = 0; i < len; ++i){
                _basePush.call(__array, values[i]);
            }
        }
    } else {
        __array = [];
    }
    const internals = {
        [arrayAtomicsSymbol]: {},
        [arrayAtomicsBackupSymbol]: void 0,
        [arrayPathSymbol]: path,
        [arraySchemaSymbol]: schematype,
        [arrayParentSymbol]: void 0,
        isMongooseArray: true,
        isMongooseArrayProxy: true,
        __array: __array
    };
    if (values && values[arrayAtomicsSymbol] != null) {
        internals[arrayAtomicsSymbol] = values[arrayAtomicsSymbol];
    }
    if (doc != null && doc.$__) {
        internals[arrayParentSymbol] = doc;
        internals[arraySchemaSymbol] = schematype || doc.schema.path(path);
    }
    const proxy = new Proxy(__array, {
        get: function(target, prop) {
            if (internals.hasOwnProperty(prop)) {
                return internals[prop];
            }
            if (mongooseArrayMethods.hasOwnProperty(prop)) {
                return mongooseArrayMethods[prop];
            }
            if (schematype && schematype.virtuals && schematype.virtuals.hasOwnProperty(prop)) {
                return schematype.virtuals[prop].applyGetters(undefined, target);
            }
            if (typeof prop === 'string' && numberRE.test(prop) && schematype?.$embeddedSchemaType != null) {
                return schematype.$embeddedSchemaType.applyGetters(__array[prop], doc);
            }
            return __array[prop];
        },
        set: function(target, prop, value) {
            if (typeof prop === 'string' && numberRE.test(prop)) {
                mongooseArrayMethods.set.call(proxy, prop, value, false);
            } else if (internals.hasOwnProperty(prop)) {
                internals[prop] = value;
            } else if (schematype && schematype.virtuals && schematype.virtuals.hasOwnProperty(prop)) {
                schematype.virtuals[prop].applySetters(value, target);
            } else {
                __array[prop] = value;
            }
            return true;
        }
    });
    return proxy;
}
/*!
 * Module exports.
 */ module.exports = exports = MongooseArray;
}),
"[project]/backend/node_modules/mongoose/lib/types/documentArray/methods/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const ArrayMethods = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/methods/index.js [app-route] (ecmascript)");
const Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const arrayParentSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayParentSymbol;
const arrayPathSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayPathSymbol;
const arraySchemaSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arraySchemaSymbol;
const documentArrayParent = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").documentArrayParent;
const _baseToString = Array.prototype.toString;
const methods = {
    /*!
   * ignore
   */ toBSON () {
        return this.toObject(internalToObjectOptions);
    },
    toString () {
        return _baseToString.call(this.__array.map((subdoc)=>{
            if (subdoc != null && subdoc.$__ != null) {
                return subdoc.toString();
            }
            return subdoc;
        }));
    },
    /*!
   * ignore
   */ getArrayParent () {
        return this[arrayParentSymbol];
    },
    /*!
   * ignore
   */ $schemaType () {
        return this[arraySchemaSymbol];
    },
    /**
   * Overrides MongooseArray#cast
   *
   * @method _cast
   * @api private
   * @memberOf MongooseDocumentArray
   */ _cast (value, index, options) {
        if (this[arraySchemaSymbol] == null) {
            return value;
        }
        let Constructor = this[arraySchemaSymbol].casterConstructor;
        const isInstance = Constructor.$isMongooseDocumentArray ? utils.isMongooseDocumentArray(value) : value instanceof Constructor;
        if (isInstance || value && value.constructor && value.constructor.baseCasterConstructor === Constructor) {
            if (!(value[documentArrayParent] && value.__parentArray)) {
                // value may have been created using array.create()
                value[documentArrayParent] = this[arrayParentSymbol];
                value.__parentArray = this;
            }
            value.$setIndex(index);
            return value;
        }
        if (value === undefined || value === null) {
            return null;
        }
        // handle cast('string') or cast(ObjectId) etc.
        // only objects are permitted so we can safely assume that
        // non-objects are to be interpreted as _id
        if (Buffer.isBuffer(value) || isBsonType(value, 'ObjectId') || !utils.isObject(value)) {
            value = {
                _id: value
            };
        }
        if (value && Constructor.discriminators && Constructor.schema && Constructor.schema.options && Constructor.schema.options.discriminatorKey) {
            if (typeof value[Constructor.schema.options.discriminatorKey] === 'string' && Constructor.discriminators[value[Constructor.schema.options.discriminatorKey]]) {
                Constructor = Constructor.discriminators[value[Constructor.schema.options.discriminatorKey]];
            } else {
                const constructorByValue = getDiscriminatorByValue(Constructor.discriminators, value[Constructor.schema.options.discriminatorKey]);
                if (constructorByValue) {
                    Constructor = constructorByValue;
                }
            }
        }
        if (Constructor.$isMongooseDocumentArray) {
            return Constructor.cast(value, this, undefined, undefined, index);
        }
        const ret = new Constructor(value, this, options, undefined, index);
        ret.isNew = true;
        return ret;
    },
    /**
   * Searches array items for the first document with a matching _id.
   *
   * #### Example:
   *
   *     const embeddedDoc = m.array.id(some_id);
   *
   * @return {EmbeddedDocument|null} the subdocument or null if not found.
   * @param {ObjectId|String|Number|Buffer} id
   * @method id
   * @api public
   * @memberOf MongooseDocumentArray
   */ id (id) {
        if (id == null) {
            return null;
        }
        const schemaType = this[arraySchemaSymbol];
        let idSchemaType = null;
        if (schemaType && schemaType.schema) {
            idSchemaType = schemaType.schema.path('_id');
        } else if (schemaType && schemaType.casterConstructor && schemaType.casterConstructor.schema) {
            idSchemaType = schemaType.casterConstructor.schema.path('_id');
        }
        let castedId = null;
        if (idSchemaType) {
            try {
                castedId = idSchemaType.cast(id);
            } catch (_err) {}
        }
        let _id;
        for (const val of this){
            if (!val) {
                continue;
            }
            _id = val.get('_id');
            if (_id == null) {
                continue;
            } else if (_id instanceof Document) {
                _id = _id.get('_id');
                if (castedId != null && utils.deepEqual(castedId, _id)) {
                    return val;
                } else if (castedId == null && (id == _id || utils.deepEqual(id, _id))) {
                    // Backwards compat: compare user-specified param to _id using loose equality
                    return val;
                }
            } else if (castedId != null && utils.deepEqual(castedId, _id)) {
                return val;
            } else if (castedId == null && (_id == id || utils.deepEqual(id, _id))) {
                // Backwards compat: compare user-specified param to _id using loose equality
                return val;
            }
        }
        return null;
    },
    /**
   * Returns a native js Array of plain js objects
   *
   * #### Note:
   *
   * _Each sub-document is converted to a plain object by calling its `#toObject` method._
   *
   * @param {Object} [options] optional options to pass to each documents `toObject` method call during conversion
   * @return {Array}
   * @method toObject
   * @api public
   * @memberOf MongooseDocumentArray
   */ toObject (options) {
        // `[].concat` coerces the return value into a vanilla JS array, rather
        // than a Mongoose array.
        return [].concat(this.map(function(doc) {
            if (doc == null) {
                return null;
            }
            if (typeof doc.toObject !== 'function') {
                return doc;
            }
            return doc.toObject(options);
        }));
    },
    $toObject () {
        return this.constructor.prototype.toObject.apply(this, arguments);
    },
    /**
   * Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push) with proper change tracking.
   *
   * @param {...Object} [args]
   * @api public
   * @method push
   * @memberOf MongooseDocumentArray
   */ push () {
        const ret = ArrayMethods.push.apply(this, arguments);
        _updateParentPopulated(this);
        return ret;
    },
    /**
   * Pulls items from the array atomically.
   *
   * @param {...Object} [args]
   * @api public
   * @method pull
   * @memberOf MongooseDocumentArray
   */ pull () {
        const ret = ArrayMethods.pull.apply(this, arguments);
        _updateParentPopulated(this);
        return ret;
    },
    /**
   * Wraps [`Array#shift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift) with proper change tracking.
   * @api private
   */ shift () {
        const ret = ArrayMethods.shift.apply(this, arguments);
        _updateParentPopulated(this);
        return ret;
    },
    /**
   * Wraps [`Array#splice`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice) with proper change tracking and casting.
   * @api private
   */ splice () {
        const ret = ArrayMethods.splice.apply(this, arguments);
        _updateParentPopulated(this);
        return ret;
    },
    /**
   * Helper for console.log
   *
   * @method inspect
   * @api public
   * @memberOf MongooseDocumentArray
   */ inspect () {
        return this.toObject();
    },
    /**
   * Creates a subdocument casted to this schema.
   *
   * This is the same subdocument constructor used for casting.
   *
   * @param {Object} obj the value to cast to this arrays SubDocument schema
   * @method create
   * @api public
   * @memberOf MongooseDocumentArray
   */ create (obj) {
        let Constructor = this[arraySchemaSymbol].casterConstructor;
        if (obj && Constructor.discriminators && Constructor.schema && Constructor.schema.options && Constructor.schema.options.discriminatorKey) {
            if (typeof obj[Constructor.schema.options.discriminatorKey] === 'string' && Constructor.discriminators[obj[Constructor.schema.options.discriminatorKey]]) {
                Constructor = Constructor.discriminators[obj[Constructor.schema.options.discriminatorKey]];
            } else {
                const constructorByValue = getDiscriminatorByValue(Constructor.discriminators, obj[Constructor.schema.options.discriminatorKey]);
                if (constructorByValue) {
                    Constructor = constructorByValue;
                }
            }
        }
        return new Constructor(obj, this);
    },
    /*!
   * ignore
   */ notify (event) {
        const _this = this;
        return function notify(val, _arr) {
            _arr = _arr || _this;
            let i = _arr.length;
            while(i--){
                if (_arr[i] == null) {
                    continue;
                }
                switch(event){
                    // only swap for save event for now, we may change this to all event types later
                    case 'save':
                        val = _this[i];
                        break;
                    default:
                        break;
                }
                if (utils.isMongooseArray(_arr[i])) {
                    notify(val, _arr[i]);
                } else if (_arr[i]) {
                    _arr[i].emit(event, val);
                }
            }
        };
    },
    set (i, val, skipModified) {
        const arr = this.__array;
        if (skipModified) {
            arr[i] = val;
            return this;
        }
        const value = methods._cast.call(this, val, i);
        methods._markModified.call(this, i);
        arr[i] = value;
        return this;
    },
    _markModified (elem, embeddedPath) {
        const parent = this[arrayParentSymbol];
        let dirtyPath;
        if (parent) {
            dirtyPath = this[arrayPathSymbol];
            if (arguments.length) {
                if (embeddedPath != null) {
                    // an embedded doc bubbled up the change
                    const index = elem.__index;
                    dirtyPath = dirtyPath + '.' + index + '.' + embeddedPath;
                } else {
                    // directly set an index
                    dirtyPath = dirtyPath + '.' + elem;
                }
            }
            if (dirtyPath != null && dirtyPath.endsWith('.$')) {
                return this;
            }
            parent.markModified(dirtyPath, arguments.length !== 0 ? elem : parent);
        }
        return this;
    }
};
module.exports = methods;
/**
 * If this is a document array, each element may contain single
 * populated paths, so we need to modify the top-level document's
 * populated cache. See gh-8247, gh-8265.
 * @param {Array} arr
 * @api private
 */ function _updateParentPopulated(arr) {
    const parent = arr[arrayParentSymbol];
    if (!parent || parent.$__.populated == null) return;
    const populatedPaths = Object.keys(parent.$__.populated).filter((p)=>p.startsWith(arr[arrayPathSymbol] + '.'));
    for (const path of populatedPaths){
        const remnant = path.slice((arr[arrayPathSymbol] + '.').length);
        if (!Array.isArray(parent.$__.populated[path].value)) {
            continue;
        }
        parent.$__.populated[path].value = arr.map((val)=>val.$populated(remnant));
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/types/documentArray/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const ArrayMethods = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/methods/index.js [app-route] (ecmascript)");
const DocumentArrayMethods = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/methods/index.js [app-route] (ecmascript)");
const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const arrayAtomicsBackupSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsBackupSymbol;
const arrayParentSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayParentSymbol;
const arrayPathSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayPathSymbol;
const arraySchemaSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arraySchemaSymbol;
const _basePush = Array.prototype.push;
const numberRE = /^\d+$/;
/**
 * DocumentArray constructor
 *
 * @param {Array} values
 * @param {String} path the path to this array
 * @param {Document} doc parent document
 * @api private
 * @return {MongooseDocumentArray}
 * @inherits MongooseArray
 * @see https://bit.ly/f6CnZU
 */ function MongooseDocumentArray(values, path, doc, schematype) {
    const __array = [];
    const internals = {
        [arrayAtomicsSymbol]: {},
        [arrayAtomicsBackupSymbol]: void 0,
        [arrayPathSymbol]: path,
        [arraySchemaSymbol]: void 0,
        [arrayParentSymbol]: void 0
    };
    if (Array.isArray(values)) {
        if (values[arrayPathSymbol] === path && values[arrayParentSymbol] === doc) {
            internals[arrayAtomicsSymbol] = Object.assign({}, values[arrayAtomicsSymbol]);
        }
        values.forEach((v)=>{
            _basePush.call(__array, v);
        });
    }
    internals[arrayPathSymbol] = path;
    internals.__array = __array;
    if (doc && doc.$__) {
        internals[arrayParentSymbol] = doc;
        internals[arraySchemaSymbol] = doc.$__schema.path(path);
        // `schema.path()` doesn't drill into nested arrays properly yet, see
        // gh-6398, gh-6602. This is a workaround because nested arrays are
        // always plain non-document arrays, so once you get to a document array
        // nesting is done. Matryoshka code.
        while(internals[arraySchemaSymbol] != null && internals[arraySchemaSymbol].$isMongooseArray && !internals[arraySchemaSymbol].$isMongooseDocumentArray){
            internals[arraySchemaSymbol] = internals[arraySchemaSymbol].casterConstructor;
        }
    }
    const proxy = new Proxy(__array, {
        get: function(target, prop) {
            if (prop === 'isMongooseArray' || prop === 'isMongooseArrayProxy' || prop === 'isMongooseDocumentArray' || prop === 'isMongooseDocumentArrayProxy') {
                return true;
            }
            if (internals.hasOwnProperty(prop)) {
                return internals[prop];
            }
            if (DocumentArrayMethods.hasOwnProperty(prop)) {
                return DocumentArrayMethods[prop];
            }
            if (schematype && schematype.virtuals && schematype.virtuals.hasOwnProperty(prop)) {
                return schematype.virtuals[prop].applyGetters(undefined, target);
            }
            if (ArrayMethods.hasOwnProperty(prop)) {
                return ArrayMethods[prop];
            }
            return __array[prop];
        },
        set: function(target, prop, value) {
            if (typeof prop === 'string' && numberRE.test(prop)) {
                DocumentArrayMethods.set.call(proxy, prop, value, false);
            } else if (internals.hasOwnProperty(prop)) {
                internals[prop] = value;
            } else if (schematype && schematype.virtuals && schematype.virtuals.hasOwnProperty(prop)) {
                schematype.virtuals[prop].applySetters(value, target);
            } else {
                __array[prop] = value;
            }
            return true;
        }
    });
    return proxy;
}
/*!
 * Module exports.
 */ module.exports = MongooseDocumentArray;
}),
"[project]/backend/node_modules/mongoose/lib/types/double.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Double type constructor
 *
 * #### Example:
 *
 *     const pi = new mongoose.Types.Double(3.1415);
 *
 * @constructor Double
 */ module.exports = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").Double;
}),
"[project]/backend/node_modules/mongoose/lib/types/map.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const deepEqual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)").deepEqual;
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const handleSpreadDoc = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/handleSpreadDoc.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const specialProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const cleanModifiedSubpaths = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/cleanModifiedSubpaths.js [app-route] (ecmascript)");
const populateModelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").populateModelSymbol;
/*!
 * ignore
 */ class MongooseMap extends Map {
    constructor(v, path, doc, schemaType, options){
        if (getConstructorName(v) === 'Object') {
            v = Object.keys(v).reduce((arr, key)=>arr.concat([
                    [
                        key,
                        v[key]
                    ]
                ]), []);
        }
        super(v);
        this.$__parent = doc != null && doc.$__ != null ? doc : null;
        // Calculate the full path from the root document
        // Priority: parent.$basePath (from subdoc) > options.path (from parent map/structure) > path (schema path)
        // Subdocuments have the most up-to-date path info, so prefer that over options.path
        if (this.$__parent?.$isSingleNested && this.$__parent.$basePath) {
            this.$__path = this.$__parent.$basePath + '.' + path;
            // Performance optimization: store path relative to parent subdocument
            // to avoid string operations in set() hot path
            this.$__pathRelativeToParent = path;
        } else if (options?.path) {
            this.$__path = options.path;
            this.$__pathRelativeToParent = null;
        } else {
            this.$__path = path;
            this.$__pathRelativeToParent = null;
        }
        this.$__schemaType = schemaType;
        this.$__runDeferred();
    }
    $init(key, value) {
        checkValidKey(key);
        super.set(key, value);
        if (value != null && value.$isSingleNested) {
            value.$basePath = this.$__path + '.' + key;
            // Store the path relative to parent subdoc for efficient markModified()
            if (this.$__pathRelativeToParent != null) {
                // Map's parent is a subdocument, store path relative to that subdoc
                value.$pathRelativeToParent = this.$__pathRelativeToParent + '.' + key;
            } else {
                // Map's parent is root document, store the full path
                value.$pathRelativeToParent = this.$__path + '.' + key;
            }
        }
    }
    $__set(key, value) {
        super.set(key, value);
    }
    /**
   * Overwrites native Map's `get()` function to support Mongoose getters.
   *
   * @api public
   * @method get
   * @memberOf Map
   */ get(key, options) {
        if (isBsonType(key, 'ObjectId')) {
            key = key.toString();
        }
        options = options || {};
        if (options.getters === false) {
            return super.get(key);
        }
        return this.$__schemaType.applyGetters(super.get(key), this.$__parent);
    }
    /**
   * Overwrites native Map's `set()` function to support setters, `populate()`,
   * and change tracking. Note that Mongoose maps _only_ support strings and
   * ObjectIds as keys.
   *
   * Keys also cannot:
   * - be named after special properties `prototype`, `constructor`, and `__proto__`
   * - start with a dollar sign (`$`)
   * - contain any dots (`.`)
   *
   * #### Example:
   *
   *     doc.myMap.set('test', 42); // works
   *     doc.myMap.set({ obj: 42 }, 42); // Throws "Mongoose maps only support string keys"
   *     doc.myMap.set(10, 42); // Throws "Mongoose maps only support string keys"
   *     doc.myMap.set("$test", 42); // Throws "Mongoose maps do not support keys that start with "$", got "$test""
   *
   * @api public
   * @method set
   * @memberOf Map
   */ set(key, value) {
        if (isBsonType(key, 'ObjectId')) {
            key = key.toString();
        }
        checkValidKey(key);
        value = handleSpreadDoc(value);
        // Weird, but because you can't assign to `this` before calling `super()`
        // you can't get access to `$__schemaType` to cast in the initial call to
        // `set()` from the `super()` constructor.
        if (this.$__schemaType == null) {
            this.$__deferred = this.$__deferred || [];
            this.$__deferred.push({
                key: key,
                value: value
            });
            return;
        }
        let _fullPath;
        const parent = this.$__parent;
        const populated = parent != null && parent.$__ && parent.$__.populated ? parent.$populated(fullPath.call(this), true) || parent.$populated(this.$__path, true) : null;
        const priorVal = this.get(key);
        if (populated != null) {
            if (this.$__schemaType.$isSingleNested) {
                throw new MongooseError('Cannot manually populate single nested subdoc underneath Map ' + `at path "${this.$__path}". Try using an array instead of a Map.`);
            }
            if (Array.isArray(value) && this.$__schemaType.$isMongooseArray) {
                value = value.map((v)=>{
                    if (v.$__ == null) {
                        v = new populated.options[populateModelSymbol](v);
                    }
                    // Doesn't support single nested "in-place" populate
                    v.$__.wasPopulated = {
                        value: v._doc._id
                    };
                    return v;
                });
            } else if (value != null) {
                if (value.$__ == null) {
                    value = new populated.options[populateModelSymbol](value);
                }
                // Doesn't support single nested "in-place" populate
                value.$__.wasPopulated = {
                    value: value._doc._id
                };
            }
        } else {
            try {
                let options = null;
                if (this.$__schemaType.$isMongooseDocumentArray || this.$__schemaType.$isSingleNested || this.$__schemaType.$isMongooseArray || this.$__schemaType.$isSchemaMap) {
                    options = {
                        path: fullPath.call(this)
                    };
                    // For subdocuments, also pass the relative path to avoid string operations
                    if (this.$__schemaType.$isSingleNested) {
                        options.pathRelativeToParent = this.$__pathRelativeToParent != null ? this.$__pathRelativeToParent + '.' + key : this.$__path + '.' + key;
                    }
                }
                value = this.$__schemaType.applySetters(value, this.$__parent, false, this.get(key), options);
            } catch (error) {
                if (this.$__parent != null && this.$__parent.$__ != null) {
                    this.$__parent.invalidate(fullPath.call(this), error);
                    return;
                }
                throw error;
            }
        }
        super.set(key, value);
        // Set relative path on subdocuments to avoid string operations in markModified()
        // The path should be relative to the parent subdocument (if any), not just the key
        if (value != null && value.$isSingleNested) {
            if (this.$__pathRelativeToParent != null) {
                // Map's parent is a subdocument, store path relative to that subdoc (e.g., 'items.i2')
                value.$pathRelativeToParent = this.$__pathRelativeToParent + '.' + key;
            } else {
                // Map's parent is root document, store just the full path
                value.$pathRelativeToParent = this.$__path + '.' + key;
            }
        }
        if (parent != null && parent.$__ != null && !deepEqual(value, priorVal)) {
            // Optimization: if parent is a subdocument, use precalculated relative path
            // to avoid building a full path just to strip the parent's prefix
            let pathToMark;
            if (this.$__pathRelativeToParent != null) {
                // Parent is a subdocument - use precalculated relative path (e.g., 'items.i1')
                pathToMark = this.$__pathRelativeToParent + '.' + key;
            } else {
                // Parent is root document or map - use full path
                pathToMark = fullPath.call(this);
            }
            parent.markModified(pathToMark);
            // If overwriting the full document array or subdoc, make sure to clean up any paths that were modified
            // before re: #15108
            if (this.$__schemaType.$isMongooseDocumentArray || this.$__schemaType.$isSingleNested) {
                cleanModifiedSubpaths(parent, pathToMark);
            }
        }
        // Delay calculating full path unless absolutely necessary, because string
        // concatenation is a bottleneck re: #13171
        function fullPath() {
            if (_fullPath) {
                return _fullPath;
            }
            _fullPath = this.$__path + '.' + key;
            return _fullPath;
        }
    }
    /**
   * Overwrites native Map's `clear()` function to support change tracking.
   *
   * @api public
   * @method clear
   * @memberOf Map
   */ clear() {
        super.clear();
        const parent = this.$__parent;
        if (parent != null) {
            parent.markModified(this.$__path);
        }
    }
    /**
   * Overwrites native Map's `delete()` function to support change tracking.
   *
   * @api public
   * @method delete
   * @memberOf Map
   */ delete(key) {
        if (isBsonType(key, 'ObjectId')) {
            key = key.toString();
        }
        this.set(key, undefined);
        return super.delete(key);
    }
    /**
   * Converts this map to a native JavaScript Map so the MongoDB driver can serialize it.
   *
   * @api public
   * @method toBSON
   * @memberOf Map
   */ toBSON() {
        return new Map(this);
    }
    toObject(options) {
        if (options && options.flattenMaps) {
            const ret = {};
            const keys = this.keys();
            for (const key of keys){
                ret[key] = clone(this.get(key), options);
            }
            return ret;
        }
        return new Map(this);
    }
    $toObject() {
        return this.constructor.prototype.toObject.apply(this, arguments);
    }
    /**
   * Converts this map to a native JavaScript Map for `JSON.stringify()`. Set
   * the `flattenMaps` option to convert this map to a POJO instead.
   *
   * #### Example:
   *
   *     doc.myMap.toJSON() instanceof Map; // true
   *     doc.myMap.toJSON({ flattenMaps: true }) instanceof Map; // false
   *
   * @api public
   * @method toJSON
   * @param {Object} [options]
   * @param {Boolean} [options.flattenMaps=false] set to `true` to convert the map to a POJO rather than a native JavaScript map
   * @memberOf Map
   */ toJSON(options) {
        if (typeof (options && options.flattenMaps) === 'boolean' ? options.flattenMaps : true) {
            const ret = {};
            const keys = this.keys();
            for (const key of keys){
                ret[key] = clone(this.get(key), options);
            }
            return ret;
        }
        return new Map(this);
    }
    inspect() {
        return new Map(this);
    }
    $__runDeferred() {
        if (!this.$__deferred) {
            return;
        }
        for (const keyValueObject of this.$__deferred){
            this.set(keyValueObject.key, keyValueObject.value);
        }
        this.$__deferred = null;
    }
}
if (util.inspect.custom) {
    Object.defineProperty(MongooseMap.prototype, util.inspect.custom, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: MongooseMap.prototype.inspect
    });
}
Object.defineProperty(MongooseMap.prototype, '$__set', {
    enumerable: false,
    writable: true,
    configurable: false
});
Object.defineProperty(MongooseMap.prototype, '$__parent', {
    enumerable: false,
    writable: true,
    configurable: false
});
Object.defineProperty(MongooseMap.prototype, '$__path', {
    enumerable: false,
    writable: true,
    configurable: false
});
Object.defineProperty(MongooseMap.prototype, '$__schemaType', {
    enumerable: false,
    writable: true,
    configurable: false
});
/**
 * Set to `true` for all Mongoose map instances
 *
 * @api public
 * @property $isMongooseMap
 * @memberOf MongooseMap
 * @instance
 */ Object.defineProperty(MongooseMap.prototype, '$isMongooseMap', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: true
});
Object.defineProperty(MongooseMap.prototype, '$__deferredCalls', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: true
});
/**
 * Since maps are stored as objects under the hood, keys must be strings
 * and can't contain any invalid characters
 * @param {String} key
 * @api private
 */ function checkValidKey(key) {
    const keyType = typeof key;
    if (keyType !== 'string') {
        throw new TypeError(`Mongoose maps only support string keys, got ${keyType}`);
    }
    if (key.startsWith('$')) {
        throw new Error(`Mongoose maps do not support keys that start with "$", got "${key}"`);
    }
    if (key.includes('.')) {
        throw new Error(`Mongoose maps do not support keys that contain ".", got "${key}"`);
    }
    if (specialProperties.has(key)) {
        throw new Error(`Mongoose maps do not support reserved key name "${key}"`);
    }
}
module.exports = MongooseMap;
}),
"[project]/backend/node_modules/mongoose/lib/types/uuid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * UUID type constructor
 *
 * #### Example:
 *
 *     const id = new mongoose.Types.UUID();
 *
 * @constructor UUID
 */ module.exports = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").UUID;
}),
"[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module exports.
 */ exports.Array = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/index.js [app-route] (ecmascript)");
exports.Buffer = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/buffer.js [app-route] (ecmascript)");
exports.Document = exports.Embedded = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/arraySubdocument.js [app-route] (ecmascript)");
exports.DocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/index.js [app-route] (ecmascript)");
exports.Double = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/double.js [app-route] (ecmascript)");
exports.Decimal128 = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/decimal128.js [app-route] (ecmascript)");
exports.ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
exports.Map = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/map.js [app-route] (ecmascript)");
exports.Subdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/subdocument.js [app-route] (ecmascript)");
exports.UUID = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/uuid.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ exports.internalToObjectOptions = {
    transform: false,
    virtuals: false,
    getters: false,
    _skipDepopulateTopLevel: true,
    depopulate: true,
    flattenDecimals: false,
    useProjection: false,
    versionKey: true,
    flattenObjectIds: false
};
}),
"[project]/backend/node_modules/mongoose/lib/cursor/changeStream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
/*!
 * ignore
 */ const driverChangeStreamEvents = [
    'close',
    'change',
    'end',
    'error',
    'resumeTokenChanged'
];
/*!
 * ignore
 */ class ChangeStream extends EventEmitter {
    constructor(changeStreamThunk, pipeline, options){
        super();
        this.driverChangeStream = null;
        this.closed = false;
        this.bindedEvents = false;
        this.pipeline = pipeline;
        this.options = options;
        this.errored = false;
        if (options && options.hydrate && !options.model) {
            throw new Error('Cannot create change stream with `hydrate: true` ' + 'unless calling `Model.watch()`');
        }
        let syncError = null;
        this.$driverChangeStreamPromise = new Promise((resolve, reject)=>{
            // This wrapper is necessary because of buffering.
            try {
                changeStreamThunk((err, driverChangeStream)=>{
                    if (err != null) {
                        this.errored = true;
                        this.emit('error', err);
                        return reject(err);
                    }
                    this.driverChangeStream = driverChangeStream;
                    this.emit('ready');
                    resolve();
                });
            } catch (err) {
                syncError = err;
                this.errored = true;
                this.emit('error', err);
                reject(err);
            }
        });
        // Because a ChangeStream is an event emitter, there's no way to register an 'error' handler
        // that catches errors which occur in the constructor, unless we force sync errors into async
        // errors with setImmediate(). For cleaner stack trace, we just immediately throw any synchronous
        // errors that occurred with changeStreamThunk().
        if (syncError != null) {
            throw syncError;
        }
    }
    _bindEvents() {
        if (this.bindedEvents) {
            return;
        }
        this.bindedEvents = true;
        if (this.driverChangeStream == null) {
            this.$driverChangeStreamPromise.then(()=>{
                this.driverChangeStream.on('close', ()=>{
                    this.closed = true;
                });
                driverChangeStreamEvents.forEach((ev)=>{
                    this.driverChangeStream.on(ev, (data)=>{
                        if (data != null && data.fullDocument != null && this.options && this.options.hydrate) {
                            data.fullDocument = this.options.model.hydrate(data.fullDocument);
                        }
                        this.emit(ev, data);
                    });
                });
            }, ()=>{} // No need to register events if opening change stream failed
            );
            return;
        }
        this.driverChangeStream.on('close', ()=>{
            this.closed = true;
        });
        driverChangeStreamEvents.forEach((ev)=>{
            this.driverChangeStream.on(ev, (data)=>{
                if (data != null && data.fullDocument != null && this.options && this.options.hydrate) {
                    data.fullDocument = this.options.model.hydrate(data.fullDocument);
                }
                this.emit(ev, data);
            });
        });
    }
    hasNext(cb) {
        if (this.errored) {
            throw new MongooseError('Cannot call hasNext() on errored ChangeStream');
        }
        return this.driverChangeStream.hasNext(cb);
    }
    next(cb) {
        if (this.errored) {
            throw new MongooseError('Cannot call next() on errored ChangeStream');
        }
        if (this.options && this.options.hydrate) {
            if (cb != null) {
                const originalCb = cb;
                cb = (err, data)=>{
                    if (err != null) {
                        return originalCb(err);
                    }
                    if (data.fullDocument != null) {
                        data.fullDocument = this.options.model.hydrate(data.fullDocument);
                    }
                    return originalCb(null, data);
                };
            }
            let maybePromise = this.driverChangeStream.next(cb);
            if (maybePromise && typeof maybePromise.then === 'function') {
                maybePromise = maybePromise.then((data)=>{
                    if (data.fullDocument != null) {
                        data.fullDocument = this.options.model.hydrate(data.fullDocument);
                    }
                    return data;
                });
            }
            return maybePromise;
        }
        return this.driverChangeStream.next(cb);
    }
    addListener(event, handler) {
        if (this.errored) {
            throw new MongooseError('Cannot call addListener() on errored ChangeStream');
        }
        this._bindEvents();
        return super.addListener(event, handler);
    }
    on(event, handler) {
        if (this.errored) {
            throw new MongooseError('Cannot call on() on errored ChangeStream');
        }
        this._bindEvents();
        return super.on(event, handler);
    }
    once(event, handler) {
        if (this.errored) {
            throw new MongooseError('Cannot call once() on errored ChangeStream');
        }
        this._bindEvents();
        return super.once(event, handler);
    }
    _queue(cb) {
        this.once('ready', ()=>cb());
    }
    close() {
        this.closed = true;
        if (this.driverChangeStream) {
            return this.driverChangeStream.close();
        } else {
            return this.$driverChangeStreamPromise.then(()=>this.driverChangeStream.close(), ()=>{} // No need to close if opening the change stream failed
            );
        }
    }
}
/*!
 * ignore
 */ module.exports = ChangeStream;
}),
"[project]/backend/node_modules/mongoose/lib/cursor/queryCursor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const Readable = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Readable;
const eachAsync = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/cursor/eachAsync.js [app-route] (ecmascript)");
const helpers = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/queryHelpers.js [app-route] (ecmascript)");
const kareem = __turbopack_context__.r("[project]/backend/node_modules/kareem/index.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const { once } = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * A QueryCursor is a concurrency primitive for processing query results
 * one document at a time. A QueryCursor fulfills the Node.js streams3 API,
 * in addition to several other mechanisms for loading documents from MongoDB
 * one at a time.
 *
 * QueryCursors execute the model's pre `find` hooks before loading any documents
 * from MongoDB, and the model's post `find` hooks after loading each document.
 *
 * Unless you're an advanced user, do **not** instantiate this class directly.
 * Use [`Query#cursor()`](https://mongoosejs.com/docs/api/query.html#Query.prototype.cursor()) instead.
 *
 * @param {Query} query
 * @param {Object} options query options passed to `.find()`
 * @inherits Readable https://nodejs.org/api/stream.html#class-streamreadable
 * @event `cursor`: Emitted when the cursor is created
 * @event `error`: Emitted when an error occurred
 * @event `data`: Emitted when the stream is flowing and the next doc is ready
 * @event `end`: Emitted when the stream is exhausted
 * @api public
 */ function QueryCursor(query) {
    // set autoDestroy=true because on node 12 it's by default false
    // gh-10902 need autoDestroy to destroy correctly and emit 'close' event
    Readable.call(this, {
        autoDestroy: true,
        objectMode: true
    });
    this.cursor = null;
    this.skipped = false;
    this.query = query;
    this._closed = false;
    const model = query.model;
    this._mongooseOptions = {};
    this._transforms = [];
    this.model = model;
    this.options = {};
    model.hooks.execPre('find', query, (err)=>{
        if (err != null) {
            if (err instanceof kareem.skipWrappedFunction) {
                const resultValue = err.args[0];
                if (resultValue != null && (!Array.isArray(resultValue) || resultValue.length)) {
                    const err = new MongooseError('Cannot `skipMiddlewareFunction()` with a value when using ' + '`.find().cursor()`, value must be nullish or empty array, got "' + util.inspect(resultValue) + '".');
                    this._markError(err);
                    this.listeners('error').length > 0 && this.emit('error', err);
                    return;
                }
                this.skipped = true;
                this.emit('cursor', null);
                return;
            }
            this._markError(err);
            this.listeners('error').length > 0 && this.emit('error', err);
            return;
        }
        Object.assign(this.options, query._optionsForExec());
        this._transforms = this._transforms.concat(query._transforms.slice());
        if (this.options.transform) {
            this._transforms.push(this.options.transform);
        }
        // Re: gh-8039, you need to set the `cursor.batchSize` option, top-level
        // `batchSize` option doesn't work.
        if (this.options.batchSize) {
            // Max out the number of documents we'll populate in parallel at 5000.
            this.options._populateBatchSize = Math.min(this.options.batchSize, 5000);
        }
        if (query._mongooseOptions._asyncIterator) {
            this._mongooseOptions._asyncIterator = true;
        }
        if (model.collection._shouldBufferCommands() && model.collection.buffer) {
            model.collection.queue.push([
                ()=>_getRawCursor(query, this)
            ]);
        } else {
            _getRawCursor(query, this);
        }
    });
}
util.inherits(QueryCursor, Readable);
/*!
 * ignore
 */ function _getRawCursor(query, queryCursor) {
    try {
        const cursor = query.model.collection.find(query._conditions, queryCursor.options);
        queryCursor.cursor = cursor;
        queryCursor.emit('cursor', cursor);
    } catch (err) {
        queryCursor._markError(err);
        queryCursor.listeners('error').length > 0 && queryCursor.emit('error', queryCursor._error);
    }
}
/**
 * Necessary to satisfy the Readable API
 * @method _read
 * @memberOf QueryCursor
 * @instance
 * @api private
 */ QueryCursor.prototype._read = function() {
    _next(this, (error, doc)=>{
        if (error) {
            return this.emit('error', error);
        }
        if (!doc) {
            this.push(null);
            this.cursor.close(function(error) {
                if (error) {
                    return this.emit('error', error);
                }
            });
            return;
        }
        this.push(doc);
    });
};
/**
 * Returns the underlying cursor from the MongoDB Node driver that this cursor uses.
 *
 * @method getDriverCursor
 * @memberOf QueryCursor
 * @returns {Cursor} MongoDB Node driver cursor instance
 * @instance
 * @api public
 */ QueryCursor.prototype.getDriverCursor = async function getDriverCursor() {
    if (this.cursor) {
        return this.cursor;
    }
    await once(this, 'cursor');
    return this.cursor;
};
/**
 * Registers a transform function which subsequently maps documents retrieved
 * via the streams interface or `.next()`
 *
 * #### Example:
 *
 *     // Map documents returned by `data` events
 *     Thing.
 *       find({ name: /^hello/ }).
 *       cursor().
 *       map(function (doc) {
 *        doc.foo = "bar";
 *        return doc;
 *       })
 *       on('data', function(doc) { console.log(doc.foo); });
 *
 *     // Or map documents returned by `.next()`
 *     const cursor = Thing.find({ name: /^hello/ }).
 *       cursor().
 *       map(function (doc) {
 *         doc.foo = "bar";
 *         return doc;
 *       });
 *     cursor.next(function(error, doc) {
 *       console.log(doc.foo);
 *     });
 *
 * @param {Function} fn
 * @return {QueryCursor}
 * @memberOf QueryCursor
 * @api public
 * @method map
 */ Object.defineProperty(QueryCursor.prototype, 'map', {
    value: function(fn) {
        this._transforms.push(fn);
        return this;
    },
    enumerable: true,
    configurable: true,
    writable: true
});
/**
 * Marks this cursor as errored
 * @method _markError
 * @memberOf QueryCursor
 * @instance
 * @api private
 */ QueryCursor.prototype._markError = function(error) {
    this._error = error;
    return this;
};
/**
 * Marks this cursor as closed. Will stop streaming and subsequent calls to
 * `next()` will error.
 *
 * @return {Promise}
 * @api public
 * @method close
 * @emits close
 * @see AggregationCursor.close https://mongodb.github.io/node-mongodb-native/4.9/classes/AggregationCursor.html#close
 */ QueryCursor.prototype.close = async function close() {
    if (typeof arguments[0] === 'function') {
        throw new MongooseError('QueryCursor.prototype.close() no longer accepts a callback');
    }
    try {
        await this.cursor.close();
        this._closed = true;
        this.emit('close');
    } catch (error) {
        this.listeners('error').length > 0 && this.emit('error', error);
        throw error;
    }
};
/**
 * Marks this cursor as destroyed. Will stop streaming and subsequent calls to
 * `next()` will error.
 *
 * @return {this}
 * @api private
 * @method _destroy
 */ QueryCursor.prototype._destroy = function _destroy(_err, callback) {
    let waitForCursor = null;
    if (!this.cursor) {
        waitForCursor = new Promise((resolve)=>{
            this.once('cursor', resolve);
        });
    } else {
        waitForCursor = Promise.resolve();
    }
    waitForCursor.then(()=>{
        this.cursor.close();
    }).then(()=>{
        this._closed = true;
        callback();
    }).catch((error)=>{
        callback(error);
    });
    return this;
};
/**
 * Rewind this cursor to its uninitialized state. Any options that are present on the cursor will
 * remain in effect. Iterating this cursor will cause new queries to be sent to the server, even
 * if the resultant data has already been retrieved by this cursor.
 *
 * @return {AggregationCursor} this
 * @api public
 * @method rewind
 */ QueryCursor.prototype.rewind = function() {
    _waitForCursor(this, ()=>{
        this.cursor.rewind();
    });
    return this;
};
/**
 * Get the next document from this cursor. Will return `null` when there are
 * no documents left.
 *
 * @return {Promise}
 * @api public
 * @method next
 */ QueryCursor.prototype.next = async function next() {
    if (typeof arguments[0] === 'function') {
        throw new MongooseError('QueryCursor.prototype.next() no longer accepts a callback');
    }
    if (this._closed) {
        throw new MongooseError('Cannot call `next()` on a closed cursor');
    }
    return new Promise((resolve, reject)=>{
        _next(this, function(error, doc) {
            if (error) {
                return reject(error);
            }
            resolve(doc);
        });
    });
};
/**
 * Execute `fn` for every document in the cursor. If `fn` returns a promise,
 * will wait for the promise to resolve before iterating on to the next one.
 * Returns a promise that resolves when done.
 *
 * #### Example:
 *
 *     // Iterate over documents asynchronously
 *     Thing.
 *       find({ name: /^hello/ }).
 *       cursor().
 *       eachAsync(async function (doc, i) {
 *         doc.foo = doc.bar + i;
 *         await doc.save();
 *       })
 *
 * @param {Function} fn
 * @param {Object} [options]
 * @param {Number} [options.parallel] the number of promises to execute in parallel. Defaults to 1.
 * @param {Number} [options.batchSize] if set, will call `fn()` with arrays of documents with length at most `batchSize`
 * @param {Boolean} [options.continueOnError=false] if true, `eachAsync()` iterates through all docs even if `fn` throws an error. If false, `eachAsync()` throws an error immediately if the given function `fn()` throws an error.
 * @return {Promise}
 * @api public
 * @method eachAsync
 */ QueryCursor.prototype.eachAsync = function(fn, opts) {
    if (typeof arguments[2] === 'function') {
        throw new MongooseError('QueryCursor.prototype.eachAsync() no longer accepts a callback');
    }
    if (typeof opts === 'function') {
        opts = {};
    }
    opts = opts || {};
    return eachAsync((cb)=>_next(this, cb), fn, opts);
};
/**
 * The `options` passed in to the `QueryCursor` constructor.
 *
 * @api public
 * @property options
 */ QueryCursor.prototype.options;
/**
 * Adds a [cursor flag](https://mongodb.github.io/node-mongodb-native/4.9/classes/FindCursor.html#addCursorFlag).
 * Useful for setting the `noCursorTimeout` and `tailable` flags.
 *
 * @param {String} flag
 * @param {Boolean} value
 * @return {AggregationCursor} this
 * @api public
 * @method addCursorFlag
 */ QueryCursor.prototype.addCursorFlag = function(flag, value) {
    _waitForCursor(this, ()=>{
        this.cursor.addCursorFlag(flag, value);
    });
    return this;
};
/**
 * Returns an asyncIterator for use with [`for/await/of` loops](https://thecodebarbarian.com/getting-started-with-async-iterators-in-node-js).
 * You do not need to call this function explicitly, the JavaScript runtime
 * will call it for you.
 *
 * #### Example:
 *
 *     // Works without using `cursor()`
 *     for await (const doc of Model.find([{ $sort: { name: 1 } }])) {
 *       console.log(doc.name);
 *     }
 *
 *     // Can also use `cursor()`
 *     for await (const doc of Model.find([{ $sort: { name: 1 } }]).cursor()) {
 *       console.log(doc.name);
 *     }
 *
 * Node.js 10.x supports async iterators natively without any flags. You can
 * enable async iterators in Node.js 8.x using the [`--harmony_async_iteration` flag](https://github.com/tc39/proposal-async-iteration/issues/117#issuecomment-346695187).
 *
 * **Note:** This function is not if `Symbol.asyncIterator` is undefined. If
 * `Symbol.asyncIterator` is undefined, that means your Node.js version does not
 * support async iterators.
 *
 * @method [Symbol.asyncIterator]
 * @memberOf QueryCursor
 * @instance
 * @api public
 */ if (Symbol.asyncIterator != null) {
    QueryCursor.prototype[Symbol.asyncIterator] = function queryCursorAsyncIterator() {
        // Set so QueryCursor knows it should transform results for async iterators into `{ value, done }` syntax
        this._mongooseOptions._asyncIterator = true;
        return this;
    };
}
/**
 * Get the next doc from the underlying cursor and mongooseify it
 * (populate, etc.)
 * @param {Any} ctx
 * @param {Function} cb
 * @api private
 */ function _next(ctx, cb) {
    let callback = cb;
    // Create a custom callback to handle transforms, async iterator, and transformNull
    callback = function(err, doc) {
        if (err) {
            return cb(err);
        }
        // Handle null documents - if asyncIterator, we need to return `done: true`, otherwise just
        // skip. In either case, avoid transforms.
        if (doc === null) {
            if (ctx._mongooseOptions._asyncIterator) {
                return cb(null, {
                    done: true
                });
            } else {
                return cb(null, null);
            }
        }
        // Apply transforms
        if (ctx._transforms.length && doc !== null) {
            doc = ctx._transforms.reduce(function(doc, fn) {
                return fn.call(ctx, doc);
            }, doc);
        }
        // This option is set in `Symbol.asyncIterator` code paths.
        // For async iterator, we need to convert to {value, done} format
        if (ctx._mongooseOptions._asyncIterator) {
            return cb(null, {
                value: doc,
                done: false
            });
        }
        return cb(null, doc);
    };
    if (ctx._error) {
        return immediate(function() {
            callback(ctx._error);
        });
    }
    if (ctx.skipped) {
        return immediate(()=>callback(null, null));
    }
    if (ctx.cursor) {
        if (ctx.query._mongooseOptions.populate && !ctx._pop) {
            ctx._pop = helpers.preparePopulationOptionsMQ(ctx.query, ctx.query._mongooseOptions);
            ctx._pop.__noPromise = true;
        }
        if (ctx.query._mongooseOptions.populate && ctx.options._populateBatchSize > 1) {
            if (ctx._batchDocs && ctx._batchDocs.length) {
                // Return a cached populated doc
                return _nextDoc(ctx, ctx._batchDocs.shift(), ctx._pop, callback);
            } else if (ctx._batchExhausted) {
                // Internal cursor reported no more docs. Act the same here
                return callback(null, null);
            } else {
                // Request as many docs as batchSize, to populate them also in batch
                ctx._batchDocs = [];
                ctx.cursor.next().then((res)=>{
                    _onNext.call({
                        ctx,
                        callback
                    }, null, res);
                }, (err)=>{
                    _onNext.call({
                        ctx,
                        callback
                    }, err);
                });
                return;
            }
        } else {
            return ctx.cursor.next().then((doc)=>{
                if (!doc) {
                    callback(null, null);
                    return;
                }
                if (!ctx.query._mongooseOptions.populate) {
                    return _nextDoc(ctx, doc, null, callback);
                }
                _nextDoc(ctx, doc, ctx._pop, (err, doc)=>{
                    if (err != null) {
                        return callback(err);
                    }
                    ctx.query.model.populate(doc, ctx._pop).then((doc)=>callback(null, doc), (err)=>callback(err));
                });
            }, (error)=>{
                callback(error);
            });
        }
    } else {
        ctx.once('error', cb);
        ctx.once('cursor', function(cursor) {
            ctx.removeListener('error', cb);
            if (cursor == null) {
                if (ctx.skipped) {
                    return cb(null, null);
                }
                return;
            }
            _next(ctx, cb);
        });
    }
}
/*!
 * ignore
 */ function _onNext(error, doc) {
    if (error) {
        return this.callback(error);
    }
    if (!doc) {
        this.ctx._batchExhausted = true;
        return _populateBatch.call(this);
    }
    this.ctx._batchDocs.push(doc);
    if (this.ctx._batchDocs.length < this.ctx.options._populateBatchSize) {
        // If both `batchSize` and `_populateBatchSize` are huge, calling `next()` repeatedly may
        // cause a stack overflow. So make sure we clear the stack.
        immediate(()=>this.ctx.cursor.next().then((res)=>{
                _onNext.call(this, null, res);
            }, (err)=>{
                _onNext.call(this, err);
            }));
    } else {
        _populateBatch.call(this);
    }
}
/*!
 * ignore
 */ function _populateBatch() {
    if (!this.ctx._batchDocs.length) {
        return this.callback(null, null);
    }
    this.ctx.query.model.populate(this.ctx._batchDocs, this.ctx._pop).then(()=>{
        _nextDoc(this.ctx, this.ctx._batchDocs.shift(), this.ctx._pop, this.callback);
    }, (err)=>{
        this.callback(err);
    });
}
/*!
 * ignore
 */ function _nextDoc(ctx, doc, pop, callback) {
    if (ctx.query._mongooseOptions.lean) {
        return ctx.model.hooks.execPost('find', ctx.query, [
            [
                doc
            ]
        ], (err)=>{
            if (err != null) {
                return callback(err);
            }
            callback(null, doc);
        });
    }
    const { model, _fields, _userProvidedFields, options } = ctx.query;
    helpers.createModelAndInit(model, doc, _fields, _userProvidedFields, options, pop, (err, doc)=>{
        if (err != null) {
            return callback(err);
        }
        ctx.model.hooks.execPost('find', ctx.query, [
            [
                doc
            ]
        ], (err)=>{
            if (err != null) {
                return callback(err);
            }
            callback(null, doc);
        });
    });
}
/*!
 * ignore
 */ function _waitForCursor(ctx, cb) {
    if (ctx.cursor) {
        return cb();
    }
    ctx.once('cursor', function(cursor) {
        if (cursor == null) {
            return;
        }
        cb();
    });
}
module.exports = QueryCursor;
}),
"[project]/backend/node_modules/mongoose/lib/cursor/aggregationCursor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const Readable = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Readable;
const eachAsync = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/cursor/eachAsync.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const kareem = __turbopack_context__.r("[project]/backend/node_modules/kareem/index.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * An AggregationCursor is a concurrency primitive for processing aggregation
 * results one document at a time. It is analogous to QueryCursor.
 *
 * An AggregationCursor fulfills the Node.js streams3 API,
 * in addition to several other mechanisms for loading documents from MongoDB
 * one at a time.
 *
 * Creating an AggregationCursor executes the model's pre aggregate hooks,
 * but **not** the model's post aggregate hooks.
 *
 * Unless you're an advanced user, do **not** instantiate this class directly.
 * Use [`Aggregate#cursor()`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.cursor()) instead.
 *
 * @param {Aggregate} agg
 * @inherits Readable https://nodejs.org/api/stream.html#class-streamreadable
 * @event `cursor`: Emitted when the cursor is created
 * @event `error`: Emitted when an error occurred
 * @event `data`: Emitted when the stream is flowing and the next doc is ready
 * @event `end`: Emitted when the stream is exhausted
 * @api public
 */ function AggregationCursor(agg) {
    // set autoDestroy=true because on node 12 it's by default false
    // gh-10902 need autoDestroy to destroy correctly and emit 'close' event
    Readable.call(this, {
        autoDestroy: true,
        objectMode: true
    });
    this.cursor = null;
    this.agg = agg;
    this._transforms = [];
    const connection = agg._connection;
    const model = agg._model;
    delete agg.options.cursor.useMongooseAggCursor;
    this._mongooseOptions = {};
    if (connection) {
        this.cursor = connection.db.aggregate(agg._pipeline, agg.options || {});
        setImmediate(()=>this.emit('cursor', this.cursor));
    } else {
        _init(model, this, agg);
    }
}
util.inherits(AggregationCursor, Readable);
/*!
 * ignore
 */ function _init(model, c, agg) {
    if (!model.collection.buffer) {
        model.hooks.execPre('aggregate', agg, function(err) {
            if (err != null) {
                _handlePreHookError(c, err);
                return;
            }
            if (typeof agg.options?.cursor?.transform === 'function') {
                c._transforms.push(agg.options.cursor.transform);
            }
            c.cursor = model.collection.aggregate(agg._pipeline, agg.options || {});
            c.emit('cursor', c.cursor);
        });
    } else {
        model.collection.emitter.once('queue', function() {
            model.hooks.execPre('aggregate', agg, function(err) {
                if (err != null) {
                    _handlePreHookError(c, err);
                    return;
                }
                if (typeof agg.options?.cursor?.transform === 'function') {
                    c._transforms.push(agg.options.cursor.transform);
                }
                c.cursor = model.collection.aggregate(agg._pipeline, agg.options || {});
                c.emit('cursor', c.cursor);
            });
        });
    }
}
/**
* Handles error emitted from pre middleware. In particular, checks for `skipWrappedFunction`, which allows skipping
* the actual aggregation and overwriting the function's return value. Because aggregation cursors don't return a value,
* we need to make sure the user doesn't accidentally set a value in skipWrappedFunction.
*
* @param {QueryCursor} queryCursor
* @param {Error} err
* @returns
*/ function _handlePreHookError(queryCursor, err) {
    if (err instanceof kareem.skipWrappedFunction) {
        const resultValue = err.args[0];
        if (resultValue != null && (!Array.isArray(resultValue) || resultValue.length)) {
            const err = new MongooseError('Cannot `skipMiddlewareFunction()` with a value when using ' + '`.aggregate().cursor()`, value must be nullish or empty array, got "' + util.inspect(resultValue) + '".');
            queryCursor._markError(err);
            queryCursor.listeners('error').length > 0 && queryCursor.emit('error', err);
            return;
        }
        queryCursor.emit('cursor', null);
        return;
    }
    queryCursor._markError(err);
    queryCursor.listeners('error').length > 0 && queryCursor.emit('error', err);
}
/**
 * Necessary to satisfy the Readable API
 * @method _read
 * @memberOf AggregationCursor
 * @instance
 * @api private
 */ AggregationCursor.prototype._read = function() {
    const _this = this;
    _next(this, function(error, doc) {
        if (error) {
            return _this.emit('error', error);
        }
        if (!doc) {
            _this.push(null);
            _this.cursor.close(function(error) {
                if (error) {
                    return _this.emit('error', error);
                }
            });
            return;
        }
        _this.push(doc);
    });
};
if (Symbol.asyncIterator != null) {
    const msg = 'Mongoose does not support using async iterators with an ' + 'existing aggregation cursor. See https://bit.ly/mongoose-async-iterate-aggregation';
    AggregationCursor.prototype[Symbol.asyncIterator] = function() {
        throw new MongooseError(msg);
    };
}
/**
 * Registers a transform function which subsequently maps documents retrieved
 * via the streams interface or `.next()`
 *
 * #### Example:
 *
 *     // Map documents returned by `data` events
 *     Thing.
 *       find({ name: /^hello/ }).
 *       cursor().
 *       map(function (doc) {
 *        doc.foo = "bar";
 *        return doc;
 *       })
 *       on('data', function(doc) { console.log(doc.foo); });
 *
 *     // Or map documents returned by `.next()`
 *     const cursor = Thing.find({ name: /^hello/ }).
 *       cursor().
 *       map(function (doc) {
 *         doc.foo = "bar";
 *         return doc;
 *       });
 *     cursor.next(function(error, doc) {
 *       console.log(doc.foo);
 *     });
 *
 * @param {Function} fn
 * @return {AggregationCursor}
 * @memberOf AggregationCursor
 * @api public
 * @method map
 */ Object.defineProperty(AggregationCursor.prototype, 'map', {
    value: function(fn) {
        this._transforms.push(fn);
        return this;
    },
    enumerable: true,
    configurable: true,
    writable: true
});
/**
 * Marks this cursor as errored
 * @method _markError
 * @instance
 * @memberOf AggregationCursor
 * @api private
 */ AggregationCursor.prototype._markError = function(error) {
    this._error = error;
    return this;
};
/**
 * Marks this cursor as closed. Will stop streaming and subsequent calls to
 * `next()` will error.
 *
 * @return {Promise}
 * @api public
 * @method close
 * @emits "close"
 * @see AggregationCursor.close https://mongodb.github.io/node-mongodb-native/4.9/classes/AggregationCursor.html#close
 */ AggregationCursor.prototype.close = async function close() {
    if (typeof arguments[0] === 'function') {
        throw new MongooseError('AggregationCursor.prototype.close() no longer accepts a callback');
    }
    try {
        await this.cursor.close();
    } catch (error) {
        this.listeners('error').length > 0 && this.emit('error', error);
        throw error;
    }
    this.emit('close');
};
/**
 * Marks this cursor as destroyed. Will stop streaming and subsequent calls to
 * `next()` will error.
 *
 * @return {this}
 * @api private
 * @method _destroy
 */ AggregationCursor.prototype._destroy = function _destroy(_err, callback) {
    let waitForCursor = null;
    if (!this.cursor) {
        waitForCursor = new Promise((resolve)=>{
            this.once('cursor', resolve);
        });
    } else {
        waitForCursor = Promise.resolve();
    }
    waitForCursor.then(()=>this.cursor.close()).then(()=>{
        this._closed = true;
        callback();
    }).catch((error)=>{
        callback(error);
    });
    return this;
};
/**
 * Get the next document from this cursor. Will return `null` when there are
 * no documents left.
 *
 * @return {Promise}
 * @api public
 * @method next
 */ AggregationCursor.prototype.next = async function next() {
    if (typeof arguments[0] === 'function') {
        throw new MongooseError('AggregationCursor.prototype.next() no longer accepts a callback');
    }
    return new Promise((resolve, reject)=>{
        _next(this, (err, res)=>{
            if (err != null) {
                return reject(err);
            }
            resolve(res);
        });
    });
};
/**
 * Execute `fn` for every document in the cursor. If `fn` returns a promise,
 * will wait for the promise to resolve before iterating on to the next one.
 * Returns a promise that resolves when done.
 *
 * @param {Function} fn
 * @param {Object} [options]
 * @param {Number} [options.parallel] the number of promises to execute in parallel. Defaults to 1.
 * @param {Number} [options.batchSize=null] if set, Mongoose will call `fn` with an array of at most `batchSize` documents, instead of a single document
 * @param {Boolean} [options.continueOnError=false] if true, `eachAsync()` iterates through all docs even if `fn` throws an error. If false, `eachAsync()` throws an error immediately if the given function `fn()` throws an error.
 * @return {Promise}
 * @api public
 * @method eachAsync
 */ AggregationCursor.prototype.eachAsync = function(fn, opts) {
    if (typeof arguments[2] === 'function') {
        throw new MongooseError('AggregationCursor.prototype.eachAsync() no longer accepts a callback');
    }
    const _this = this;
    if (typeof opts === 'function') {
        opts = {};
    }
    opts = opts || {};
    return eachAsync(function(cb) {
        return _next(_this, cb);
    }, fn, opts);
};
/**
 * Returns an asyncIterator for use with [`for/await/of` loops](https://thecodebarbarian.com/getting-started-with-async-iterators-in-node-js)
 * You do not need to call this function explicitly, the JavaScript runtime
 * will call it for you.
 *
 * #### Example:
 *
 *     // Async iterator without explicitly calling `cursor()`. Mongoose still
 *     // creates an AggregationCursor instance internally.
 *     const agg = Model.aggregate([{ $match: { age: { $gte: 25 } } }]);
 *     for await (const doc of agg) {
 *       console.log(doc.name);
 *     }
 *
 *     // You can also use an AggregationCursor instance for async iteration
 *     const cursor = Model.aggregate([{ $match: { age: { $gte: 25 } } }]).cursor();
 *     for await (const doc of cursor) {
 *       console.log(doc.name);
 *     }
 *
 * Node.js 10.x supports async iterators natively without any flags. You can
 * enable async iterators in Node.js 8.x using the [`--harmony_async_iteration` flag](https://github.com/tc39/proposal-async-iteration/issues/117#issuecomment-346695187).
 *
 * **Note:** This function is not set if `Symbol.asyncIterator` is undefined. If
 * `Symbol.asyncIterator` is undefined, that means your Node.js version does not
 * support async iterators.
 *
 * @method [Symbol.asyncIterator]
 * @memberOf AggregationCursor
 * @instance
 * @api public
 */ if (Symbol.asyncIterator != null) {
    AggregationCursor.prototype[Symbol.asyncIterator] = function() {
        return this.transformNull()._transformForAsyncIterator();
    };
}
/*!
 * ignore
 */ AggregationCursor.prototype._transformForAsyncIterator = function() {
    if (this._transforms.indexOf(_transformForAsyncIterator) === -1) {
        this.map(_transformForAsyncIterator);
    }
    return this;
};
/*!
 * ignore
 */ AggregationCursor.prototype.transformNull = function(val) {
    if (arguments.length === 0) {
        val = true;
    }
    this._mongooseOptions.transformNull = val;
    return this;
};
/*!
 * ignore
 */ function _transformForAsyncIterator(doc) {
    return doc == null ? {
        done: true
    } : {
        value: doc,
        done: false
    };
}
/**
 * Adds a [cursor flag](https://mongodb.github.io/node-mongodb-native/4.9/classes/AggregationCursor.html#addCursorFlag).
 * Useful for setting the `noCursorTimeout` and `tailable` flags.
 *
 * @param {String} flag
 * @param {Boolean} value
 * @return {AggregationCursor} this
 * @api public
 * @method addCursorFlag
 */ AggregationCursor.prototype.addCursorFlag = function(flag, value) {
    const _this = this;
    _waitForCursor(this, function() {
        _this.cursor.addCursorFlag(flag, value);
    });
    return this;
};
/*!
 * ignore
 */ function _waitForCursor(ctx, cb) {
    if (ctx.cursor) {
        return cb();
    }
    ctx.once('cursor', function() {
        cb();
    });
}
/**
 * Get the next doc from the underlying cursor and mongooseify it
 * (populate, etc.)
 * @param {Any} ctx
 * @param {Function} cb
 * @api private
 */ function _next(ctx, cb) {
    let callback = cb;
    if (ctx._transforms.length) {
        callback = function(err, doc) {
            if (err || doc === null && !ctx._mongooseOptions.transformNull) {
                return cb(err, doc);
            }
            cb(err, ctx._transforms.reduce(function(doc, fn) {
                return fn(doc);
            }, doc));
        };
    }
    if (ctx._error) {
        return immediate(function() {
            callback(ctx._error);
        });
    }
    if (ctx.cursor) {
        return ctx.cursor.next().then((doc)=>{
            if (!doc) {
                return callback(null, null);
            }
            callback(null, doc);
        }, (err)=>callback(err));
    } else {
        ctx.once('error', cb);
        ctx.once('cursor', function() {
            _next(ctx, cb);
        });
    }
}
module.exports = AggregationCursor;
}),
"[project]/backend/node_modules/mongoose/lib/cast/boolean.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
/**
 * Given a value, cast it to a boolean, or throw a `CastError` if the value
 * cannot be casted. `null` and `undefined` are considered valid.
 *
 * @param {Any} value
 * @param {String} [path] optional the path to set on the CastError
 * @return {Boolean|null|undefined}
 * @throws {CastError} if `value` is not one of the allowed values
 * @api private
 */ module.exports = function castBoolean(value, path) {
    if (module.exports.convertToTrue.has(value)) {
        return true;
    }
    if (module.exports.convertToFalse.has(value)) {
        return false;
    }
    if (value == null) {
        return value;
    }
    throw new CastError('boolean', value, path);
};
module.exports.convertToTrue = new Set([
    true,
    'true',
    1,
    '1',
    'yes'
]);
module.exports.convertToFalse = new Set([
    false,
    'false',
    0,
    '0',
    'no'
]);
}),
"[project]/backend/node_modules/mongoose/lib/cast/number.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
/**
 * Given a value, cast it to a number, or throw an `Error` if the value
 * cannot be casted. `null` and `undefined` are considered valid.
 *
 * @param {Any} value
 * @return {Number}
 * @throws {Error} if `value` is not one of the allowed values
 * @api private
 */ module.exports = function castNumber(val) {
    if (val == null) {
        return val;
    }
    if (val === '') {
        return null;
    }
    if (typeof val === 'string' || typeof val === 'boolean') {
        val = Number(val);
    }
    assert.ok(!isNaN(val));
    if (val instanceof Number) {
        return val.valueOf();
    }
    if (typeof val === 'number') {
        return val;
    }
    if (!Array.isArray(val) && typeof val.valueOf === 'function') {
        return Number(val.valueOf());
    }
    if (val.toString && !Array.isArray(val) && val.toString() == Number(val)) {
        return Number(val);
    }
    assert.ok(false);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/string.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
/**
 * Given a value, cast it to a string, or throw a `CastError` if the value
 * cannot be casted. `null` and `undefined` are considered valid.
 *
 * @param {Any} value
 * @param {String} [path] optional the path to set on the CastError
 * @return {string|null|undefined}
 * @throws {CastError}
 * @api private
 */ module.exports = function castString(value, path) {
    // If null or undefined
    if (value == null) {
        return value;
    }
    // handle documents being passed
    if (value._id && typeof value._id === 'string') {
        return value._id;
    }
    // Re: gh-647 and gh-3030, we're ok with casting using `toString()`
    // **unless** its the default Object.toString, because "[object Object]"
    // doesn't really qualify as useful data
    if (value.toString && value.toString !== Object.prototype.toString && !Array.isArray(value)) {
        return value.toString();
    }
    throw new CastError('string', value, path);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/bigint.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { Long } = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)");
/**
 * Given a value, cast it to a BigInt, or throw an `Error` if the value
 * cannot be casted. `null` and `undefined` are considered valid.
 *
 * @param {Any} value
 * @return {Number}
 * @throws {Error} if `value` is not one of the allowed values
 * @api private
 */ const MAX_BIGINT = 9223372036854775807n;
const MIN_BIGINT = -9223372036854775808n;
const ERROR_MESSAGE = `Mongoose only supports BigInts between ${MIN_BIGINT} and ${MAX_BIGINT} because MongoDB does not support arbitrary precision integers`;
module.exports = function castBigInt(val) {
    if (val == null) {
        return val;
    }
    if (val === '') {
        return null;
    }
    if (typeof val === 'bigint') {
        if (val > MAX_BIGINT || val < MIN_BIGINT) {
            throw new Error(ERROR_MESSAGE);
        }
        return val;
    }
    if (val instanceof Long) {
        return val.toBigInt();
    }
    if (typeof val === 'string' || typeof val === 'number') {
        val = BigInt(val);
        if (val > MAX_BIGINT || val < MIN_BIGINT) {
            throw new Error(ERROR_MESSAGE);
        }
        return val;
    }
    throw new Error(`Cannot convert value to BigInt: "${val}"`);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/date.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
module.exports = function castDate(value) {
    // Support empty string because of empty form values. Originally introduced
    // in https://github.com/Automattic/mongoose/commit/efc72a1898fc3c33a319d915b8c5463a22938dfe
    if (value == null || value === '') {
        return null;
    }
    if (value instanceof Date) {
        assert.ok(!isNaN(value.valueOf()));
        return value;
    }
    let date;
    assert.ok(typeof value !== 'boolean');
    if (value instanceof Number || typeof value === 'number') {
        date = new Date(value);
    } else if (typeof value === 'string' && !isNaN(Number(value)) && (Number(value) >= 275761 || Number(value) < -271820)) {
        // string representation of milliseconds take this path
        date = new Date(Number(value));
    } else if (typeof value.valueOf === 'function') {
        // support for moment.js. This is also the path strings will take because
        // strings have a `valueOf()`
        date = new Date(value.valueOf());
    } else {
        // fallback
        date = new Date(value);
    }
    if (!isNaN(date.valueOf())) {
        return date;
    }
    assert.ok(false);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/decimal128.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Decimal128Type = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/decimal128.js [app-route] (ecmascript)");
const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
module.exports = function castDecimal128(value) {
    if (value == null) {
        return value;
    }
    if (typeof value === 'object' && typeof value.$numberDecimal === 'string') {
        return Decimal128Type.fromString(value.$numberDecimal);
    }
    if (value instanceof Decimal128Type) {
        return value;
    }
    if (typeof value === 'string') {
        return Decimal128Type.fromString(value);
    }
    if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
        return new Decimal128Type(value);
    }
    if (typeof Uint8Array === 'function' && value instanceof Uint8Array) {
        return new Decimal128Type(value);
    }
    if (typeof value === 'number') {
        return Decimal128Type.fromString(String(value));
    }
    if (typeof value.valueOf === 'function' && typeof value.valueOf() === 'string') {
        return Decimal128Type.fromString(value.valueOf());
    }
    assert.ok(false);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/double.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
const BSON = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
/**
 * Given a value, cast it to a IEEE 754-2008 floating point, or throw an `Error` if the value
 * cannot be casted. `null`, `undefined`, and `NaN` are considered valid inputs.
 *
 * @param {Any} value
 * @return {Number}
 * @throws {Error} if `value` does not represent a IEEE 754-2008 floating point. If casting from a string, see [BSON Double.fromString API documentation](https://mongodb.github.io/node-mongodb-native/Next/classes/BSON.Double.html#fromString)
 * @api private
 */ module.exports = function castDouble(val) {
    if (val == null || val === '') {
        return null;
    }
    let coercedVal;
    if (isBsonType(val, 'Long')) {
        coercedVal = val.toNumber();
    } else if (typeof val === 'string') {
        try {
            coercedVal = BSON.Double.fromString(val);
            return coercedVal;
        } catch  {
            assert.ok(false);
        }
    } else if (typeof val === 'object') {
        const tempVal = val.valueOf() ?? val.toString();
        // ex: { a: 'im an object, valueOf: () => 'helloworld' } // throw an error
        if (typeof tempVal === 'string') {
            try {
                coercedVal = BSON.Double.fromString(val);
                return coercedVal;
            } catch  {
                assert.ok(false);
            }
        } else {
            coercedVal = Number(tempVal);
        }
    } else {
        coercedVal = Number(val);
    }
    return new BSON.Double(coercedVal);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/int32.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
/**
 * Given a value, cast it to a Int32, or throw an `Error` if the value
 * cannot be casted. `null` and `undefined` are considered valid.
 *
 * @param {Any} value
 * @return {Number}
 * @throws {Error} if `value` does not represent an integer, or is outside the bounds of an 32-bit integer.
 * @api private
 */ module.exports = function castInt32(val) {
    if (val == null) {
        return val;
    }
    if (val === '') {
        return null;
    }
    const coercedVal = isBsonType(val, 'Long') ? val.toNumber() : Number(val);
    const INT32_MAX = 0x7FFFFFFF;
    const INT32_MIN = -0x80000000;
    if (coercedVal === (coercedVal | 0) && coercedVal >= INT32_MIN && coercedVal <= INT32_MAX) {
        return coercedVal;
    }
    assert.ok(false);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/objectid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
module.exports = function castObjectId(value) {
    if (value == null) {
        return value;
    }
    if (isBsonType(value, 'ObjectId')) {
        return value;
    }
    if (value._id) {
        if (isBsonType(value._id, 'ObjectId')) {
            return value._id;
        }
        if (value._id.toString instanceof Function) {
            return new ObjectId(value._id.toString());
        }
    }
    if (value.toString instanceof Function) {
        return new ObjectId(value.toString());
    }
    return new ObjectId(value);
};
}),
"[project]/backend/node_modules/mongoose/lib/cast/uuid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseBuffer = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/buffer.js [app-route] (ecmascript)");
const UUID_FORMAT = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const Binary = MongooseBuffer.Binary;
module.exports = function castUUID(value) {
    if (value == null) {
        return value;
    }
    function newBuffer(initbuff) {
        const buff = new MongooseBuffer(initbuff);
        buff._subtype = 4;
        return buff;
    }
    if (typeof value === 'string') {
        if (UUID_FORMAT.test(value)) {
            return stringToBinary(value);
        } else {
            throw new Error(`"${value}" is not a valid UUID string`);
        }
    }
    if (Buffer.isBuffer(value)) {
        return newBuffer(value);
    }
    if (value instanceof Binary) {
        return newBuffer(value.value(true));
    }
    // Re: gh-647 and gh-3030, we're ok with casting using `toString()`
    // **unless** its the default Object.toString, because "[object Object]"
    // doesn't really qualify as useful data
    if (value.toString && value.toString !== Object.prototype.toString) {
        if (UUID_FORMAT.test(value.toString())) {
            return stringToBinary(value.toString());
        }
    }
    throw new Error(`"${value}" cannot be casted to a UUID`);
};
module.exports.UUID_FORMAT = UUID_FORMAT;
/**
 * Helper function to convert the input hex-string to a buffer
 * @param {String} hex The hex string to convert
 * @returns {Buffer} The hex as buffer
 * @api private
 */ function hex2buffer(hex) {
    // use buffer built-in function to convert from hex-string to buffer
    const buff = hex != null && Buffer.from(hex, 'hex');
    return buff;
}
/**
 * Convert a String to Binary
 * @param {String} uuidStr The value to process
 * @returns {MongooseBuffer} The binary to store
 * @api private
 */ function stringToBinary(uuidStr) {
    // Protect against undefined & throwing err
    if (typeof uuidStr !== 'string') uuidStr = '';
    const hex = uuidStr.replace(/[{}-]/g, ''); // remove extra characters
    const bytes = hex2buffer(hex);
    const buff = new MongooseBuffer(bytes);
    buff._subtype = 4;
    return buff;
}
}),
"[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = Object.freeze({
    enumerable: true,
    configurable: true,
    writable: true,
    value: void 0
});
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
/**
 * The options defined on a schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     schema.path('name').options instanceof mongoose.SchemaTypeOptions; // true
 *
 * @api public
 * @constructor SchemaTypeOptions
 */ class SchemaTypeOptions {
    constructor(obj){
        if (obj == null) {
            return this;
        }
        Object.assign(this, clone(obj));
    }
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * The type to cast this path to.
 *
 * @api public
 * @property type
 * @memberOf SchemaTypeOptions
 * @type {Function|String|Object}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'type', opts);
/**
 * Function or object describing how to validate this schematype.
 *
 * @api public
 * @property validate
 * @memberOf SchemaTypeOptions
 * @type {Function|Object}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'validate', opts);
/**
 * Allows overriding casting logic for this individual path. If a string, the
 * given string overwrites Mongoose's default cast error message.
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       num: {
 *         type: Number,
 *         cast: '{VALUE} is not a valid number'
 *       }
 *     });
 *
 *     // Throws 'CastError: "bad" is not a valid number'
 *     schema.path('num').cast('bad');
 *
 *     const Model = mongoose.model('Test', schema);
 *     const doc = new Model({ num: 'fail' });
 *     const err = doc.validateSync();
 *
 *     err.errors['num']; // 'CastError: "fail" is not a valid number'
 *
 * @api public
 * @property cast
 * @memberOf SchemaTypeOptions
 * @type {String}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'cast', opts);
/**
 * If true, attach a required validator to this path, which ensures this path
 * cannot be set to a nullish value. If a function, Mongoose calls the
 * function and only checks for nullish values if the function returns a truthy value.
 *
 * @api public
 * @property required
 * @memberOf SchemaTypeOptions
 * @type {Function|Boolean}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'required', opts);
/**
 * The default value for this path. If a function, Mongoose executes the function
 * and uses the return value as the default.
 *
 * @api public
 * @property default
 * @memberOf SchemaTypeOptions
 * @type {Function|Any}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'default', opts);
/**
 * The model that `populate()` should use if populating this path.
 *
 * @api public
 * @property ref
 * @memberOf SchemaTypeOptions
 * @type {Function|String}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'ref', opts);
/**
 * The path in the document that `populate()` should use to find the model
 * to use.
 *
 * @api public
 * @property ref
 * @memberOf SchemaTypeOptions
 * @type {Function|String}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'refPath', opts);
/**
 * Whether to include or exclude this path by default when loading documents
 * using `find()`, `findOne()`, etc.
 *
 * @api public
 * @property select
 * @memberOf SchemaTypeOptions
 * @type {Boolean|Number}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'select', opts);
/**
 * If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), Mongoose will
 * build an index on this path when the model is compiled.
 *
 * @api public
 * @property index
 * @memberOf SchemaTypeOptions
 * @type {Boolean|Number|Object}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'index', opts);
/**
 * If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), Mongoose
 * will build a unique index on this path when the
 * model is compiled. [The `unique` option is **not** a validator](https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator).
 *
 * @api public
 * @property unique
 * @memberOf SchemaTypeOptions
 * @type {Boolean|Number}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'unique', opts);
/**
 * If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), Mongoose will
 * disallow changes to this path once the document
 * is saved to the database for the first time. Read more about [immutability in Mongoose here](https://thecodebarbarian.com/whats-new-in-mongoose-5-6-immutable-properties.html).
 *
 * @api public
 * @property immutable
 * @memberOf SchemaTypeOptions
 * @type {Function|Boolean}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'immutable', opts);
/**
 * If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), Mongoose will
 * build a sparse index on this path.
 *
 * @api public
 * @property sparse
 * @memberOf SchemaTypeOptions
 * @type {Boolean|Number}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'sparse', opts);
/**
 * If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), Mongoose
 * will build a text index on this path.
 *
 * @api public
 * @property text
 * @memberOf SchemaTypeOptions
 * @type {Boolean|Number|Object}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'text', opts);
/**
 * Define a transform function for this individual schema type.
 * Only called when calling `toJSON()` or `toObject()`.
 *
 * #### Example:
 *
 *     const schema = Schema({
 *       myDate: {
 *         type: Date,
 *         transform: v => v.getFullYear()
 *       }
 *     });
 *     const Model = mongoose.model('Test', schema);
 *
 *     const doc = new Model({ myDate: new Date('2019/06/01') });
 *     doc.myDate instanceof Date; // true
 *
 *     const res = doc.toObject({ transform: true });
 *     res.myDate; // 2019
 *
 * @api public
 * @property transform
 * @memberOf SchemaTypeOptions
 * @type {Function}
 * @instance
 */ Object.defineProperty(SchemaTypeOptions.prototype, 'transform', opts);
module.exports = SchemaTypeOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaArrayOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on an Array schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ tags: [String] });
 *     schema.path('tags').options; // SchemaArrayOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaArrayOptions
 */ class SchemaArrayOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If this is an array of strings, an array of allowed values for this path.
 * Throws an error if this array isn't an array of strings.
 *
 * @api public
 * @property enum
 * @memberOf SchemaArrayOptions
 * @type {Array}
 * @instance
 */ Object.defineProperty(SchemaArrayOptions.prototype, 'enum', opts);
/**
 * If set, specifies the type of this array's values. Equivalent to setting
 * `type` to an array whose first element is `of`.
 *
 * #### Example:
 *
 *     // `arr` is an array of numbers.
 *     new Schema({ arr: [Number] });
 *     // Equivalent way to define `arr` as an array of numbers
 *     new Schema({ arr: { type: Array, of: Number } });
 *
 * @api public
 * @property of
 * @memberOf SchemaArrayOptions
 * @type {Function|String}
 * @instance
 */ Object.defineProperty(SchemaArrayOptions.prototype, 'of', opts);
/**
 * If set to `false`, will always deactivate casting non-array values to arrays.
 * If set to `true`, will cast non-array values to arrays if `init` and `SchemaArray.options.castNonArrays` are also `true`
 *
 * #### Example:
 *
 *     const Model = db.model('Test', new Schema({ x1: { castNonArrays: false, type: [String] } }));
 *     const doc = new Model({ x1: "some non-array value" });
 *     await doc.validate(); // Errors with "CastError"
 *
 * @api public
 * @property castNonArrays
 * @memberOf SchemaArrayOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(SchemaArrayOptions.prototype, 'castNonArrays', opts);
/*!
 * ignore
 */ module.exports = SchemaArrayOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/populateOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
class PopulateOptions {
    constructor(obj){
        this._docs = {};
        this._childDocs = [];
        if (obj == null) {
            return;
        }
        obj = clone(obj);
        Object.assign(this, obj);
        if (typeof obj.subPopulate === 'object') {
            this.populate = obj.subPopulate;
        }
        if (obj.perDocumentLimit != null && obj.limit != null) {
            throw new Error('Can not use `limit` and `perDocumentLimit` at the same time. Path: `' + obj.path + '`.');
        }
    }
}
/**
 * The connection used to look up models by name. If not specified, Mongoose
 * will default to using the connection associated with the model in
 * `PopulateOptions#model`.
 *
 * @memberOf PopulateOptions
 * @property {Connection} connection
 * @api public
 */ module.exports = PopulateOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/virtualOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
class VirtualOptions {
    constructor(obj){
        Object.assign(this, obj);
        if (obj != null && obj.options != null) {
            this.options = Object.assign({}, obj.options);
        }
    }
}
/**
 * Marks this virtual as a populate virtual, and specifies the model to
 * use for populate.
 *
 * @api public
 * @property ref
 * @memberOf VirtualOptions
 * @type {String|Model|Function}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'ref', opts);
/**
 * Marks this virtual as a populate virtual, and specifies the path that
 * contains the name of the model to populate
 *
 * @api public
 * @property refPath
 * @memberOf VirtualOptions
 * @type {String|Function}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'refPath', opts);
/**
 * The name of the property in the local model to match to `foreignField`
 * in the foreign model.
 *
 * @api public
 * @property localField
 * @memberOf VirtualOptions
 * @type {String|Function}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'localField', opts);
/**
 * The name of the property in the foreign model to match to `localField`
 * in the local model.
 *
 * @api public
 * @property foreignField
 * @memberOf VirtualOptions
 * @type {String|Function}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'foreignField', opts);
/**
 * Whether to populate this virtual as a single document (true) or an
 * array of documents (false).
 *
 * @api public
 * @property justOne
 * @memberOf VirtualOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'justOne', opts);
/**
 * If true, populate just the number of documents where `localField`
 * matches `foreignField`, as opposed to the documents themselves.
 *
 * If `count` is set, it overrides `justOne`.
 *
 * @api public
 * @property count
 * @memberOf VirtualOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'count', opts);
/**
 * Add an additional filter to populate, in addition to `localField`
 * matches `foreignField`.
 *
 * @api public
 * @property match
 * @memberOf VirtualOptions
 * @type {Object|Function}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'match', opts);
/**
 * Additional options to pass to the query used to `populate()`:
 *
 * - `sort`
 * - `skip`
 * - `limit`
 *
 * @api public
 * @property options
 * @memberOf VirtualOptions
 * @type {Object}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'options', opts);
/**
 * If true, add a `skip` to the query used to `populate()`.
 *
 * @api public
 * @property skip
 * @memberOf VirtualOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'skip', opts);
/**
 * If true, add a `limit` to the query used to `populate()`.
 *
 * @api public
 * @property limit
 * @memberOf VirtualOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'limit', opts);
/**
 * The `limit` option for `populate()` has [some unfortunate edge cases](https://mongoosejs.com/docs/populate.html#query-conditions)
 * when working with multiple documents, like `.find().populate()`. The
 * `perDocumentLimit` option makes `populate()` execute a separate query
 * for each document returned from `find()` to ensure each document
 * gets up to `perDocumentLimit` populated docs if possible.
 *
 * @api public
 * @property perDocumentLimit
 * @memberOf VirtualOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(VirtualOptions.prototype, 'perDocumentLimit', opts);
module.exports = VirtualOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaNumberOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a Number schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ count: Number });
 *     schema.path('count').options; // SchemaNumberOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaNumberOptions
 */ class SchemaNumberOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If set, Mongoose adds a validator that checks that this path is at least the
 * given `min`.
 *
 * @api public
 * @property min
 * @memberOf SchemaNumberOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(SchemaNumberOptions.prototype, 'min', opts);
/**
 * If set, Mongoose adds a validator that checks that this path is less than the
 * given `max`.
 *
 * @api public
 * @property max
 * @memberOf SchemaNumberOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(SchemaNumberOptions.prototype, 'max', opts);
/**
 * If set, Mongoose adds a validator that checks that this path is strictly
 * equal to one of the given values.
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       favoritePrime: {
 *         type: Number,
 *         enum: [3, 5, 7]
 *       }
 *     });
 *     schema.path('favoritePrime').options.enum; // [3, 5, 7]
 *
 * @api public
 * @property enum
 * @memberOf SchemaNumberOptions
 * @type {Array}
 * @instance
 */ Object.defineProperty(SchemaNumberOptions.prototype, 'enum', opts);
/**
 * Sets default [populate options](https://mongoosejs.com/docs/populate.html#query-conditions).
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       child: {
 *         type: Number,
 *         ref: 'Child',
 *         populate: { select: 'name' }
 *       }
 *     });
 *     const Parent = mongoose.model('Parent', schema);
 *
 *     // Automatically adds `.select('name')`
 *     Parent.findOne().populate('child');
 *
 * @api public
 * @property populate
 * @memberOf SchemaNumberOptions
 * @type {Object}
 * @instance
 */ Object.defineProperty(SchemaNumberOptions.prototype, 'populate', opts);
/*!
 * ignore
 */ module.exports = SchemaNumberOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaBufferOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a Buffer schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ bitmap: Buffer });
 *     schema.path('bitmap').options; // SchemaBufferOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaBufferOptions
 */ class SchemaBufferOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * Set the default subtype for this buffer.
 *
 * @api public
 * @property subtype
 * @memberOf SchemaBufferOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(SchemaBufferOptions.prototype, 'subtype', opts);
/*!
 * ignore
 */ module.exports = SchemaBufferOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaDateOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a Date schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ startedAt: Date });
 *     schema.path('startedAt').options; // SchemaDateOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaDateOptions
 */ class SchemaDateOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If set, Mongoose adds a validator that checks that this path is after the
 * given `min`.
 *
 * @api public
 * @property min
 * @memberOf SchemaDateOptions
 * @type {Date}
 * @instance
 */ Object.defineProperty(SchemaDateOptions.prototype, 'min', opts);
/**
 * If set, Mongoose adds a validator that checks that this path is before the
 * given `max`.
 *
 * @api public
 * @property max
 * @memberOf SchemaDateOptions
 * @type {Date}
 * @instance
 */ Object.defineProperty(SchemaDateOptions.prototype, 'max', opts);
/**
 * If set, Mongoose creates a TTL index on this path.
 *
 * mongo TTL index `expireAfterSeconds` value will take 'expires' value expressed in seconds.
 *
 * #### Example:
 *
 *     const schema = new Schema({ "expireAt": { type: Date,  expires: 11 } });
 *     // if 'expireAt' is set, then document expires at expireAt + 11 seconds
 *
 * @api public
 * @property expires
 * @memberOf SchemaDateOptions
 * @type {Date}
 * @instance
 */ Object.defineProperty(SchemaDateOptions.prototype, 'expires', opts);
/*!
 * ignore
 */ module.exports = SchemaDateOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaSubdocumentOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a single nested schematype.
 *
 * #### Example:
 *
 *     const schema = Schema({ child: Schema({ name: String }) });
 *     schema.path('child').options; // SchemaSubdocumentOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaSubdocumentOptions
 */ class SchemaSubdocumentOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If set, overwrites the child schema's `_id` option.
 *
 * #### Example:
 *
 *     const childSchema = Schema({ name: String });
 *     const parentSchema = Schema({
 *       child: { type: childSchema, _id: false }
 *     });
 *     parentSchema.path('child').schema.options._id; // false
 *
 * @api public
 * @property _id
 * @memberOf SchemaSubdocumentOptions
 * @type {Function|string}
 * @instance
 */ Object.defineProperty(SchemaSubdocumentOptions.prototype, '_id', opts);
/**
 * If set, overwrites the child schema's `minimize` option. In addition, configures whether the entire
 * subdocument can be minimized out.
 *
 * #### Example:
 *
 *     const childSchema = Schema({ name: String });
 *     const parentSchema = Schema({
 *       child: { type: childSchema, minimize: false }
 *     });
 *     const ParentModel = mongoose.model('Parent', parentSchema);
 *     // Saves `{ child: {} }` to the db. Without `minimize: false`, Mongoose would remove the empty
 *     // object and save `{}` to the db.
 *     await ParentModel.create({ child: {} });
 *
 * @api public
 * @property minimize
 * @memberOf SchemaSubdocumentOptions
 * @type {Function|string}
 * @instance
 */ Object.defineProperty(SchemaSubdocumentOptions.prototype, 'minimize', opts);
module.exports = SchemaSubdocumentOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaDocumentArrayOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on an Document Array schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ users: [{ name: string }] });
 *     schema.path('users').options; // SchemaDocumentArrayOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaDocumentOptions
 */ class SchemaDocumentArrayOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If `true`, Mongoose will skip building any indexes defined in this array's schema.
 * If not set, Mongoose will build all indexes defined in this array's schema.
 *
 * #### Example:
 *
 *     const childSchema = Schema({ name: { type: String, index: true } });
 *     // If `excludeIndexes` is `true`, Mongoose will skip building an index
 *     // on `arr.name`. Otherwise, Mongoose will build an index on `arr.name`.
 *     const parentSchema = Schema({
 *       arr: { type: [childSchema], excludeIndexes: true }
 *     });
 *
 * @api public
 * @property excludeIndexes
 * @memberOf SchemaDocumentArrayOptions
 * @type {Array}
 * @instance
 */ Object.defineProperty(SchemaDocumentArrayOptions.prototype, 'excludeIndexes', opts);
/**
 * If set, overwrites the child schema's `_id` option.
 *
 * #### Example:
 *
 *     const childSchema = Schema({ name: String });
 *     const parentSchema = Schema({
 *       child: { type: childSchema, _id: false }
 *     });
 *     parentSchema.path('child').schema.options._id; // false
 *
 * @api public
 * @property _id
 * @memberOf SchemaDocumentArrayOptions
 * @type {Array}
 * @instance
 */ Object.defineProperty(SchemaDocumentArrayOptions.prototype, '_id', opts);
/*!
 * ignore
 */ module.exports = SchemaDocumentArrayOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaMapOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a Map schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ socialMediaHandles: { type: Map, of: String } });
 *     schema.path('socialMediaHandles').options; // SchemaMapOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaMapOptions
 */ class SchemaMapOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If set, specifies the type of this map's values. Mongoose will cast
 * this map's values to the given type.
 *
 * If not set, Mongoose will not cast the map's values.
 *
 * #### Example:
 *
 *     // Mongoose will cast `socialMediaHandles` values to strings
 *     const schema = new Schema({ socialMediaHandles: { type: Map, of: String } });
 *     schema.path('socialMediaHandles').options.of; // String
 *
 * @api public
 * @property of
 * @memberOf SchemaMapOptions
 * @type {Function|string}
 * @instance
 */ Object.defineProperty(SchemaMapOptions.prototype, 'of', opts);
module.exports = SchemaMapOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaObjectIdOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on an ObjectId schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ testId: mongoose.ObjectId });
 *     schema.path('testId').options; // SchemaObjectIdOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaObjectIdOptions
 */ class SchemaObjectIdOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If truthy, uses Mongoose's default built-in ObjectId path.
 *
 * @api public
 * @property auto
 * @memberOf SchemaObjectIdOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(SchemaObjectIdOptions.prototype, 'auto', opts);
/**
 * Sets default [populate options](https://mongoosejs.com/docs/populate.html#query-conditions).
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       child: {
 *         type: 'ObjectId',
 *         ref: 'Child',
 *         populate: { select: 'name' }
 *       }
 *     });
 *     const Parent = mongoose.model('Parent', schema);
 *
 *     // Automatically adds `.select('name')`
 *     Parent.findOne().populate('child');
 *
 * @api public
 * @property populate
 * @memberOf SchemaObjectIdOptions
 * @type {Object}
 * @instance
 */ Object.defineProperty(SchemaObjectIdOptions.prototype, 'populate', opts);
/*!
 * ignore
 */ module.exports = SchemaObjectIdOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaStringOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a string schematype.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     schema.path('name').options; // SchemaStringOptions instance
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaStringOptions
 */ class SchemaStringOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * Array of allowed values for this path
 *
 * @api public
 * @property enum
 * @memberOf SchemaStringOptions
 * @type {Array}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'enum', opts);
/**
 * Attach a validator that succeeds if the data string matches the given regular
 * expression, and fails otherwise.
 *
 * @api public
 * @property match
 * @memberOf SchemaStringOptions
 * @type {RegExp}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'match', opts);
/**
 * If truthy, Mongoose will add a [custom setter](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.set()) that lowercases this string
 * using JavaScript's built-in `String#toLowerCase()`.
 *
 * @api public
 * @property lowercase
 * @memberOf SchemaStringOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'lowercase', opts);
/**
 * If truthy, Mongoose will add a [custom setter](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.set()) that removes leading and trailing
 * whitespace using [JavaScript's built-in `String#trim()`](https://masteringjs.io/tutorials/fundamentals/trim-string).
 *
 * @api public
 * @property trim
 * @memberOf SchemaStringOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'trim', opts);
/**
 * If truthy, Mongoose will add a custom setter that uppercases this string
 * using JavaScript's built-in [`String#toUpperCase()`](https://masteringjs.io/tutorials/fundamentals/uppercase).
 *
 * @api public
 * @property uppercase
 * @memberOf SchemaStringOptions
 * @type {Boolean}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'uppercase', opts);
/**
 * If set, Mongoose will add a custom validator that ensures the given
 * string's `length` is at least the given number.
 *
 * Mongoose supports two different spellings for this option: `minLength` and `minlength`.
 * `minLength` is the recommended way to specify this option, but Mongoose also supports
 * `minlength` (lowercase "l").
 *
 * @api public
 * @property minLength
 * @memberOf SchemaStringOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'minLength', opts);
Object.defineProperty(SchemaStringOptions.prototype, 'minlength', opts);
/**
 * If set, Mongoose will add a custom validator that ensures the given
 * string's `length` is at most the given number.
 *
 * Mongoose supports two different spellings for this option: `maxLength` and `maxlength`.
 * `maxLength` is the recommended way to specify this option, but Mongoose also supports
 * `maxlength` (lowercase "l").
 *
 * @api public
 * @property maxLength
 * @memberOf SchemaStringOptions
 * @type {Number}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'maxLength', opts);
Object.defineProperty(SchemaStringOptions.prototype, 'maxlength', opts);
/**
 * Sets default [populate options](https://mongoosejs.com/docs/populate.html#query-conditions).
 *
 * @api public
 * @property populate
 * @memberOf SchemaStringOptions
 * @type {Object}
 * @instance
 */ Object.defineProperty(SchemaStringOptions.prototype, 'populate', opts);
/*!
 * ignore
 */ module.exports = SchemaStringOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/schemaUnionOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The options defined on a Union schematype.
 *
 * @api public
 * @inherits SchemaTypeOptions
 * @constructor SchemaUnionOptions
 */ class SchemaUnionOptions extends SchemaTypeOptions {
}
const opts = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/propertyOptions.js [app-route] (ecmascript)");
/**
 * If set, specifies the types that this union can take. Mongoose will cast
 * the value to one of the given types.
 *
 * If not set, Mongoose will not cast the value to any specific type.
 *
 * @api public
 * @property of
 * @memberOf SchemaUnionOptions
 * @type {Function|Function[]|string|string[]}
 * @instance
 */ Object.defineProperty(SchemaUnionOptions.prototype, 'of', opts);
module.exports = SchemaUnionOptions;
}),
"[project]/backend/node_modules/mongoose/lib/options/saveOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
class SaveOptions {
    constructor(obj){
        if (obj == null) {
            return;
        }
        Object.assign(this, clone(obj));
    }
}
SaveOptions.prototype.__subdocs = null;
module.exports = SaveOptions;
}),
"[project]/backend/node_modules/mongoose/lib/stateMachine.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)"); // eslint-disable-line no-unused-vars
/**
 * StateMachine represents a minimal `interface` for the
 * constructors it builds via StateMachine.ctor(...).
 *
 * @api private
 */ const StateMachine = module.exports = exports = function StateMachine() {};
/**
 * StateMachine.ctor('state1', 'state2', ...)
 * A factory method for subclassing StateMachine.
 * The arguments are a list of states. For each state,
 * the constructor's prototype gets state transition
 * methods named after each state. These transition methods
 * place their path argument into the given state.
 *
 * @param {String} state
 * @param {String} [state]
 * @return {Function} subclass constructor
 * @api private
 */ StateMachine.ctor = function() {
    const states = [
        ...arguments
    ];
    const ctor = function() {
        StateMachine.apply(this, arguments);
        this.paths = {};
        this.states = {};
    };
    ctor.prototype = new StateMachine();
    ctor.prototype.constructor = ctor;
    ctor.prototype.stateNames = states;
    states.forEach(function(state) {
        // Changes the `path`'s state to `state`.
        ctor.prototype[state] = function(path) {
            this._changeState(path, state);
        };
    });
    return ctor;
};
/**
 * This function is wrapped by the state change functions:
 *
 * - `require(path)`
 * - `modify(path)`
 * - `init(path)`
 *
 * @api private
 */ StateMachine.prototype._changeState = function _changeState(path, nextState) {
    const prevState = this.paths[path];
    if (prevState === nextState) {
        return;
    }
    const prevBucket = this.states[prevState];
    if (prevBucket) delete prevBucket[path];
    this.paths[path] = nextState;
    this.states[nextState] = this.states[nextState] || {};
    this.states[nextState][path] = true;
};
/*!
 * ignore
 */ StateMachine.prototype.clear = function clear(state) {
    if (this.states[state] == null) {
        return;
    }
    const keys = Object.keys(this.states[state]);
    let i = keys.length;
    let path;
    while(i--){
        path = keys[i];
        delete this.states[state][path];
        delete this.paths[path];
    }
};
/*!
 * ignore
 */ StateMachine.prototype.clearPath = function clearPath(path) {
    const state = this.paths[path];
    if (!state) {
        return;
    }
    delete this.paths[path];
    delete this.states[state][path];
};
/**
 * Gets the paths for the given state, or empty object `{}` if none.
 * @api private
 */ StateMachine.prototype.getStatePaths = function getStatePaths(state) {
    if (this.states[state] != null) {
        return this.states[state];
    }
    return {};
};
/**
 * Checks to see if at least one path is in the states passed in via `arguments`
 * e.g., this.some('required', 'inited')
 *
 * @param {String} state that we want to check for.
 * @api private
 */ StateMachine.prototype.some = function some() {
    const _this = this;
    const what = arguments.length ? arguments : this.stateNames;
    return Array.prototype.some.call(what, function(state) {
        if (_this.states[state] == null) {
            return false;
        }
        return Object.keys(_this.states[state]).length;
    });
};
/**
 * This function builds the functions that get assigned to `forEach` and `map`,
 * since both of those methods share a lot of the same logic.
 *
 * @param {String} iterMethod is either 'forEach' or 'map'
 * @return {Function}
 * @api private
 */ StateMachine.prototype._iter = function _iter(iterMethod) {
    return function() {
        let states = [
            ...arguments
        ];
        const callback = states.pop();
        if (!states.length) states = this.stateNames;
        const _this = this;
        const paths = states.reduce(function(paths, state) {
            if (_this.states[state] == null) {
                return paths;
            }
            return paths.concat(Object.keys(_this.states[state]));
        }, []);
        return paths[iterMethod](function(path, i, paths) {
            return callback(path, i, paths);
        });
    };
};
/**
 * Iterates over the paths that belong to one of the parameter states.
 *
 * The function profile can look like:
 * this.forEach(state1, fn);         // iterates over all paths in state1
 * this.forEach(state1, state2, fn); // iterates over all paths in state1 or state2
 * this.forEach(fn);                 // iterates over all paths in all states
 *
 * @param {String} [state]
 * @param {String} [state]
 * @param {Function} callback
 * @api private
 */ StateMachine.prototype.forEach = function forEach() {
    this.forEach = this._iter('forEach');
    return this.forEach.apply(this, arguments);
};
/**
 * Maps over the paths that belong to one of the parameter states.
 *
 * The function profile can look like:
 * this.forEach(state1, fn);         // iterates over all paths in state1
 * this.forEach(state1, state2, fn); // iterates over all paths in state1 or state2
 * this.forEach(fn);                 // iterates over all paths in all states
 *
 * @param {String} [state]
 * @param {String} [state]
 * @param {Function} callback
 * @return {Array}
 * @api private
 */ StateMachine.prototype.map = function map() {
    this.map = this._iter('map');
    return this.map.apply(this, arguments);
};
/**
 * Returns a copy of this state machine
 *
 * @param {Function} callback
 * @return {StateMachine}
 * @api private
 */ StateMachine.prototype.clone = function clone() {
    const result = new this.constructor();
    result.paths = {
        ...this.paths
    };
    for (const state of this.stateNames){
        if (!(state in this.states)) {
            continue;
        }
        result.states[state] = this.states[state] == null ? this.states[state] : {
            ...this.states[state]
        };
    }
    return result;
};
}),
"[project]/backend/node_modules/mongoose/lib/internal.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Dependencies
 */ const StateMachine = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/stateMachine.js [app-route] (ecmascript)");
const ActiveRoster = StateMachine.ctor('require', 'modify', 'init', 'default', 'ignore');
module.exports = exports = InternalCache;
function InternalCache() {
    this.activePaths = new ActiveRoster();
}
InternalCache.prototype.strictMode = true;
InternalCache.prototype.fullPath = undefined;
InternalCache.prototype.selected = undefined;
InternalCache.prototype.shardval = undefined;
InternalCache.prototype.saveError = undefined;
InternalCache.prototype.validationError = undefined;
InternalCache.prototype.adhocPaths = undefined;
InternalCache.prototype.removing = undefined;
InternalCache.prototype.inserting = undefined;
InternalCache.prototype.saving = undefined;
InternalCache.prototype.version = undefined;
InternalCache.prototype._id = undefined;
InternalCache.prototype.ownerDocument = undefined;
InternalCache.prototype.populate = undefined; // what we want to populate in this doc
InternalCache.prototype.populated = undefined; // the _ids that have been populated
InternalCache.prototype.primitiveAtomics = undefined;
/**
 * If `false`, this document was not the result of population.
 * If `true`, this document is a populated doc underneath another doc
 * If an object, this document is a populated doc and the `value` property of the
 * object contains the original depopulated value.
 */ InternalCache.prototype.wasPopulated = false;
InternalCache.prototype.scope = undefined;
InternalCache.prototype.session = null;
InternalCache.prototype.pathsToScopes = null;
InternalCache.prototype.cachedRequired = null;
}),
"[project]/backend/node_modules/mongoose/lib/modifiedPathsSnapshot.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = class ModifiedPathsSnapshot {
    constructor(subdocSnapshot, activePaths, version){
        this.subdocSnapshot = subdocSnapshot;
        this.activePaths = activePaths;
        this.version = version;
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/queryHelpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies
 */ const PopulateOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/populateOptions.js [app-route] (ecmascript)");
const checkEmbeddedDiscriminatorKeyProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/checkEmbeddedDiscriminatorKeyProjection.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const isDefiningProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isDefiningProjection.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const isPathSelectedInclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isPathSelectedInclusive.js [app-route] (ecmascript)");
/**
 * Prepare a set of path options for query population. This is the MongooseQuery
 * version
 *
 * @param {Query} query
 * @param {Object} options
 * @return {Array}
 */ exports.preparePopulationOptionsMQ = function preparePopulationOptionsMQ(query, options) {
    const _populate = query._mongooseOptions.populate;
    const pop = Object.keys(_populate).reduce((vals, key)=>vals.concat([
            _populate[key]
        ]), []);
    // lean options should trickle through all queries
    if (options.lean != null) {
        pop.filter((p)=>(p && p.options && p.options.lean) == null).forEach(makeLean(options.lean));
    }
    const session = query && query.options && query.options.session || null;
    if (session != null) {
        pop.forEach((path)=>{
            if (path.options == null) {
                path.options = {
                    session: session
                };
                return;
            }
            if (!('session' in path.options)) {
                path.options.session = session;
            }
        });
    }
    const projection = query._fieldsForExec();
    for(let i = 0; i < pop.length; ++i){
        if (pop[i] instanceof PopulateOptions) {
            pop[i] = new PopulateOptions({
                ...pop[i],
                _queryProjection: projection,
                _localModel: query.model
            });
        } else {
            pop[i]._queryProjection = projection;
            pop[i]._localModel = query.model;
        }
    }
    return pop;
};
/**
 * If the document is a mapped discriminator type, it returns a model instance for that type, otherwise,
 * it returns an instance of the given model.
 *
 * @param {Model}  model
 * @param {Object} doc
 * @param {Object} fields
 *
 * @return {Document}
 */ exports.createModel = function createModel(model, doc, fields, userProvidedFields, options) {
    model.hooks.execPreSync('createModel', doc);
    const discriminatorMapping = model.schema ? model.schema.discriminatorMapping : null;
    const key = discriminatorMapping && discriminatorMapping.isRoot ? discriminatorMapping.key : null;
    const value = doc[key];
    if (key && value && model.discriminators) {
        const discriminator = model.discriminators[value] || getDiscriminatorByValue(model.discriminators, value);
        if (discriminator) {
            const _fields = clone(userProvidedFields);
            exports.applyPaths(_fields, discriminator.schema);
            return new discriminator(undefined, _fields, true);
        }
    }
    const _opts = {
        skipId: true,
        isNew: false,
        willInit: true
    };
    if (options != null && 'defaults' in options) {
        _opts.defaults = options.defaults;
    }
    return new model(undefined, fields, _opts);
};
/*!
 * ignore
 */ exports.createModelAndInit = function createModelAndInit(model, doc, fields, userProvidedFields, options, populatedIds, callback) {
    const initOpts = populatedIds ? {
        populated: populatedIds
    } : undefined;
    const casted = exports.createModel(model, doc, fields, userProvidedFields, options);
    try {
        casted.$init(doc, initOpts, callback);
    } catch (error) {
        callback(error, casted);
    }
};
/*!
 * ignore
 */ exports.applyPaths = function applyPaths(fields, schema, sanitizeProjection) {
    // determine if query is selecting or excluding fields
    let exclude;
    let keys;
    const minusPathsToSkip = new Set();
    if (fields) {
        keys = Object.keys(fields);
        // Collapse minus paths
        const minusPaths = [];
        for(let i = 0; i < keys.length; ++i){
            const key = keys[i];
            if (keys[i][0] !== '-') {
                continue;
            }
            delete fields[key];
            if (key === '-_id') {
                fields['_id'] = 0;
            } else {
                minusPaths.push(key.slice(1));
            }
        }
        keys = Object.keys(fields);
        for(let keyIndex = 0; keyIndex < keys.length; ++keyIndex){
            if (keys[keyIndex][0] === '+') {
                continue;
            }
            const field = fields[keys[keyIndex]];
            // Skip `$meta` and `$slice`
            if (!isDefiningProjection(field)) {
                continue;
            }
            if (keys[keyIndex] === '_id' && keys.length > 1) {
                continue;
            }
            if (keys[keyIndex] === schema.options.discriminatorKey && keys.length > 1 && field != null && !field) {
                continue;
            }
            exclude = !field;
            break;
        }
        // Potentially add back minus paths based on schema-level path config
        // and whether the projection is inclusive
        for (const path of minusPaths){
            const type = schema.path(path);
            // If the path isn't selected by default or the projection is not
            // inclusive, minus path is treated as equivalent to `key: 0`.
            // But we also allow using `-name` to remove `name` from an inclusive
            // projection if `name` has schema-level `select: true`.
            if (!type || !type.selected || exclude !== false) {
                fields[path] = 0;
                exclude = true;
            } else if (type && type.selected && exclude === false) {
                // Make a note of minus paths that are overwriting paths that are
                // included by default.
                minusPathsToSkip.add(path);
            }
        }
    }
    // if selecting, apply default schematype select:true fields
    // if excluding, apply schematype select:false fields
    const selected = [];
    const excluded = [];
    const stack = [];
    analyzeSchema(schema);
    switch(exclude){
        case true:
            for (const fieldName of excluded){
                fields[fieldName] = 0;
            }
            break;
        case false:
            if (schema && schema.paths['_id'] && schema.paths['_id'].options && schema.paths['_id'].options.select === false) {
                fields._id = 0;
            }
            for (const fieldName of selected){
                if (minusPathsToSkip.has(fieldName)) {
                    continue;
                }
                if (isPathSelectedInclusive(fields, fieldName)) {
                    continue;
                }
                fields[fieldName] = fields[fieldName] || 1;
            }
            break;
        case undefined:
            if (fields == null) {
                break;
            }
            // Any leftover plus paths must in the schema, so delete them (gh-7017)
            for (const key of Object.keys(fields || {})){
                if (key.startsWith('+')) {
                    delete fields[key];
                }
            }
            // user didn't specify fields, implies returning all fields.
            // only need to apply excluded fields and delete any plus paths
            for (const fieldName of excluded){
                if (fields[fieldName] != null) {
                    continue;
                }
                fields[fieldName] = 0;
            }
            break;
    }
    function analyzeSchema(schema, prefix) {
        prefix || (prefix = '');
        // avoid recursion
        if (stack.indexOf(schema) !== -1) {
            return [];
        }
        stack.push(schema);
        const addedPaths = [];
        schema.eachPath(function(path, type) {
            if (prefix) path = prefix + '.' + path;
            if (type.$isSchemaMap || path.endsWith('.$*')) {
                const plusPath = '+' + path;
                const hasPlusPath = fields && plusPath in fields;
                if (type.options && type.options.select === false && !hasPlusPath) {
                    excluded.push(path);
                }
                return;
            }
            let addedPath = analyzePath(path, type);
            // arrays
            if (addedPath == null && !Array.isArray(type) && type.$isMongooseArray && !type.$isMongooseDocumentArray) {
                addedPath = analyzePath(path, type.caster);
            }
            if (addedPath != null) {
                addedPaths.push(addedPath);
            }
            // nested schemas
            if (type.schema) {
                const _addedPaths = analyzeSchema(type.schema, path);
                // Special case: if discriminator key is the only field that would
                // be projected in, remove it.
                if (exclude === false) {
                    checkEmbeddedDiscriminatorKeyProjection(fields, path, type.schema, selected, _addedPaths);
                }
            }
        });
        stack.pop();
        return addedPaths;
    }
    function analyzePath(path, type) {
        if (fields == null) {
            return;
        }
        // If schema-level selected not set, nothing to do
        if (typeof type.selected !== 'boolean') {
            return;
        }
        // User overwriting default exclusion
        if (type.selected === false && fields[path]) {
            if (sanitizeProjection) {
                fields[path] = 0;
            }
            return;
        }
        // If set to 0, we're explicitly excluding the discriminator key. Can't do this for all fields,
        // because we have tests that assert that using `-path` to exclude schema-level `select: true`
        // fields counts as an exclusive projection. See gh-11546
        if (!exclude && type.selected && path === schema.options.discriminatorKey && fields[path] != null && !fields[path]) {
            delete fields[path];
            return;
        }
        if (exclude === false && type.selected && fields[path] != null && !fields[path]) {
            delete fields[path];
            return;
        }
        const plusPath = '+' + path;
        const hasPlusPath = fields && plusPath in fields;
        if (hasPlusPath) {
            // forced inclusion
            delete fields[plusPath];
            // if there are other fields being included, add this one
            // if no other included fields, leave this out (implied inclusion)
            if (exclude === false && keys.length > 1 && !~keys.indexOf(path) && !sanitizeProjection) {
                fields[path] = 1;
            } else if (exclude == null && sanitizeProjection && type.selected === false) {
                fields[path] = 0;
            }
            return;
        }
        // check for parent exclusions
        const pieces = path.split('.');
        let cur = '';
        for(let i = 0; i < pieces.length; ++i){
            cur += cur.length ? '.' + pieces[i] : pieces[i];
            if (excluded.indexOf(cur) !== -1) {
                return;
            }
        }
        // Special case: if user has included a parent path of a discriminator key,
        // don't explicitly project in the discriminator key because that will
        // project out everything else under the parent path
        if (!exclude && (type && type.options && type.options.$skipDiscriminatorCheck || false)) {
            let cur = '';
            for(let i = 0; i < pieces.length; ++i){
                cur += (cur.length === 0 ? '' : '.') + pieces[i];
                const projection = get(fields, cur, false) || get(fields, cur + '.$', false);
                if (projection && typeof projection !== 'object') {
                    return;
                }
            }
        }
        (type.selected ? selected : excluded).push(path);
        return path;
    }
};
/**
 * Set each path query option to lean
 *
 * @param {Object} option
 */ function makeLean(val) {
    return function(option) {
        option.options || (option.options = {});
        if (val != null && Array.isArray(val.virtuals)) {
            val = Object.assign({}, val);
            val.virtuals = val.virtuals.filter((path)=>typeof path === 'string' && path.startsWith(option.path + '.')).map((path)=>path.slice(option.path.length + 1));
        }
        option.options.lean = val;
    };
}
}),
"[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const UUID = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").UUID;
const ms = __turbopack_context__.r("[project]/backend/node_modules/ms/index.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const PopulateOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/populateOptions.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
const isMongooseArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/isMongooseArray.js [app-route] (ecmascript)");
const isMongooseDocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/isMongooseDocumentArray.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)");
const getFunctionName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getFunctionName.js [app-route] (ecmascript)");
const isMongooseObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isMongooseObject.js [app-route] (ecmascript)");
const promiseOrCallback = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js [app-route] (ecmascript)");
const schemaMerge = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/merge.js [app-route] (ecmascript)");
const specialProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)");
const { trustedSymbol } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)");
let Document;
exports.specialProperties = specialProperties;
exports.isMongooseArray = isMongooseArray.isMongooseArray;
exports.isMongooseDocumentArray = isMongooseDocumentArray.isMongooseDocumentArray;
exports.registerMongooseArray = isMongooseArray.registerMongooseArray;
exports.registerMongooseDocumentArray = isMongooseDocumentArray.registerMongooseDocumentArray;
const oneSpaceRE = /\s/;
const manySpaceRE = /\s+/;
/**
 * Produces a collection name from model `name`. By default, just returns
 * the model name
 *
 * @param {String} name a model name
 * @param {Function} pluralize function that pluralizes the collection name
 * @return {String} a collection name
 * @api private
 */ exports.toCollectionName = function(name, pluralize) {
    if (name === 'system.profile') {
        return name;
    }
    if (name === 'system.indexes') {
        return name;
    }
    if (typeof pluralize === 'function') {
        if (typeof name !== 'string') {
            throw new TypeError('Collection name must be a string');
        }
        if (name.length === 0) {
            throw new TypeError('Collection name cannot be empty');
        }
        return pluralize(name);
    }
    return name;
};
/**
 * Determines if `a` and `b` are deep equal.
 *
 * Modified from node/lib/assert.js
 *
 * @param {any} a a value to compare to `b`
 * @param {any} b a value to compare to `a`
 * @return {Boolean}
 * @api private
 */ exports.deepEqual = function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
        return a === b;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    if (isBsonType(a, 'ObjectId') && isBsonType(b, 'ObjectId') || isBsonType(a, 'Decimal128') && isBsonType(b, 'Decimal128')) {
        return a.toString() === b.toString();
    }
    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.global === b.global && a.dotAll === b.dotAll && a.unicode === b.unicode && a.sticky === b.sticky && a.hasIndices === b.hasIndices;
    }
    if (a == null || b == null) {
        return false;
    }
    if (a.prototype !== b.prototype) {
        return false;
    }
    if (a instanceof Map || b instanceof Map) {
        if (!(a instanceof Map) || !(b instanceof Map)) {
            return false;
        }
        return deepEqual(Array.from(a.keys()), Array.from(b.keys())) && deepEqual(Array.from(a.values()), Array.from(b.values()));
    }
    // Handle MongooseNumbers
    if (a instanceof Number && b instanceof Number) {
        return a.valueOf() === b.valueOf();
    }
    if (Buffer.isBuffer(a)) {
        return exports.buffer.areEqual(a, b);
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return false;
        }
        const len = a.length;
        if (len !== b.length) {
            return false;
        }
        for(let i = 0; i < len; ++i){
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (a.$__ != null) {
        a = a._doc;
    } else if (isMongooseObject(a)) {
        a = a.toObject();
    }
    if (b.$__ != null) {
        b = b._doc;
    } else if (isMongooseObject(b)) {
        b = b.toObject();
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    const kaLength = ka.length;
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (kaLength !== kb.length) {
        return false;
    }
    // ~~~cheap key test
    for(let i = kaLength - 1; i >= 0; i--){
        if (ka[i] !== kb[i]) {
            return false;
        }
    }
    // equivalent values for every corresponding key, and
    // ~~~possibly expensive deep test
    for (const key of ka){
        if (!deepEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
};
/**
 * Get the last element of an array
 * @param {Array} arr
 */ exports.last = function(arr) {
    if (arr.length > 0) {
        return arr[arr.length - 1];
    }
    return void 0;
};
/*!
 * ignore
 */ exports.promiseOrCallback = promiseOrCallback;
/*!
 * ignore
 */ exports.cloneArrays = function cloneArrays(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    return arr.map((el)=>exports.cloneArrays(el));
};
/*!
 * ignore
 */ exports.omit = function omit(obj, keys) {
    if (keys == null) {
        return Object.assign({}, obj);
    }
    if (!Array.isArray(keys)) {
        keys = [
            keys
        ];
    }
    const ret = Object.assign({}, obj);
    for (const key of keys){
        delete ret[key];
    }
    return ret;
};
/**
 * Simplified version of `clone()` that only clones POJOs and arrays. Skips documents, dates, objectids, etc.
 * @param {*} val
 * @returns
*/ exports.clonePOJOsAndArrays = function clonePOJOsAndArrays(val) {
    if (val == null) {
        return val;
    }
    // Skip documents because we assume they'll be cloned later. See gh-15312 for how documents are handled with `merge()`.
    if (val.$__ != null) {
        return val;
    }
    if (isPOJO(val)) {
        val = {
            ...val
        };
        for (const key of Object.keys(val)){
            val[key] = exports.clonePOJOsAndArrays(val[key]);
        }
        return val;
    }
    if (Array.isArray(val)) {
        val = [
            ...val
        ];
        for(let i = 0; i < val.length; ++i){
            val[i] = exports.clonePOJOsAndArrays(val[i]);
        }
        return val;
    }
    return val;
};
/**
 * Merges `from` into `to` without overwriting existing properties.
 *
 * @param {Object} to
 * @param {Object} from
 * @param {Object} [options]
 * @param {String} [path]
 * @api private
 */ exports.merge = function merge(to, from, options, path) {
    options = options || {};
    const keys = Object.keys(from);
    let i = 0;
    const len = keys.length;
    let key;
    if (from[trustedSymbol]) {
        to[trustedSymbol] = from[trustedSymbol];
    }
    path = path || '';
    const omitNested = options.omitNested || {};
    while(i < len){
        key = keys[i++];
        if (options.omit && options.omit[key]) {
            continue;
        }
        if (omitNested[path]) {
            continue;
        }
        if (specialProperties.has(key)) {
            continue;
        }
        if (to[key] == null) {
            to[key] = exports.clonePOJOsAndArrays(from[key]);
        } else if (exports.isObject(from[key])) {
            if (!exports.isObject(to[key])) {
                to[key] = {};
            }
            if (from[key] != null) {
                // Skip merging schemas if we're creating a discriminator schema and
                // base schema has a given path as a single nested but discriminator schema
                // has the path as a document array, or vice versa (gh-9534)
                if (options.isDiscriminatorSchemaMerge && from[key].$isSingleNested && to[key].$isMongooseDocumentArray || from[key].$isMongooseDocumentArray && to[key].$isSingleNested) {
                    continue;
                } else if (from[key].instanceOfSchema) {
                    if (to[key].instanceOfSchema) {
                        schemaMerge(to[key], from[key].clone(), options.isDiscriminatorSchemaMerge);
                    } else {
                        to[key] = from[key].clone();
                    }
                    continue;
                } else if (isBsonType(from[key], 'ObjectId')) {
                    to[key] = new ObjectId(from[key]);
                    continue;
                }
            }
            merge(to[key], from[key], options, path ? path + '.' + key : key);
        } else if (options.overwrite) {
            to[key] = from[key];
        }
    }
    return to;
};
/**
 * Applies toObject recursively.
 *
 * @param {Document|Array|Object} obj
 * @return {Object}
 * @api private
 */ exports.toObject = function toObject(obj) {
    Document || (Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)"));
    let ret;
    if (obj == null) {
        return obj;
    }
    if (obj instanceof Document) {
        return obj.toObject();
    }
    if (Array.isArray(obj)) {
        ret = [];
        for (const doc of obj){
            ret.push(toObject(doc));
        }
        return ret;
    }
    if (exports.isPOJO(obj)) {
        ret = {};
        if (obj[trustedSymbol]) {
            ret[trustedSymbol] = obj[trustedSymbol];
        }
        for (const k of Object.keys(obj)){
            if (specialProperties.has(k)) {
                continue;
            }
            ret[k] = toObject(obj[k]);
        }
        return ret;
    }
    return obj;
};
exports.isObject = isObject;
/**
 * Determines if `arg` is a plain old JavaScript object (POJO). Specifically,
 * `arg` must be an object but not an instance of any special class, like String,
 * ObjectId, etc.
 *
 * `Object.getPrototypeOf()` is part of ES5: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */ exports.isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)");
/**
 * Determines if `arg` is an object that isn't an instance of a built-in value
 * class, like Array, Buffer, ObjectId, etc.
 * @param {Any} val
 */ exports.isNonBuiltinObject = function isNonBuiltinObject(val) {
    return typeof val === 'object' && !exports.isNativeObject(val) && !exports.isMongooseType(val) && !(val instanceof UUID) && val != null;
};
/**
 * Determines if `obj` is a built-in object like an array, date, boolean,
 * etc.
 * @param {Any} arg
 */ exports.isNativeObject = function(arg) {
    return Array.isArray(arg) || arg instanceof Date || arg instanceof Boolean || arg instanceof Number || arg instanceof String;
};
/**
 * Determines if `val` is an object that has no own keys
 * @param {Any} val
 */ exports.isEmptyObject = function(val) {
    return val != null && typeof val === 'object' && Object.keys(val).length === 0;
};
/**
 * Search if `obj` or any POJOs nested underneath `obj` has a property named
 * `key`
 * @param {Object} obj
 * @param {String} key
 */ exports.hasKey = function hasKey(obj, key) {
    const props = Object.keys(obj);
    for (const prop of props){
        if (prop === key) {
            return true;
        }
        if (exports.isPOJO(obj[prop]) && exports.hasKey(obj[prop], key)) {
            return true;
        }
    }
    return false;
};
/**
 * process.nextTick helper.
 *
 * Wraps `callback` in a try/catch + nextTick.
 *
 * node-mongodb-native has a habit of state corruption when an error is immediately thrown from within a collection callback.
 *
 * @param {Function} callback
 * @api private
 */ exports.tick = function tick(callback) {
    if (typeof callback !== 'function') {
        return;
    }
    return function() {
        try {
            callback.apply(this, arguments);
        } catch (err) {
            // only nextTick on err to get out of
            // the event loop and avoid state corruption.
            immediate(function() {
                throw err;
            });
        }
    };
};
/**
 * Returns true if `v` is an object that can be serialized as a primitive in
 * MongoDB
 * @param {Any} v
 */ exports.isMongooseType = function(v) {
    return isBsonType(v, 'ObjectId') || isBsonType(v, 'Decimal128') || v instanceof Buffer;
};
exports.isMongooseObject = isMongooseObject;
/**
 * Converts `expires` options of index objects to `expiresAfterSeconds` options for MongoDB.
 *
 * @param {Object} object
 * @api private
 */ exports.expires = function expires(object) {
    if (!(object && object.constructor.name === 'Object')) {
        return;
    }
    if (!('expires' in object)) {
        return;
    }
    object.expireAfterSeconds = typeof object.expires !== 'string' ? object.expires : Math.round(ms(object.expires) / 1000);
    delete object.expires;
};
/**
 * populate helper
 * @param {String} path
 * @param {String} select
 * @param {Model} model
 * @param {Object} match
 * @param {Object} options
 * @param {Any} subPopulate
 * @param {Boolean} justOne
 * @param {Boolean} count
 */ exports.populate = function populate(path, select, model, match, options, subPopulate, justOne, count) {
    // might have passed an object specifying all arguments
    let obj = null;
    if (arguments.length === 1) {
        if (path instanceof PopulateOptions) {
            // If reusing old populate docs, avoid reusing `_docs` because that may
            // lead to bugs and memory leaks. See gh-11641
            path._docs = {};
            path._childDocs = [];
            return [
                path
            ];
        }
        if (Array.isArray(path)) {
            const singles = makeSingles(path);
            return singles.map((o)=>exports.populate(o)[0]);
        }
        if (exports.isObject(path)) {
            obj = Object.assign({}, path);
        } else {
            obj = {
                path: path
            };
        }
    } else if (typeof model === 'object') {
        obj = {
            path: path,
            select: select,
            match: model,
            options: match
        };
    } else {
        obj = {
            path: path,
            select: select,
            model: model,
            match: match,
            options: options,
            populate: subPopulate,
            justOne: justOne,
            count: count
        };
    }
    if (typeof obj.path !== 'string' && !(Array.isArray(obj.path) && obj.path.every((el)=>typeof el === 'string'))) {
        throw new TypeError('utils.populate: invalid path. Expected string or array of strings. Got typeof `' + typeof path + '`');
    }
    return _populateObj(obj);
    //TURBOPACK unreachable
    ;
    // The order of select/conditions args is opposite Model.find but
    // necessary to keep backward compatibility (select could be
    // an array, string, or object literal).
    function makeSingles(arr) {
        const ret = [];
        arr.forEach(function(obj) {
            if (oneSpaceRE.test(obj.path)) {
                const paths = obj.path.split(manySpaceRE);
                paths.forEach(function(p) {
                    const copy = Object.assign({}, obj);
                    copy.path = p;
                    ret.push(copy);
                });
            } else {
                ret.push(obj);
            }
        });
        return ret;
    }
};
function _populateObj(obj) {
    if (Array.isArray(obj.populate)) {
        const ret = [];
        obj.populate.forEach(function(obj) {
            if (oneSpaceRE.test(obj.path)) {
                const copy = Object.assign({}, obj);
                const paths = copy.path.split(manySpaceRE);
                paths.forEach(function(p) {
                    copy.path = p;
                    ret.push(exports.populate(copy)[0]);
                });
            } else {
                ret.push(exports.populate(obj)[0]);
            }
        });
        obj.populate = exports.populate(ret);
    } else if (obj.populate != null && typeof obj.populate === 'object') {
        obj.populate = exports.populate(obj.populate);
    }
    const ret = [];
    const paths = oneSpaceRE.test(obj.path) ? obj.path.split(manySpaceRE) : Array.isArray(obj.path) ? obj.path : [
        obj.path
    ];
    if (obj.options != null) {
        obj.options = clone(obj.options);
    }
    for (const path of paths){
        ret.push(new PopulateOptions(Object.assign({}, obj, {
            path: path
        })));
    }
    return ret;
}
/**
 * Return the value of `obj` at the given `path`.
 *
 * @param {String} path
 * @param {Object} obj
 * @param {Any} map
 */ exports.getValue = function(path, obj, map) {
    return mpath.get(path, obj, getValueLookup, map);
};
/*!
 * ignore
 */ const mapGetterOptions = Object.freeze({
    getters: false
});
function getValueLookup(obj, part) {
    if (part === '$*' && obj instanceof Map) {
        return obj;
    }
    let _from = obj?._doc || obj;
    if (_from != null && _from.isMongooseArrayProxy) {
        _from = _from.__array;
    }
    return _from instanceof Map ? _from.get(part, mapGetterOptions) : _from[part];
}
/**
 * Sets the value of `obj` at the given `path`.
 *
 * @param {String} path
 * @param {Anything} val
 * @param {Object} obj
 * @param {Any} map
 * @param {Any} _copying
 */ exports.setValue = function(path, val, obj, map, _copying) {
    mpath.set(path, val, obj, '_doc', map, _copying);
};
/**
 * Returns an array of values from object `o`.
 *
 * @param {Object} o
 * @return {Array}
 * @api private
 */ exports.object = {};
exports.object.vals = function vals(o) {
    const keys = Object.keys(o);
    let i = keys.length;
    const ret = [];
    while(i--){
        ret.push(o[keys[i]]);
    }
    return ret;
};
const hop = Object.prototype.hasOwnProperty;
/**
 * Safer helper for hasOwnProperty checks
 *
 * @param {Object} obj
 * @param {String} prop
 */ exports.object.hasOwnProperty = function(obj, prop) {
    return hop.call(obj, prop);
};
/**
 * Determine if `val` is null or undefined
 *
 * @param {Any} val
 * @return {Boolean}
 */ exports.isNullOrUndefined = function(val) {
    return val === null || val === undefined;
};
/*!
 * ignore
 */ exports.array = {};
/**
 * Flattens an array.
 *
 * [ 1, [ 2, 3, [4] ]] -> [1,2,3,4]
 *
 * @param {Array} arr
 * @param {Function} [filter] If passed, will be invoked with each item in the array. If `filter` returns a falsy value, the item will not be included in the results.
 * @param {Array} ret
 * @return {Array}
 * @api private
 */ exports.array.flatten = function flatten(arr, filter, ret) {
    ret || (ret = []);
    arr.forEach(function(item) {
        if (Array.isArray(item)) {
            flatten(item, filter, ret);
        } else {
            if (!filter || filter(item)) {
                ret.push(item);
            }
        }
    });
    return ret;
};
/*!
 * ignore
 */ const _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.hasUserDefinedProperty = function(obj, key) {
    if (obj == null) {
        return false;
    }
    if (Array.isArray(key)) {
        for (const k of key){
            if (exports.hasUserDefinedProperty(obj, k)) {
                return true;
            }
        }
        return false;
    }
    if (_hasOwnProperty.call(obj, key)) {
        return true;
    }
    if (typeof obj === 'object' && key in obj) {
        const v = obj[key];
        return v !== Object.prototype[key] && v !== Array.prototype[key];
    }
    return false;
};
/*!
 * ignore
 */ const MAX_ARRAY_INDEX = Math.pow(2, 32) - 1;
exports.isArrayIndex = function(val) {
    if (typeof val === 'number') {
        return val >= 0 && val <= MAX_ARRAY_INDEX;
    }
    if (typeof val === 'string') {
        if (!/^\d+$/.test(val)) {
            return false;
        }
        val = +val;
        return val >= 0 && val <= MAX_ARRAY_INDEX;
    }
    return false;
};
/**
 * Removes duplicate values from an array
 *
 * [1, 2, 3, 3, 5] => [1, 2, 3, 5]
 * [ ObjectId("550988ba0c19d57f697dc45e"), ObjectId("550988ba0c19d57f697dc45e") ]
 *    => [ObjectId("550988ba0c19d57f697dc45e")]
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */ exports.array.unique = function(arr) {
    const primitives = new Set();
    const ids = new Set();
    const ret = [];
    for (const item of arr){
        if (typeof item === 'number' || typeof item === 'string' || item == null) {
            if (primitives.has(item)) {
                continue;
            }
            ret.push(item);
            primitives.add(item);
        } else if (isBsonType(item, 'ObjectId')) {
            if (ids.has(item.toString())) {
                continue;
            }
            ret.push(item);
            ids.add(item.toString());
        } else {
            ret.push(item);
        }
    }
    return ret;
};
exports.buffer = {};
/**
 * Determines if two buffers are equal.
 *
 * @param {Buffer} a
 * @param {Object} b
 */ exports.buffer.areEqual = function(a, b) {
    if (!Buffer.isBuffer(a)) {
        return false;
    }
    if (!Buffer.isBuffer(b)) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    for(let i = 0, len = a.length; i < len; ++i){
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};
exports.getFunctionName = getFunctionName;
/**
 * Decorate buffers
 * @param {Object} destination
 * @param {Object} source
 */ exports.decorate = function(destination, source) {
    for(const key in source){
        if (specialProperties.has(key)) {
            continue;
        }
        destination[key] = source[key];
    }
};
/**
 * merges to with a copy of from
 *
 * @param {Object} to
 * @param {Object} fromObj
 * @api private
 */ exports.mergeClone = function(to, fromObj) {
    if (isMongooseObject(fromObj)) {
        fromObj = fromObj.toObject({
            transform: false,
            virtuals: false,
            depopulate: true,
            getters: false,
            flattenDecimals: false
        });
    }
    const keys = Object.keys(fromObj);
    const len = keys.length;
    let i = 0;
    let key;
    while(i < len){
        key = keys[i++];
        if (specialProperties.has(key)) {
            continue;
        }
        if (typeof to[key] === 'undefined') {
            to[key] = clone(fromObj[key], {
                transform: false,
                virtuals: false,
                depopulate: true,
                getters: false,
                flattenDecimals: false
            });
        } else {
            let val = fromObj[key];
            if (val != null && val.valueOf && !(val instanceof Date)) {
                val = val.valueOf();
            }
            if (exports.isObject(val)) {
                let obj = val;
                if (isMongooseObject(val) && !val.isMongooseBuffer) {
                    obj = obj.toObject({
                        transform: false,
                        virtuals: false,
                        depopulate: true,
                        getters: false,
                        flattenDecimals: false
                    });
                }
                if (val.isMongooseBuffer) {
                    obj = Buffer.from(obj);
                }
                exports.mergeClone(to[key], obj);
            } else {
                to[key] = clone(val, {
                    flattenDecimals: false
                });
            }
        }
    }
};
/**
 * Executes a function on each element of an array (like _.each)
 *
 * @param {Array} arr
 * @param {Function} fn
 * @api private
 */ exports.each = function(arr, fn) {
    for (const item of arr){
        fn(item);
    }
};
/**
 * Rename an object key, while preserving its position in the object
 *
 * @param {Object} oldObj
 * @param {String|Number} oldKey
 * @param {String|Number} newKey
 * @api private
 */ exports.renameObjKey = function(oldObj, oldKey, newKey) {
    const keys = Object.keys(oldObj);
    return keys.reduce((acc, val)=>{
        if (val === oldKey) {
            acc[newKey] = oldObj[oldKey];
        } else {
            acc[val] = oldObj[val];
        }
        return acc;
    }, {});
};
/*!
 * ignore
 */ exports.getOption = function(name) {
    const sources = Array.prototype.slice.call(arguments, 1);
    for (const source of sources){
        if (source == null) {
            continue;
        }
        if (source[name] != null) {
            return source[name];
        }
    }
    return null;
};
/*!
 * ignore
 */ exports.noop = function() {};
exports.errorToPOJO = function errorToPOJO(error) {
    const isError = error instanceof Error;
    if (!isError) {
        throw new Error('`error` must be `instanceof Error`.');
    }
    const ret = {};
    for (const properyName of Object.getOwnPropertyNames(error)){
        ret[properyName] = error[properyName];
    }
    return ret;
};
/*!
 * ignore
 */ exports.warn = function warn(message) {
    return process.emitWarning(message, {
        code: 'MONGOOSE'
    });
};
exports.injectTimestampsOption = function injectTimestampsOption(writeOperation, timestampsOption) {
    if (timestampsOption == null) {
        return;
    }
    writeOperation.timestamps = timestampsOption;
};
}),
"[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
const $exists = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/exists.js [app-route] (ecmascript)");
const $type = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/type.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const handleImmutable = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schematype/handleImmutable.js [app-route] (ecmascript)");
const isAsyncFunction = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isAsyncFunction.js [app-route] (ecmascript)");
const isSimpleValidator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isSimpleValidator.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const schemaTypeSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").schemaTypeSymbol;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const validatorErrorSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").validatorErrorSymbol;
const documentIsModified = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").documentIsModified;
const populateModelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").populateModelSymbol;
const CastError = MongooseError.CastError;
const ValidatorError = MongooseError.ValidatorError;
const setOptionsForDefaults = {
    _skipMarkModified: true
};
/**
 * SchemaType constructor. Do **not** instantiate `SchemaType` directly.
 * Mongoose converts your schema paths into SchemaTypes automatically.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     schema.path('name') instanceof SchemaType; // true
 *
 * @param {String} path
 * @param {SchemaTypeOptions} [options] See [SchemaTypeOptions docs](https://mongoosejs.com/docs/api/schematypeoptions.html)
 * @param {String} [instance]
 * @param {Schema} [parentSchema]
 * @api public
 */ function SchemaType(path, options, instance, parentSchema) {
    this[schemaTypeSymbol] = true;
    this.path = path;
    this.instance = instance;
    this.schemaName = this.constructor.schemaName;
    this.validators = [];
    this.getters = this.constructor.hasOwnProperty('getters') ? this.constructor.getters.slice() : [];
    this.setters = this.constructor.hasOwnProperty('setters') ? this.constructor.setters.slice() : [];
    this.splitPath();
    options = options || {};
    const defaultOptions = this.constructor.defaultOptions || {};
    const defaultOptionsKeys = Object.keys(defaultOptions);
    for (const option of defaultOptionsKeys){
        if (option === 'validate') {
            this.validate(defaultOptions.validate);
        } else if (defaultOptions.hasOwnProperty(option) && !Object.prototype.hasOwnProperty.call(options, option)) {
            options[option] = defaultOptions[option];
        }
    }
    if (options.select == null) {
        delete options.select;
    }
    const Options = this.OptionsConstructor || SchemaTypeOptions;
    this.options = new Options(options);
    this.parentSchema = parentSchema;
    this._index = null;
    if (utils.hasUserDefinedProperty(this.options, 'immutable')) {
        this.$immutable = this.options.immutable;
        handleImmutable(this);
    }
    const keys = Object.keys(this.options);
    for (const prop of keys){
        if (prop === 'cast') {
            if (Array.isArray(this.options[prop])) {
                this.castFunction.apply(this, this.options[prop]);
            } else {
                this.castFunction(this.options[prop]);
            }
            continue;
        }
        if (utils.hasUserDefinedProperty(this.options, prop) && typeof this[prop] === 'function') {
            // { unique: true, index: true }
            if (prop === 'index' && this._index) {
                if (options.index === false) {
                    const index = this._index;
                    if (typeof index === 'object' && index != null) {
                        if (index.unique) {
                            throw new Error('Path "' + this.path + '" may not have `index` ' + 'set to false and `unique` set to true');
                        }
                        if (index.sparse) {
                            throw new Error('Path "' + this.path + '" may not have `index` ' + 'set to false and `sparse` set to true');
                        }
                    }
                    this._index = false;
                }
                continue;
            }
            const val = options[prop];
            // Special case so we don't screw up array defaults, see gh-5780
            if (prop === 'default') {
                this.default(val);
                continue;
            }
            const opts = Array.isArray(val) ? val : [
                val
            ];
            this[prop].apply(this, opts);
        }
    }
    Object.defineProperty(this, '$$context', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });
}
/**
 * The class that Mongoose uses internally to instantiate this SchemaType's `options` property.
 * @memberOf SchemaType
 * @instance
 * @api private
 */ SchemaType.prototype.OptionsConstructor = SchemaTypeOptions;
/**
 * The path to this SchemaType in a Schema.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     schema.path('name').path; // 'name'
 *
 * @property path
 * @api public
 * @memberOf SchemaType
 */ SchemaType.prototype.path;
/**
 * Returns a plain JavaScript object representing this SchemaType.
 *
 * Typically used by `JSON.stringify()` or when calling `.toJSON()` on a SchemaType instance.
 * Omits certain internal properties such as `parentSchema` that can cause circular references.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     const schematype = schema.path('name');
 *     console.log(schematype.toJSON());
 *
 * @function toJSON
 * @memberOf SchemaType
 * @instance
 * @api public
 */ SchemaType.prototype.toJSON = function toJSON() {
    const res = {
        ...this
    };
    delete res.parentSchema;
    return res;
};
/**
 * The validators that Mongoose should run to validate properties at this SchemaType's path.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: { type: String, required: true } });
 *     schema.path('name').validators.length; // 1, the `required` validator
 *
 * @property validators
 * @api public
 * @memberOf SchemaType
 */ SchemaType.prototype.validators;
/**
 * True if this SchemaType has a required validator. False otherwise.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: { type: String, required: true } });
 *     schema.path('name').isRequired; // true
 *
 *     schema.path('name').required(false);
 *     schema.path('name').isRequired; // false
 *
 * @property isRequired
 * @api public
 * @memberOf SchemaType
 */ SchemaType.prototype.isRequired;
/**
 * Split the current dottet path into segments
 *
 * @return {String[]|undefined}
 * @api private
 */ SchemaType.prototype.splitPath = function() {
    if (this._presplitPath != null) {
        return this._presplitPath;
    }
    if (this.path == null) {
        return undefined;
    }
    this._presplitPath = this.path.indexOf('.') === -1 ? [
        this.path
    ] : this.path.split('.');
    return this._presplitPath;
};
/**
 * Get/set the function used to cast arbitrary values to this type.
 *
 * #### Example:
 *
 *     // Disallow `null` for numbers, and don't try to cast any values to
 *     // numbers, so even strings like '123' will cause a CastError.
 *     mongoose.Number.cast(function(v) {
 *       assert.ok(v === undefined || typeof v === 'number');
 *       return v;
 *     });
 *
 * @param {Function|false} caster Function that casts arbitrary values to this type, or throws an error if casting failed
 * @return {Function}
 * @static
 * @memberOf SchemaType
 * @function cast
 * @api public
 */ SchemaType.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = (v)=>v;
    }
    this._cast = caster;
    return this._cast;
};
/**
 * Get/set the function used to cast arbitrary values to this particular schematype instance.
 * Overrides `SchemaType.cast()`.
 *
 * #### Example:
 *
 *     // Disallow `null` for numbers, and don't try to cast any values to
 *     // numbers, so even strings like '123' will cause a CastError.
 *     const number = new mongoose.Number('mypath', {});
 *     number.cast(function(v) {
 *       assert.ok(v === undefined || typeof v === 'number');
 *       return v;
 *     });
 *
 * @param {Function|false} caster Function that casts arbitrary values to this type, or throws an error if casting failed
 * @return {Function}
 * @memberOf SchemaType
 * @api public
 */ SchemaType.prototype.castFunction = function castFunction(caster, message) {
    if (arguments.length === 0) {
        return this._castFunction;
    }
    if (caster === false) {
        caster = this.constructor._defaultCaster || ((v)=>v);
    }
    if (typeof caster === 'string') {
        this._castErrorMessage = caster;
        return this._castFunction;
    }
    if (caster != null) {
        this._castFunction = caster;
    }
    if (message != null) {
        this._castErrorMessage = message;
    }
    return this._castFunction;
};
/**
 * The function that Mongoose calls to cast arbitrary values to this SchemaType.
 *
 * @param {Object} value value to cast
 * @param {Document} doc document that triggers the casting
 * @param {Boolean} init
 * @api public
 */ SchemaType.prototype.cast = function cast() {
    throw new Error('Base SchemaType class does not implement a `cast()` function');
};
/**
 * Sets a default option for this schema type.
 *
 * #### Example:
 *
 *     // Make all strings be trimmed by default
 *     mongoose.SchemaTypes.String.set('trim', true);
 *
 * @param {String} option The name of the option you'd like to set (e.g. trim, lowercase, etc...)
 * @param {Any} value The value of the option you'd like to set.
 * @return {void}
 * @static
 * @memberOf SchemaType
 * @function set
 * @api public
 */ SchemaType.set = function set(option, value) {
    if (!this.hasOwnProperty('defaultOptions')) {
        this.defaultOptions = Object.assign({}, this.defaultOptions);
    }
    this.defaultOptions[option] = value;
};
/**
 * Attaches a getter for all instances of this schema type.
 *
 * #### Example:
 *
 *     // Make all numbers round down
 *     mongoose.Number.get(function(v) { return Math.floor(v); });
 *
 * @param {Function} getter
 * @return {this}
 * @static
 * @memberOf SchemaType
 * @function get
 * @api public
 */ SchemaType.get = function(getter) {
    this.getters = this.hasOwnProperty('getters') ? this.getters : [];
    this.getters.push(getter);
};
/**
 * Sets a default value for this SchemaType.
 *
 * #### Example:
 *
 *     const schema = new Schema({ n: { type: Number, default: 10 })
 *     const M = db.model('M', schema)
 *     const m = new M;
 *     console.log(m.n) // 10
 *
 * Defaults can be either `functions` which return the value to use as the default or the literal value itself. Either way, the value will be cast based on its schema type before being set during document creation.
 *
 * #### Example:
 *
 *     // values are cast:
 *     const schema = new Schema({ aNumber: { type: Number, default: 4.815162342 }})
 *     const M = db.model('M', schema)
 *     const m = new M;
 *     console.log(m.aNumber) // 4.815162342
 *
 *     // default unique objects for Mixed types:
 *     const schema = new Schema({ mixed: Schema.Types.Mixed });
 *     schema.path('mixed').default(function () {
 *       return {};
 *     });
 *
 *     // if we don't use a function to return object literals for Mixed defaults,
 *     // each document will receive a reference to the same object literal creating
 *     // a "shared" object instance:
 *     const schema = new Schema({ mixed: Schema.Types.Mixed });
 *     schema.path('mixed').default({});
 *     const M = db.model('M', schema);
 *     const m1 = new M;
 *     m1.mixed.added = 1;
 *     console.log(m1.mixed); // { added: 1 }
 *     const m2 = new M;
 *     console.log(m2.mixed); // { added: 1 }
 *
 * @param {Function|any} val The default value to set
 * @return {Any|undefined} Returns the set default value.
 * @api public
 */ SchemaType.prototype.default = function(val) {
    if (arguments.length === 1) {
        if (val === void 0) {
            this.defaultValue = void 0;
            return void 0;
        }
        if (val != null && val.instanceOfSchema) {
            throw new MongooseError('Cannot set default value of path `' + this.path + '` to a mongoose Schema instance.');
        }
        this.defaultValue = val;
        return this.defaultValue;
    } else if (arguments.length > 1) {
        this.defaultValue = [
            ...arguments
        ];
    }
    return this.defaultValue;
};
/**
 * Declares the index options for this schematype.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: { type: String, index: true })
 *     const s = new Schema({ name: { type: String, index: -1 })
 *     const s = new Schema({ loc: { type: [Number], index: 'hashed' })
 *     const s = new Schema({ loc: { type: [Number], index: '2d', sparse: true })
 *     const s = new Schema({ loc: { type: [Number], index: { type: '2dsphere', sparse: true }})
 *     const s = new Schema({ date: { type: Date, index: { unique: true, expires: '1d' }})
 *     s.path('my.path').index(true);
 *     s.path('my.date').index({ expires: 60 });
 *     s.path('my.path').index({ unique: true, sparse: true });
 *
 * #### Note:
 *
 * _Indexes are created [in the background](https://www.mongodb.com/docs/manual/core/index-creation/#index-creation-background)
 * by default. If `background` is set to `false`, MongoDB will not execute any
 * read/write operations you send until the index build.
 * Specify `background: false` to override Mongoose's default._
 *
 * @param {Object|Boolean|String|Number} options
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.index = function(options) {
    this._index = options;
    utils.expires(this._index);
    return this;
};
/**
 * Declares an unique index.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: { type: String, unique: true } });
 *     s.path('name').index({ unique: true });
 *
 * _NOTE: violating the constraint returns an `E11000` error from MongoDB when saving, not a Mongoose validation error._
 *
 * You can optionally specify an error message to replace MongoDB's default `E11000 duplicate key error` message.
 * The following will throw a "Email must be unique" error if `save()`, `updateOne()`, `updateMany()`, `replaceOne()`,
 * `findOneAndUpdate()`, or `findOneAndReplace()` throws a duplicate key error:
 *
 * ```javascript
 * new Schema({
 *   email: {
 *     type: String,
 *     unique: [true, 'Email must be unique']
 *   }
 * });
 * ```
 *
 * Note that the above syntax does **not** work for `bulkWrite()` or `insertMany()`. `bulkWrite()` and `insertMany()`
 * will still throw MongoDB's default `E11000 duplicate key error` message.
 *
 * @param {Boolean} value
 * @param {String} [message]
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.unique = function unique(value, message) {
    if (this._index === false) {
        if (!value) {
            return;
        }
        throw new Error('Path "' + this.path + '" may not have `index` set to ' + 'false and `unique` set to true');
    }
    if (!this.options.hasOwnProperty('index') && value === false) {
        return this;
    }
    if (this._index == null || this._index === true) {
        this._index = {};
    } else if (typeof this._index === 'string') {
        this._index = {
            type: this._index
        };
    }
    this._index.unique = !!value;
    if (typeof message === 'string') {
        this._duplicateKeyErrorMessage = message;
    }
    return this;
};
/**
 * Declares a full text index.
 *
 * ### Example:
 *
 *      const s = new Schema({ name : { type: String, text : true } })
 *      s.path('name').index({ text : true });
 *
 * @param {Boolean} bool
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.text = function(bool) {
    if (this._index === false) {
        if (!bool) {
            return this;
        }
        throw new Error('Path "' + this.path + '" may not have `index` set to ' + 'false and `text` set to true');
    }
    if (!this.options.hasOwnProperty('index') && bool === false) {
        return this;
    }
    if (this._index === null || this._index === undefined || typeof this._index === 'boolean') {
        this._index = {};
    } else if (typeof this._index === 'string') {
        this._index = {
            type: this._index
        };
    }
    this._index.text = bool;
    return this;
};
/**
 * Declares a sparse index.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: { type: String, sparse: true } });
 *     s.path('name').index({ sparse: true });
 *
 * @param {Boolean} bool
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.sparse = function(bool) {
    if (this._index === false) {
        if (!bool) {
            return this;
        }
        throw new Error('Path "' + this.path + '" may not have `index` set to ' + 'false and `sparse` set to true');
    }
    if (!this.options.hasOwnProperty('index') && bool === false) {
        return this;
    }
    if (this._index == null || typeof this._index === 'boolean') {
        this._index = {};
    } else if (typeof this._index === 'string') {
        this._index = {
            type: this._index
        };
    }
    this._index.sparse = bool;
    return this;
};
/**
 * Defines this path as immutable. Mongoose prevents you from changing
 * immutable paths unless the parent document has [`isNew: true`](https://mongoosejs.com/docs/api/document.html#Document.prototype.isNew()).
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       name: { type: String, immutable: true },
 *       age: Number
 *     });
 *     const Model = mongoose.model('Test', schema);
 *
 *     await Model.create({ name: 'test' });
 *     const doc = await Model.findOne();
 *
 *     doc.isNew; // false
 *     doc.name = 'new name';
 *     doc.name; // 'test', because `name` is immutable
 *
 * Mongoose also prevents changing immutable properties using `updateOne()`
 * and `updateMany()` based on [strict mode](https://mongoosejs.com/docs/guide.html#strict).
 *
 * #### Example:
 *
 *     // Mongoose will strip out the `name` update, because `name` is immutable
 *     Model.updateOne({}, { $set: { name: 'test2' }, $inc: { age: 1 } });
 *
 *     // If `strict` is set to 'throw', Mongoose will throw an error if you
 *     // update `name`
 *     const err = await Model.updateOne({}, { name: 'test2' }, { strict: 'throw' }).
 *       then(() => null, err => err);
 *     err.name; // StrictModeError
 *
 *     // If `strict` is `false`, Mongoose allows updating `name` even though
 *     // the property is immutable.
 *     Model.updateOne({}, { name: 'test2' }, { strict: false });
 *
 * @param {Boolean} bool
 * @return {SchemaType} this
 * @see isNew https://mongoosejs.com/docs/api/document.html#Document.prototype.isNew()
 * @api public
 */ SchemaType.prototype.immutable = function(bool) {
    this.$immutable = bool;
    handleImmutable(this);
    return this;
};
/**
 * Defines a custom function for transforming this path when converting a document to JSON.
 *
 * Mongoose calls this function with one parameter: the current `value` of the path. Mongoose
 * then uses the return value in the JSON output.
 *
 * #### Example:
 *
 *     const schema = new Schema({
 *       date: { type: Date, transform: v => v.getFullYear() }
 *     });
 *     const Model = mongoose.model('Test', schema);
 *
 *     await Model.create({ date: new Date('2016-06-01') });
 *     const doc = await Model.findOne();
 *
 *     doc.date instanceof Date; // true
 *
 *     doc.toJSON().date; // 2016 as a number
 *     JSON.stringify(doc); // '{"_id":...,"date":2016}'
 *
 * @param {Function} fn
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.transform = function(fn) {
    this.options.transform = fn;
    return this;
};
/**
 * Adds a setter to this schematype.
 *
 * #### Example:
 *
 *     function capitalize (val) {
 *       if (typeof val !== 'string') val = '';
 *       return val.charAt(0).toUpperCase() + val.substring(1);
 *     }
 *
 *     // defining within the schema
 *     const s = new Schema({ name: { type: String, set: capitalize }});
 *
 *     // or with the SchemaType
 *     const s = new Schema({ name: String })
 *     s.path('name').set(capitalize);
 *
 * Setters allow you to transform the data before it gets to the raw mongodb
 * document or query.
 *
 * Suppose you are implementing user registration for a website. Users provide
 * an email and password, which gets saved to mongodb. The email is a string
 * that you will want to normalize to lower case, in order to avoid one email
 * having more than one account -- e.g., otherwise, avenue@q.com can be registered for 2 accounts via avenue@q.com and AvEnUe@Q.CoM.
 *
 * You can set up email lower case normalization easily via a Mongoose setter.
 *
 *     function toLower(v) {
 *       return v.toLowerCase();
 *     }
 *
 *     const UserSchema = new Schema({
 *       email: { type: String, set: toLower }
 *     });
 *
 *     const User = db.model('User', UserSchema);
 *
 *     const user = new User({email: 'AVENUE@Q.COM'});
 *     console.log(user.email); // 'avenue@q.com'
 *
 *     // or
 *     const user = new User();
 *     user.email = 'Avenue@Q.com';
 *     console.log(user.email); // 'avenue@q.com'
 *     User.updateOne({ _id: _id }, { $set: { email: 'AVENUE@Q.COM' } }); // update to 'avenue@q.com'
 *
 *     // Setters also transform query filters
 *     const user = await User.find({ email: 'AVENUE@Q.COM' }); // query for 'avenue@q.com'
 *
 * As you can see above, setters allow you to transform the data before it
 * stored in MongoDB, or before executing a query.
 *
 * _NOTE: we could have also just used the built-in [`lowercase: true` SchemaType option](https://mongoosejs.com/docs/api/schemastringoptions.html#SchemaStringOptions.prototype.lowercase) instead of defining our own function._
 *
 *     new Schema({ email: { type: String, lowercase: true }})
 *
 * Setters are also passed a second argument, the schematype on which the setter was defined. This allows for tailored behavior based on options passed in the schema.
 *
 *     function inspector (val, priorValue, schematype) {
 *       if (schematype.options.required) {
 *         return schematype.path + ' is required';
 *       } else {
 *         return val;
 *       }
 *     }
 *
 *     const VirusSchema = new Schema({
 *       name: { type: String, required: true, set: inspector },
 *       taxonomy: { type: String, set: inspector }
 *     })
 *
 *     const Virus = db.model('Virus', VirusSchema);
 *     const v = new Virus({ name: 'Parvoviridae', taxonomy: 'Parvovirinae' });
 *
 *     console.log(v.name);     // name is required
 *     console.log(v.taxonomy); // Parvovirinae
 *
 * You can also use setters to modify other properties on the document. If
 * you're setting a property `name` on a document, the setter will run with
 * `this` as the document. Be careful, in mongoose 5 setters will also run
 * when querying by `name` with `this` as the query.
 *
 *     const nameSchema = new Schema({ name: String, keywords: [String] });
 *     nameSchema.path('name').set(function(v) {
 *       // Need to check if `this` is a document, because in mongoose 5
 *       // setters will also run on queries, in which case `this` will be a
 *       // mongoose query object.
 *       if (this instanceof Document && v != null) {
 *         this.keywords = v.split(' ');
 *       }
 *       return v;
 *     });
 *
 * @param {Function} fn
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.set = function(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError('A setter must be a function.');
    }
    this.setters.push(fn);
    return this;
};
/**
 * Adds a getter to this schematype.
 *
 * #### Example:
 *
 *     function dob (val) {
 *       if (!val) return val;
 *       return (val.getMonth() + 1) + "/" + val.getDate() + "/" + val.getFullYear();
 *     }
 *
 *     // defining within the schema
 *     const s = new Schema({ born: { type: Date, get: dob })
 *
 *     // or by retreiving its SchemaType
 *     const s = new Schema({ born: Date })
 *     s.path('born').get(dob)
 *
 * Getters allow you to transform the representation of the data as it travels from the raw mongodb document to the value that you see.
 *
 * Suppose you are storing credit card numbers and you want to hide everything except the last 4 digits to the mongoose user. You can do so by defining a getter in the following way:
 *
 *     function obfuscate (cc) {
 *       return '****-****-****-' + cc.slice(cc.length-4, cc.length);
 *     }
 *
 *     const AccountSchema = new Schema({
 *       creditCardNumber: { type: String, get: obfuscate }
 *     });
 *
 *     const Account = db.model('Account', AccountSchema);
 *
 *     Account.findById(id, function (err, found) {
 *       console.log(found.creditCardNumber); // '****-****-****-1234'
 *     });
 *
 * Getters are also passed a second argument, the schematype on which the getter was defined. This allows for tailored behavior based on options passed in the schema.
 *
 *     function inspector (val, priorValue, schematype) {
 *       if (schematype.options.required) {
 *         return schematype.path + ' is required';
 *       } else {
 *         return schematype.path + ' is not';
 *       }
 *     }
 *
 *     const VirusSchema = new Schema({
 *       name: { type: String, required: true, get: inspector },
 *       taxonomy: { type: String, get: inspector }
 *     })
 *
 *     const Virus = db.model('Virus', VirusSchema);
 *
 *     Virus.findById(id, function (err, virus) {
 *       console.log(virus.name);     // name is required
 *       console.log(virus.taxonomy); // taxonomy is not
 *     })
 *
 * @param {Function} fn
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.get = function(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError('A getter must be a function.');
    }
    this.getters.push(fn);
    return this;
};
/**
 * Adds multiple validators for this document path.
 * Calls `validate()` for every element in validators.
 *
 * @param {Array<RegExp|Function|Object>} validators
 * @returns this
 */ SchemaType.prototype.validateAll = function(validators) {
    for(let i = 0; i < validators.length; i++){
        this.validate(validators[i]);
    }
    return this;
};
/**
 * Adds validator(s) for this document path.
 *
 * Validators always receive the value to validate as their first argument and
 * must return `Boolean`. Returning `false` or throwing an error means
 * validation failed.
 *
 * The error message argument is optional. If not passed, the [default generic error message template](https://mongoosejs.com/docs/api/error.html#Error.messages) will be used.
 *
 * #### Example:
 *
 *     // make sure every value is equal to "something"
 *     function validator (val) {
 *       return val === 'something';
 *     }
 *     new Schema({ name: { type: String, validate: validator }});
 *
 *     // with a custom error message
 *
 *     const custom = [validator, 'Uh oh, {PATH} does not equal "something".']
 *     new Schema({ name: { type: String, validate: custom }});
 *
 *     // adding many validators at a time
 *
 *     const many = [
 *         { validator: validator, message: 'uh oh' }
 *       , { validator: anotherValidator, message: 'failed' }
 *     ]
 *     new Schema({ name: { type: String, validate: many }});
 *
 *     // or utilizing SchemaType methods directly:
 *
 *     const schema = new Schema({ name: 'string' });
 *     schema.path('name').validate(validator, 'validation of `{PATH}` failed with value `{VALUE}`');
 *
 * #### Error message templates:
 *
 * Below is a list of supported template keywords:
 *
 * - PATH: The schema path where the error is being triggered.
 * - VALUE: The value assigned to the PATH that is triggering the error.
 * - KIND: The validation property that triggered the error i.e. required.
 * - REASON: The error object that caused this error if there was one.
 *
 * If Mongoose's built-in error message templating isn't enough, Mongoose
 * supports setting the `message` property to a function.
 *
 *     schema.path('name').validate({
 *       validator: function(v) { return v.length > 5; },
 *       // `errors['name']` will be "name must have length 5, got 'foo'"
 *       message: function(props) {
 *         return `${props.path} must have length 5, got '${props.value}'`;
 *       }
 *     });
 *
 * To bypass Mongoose's error messages and just copy the error message that
 * the validator throws, do this:
 *
 *     schema.path('name').validate({
 *       validator: function() { throw new Error('Oops!'); },
 *       // `errors['name'].message` will be "Oops!"
 *       message: function(props) { return props.reason.message; }
 *     });
 *
 * #### Asynchronous validation:
 *
 * Mongoose supports validators that return a promise. A validator that returns
 * a promise is called an _async validator_. Async validators run in
 * parallel, and `validate()` will wait until all async validators have settled.
 *
 *     schema.path('name').validate({
 *       validator: function (value) {
 *         return new Promise(function (resolve, reject) {
 *           resolve(false); // validation failed
 *         });
 *       }
 *     });
 *
 * You might use asynchronous validators to retreive other documents from the database to validate against or to meet other I/O bound validation needs.
 *
 * Validation occurs `pre('save')` or whenever you manually execute [document#validate](https://mongoosejs.com/docs/api/document.html#Document.prototype.validate()).
 *
 * If validation fails during `pre('save')` and no callback was passed to receive the error, an `error` event will be emitted on your Models associated db [connection](https://mongoosejs.com/docs/api/connection.html#Connection()), passing the validation error object along.
 *
 *     const conn = mongoose.createConnection(..);
 *     conn.on('error', handleError);
 *
 *     const Product = conn.model('Product', yourSchema);
 *     const dvd = new Product(..);
 *     dvd.save(); // emits error on the `conn` above
 *
 * If you want to handle these errors at the Model level, add an `error`
 * listener to your Model as shown below.
 *
 *     // registering an error listener on the Model lets us handle errors more locally
 *     Product.on('error', handleError);
 *
 * @param {RegExp|Function|Object} obj validator function, or hash describing options
 * @param {Function} [obj.validator] validator function. If the validator function returns `undefined` or a truthy value, validation succeeds. If it returns [falsy](https://masteringjs.io/tutorials/fundamentals/falsy) (except `undefined`) or throws an error, validation fails.
 * @param {String|Function} [obj.message] optional error message. If function, should return the error message as a string
 * @param {Boolean} [obj.propsParameter=false] If true, Mongoose will pass the validator properties object (with the `validator` function, `message`, etc.) as the 2nd arg to the validator function. This is disabled by default because many validators [rely on positional args](https://github.com/chriso/validator.js#validators), so turning this on may cause unpredictable behavior in external validators.
 * @param {String|Function} [errorMsg] optional error message. If function, should return the error message as a string
 * @param {String} [type] optional validator type
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.validate = function(obj, message, type) {
    if (typeof obj === 'function' || obj && utils.getFunctionName(obj.constructor) === 'RegExp') {
        let properties;
        if (typeof message === 'function') {
            properties = {
                validator: obj,
                message: message
            };
            properties.type = type || 'user defined';
        } else if (message instanceof Object && !type) {
            properties = isSimpleValidator(message) ? Object.assign({}, message) : clone(message);
            if (!properties.message) {
                properties.message = properties.msg;
            }
            properties.validator = obj;
            properties.type = properties.type || 'user defined';
        } else {
            if (message == null) {
                message = MongooseError.messages.general.default;
            }
            if (!type) {
                type = 'user defined';
            }
            properties = {
                message: message,
                type: type,
                validator: obj
            };
        }
        this.validators.push(properties);
        return this;
    }
    let i;
    let length;
    let arg;
    for(i = 0, length = arguments.length; i < length; i++){
        arg = arguments[i];
        if (!utils.isPOJO(arg)) {
            const msg = 'Invalid validator. Received (' + typeof arg + ') ' + arg + '. See https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.validate()';
            throw new Error(msg);
        }
        this.validate(arg.validator, arg);
    }
    return this;
};
/**
 * Adds a required validator to this SchemaType. The validator gets added
 * to the front of this SchemaType's validators array using `unshift()`.
 *
 * #### Example:
 *
 *     const s = new Schema({ born: { type: Date, required: true })
 *
 *     // or with custom error message
 *
 *     const s = new Schema({ born: { type: Date, required: '{PATH} is required!' })
 *
 *     // or with a function
 *
 *     const s = new Schema({
 *       userId: ObjectId,
 *       username: {
 *         type: String,
 *         required: function() { return this.userId != null; }
 *       }
 *     })
 *
 *     // or with a function and a custom message
 *     const s = new Schema({
 *       userId: ObjectId,
 *       username: {
 *         type: String,
 *         required: [
 *           function() { return this.userId != null; },
 *           'username is required if id is specified'
 *         ]
 *       }
 *     })
 *
 *     // or through the path API
 *
 *     s.path('name').required(true);
 *
 *     // with custom error messaging
 *
 *     s.path('name').required(true, 'grrr :( ');
 *
 *     // or make a path conditionally required based on a function
 *     const isOver18 = function() { return this.age >= 18; };
 *     s.path('voterRegistrationId').required(isOver18);
 *
 * The required validator uses the SchemaType's `checkRequired` function to
 * determine whether a given value satisfies the required validator. By default,
 * a value satisfies the required validator if `val != null` (that is, if
 * the value is not null nor undefined). However, most built-in mongoose schema
 * types override the default `checkRequired` function:
 *
 * @param {Boolean|Function|Object} required enable/disable the validator, or function that returns required boolean, or options object
 * @param {Boolean|Function} [options.isRequired] enable/disable the validator, or function that returns required boolean
 * @param {Function} [options.ErrorConstructor] custom error constructor. The constructor receives 1 parameter, an object containing the validator properties.
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @see SchemaArray#checkRequired https://mongoosejs.com/docs/api/schemaarray.html#SchemaArray.prototype.checkRequired()
 * @see SchemaBoolean#checkRequired https://mongoosejs.com/docs/api/schemaboolean.html#SchemaBoolean.prototype.checkRequired()
 * @see SchemaBuffer#checkRequired https://mongoosejs.com/docs/api/schemabuffer.html#SchemaBuffer.prototype.checkRequired()
 * @see SchemaNumber#checkRequired https://mongoosejs.com/docs/api/schemanumber.html#SchemaNumber.prototype.checkRequired()
 * @see SchemaObjectId#checkRequired https://mongoosejs.com/docs/api/schemaobjectid.html#ObjectId.prototype.checkRequired()
 * @see SchemaString#checkRequired https://mongoosejs.com/docs/api/schemastring.html#SchemaString.prototype.checkRequired()
 * @api public
 */ SchemaType.prototype.required = function(required, message) {
    let customOptions = {};
    if (arguments.length > 0 && required == null) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.requiredValidator;
        }, this);
        this.isRequired = false;
        delete this.originalRequiredValue;
        return this;
    }
    if (typeof required === 'object') {
        customOptions = required;
        message = customOptions.message || message;
        required = required.isRequired;
    }
    if (required === false) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.requiredValidator;
        }, this);
        this.isRequired = false;
        delete this.originalRequiredValue;
        return this;
    }
    const _this = this;
    this.isRequired = true;
    this.requiredValidator = function(v) {
        const cachedRequired = this && this.$__ && this.$__.cachedRequired;
        // no validation when this path wasn't selected in the query.
        if (cachedRequired != null && !this.$__isSelected(_this.path) && !this[documentIsModified](_this.path)) {
            return true;
        }
        // `$cachedRequired` gets set in `_evaluateRequiredFunctions()` so we
        // don't call required functions multiple times in one validate call
        // See gh-6801
        if (cachedRequired != null && _this.path in cachedRequired) {
            const res = cachedRequired[_this.path] ? _this.checkRequired(v, this) : true;
            delete cachedRequired[_this.path];
            return res;
        } else if (typeof required === 'function') {
            return required.apply(this) ? _this.checkRequired(v, this) : true;
        }
        return _this.checkRequired(v, this);
    };
    this.originalRequiredValue = required;
    if (typeof required === 'string') {
        message = required;
        required = undefined;
    }
    const msg = message || MongooseError.messages.general.required;
    this.validators.unshift(Object.assign({}, customOptions, {
        validator: this.requiredValidator,
        message: msg,
        type: 'required'
    }));
    return this;
};
/**
 * Set the model that this path refers to. This is the option that [populate](https://mongoosejs.com/docs/populate.html)
 * looks at to determine the foreign collection it should query.
 *
 * #### Example:
 *
 *     const userSchema = new Schema({ name: String });
 *     const User = mongoose.model('User', userSchema);
 *
 *     const postSchema = new Schema({ user: mongoose.ObjectId });
 *     postSchema.path('user').ref('User'); // Can set ref to a model name
 *     postSchema.path('user').ref(User); // Or a model class
 *     postSchema.path('user').ref(() => 'User'); // Or a function that returns the model name
 *     postSchema.path('user').ref(() => User); // Or a function that returns the model class
 *
 *     // Or you can just declare the `ref` inline in your schema
 *     const postSchema2 = new Schema({
 *       user: { type: mongoose.ObjectId, ref: User }
 *     });
 *
 * @param {String|Model|Function} ref either a model name, a [Model](https://mongoosejs.com/docs/models.html), or a function that returns a model name or model.
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.ref = function(ref) {
    this.options.ref = ref;
    return this;
};
/**
 * Gets the default value
 *
 * @param {Object} scope the scope which callback are executed
 * @param {Boolean} init
 * @return {Any} The Stored default value.
 * @api private
 */ SchemaType.prototype.getDefault = function(scope, init, options) {
    let ret;
    if (this.defaultValue == null) {
        return this.defaultValue;
    }
    if (typeof this.defaultValue === 'function') {
        if (this.defaultValue === Date.now || this.defaultValue === Array || this.defaultValue.name.toLowerCase() === 'objectid') {
            ret = this.defaultValue.call(scope);
        } else {
            ret = this.defaultValue.call(scope, scope);
        }
    } else {
        ret = this.defaultValue;
    }
    if (ret !== null && ret !== undefined) {
        if (typeof ret === 'object' && (!this.options || !this.options.shared)) {
            ret = clone(ret);
        }
        if (options && options.skipCast) {
            return this._applySetters(ret, scope);
        }
        const casted = this.applySetters(ret, scope, init, undefined, setOptionsForDefaults);
        if (casted && !Array.isArray(casted) && casted.$isSingleNested) {
            casted.$__parent = scope;
        }
        return casted;
    }
    return ret;
};
/**
 * Applies setters without casting
 *
 * @param {Any} value
 * @param {Any} scope
 * @param {Boolean} init
 * @param {Any} priorVal
 * @param {Object} [options]
 * @instance
 * @api private
 */ SchemaType.prototype._applySetters = function(value, scope, init, priorVal, options) {
    let v = value;
    if (init) {
        return v;
    }
    const setters = this.setters;
    for(let i = setters.length - 1; i >= 0; i--){
        v = setters[i].call(scope, v, priorVal, this, options);
    }
    return v;
};
/*!
 * ignore
 */ SchemaType.prototype._castNullish = function _castNullish(v) {
    return v;
};
/**
 * Applies setters
 *
 * @param {Object} value
 * @param {Object} scope
 * @param {Boolean} init
 * @return {Any}
 * @api private
 */ SchemaType.prototype.applySetters = function(value, scope, init, priorVal, options) {
    let v = this._applySetters(value, scope, init, priorVal, options);
    if (v == null) {
        return this._castNullish(v);
    }
    // do not cast until all setters are applied #665
    v = this.cast(v, scope, init, priorVal, options);
    return v;
};
/**
 * Applies getters to a value
 *
 * @param {Object} value
 * @param {Object} scope
 * @return {Any}
 * @api private
 */ SchemaType.prototype.applyGetters = function(value, scope) {
    let v = value;
    const getters = this.getters;
    const len = getters.length;
    if (len === 0) {
        return v;
    }
    for(let i = 0; i < len; ++i){
        v = getters[i].call(scope, v, this);
    }
    return v;
};
/**
 * Sets default `select()` behavior for this path.
 *
 * Set to `true` if this path should always be included in the results, `false` if it should be excluded by default. This setting can be overridden at the query level.
 *
 * #### Example:
 *
 *     T = db.model('T', new Schema({ x: { type: String, select: true }}));
 *     T.find(..); // field x will always be selected ..
 *     // .. unless overridden;
 *     T.find().select('-x').exec(callback);
 *
 * @param {Boolean} val
 * @return {SchemaType} this
 * @api public
 */ SchemaType.prototype.select = function select(val) {
    this.selected = !!val;
    return this;
};
/**
 * Performs a validation of `value` using the validators declared for this SchemaType.
 *
 * @param {Any} value
 * @param {Function} callback
 * @param {Object} scope
 * @param {Object} [options]
 * @param {String} [options.path]
 * @return {Any} If no validators, returns the output from calling `fn`, otherwise no return
 * @api public
 */ SchemaType.prototype.doValidate = function(value, fn, scope, options) {
    let err = false;
    const path = this.path;
    if (typeof fn !== 'function') {
        throw new TypeError(`Must pass callback function to doValidate(), got ${typeof fn}`);
    }
    // Avoid non-object `validators`
    const validators = this.validators.filter((v)=>typeof v === 'object' && v !== null);
    let count = validators.length;
    if (!count) {
        return fn(null);
    }
    for(let i = 0, len = validators.length; i < len; ++i){
        if (err) {
            break;
        }
        const v = validators[i];
        const validator = v.validator;
        let ok;
        const validatorProperties = isSimpleValidator(v) ? Object.assign({}, v) : clone(v);
        validatorProperties.path = options && options.path ? options.path : path;
        validatorProperties.fullPath = this.$fullPath;
        validatorProperties.value = value;
        if (typeof value === 'string') {
            validatorProperties.length = value.length;
            if (validatorProperties.value.length > 30) {
                validatorProperties.value = validatorProperties.value.slice(0, 30) + '...';
            }
        }
        if (validator instanceof RegExp) {
            validate(validator.test(value), validatorProperties, scope);
            continue;
        }
        if (typeof validator !== 'function') {
            continue;
        }
        if (value === undefined && validator !== this.requiredValidator) {
            validate(true, validatorProperties, scope);
            continue;
        }
        try {
            if (validatorProperties.propsParameter) {
                ok = validator.call(scope, value, validatorProperties);
            } else {
                ok = validator.call(scope, value);
            }
        } catch (error) {
            ok = false;
            validatorProperties.reason = error;
            if (error.message) {
                validatorProperties.message = error.message;
            }
        }
        if (ok != null && typeof ok.then === 'function') {
            ok.then(function(ok) {
                validate(ok, validatorProperties, scope);
            }, function(error) {
                validatorProperties.reason = error;
                validatorProperties.message = error.message;
                ok = false;
                validate(ok, validatorProperties, scope);
            });
        } else {
            validate(ok, validatorProperties, scope);
        }
    }
    function validate(ok, validatorProperties, scope) {
        if (err) {
            return;
        }
        if (ok === undefined || ok) {
            if (--count <= 0) {
                immediate(function() {
                    fn(null);
                });
            }
        } else {
            const ErrorConstructor = validatorProperties.ErrorConstructor || ValidatorError;
            err = new ErrorConstructor(validatorProperties, scope);
            err[validatorErrorSymbol] = true;
            immediate(function() {
                fn(err);
            });
        }
    }
};
function _validate(ok, validatorProperties) {
    if (ok !== undefined && !ok) {
        const ErrorConstructor = validatorProperties.ErrorConstructor || ValidatorError;
        const err = new ErrorConstructor(validatorProperties);
        err[validatorErrorSymbol] = true;
        return err;
    }
}
/**
 * Performs a validation of `value` using the validators declared for this SchemaType.
 *
 * #### Note:
 *
 * This method ignores the asynchronous validators.
 *
 * @param {Any} value
 * @param {Object} scope
 * @param {Object} [options]
 * @param {Object} [options.path]
 * @return {MongooseError|null}
 * @api private
 */ SchemaType.prototype.doValidateSync = function(value, scope, options) {
    const path = this.path;
    const count = this.validators.length;
    if (!count) {
        return null;
    }
    let validators = this.validators;
    if (value === void 0) {
        if (this.validators.length !== 0 && this.validators[0].type === 'required') {
            validators = [
                this.validators[0]
            ];
        } else {
            return null;
        }
    }
    let err = null;
    let i = 0;
    const len = validators.length;
    for(i = 0; i < len; ++i){
        const v = validators[i];
        if (v === null || typeof v !== 'object') {
            continue;
        }
        const validator = v.validator;
        const validatorProperties = isSimpleValidator(v) ? Object.assign({}, v) : clone(v);
        validatorProperties.path = options && options.path ? options.path : path;
        validatorProperties.fullPath = this.$fullPath;
        validatorProperties.value = value;
        if (typeof value === 'string') {
            validatorProperties.length = value.length;
            if (validatorProperties.value.length > 30) {
                validatorProperties.value = validatorProperties.value.slice(0, 30) + '...';
            }
        }
        let ok = false;
        // Skip any explicit async validators. Validators that return a promise
        // will still run, but won't trigger any errors.
        if (isAsyncFunction(validator)) {
            continue;
        }
        if (validator instanceof RegExp) {
            err = _validate(validator.test(value), validatorProperties);
            continue;
        }
        if (typeof validator !== 'function') {
            continue;
        }
        try {
            if (validatorProperties.propsParameter) {
                ok = validator.call(scope, value, validatorProperties);
            } else {
                ok = validator.call(scope, value);
            }
        } catch (error) {
            ok = false;
            validatorProperties.reason = error;
        }
        // Skip any validators that return a promise, we can't handle those
        // synchronously
        if (ok != null && typeof ok.then === 'function') {
            continue;
        }
        err = _validate(ok, validatorProperties);
        if (err) {
            break;
        }
    }
    return err;
};
/**
 * Determines if value is a valid Reference.
 *
 * @param {SchemaType} self
 * @param {Object} value
 * @param {Document} doc
 * @param {Boolean} init
 * @return {Boolean}
 * @api private
 */ SchemaType._isRef = function(self, value, doc, init) {
    // fast path
    let ref = init && self.options && (self.options.ref || self.options.refPath);
    if (!ref && doc && doc.$__ != null) {
        // checks for
        // - this populated with adhoc model and no ref was set in schema OR
        // - setting / pushing values after population
        const path = doc.$__fullPath(self.path, true);
        const owner = doc.ownerDocument();
        ref = path != null && owner.$populated(path) || doc.$populated(self.path);
    }
    if (ref) {
        if (value == null) {
            return true;
        }
        if (!Buffer.isBuffer(value) && // buffers are objects too
        value._bsontype !== 'Binary' // raw binary value from the db
         && utils.isObject(value) // might have deselected _id in population query
        ) {
            return true;
        }
        return init;
    }
    return false;
};
/*!
 * ignore
 */ SchemaType.prototype._castRef = function _castRef(value, doc, init, options) {
    if (value == null) {
        return value;
    }
    if (value.$__ != null) {
        value.$__.wasPopulated = value.$__.wasPopulated || {
            value: value._doc._id
        };
        return value;
    }
    // setting a populated path
    if (Buffer.isBuffer(value) || !utils.isObject(value)) {
        if (init) {
            return value;
        }
        throw new CastError(this.instance, value, this.path, null, this);
    }
    // Handle the case where user directly sets a populated
    // path to a plain object; cast to the Model used in
    // the population query.
    const path = doc.$__fullPath(this.path, true);
    const owner = doc.ownerDocument();
    const pop = owner.$populated(path, true);
    let ret = value;
    if (!doc.$__.populated || !doc.$__.populated[path] || !doc.$__.populated[path].options || !doc.$__.populated[path].options.options || !doc.$__.populated[path].options.options.lean) {
        const PopulatedModel = pop ? pop.options[populateModelSymbol] : doc.constructor.db.model(this.options.ref);
        ret = PopulatedModel.hydrate(value, null, options);
        ret.$__.wasPopulated = {
            value: ret._doc._id,
            options: {
                [populateModelSymbol]: PopulatedModel
            }
        };
    }
    return ret;
};
/*!
 * ignore
 */ function handleSingle(val, context) {
    return this.castForQuery(null, val, context);
}
/*!
 * ignore
 */ function handleArray(val, context) {
    const _this = this;
    if (!Array.isArray(val)) {
        return [
            this.castForQuery(null, val, context)
        ];
    }
    return val.map(function(m) {
        return _this.castForQuery(null, m, context);
    });
}
/**
 * Just like handleArray, except also allows `[]` because surprisingly
 * `$in: [1, []]` works fine
 * @api private
 */ function handle$in(val, context) {
    const _this = this;
    if (!Array.isArray(val)) {
        return [
            this.castForQuery(null, val, context)
        ];
    }
    return val.map(function(m) {
        if (Array.isArray(m) && m.length === 0) {
            return m;
        }
        return _this.castForQuery(null, m, context);
    });
}
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$exists` is the function Mongoose calls to cast `$exists` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaType
 * @instance
 * @api public
 */ SchemaType.prototype.$conditionalHandlers = {
    $all: handleArray,
    $eq: handleSingle,
    $in: handle$in,
    $ne: handleSingle,
    $nin: handle$in,
    $exists: $exists,
    $type: $type
};
/**
 * Cast the given value with the given optional query operator.
 *
 * @param {String} [$conditional] query operator, like `$eq` or `$in`
 * @param {Any} val
 * @param {Query} context
 * @return {Any}
 * @api private
 */ SchemaType.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new Error('Can\'t use ' + $conditional);
        }
        return handler.call(this, val, context);
    }
    try {
        return this.applySetters(val, context);
    } catch (err) {
        if (err instanceof CastError && err.path === this.path && this.$fullPath != null) {
            err.path = this.$fullPath;
        }
        throw err;
    }
};
/**
 * Set & Get the `checkRequired` function
 * Override the function the required validator uses to check whether a value
 * passes the `required` check. Override this on the individual SchemaType.
 *
 * #### Example:
 *
 *     // Use this to allow empty strings to pass the `required` validator
 *     mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');
 *
 * @param {Function} [fn] If set, will overwrite the current set function
 * @return {Function} The input `fn` or the already set function
 * @static
 * @memberOf SchemaType
 * @function checkRequired
 * @api public
 */ SchemaType.checkRequired = function(fn) {
    if (arguments.length !== 0) {
        this._checkRequired = fn;
    }
    return this._checkRequired;
};
/**
 * Default check for if this path satisfies the `required` validator.
 *
 * @param {Any} val
 * @return {Boolean} `true` when the value is not `null`, `false` otherwise
 * @api private
 */ SchemaType.prototype.checkRequired = function(val) {
    return val != null;
};
/**
 * Clone the current SchemaType
 *
 * @return {SchemaType} The cloned SchemaType instance
 * @api private
 */ SchemaType.prototype.clone = function() {
    const options = Object.assign({}, this.options);
    const schematype = new this.constructor(this.path, options, this.instance, this.parentSchema);
    schematype.validators = this.validators.slice();
    if (this.requiredValidator !== undefined) schematype.requiredValidator = this.requiredValidator;
    if (this.defaultValue !== undefined) schematype.defaultValue = this.defaultValue;
    if (this.$immutable !== undefined && this.options.immutable === undefined) {
        schematype.$immutable = this.$immutable;
        handleImmutable(schematype);
    }
    if (this._index !== undefined) schematype._index = this._index;
    if (this.selected !== undefined) schematype.selected = this.selected;
    if (this.isRequired !== undefined) schematype.isRequired = this.isRequired;
    if (this.originalRequiredValue !== undefined) schematype.originalRequiredValue = this.originalRequiredValue;
    schematype.getters = this.getters.slice();
    schematype.setters = this.setters.slice();
    return schematype;
};
/**
 * Returns the embedded schema type, if any. For arrays, document arrays, and maps, `getEmbeddedSchemaType()`
 * returns the schema type of the array's elements (or map's elements). For other types, `getEmbeddedSchemaType()`
 * returns `undefined`.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String, tags: [String] });
 *     schema.path('name').getEmbeddedSchemaType(); // undefined
 *     schema.path('tags').getEmbeddedSchemaType(); // SchemaString { path: 'tags', ... }
 *
 * @returns {SchemaType} embedded schematype
 * @api public
 */ SchemaType.prototype.getEmbeddedSchemaType = function getEmbeddedSchemaType() {
    return this.$embeddedSchemaType;
};
/*!
 * If _duplicateKeyErrorMessage is a string, replace unique index errors "E11000 duplicate key error" with this string.
 *
 * @api private
 */ SchemaType.prototype._duplicateKeyErrorMessage = null;
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaType.prototype.toJSONSchema = function toJSONSchema(_options) {
    throw new Error(`Converting unsupported SchemaType to JSON Schema: ${this.instance} at path "${this.path}"`);
};
/**
 * Returns the BSON type that the schema corresponds to, for automatic encryption.
 * @api private
 */ SchemaType.prototype.autoEncryptionType = function autoEncryptionType() {
    return null;
};
/*!
 * Module exports.
 */ module.exports = exports = SchemaType;
exports.CastError = CastError;
exports.ValidatorError = ValidatorError;
}),
"[project]/backend/node_modules/mongoose/lib/virtualType.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const modelNamesFromRefPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/modelNamesFromRefPath.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const modelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").modelSymbol;
/**
 * VirtualType constructor
 *
 * This is what mongoose uses to define virtual attributes via `Schema.prototype.virtual`.
 *
 * #### Example:
 *
 *     const fullname = schema.virtual('fullname');
 *     fullname instanceof mongoose.VirtualType // true
 *
 * @param {Object} options
 * @param {String|Function} [options.ref] if `ref` is not nullish, this becomes a [populated virtual](https://mongoosejs.com/docs/populate.html#populate-virtuals)
 * @param {String|Function} [options.localField] the local field to populate on if this is a populated virtual.
 * @param {String|Function} [options.foreignField] the foreign field to populate on if this is a populated virtual.
 * @param {Boolean} [options.justOne=false] by default, a populated virtual is an array. If you set `justOne`, the populated virtual will be a single doc or `null`.
 * @param {Boolean} [options.getters=false] if you set this to `true`, Mongoose will call any custom getters you defined on this virtual
 * @param {Boolean} [options.count=false] if you set this to `true`, `populate()` will set this virtual to the number of populated documents, as opposed to the documents themselves, using [`Query#countDocuments()`](https://mongoosejs.com/docs/api/query.html#Query.prototype.countDocuments())
 * @param {Object|Function} [options.match=null] add an extra match condition to `populate()`
 * @param {Number} [options.limit=null] add a default `limit` to the `populate()` query
 * @param {Number} [options.skip=null] add a default `skip` to the `populate()` query
 * @param {Number} [options.perDocumentLimit=null] For legacy reasons, `limit` with `populate()` may give incorrect results because it only executes a single query for every document being populated. If you set `perDocumentLimit`, Mongoose will ensure correct `limit` per document by executing a separate query for each document to `populate()`. For example, `.find().populate({ path: 'test', perDocumentLimit: 2 })` will execute 2 additional queries if `.find()` returns 2 documents.
 * @param {Object} [options.options=null] Additional options like `limit` and `lean`.
 * @param {String} name
 * @api public
 */ function VirtualType(options, name) {
    this.path = name;
    this.getters = [];
    this.setters = [];
    this.options = Object.assign({}, options);
}
/**
 * If no getters/setters, add a default
 *
 * @api private
 */ VirtualType.prototype._applyDefaultGetters = function() {
    if (this.getters.length > 0 || this.setters.length > 0) {
        return;
    }
    const path = this.path;
    const internalProperty = '$' + path;
    this.getters.push(function() {
        return this.$locals[internalProperty];
    });
    this.setters.push(function(v) {
        this.$locals[internalProperty] = v;
    });
};
/*!
 * ignore
 */ VirtualType.prototype.clone = function() {
    const clone = new VirtualType(this.options, this.path);
    clone.getters = [].concat(this.getters);
    clone.setters = [].concat(this.setters);
    return clone;
};
/**
 * Adds a custom getter to this virtual.
 *
 * Mongoose calls the getter function with the below 3 parameters.
 *
 * - `value`: the value returned by the previous getter. If there is only one getter, `value` will be `undefined`.
 * - `virtual`: the virtual object you called `.get()` on.
 * - `doc`: the document this virtual is attached to. Equivalent to `this`.
 *
 * #### Example:
 *
 *     const virtual = schema.virtual('fullname');
 *     virtual.get(function(value, virtual, doc) {
 *       return this.name.first + ' ' + this.name.last;
 *     });
 *
 * @param {Function} fn
 * @return {VirtualType} this
 * @api public
 */ VirtualType.prototype.get = function(fn) {
    this.getters.push(fn);
    return this;
};
/**
 * Adds a custom setter to this virtual.
 *
 * Mongoose calls the setter function with the below 3 parameters.
 *
 * - `value`: the value being set.
 * - `virtual`: the virtual object you're calling `.set()` on.
 * - `doc`: the document this virtual is attached to. Equivalent to `this`.
 *
 * #### Example:
 *
 *     const virtual = schema.virtual('fullname');
 *     virtual.set(function(value, virtual, doc) {
 *       const parts = value.split(' ');
 *       this.name.first = parts[0];
 *       this.name.last = parts[1];
 *     });
 *
 *     const Model = mongoose.model('Test', schema);
 *     const doc = new Model();
 *     // Calls the setter with `value = 'Jean-Luc Picard'`
 *     doc.fullname = 'Jean-Luc Picard';
 *     doc.name.first; // 'Jean-Luc'
 *     doc.name.last; // 'Picard'
 *
 * @param {Function} fn
 * @return {VirtualType} this
 * @api public
 */ VirtualType.prototype.set = function(fn) {
    this.setters.push(fn);
    return this;
};
/**
 * Applies getters to `value`.
 *
 * @param {Object} value
 * @param {Document} doc The document this virtual is attached to
 * @return {Any} the value after applying all getters
 * @api public
 */ VirtualType.prototype.applyGetters = function(value, doc) {
    if (utils.hasUserDefinedProperty(this.options, [
        'ref',
        'refPath'
    ]) && doc.$$populatedVirtuals && doc.$$populatedVirtuals.hasOwnProperty(this.path)) {
        value = doc.$$populatedVirtuals[this.path];
    }
    let v = value;
    for (const getter of this.getters){
        v = getter.call(doc, v, this, doc);
    }
    return v;
};
/**
 * Applies setters to `value`.
 *
 * @param {Object} value
 * @param {Document} doc
 * @return {Any} the value after applying all setters
 * @api public
 */ VirtualType.prototype.applySetters = function(value, doc) {
    let v = value;
    for (const setter of this.setters){
        v = setter.call(doc, v, this, doc);
    }
    return v;
};
/**
 * Get the names of models used to populate this model given a doc
 *
 * @param {Document} doc
 * @return {Array<string> | null}
 * @api private
 */ VirtualType.prototype._getModelNamesForPopulate = function _getModelNamesForPopulate(doc) {
    if (this.options.refPath) {
        return modelNamesFromRefPath(this.options.refPath, doc, this.path);
    }
    let normalizedRef = null;
    if (typeof this.options.ref === 'function' && !this.options.ref[modelSymbol]) {
        normalizedRef = this.options.ref.call(doc, doc);
    } else {
        normalizedRef = this.options.ref;
    }
    if (normalizedRef != null && !Array.isArray(normalizedRef)) {
        return [
            normalizedRef
        ];
    }
    return normalizedRef;
};
/*!
 * exports
 */ module.exports = VirtualType;
}),
"[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
const Types = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/index.js [app-route] (ecmascript)");
const cast$expr = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/cast$expr.js [app-route] (ecmascript)");
const castString = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/string.js [app-route] (ecmascript)");
const castTextSearch = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/text.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getSchemaDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getSchemaDiscriminatorByValue.js [app-route] (ecmascript)");
const isOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/isOperator.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
const isMongooseObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isMongooseObject.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const ALLOWED_GEOWITHIN_GEOJSON_TYPES = [
    'Polygon',
    'MultiPolygon'
];
/**
 * Handles internal casting for query filters.
 *
 * @param {Schema} schema
 * @param {Object} obj Object to cast
 * @param {Object} [options] the query options
 * @param {Boolean|"throw"} [options.strict] Wheter to enable all strict options
 * @param {Boolean|"throw"} [options.strictQuery] Enable strict Queries
 * @param {Boolean} [options.sanitizeFilter] avoid adding implict query selectors ($in)
 * @param {Boolean} [options.upsert]
 * @param {Query} [context] passed to setters
 * @api private
 */ module.exports = function cast(schema, obj, options, context) {
    if (Array.isArray(obj)) {
        throw new Error('Query filter must be an object, got an array ', util.inspect(obj));
    }
    if (obj == null) {
        return obj;
    }
    if (schema != null && schema.discriminators != null && obj[schema.options.discriminatorKey] != null) {
        schema = getSchemaDiscriminatorByValue(schema, obj[schema.options.discriminatorKey]) || schema;
    }
    const paths = Object.keys(obj);
    let i = paths.length;
    let _keys;
    let any$conditionals;
    let schematype;
    let nested;
    let path;
    let type;
    let val;
    options = options || {};
    while(i--){
        path = paths[i];
        val = obj[path];
        if (path === '$or' || path === '$nor' || path === '$and') {
            if (!Array.isArray(val)) {
                throw new CastError('Array', val, path);
            }
            for(let k = val.length - 1; k >= 0; k--){
                if (val[k] == null || typeof val[k] !== 'object') {
                    throw new CastError('Object', val[k], path + '.' + k);
                }
                const beforeCastKeysLength = Object.keys(val[k]).length;
                const discriminatorValue = val[k][schema.options.discriminatorKey];
                if (discriminatorValue == null) {
                    val[k] = cast(schema, val[k], options, context);
                } else {
                    const discriminatorSchema = getSchemaDiscriminatorByValue(context.schema, discriminatorValue);
                    val[k] = cast(discriminatorSchema ? discriminatorSchema : schema, val[k], options, context);
                }
                if (Object.keys(val[k]).length === 0 && beforeCastKeysLength !== 0) {
                    val.splice(k, 1);
                }
            }
            // delete empty: {$or: []} -> {}
            if (val.length === 0) {
                delete obj[path];
            }
        } else if (path === '$where') {
            type = typeof val;
            if (type !== 'string' && type !== 'function') {
                throw new Error('Must have a string or function for $where');
            }
            if (type === 'function') {
                obj[path] = val.toString();
            }
            continue;
        } else if (path === '$expr') {
            val = cast$expr(val, schema);
            continue;
        } else if (path === '$elemMatch') {
            val = cast(schema, val, options, context);
        } else if (path === '$text') {
            val = castTextSearch(val, path);
        } else if (path === '$comment' && !schema.paths.hasOwnProperty('$comment')) {
            val = castString(val, path);
            obj[path] = val;
        } else {
            if (!schema) {
                continue;
            }
            schematype = schema.path(path);
            // Check for embedded discriminator paths
            if (!schematype) {
                const split = path.split('.');
                let j = split.length;
                while(j--){
                    const pathFirstHalf = split.slice(0, j).join('.');
                    const pathLastHalf = split.slice(j).join('.');
                    const _schematype = schema.path(pathFirstHalf);
                    const discriminatorKey = _schematype && _schematype.schema && _schematype.schema.options && _schematype.schema.options.discriminatorKey;
                    // gh-6027: if we haven't found the schematype but this path is
                    // underneath an embedded discriminator and the embedded discriminator
                    // key is in the query, use the embedded discriminator schema
                    if (_schematype != null && (_schematype.schema && _schematype.schema.discriminators) != null && discriminatorKey != null && pathLastHalf !== discriminatorKey) {
                        const discriminatorVal = get(obj, pathFirstHalf + '.' + discriminatorKey);
                        const discriminators = _schematype.schema.discriminators;
                        if (typeof discriminatorVal === 'string' && discriminators[discriminatorVal] != null) {
                            schematype = discriminators[discriminatorVal].path(pathLastHalf);
                        } else if (discriminatorVal != null && Object.keys(discriminatorVal).length === 1 && Array.isArray(discriminatorVal.$in) && discriminatorVal.$in.length === 1 && typeof discriminatorVal.$in[0] === 'string' && discriminators[discriminatorVal.$in[0]] != null) {
                            schematype = discriminators[discriminatorVal.$in[0]].path(pathLastHalf);
                        }
                    }
                }
            }
            if (!schematype) {
                // Handle potential embedded array queries
                const split = path.split('.');
                let j = split.length;
                let pathFirstHalf;
                let pathLastHalf;
                let remainingConds;
                // Find the part of the var path that is a path of the Schema
                while(j--){
                    pathFirstHalf = split.slice(0, j).join('.');
                    schematype = schema.path(pathFirstHalf);
                    if (schematype) {
                        break;
                    }
                }
                // If a substring of the input path resolves to an actual real path...
                if (schematype) {
                    // Apply the casting; similar code for $elemMatch in schema/array.js
                    if (schematype.caster && schematype.caster.schema) {
                        remainingConds = {};
                        pathLastHalf = split.slice(j).join('.');
                        remainingConds[pathLastHalf] = val;
                        const ret = cast(schematype.caster.schema, remainingConds, options, context)[pathLastHalf];
                        if (ret === void 0) {
                            delete obj[path];
                        } else {
                            obj[path] = ret;
                        }
                    } else {
                        obj[path] = val;
                    }
                    continue;
                }
                if (isObject(val)) {
                    // handle geo schemas that use object notation
                    // { loc: { long: Number, lat: Number }
                    let geo = '';
                    if (val.$near) {
                        geo = '$near';
                    } else if (val.$nearSphere) {
                        geo = '$nearSphere';
                    } else if (val.$within) {
                        geo = '$within';
                    } else if (val.$geoIntersects) {
                        geo = '$geoIntersects';
                    } else if (val.$geoWithin) {
                        geo = '$geoWithin';
                    }
                    if (geo) {
                        const numbertype = new Types.Number('__QueryCasting__', null, null, schema);
                        let value = val[geo];
                        if (val.$maxDistance != null) {
                            val.$maxDistance = numbertype.castForQuery(null, val.$maxDistance, context);
                        }
                        if (val.$minDistance != null) {
                            val.$minDistance = numbertype.castForQuery(null, val.$minDistance, context);
                        }
                        if (geo === '$within') {
                            const withinType = value.$center || value.$centerSphere || value.$box || value.$polygon;
                            if (!withinType) {
                                throw new Error('Bad $within parameter: ' + JSON.stringify(val));
                            }
                            value = withinType;
                        } else if (geo === '$near' && typeof value.type === 'string' && Array.isArray(value.coordinates)) {
                            // geojson; cast the coordinates
                            value = value.coordinates;
                        } else if ((geo === '$near' || geo === '$nearSphere' || geo === '$geoIntersects') && value.$geometry && typeof value.$geometry.type === 'string' && Array.isArray(value.$geometry.coordinates)) {
                            if (value.$maxDistance != null) {
                                value.$maxDistance = numbertype.castForQuery(null, value.$maxDistance, context);
                            }
                            if (value.$minDistance != null) {
                                value.$minDistance = numbertype.castForQuery(null, value.$minDistance, context);
                            }
                            if (isMongooseObject(value.$geometry)) {
                                value.$geometry = value.$geometry.toObject({
                                    transform: false,
                                    virtuals: false
                                });
                            }
                            value = value.$geometry.coordinates;
                        } else if (geo === '$geoWithin') {
                            if (value.$geometry) {
                                if (isMongooseObject(value.$geometry)) {
                                    value.$geometry = value.$geometry.toObject({
                                        virtuals: false
                                    });
                                }
                                const geoWithinType = value.$geometry.type;
                                if (ALLOWED_GEOWITHIN_GEOJSON_TYPES.indexOf(geoWithinType) === -1) {
                                    throw new Error('Invalid geoJSON type for $geoWithin "' + geoWithinType + '", must be "Polygon" or "MultiPolygon"');
                                }
                                value = value.$geometry.coordinates;
                            } else {
                                value = value.$box || value.$polygon || value.$center || value.$centerSphere;
                                if (isMongooseObject(value)) {
                                    value = value.toObject({
                                        virtuals: false
                                    });
                                }
                            }
                        }
                        _cast(value, numbertype, context);
                        continue;
                    }
                }
                if (schema.nested[path]) {
                    continue;
                }
                const strict = 'strict' in options ? options.strict : schema.options.strict;
                const strictQuery = getStrictQuery(options, schema._userProvidedOptions, schema.options, context);
                if (options.upsert && strict) {
                    if (strict === 'throw') {
                        throw new StrictModeError(path);
                    }
                    throw new StrictModeError(path, 'Path "' + path + '" is not in ' + 'schema, strict mode is `true`, and upsert is `true`.');
                }
                if (strictQuery === 'throw') {
                    throw new StrictModeError(path, 'Path "' + path + '" is not in ' + 'schema and strictQuery is \'throw\'.');
                } else if (strictQuery) {
                    delete obj[path];
                }
            } else if (val == null) {
                continue;
            } else if (utils.isPOJO(val)) {
                any$conditionals = Object.keys(val).some(isOperator);
                if (!any$conditionals) {
                    obj[path] = schematype.castForQuery(null, val, context);
                } else {
                    const ks = Object.keys(val);
                    let $cond;
                    let k = ks.length;
                    while(k--){
                        $cond = ks[k];
                        nested = val[$cond];
                        if ($cond === '$elemMatch') {
                            if (nested && schematype != null && schematype.schema != null) {
                                cast(schematype.schema, nested, options, context);
                            } else if (nested && schematype != null && schematype.$isMongooseArray) {
                                if (utils.isPOJO(nested) && nested.$not != null) {
                                    cast(schema, nested, options, context);
                                } else {
                                    val[$cond] = schematype.castForQuery($cond, nested, context);
                                }
                            }
                        } else if ($cond === '$not') {
                            if (nested && schematype) {
                                _keys = Object.keys(nested);
                                if (_keys.length && isOperator(_keys[0])) {
                                    for(const key in nested){
                                        nested[key] = schematype.castForQuery(key, nested[key], context);
                                    }
                                } else {
                                    val[$cond] = schematype.castForQuery($cond, nested, context);
                                }
                                continue;
                            }
                        } else {
                            val[$cond] = schematype.castForQuery($cond, nested, context);
                        }
                    }
                }
            } else if (Array.isArray(val) && [
                'Buffer',
                'Array'
            ].indexOf(schematype.instance) === -1 && !options.sanitizeFilter) {
                const casted = [];
                const valuesArray = val;
                for (const _val of valuesArray){
                    casted.push(schematype.castForQuery(null, _val, context));
                }
                obj[path] = {
                    $in: casted
                };
            } else {
                obj[path] = schematype.castForQuery(null, val, context);
            }
        }
    }
    return obj;
};
function _cast(val, numbertype, context) {
    if (Array.isArray(val)) {
        val.forEach(function(item, i) {
            if (Array.isArray(item) || isObject(item)) {
                return _cast(item, numbertype, context);
            }
            val[i] = numbertype.castForQuery(null, item, context);
        });
    } else {
        const nearKeys = Object.keys(val);
        let nearLen = nearKeys.length;
        while(nearLen--){
            const nkey = nearKeys[nearLen];
            const item = val[nkey];
            if (Array.isArray(item) || isObject(item)) {
                _cast(item, numbertype, context);
                val[nkey] = item;
            } else {
                val[nkey] = numbertype.castForQuery({
                    val: item,
                    context: context
                });
            }
        }
    }
}
function getStrictQuery(queryOptions, schemaUserProvidedOptions, schemaOptions, context) {
    if ('strictQuery' in queryOptions) {
        return queryOptions.strictQuery;
    }
    if ('strictQuery' in schemaUserProvidedOptions) {
        return schemaUserProvidedOptions.strictQuery;
    }
    const mongooseOptions = context && context.mongooseCollection && context.mongooseCollection.conn && context.mongooseCollection.conn.base && context.mongooseCollection.conn.base.options;
    if (mongooseOptions) {
        if ('strictQuery' in mongooseOptions) {
            return mongooseOptions.strictQuery;
        }
    }
    return schemaOptions.strictQuery;
}
}),
"[project]/backend/node_modules/mongoose/lib/plugins/saveSubdocs.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const each = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/each.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function saveSubdocs(schema) {
    const unshift = true;
    schema.s.hooks.pre('save', false, function saveSubdocsPreSave(next) {
        if (this.$isSubdocument) {
            next();
            return;
        }
        const _this = this;
        const subdocs = this.$getAllSubdocs({
            useCache: true
        });
        if (!subdocs.length) {
            next();
            return;
        }
        each(subdocs, function(subdoc, cb) {
            subdoc.$__schema.s.hooks.execPre('save', subdoc, function(err) {
                cb(err);
            });
        }, function(error) {
            // Invalidate subdocs cache because subdoc pre hooks can add new subdocuments
            if (_this.$__.saveOptions) {
                _this.$__.saveOptions.__subdocs = null;
            }
            if (error) {
                return _this.$__schema.s.hooks.execPost('save:error', _this, [
                    _this
                ], {
                    error: error
                }, function(error) {
                    next(error);
                });
            }
            next();
        });
    }, null, unshift);
    schema.s.hooks.post('save', async function saveSubdocsPostDeleteOne() {
        const removedSubdocs = this.$__.removedSubdocs;
        if (!removedSubdocs || !removedSubdocs.length) {
            return;
        }
        const promises = [];
        for (const subdoc of removedSubdocs){
            promises.push(new Promise((resolve, reject)=>{
                subdoc.$__schema.s.hooks.execPost('deleteOne', subdoc, [
                    subdoc
                ], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }));
        }
        this.$__.removedSubdocs = null;
        await Promise.all(promises);
    });
    schema.s.hooks.post('save', async function saveSubdocsPostSave() {
        if (this.$isSubdocument) {
            return;
        }
        const _this = this;
        const subdocs = this.$getAllSubdocs({
            useCache: true
        });
        if (!subdocs.length) {
            return;
        }
        const promises = [];
        for (const subdoc of subdocs){
            promises.push(new Promise((resolve, reject)=>{
                subdoc.$__schema.s.hooks.execPost('save', subdoc, [
                    subdoc
                ], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }));
        }
        try {
            await Promise.all(promises);
        } catch (error) {
            await new Promise((resolve, reject)=>{
                this.$__schema.s.hooks.execPost('save:error', _this, [
                    _this
                ], {
                    error: error
                }, function(error) {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            });
        }
    }, null, unshift);
};
}),
"[project]/backend/node_modules/mongoose/lib/plugins/sharding.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const objectIdSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").objectIdSymbol;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function shardingPlugin(schema) {
    schema.post('init', function shardingPluginPostInit() {
        storeShard.call(this);
        return this;
    });
    schema.pre('save', function shardingPluginPreSave(next) {
        applyWhere.call(this);
        next();
    });
    schema.pre('deleteOne', {
        document: true,
        query: false
    }, function shardingPluginPreRemove(next) {
        applyWhere.call(this);
        next();
    });
    schema.post('save', function shardingPluginPostSave() {
        storeShard.call(this);
    });
};
/*!
 * ignore
 */ function applyWhere() {
    let paths;
    let len;
    if (this.$__.shardval) {
        paths = Object.keys(this.$__.shardval);
        len = paths.length;
        this.$where = this.$where || {};
        for(let i = 0; i < len; ++i){
            this.$where[paths[i]] = this.$__.shardval[paths[i]];
        }
    }
}
/*!
 * ignore
 */ module.exports.storeShard = storeShard;
/*!
 * ignore
 */ function storeShard() {
    // backwards compat
    const key = this.$__schema.options.shardKey || this.$__schema.options.shardkey;
    if (!utils.isPOJO(key)) {
        return;
    }
    const orig = this.$__.shardval = {};
    const paths = Object.keys(key);
    const len = paths.length;
    let val;
    for(let i = 0; i < len; ++i){
        val = this.$__getValue(paths[i]);
        if (val == null) {
            orig[paths[i]] = val;
        } else if (utils.isMongooseObject(val)) {
            orig[paths[i]] = val.toObject({
                depopulate: true,
                _isNested: true
            });
        } else if (val instanceof Date || val[objectIdSymbol]) {
            orig[paths[i]] = val;
        } else if (typeof val.valueOf === 'function') {
            orig[paths[i]] = val.valueOf();
        } else {
            orig[paths[i]] = val;
        }
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/plugins/trackTransaction.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const sessionNewDocuments = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").sessionNewDocuments;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
module.exports = function trackTransaction(schema) {
    schema.pre('save', function trackTransactionPreSave() {
        const session = this.$session();
        if (session == null) {
            return;
        }
        if (session.transaction == null || session[sessionNewDocuments] == null) {
            return;
        }
        if (!session[sessionNewDocuments].has(this)) {
            const initialState = {};
            if (this.isNew) {
                initialState.isNew = true;
            }
            if (this.$__schema.options.versionKey) {
                initialState.versionKey = this.get(this.$__schema.options.versionKey);
            }
            initialState.modifiedPaths = new Set(Object.keys(this.$__.activePaths.getStatePaths('modify')));
            initialState.atomics = _getAtomics(this);
            session[sessionNewDocuments].set(this, initialState);
        }
    });
};
function _getAtomics(doc, previous) {
    const pathToAtomics = new Map();
    previous = previous || new Map();
    const pathsToCheck = Object.keys(doc.$__.activePaths.init).concat(Object.keys(doc.$__.activePaths.modify));
    for (const path of pathsToCheck){
        const val = doc.$__getValue(path);
        if (val != null && Array.isArray(val) && utils.isMongooseDocumentArray(val) && val.length && val[arrayAtomicsSymbol] != null && Object.keys(val[arrayAtomicsSymbol]).length !== 0) {
            const existing = previous.get(path) || {};
            pathToAtomics.set(path, mergeAtomics(existing, val[arrayAtomicsSymbol]));
        }
    }
    const dirty = doc.$__dirty();
    for (const dirt of dirty){
        const path = dirt.path;
        const val = dirt.value;
        if (val != null && val[arrayAtomicsSymbol] != null && Object.keys(val[arrayAtomicsSymbol]).length !== 0) {
            const existing = previous.get(path) || {};
            pathToAtomics.set(path, mergeAtomics(existing, val[arrayAtomicsSymbol]));
        }
    }
    return pathToAtomics;
}
function mergeAtomics(destination, source) {
    destination = destination || {};
    if (source.$pullAll != null) {
        destination.$pullAll = (destination.$pullAll || []).concat(source.$pullAll);
    }
    if (source.$push != null) {
        destination.$push = destination.$push || {};
        destination.$push.$each = (destination.$push.$each || []).concat(source.$push.$each);
    }
    if (source.$addToSet != null) {
        destination.$addToSet = (destination.$addToSet || []).concat(source.$addToSet);
    }
    if (source.$set != null) {
        destination.$set = Array.isArray(source.$set) ? [
            ...source.$set
        ] : Object.assign({}, source.$set);
    }
    return destination;
}
}),
"[project]/backend/node_modules/mongoose/lib/plugins/validateBeforeSave.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function validateBeforeSave(schema) {
    const unshift = true;
    schema.pre('save', false, function validateBeforeSave(next, options) {
        const _this = this;
        // Nested docs have their own presave
        if (this.$isSubdocument) {
            return next();
        }
        const hasValidateBeforeSaveOption = options && typeof options === 'object' && 'validateBeforeSave' in options;
        let shouldValidate;
        if (hasValidateBeforeSaveOption) {
            shouldValidate = !!options.validateBeforeSave;
        } else {
            shouldValidate = this.$__schema.options.validateBeforeSave;
        }
        // Validate
        if (shouldValidate) {
            const hasValidateModifiedOnlyOption = options && typeof options === 'object' && 'validateModifiedOnly' in options;
            const validateOptions = hasValidateModifiedOnlyOption ? {
                validateModifiedOnly: options.validateModifiedOnly
            } : null;
            this.$validate(validateOptions).then(()=>{
                this.$op = 'save';
                next();
            }, (error)=>{
                _this.$__schema.s.hooks.execPost('save:error', _this, [
                    _this
                ], {
                    error: error
                }, function(error) {
                    _this.$op = 'save';
                    next(error);
                });
            });
        } else {
            next();
        }
    }, null, unshift);
};
}),
"[project]/backend/node_modules/mongoose/lib/plugins/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.saveSubdocs = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/saveSubdocs.js [app-route] (ecmascript)");
exports.sharding = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/sharding.js [app-route] (ecmascript)");
exports.trackTransaction = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/trackTransaction.js [app-route] (ecmascript)");
exports.validateBeforeSave = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/validateBeforeSave.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/mongoose/lib/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ const queryOperations = Object.freeze([
    // Read
    'countDocuments',
    'distinct',
    'estimatedDocumentCount',
    'find',
    'findOne',
    // Update
    'findOneAndReplace',
    'findOneAndUpdate',
    'replaceOne',
    'updateMany',
    'updateOne',
    // Delete
    'deleteMany',
    'deleteOne',
    'findOneAndDelete'
]);
exports.queryOperations = queryOperations;
/*!
 * ignore
 */ const queryMiddlewareFunctions = queryOperations.concat([
    'validate'
]);
exports.queryMiddlewareFunctions = queryMiddlewareFunctions;
/*!
 * ignore
 */ const aggregateMiddlewareFunctions = [
    'aggregate'
];
exports.aggregateMiddlewareFunctions = aggregateMiddlewareFunctions;
/*!
 * ignore
 */ const modelMiddlewareFunctions = [
    'bulkWrite',
    'createCollection',
    'insertMany'
];
exports.modelMiddlewareFunctions = modelMiddlewareFunctions;
/*!
 * ignore
 */ const documentMiddlewareFunctions = [
    'validate',
    'save',
    'remove',
    'updateOne',
    'deleteOne',
    'init'
];
exports.documentMiddlewareFunctions = documentMiddlewareFunctions;
}),
"[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const Kareem = __turbopack_context__.r("[project]/backend/node_modules/kareem/index.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
const VirtualOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/virtualOptions.js [app-route] (ecmascript)");
const VirtualType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/virtualType.js [app-route] (ecmascript)");
const addAutoId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/addAutoId.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const getIndexes = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/getIndexes.js [app-route] (ecmascript)");
const handleReadPreferenceAliases = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/handleReadPreferenceAliases.js [app-route] (ecmascript)");
const idGetter = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/idGetter.js [app-route] (ecmascript)");
const isIndexSpecEqual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/indexes/isIndexSpecEqual.js [app-route] (ecmascript)");
const merge = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/merge.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const setPopulatedVirtualValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/setPopulatedVirtualValue.js [app-route] (ecmascript)");
const setupTimestamps = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/timestamps/setupTimestamps.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const validateRef = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/validateRef.js [app-route] (ecmascript)");
const hasNumericSubpathRegex = /\.\d+(\.|$)/;
let MongooseTypes;
const queryHooks = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/constants.js [app-route] (ecmascript)").queryMiddlewareFunctions;
const documentHooks = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/applyHooks.js [app-route] (ecmascript)").middlewareFunctions;
const hookNames = queryHooks.concat(documentHooks).reduce((s, hook)=>s.add(hook), new Set());
const isPOJO = utils.isPOJO;
let id = 0;
const numberRE = /^\d+$/;
/**
 * Schema constructor.
 *
 * #### Example:
 *
 *     const child = new Schema({ name: String });
 *     const schema = new Schema({ name: String, age: Number, children: [child] });
 *     const Tree = mongoose.model('Tree', schema);
 *
 *     // setting schema options
 *     new Schema({ name: String }, { id: false, autoIndex: false })
 *
 * #### Options:
 *
 * - [autoIndex](https://mongoosejs.com/docs/guide.html#autoIndex): bool - defaults to null (which means use the connection's autoIndex option)
 * - [autoCreate](https://mongoosejs.com/docs/guide.html#autoCreate): bool - defaults to null (which means use the connection's autoCreate option)
 * - [bufferCommands](https://mongoosejs.com/docs/guide.html#bufferCommands): bool - defaults to true
 * - [bufferTimeoutMS](https://mongoosejs.com/docs/guide.html#bufferTimeoutMS): number - defaults to 10000 (10 seconds). If `bufferCommands` is enabled, the amount of time Mongoose will wait for connectivity to be restablished before erroring out.
 * - [capped](https://mongoosejs.com/docs/guide.html#capped): bool | number | object - defaults to false
 * - [collection](https://mongoosejs.com/docs/guide.html#collection): string - no default
 * - [discriminatorKey](https://mongoosejs.com/docs/guide.html#discriminatorKey): string - defaults to `__t`
 * - [id](https://mongoosejs.com/docs/guide.html#id): bool - defaults to true
 * - [_id](https://mongoosejs.com/docs/guide.html#_id): bool - defaults to true
 * - [minimize](https://mongoosejs.com/docs/guide.html#minimize): bool - controls [document#toObject](https://mongoosejs.com/docs/api/document.html#Document.prototype.toObject()) behavior when called manually - defaults to true
 * - [read](https://mongoosejs.com/docs/guide.html#read): string
 * - [readConcern](https://mongoosejs.com/docs/guide.html#readConcern): object - defaults to null, use to set a default [read concern](https://www.mongodb.com/docs/manual/reference/read-concern/) for all queries.
 * - [writeConcern](https://mongoosejs.com/docs/guide.html#writeConcern): object - defaults to null, use to override [the MongoDB server's default write concern settings](https://www.mongodb.com/docs/manual/reference/write-concern/)
 * - [shardKey](https://mongoosejs.com/docs/guide.html#shardKey): object - defaults to `null`
 * - [strict](https://mongoosejs.com/docs/guide.html#strict): bool - defaults to true
 * - [strictQuery](https://mongoosejs.com/docs/guide.html#strictQuery): bool - defaults to false
 * - [toJSON](https://mongoosejs.com/docs/guide.html#toJSON) - object - no default
 * - [toObject](https://mongoosejs.com/docs/guide.html#toObject) - object - no default
 * - [typeKey](https://mongoosejs.com/docs/guide.html#typeKey) - string - defaults to 'type'
 * - [validateBeforeSave](https://mongoosejs.com/docs/guide.html#validateBeforeSave) - bool - defaults to `true`
 * - [validateModifiedOnly](https://mongoosejs.com/docs/api/document.html#Document.prototype.validate()) - bool - defaults to `false`
 * - [versionKey](https://mongoosejs.com/docs/guide.html#versionKey): string or object - defaults to "__v"
 * - [optimisticConcurrency](https://mongoosejs.com/docs/guide.html#optimisticConcurrency): bool or string[] or { exclude: string[] } - defaults to false. Set to true to enable [optimistic concurrency](https://thecodebarbarian.com/whats-new-in-mongoose-5-10-optimistic-concurrency.html). Set to string array to enable optimistic concurrency for only certain fields, or `{ exclude: string[] }` to define a list of fields to ignore for optimistic concurrency.
 * - [collation](https://mongoosejs.com/docs/guide.html#collation): object - defaults to null (which means use no collation)
 * - [timeseries](https://mongoosejs.com/docs/guide.html#timeseries): object - defaults to null (which means this schema's collection won't be a timeseries collection)
 * - [selectPopulatedPaths](https://mongoosejs.com/docs/guide.html#selectPopulatedPaths): boolean - defaults to `true`
 * - [skipVersioning](https://mongoosejs.com/docs/guide.html#skipVersioning): object - paths to exclude from versioning
 * - [timestamps](https://mongoosejs.com/docs/guide.html#timestamps): object or boolean - defaults to `false`. If true, Mongoose adds `createdAt` and `updatedAt` properties to your schema and manages those properties for you.
 * - [pluginTags](https://mongoosejs.com/docs/guide.html#pluginTags): array of strings - defaults to `undefined`. If set and plugin called with `tags` option, will only apply that plugin to schemas with a matching tag.
 * - [virtuals](https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-via-schema-options): object - virtuals to define, alias for [`.virtual`](https://mongoosejs.com/docs/api/schema.html#Schema.prototype.virtual())
 * - [collectionOptions]: object with options passed to [`createCollection()`](https://www.mongodb.com/docs/manual/reference/method/db.createCollection/) when calling `Model.createCollection()` or `autoCreate` set to true.
 * - [encryptionType]: the encryption type for the schema.  Valid options are `csfle` or `queryableEncryption`.  See https://mongoosejs.com/docs/field-level-encryption.
 *
 * #### Options for Nested Schemas:
 *
 * - `excludeIndexes`: bool - defaults to `false`. If `true`, skip building indexes on this schema's paths.
 *
 * #### Note:
 *
 * _When nesting schemas, (`children` in the example above), always declare the child schema first before passing it into its parent._
 *
 * @param {Object|Schema|Array} [definition] Can be one of: object describing schema paths, or schema to copy, or array of objects and schemas
 * @param {Object} [options]
 * @inherits NodeJS EventEmitter https://nodejs.org/api/events.html#class-eventemitter
 * @event `init`: Emitted after the schema is compiled into a `Model`.
 * @api public
 */ function Schema(obj, options) {
    if (!(this instanceof Schema)) {
        return new Schema(obj, options);
    }
    this.obj = obj;
    this.paths = {};
    this.aliases = {};
    this.subpaths = {};
    this.virtuals = {};
    this.singleNestedPaths = {};
    this.nested = {};
    this.inherits = {};
    this.callQueue = [];
    this._indexes = [];
    this._searchIndexes = [];
    this.methods = options && options.methods || {};
    this.methodOptions = {};
    this.statics = options && options.statics || {};
    this.tree = {};
    this.query = options && options.query || {};
    this.childSchemas = [];
    this.plugins = [];
    // For internal debugging. Do not use this to try to save a schema in MDB.
    this.$id = ++id;
    this.mapPaths = [];
    this.encryptedFields = {};
    this.s = {
        hooks: new Kareem()
    };
    this.options = this.defaultOptions(options);
    // build paths
    if (Array.isArray(obj)) {
        for (const definition of obj){
            this.add(definition);
        }
    } else if (obj) {
        this.add(obj);
    }
    // build virtual paths
    if (options && options.virtuals) {
        const virtuals = options.virtuals;
        const pathNames = Object.keys(virtuals);
        for (const pathName of pathNames){
            const pathOptions = virtuals[pathName].options ? virtuals[pathName].options : undefined;
            const virtual = this.virtual(pathName, pathOptions);
            if (virtuals[pathName].get) {
                virtual.get(virtuals[pathName].get);
            }
            if (virtuals[pathName].set) {
                virtual.set(virtuals[pathName].set);
            }
        }
    }
    // check if _id's value is a subdocument (gh-2276)
    const _idSubDoc = obj && obj._id && utils.isObject(obj._id);
    // ensure the documents get an auto _id unless disabled
    const auto_id = !this.paths['_id'] && this.options._id && !_idSubDoc;
    if (auto_id) {
        addAutoId(this);
    }
    this.setupTimestamp(this.options.timestamps);
}
/**
 * Create virtual properties with alias field
 * @api private
 */ function aliasFields(schema, paths) {
    for (const path of Object.keys(paths)){
        let alias = null;
        if (paths[path] != null) {
            alias = paths[path];
        } else {
            const options = get(schema.paths[path], 'options');
            if (options == null) {
                continue;
            }
            alias = options.alias;
        }
        if (!alias) {
            continue;
        }
        const prop = schema.paths[path].path;
        if (Array.isArray(alias)) {
            for (const a of alias){
                if (typeof a !== 'string') {
                    throw new Error('Invalid value for alias option on ' + prop + ', got ' + a);
                }
                schema.aliases[a] = prop;
                schema.virtual(a).get(function(p) {
                    return function() {
                        if (typeof this.get === 'function') {
                            return this.get(p);
                        }
                        return this[p];
                    };
                }(prop)).set(function(p) {
                    return function(v) {
                        return this.$set(p, v);
                    };
                }(prop));
            }
            continue;
        }
        if (typeof alias !== 'string') {
            throw new Error('Invalid value for alias option on ' + prop + ', got ' + alias);
        }
        schema.aliases[alias] = prop;
        schema.virtual(alias).get(function(p) {
            return function() {
                if (typeof this.get === 'function') {
                    return this.get(p);
                }
                return this[p];
            };
        }(prop)).set(function(p) {
            return function(v) {
                return this.$set(p, v);
            };
        }(prop));
    }
}
/*!
 * Inherit from EventEmitter.
 */ Schema.prototype = Object.create(EventEmitter.prototype);
Schema.prototype.constructor = Schema;
Schema.prototype.instanceOfSchema = true;
/*!
 * ignore
 */ Object.defineProperty(Schema.prototype, '$schemaType', {
    configurable: false,
    enumerable: false,
    writable: true
});
/**
 * Array of child schemas (from document arrays and single nested subdocs)
 * and their corresponding compiled models. Each element of the array is
 * an object with 2 properties: `schema` and `model`.
 *
 * This property is typically only useful for plugin authors and advanced users.
 * You do not need to interact with this property at all to use mongoose.
 *
 * @api public
 * @property childSchemas
 * @memberOf Schema
 * @instance
 */ Object.defineProperty(Schema.prototype, 'childSchemas', {
    configurable: false,
    enumerable: true,
    writable: true
});
/**
 * Object containing all virtuals defined on this schema.
 * The objects' keys are the virtual paths and values are instances of `VirtualType`.
 *
 * This property is typically only useful for plugin authors and advanced users.
 * You do not need to interact with this property at all to use mongoose.
 *
 * #### Example:
 *
 *     const schema = new Schema({});
 *     schema.virtual('answer').get(() => 42);
 *
 *     console.log(schema.virtuals); // { answer: VirtualType { path: 'answer', ... } }
 *     console.log(schema.virtuals['answer'].getters[0].call()); // 42
 *
 * @api public
 * @property virtuals
 * @memberOf Schema
 * @instance
 */ Object.defineProperty(Schema.prototype, 'virtuals', {
    configurable: false,
    enumerable: true,
    writable: true
});
/**
 * The original object passed to the schema constructor
 *
 * #### Example:
 *
 *     const schema = new Schema({ a: String }).add({ b: String });
 *     schema.obj; // { a: String }
 *
 * @api public
 * @property obj
 * @memberOf Schema
 * @instance
 */ Schema.prototype.obj;
/**
 * The paths defined on this schema. The keys are the top-level paths
 * in this schema, and the values are instances of the SchemaType class.
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String }, { _id: false });
 *     schema.paths; // { name: SchemaString { ... } }
 *
 *     schema.add({ age: Number });
 *     schema.paths; // { name: SchemaString { ... }, age: SchemaNumber { ... } }
 *
 * @api public
 * @property paths
 * @memberOf Schema
 * @instance
 */ Schema.prototype.paths;
/**
 * Schema as a tree
 *
 * #### Example:
 *
 *     {
 *         '_id'     : ObjectId
 *       , 'nested'  : {
 *             'key' : String
 *         }
 *     }
 *
 * @api private
 * @property tree
 * @memberOf Schema
 * @instance
 */ Schema.prototype.tree;
/**
 * Returns a deep copy of the schema
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String });
 *     const clone = schema.clone();
 *     clone === schema; // false
 *     clone.path('name'); // SchemaString { ... }
 *
 * @return {Schema} the cloned schema
 * @api public
 * @memberOf Schema
 * @instance
 */ Schema.prototype.clone = function() {
    const s = this._clone();
    // Bubble up `init` for backwards compat
    s.on('init', (v)=>this.emit('init', v));
    return s;
};
/*!
 * ignore
 */ Schema.prototype._clone = function _clone(Constructor) {
    Constructor = Constructor || (this.base == null ? Schema : this.base.Schema);
    const s = new Constructor({}, this._userProvidedOptions);
    s.base = this.base;
    s.obj = this.obj;
    s.options = clone(this.options);
    s.callQueue = this.callQueue.map(function(f) {
        return f;
    });
    s.methods = clone(this.methods);
    s.methodOptions = clone(this.methodOptions);
    s.statics = clone(this.statics);
    s.query = clone(this.query);
    s.plugins = Array.prototype.slice.call(this.plugins);
    s._indexes = clone(this._indexes);
    s._searchIndexes = clone(this._searchIndexes);
    s.s.hooks = this.s.hooks.clone();
    s.tree = clone(this.tree);
    s.paths = Object.fromEntries(Object.entries(this.paths).map(([key, value])=>[
            key,
            value.clone()
        ]));
    s.nested = clone(this.nested);
    s.subpaths = clone(this.subpaths);
    for (const schemaType of Object.values(s.paths)){
        if (schemaType.$isSingleNested) {
            const path = schemaType.path;
            for (const key of Object.keys(schemaType.schema.paths)){
                s.singleNestedPaths[path + '.' + key] = schemaType.schema.paths[key];
            }
            for (const key of Object.keys(schemaType.schema.singleNestedPaths)){
                s.singleNestedPaths[path + '.' + key] = schemaType.schema.singleNestedPaths[key];
            }
            for (const key of Object.keys(schemaType.schema.subpaths)){
                s.singleNestedPaths[path + '.' + key] = schemaType.schema.subpaths[key];
            }
            for (const key of Object.keys(schemaType.schema.nested)){
                s.singleNestedPaths[path + '.' + key] = 'nested';
            }
        }
    }
    s._gatherChildSchemas();
    s.virtuals = clone(this.virtuals);
    s.$globalPluginsApplied = this.$globalPluginsApplied;
    s.$isRootDiscriminator = this.$isRootDiscriminator;
    s.$implicitlyCreated = this.$implicitlyCreated;
    s.$id = ++id;
    s.$originalSchemaId = this.$id;
    s.mapPaths = [].concat(this.mapPaths);
    if (this.discriminatorMapping != null) {
        s.discriminatorMapping = Object.assign({}, this.discriminatorMapping);
    }
    if (this.discriminators != null) {
        s.discriminators = Object.assign({}, this.discriminators);
    }
    if (this._applyDiscriminators != null) {
        s._applyDiscriminators = new Map(this._applyDiscriminators);
    }
    s.aliases = Object.assign({}, this.aliases);
    s.encryptedFields = clone(this.encryptedFields);
    return s;
};
/**
 * Returns a new schema that has the picked `paths` from this schema.
 *
 * This method is analagous to [Lodash's `pick()` function](https://lodash.com/docs/4.17.15#pick) for Mongoose schemas.
 *
 * #### Example:
 *
 *     const schema = Schema({ name: String, age: Number });
 *     // Creates a new schema with the same `name` path as `schema`,
 *     // but no `age` path.
 *     const newSchema = schema.pick(['name']);
 *
 *     newSchema.path('name'); // SchemaString { ... }
 *     newSchema.path('age'); // undefined
 *
 * @param {String[]} paths List of Paths to pick for the new Schema
 * @param {Object} [options] Options to pass to the new Schema Constructor (same as `new Schema(.., Options)`). Defaults to `this.options` if not set.
 * @return {Schema}
 * @api public
 */ Schema.prototype.pick = function(paths, options) {
    const newSchema = new Schema({}, options || this.options);
    if (!Array.isArray(paths)) {
        throw new MongooseError('Schema#pick() only accepts an array argument, ' + 'got "' + typeof paths + '"');
    }
    for (const path of paths){
        if (this._hasEncryptedField(path)) {
            const encrypt = this.encryptedFields[path];
            const schemaType = this.path(path);
            newSchema.add({
                [path]: {
                    encrypt,
                    [this.options.typeKey]: schemaType
                }
            });
        } else if (this.nested[path]) {
            newSchema.add({
                [path]: get(this.tree, path)
            });
        } else {
            const schematype = this.path(path);
            if (schematype == null) {
                throw new MongooseError('Path `' + path + '` is not in the schema');
            }
            newSchema.add({
                [path]: schematype
            });
        }
    }
    if (!this._hasEncryptedFields()) {
        newSchema.options.encryptionType = null;
    }
    return newSchema;
};
/**
 * Returns a new schema that has the `paths` from the original schema, minus the omitted ones.
 *
 * This method is analagous to [Lodash's `omit()` function](https://lodash.com/docs/#omit) for Mongoose schemas.
 *
 * #### Example:
 *
 *     const schema = Schema({ name: String, age: Number });
 *     // Creates a new schema omitting the `age` path
 *     const newSchema = schema.omit(['age']);
 *
 *     newSchema.path('name'); // SchemaString { ... }
 *     newSchema.path('age'); // undefined
 *
 * @param {String[]} paths List of Paths to omit for the new Schema
 * @param {Object} [options] Options to pass to the new Schema Constructor (same as `new Schema(.., Options)`). Defaults to `this.options` if not set.
 * @return {Schema}
 * @api public
 */ Schema.prototype.omit = function(paths, options) {
    const newSchema = new Schema(this, options || this.options);
    if (!Array.isArray(paths)) {
        throw new MongooseError('Schema#omit() only accepts an array argument, ' + 'got "' + typeof paths + '"');
    }
    newSchema.remove(paths);
    for(const nested in newSchema.singleNestedPaths){
        if (paths.includes(nested)) {
            delete newSchema.singleNestedPaths[nested];
        }
    }
    return newSchema;
};
/**
 * Returns default options for this schema, merged with `options`.
 *
 * @param {Object} [options] Options to overwrite the default options
 * @return {Object} The merged options of `options` and the default options
 * @api private
 */ Schema.prototype.defaultOptions = function(options) {
    this._userProvidedOptions = options == null ? {} : clone(options);
    const baseOptions = this.base && this.base.options || {};
    const strict = 'strict' in baseOptions ? baseOptions.strict : true;
    const strictQuery = 'strictQuery' in baseOptions ? baseOptions.strictQuery : false;
    const id = 'id' in baseOptions ? baseOptions.id : true;
    options = {
        strict,
        strictQuery,
        bufferCommands: true,
        capped: false,
        versionKey: '__v',
        optimisticConcurrency: false,
        minimize: true,
        autoIndex: null,
        discriminatorKey: '__t',
        shardKey: null,
        read: null,
        validateBeforeSave: true,
        validateModifiedOnly: false,
        // the following are only applied at construction time
        _id: true,
        id: id,
        typeKey: 'type',
        ...options
    };
    if (options.versionKey && typeof options.versionKey !== 'string') {
        throw new MongooseError('`versionKey` must be falsy or string, got `' + typeof options.versionKey + '`');
    }
    if (typeof options.read === 'string') {
        options.read = handleReadPreferenceAliases(options.read);
    } else if (Array.isArray(options.read) && typeof options.read[0] === 'string') {
        options.read = {
            mode: handleReadPreferenceAliases(options.read[0]),
            tags: options.read[1]
        };
    }
    if (options.optimisticConcurrency && !options.versionKey) {
        throw new MongooseError('Must set `versionKey` if using `optimisticConcurrency`');
    }
    return options;
};
/**
 * Inherit a Schema by applying a discriminator on an existing Schema.
 *
 *
 * #### Example:
 *
 *     const eventSchema = new mongoose.Schema({ timestamp: Date }, { discriminatorKey: 'kind' });
 *
 *     const clickedEventSchema = new mongoose.Schema({ element: String }, { discriminatorKey: 'kind' });
 *     const ClickedModel = eventSchema.discriminator('clicked', clickedEventSchema);
 *
 *     const Event = mongoose.model('Event', eventSchema);
 *
 *     Event.discriminators['clicked']; // Model { clicked }
 *
 *     const doc = await Event.create({ kind: 'clicked', element: '#hero' });
 *     doc.element; // '#hero'
 *     doc instanceof ClickedModel; // true
 *
 * @param {String} name the name of the discriminator
 * @param {Schema} schema the discriminated Schema
 * @param {Object} [options] discriminator options
 * @param {String} [options.value] the string stored in the `discriminatorKey` property. If not specified, Mongoose uses the `name` parameter.
 * @param {Boolean} [options.clone=true] By default, `discriminator()` clones the given `schema`. Set to `false` to skip cloning.
 * @param {Boolean} [options.overwriteModels=false] by default, Mongoose does not allow you to define a discriminator with the same name as another discriminator. Set this to allow overwriting discriminators with the same name.
 * @param {Boolean} [options.mergeHooks=true] By default, Mongoose merges the base schema's hooks with the discriminator schema's hooks. Set this option to `false` to make Mongoose use the discriminator schema's hooks instead.
 * @param {Boolean} [options.mergePlugins=true] By default, Mongoose merges the base schema's plugins with the discriminator schema's plugins. Set this option to `false` to make Mongoose use the discriminator schema's plugins instead.
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.discriminator = function(name, schema, options) {
    this._applyDiscriminators = this._applyDiscriminators || new Map();
    this._applyDiscriminators.set(name, {
        schema,
        options
    });
    return this;
};
/*!
 * Get this schema's default toObject/toJSON options, including Mongoose global
 * options.
 */ Schema.prototype._defaultToObjectOptions = function(json) {
    const path = json ? 'toJSON' : 'toObject';
    if (this._defaultToObjectOptionsMap && this._defaultToObjectOptionsMap[path]) {
        return this._defaultToObjectOptionsMap[path];
    }
    const baseOptions = this.base && this.base.options && this.base.options[path] || {};
    const schemaOptions = this.options[path] || {};
    // merge base default options with Schema's set default options if available.
    // `clone` is necessary here because `utils.options` directly modifies the second input.
    const defaultOptions = Object.assign({}, baseOptions, schemaOptions);
    this._defaultToObjectOptionsMap = this._defaultToObjectOptionsMap || {};
    this._defaultToObjectOptionsMap[path] = defaultOptions;
    return defaultOptions;
};
/**
 * Sets the encryption type of the schema, if a value is provided, otherwise
 * returns the encryption type.
 *
 * @param {'csfle' | 'queryableEncryption' | null | undefined} encryptionType plain object with paths to add, or another schema
 */ Schema.prototype.encryptionType = function encryptionType(encryptionType) {
    if (arguments.length === 0) {
        return this.options.encryptionType;
    }
    if (!(typeof encryptionType === 'string' || encryptionType === null)) {
        throw new Error('invalid `encryptionType`: ${encryptionType}');
    }
    this.options.encryptionType = encryptionType;
};
/**
 * Adds key path / schema type pairs to this schema.
 *
 * #### Example:
 *
 *     const ToySchema = new Schema();
 *     ToySchema.add({ name: 'string', color: 'string', price: 'number' });
 *
 *     const TurboManSchema = new Schema();
 *     // You can also `add()` another schema and copy over all paths, virtuals,
 *     // getters, setters, indexes, methods, and statics.
 *     TurboManSchema.add(ToySchema).add({ year: Number });
 *
 * @param {Object|Schema} obj plain object with paths to add, or another schema
 * @param {String} [prefix] path to prefix the newly added paths with
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.add = function add(obj, prefix) {
    if (obj instanceof Schema || obj != null && obj.instanceOfSchema) {
        merge(this, obj);
        return this;
    }
    // Special case: setting top-level `_id` to false should convert to disabling
    // the `_id` option. This behavior never worked before 5.4.11 but numerous
    // codebases use it (see gh-7516, gh-7512).
    if (obj._id === false && prefix == null) {
        this.options._id = false;
    }
    prefix = prefix || '';
    // avoid prototype pollution
    if (prefix === '__proto__.' || prefix === 'constructor.' || prefix === 'prototype.') {
        return this;
    }
    const keys = Object.keys(obj);
    const typeKey = this.options.typeKey;
    for (const key of keys){
        if (utils.specialProperties.has(key)) {
            continue;
        }
        const fullPath = prefix + key;
        const val = obj[key];
        if (val == null) {
            throw new TypeError('Invalid value for schema path `' + fullPath + '`, got value "' + val + '"');
        }
        // Retain `_id: false` but don't set it as a path, re: gh-8274.
        if (key === '_id' && val === false) {
            continue;
        }
        // Deprecate setting schema paths to primitive types (gh-7558)
        let isMongooseTypeString = false;
        if (typeof val === 'string') {
            // Handle the case in which the type is specified as a string (eg. 'date', 'oid', ...)
            const MongooseTypes = this.base != null ? this.base.Schema.Types : Schema.Types;
            const upperVal = val.charAt(0).toUpperCase() + val.substring(1);
            isMongooseTypeString = MongooseTypes[upperVal] != null;
        }
        if (key !== '_id' && (typeof val !== 'object' && typeof val !== 'function' && !isMongooseTypeString || val == null)) {
            throw new TypeError(`Invalid schema configuration: \`${val}\` is not ` + `a valid type at path \`${key}\`. See ` + 'https://bit.ly/mongoose-schematypes for a list of valid schema types.');
        }
        if (val instanceof VirtualType || (val.constructor && val.constructor.name || null) === 'VirtualType') {
            this.virtual(val);
            continue;
        }
        if (Array.isArray(val) && val.length === 1 && val[0] == null) {
            throw new TypeError('Invalid value for schema Array path `' + fullPath + '`, got value "' + val[0] + '"');
        }
        if (!(isPOJO(val) || val instanceof SchemaTypeOptions)) {
            // Special-case: Non-options definitely a path so leaf at this node
            // Examples: Schema instances, SchemaType instances
            if (prefix) {
                this.nested[prefix.substring(0, prefix.length - 1)] = true;
            }
            this.path(prefix + key, val);
            if (val[0] != null && !val[0].instanceOfSchema && utils.isPOJO(val[0].discriminators)) {
                const schemaType = this.path(prefix + key);
                for(const key in val[0].discriminators){
                    schemaType.discriminator(key, val[0].discriminators[key]);
                }
            }
        } else if (Object.keys(val).length < 1) {
            // Special-case: {} always interpreted as Mixed path so leaf at this node
            if (prefix) {
                this.nested[prefix.substring(0, prefix.length - 1)] = true;
            }
            this.path(fullPath, val); // mixed type
        } else if (!val[typeKey] || typeKey === 'type' && isPOJO(val.type) && val.type.type) {
            // Special-case: POJO with no bona-fide type key - interpret as tree of deep paths so recurse
            // nested object `{ last: { name: String } }`. Avoid functions with `.type` re: #10807 because
            // NestJS sometimes adds `Date.type`.
            this.nested[fullPath] = true;
            this.add(val, fullPath + '.');
        } else {
            // There IS a bona-fide type key that may also be a POJO
            const _typeDef = val[typeKey];
            if (isPOJO(_typeDef) && Object.keys(_typeDef).length > 0) {
                // If a POJO is the value of a type key, make it a subdocument
                if (prefix) {
                    this.nested[prefix.substring(0, prefix.length - 1)] = true;
                }
                const childSchemaOptions = {};
                if (this._userProvidedOptions.typeKey) {
                    childSchemaOptions.typeKey = this._userProvidedOptions.typeKey;
                }
                // propagate 'strict' option to child schema
                if (this._userProvidedOptions.strict != null) {
                    childSchemaOptions.strict = this._userProvidedOptions.strict;
                }
                if (this._userProvidedOptions.toObject != null) {
                    childSchemaOptions.toObject = utils.omit(this._userProvidedOptions.toObject, [
                        'transform'
                    ]);
                }
                if (this._userProvidedOptions.toJSON != null) {
                    childSchemaOptions.toJSON = utils.omit(this._userProvidedOptions.toJSON, [
                        'transform'
                    ]);
                }
                const _schema = new Schema(_typeDef, childSchemaOptions);
                _schema.$implicitlyCreated = true;
                const schemaWrappedPath = Object.assign({}, val, {
                    [typeKey]: _schema
                });
                this.path(prefix + key, schemaWrappedPath);
            } else {
                // Either the type is non-POJO or we interpret it as Mixed anyway
                if (prefix) {
                    this.nested[prefix.substring(0, prefix.length - 1)] = true;
                }
                this.path(prefix + key, val);
                if (val != null && !val.instanceOfSchema && utils.isPOJO(val.discriminators)) {
                    const schemaType = this.path(prefix + key);
                    for(const key in val.discriminators){
                        schemaType.discriminator(key, val.discriminators[key]);
                    }
                }
            }
        }
        if (val.instanceOfSchema && val.encryptionType() != null) {
            // schema.add({ field: <instance of encrypted schema> })
            if (this.encryptionType() != val.encryptionType()) {
                throw new Error('encryptionType of a nested schema must match the encryption type of the parent schema.');
            }
            for (const [encryptedField, encryptedFieldConfig] of Object.entries(val.encryptedFields)){
                const path = fullPath + '.' + encryptedField;
                this._addEncryptedField(path, encryptedFieldConfig);
            }
        } else if (typeof val === 'object' && 'encrypt' in val) {
            // schema.add({ field: { type: <schema type>, encrypt: { ... }}})
            const { encrypt } = val;
            if (this.encryptionType() == null) {
                throw new Error('encryptionType must be provided');
            }
            this._addEncryptedField(fullPath, encrypt);
        } else {
            // if the field was already encrypted and we re-configure it to be unencrypted, remove
            // the encrypted field configuration
            this._removeEncryptedField(fullPath);
        }
    }
    const aliasObj = Object.fromEntries(Object.entries(obj).map(([key])=>[
            prefix + key,
            null
        ]));
    aliasFields(this, aliasObj);
    return this;
};
/**
 * @param {string} path
 * @param {object} fieldConfig
 *
 * @api private
 */ Schema.prototype._addEncryptedField = function _addEncryptedField(path, fieldConfig) {
    const type = this.path(path).autoEncryptionType();
    if (type == null) {
        throw new Error(`Invalid BSON type for FLE field: '${path}'`);
    }
    this.encryptedFields[path] = clone(fieldConfig);
};
/**
 * @param {string} path
 *
 * @api private
 */ Schema.prototype._removeEncryptedField = function _removeEncryptedField(path) {
    delete this.encryptedFields[path];
};
/**
 * @api private
 *
 * @returns {boolean}
 */ Schema.prototype._hasEncryptedFields = function _hasEncryptedFields() {
    return Object.keys(this.encryptedFields).length > 0;
};
/**
 * @param {string} path
 * @returns {boolean}
 *
 * @api private
 */ Schema.prototype._hasEncryptedField = function _hasEncryptedField(path) {
    return path in this.encryptedFields;
};
/**
 * Builds an encryptedFieldsMap for the schema.
 *
 * @api private
 */ Schema.prototype._buildEncryptedFields = function() {
    const fields = Object.entries(this.encryptedFields).map(([path, config])=>{
        const bsonType = this.path(path).autoEncryptionType();
        // { path, bsonType, keyId, queries? }
        return {
            path,
            bsonType,
            ...config
        };
    });
    return {
        fields
    };
};
/**
 * Builds a schemaMap for the schema, if the schema is configured for client-side field level encryption.
 *
 * @api private
 */ Schema.prototype._buildSchemaMap = function() {
    /**
   * `schemaMap`s are JSON schemas, which use the following structure to represent objects:
   *    { field: { bsonType: 'object', properties: { ... } } }
   *
   * for example, a schema that looks like this `{ a: { b: int32 } }` would be encoded as
   * `{ a: { bsonType: 'object', properties: { b: < encryption configuration > } } }`
   *
   * This function takes an array of path segments, an output object (that gets mutated) and
   * a value to be associated with the full path, and constructs a valid CSFLE JSON schema path for
   * the object.  This works for deeply nested properties as well.
   *
   * @param {string[]} path array of path components
   * @param {object} object the object in which to build a JSON schema of `path`'s properties
   * @param {object} value the value to associate with the path in object
   */ function buildNestedPath(path, object, value) {
        let i = 0, component = path[i];
        for(; i < path.length - 1; ++i, component = path[i]){
            object[component] = object[component] == null ? {
                bsonType: 'object',
                properties: {}
            } : object[component];
            object = object[component].properties;
        }
        object[component] = value;
    }
    const schemaMapPropertyReducer = (accum, [path, propertyConfig])=>{
        const bsonType = this.path(path).autoEncryptionType();
        const pathComponents = path.split('.');
        const configuration = {
            encrypt: {
                ...propertyConfig,
                bsonType
            }
        };
        buildNestedPath(pathComponents, accum, configuration);
        return accum;
    };
    const properties = Object.entries(this.encryptedFields).reduce(schemaMapPropertyReducer, {});
    return {
        bsonType: 'object',
        properties
    };
};
/**
 * Add an alias for `path`. This means getting or setting the `alias`
 * is equivalent to getting or setting the `path`.
 *
 * #### Example:
 *
 *     const toySchema = new Schema({ n: String });
 *
 *     // Make 'name' an alias for 'n'
 *     toySchema.alias('n', 'name');
 *
 *     const Toy = mongoose.model('Toy', toySchema);
 *     const turboMan = new Toy({ n: 'Turbo Man' });
 *
 *     turboMan.name; // 'Turbo Man'
 *     turboMan.n; // 'Turbo Man'
 *
 *     turboMan.name = 'Turbo Man Action Figure';
 *     turboMan.n; // 'Turbo Man Action Figure'
 *
 *     await turboMan.save(); // Saves { _id: ..., n: 'Turbo Man Action Figure' }
 *
 *
 * @param {String} path real path to alias
 * @param {String|String[]} alias the path(s) to use as an alias for `path`
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.alias = function alias(path, alias) {
    aliasFields(this, {
        [path]: alias
    });
    return this;
};
/**
 * Remove an index by name or index specification.
 *
 * removeIndex only removes indexes from your schema object. Does **not** affect the indexes
 * in MongoDB.
 *
 * #### Example:
 *
 *     const ToySchema = new Schema({ name: String, color: String, price: Number });
 *
 *     // Add a new index on { name, color }
 *     ToySchema.index({ name: 1, color: 1 });
 *
 *     // Remove index on { name, color }
 *     // Keep in mind that order matters! `removeIndex({ color: 1, name: 1 })` won't remove the index
 *     ToySchema.removeIndex({ name: 1, color: 1 });
 *
 *     // Add an index with a custom name
 *     ToySchema.index({ color: 1 }, { name: 'my custom index name' });
 *     // Remove index by name
 *     ToySchema.removeIndex('my custom index name');
 *
 * @param {Object|string} index name or index specification
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.removeIndex = function removeIndex(index) {
    if (arguments.length > 1) {
        throw new Error('removeIndex() takes only 1 argument');
    }
    if (typeof index !== 'object' && typeof index !== 'string') {
        throw new Error('removeIndex() may only take either an object or a string as an argument');
    }
    if (typeof index === 'object') {
        for(let i = this._indexes.length - 1; i >= 0; --i){
            if (isIndexSpecEqual(this._indexes[i][0], index)) {
                this._indexes.splice(i, 1);
            }
        }
    } else {
        for(let i = this._indexes.length - 1; i >= 0; --i){
            if (this._indexes[i][1] != null && this._indexes[i][1].name === index) {
                this._indexes.splice(i, 1);
            }
        }
    }
    return this;
};
/**
 * Remove all indexes from this schema.
 *
 * clearIndexes only removes indexes from your schema object. Does **not** affect the indexes
 * in MongoDB.
 *
 * #### Example:
 *
 *     const ToySchema = new Schema({ name: String, color: String, price: Number });
 *     ToySchema.index({ name: 1 });
 *     ToySchema.index({ color: 1 });
 *
 *     // Remove all indexes on this schema
 *     ToySchema.clearIndexes();
 *
 *     ToySchema.indexes(); // []
 *
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.clearIndexes = function clearIndexes() {
    this._indexes.length = 0;
    return this;
};
/**
 * Add an [Atlas search index](https://www.mongodb.com/docs/atlas/atlas-search/create-index/) that Mongoose will create using `Model.createSearchIndex()`.
 * This function only works when connected to MongoDB Atlas.
 *
 * #### Example:
 *
 *     const ToySchema = new Schema({ name: String, color: String, price: Number });
 *     ToySchema.searchIndex({ name: 'test', definition: { mappings: { dynamic: true } } });
 *
 * @param {Object} description index options, including `name` and `definition`
 * @param {String} description.name
 * @param {Object} description.definition
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.searchIndex = function searchIndex(description) {
    this._searchIndexes.push(description);
    return this;
};
/**
 * Reserved document keys.
 *
 * Keys in this object are names that are warned in schema declarations
 * because they have the potential to break Mongoose/ Mongoose plugins functionality. If you create a schema
 * using `new Schema()` with one of these property names, Mongoose will log a warning.
 *
 * - _posts
 * - _pres
 * - collection
  * - emit
 * - errors
 * - get
 * - init
 * - isModified
 * - isNew
 * - listeners
 * - modelName
 * - on
 * - once
 * - populated
 * - prototype
 * - remove
 * - removeListener
 * - save
 * - schema
 * - toObject
 * - validate
 *
 * _NOTE:_ Use of these terms as method names is permitted, but play at your own risk, as they may be existing mongoose document methods you are stomping on.
 *
 *      const schema = new Schema(..);
 *      schema.methods.init = function () {} // potentially breaking
 *
 * @property reserved
 * @memberOf Schema
 * @static
 */ Schema.reserved = Object.create(null);
Schema.prototype.reserved = Schema.reserved;
const reserved = Schema.reserved;
// Core object
reserved['prototype'] = // EventEmitter
reserved.emit = reserved.listeners = reserved.removeListener = // document properties and functions
reserved.collection = reserved.errors = reserved.get = reserved.init = reserved.isModified = reserved.isNew = reserved.populated = reserved.remove = reserved.save = reserved.toObject = reserved.validate = 1;
reserved.collection = 1;
/**
 * Gets/sets schema paths.
 *
 * Sets a path (if arity 2)
 * Gets a path (if arity 1)
 *
 * #### Example:
 *
 *     schema.path('name') // returns a SchemaType
 *     schema.path('name', Number) // changes the schemaType of `name` to Number
 *
 * @param {String} path The name of the Path to get / set
 * @param {Object} [obj] The Type to set the path to, if provided the path will be SET, otherwise the path will be GET
 * @api public
 */ Schema.prototype.path = function(path, obj) {
    if (obj === undefined) {
        if (this.paths[path] != null) {
            return this.paths[path];
        }
        // Convert to '.$' to check subpaths re: gh-6405
        const cleanPath = _pathToPositionalSyntax(path);
        let schematype = _getPath(this, path, cleanPath);
        if (schematype != null) {
            return schematype;
        }
        // Look for maps
        const mapPath = getMapPath(this, path);
        if (mapPath != null) {
            return mapPath;
        }
        // Look if a parent of this path is mixed
        schematype = this.hasMixedParent(cleanPath);
        if (schematype != null) {
            return schematype;
        }
        // subpaths?
        return hasNumericSubpathRegex.test(path) ? getPositionalPath(this, path, cleanPath) : undefined;
    }
    // some path names conflict with document methods
    const firstPieceOfPath = path.split('.')[0];
    if (reserved[firstPieceOfPath] && !this.options.suppressReservedKeysWarning) {
        const errorMessage = `\`${firstPieceOfPath}\` is a reserved schema pathname and may break some functionality. ` + 'You are allowed to use it, but use at your own risk. ' + 'To disable this warning pass `suppressReservedKeysWarning` as a schema option.';
        utils.warn(errorMessage);
    }
    if (typeof obj === 'object' && utils.hasUserDefinedProperty(obj, 'ref')) {
        validateRef(obj.ref, path);
    }
    // update the tree
    const subpaths = path.split(/\./);
    const last = subpaths.pop();
    let branch = this.tree;
    let fullPath = '';
    for (const sub of subpaths){
        if (utils.specialProperties.has(sub)) {
            throw new Error('Cannot set special property `' + sub + '` on a schema');
        }
        fullPath = fullPath += (fullPath.length > 0 ? '.' : '') + sub;
        if (!branch[sub]) {
            this.nested[fullPath] = true;
            branch[sub] = {};
        }
        if (typeof branch[sub] !== 'object') {
            const msg = 'Cannot set nested path `' + path + '`. ' + 'Parent path `' + fullPath + '` already set to type ' + branch[sub].name + '.';
            throw new Error(msg);
        }
        branch = branch[sub];
    }
    branch[last] = clone(obj);
    this.paths[path] = this.interpretAsType(path, obj, this.options);
    const schemaType = this.paths[path];
    // If overwriting an existing path, make sure to clear the childSchemas
    this.childSchemas = this.childSchemas.filter((childSchema)=>childSchema.path !== path);
    if (schemaType.$isSchemaMap) {
        // Maps can have arbitrary keys, so `$*` is internal shorthand for "any key"
        // The '$' is to imply this path should never be stored in MongoDB so we
        // can easily build a regexp out of this path, and '*' to imply "any key."
        const mapPath = path + '.$*';
        this.paths[mapPath] = schemaType.$__schemaType;
        this.mapPaths.push(this.paths[mapPath]);
        if (schemaType.$__schemaType.$isSingleNested) {
            this.childSchemas.push({
                schema: schemaType.$__schemaType.schema,
                model: schemaType.$__schemaType.caster,
                path: path
            });
        }
    }
    if (schemaType.$isSingleNested) {
        for (const key of Object.keys(schemaType.schema.paths)){
            this.singleNestedPaths[path + '.' + key] = schemaType.schema.paths[key];
        }
        for (const key of Object.keys(schemaType.schema.singleNestedPaths)){
            this.singleNestedPaths[path + '.' + key] = schemaType.schema.singleNestedPaths[key];
        }
        for (const key of Object.keys(schemaType.schema.subpaths)){
            this.singleNestedPaths[path + '.' + key] = schemaType.schema.subpaths[key];
        }
        for (const key of Object.keys(schemaType.schema.nested)){
            this.singleNestedPaths[path + '.' + key] = 'nested';
        }
        Object.defineProperty(schemaType.schema, 'base', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: this.base
        });
        schemaType.caster.base = this.base;
        this.childSchemas.push({
            schema: schemaType.schema,
            model: schemaType.caster,
            path: path
        });
    } else if (schemaType.$isMongooseDocumentArray) {
        Object.defineProperty(schemaType.schema, 'base', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: this.base
        });
        schemaType.casterConstructor.base = this.base;
        this.childSchemas.push({
            schema: schemaType.schema,
            model: schemaType.casterConstructor,
            path: path
        });
    }
    if (schemaType.$isMongooseArray && schemaType.caster instanceof SchemaType) {
        let arrayPath = path;
        let _schemaType = schemaType;
        const toAdd = [];
        while(_schemaType.$isMongooseArray){
            arrayPath = arrayPath + '.$';
            // Skip arrays of document arrays
            if (_schemaType.$isMongooseDocumentArray) {
                _schemaType.$embeddedSchemaType._arrayPath = arrayPath;
                _schemaType.$embeddedSchemaType._arrayParentPath = path;
                _schemaType = _schemaType.$embeddedSchemaType;
            } else {
                _schemaType.caster._arrayPath = arrayPath;
                _schemaType.caster._arrayParentPath = path;
                _schemaType = _schemaType.caster;
            }
            this.subpaths[arrayPath] = _schemaType;
        }
        for (const _schemaType of toAdd){
            this.subpaths[_schemaType.path] = _schemaType;
        }
    }
    if (schemaType.$isMongooseDocumentArray) {
        for (const key of Object.keys(schemaType.schema.paths)){
            const _schemaType = schemaType.schema.paths[key];
            this.subpaths[path + '.' + key] = _schemaType;
            if (typeof _schemaType === 'object' && _schemaType != null && _schemaType.$parentSchemaDocArray == null) {
                _schemaType.$parentSchemaDocArray = schemaType;
            }
        }
        for (const key of Object.keys(schemaType.schema.subpaths)){
            const _schemaType = schemaType.schema.subpaths[key];
            this.subpaths[path + '.' + key] = _schemaType;
            if (typeof _schemaType === 'object' && _schemaType != null && _schemaType.$parentSchemaDocArray == null) {
                _schemaType.$parentSchemaDocArray = schemaType;
            }
        }
        for (const key of Object.keys(schemaType.schema.singleNestedPaths)){
            const _schemaType = schemaType.schema.singleNestedPaths[key];
            this.subpaths[path + '.' + key] = _schemaType;
            if (typeof _schemaType === 'object' && _schemaType != null && _schemaType.$parentSchemaDocArray == null) {
                _schemaType.$parentSchemaDocArray = schemaType;
            }
        }
    }
    return this;
};
/*!
 * ignore
 */ Schema.prototype._gatherChildSchemas = function _gatherChildSchemas() {
    const childSchemas = [];
    for (const path of Object.keys(this.paths)){
        if (typeof path !== 'string') {
            continue;
        }
        const schematype = this.paths[path];
        if (schematype.$isMongooseDocumentArray || schematype.$isSingleNested) {
            childSchemas.push({
                schema: schematype.schema,
                model: schematype.caster,
                path: path
            });
        } else if (schematype.$isSchemaMap && schematype.$__schemaType.$isSingleNested) {
            childSchemas.push({
                schema: schematype.$__schemaType.schema,
                model: schematype.$__schemaType.caster,
                path: path
            });
        }
    }
    this.childSchemas = childSchemas;
    return childSchemas;
};
/*!
 * ignore
 */ function _getPath(schema, path, cleanPath) {
    if (schema.paths.hasOwnProperty(path)) {
        return schema.paths[path];
    }
    if (schema.subpaths.hasOwnProperty(cleanPath)) {
        const subpath = schema.subpaths[cleanPath];
        if (subpath === 'nested') {
            return undefined;
        }
        return subpath;
    }
    if (schema.singleNestedPaths.hasOwnProperty(cleanPath) && typeof schema.singleNestedPaths[cleanPath] === 'object') {
        const singleNestedPath = schema.singleNestedPaths[cleanPath];
        if (singleNestedPath === 'nested') {
            return undefined;
        }
        return singleNestedPath;
    }
    return null;
}
/*!
 * ignore
 */ function _pathToPositionalSyntax(path) {
    if (!/\.\d+/.test(path)) {
        return path;
    }
    return path.replace(/\.\d+\./g, '.$.').replace(/\.\d+$/, '.$');
}
/*!
 * ignore
 */ function getMapPath(schema, path) {
    if (schema.mapPaths.length === 0) {
        return null;
    }
    for (const val of schema.mapPaths){
        const cleanPath = val.path.replace(/\.\$\*/g, '');
        if (path === cleanPath || path.startsWith(cleanPath + '.') && path.slice(cleanPath.length + 1).indexOf('.') === -1) {
            return val;
        } else if (val.schema && path.startsWith(cleanPath + '.')) {
            let remnant = path.slice(cleanPath.length + 1);
            remnant = remnant.slice(remnant.indexOf('.') + 1);
            return val.schema.paths[remnant];
        } else if (val.$isSchemaMap && path.startsWith(cleanPath + '.')) {
            let remnant = path.slice(cleanPath.length + 1);
            remnant = remnant.slice(remnant.indexOf('.') + 1);
            const presplitPath = val.$__schemaType._presplitPath;
            if (remnant.indexOf('.') === -1 && presplitPath[presplitPath.length - 1] === '$*') {
                // Handle map of map of primitives
                return val.$__schemaType;
            } else if (remnant.indexOf('.') !== -1 && val.$__schemaType.schema && presplitPath[presplitPath.length - 1] === '$*') {
                // map of map of subdocs (recursive)
                return val.$__schemaType.schema.path(remnant.slice(remnant.indexOf('.') + 1));
            }
        }
    }
    return null;
}
/**
 * The Mongoose instance this schema is associated with
 *
 * @property base
 * @api private
 */ Object.defineProperty(Schema.prototype, 'base', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: null
});
/**
 * Converts type arguments into Mongoose Types.
 *
 * @param {String} path
 * @param {Object} obj constructor
 * @param {Object} options schema options
 * @api private
 */ Schema.prototype.interpretAsType = function(path, obj, options) {
    if (obj instanceof SchemaType) {
        if (obj.path === path) {
            return obj;
        }
        const clone = obj.clone();
        clone.path = path;
        return clone;
    }
    // If this schema has an associated Mongoose object, use the Mongoose object's
    // copy of SchemaTypes re: gh-7158 gh-6933
    const MongooseTypes = this.base != null ? this.base.Schema.Types : Schema.Types;
    const Types = this.base != null ? this.base.Types : __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)");
    if (!utils.isPOJO(obj) && !(obj instanceof SchemaTypeOptions)) {
        const constructorName = utils.getFunctionName(obj.constructor);
        if (constructorName !== 'Object') {
            const oldObj = obj;
            obj = {};
            obj[options.typeKey] = oldObj;
        }
    }
    // Get the type making sure to allow keys named "type"
    // and default to mixed if not specified.
    // { type: { type: String, default: 'freshcut' } }
    let type = obj[options.typeKey] && (obj[options.typeKey] instanceof Function || options.typeKey !== 'type' || !obj.type.type) ? obj[options.typeKey] : {};
    if (type instanceof SchemaType) {
        if (type.path === path) {
            return type;
        }
        const clone = type.clone();
        clone.path = path;
        return clone;
    }
    let name;
    if (utils.isPOJO(type) || type === 'mixed') {
        return new MongooseTypes.Mixed(path, obj, null, this);
    }
    if (Array.isArray(type) || type === Array || type === 'array' || type === MongooseTypes.Array) {
        // if it was specified through { type } look for `cast`
        let cast = type === Array || type === 'array' ? obj.cast || obj.of : type[0];
        // new Schema({ path: [new Schema({ ... })] })
        if (cast && cast.instanceOfSchema) {
            if (!(cast instanceof Schema)) {
                if (this.options._isMerging) {
                    cast = new Schema(cast);
                } else {
                    throw new TypeError('Schema for array path `' + path + '` is from a different copy of the Mongoose module. ' + 'Please make sure you\'re using the same version ' + 'of Mongoose everywhere with `npm list mongoose`. If you are still ' + 'getting this error, please add `new Schema()` around the path: ' + `${path}: new Schema(...)`);
                }
            }
            return new MongooseTypes.DocumentArray(path, cast, obj, null, this);
        }
        if (cast && cast[options.typeKey] && cast[options.typeKey].instanceOfSchema) {
            if (!(cast[options.typeKey] instanceof Schema)) {
                if (this.options._isMerging) {
                    cast[options.typeKey] = new Schema(cast[options.typeKey]);
                } else {
                    throw new TypeError('Schema for array path `' + path + '` is from a different copy of the Mongoose module. ' + 'Please make sure you\'re using the same version ' + 'of Mongoose everywhere with `npm list mongoose`. If you are still ' + 'getting this error, please add `new Schema()` around the path: ' + `${path}: new Schema(...)`);
                }
            }
            return new MongooseTypes.DocumentArray(path, cast[options.typeKey], obj, cast, this);
        }
        if (typeof cast !== 'undefined') {
            if (Array.isArray(cast) || cast.type === Array || cast.type == 'Array') {
                if (cast && cast.type == 'Array') {
                    cast.type = Array;
                }
                return new MongooseTypes.Array(path, this.interpretAsType(path, cast, options), obj, null, this);
            }
        }
        // Handle both `new Schema({ arr: [{ subpath: String }] })` and `new Schema({ arr: [{ type: { subpath: string } }] })`
        const castFromTypeKey = cast != null && cast[options.typeKey] && (options.typeKey !== 'type' || !cast.type.type) ? cast[options.typeKey] : cast;
        if (typeof cast === 'string') {
            cast = MongooseTypes[cast.charAt(0).toUpperCase() + cast.substring(1)];
        } else if (utils.isPOJO(castFromTypeKey)) {
            if (Object.keys(castFromTypeKey).length) {
                // The `minimize` and `typeKey` options propagate to child schemas
                // declared inline, like `{ arr: [{ val: { $type: String } }] }`.
                // See gh-3560
                const childSchemaOptions = {
                    minimize: options.minimize
                };
                if (options.typeKey) {
                    childSchemaOptions.typeKey = options.typeKey;
                }
                // propagate 'strict' option to child schema
                if (options.hasOwnProperty('strict')) {
                    childSchemaOptions.strict = options.strict;
                }
                if (options.hasOwnProperty('strictQuery')) {
                    childSchemaOptions.strictQuery = options.strictQuery;
                }
                if (options.hasOwnProperty('toObject')) {
                    childSchemaOptions.toObject = utils.omit(options.toObject, [
                        'transform'
                    ]);
                }
                if (options.hasOwnProperty('toJSON')) {
                    childSchemaOptions.toJSON = utils.omit(options.toJSON, [
                        'transform'
                    ]);
                }
                if (this._userProvidedOptions.hasOwnProperty('_id')) {
                    childSchemaOptions._id = this._userProvidedOptions._id;
                } else if (Schema.Types.DocumentArray.defaultOptions._id != null) {
                    childSchemaOptions._id = Schema.Types.DocumentArray.defaultOptions._id;
                }
                const childSchema = new Schema(castFromTypeKey, childSchemaOptions);
                childSchema.$implicitlyCreated = true;
                return new MongooseTypes.DocumentArray(path, childSchema, obj, null, this);
            } else {
                // Special case: empty object becomes mixed
                return new MongooseTypes.Array(path, MongooseTypes.Mixed, obj, null, this);
            }
        }
        if (cast) {
            type = cast[options.typeKey] && (options.typeKey !== 'type' || !cast.type.type) ? cast[options.typeKey] : cast;
            if (Array.isArray(type)) {
                return new MongooseTypes.Array(path, this.interpretAsType(path, type, options), obj, null, this);
            }
            name = typeof type === 'string' ? type : type.schemaName || utils.getFunctionName(type);
            // For Jest 26+, see #10296
            if (name === 'ClockDate') {
                name = 'Date';
            }
            if (name === void 0) {
                throw new TypeError('Invalid schema configuration: ' + `Could not determine the embedded type for array \`${path}\`. ` + 'See https://mongoosejs.com/docs/guide.html#definition for more info on supported schema syntaxes.');
            }
            if (!MongooseTypes.hasOwnProperty(name)) {
                throw new TypeError('Invalid schema configuration: ' + `\`${name}\` is not a valid type within the array \`${path}\`.` + 'See https://bit.ly/mongoose-schematypes for a list of valid schema types.');
            }
            if (name === 'Union' && typeof cast === 'object') {
                cast.parentSchema = this;
            }
        }
        return new MongooseTypes.Array(path, cast || MongooseTypes.Mixed, obj, options, this);
    }
    if (type && type.instanceOfSchema) {
        return new MongooseTypes.Subdocument(type, path, obj, this);
    }
    if (Buffer.isBuffer(type)) {
        name = 'Buffer';
    } else if (typeof type === 'function' || typeof type === 'object') {
        name = type.schemaName || utils.getFunctionName(type);
    } else if (type === Types.ObjectId) {
        name = 'ObjectId';
    } else if (type === Types.Decimal128) {
        name = 'Decimal128';
    } else {
        name = type == null ? '' + type : type.toString();
    }
    if (name) {
        name = name.charAt(0).toUpperCase() + name.substring(1);
    }
    // Special case re: gh-7049 because the bson `ObjectID` class' capitalization
    // doesn't line up with Mongoose's.
    if (name === 'ObjectID') {
        name = 'ObjectId';
    }
    // For Jest 26+, see #10296
    if (name === 'ClockDate') {
        name = 'Date';
    }
    if (name === void 0) {
        throw new TypeError(`Invalid schema configuration: \`${path}\` schematype definition is ` + 'invalid. See ' + 'https://mongoosejs.com/docs/guide.html#definition for more info on supported schema syntaxes.');
    }
    if (MongooseTypes[name] == null) {
        throw new TypeError(`Invalid schema configuration: \`${name}\` is not ` + `a valid type at path \`${path}\`. See ` + 'https://bit.ly/mongoose-schematypes for a list of valid schema types.');
    }
    const schemaType = new MongooseTypes[name](path, obj, options, this);
    return schemaType;
};
/**
 * Iterates the schemas paths similar to Array#forEach.
 *
 * The callback is passed the pathname and the schemaType instance.
 *
 * #### Example:
 *
 *     const userSchema = new Schema({ name: String, registeredAt: Date });
 *     userSchema.eachPath((pathname, schematype) => {
 *       // Prints twice:
 *       // name SchemaString { ... }
 *       // registeredAt SchemaDate { ... }
 *       console.log(pathname, schematype);
 *     });
 *
 * @param {Function} fn callback function
 * @return {Schema} this
 * @api public
 */ Schema.prototype.eachPath = function(fn) {
    const keys = Object.keys(this.paths);
    const len = keys.length;
    for(let i = 0; i < len; ++i){
        fn(keys[i], this.paths[keys[i]]);
    }
    return this;
};
/**
 * Returns an Array of path strings that are required by this schema.
 *
 * #### Example:
 *
 *     const s = new Schema({
 *       name: { type: String, required: true },
 *       age: { type: String, required: true },
 *       notes: String
 *     });
 *     s.requiredPaths(); // [ 'age', 'name' ]
 *
 * @api public
 * @param {Boolean} invalidate Refresh the cache
 * @return {Array}
 */ Schema.prototype.requiredPaths = function requiredPaths(invalidate) {
    if (this._requiredpaths && !invalidate) {
        return this._requiredpaths;
    }
    const paths = Object.keys(this.paths);
    let i = paths.length;
    const ret = [];
    while(i--){
        const path = paths[i];
        if (this.paths[path].isRequired) {
            ret.push(path);
        }
    }
    this._requiredpaths = ret;
    return this._requiredpaths;
};
/**
 * Returns indexes from fields and schema-level indexes (cached).
 *
 * @api private
 * @return {Array}
 */ Schema.prototype.indexedPaths = function indexedPaths() {
    if (this._indexedpaths) {
        return this._indexedpaths;
    }
    this._indexedpaths = this.indexes();
    return this._indexedpaths;
};
/**
 * Returns the pathType of `path` for this schema.
 *
 * Given a path, returns whether it is a real, virtual, nested, or ad-hoc/undefined path.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: String, nested: { foo: String } });
 *     s.virtual('foo').get(() => 42);
 *     s.pathType('name'); // "real"
 *     s.pathType('nested'); // "nested"
 *     s.pathType('foo'); // "virtual"
 *     s.pathType('fail'); // "adhocOrUndefined"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */ Schema.prototype.pathType = function(path) {
    if (this.paths.hasOwnProperty(path)) {
        return 'real';
    }
    if (this.virtuals.hasOwnProperty(path)) {
        return 'virtual';
    }
    if (this.nested.hasOwnProperty(path)) {
        return 'nested';
    }
    // Convert to '.$' to check subpaths re: gh-6405
    const cleanPath = _pathToPositionalSyntax(path);
    if (this.subpaths.hasOwnProperty(cleanPath) || this.subpaths.hasOwnProperty(path)) {
        return 'real';
    }
    const singleNestedPath = this.singleNestedPaths.hasOwnProperty(cleanPath) || this.singleNestedPaths.hasOwnProperty(path);
    if (singleNestedPath) {
        return singleNestedPath === 'nested' ? 'nested' : 'real';
    }
    // Look for maps
    const mapPath = getMapPath(this, path);
    if (mapPath != null) {
        return 'real';
    }
    if (/\.\d+\.|\.\d+$/.test(path)) {
        return getPositionalPathType(this, path, cleanPath);
    }
    return 'adhocOrUndefined';
};
/**
 * Returns true iff this path is a child of a mixed schema.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */ Schema.prototype.hasMixedParent = function(path) {
    const subpaths = path.split(/\./g);
    path = '';
    for(let i = 0; i < subpaths.length; ++i){
        path = i > 0 ? path + '.' + subpaths[i] : subpaths[i];
        if (this.paths.hasOwnProperty(path) && this.paths[path] instanceof MongooseTypes.Mixed) {
            return this.paths[path];
        }
    }
    return null;
};
/**
 * Setup updatedAt and createdAt timestamps to documents if enabled
 *
 * @param {Boolean|Object} timestamps timestamps options
 * @api private
 */ Schema.prototype.setupTimestamp = function(timestamps) {
    return setupTimestamps(this, timestamps);
};
/**
 * ignore. Deprecated re: #6405
 * @param {Any} self
 * @param {String} path
 * @api private
 */ function getPositionalPathType(self, path, cleanPath) {
    const subpaths = path.split(/\.(\d+)\.|\.(\d+)$/).filter(Boolean);
    if (subpaths.length < 2) {
        return self.paths.hasOwnProperty(subpaths[0]) ? self.paths[subpaths[0]] : 'adhocOrUndefined';
    }
    let val = self.path(subpaths[0]);
    let isNested = false;
    if (!val) {
        return 'adhocOrUndefined';
    }
    const last = subpaths.length - 1;
    for(let i = 1; i < subpaths.length; ++i){
        isNested = false;
        const subpath = subpaths[i];
        if (i === last && val && !/\D/.test(subpath)) {
            if (val.$isMongooseDocumentArray) {
                val = val.$embeddedSchemaType;
            } else if (val instanceof MongooseTypes.Array) {
                // StringSchema, NumberSchema, etc
                val = val.caster;
            } else {
                val = undefined;
            }
            break;
        }
        // ignore if its just a position segment: path.0.subpath
        if (!/\D/.test(subpath)) {
            // Nested array
            if (val instanceof MongooseTypes.Array && i !== last) {
                val = val.caster;
            }
            continue;
        }
        if (!(val && val.schema)) {
            val = undefined;
            break;
        }
        const type = val.schema.pathType(subpath);
        isNested = type === 'nested';
        val = val.schema.path(subpath);
    }
    self.subpaths[cleanPath] = val;
    if (val) {
        return 'real';
    }
    if (isNested) {
        return 'nested';
    }
    return 'adhocOrUndefined';
}
/*!
 * ignore
 */ function getPositionalPath(self, path, cleanPath) {
    getPositionalPathType(self, path, cleanPath);
    return self.subpaths[cleanPath];
}
/**
 * Adds a method call to the queue.
 *
 * #### Example:
 *
 *     schema.methods.print = function() { console.log(this); };
 *     schema.queue('print', []); // Print the doc every one is instantiated
 *
 *     const Model = mongoose.model('Test', schema);
 *     new Model({ name: 'test' }); // Prints '{"_id": ..., "name": "test" }'
 *
 * @param {String} name name of the document method to call later
 * @param {Array} args arguments to pass to the method
 * @api public
 */ Schema.prototype.queue = function(name, args) {
    this.callQueue.push([
        name,
        args
    ]);
    return this;
};
/**
 * Defines a pre hook for the model.
 *
 * #### Example:
 *
 *     const toySchema = new Schema({ name: String, created: Date });
 *
 *     toySchema.pre('save', function(next) {
 *       if (!this.created) this.created = new Date;
 *       next();
 *     });
 *
 *     toySchema.pre('validate', function(next) {
 *       if (this.name !== 'Woody') this.name = 'Woody';
 *       next();
 *     });
 *
 *     // Equivalent to calling `pre()` on `find`, `findOne`, `findOneAndUpdate`.
 *     toySchema.pre(/^find/, function(next) {
 *       console.log(this.getFilter());
 *     });
 *
 *     // Equivalent to calling `pre()` on `updateOne`, `findOneAndUpdate`.
 *     toySchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
 *       console.log(this.getFilter());
 *     });
 *
 *     toySchema.pre('deleteOne', function() {
 *       // Runs when you call `Toy.deleteOne()`
 *     });
 *
 *     toySchema.pre('deleteOne', { document: true }, function() {
 *       // Runs when you call `doc.deleteOne()`
 *     });
 *
 * @param {String|RegExp|String[]} methodName The method name or regular expression to match method name
 * @param {Object} [options]
 * @param {Boolean} [options.document] If `name` is a hook for both document and query middleware, set to `true` to run on document middleware. For example, set `options.document` to `true` to apply this hook to `Document#deleteOne()` rather than `Query#deleteOne()`.
 * @param {Boolean} [options.query] If `name` is a hook for both document and query middleware, set to `true` to run on query middleware.
 * @param {Function} callback
 * @api public
 */ Schema.prototype.pre = function(name) {
    if (name instanceof RegExp) {
        const remainingArgs = Array.prototype.slice.call(arguments, 1);
        for (const fn of hookNames){
            if (name.test(fn)) {
                this.pre.apply(this, [
                    fn
                ].concat(remainingArgs));
            }
        }
        return this;
    }
    if (Array.isArray(name)) {
        const remainingArgs = Array.prototype.slice.call(arguments, 1);
        for (const el of name){
            this.pre.apply(this, [
                el
            ].concat(remainingArgs));
        }
        return this;
    }
    this.s.hooks.pre.apply(this.s.hooks, arguments);
    return this;
};
/**
 * Defines a post hook for the document
 *
 *     const schema = new Schema(..);
 *     schema.post('save', function (doc) {
 *       console.log('this fired after a document was saved');
 *     });
 *
 *     schema.post('find', function(docs) {
 *       console.log('this fired after you ran a find query');
 *     });
 *
 *     schema.post(/Many$/, function(res) {
 *       console.log('this fired after you ran `updateMany()` or `deleteMany()`');
 *     });
 *
 *     const Model = mongoose.model('Model', schema);
 *
 *     const m = new Model(..);
 *     await m.save();
 *     console.log('this fires after the `post` hook');
 *
 *     await m.find();
 *     console.log('this fires after the post find hook');
 *
 * @param {String|RegExp|String[]} methodName The method name or regular expression to match method name
 * @param {Object} [options]
 * @param {Boolean} [options.document] If `name` is a hook for both document and query middleware, set to `true` to run on document middleware.
 * @param {Boolean} [options.query] If `name` is a hook for both document and query middleware, set to `true` to run on query middleware.
 * @param {Function} fn callback
 * @see middleware https://mongoosejs.com/docs/middleware.html
 * @see kareem https://npmjs.org/package/kareem
 * @api public
 */ Schema.prototype.post = function(name) {
    if (name instanceof RegExp) {
        const remainingArgs = Array.prototype.slice.call(arguments, 1);
        for (const fn of hookNames){
            if (name.test(fn)) {
                this.post.apply(this, [
                    fn
                ].concat(remainingArgs));
            }
        }
        return this;
    }
    if (Array.isArray(name)) {
        const remainingArgs = Array.prototype.slice.call(arguments, 1);
        for (const el of name){
            this.post.apply(this, [
                el
            ].concat(remainingArgs));
        }
        return this;
    }
    this.s.hooks.post.apply(this.s.hooks, arguments);
    return this;
};
/**
 * Registers a plugin for this schema.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: String });
 *     s.plugin(schema => console.log(schema.path('name').path));
 *     mongoose.model('Test', s); // Prints 'name'
 *
 * Or with Options:
 *
 *     const s = new Schema({ name: String });
 *     s.plugin((schema, opts) => console.log(opts.text, schema.path('name').path), { text: "Schema Path Name:" });
 *     mongoose.model('Test', s); // Prints 'Schema Path Name: name'
 *
 * @param {Function} plugin The Plugin's callback
 * @param {Object} [opts] Options to pass to the plugin
 * @param {Boolean} [opts.deduplicate=false] If true, ignore duplicate plugins (same `fn` argument using `===`)
 * @see plugins https://mongoosejs.com/docs/plugins.html
 * @api public
 */ Schema.prototype.plugin = function(fn, opts) {
    if (typeof fn !== 'function') {
        throw new Error('First param to `schema.plugin()` must be a function, ' + 'got "' + typeof fn + '"');
    }
    if (opts && opts.deduplicate) {
        for (const plugin of this.plugins){
            if (plugin.fn === fn) {
                return this;
            }
        }
    }
    this.plugins.push({
        fn: fn,
        opts: opts
    });
    fn(this, opts);
    return this;
};
/**
 * Adds an instance method to documents constructed from Models compiled from this schema.
 *
 * #### Example:
 *
 *     const schema = kittySchema = new Schema(..);
 *
 *     schema.method('meow', function () {
 *       console.log('meeeeeoooooooooooow');
 *     })
 *
 *     const Kitty = mongoose.model('Kitty', schema);
 *
 *     const fizz = new Kitty;
 *     fizz.meow(); // meeeeeooooooooooooow
 *
 * If a hash of name/fn pairs is passed as the only argument, each name/fn pair will be added as methods.
 *
 *     schema.method({
 *         purr: function () {}
 *       , scratch: function () {}
 *     });
 *
 *     // later
 *     const fizz = new Kitty;
 *     fizz.purr();
 *     fizz.scratch();
 *
 * NOTE: `Schema.method()` adds instance methods to the `Schema.methods` object. You can also add instance methods directly to the `Schema.methods` object as seen in the [guide](https://mongoosejs.com/docs/guide.html#methods)
 *
 * @param {String|Object} name The Method Name for a single function, or a Object of "string-function" pairs.
 * @param {Function} [fn] The Function in a single-function definition.
 * @api public
 */ Schema.prototype.method = function(name, fn, options) {
    if (typeof name !== 'string') {
        for(const i in name){
            this.methods[i] = name[i];
            this.methodOptions[i] = clone(options);
        }
    } else {
        this.methods[name] = fn;
        this.methodOptions[name] = clone(options);
    }
    return this;
};
/**
 * Adds static "class" methods to Models compiled from this schema.
 *
 * #### Example:
 *
 *     const schema = new Schema(..);
 *     // Equivalent to `schema.statics.findByName = function(name) {}`;
 *     schema.static('findByName', function(name) {
 *       return this.find({ name: name });
 *     });
 *
 *     const Drink = mongoose.model('Drink', schema);
 *     await Drink.findByName('LaCroix');
 *
 * If a hash of name/fn pairs is passed as the only argument, each name/fn pair will be added as methods.
 *
 *     schema.static({
 *         findByName: function () {..}
 *       , findByCost: function () {..}
 *     });
 *
 *     const Drink = mongoose.model('Drink', schema);
 *     await Drink.findByName('LaCroix');
 *     await Drink.findByCost(3);
 *
 * If a hash of name/fn pairs is passed as the only argument, each name/fn pair will be added as statics.
 *
 * @param {String|Object} name The Method Name for a single function, or a Object of "string-function" pairs.
 * @param {Function} [fn] The Function in a single-function definition.
 * @api public
 * @see Statics https://mongoosejs.com/docs/guide.html#statics
 */ Schema.prototype.static = function(name, fn) {
    if (typeof name !== 'string') {
        for(const i in name){
            this.statics[i] = name[i];
        }
    } else {
        this.statics[name] = fn;
    }
    return this;
};
/**
 * Defines an index (most likely compound) for this schema.
 *
 * #### Example:
 *
 *     schema.index({ first: 1, last: -1 })
 *
 * @param {Object} fields The Fields to index, with the order, available values: `1 | -1 | '2d' | '2dsphere' | 'geoHaystack' | 'hashed' | 'text'`
 * @param {Object} [options] Options to pass to [MongoDB driver's `createIndex()` function](https://mongodb.github.io/node-mongodb-native/4.9/classes/Collection.html#createIndex)
 * @param {String | number} [options.expires=null] Mongoose-specific syntactic sugar, uses [ms](https://www.npmjs.com/package/ms) to convert `expires` option into seconds for the `expireAfterSeconds` in the above link.
 * @param {String} [options.language_override=null] Tells mongodb to use the specified field instead of `language` for parsing text indexes.
 * @api public
 */ Schema.prototype.index = function(fields, options) {
    fields || (fields = {});
    options || (options = {});
    if (options.expires) {
        utils.expires(options);
    }
    for(const key in fields){
        if (this.aliases[key]) {
            fields = utils.renameObjKey(fields, key, this.aliases[key]);
        }
    }
    for (const field of Object.keys(fields)){
        if (fields[field] === 'ascending' || fields[field] === 'asc') {
            fields[field] = 1;
        } else if (fields[field] === 'descending' || fields[field] === 'desc') {
            fields[field] = -1;
        }
    }
    for (const existingIndex of this.indexes()){
        if (options.name == null && existingIndex[1].name == null && isIndexSpecEqual(existingIndex[0], fields)) {
            utils.warn(`Duplicate schema index on ${JSON.stringify(fields)} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.`);
        }
    }
    this._indexes.push([
        fields,
        options
    ]);
    return this;
};
/**
 * Sets a schema option.
 *
 * #### Example:
 *
 *     schema.set('strict'); // 'true' by default
 *     schema.set('strict', false); // Sets 'strict' to false
 *     schema.set('strict'); // 'false'
 *
 * @param {String} key The name of the option to set the value to
 * @param {Object} [value] The value to set the option to, if not passed, the option will be reset to default
 * @param {Array<string>} [tags] tags to add to read preference if key === 'read'
 * @see Schema https://mongoosejs.com/docs/api/schema.html#Schema()
 * @api public
 */ Schema.prototype.set = function(key, value, tags) {
    if (arguments.length === 1) {
        return this.options[key];
    }
    switch(key){
        case 'read':
            if (typeof value === 'string') {
                this.options[key] = {
                    mode: handleReadPreferenceAliases(value),
                    tags
                };
            } else if (Array.isArray(value) && typeof value[0] === 'string') {
                this.options[key] = {
                    mode: handleReadPreferenceAliases(value[0]),
                    tags: value[1]
                };
            } else {
                this.options[key] = value;
            }
            this._userProvidedOptions[key] = this.options[key];
            break;
        case 'timestamps':
            this.setupTimestamp(value);
            this.options[key] = value;
            this._userProvidedOptions[key] = this.options[key];
            break;
        case '_id':
            this.options[key] = value;
            this._userProvidedOptions[key] = this.options[key];
            if (value && !this.paths['_id']) {
                addAutoId(this);
            } else if (!value && this.paths['_id'] != null && this.paths['_id'].auto) {
                this.remove('_id');
            }
            break;
        default:
            this.options[key] = value;
            this._userProvidedOptions[key] = this.options[key];
            break;
    }
    // Propagate `strict` and `strictQuery` changes down to implicitly created schemas
    if (key === 'strict') {
        _propagateOptionsToImplicitlyCreatedSchemas(this, {
            strict: value
        });
    }
    if (key === 'strictQuery') {
        _propagateOptionsToImplicitlyCreatedSchemas(this, {
            strictQuery: value
        });
    }
    if (key === 'toObject') {
        value = {
            ...value
        };
        // Avoid propagating transform to implicitly created schemas re: gh-3279
        delete value.transform;
        _propagateOptionsToImplicitlyCreatedSchemas(this, {
            toObject: value
        });
    }
    if (key === 'toJSON') {
        value = {
            ...value
        };
        // Avoid propagating transform to implicitly created schemas re: gh-3279
        delete value.transform;
        _propagateOptionsToImplicitlyCreatedSchemas(this, {
            toJSON: value
        });
    }
    return this;
};
/*!
 * Recursively set options on implicitly created schemas
 */ function _propagateOptionsToImplicitlyCreatedSchemas(baseSchema, options) {
    for (const { schema } of baseSchema.childSchemas){
        if (!schema.$implicitlyCreated) {
            continue;
        }
        Object.assign(schema.options, options);
        _propagateOptionsToImplicitlyCreatedSchemas(schema, options);
    }
}
/**
 * Gets a schema option.
 *
 * #### Example:
 *
 *     schema.get('strict'); // true
 *     schema.set('strict', false);
 *     schema.get('strict'); // false
 *
 * @param {String} key The name of the Option to get the current value for
 * @api public
 * @return {Any} the option's value
 */ Schema.prototype.get = function(key) {
    return this.options[key];
};
const indexTypes = '2d 2dsphere hashed text'.split(' ');
/**
 * The allowed index types
 *
 * @property {String[]} indexTypes
 * @memberOf Schema
 * @static
 * @api public
 */ Object.defineProperty(Schema, 'indexTypes', {
    get: function() {
        return indexTypes;
    },
    set: function() {
        throw new Error('Cannot overwrite Schema.indexTypes');
    }
});
/**
 * Returns a list of indexes that this schema declares, via `schema.index()` or by `index: true` in a path's options.
 * Indexes are expressed as an array `[spec, options]`.
 *
 * #### Example:
 *
 *     const userSchema = new Schema({
 *       email: { type: String, required: true, unique: true },
 *       registeredAt: { type: Date, index: true }
 *     });
 *
 *     // [ [ { email: 1 }, { unique: true, background: true } ],
 *     //   [ { registeredAt: 1 }, { background: true } ] ]
 *     userSchema.indexes();
 *
 * [Plugins](https://mongoosejs.com/docs/plugins.html) can use the return value of this function to modify a schema's indexes.
 * For example, the below plugin makes every index unique by default.
 *
 *     function myPlugin(schema) {
 *       for (const index of schema.indexes()) {
 *         if (index[1].unique === undefined) {
 *           index[1].unique = true;
 *         }
 *       }
 *     }
 *
 * @api public
 * @return {Array} list of indexes defined in the schema
 */ Schema.prototype.indexes = function() {
    return getIndexes(this);
};
/**
 * Creates a virtual type with the given name.
 *
 * @param {String} name The name of the Virtual
 * @param {Object} [options]
 * @param {String|Model} [options.ref] model name or model instance. Marks this as a [populate virtual](https://mongoosejs.com/docs/populate.html#populate-virtuals).
 * @param {String|Function} [options.localField] Required for populate virtuals. See [populate virtual docs](https://mongoosejs.com/docs/populate.html#populate-virtuals) for more information.
 * @param {String|Function} [options.foreignField] Required for populate virtuals. See [populate virtual docs](https://mongoosejs.com/docs/populate.html#populate-virtuals) for more information.
 * @param {Boolean|Function} [options.justOne=false] Only works with populate virtuals. If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), will be a single doc or `null`. Otherwise, the populate virtual will be an array.
 * @param {Boolean} [options.count=false] Only works with populate virtuals. If [truthy](https://masteringjs.io/tutorials/fundamentals/truthy), this populate virtual will contain the number of documents rather than the documents themselves when you `populate()`.
 * @param {Function|null} [options.get=null] Adds a [getter](https://mongoosejs.com/docs/tutorials/getters-setters.html) to this virtual to transform the populated doc.
 * @param {Object|Function} [options.match=null] Apply a default [`match` option to populate](https://mongoosejs.com/docs/populate.html#match), adding an additional filter to the populate query.
 * @param {Boolean} [options.applyToArray=false] If true and the given `name` is a direct child of an array, apply the virtual to the array rather than the elements.
 * @return {VirtualType}
 */ Schema.prototype.virtual = function(name, options) {
    if (name instanceof VirtualType || getConstructorName(name) === 'VirtualType') {
        return this.virtual(name.path, name.options);
    }
    options = new VirtualOptions(options);
    if (utils.hasUserDefinedProperty(options, [
        'ref',
        'refPath'
    ])) {
        if (options.localField == null) {
            throw new Error('Reference virtuals require `localField` option');
        }
        if (options.foreignField == null) {
            throw new Error('Reference virtuals require `foreignField` option');
        }
        const virtual = this.virtual(name);
        virtual.options = options;
        this.pre('init', function virtualPreInit(obj, opts) {
            if (mpath.has(name, obj)) {
                const _v = mpath.get(name, obj);
                if (!this.$$populatedVirtuals) {
                    this.$$populatedVirtuals = {};
                }
                if (options.justOne || options.count) {
                    this.$$populatedVirtuals[name] = Array.isArray(_v) ? _v[0] : _v;
                } else {
                    this.$$populatedVirtuals[name] = Array.isArray(_v) ? _v : _v == null ? [] : [
                        _v
                    ];
                }
                if (opts?.hydratedPopulatedDocs && !options.count) {
                    const modelNames = virtual._getModelNamesForPopulate(this);
                    const populatedVal = this.$$populatedVirtuals[name];
                    if (!Array.isArray(populatedVal) && !populatedVal.$__ && modelNames?.length === 1) {
                        const PopulateModel = this.db.model(modelNames[0]);
                        this.$$populatedVirtuals[name] = PopulateModel.hydrate(populatedVal);
                    } else if (Array.isArray(populatedVal) && modelNames?.length === 1) {
                        const PopulateModel = this.db.model(modelNames[0]);
                        for(let i = 0; i < populatedVal.length; ++i){
                            if (!populatedVal[i].$__) {
                                populatedVal[i] = PopulateModel.hydrate(populatedVal[i], null, {
                                    hydratedPopulatedDocs: true
                                });
                            }
                        }
                        const foreignField = options.foreignField;
                        this.$populated(name, populatedVal.map((doc)=>doc == null ? doc : doc.get(typeof foreignField === 'function' ? foreignField.call(doc, doc) : foreignField)), {
                            populateModelSymbol: PopulateModel
                        });
                    }
                }
                mpath.unset(name, obj);
            }
        });
        virtual.set(function(v) {
            if (!this.$$populatedVirtuals) {
                this.$$populatedVirtuals = {};
            }
            return setPopulatedVirtualValue(this.$$populatedVirtuals, name, v, options);
        });
        if (typeof options.get === 'function') {
            virtual.get(options.get);
        }
        // Workaround for gh-8198: if virtual is under document array, make a fake
        // virtual. See gh-8210, gh-13189
        const parts = name.split('.');
        let cur = parts[0];
        for(let i = 0; i < parts.length - 1; ++i){
            if (this.paths[cur] == null) {
                continue;
            }
            if (this.paths[cur].$isMongooseDocumentArray || this.paths[cur].$isSingleNested) {
                const remnant = parts.slice(i + 1).join('.');
                this.paths[cur].schema.virtual(remnant, options);
                break;
            } else if (this.paths[cur].$isSchemaMap) {
                const remnant = parts.slice(i + 2).join('.');
                this.paths[cur].$__schemaType.schema.virtual(remnant, options);
                break;
            }
            cur += '.' + parts[i + 1];
        }
        return virtual;
    }
    const virtuals = this.virtuals;
    const parts = name.split('.');
    if (this.pathType(name) === 'real') {
        throw new Error('Virtual path "' + name + '"' + ' conflicts with a real path in the schema');
    }
    virtuals[name] = parts.reduce(function(mem, part, i) {
        mem[part] || (mem[part] = i === parts.length - 1 ? new VirtualType(options, name) : {});
        return mem[part];
    }, this.tree);
    if (options && options.applyToArray && parts.length > 1) {
        const path = this.path(parts.slice(0, -1).join('.'));
        if (path && path.$isMongooseArray) {
            return path.virtual(parts[parts.length - 1], options);
        } else {
            throw new MongooseError(`Path "${path}" is not an array`);
        }
    }
    return virtuals[name];
};
/**
 * Returns the virtual type with the given `name`.
 *
 * @param {String} name The name of the Virtual to get
 * @return {VirtualType|null}
 */ Schema.prototype.virtualpath = function(name) {
    return this.virtuals.hasOwnProperty(name) ? this.virtuals[name] : null;
};
/**
 * Removes the given `path` (or [`paths`]).
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String, age: Number });
 *     schema.remove('name');
 *     schema.path('name'); // Undefined
 *     schema.path('age'); // SchemaNumber { ... }
 *
 * Or as a Array:
 *
 *     schema.remove(['name', 'age']);
 *     schema.path('name'); // Undefined
 *     schema.path('age'); // Undefined
 *
 * @param {String|Array} path The Path(s) to remove
 * @return {Schema} the Schema instance
 * @api public
 */ Schema.prototype.remove = function(path) {
    if (typeof path === 'string') {
        path = [
            path
        ];
    }
    if (Array.isArray(path)) {
        path.forEach(function(name) {
            if (this.path(name) == null && !this.nested[name]) {
                return;
            }
            if (this.nested[name]) {
                const allKeys = Object.keys(this.paths).concat(Object.keys(this.nested));
                for (const path of allKeys){
                    if (path.startsWith(name + '.')) {
                        delete this.paths[path];
                        delete this.nested[path];
                        _deletePath(this, path);
                    }
                }
                delete this.nested[name];
                _deletePath(this, name);
                return;
            }
            delete this.paths[name];
            _deletePath(this, name);
            this._removeEncryptedField(name);
        }, this);
    }
    return this;
};
/*!
 * ignore
 */ function _deletePath(schema, name) {
    const pieces = name.split('.');
    const last = pieces.pop();
    let branch = schema.tree;
    for (const piece of pieces){
        branch = branch[piece];
    }
    delete branch[last];
}
/**
 * Removes the given virtual or virtuals from the schema.
 *
 * @param {String|Array} path The virutal path(s) to remove.
 * @returns {Schema} the Schema instance, or a mongoose error if the virtual does not exist.
 * @api public
 */ Schema.prototype.removeVirtual = function(path) {
    if (typeof path === 'string') {
        path = [
            path
        ];
    }
    if (Array.isArray(path)) {
        for (const virtual of path){
            if (this.virtuals[virtual] == null) {
                throw new MongooseError(`Attempting to remove virtual "${virtual}" that does not exist.`);
            }
        }
        for (const virtual of path){
            delete this.paths[virtual];
            delete this.virtuals[virtual];
            if (virtual.indexOf('.') !== -1) {
                mpath.unset(virtual, this.tree);
            } else {
                delete this.tree[virtual];
            }
        }
    }
    return this;
};
/**
 * Loads an ES6 class into a schema. Maps [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) + [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get), [static methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static),
 * and [instance methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Class_body_and_method_definitions)
 * to schema [virtuals](https://mongoosejs.com/docs/guide.html#virtuals),
 * [statics](https://mongoosejs.com/docs/guide.html#statics), and
 * [methods](https://mongoosejs.com/docs/guide.html#methods).
 *
 * #### Example:
 *
 * ```javascript
 * const md5 = require('md5');
 * const userSchema = new Schema({ email: String });
 * class UserClass {
 *   // `gravatarImage` becomes a virtual
 *   get gravatarImage() {
 *     const hash = md5(this.email.toLowerCase());
 *     return `https://www.gravatar.com/avatar/${hash}`;
 *   }
 *
 *   // `getProfileUrl()` becomes a document method
 *   getProfileUrl() {
 *     return `https://mysite.com/${this.email}`;
 *   }
 *
 *   // `findByEmail()` becomes a static
 *   static findByEmail(email) {
 *     return this.findOne({ email });
 *   }
 * }
 *
 * // `schema` will now have a `gravatarImage` virtual, a `getProfileUrl()` method,
 * // and a `findByEmail()` static
 * userSchema.loadClass(UserClass);
 * ```
 *
 * @param {Function} model The Class to load
 * @param {Boolean} [virtualsOnly] if truthy, only pulls virtuals from the class, not methods or statics
 */ Schema.prototype.loadClass = function(model, virtualsOnly) {
    // Stop copying when hit certain base classes
    if (model === Object.prototype || model === Function.prototype || model.prototype.hasOwnProperty('$isMongooseModelPrototype') || model.prototype.hasOwnProperty('$isMongooseDocumentPrototype')) {
        return this;
    }
    this.loadClass(Object.getPrototypeOf(model), virtualsOnly);
    // Add static methods
    if (!virtualsOnly) {
        Object.getOwnPropertyNames(model).forEach(function(name) {
            if (name.match(/^(length|name|prototype|constructor|__proto__)$/)) {
                return;
            }
            const prop = Object.getOwnPropertyDescriptor(model, name);
            if (prop.hasOwnProperty('value')) {
                this.static(name, prop.value);
            }
        }, this);
    }
    // Add methods and virtuals
    Object.getOwnPropertyNames(model.prototype).forEach(function(name) {
        if (name.match(/^(constructor)$/)) {
            return;
        }
        const method = Object.getOwnPropertyDescriptor(model.prototype, name);
        if (!virtualsOnly) {
            if (typeof method.value === 'function') {
                this.method(name, method.value);
            }
        }
        if (typeof method.get === 'function') {
            if (this.virtuals[name]) {
                this.virtuals[name].getters = [];
            }
            this.virtual(name).get(method.get);
        }
        if (typeof method.set === 'function') {
            if (this.virtuals[name]) {
                this.virtuals[name].setters = [];
            }
            this.virtual(name).set(method.set);
        }
    }, this);
    return this;
};
/*!
 * ignore
 */ Schema.prototype._getSchema = function(path) {
    const _this = this;
    const pathschema = _this.path(path);
    const resultPath = [];
    if (pathschema) {
        pathschema.$fullPath = path;
        return pathschema;
    }
    function search(parts, schema) {
        let p = parts.length + 1;
        let foundschema;
        let trypath;
        while(p--){
            trypath = parts.slice(0, p).join('.');
            foundschema = schema.path(trypath);
            if (foundschema) {
                resultPath.push(trypath);
                if (foundschema.caster) {
                    // array of Mixed?
                    if (foundschema.caster instanceof MongooseTypes.Mixed) {
                        foundschema.caster.$fullPath = resultPath.join('.');
                        return foundschema.caster;
                    }
                    // Now that we found the array, we need to check if there
                    // are remaining document paths to look up for casting.
                    // Also we need to handle array.$.path since schema.path
                    // doesn't work for that.
                    // If there is no foundschema.schema we are dealing with
                    // a path like array.$
                    if (p !== parts.length) {
                        if (p + 1 === parts.length && foundschema.$embeddedSchemaType && (parts[p] === '$' || isArrayFilter(parts[p]))) {
                            return foundschema.$embeddedSchemaType;
                        }
                        if (foundschema.schema) {
                            let ret;
                            if (parts[p] === '$' || isArrayFilter(parts[p])) {
                                if (p + 1 === parts.length) {
                                    // comments.$
                                    return foundschema.$embeddedSchemaType;
                                }
                                // comments.$.comments.$.title
                                ret = search(parts.slice(p + 1), foundschema.schema);
                                if (ret) {
                                    ret.$parentSchemaDocArray = ret.$parentSchemaDocArray || (foundschema.schema.$isSingleNested ? null : foundschema);
                                }
                                return ret;
                            }
                            // this is the last path of the selector
                            ret = search(parts.slice(p), foundschema.schema);
                            if (ret) {
                                ret.$parentSchemaDocArray = ret.$parentSchemaDocArray || (foundschema.schema.$isSingleNested ? null : foundschema);
                            }
                            return ret;
                        }
                    }
                } else if (foundschema.$isSchemaMap) {
                    if (p >= parts.length) {
                        return foundschema;
                    }
                    // Any path in the map will be an instance of the map's embedded schematype
                    if (p + 1 >= parts.length) {
                        return foundschema.$__schemaType;
                    }
                    if (foundschema.$__schemaType instanceof MongooseTypes.Mixed) {
                        return foundschema.$__schemaType;
                    }
                    if (foundschema.$__schemaType.schema != null) {
                        // Map of docs
                        const ret = search(parts.slice(p + 1), foundschema.$__schemaType.schema);
                        return ret;
                    }
                }
                foundschema.$fullPath = resultPath.join('.');
                return foundschema;
            }
        }
    }
    // look for arrays
    const parts = path.split('.');
    for(let i = 0; i < parts.length; ++i){
        if (parts[i] === '$' || isArrayFilter(parts[i])) {
            // Re: gh-5628, because `schema.path()` doesn't take $ into account.
            parts[i] = '0';
        }
        if (numberRE.test(parts[i])) {
            parts[i] = '$';
        }
    }
    return search(parts, _this);
};
/*!
 * ignore
 */ Schema.prototype._getPathType = function(path) {
    const _this = this;
    const pathschema = _this.path(path);
    if (pathschema) {
        return 'real';
    }
    function search(parts, schema) {
        let p = parts.length + 1, foundschema, trypath;
        while(p--){
            trypath = parts.slice(0, p).join('.');
            foundschema = schema.path(trypath);
            if (foundschema) {
                if (foundschema.caster) {
                    // array of Mixed?
                    if (foundschema.caster instanceof MongooseTypes.Mixed) {
                        return {
                            schema: foundschema,
                            pathType: 'mixed'
                        };
                    }
                    // Now that we found the array, we need to check if there
                    // are remaining document paths to look up for casting.
                    // Also we need to handle array.$.path since schema.path
                    // doesn't work for that.
                    // If there is no foundschema.schema we are dealing with
                    // a path like array.$
                    if (p !== parts.length && foundschema.schema) {
                        if (parts[p] === '$' || isArrayFilter(parts[p])) {
                            if (p === parts.length - 1) {
                                return {
                                    schema: foundschema,
                                    pathType: 'nested'
                                };
                            }
                            // comments.$.comments.$.title
                            return search(parts.slice(p + 1), foundschema.schema);
                        }
                        // this is the last path of the selector
                        return search(parts.slice(p), foundschema.schema);
                    }
                    return {
                        schema: foundschema,
                        pathType: foundschema.$isSingleNested ? 'nested' : 'array'
                    };
                }
                return {
                    schema: foundschema,
                    pathType: 'real'
                };
            } else if (p === parts.length && schema.nested[trypath]) {
                return {
                    schema: schema,
                    pathType: 'nested'
                };
            }
        }
        return {
            schema: foundschema || schema,
            pathType: 'undefined'
        };
    }
    // look for arrays
    return search(path.split('.'), _this);
};
/**
 * Transforms the duplicate key error by checking for duplicate key error messages by path.
 * If no duplicate key error messages are found, returns the original error.
 *
 * @param {Error} error The error to transform
 * @returns {Error} The transformed error
 * @api private
 */ Schema.prototype._transformDuplicateKeyError = function _transformDuplicateKeyError(error) {
    if (!this._duplicateKeyErrorMessagesByPath) {
        return error;
    }
    if (error.code !== 11000 && error.code !== 11001) {
        return error;
    }
    if (error.keyPattern != null) {
        const keyPattern = error.keyPattern;
        const keys = Object.keys(keyPattern);
        if (keys.length !== 1) {
            return error;
        }
        const firstKey = keys[0];
        if (!this._duplicateKeyErrorMessagesByPath.hasOwnProperty(firstKey)) {
            return error;
        }
        return new MongooseError(this._duplicateKeyErrorMessagesByPath[firstKey], {
            cause: error
        });
    }
    return error;
};
/*!
 * ignore
 */ function isArrayFilter(piece) {
    return piece.startsWith('$[') && piece.endsWith(']');
}
/**
 * Called by `compile()` _right before_ compiling. Good for making any changes to
 * the schema that should respect options set by plugins, like `id`
 * @method _preCompile
 * @memberOf Schema
 * @instance
 * @api private
 */ Schema.prototype._preCompile = function _preCompile() {
    this.plugin(idGetter, {
        deduplicate: true
    });
};
/**
 * Returns a JSON schema representation of this Schema.
 *
 * By default, returns normal [JSON schema representation](https://json-schema.org/learn/getting-started-step-by-step), which is not typically what you want to use with
 * [MongoDB's `$jsonSchema` collection option](https://www.mongodb.com/docs/manual/core/schema-validation/specify-json-schema/).
 * Use the `useBsonType: true` option to return MongoDB `$jsonSchema` syntax instead.
 *
 * In addition to types, `jsonSchema()` supports the following Mongoose validators:
 * - `enum` for strings and numbers
 *
 * #### Example:
 *    const schema = new Schema({ name: String });
 *    // { required: ['_id'], properties: { name: { type: ['string', 'null'] }, _id: { type: 'string' } } }
 *    schema.toJSONSchema();
 *
 *    // { required: ['_id'], properties: { name: { bsonType: ['string', 'null'] }, _id: { bsonType: 'objectId' } } }
 *    schema.toJSONSchema({ useBsonType: true });
 *
 * @param {Object} [options]
 * @param [Boolean] [options.useBsonType=false] if true, specify each path's type using `bsonType` rather than `type` for MongoDB $jsonSchema support
 */ Schema.prototype.toJSONSchema = function toJSONSchema(options) {
    const useBsonType = options?.useBsonType ?? false;
    const result = useBsonType ? {
        required: [],
        properties: {}
    } : {
        type: 'object',
        required: [],
        properties: {}
    };
    for (const path of Object.keys(this.paths)){
        const schemaType = this.paths[path];
        // Skip Map embedded paths, maps will be handled seperately.
        if (schemaType._presplitPath.indexOf('$*') !== -1) {
            continue;
        }
        // Nested paths are stored as `nested.path` in the schema type, so create nested paths in the json schema
        // when necessary.
        const isNested = schemaType._presplitPath.length > 1;
        let jsonSchemaForPath = result;
        if (isNested) {
            for(let i = 0; i < schemaType._presplitPath.length - 1; ++i){
                const subpath = schemaType._presplitPath[i];
                if (jsonSchemaForPath.properties[subpath] == null) {
                    jsonSchemaForPath.properties[subpath] = useBsonType ? {
                        bsonType: [
                            'object',
                            'null'
                        ],
                        properties: {}
                    } : {
                        type: [
                            'object',
                            'null'
                        ],
                        properties: {}
                    };
                }
                jsonSchemaForPath = jsonSchemaForPath.properties[subpath];
            }
        }
        const lastSubpath = schemaType._presplitPath[schemaType._presplitPath.length - 1];
        let isRequired = false;
        if (path === '_id') {
            if (!jsonSchemaForPath.required) {
                jsonSchemaForPath.required = [];
            }
            jsonSchemaForPath.required.push('_id');
            isRequired = true;
        } else if (schemaType.options.required && typeof schemaType.options.required !== 'function') {
            if (!jsonSchemaForPath.required) {
                jsonSchemaForPath.required = [];
            }
            // Only `required: true` paths are required, conditional required is not required
            jsonSchemaForPath.required.push(lastSubpath);
            isRequired = true;
        }
        jsonSchemaForPath.properties[lastSubpath] = schemaType.toJSONSchema(options);
        if (schemaType.options.enum) {
            jsonSchemaForPath.properties[lastSubpath].enum = isRequired ? schemaType.options.enum : [
                ...schemaType.options.enum,
                null
            ];
        }
    }
    // Otherwise MongoDB errors with "$jsonSchema keyword 'required' cannot be an empty array"
    if (result.required.length === 0) {
        delete result.required;
    }
    return result;
};
/*!
 * Module exports.
 */ module.exports = exports = Schema;
// require down here because of reference issues
/**
 * The various built-in Mongoose Schema Types.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     const ObjectId = mongoose.Schema.Types.ObjectId;
 *
 * #### Types:
 *
 * - [String](https://mongoosejs.com/docs/schematypes.html#strings)
 * - [Number](https://mongoosejs.com/docs/schematypes.html#numbers)
 * - [Boolean](https://mongoosejs.com/docs/schematypes.html#booleans) | Bool
 * - [Array](https://mongoosejs.com/docs/schematypes.html#arrays)
 * - [Buffer](https://mongoosejs.com/docs/schematypes.html#buffers)
 * - [Date](https://mongoosejs.com/docs/schematypes.html#dates)
 * - [ObjectId](https://mongoosejs.com/docs/schematypes.html#objectids) | Oid
 * - [Mixed](https://mongoosejs.com/docs/schematypes.html#mixed)
 * - [UUID](https://mongoosejs.com/docs/schematypes.html#uuid)
 * - [BigInt](https://mongoosejs.com/docs/schematypes.html#bigint)
 * - [Double] (https://mongoosejs.com/docs/schematypes.html#double)
 * - [Int32](https://mongoosejs.com/docs/schematypes.html#int32)
 *
 * Using this exposed access to the `Mixed` SchemaType, we can use them in our schema.
 *
 *     const Mixed = mongoose.Schema.Types.Mixed;
 *     new mongoose.Schema({ _user: Mixed })
 *
 * @api public
 */ Schema.Types = MongooseTypes = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/index.js [app-route] (ecmascript)");
/*!
 * ignore
 */ exports.ObjectId = MongooseTypes.ObjectId;
}),
"[project]/backend/node_modules/mongoose/lib/driver.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ let driver = null;
module.exports.get = function() {
    return driver;
};
module.exports.set = function(v) {
    driver = v;
};
}),
"[project]/backend/node_modules/mongoose/lib/connection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const ChangeStream = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cursor/changeStream.js [app-route] (ecmascript)");
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const Schema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)");
const STATES = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connectionState.js [app-route] (ecmascript)");
const MongooseBulkWriteError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/bulkWriteError.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const ServerSelectionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/serverSelection.js [app-route] (ecmascript)");
const SyncIndexesError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/syncIndexes.js [app-route] (ecmascript)");
const applyPlugins = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/applyPlugins.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const driver = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/driver.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getDefaultBulkwriteResult = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getDefaultBulkwriteResult.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const CreateCollectionsError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/createCollectionsError.js [app-route] (ecmascript)");
const castBulkWrite = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/castBulkWrite.js [app-route] (ecmascript)");
const { modelSymbol } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)");
const isPromise = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPromise.js [app-route] (ecmascript)");
const decorateBulkWriteResult = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/decorateBulkWriteResult.js [app-route] (ecmascript)");
const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const sessionNewDocuments = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").sessionNewDocuments;
// Snapshot the native Date constructor to ensure both Date.now() and new Date() (and other Date methods)
// bypass timer mocks such as those set up by useFakeTimers().
const Date = globalThis.Date;
/**
 * A list of authentication mechanisms that don't require a password for authentication.
 * This is used by the authMechanismDoesNotRequirePassword method.
 *
 * @api private
 */ const noPasswordAuthMechanisms = [
    'MONGODB-X509'
];
/**
 * Connection constructor
 *
 * For practical reasons, a Connection equals a Db.
 *
 * @param {Mongoose} base a mongoose instance
 * @inherits NodeJS EventEmitter https://nodejs.org/api/events.html#class-eventemitter
 * @event `connecting`: Emitted when `connection.openUri()` is executed on this connection.
 * @event `connected`: Emitted when this connection successfully connects to the db. May be emitted _multiple_ times in `reconnected` scenarios.
 * @event `open`: Emitted after we `connected` and `onOpen` is executed on all of this connection's models.
 * @event `disconnecting`: Emitted when `connection.close()` was executed.
 * @event `disconnected`: Emitted after getting disconnected from the db.
 * @event `close`: Emitted after we `disconnected` and `onClose` executed on all of this connection's models.
 * @event `reconnected`: Emitted after we `connected` and subsequently `disconnected`, followed by successfully another successful connection.
 * @event `error`: Emitted when an error occurs on this connection.
 * @event `operation-start`: Emitted when a call to the MongoDB Node.js driver, like a `find()` or `insertOne()`, happens on any collection tied to this connection.
 * @event `operation-end`: Emitted when a call to the MongoDB Node.js driver, like a `find()` or `insertOne()`, either succeeds or errors.
 * @api public
 */ function Connection(base) {
    this.base = base;
    this.collections = {};
    this.models = {};
    this.config = {};
    this.replica = false;
    this.options = null;
    this.otherDbs = []; // FIXME: To be replaced with relatedDbs
    this.relatedDbs = {}; // Hashmap of other dbs that share underlying connection
    this.states = STATES;
    this._readyState = STATES.disconnected;
    this._closeCalled = false;
    this._hasOpened = false;
    this.plugins = [];
    if (typeof base === 'undefined' || !base.connections.length) {
        this.id = 0;
    } else {
        this.id = base.nextConnectionId;
    }
    // Internal queue of objects `{ fn, ctx, args }` that Mongoose calls when this connection is successfully
    // opened. In `onOpen()`, Mongoose calls every entry in `_queue` and empties the queue.
    this._queue = [];
}
/*!
 * Inherit from EventEmitter
 */ Object.setPrototypeOf(Connection.prototype, EventEmitter.prototype);
/**
 * Connection ready state
 *
 * - 0 = disconnected
 * - 1 = connected
 * - 2 = connecting
 * - 3 = disconnecting
 *
 * Each state change emits its associated event name.
 *
 * #### Example:
 *
 *     conn.on('connected', callback);
 *     conn.on('disconnected', callback);
 *
 * @property readyState
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'readyState', {
    get: function() {
        // If connection thinks it is connected, but we haven't received a heartbeat in 2 heartbeat intervals,
        // that likely means the connection is stale (potentially due to frozen AWS Lambda container)
        if (this._readyState === STATES.connected && this._lastHeartbeatAt != null && // LoadBalanced topology (behind haproxy, including Atlas serverless instances) don't use heartbeats,
        // so we can't use this check in that case.
        this.client?.topology?.s?.description?.type !== 'LoadBalanced' && typeof this.client?.topology?.s?.description?.heartbeatFrequencyMS === 'number' && Date.now() - this._lastHeartbeatAt >= this.client.topology.s.description.heartbeatFrequencyMS * 2) {
            return STATES.disconnected;
        }
        return this._readyState;
    },
    set: function(val) {
        if (!(val in STATES)) {
            throw new Error('Invalid connection state: ' + val);
        }
        if (this._readyState !== val) {
            this._readyState = val;
            // [legacy] loop over the otherDbs on this connection and change their state
            for (const db of this.otherDbs){
                db.readyState = val;
            }
            if (STATES.connected === val) {
                this._hasOpened = true;
            }
            this.emit(STATES[val]);
        }
    }
});
/**
 * Gets the value of the option `key`. Equivalent to `conn.options[key]`
 *
 * #### Example:
 *
 *     conn.get('test'); // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */ Connection.prototype.get = function getOption(key) {
    if (this.config.hasOwnProperty(key)) {
        return this.config[key];
    }
    return get(this.options, key);
};
/**
 * Sets the value of the option `key`. Equivalent to `conn.options[key] = val`
 *
 * Supported options include:
 *
 * - `maxTimeMS`: Set [`maxTimeMS`](https://mongoosejs.com/docs/api/query.html#Query.prototype.maxTimeMS()) for all queries on this connection.
 * - 'debug': If `true`, prints the operations mongoose sends to MongoDB to the console. If a writable stream is passed, it will log to that stream, without colorization. If a callback function is passed, it will receive the collection name, the method name, then all arugments passed to the method. For example, if you wanted to replicate the default logging, you could output from the callback `Mongoose: ${collectionName}.${methodName}(${methodArgs.join(', ')})`.
 *
 * #### Example:
 *
 *     conn.set('test', 'foo');
 *     conn.get('test'); // 'foo'
 *     conn.options.test; // 'foo'
 *
 * @param {String} key
 * @param {Any} val
 * @method set
 * @api public
 */ Connection.prototype.set = function setOption(key, val) {
    if (this.config.hasOwnProperty(key)) {
        this.config[key] = val;
        return val;
    }
    this.options = this.options || {};
    this.options[key] = val;
    return val;
};
/**
 * A hash of the collections associated with this connection
 *
 * @property collections
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.collections;
/**
 * The name of the database this connection points to.
 *
 * #### Example:
 *
 *     mongoose.createConnection('mongodb://127.0.0.1:27017/mydb').name; // "mydb"
 *
 * @property name
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.name;
/**
 * A [POJO](https://masteringjs.io/tutorials/fundamentals/pojo) containing
 * a map from model names to models. Contains all models that have been
 * added to this connection using [`Connection#model()`](https://mongoosejs.com/docs/api/connection.html#Connection.prototype.model()).
 *
 * #### Example:
 *
 *     const conn = mongoose.createConnection();
 *     const Test = conn.model('Test', mongoose.Schema({ name: String }));
 *
 *     Object.keys(conn.models).length; // 1
 *     conn.models.Test === Test; // true
 *
 * @property models
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.models;
/**
 * A number identifier for this connection. Used for debugging when
 * you have [multiple connections](https://mongoosejs.com/docs/connections.html#multiple_connections).
 *
 * #### Example:
 *
 *     // The default connection has `id = 0`
 *     mongoose.connection.id; // 0
 *
 *     // If you create a new connection, Mongoose increments id
 *     const conn = mongoose.createConnection();
 *     conn.id; // 1
 *
 * @property id
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.id;
/**
 * The plugins that will be applied to all models created on this connection.
 *
 * #### Example:
 *
 *     const db = mongoose.createConnection('mongodb://127.0.0.1:27017/mydb');
 *     db.plugin(() => console.log('Applied'));
 *     db.plugins.length; // 1
 *
 *     db.model('Test', new Schema({})); // Prints "Applied"
 *
 * @property plugins
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'plugins', {
    configurable: false,
    enumerable: true,
    writable: true
});
/**
 * The host name portion of the URI. If multiple hosts, such as a replica set,
 * this will contain the first host name in the URI
 *
 * #### Example:
 *
 *     mongoose.createConnection('mongodb://127.0.0.1:27017/mydb').host; // "127.0.0.1"
 *
 * @property host
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'host', {
    configurable: true,
    enumerable: true,
    writable: true
});
/**
 * The port portion of the URI. If multiple hosts, such as a replica set,
 * this will contain the port from the first host name in the URI.
 *
 * #### Example:
 *
 *     mongoose.createConnection('mongodb://127.0.0.1:27017/mydb').port; // 27017
 *
 * @property port
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'port', {
    configurable: true,
    enumerable: true,
    writable: true
});
/**
 * The username specified in the URI
 *
 * #### Example:
 *
 *     mongoose.createConnection('mongodb://val:psw@127.0.0.1:27017/mydb').user; // "val"
 *
 * @property user
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'user', {
    configurable: true,
    enumerable: true,
    writable: true
});
/**
 * The password specified in the URI
 *
 * #### Example:
 *
 *     mongoose.createConnection('mongodb://val:psw@127.0.0.1:27017/mydb').pass; // "psw"
 *
 * @property pass
 * @memberOf Connection
 * @instance
 * @api public
 */ Object.defineProperty(Connection.prototype, 'pass', {
    configurable: true,
    enumerable: true,
    writable: true
});
/**
 * The mongodb.Db instance, set when the connection is opened
 *
 * @property db
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.db;
/**
 * The MongoClient instance this connection uses to talk to MongoDB. Mongoose automatically sets this property
 * when the connection is opened.
 *
 * @property client
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.client;
/**
 * A hash of the global options that are associated with this connection
 *
 * @property config
 * @memberOf Connection
 * @instance
 * @api public
 */ Connection.prototype.config;
/**
 * Helper for `createCollection()`. Will explicitly create the given collection
 * with specified options. Used to create [capped collections](https://www.mongodb.com/docs/manual/core/capped-collections/)
 * and [views](https://www.mongodb.com/docs/manual/core/views/) from mongoose.
 *
 * Options are passed down without modification to the [MongoDB driver's `createCollection()` function](https://mongodb.github.io/node-mongodb-native/4.9/classes/Db.html#createCollection)
 *
 * @method createCollection
 * @param {string} collection The collection to create
 * @param {Object} [options] see [MongoDB driver docs](https://mongodb.github.io/node-mongodb-native/4.9/classes/Db.html#createCollection)
 * @return {Promise}
 * @api public
 */ Connection.prototype.createCollection = async function createCollection(collection, options) {
    if (typeof options === 'function' || arguments.length >= 3 && typeof arguments[2] === 'function') {
        throw new MongooseError('Connection.prototype.createCollection() no longer accepts a callback');
    }
    await this._waitForConnect();
    return this.db.createCollection(collection, options);
};
/**
 * _Requires MongoDB Server 8.0 or greater_. Executes bulk write operations across multiple models in a single operation.
 * You must specify the `model` for each operation: Mongoose will use `model` for casting and validation, as well as
 * determining which collection to apply the operation to.
 *
 * #### Example:
 *     const Test = mongoose.model('Test', new Schema({ name: String }));
 *
 *     await db.bulkWrite([
 *       { model: Test, name: 'insertOne', document: { name: 'test1' } }, // Can specify model as a Model class...
 *       { model: 'Test', name: 'insertOne', document: { name: 'test2' } } // or as a model name
 *     ], { ordered: false });
 *
 * @method bulkWrite
 * @param {Array} ops
 * @param {Object} [options]
 * @param {Boolean} [options.ordered] If false, perform unordered operations. If true, perform ordered operations.
 * @param {Session} [options.session] The session to use for the operation.
 * @return {Promise}
 * @see MongoDB https://www.mongodb.com/docs/manual/reference/command/bulkWrite/#mongodb-dbcommand-dbcmd.bulkWrite
 * @api public
 */ Connection.prototype.bulkWrite = async function bulkWrite(ops, options) {
    await this._waitForConnect();
    options = options || {};
    const ordered = options.ordered == null ? true : options.ordered;
    const asyncLocalStorage = this.base.transactionAsyncLocalStorage?.getStore();
    if ((!options || !options.hasOwnProperty('session')) && asyncLocalStorage?.session != null) {
        options = {
            ...options,
            session: asyncLocalStorage.session
        };
    }
    const now = this.base.now();
    let res = null;
    if (ordered) {
        const opsToSend = [];
        for (const op of ops){
            if (typeof op.model !== 'string' && !op.model?.[modelSymbol]) {
                throw new MongooseError('Must specify model in Connection.prototype.bulkWrite() operations');
            }
            const Model = op.model[modelSymbol] ? op.model : this.model(op.model);
            if (op.name == null) {
                throw new MongooseError('Must specify operation name in Connection.prototype.bulkWrite()');
            }
            if (!castBulkWrite.cast.hasOwnProperty(op.name)) {
                throw new MongooseError(`Unrecognized bulkWrite() operation name ${op.name}`);
            }
            await castBulkWrite.cast[op.name](Model, op, options, now);
            opsToSend.push({
                ...op,
                namespace: Model.namespace()
            });
        }
        res = await this.client.bulkWrite(opsToSend, options);
    } else {
        const validOps = [];
        const validOpIndexes = [];
        let validationErrors = [];
        const asyncValidations = [];
        const results = [];
        for(let i = 0; i < ops.length; ++i){
            const op = ops[i];
            if (typeof op.model !== 'string' && !op.model?.[modelSymbol]) {
                const error = new MongooseError('Must specify model in Connection.prototype.bulkWrite() operations');
                validationErrors.push({
                    index: i,
                    error: error
                });
                results[i] = error;
                continue;
            }
            let Model;
            try {
                Model = op.model[modelSymbol] ? op.model : this.model(op.model);
            } catch (error) {
                validationErrors.push({
                    index: i,
                    error: error
                });
                continue;
            }
            if (op.name == null) {
                const error = new MongooseError('Must specify operation name in Connection.prototype.bulkWrite()');
                validationErrors.push({
                    index: i,
                    error: error
                });
                results[i] = error;
                continue;
            }
            if (!castBulkWrite.cast.hasOwnProperty(op.name)) {
                const error = new MongooseError(`Unrecognized bulkWrite() operation name ${op.name}`);
                validationErrors.push({
                    index: i,
                    error: error
                });
                results[i] = error;
                continue;
            }
            let maybePromise = null;
            try {
                maybePromise = castBulkWrite.cast[op.name](Model, op, options, now);
            } catch (error) {
                validationErrors.push({
                    index: i,
                    error: error
                });
                results[i] = error;
                continue;
            }
            if (isPromise(maybePromise)) {
                asyncValidations.push(maybePromise.then(()=>{
                    validOps.push({
                        ...op,
                        namespace: Model.namespace()
                    });
                    validOpIndexes.push(i);
                }, (error)=>{
                    validationErrors.push({
                        index: i,
                        error: error
                    });
                    results[i] = error;
                }));
            } else {
                validOps.push({
                    ...op,
                    namespace: Model.namespace()
                });
                validOpIndexes.push(i);
            }
        }
        if (asyncValidations.length > 0) {
            await Promise.all(asyncValidations);
        }
        validationErrors = validationErrors.sort((v1, v2)=>v1.index - v2.index).map((v)=>v.error);
        if (validOps.length === 0) {
            if (options.throwOnValidationError && validationErrors.length) {
                throw new MongooseBulkWriteError(validationErrors, results, res, 'bulkWrite');
            }
            const BulkWriteResult = this.base.driver.get().BulkWriteResult;
            const res = new BulkWriteResult(getDefaultBulkwriteResult(), false);
            return decorateBulkWriteResult(res, validationErrors, results);
        }
        let error;
        [res, error] = await this.client.bulkWrite(validOps, options).then((res)=>[
                res,
                null
            ]).catch((err)=>[
                null,
                err
            ]);
        for(let i = 0; i < validOpIndexes.length; ++i){
            results[validOpIndexes[i]] = null;
        }
        if (error) {
            if (validationErrors.length > 0) {
                decorateBulkWriteResult(error, validationErrors, results);
                error.mongoose = error.mongoose || {};
                error.mongoose.validationErrors = validationErrors;
            }
        }
        if (validationErrors.length > 0) {
            if (options.throwOnValidationError) {
                throw new MongooseBulkWriteError(validationErrors, results, res, 'bulkWrite');
            } else {
                decorateBulkWriteResult(res, validationErrors, results);
            }
        }
    }
    return res;
};
/**
 * Calls `createCollection()` on a models in a series.
 *
 * @method createCollections
 * @param {Boolean} continueOnError When true, will continue to create collections and create a new error class for the collections that errored.
 * @returns {Promise}
 * @api public
 */ Connection.prototype.createCollections = async function createCollections(options = {}) {
    const result = {};
    const errorsMap = {};
    const { continueOnError } = options;
    delete options.continueOnError;
    for (const model of Object.values(this.models)){
        try {
            result[model.modelName] = await model.createCollection({});
        } catch (err) {
            if (!continueOnError) {
                errorsMap[model.modelName] = err;
                break;
            } else {
                result[model.modelName] = err;
            }
        }
    }
    if (!continueOnError && Object.keys(errorsMap).length) {
        const message = Object.entries(errorsMap).map(([modelName, err])=>`${modelName}: ${err.message}`).join(', ');
        const createCollectionsError = new CreateCollectionsError(message, errorsMap);
        throw createCollectionsError;
    }
    return result;
};
/**
 * A convenience wrapper for `connection.client.withSession()`.
 *
 * #### Example:
 *
 *     await conn.withSession(async session => {
 *       const doc = await TestModel.findOne().session(session);
 *     });
 *
 * @method withSession
 * @param {Function} executor called with 1 argument: a `ClientSession` instance
 * @return {Promise} resolves to the return value of the executor function
 * @api public
 */ Connection.prototype.withSession = async function withSession(executor) {
    if (arguments.length === 0) {
        throw new Error('Please provide an executor function');
    }
    return await this.client.withSession(executor);
};
/**
 * _Requires MongoDB >= 3.6.0._ Starts a [MongoDB session](https://www.mongodb.com/docs/manual/release-notes/3.6/#client-sessions)
 * for benefits like causal consistency, [retryable writes](https://www.mongodb.com/docs/manual/core/retryable-writes/),
 * and [transactions](https://thecodebarbarian.com/a-node-js-perspective-on-mongodb-4-transactions.html).
 *
 * #### Example:
 *
 *     const session = await conn.startSession();
 *     let doc = await Person.findOne({ name: 'Ned Stark' }, null, { session });
 *     await doc.deleteOne();
 *     // `doc` will always be null, even if reading from a replica set
 *     // secondary. Without causal consistency, it is possible to
 *     // get a doc back from the below query if the query reads from a
 *     // secondary that is experiencing replication lag.
 *     doc = await Person.findOne({ name: 'Ned Stark' }, null, { session, readPreference: 'secondary' });
 *
 *
 * @method startSession
 * @param {Object} [options] see the [mongodb driver options](https://mongodb.github.io/node-mongodb-native/4.9/classes/MongoClient.html#startSession)
 * @param {Boolean} [options.causalConsistency=true] set to false to disable causal consistency
 * @return {Promise<ClientSession>} promise that resolves to a MongoDB driver `ClientSession`
 * @api public
 */ Connection.prototype.startSession = async function startSession(options) {
    if (arguments.length >= 2 && typeof arguments[1] === 'function') {
        throw new MongooseError('Connection.prototype.startSession() no longer accepts a callback');
    }
    await this._waitForConnect();
    const session = this.client.startSession(options);
    return session;
};
/**
 * _Requires MongoDB >= 3.6.0._ Executes the wrapped async function
 * in a transaction. Mongoose will commit the transaction if the
 * async function executes successfully and attempt to retry if
 * there was a retriable error.
 *
 * Calls the MongoDB driver's [`session.withTransaction()`](https://mongodb.github.io/node-mongodb-native/4.9/classes/ClientSession.html#withTransaction),
 * but also handles resetting Mongoose document state as shown below.
 *
 * #### Example:
 *
 *     const doc = new Person({ name: 'Will Riker' });
 *     await db.transaction(async function setRank(session) {
 *       doc.rank = 'Captain';
 *       await doc.save({ session });
 *       doc.isNew; // false
 *
 *       // Throw an error to abort the transaction
 *       throw new Error('Oops!');
 *     },{ readPreference: 'primary' }).catch(() => {});
 *
 *     // true, `transaction()` reset the document's state because the
 *     // transaction was aborted.
 *     doc.isNew;
 *
 * @method transaction
 * @param {Function} fn Function to execute in a transaction
 * @param {mongodb.TransactionOptions} [options] Optional settings for the transaction
 * @return {Promise<Any>} promise that is fulfilled if Mongoose successfully committed the transaction, or rejects if the transaction was aborted or if Mongoose failed to commit the transaction. If fulfilled, the promise resolves to a MongoDB command result.
 * @api public
 */ Connection.prototype.transaction = function transaction(fn, options) {
    return this.startSession().then((session)=>{
        session[sessionNewDocuments] = new Map();
        return session.withTransaction(()=>_wrapUserTransaction(fn, session, this.base), options).then((res)=>{
            delete session[sessionNewDocuments];
            return res;
        }).catch((err)=>{
            delete session[sessionNewDocuments];
            throw err;
        }).finally(()=>{
            session.endSession().catch(()=>{});
        });
    });
};
/*!
 * Reset document state in between transaction retries re: gh-13698
 */ async function _wrapUserTransaction(fn, session, mongoose) {
    try {
        const res = mongoose.transactionAsyncLocalStorage == null ? await fn(session) : await new Promise((resolve)=>{
            mongoose.transactionAsyncLocalStorage.run({
                session
            }, ()=>resolve(fn(session)));
        });
        return res;
    } catch (err) {
        _resetSessionDocuments(session);
        throw err;
    }
}
/*!
 * If transaction was aborted, we need to reset newly inserted documents' `isNew`.
 */ function _resetSessionDocuments(session) {
    for (const doc of session[sessionNewDocuments].keys()){
        const state = session[sessionNewDocuments].get(doc);
        if (state.hasOwnProperty('isNew')) {
            doc.$isNew = state.isNew;
        }
        if (state.hasOwnProperty('versionKey')) {
            doc.set(doc.schema.options.versionKey, state.versionKey);
        }
        if (state.modifiedPaths.length > 0 && doc.$__.activePaths.states.modify == null) {
            doc.$__.activePaths.states.modify = {};
        }
        for (const path of state.modifiedPaths){
            const currentState = doc.$__.activePaths.paths[path];
            if (currentState != null) {
                delete doc.$__.activePaths[currentState][path];
            }
            doc.$__.activePaths.paths[path] = 'modify';
            doc.$__.activePaths.states.modify[path] = true;
        }
        for (const path of state.atomics.keys()){
            const val = doc.$__getValue(path);
            if (val == null) {
                continue;
            }
            val[arrayAtomicsSymbol] = state.atomics.get(path);
        }
    }
}
/**
 * Helper for `dropCollection()`. Will delete the given collection, including
 * all documents and indexes.
 *
 * @method dropCollection
 * @param {string} collection The collection to delete
 * @return {Promise}
 * @api public
 */ Connection.prototype.dropCollection = async function dropCollection(collection) {
    if (arguments.length >= 2 && typeof arguments[1] === 'function') {
        throw new MongooseError('Connection.prototype.dropCollection() no longer accepts a callback');
    }
    await this._waitForConnect();
    return this.db.dropCollection(collection);
};
/**
 * Waits for connection to be established, so the connection has a `client`
 *
 * @param {Boolean} [noTimeout=false] if set, don't put a timeout on the operation. Used internally so `mongoose.model()` doesn't leave open handles.
 * @return Promise
 * @api private
 */ Connection.prototype._waitForConnect = async function _waitForConnect(noTimeout) {
    if ((this.readyState === STATES.connecting || this.readyState === STATES.disconnected) && this._shouldBufferCommands()) {
        const bufferTimeoutMS = this._getBufferTimeoutMS();
        let timeout = null;
        let timedOut = false;
        // The element that this function pushes onto `_queue`, stored to make it easy to remove later
        const queueElement = {};
        // Mongoose executes all elements in `_queue` when initial connection succeeds in `onOpen()`.
        const waitForConnectPromise = new Promise((resolve)=>{
            queueElement.fn = resolve;
            this._queue.push(queueElement);
        });
        if (noTimeout) {
            await waitForConnectPromise;
        } else {
            await Promise.race([
                waitForConnectPromise,
                new Promise((resolve)=>{
                    timeout = setTimeout(()=>{
                        timedOut = true;
                        resolve();
                    }, bufferTimeoutMS);
                })
            ]);
        }
        if (timedOut) {
            const index = this._queue.indexOf(queueElement);
            if (index !== -1) {
                this._queue.splice(index, 1);
            }
            const message = 'Connection operation buffering timed out after ' + bufferTimeoutMS + 'ms';
            throw new MongooseError(message);
        } else if (timeout != null) {
            // Not strictly necessary, but avoid the extra overhead of creating a new MongooseError
            // in case of success
            clearTimeout(timeout);
        }
    }
};
/*!
 * Get the default buffer timeout for this connection
 */ Connection.prototype._getBufferTimeoutMS = function _getBufferTimeoutMS() {
    if (this.config.bufferTimeoutMS != null) {
        return this.config.bufferTimeoutMS;
    }
    if (this.base != null && this.base.get('bufferTimeoutMS') != null) {
        return this.base.get('bufferTimeoutMS');
    }
    return 10000;
};
/**
 * Helper for MongoDB Node driver's `listCollections()`.
 * Returns an array of collection objects.
 *
 * @method listCollections
 * @return {Promise<Collection[]>}
 * @api public
 */ Connection.prototype.listCollections = async function listCollections() {
    await this._waitForConnect();
    const cursor = this.db.listCollections();
    return await cursor.toArray();
};
/**
 * Helper for MongoDB Node driver's `listDatabases()`.
 * Returns an object with a `databases` property that contains an
 * array of database objects.
 *
 * #### Example:
 *     const { databases } = await mongoose.connection.listDatabases();
 *     databases; // [{ name: 'mongoose_test', sizeOnDisk: 0, empty: false }]
 *
 * @method listCollections
 * @return {Promise<{ databases: Array<{ name: string }> }>}
 * @api public
 */ Connection.prototype.listDatabases = async function listDatabases() {
    // Implemented in `lib/drivers/node-mongodb-native/connection.js`
    throw new MongooseError('listDatabases() not implemented by driver');
};
/**
 * Helper for `dropDatabase()`. Deletes the given database, including all
 * collections, documents, and indexes.
 *
 * #### Example:
 *
 *     const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/mydb');
 *     // Deletes the entire 'mydb' database
 *     await conn.dropDatabase();
 *
 * @method dropDatabase
 * @return {Promise}
 * @api public
 */ Connection.prototype.dropDatabase = async function dropDatabase() {
    if (arguments.length >= 1 && typeof arguments[0] === 'function') {
        throw new MongooseError('Connection.prototype.dropDatabase() no longer accepts a callback');
    }
    await this._waitForConnect();
    // If `dropDatabase()` is called, this model's collection will not be
    // init-ed. It is sufficiently common to call `dropDatabase()` after
    // `mongoose.connect()` but before creating models that we want to
    // support this. See gh-6796
    for (const model of Object.values(this.models)){
        delete model.$init;
    }
    return this.db.dropDatabase();
};
/*!
 * ignore
 */ Connection.prototype._shouldBufferCommands = function _shouldBufferCommands() {
    if (this.config.bufferCommands != null) {
        return this.config.bufferCommands;
    }
    if (this.base.get('bufferCommands') != null) {
        return this.base.get('bufferCommands');
    }
    return true;
};
/**
 * error
 *
 * Graceful error handling, passes error to callback
 * if available, else emits error on the connection.
 *
 * @param {Error} err
 * @param {Function} callback optional
 * @emits "error" Emits the `error` event with the given `err`, unless a callback is specified
 * @returns {Promise|null} Returns a rejected Promise if no `callback` is given.
 * @api private
 */ Connection.prototype.error = function error(err, callback) {
    if (callback) {
        callback(err);
        return null;
    }
    if (this.listeners('error').length > 0) {
        this.emit('error', err);
    }
    return Promise.reject(err);
};
/**
 * Called when the connection is opened
 *
 * @emits "open"
 * @api private
 */ Connection.prototype.onOpen = function() {
    this.readyState = STATES.connected;
    for (const d of this._queue){
        d.fn.apply(d.ctx, d.args);
    }
    this._queue = [];
    // avoid having the collection subscribe to our event emitter
    // to prevent 0.3 warning
    for(const i in this.collections){
        if (utils.object.hasOwnProperty(this.collections, i)) {
            this.collections[i].onOpen();
        }
    }
    this.emit('open');
};
/**
 * Opens the connection with a URI using `MongoClient.connect()`.
 *
 * @param {String} uri The URI to connect with.
 * @param {Object} [options] Passed on to [`MongoClient.connect`](https://mongodb.github.io/node-mongodb-native/4.9/classes/MongoClient.html#connect-1)
 * @param {Boolean} [options.bufferCommands=true] Mongoose specific option. Set to false to [disable buffering](https://mongoosejs.com/docs/faq.html#callback_never_executes) on all models associated with this connection.
 * @param {Number} [options.bufferTimeoutMS=10000] Mongoose specific option. If `bufferCommands` is true, Mongoose will throw an error after `bufferTimeoutMS` if the operation is still buffered.
 * @param {String} [options.dbName] The name of the database we want to use. If not provided, use database name from connection string.
 * @param {String} [options.user] username for authentication, equivalent to `options.auth.username`. Maintained for backwards compatibility.
 * @param {String} [options.pass] password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility.
 * @param {Number} [options.maxPoolSize=100] The maximum number of sockets the MongoDB driver will keep open for this connection. Keep in mind that MongoDB only allows one operation per socket at a time, so you may want to increase this if you find you have a few slow queries that are blocking faster queries from proceeding. See [Slow Trains in MongoDB and Node.js](https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs).
 * @param {Number} [options.minPoolSize=0] The minimum number of sockets the MongoDB driver will keep open for this connection. Keep in mind that MongoDB only allows one operation per socket at a time, so you may want to increase this if you find you have a few slow queries that are blocking faster queries from proceeding. See [Slow Trains in MongoDB and Node.js](https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs).
 * @param {Number} [options.serverSelectionTimeoutMS] If `useUnifiedTopology = true`, the MongoDB driver will try to find a server to send any given operation to, and keep retrying for `serverSelectionTimeoutMS` milliseconds before erroring out. If not set, the MongoDB driver defaults to using `30000` (30 seconds).
 * @param {Number} [options.heartbeatFrequencyMS] If `useUnifiedTopology = true`, the MongoDB driver sends a heartbeat every `heartbeatFrequencyMS` to check on the status of the connection. A heartbeat is subject to `serverSelectionTimeoutMS`, so the MongoDB driver will retry failed heartbeats for up to 30 seconds by default. Mongoose only emits a `'disconnected'` event after a heartbeat has failed, so you may want to decrease this setting to reduce the time between when your server goes down and when Mongoose emits `'disconnected'`. We recommend you do **not** set this setting below 1000, too many heartbeats can lead to performance degradation.
 * @param {Boolean} [options.autoIndex=true] Mongoose-specific option. Set to false to disable automatic index creation for all models associated with this connection.
 * @param {Class} [options.promiseLibrary] Sets the [underlying driver's promise library](https://mongodb.github.io/node-mongodb-native/4.9/interfaces/MongoClientOptions.html#promiseLibrary).
 * @param {Number} [options.socketTimeoutMS=0] How long the MongoDB driver will wait before killing a socket due to inactivity _after initial connection_. A socket may be inactive because of either no activity or a long-running operation. `socketTimeoutMS` defaults to 0, which means Node.js will not time out the socket due to inactivity. This option is passed to [Node.js `socket#setTimeout()` function](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback) after the MongoDB driver successfully completes.
 * @param {Number} [options.family=0] Passed transparently to [Node.js' `dns.lookup()`](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) function. May be either `0, `4`, or `6`. `4` means use IPv4 only, `6` means use IPv6 only, `0` means try both.
 * @param {Boolean} [options.autoCreate=false] Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection.
 * @returns {Promise<Connection>}
 * @api public
 */ Connection.prototype.openUri = async function openUri(uri, options) {
    if (this.readyState === STATES.connecting || this.readyState === STATES.connected) {
        if (this._connectionString === uri) {
            return this;
        }
    }
    this._closeCalled = false;
    // Internal option to skip `await this.$initialConnection` in
    // this function for `createConnection()`. Because otherwise
    // `createConnection()` would have an uncatchable error.
    let _fireAndForget = false;
    if (options && '_fireAndForget' in options) {
        _fireAndForget = options._fireAndForget;
        delete options._fireAndForget;
    }
    try {
        _validateArgs.apply(arguments);
    } catch (err) {
        if (_fireAndForget) {
            throw err;
        }
        this.$initialConnection = Promise.reject(err);
        throw err;
    }
    this.$initialConnection = this.createClient(uri, options).then(()=>this).catch((err)=>{
        this.readyState = STATES.disconnected;
        if (this.listeners('error').length > 0) {
            immediate(()=>this.emit('error', err));
        }
        throw err;
    });
    for (const model of Object.values(this.models)){
        // Errors handled internally, so safe to ignore error
        model.init().catch(function $modelInitNoop() {});
    }
    // `createConnection()` calls this `openUri()` function without
    // awaiting on the result, so we set this option to rely on
    // `asPromise()` to handle any errors.
    if (_fireAndForget) {
        return this;
    }
    try {
        await this.$initialConnection;
    } catch (err) {
        throw _handleConnectionErrors(err);
    }
    return this;
};
/**
 * Listen to events in the Connection
 *
 * @param {String} event The event to listen on
 * @param {Function} callback
 * @see Connection#readyState https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
 *
 * @method on
 * @instance
 * @memberOf Connection
 * @api public
 */ // Treat `on('error')` handlers as handling the initialConnection promise
// to avoid uncaught exceptions when using `on('error')`. See gh-14377.
Connection.prototype.on = function on(event, callback) {
    if (event === 'error' && this.$initialConnection) {
        this.$initialConnection.catch(()=>{});
    }
    return EventEmitter.prototype.on.call(this, event, callback);
};
/**
 * Listen to a event once in the Connection
 *
 * @param {String} event The event to listen on
 * @param {Function} callback
 * @see Connection#readyState https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
 *
 * @method once
 * @instance
 * @memberOf Connection
 * @api public
 */ // Treat `on('error')` handlers as handling the initialConnection promise
// to avoid uncaught exceptions when using `on('error')`. See gh-14377.
Connection.prototype.once = function on(event, callback) {
    if (event === 'error' && this.$initialConnection) {
        this.$initialConnection.catch(()=>{});
    }
    return EventEmitter.prototype.once.call(this, event, callback);
};
/*!
 * ignore
 */ function _validateArgs(uri, options, callback) {
    if (typeof options === 'function' && callback == null) {
        throw new MongooseError('Connection.prototype.openUri() no longer accepts a callback');
    } else if (typeof callback === 'function') {
        throw new MongooseError('Connection.prototype.openUri() no longer accepts a callback');
    }
}
/*!
 * ignore
 */ function _handleConnectionErrors(err) {
    if (err?.name === 'MongoServerSelectionError') {
        const originalError = err;
        err = new ServerSelectionError();
        err.assimilateError(originalError);
    }
    return err;
}
/**
 * Destroy the connection. Similar to [`.close`](https://mongoosejs.com/docs/api/connection.html#Connection.prototype.close()),
 * but also removes the connection from Mongoose's `connections` list and prevents the
 * connection from ever being re-opened.
 *
 * @param {Boolean} [force]
 * @returns {Promise}
 */ Connection.prototype.destroy = async function destroy(force) {
    if (typeof force === 'function' || arguments.length === 2 && typeof arguments[1] === 'function') {
        throw new MongooseError('Connection.prototype.destroy() no longer accepts a callback');
    }
    if (force != null && typeof force === 'object') {
        this.$wasForceClosed = !!force.force;
    } else {
        this.$wasForceClosed = !!force;
    }
    return this._close(force, true);
};
/**
 * Closes the connection
 *
 * @param {Boolean} [force] optional
 * @return {Promise}
 * @api public
 */ Connection.prototype.close = async function close(force) {
    if (typeof force === 'function' || arguments.length === 2 && typeof arguments[1] === 'function') {
        throw new MongooseError('Connection.prototype.close() no longer accepts a callback');
    }
    if (force != null && typeof force === 'object') {
        this.$wasForceClosed = !!force.force;
    } else {
        this.$wasForceClosed = !!force;
    }
    if (this._lastHeartbeatAt != null) {
        this._lastHeartbeatAt = null;
    }
    for (const model of Object.values(this.models)){
        // If manually disconnecting, make sure to clear each model's `$init`
        // promise, so Mongoose knows to re-run `init()` in case the
        // connection is re-opened. See gh-12047.
        delete model.$init;
    }
    return this._close(force, false);
};
/**
 * Handles closing the connection
 *
 * @param {Boolean} force
 * @param {Boolean} destroy
 * @returns {Connection} this
 * @api private
 */ Connection.prototype._close = async function _close(force, destroy) {
    const _this = this;
    const closeCalled = this._closeCalled;
    this._closeCalled = true;
    this._destroyCalled = destroy;
    if (this.client != null) {
        this.client._closeCalled = true;
        this.client._destroyCalled = destroy;
    }
    const conn = this;
    switch(this.readyState){
        case STATES.disconnected:
            if (destroy && this.base.connections.indexOf(conn) !== -1) {
                this.base.connections.splice(this.base.connections.indexOf(conn), 1);
            }
            if (!closeCalled) {
                await this.doClose(force);
                this.onClose(force);
            }
            break;
        case STATES.connected:
            this.readyState = STATES.disconnecting;
            await this.doClose(force);
            if (destroy && _this.base.connections.indexOf(conn) !== -1) {
                this.base.connections.splice(this.base.connections.indexOf(conn), 1);
            }
            this.onClose(force);
            break;
        case STATES.connecting:
            return new Promise((resolve, reject)=>{
                const _rerunClose = ()=>{
                    this.removeListener('open', _rerunClose);
                    this.removeListener('error', _rerunClose);
                    if (destroy) {
                        this.destroy(force).then(resolve, reject);
                    } else {
                        this.close(force).then(resolve, reject);
                    }
                };
                this.once('open', _rerunClose);
                this.once('error', _rerunClose);
            });
        case STATES.disconnecting:
            return new Promise((resolve)=>{
                this.once('close', ()=>{
                    if (destroy && this.base.connections.indexOf(conn) !== -1) {
                        this.base.connections.splice(this.base.connections.indexOf(conn), 1);
                    }
                    resolve();
                });
            });
    }
    return this;
};
/**
 * Abstract method that drivers must implement.
 *
 * @api private
 */ Connection.prototype.doClose = function doClose() {
    throw new Error('Connection#doClose unimplemented by driver');
};
/**
 * Called when the connection closes
 *
 * @emits "close"
 * @api private
 */ Connection.prototype.onClose = function onClose(force) {
    this.readyState = STATES.disconnected;
    // avoid having the collection subscribe to our event emitter
    // to prevent 0.3 warning
    for(const i in this.collections){
        if (utils.object.hasOwnProperty(this.collections, i)) {
            this.collections[i].onClose(force);
        }
    }
    this.emit('close', force);
    const wasForceClosed = typeof force === 'object' && force !== null ? force.force : force;
    for (const db of this.otherDbs){
        this._destroyCalled ? db.destroy({
            force: wasForceClosed,
            skipCloseClient: true
        }) : db.close({
            force: wasForceClosed,
            skipCloseClient: true
        });
    }
};
/**
 * Retrieves a raw collection instance, creating it if not cached.
 * This method returns a thin wrapper around a [MongoDB Node.js driver collection]([MongoDB Node.js driver collection](https://mongodb.github.io/node-mongodb-native/Next/classes/Collection.html)).
 * Using a Collection bypasses Mongoose middleware, validation, and casting,
 * letting you use [MongoDB Node.js driver](https://mongodb.github.io/node-mongodb-native/) functionality directly.
 *
 * @param {String} name of the collection
 * @param {Object} [options] optional collection options
 * @return {Collection} collection instance
 * @api public
 */ Connection.prototype.collection = function(name, options) {
    const defaultOptions = {
        autoIndex: this.config.autoIndex != null ? this.config.autoIndex : this.base.options.autoIndex,
        autoCreate: this.config.autoCreate != null ? this.config.autoCreate : this.base.options.autoCreate,
        autoSearchIndex: this.config.autoSearchIndex != null ? this.config.autoSearchIndex : this.base.options.autoSearchIndex
    };
    options = Object.assign({}, defaultOptions, options ? clone(options) : {});
    options.$wasForceClosed = this.$wasForceClosed;
    const Collection = this.base && this.base.__driver && this.base.__driver.Collection || driver.get().Collection;
    if (!(name in this.collections)) {
        this.collections[name] = new Collection(name, this, options);
    }
    return this.collections[name];
};
/**
 * Declares a plugin executed on all schemas you pass to `conn.model()`
 *
 * Equivalent to calling `.plugin(fn)` on each schema you create.
 *
 * #### Example:
 *
 *     const db = mongoose.createConnection('mongodb://127.0.0.1:27017/mydb');
 *     db.plugin(() => console.log('Applied'));
 *     db.plugins.length; // 1
 *
 *     db.model('Test', new Schema({})); // Prints "Applied"
 *
 * @param {Function} fn plugin callback
 * @param {Object} [opts] optional options
 * @return {Connection} this
 * @see plugins https://mongoosejs.com/docs/plugins.html
 * @api public
 */ Connection.prototype.plugin = function(fn, opts) {
    this.plugins.push([
        fn,
        opts
    ]);
    return this;
};
/**
 * Defines or retrieves a model.
 *
 *     const mongoose = require('mongoose');
 *     const db = mongoose.createConnection(..);
 *     db.model('Venue', new Schema(..));
 *     const Ticket = db.model('Ticket', new Schema(..));
 *     const Venue = db.model('Venue');
 *
 * _When no `collection` argument is passed, Mongoose produces a collection name by passing the model `name` to the `utils.toCollectionName` method. This method pluralizes the name. If you don't like this behavior, either pass a collection name or set your schemas collection name option._
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String }, { collection: 'actor' });
 *
 *     // or
 *
 *     schema.set('collection', 'actor');
 *
 *     // or
 *
 *     const collectionName = 'actor'
 *     const M = conn.model('Actor', schema, collectionName)
 *
 * @param {String|Function} name the model name or class extending Model
 * @param {Schema} [schema] a schema. necessary when defining a model
 * @param {String} [collection] name of mongodb collection (optional) if not given it will be induced from model name
 * @param {Object} [options]
 * @param {Boolean} [options.overwriteModels=false] If true, overwrite existing models with the same name to avoid `OverwriteModelError`
 * @see Mongoose#model https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.model()
 * @return {Model} The compiled model
 * @api public
 */ Connection.prototype.model = function model(name, schema, collection, options) {
    if (!(this instanceof Connection)) {
        throw new MongooseError('`connection.model()` should not be run with ' + '`new`. If you are doing `new db.model(foo)(bar)`, use ' + '`db.model(foo)(bar)` instead');
    }
    let fn;
    if (typeof name === 'function') {
        fn = name;
        name = fn.name;
    }
    // collection name discovery
    if (typeof schema === 'string') {
        collection = schema;
        schema = false;
    }
    if (utils.isObject(schema)) {
        if (!schema.instanceOfSchema) {
            schema = new Schema(schema);
        } else if (!(schema instanceof this.base.Schema)) {
            schema = schema._clone(this.base.Schema);
        }
    }
    if (schema && !schema.instanceOfSchema) {
        throw new Error('The 2nd parameter to `mongoose.model()` should be a ' + 'schema or a POJO');
    }
    const defaultOptions = {
        cache: false,
        overwriteModels: this.base.options.overwriteModels
    };
    const opts = Object.assign(defaultOptions, options, {
        connection: this
    });
    if (this.models[name] && !collection && opts.overwriteModels !== true) {
        // model exists but we are not subclassing with custom collection
        if (schema && schema.instanceOfSchema && schema !== this.models[name].schema) {
            throw new MongooseError.OverwriteModelError(name);
        }
        return this.models[name];
    }
    let model;
    if (schema && schema.instanceOfSchema) {
        applyPlugins(schema, this.plugins, null, '$connectionPluginsApplied');
        // compile a model
        model = this.base._model(fn || name, schema, collection, opts);
        // only the first model with this name is cached to allow
        // for one-offs with custom collection names etc.
        if (!this.models[name]) {
            this.models[name] = model;
        }
        // Errors handled internally, so safe to ignore error
        model.init().catch(function $modelInitNoop() {});
        return model;
    }
    if (this.models[name] && collection) {
        // subclassing current model with alternate collection
        model = this.models[name];
        schema = model.prototype.schema;
        const sub = model.__subclass(this, schema, collection);
        // do not cache the sub model
        return sub;
    }
    if (arguments.length === 1) {
        model = this.models[name];
        if (!model) {
            throw new MongooseError.MissingSchemaError(name);
        }
        return model;
    }
    if (!model) {
        throw new MongooseError.MissingSchemaError(name);
    }
    if (this === model.prototype.db && (!collection || collection === model.collection.name)) {
        // model already uses this connection.
        // only the first model with this name is cached to allow
        // for one-offs with custom collection names etc.
        if (!this.models[name]) {
            this.models[name] = model;
        }
        return model;
    }
    this.models[name] = model.__subclass(this, schema, collection);
    return this.models[name];
};
/**
 * Removes the model named `name` from this connection, if it exists. You can
 * use this function to clean up any models you created in your tests to
 * prevent OverwriteModelErrors.
 *
 * #### Example:
 *
 *     conn.model('User', new Schema({ name: String }));
 *     console.log(conn.model('User')); // Model object
 *     conn.deleteModel('User');
 *     console.log(conn.model('User')); // undefined
 *
 *     // Usually useful in a Mocha `afterEach()` hook
 *     afterEach(function() {
 *       conn.deleteModel(/.+/); // Delete every model
 *     });
 *
 * @api public
 * @param {String|RegExp} name if string, the name of the model to remove. If regexp, removes all models whose name matches the regexp.
 * @return {Connection} this
 */ Connection.prototype.deleteModel = function deleteModel(name) {
    if (typeof name === 'string') {
        const model = this.model(name);
        if (model == null) {
            return this;
        }
        const collectionName = model.collection.name;
        delete this.models[name];
        delete this.collections[collectionName];
        this.emit('deleteModel', model);
    } else if (name instanceof RegExp) {
        const pattern = name;
        const names = this.modelNames();
        for (const name of names){
            if (pattern.test(name)) {
                this.deleteModel(name);
            }
        }
    } else {
        throw new Error('First parameter to `deleteModel()` must be a string ' + 'or regexp, got "' + name + '"');
    }
    return this;
};
/**
 * Watches the entire underlying database for changes. Similar to
 * [`Model.watch()`](https://mongoosejs.com/docs/api/model.html#Model.watch()).
 *
 * This function does **not** trigger any middleware. In particular, it
 * does **not** trigger aggregate middleware.
 *
 * The ChangeStream object is an event emitter that emits the following events:
 *
 * - 'change': A change occurred, see below example
 * - 'error': An unrecoverable error occurred. In particular, change streams currently error out if they lose connection to the replica set primary. Follow [this GitHub issue](https://github.com/Automattic/mongoose/issues/6799) for updates.
 * - 'end': Emitted if the underlying stream is closed
 * - 'close': Emitted if the underlying stream is closed
 *
 * #### Example:
 *
 *     const User = conn.model('User', new Schema({ name: String }));
 *
 *     const changeStream = conn.watch().on('change', data => console.log(data));
 *
 *     // Triggers a 'change' event on the change stream.
 *     await User.create({ name: 'test' });
 *
 * @api public
 * @param {Array} [pipeline]
 * @param {Object} [options] passed without changes to [the MongoDB driver's `Db#watch()` function](https://mongodb.github.io/node-mongodb-native/4.9/classes/Db.html#watch)
 * @return {ChangeStream} mongoose-specific change stream wrapper, inherits from EventEmitter
 */ Connection.prototype.watch = function watch(pipeline, options) {
    const changeStreamThunk = (cb)=>{
        immediate(()=>{
            if (this.readyState === STATES.connecting) {
                this.once('open', function() {
                    const driverChangeStream = this.db.watch(pipeline, options);
                    cb(null, driverChangeStream);
                });
            } else {
                const driverChangeStream = this.db.watch(pipeline, options);
                cb(null, driverChangeStream);
            }
        });
    };
    const changeStream = new ChangeStream(changeStreamThunk, pipeline, options);
    return changeStream;
};
/**
 * Returns a promise that resolves when this connection
 * successfully connects to MongoDB, or rejects if this connection failed
 * to connect.
 *
 * #### Example:
 *
 *     const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/test').
 *       asPromise();
 *     conn.readyState; // 1, means Mongoose is connected
 *
 * @api public
 * @return {Promise}
 */ Connection.prototype.asPromise = async function asPromise() {
    try {
        await this.$initialConnection;
        return this;
    } catch (err) {
        throw _handleConnectionErrors(err);
    }
};
/**
 * Returns an array of model names created on this connection.
 * @api public
 * @return {String[]}
 */ Connection.prototype.modelNames = function modelNames() {
    return Object.keys(this.models);
};
/**
 * Returns if the connection requires authentication after it is opened. Generally if a
 * username and password are both provided than authentication is needed, but in some cases a
 * password is not required.
 *
 * @api private
 * @return {Boolean} true if the connection should be authenticated after it is opened, otherwise false.
 */ Connection.prototype.shouldAuthenticate = function shouldAuthenticate() {
    return this.user != null && (this.pass != null || this.authMechanismDoesNotRequirePassword());
};
/**
 * Returns a boolean value that specifies if the current authentication mechanism needs a
 * password to authenticate according to the auth objects passed into the openUri methods.
 *
 * @api private
 * @return {Boolean} true if the authentication mechanism specified in the options object requires
 *  a password, otherwise false.
 */ Connection.prototype.authMechanismDoesNotRequirePassword = function authMechanismDoesNotRequirePassword() {
    if (this.options && this.options.auth) {
        return noPasswordAuthMechanisms.indexOf(this.options.auth.authMechanism) >= 0;
    }
    return true;
};
/**
 * Returns a boolean value that specifies if the provided objects object provides enough
 * data to authenticate with. Generally this is true if the username and password are both specified
 * but in some authentication methods, a password is not required for authentication so only a username
 * is required.
 *
 * @param {Object} [options] the options object passed into the openUri methods.
 * @api private
 * @return {Boolean} true if the provided options object provides enough data to authenticate with,
 *   otherwise false.
 */ Connection.prototype.optionsProvideAuthenticationData = function optionsProvideAuthenticationData(options) {
    return options && options.user && (options.pass || this.authMechanismDoesNotRequirePassword());
};
/**
 * Returns the [MongoDB driver `MongoClient`](https://mongodb.github.io/node-mongodb-native/4.9/classes/MongoClient.html) instance
 * that this connection uses to talk to MongoDB.
 *
 * #### Example:
 *
 *     const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/test').
 *       asPromise();
 *
 *     conn.getClient(); // MongoClient { ... }
 *
 * @api public
 * @return {MongoClient}
 */ Connection.prototype.getClient = function getClient() {
    return this.client;
};
/**
 * Set the [MongoDB driver `MongoClient`](https://mongodb.github.io/node-mongodb-native/4.9/classes/MongoClient.html) instance
 * that this connection uses to talk to MongoDB. This is useful if you already have a MongoClient instance, and want to
 * reuse it.
 *
 * #### Example:
 *
 *     const client = await mongodb.MongoClient.connect('mongodb://127.0.0.1:27017/test');
 *
 *     const conn = mongoose.createConnection().setClient(client);
 *
 *     conn.getClient(); // MongoClient { ... }
 *     conn.readyState; // 1, means 'CONNECTED'
 *
 * @api public
 * @param {MongClient} client The Client to set to be used.
 * @return {Connection} this
 */ Connection.prototype.setClient = function setClient() {
    throw new MongooseError('Connection#setClient not implemented by driver');
};
/*!
 * Called internally by `openUri()` to create a MongoClient instance.
 */ Connection.prototype.createClient = function createClient() {
    throw new MongooseError('Connection#createClient not implemented by driver');
};
/**
 * Syncs all the indexes for the models registered with this connection.
 *
 * @param {Object} [options]
 * @param {Boolean} [options.continueOnError] `false` by default. If set to `true`, mongoose will not throw an error if one model syncing failed, and will return an object where the keys are the names of the models, and the values are the results/errors for each model.
 * @return {Promise<Object>} Returns a Promise, when the Promise resolves the value is a list of the dropped indexes.
 */ Connection.prototype.syncIndexes = async function syncIndexes(options = {}) {
    const result = {};
    const errorsMap = {};
    const { continueOnError } = options;
    delete options.continueOnError;
    for (const model of Object.values(this.models)){
        try {
            result[model.modelName] = await model.syncIndexes(options);
        } catch (err) {
            if (!continueOnError) {
                errorsMap[model.modelName] = err;
                break;
            } else {
                result[model.modelName] = err;
            }
        }
    }
    if (!continueOnError && Object.keys(errorsMap).length) {
        const message = Object.entries(errorsMap).map(([modelName, err])=>`${modelName}: ${err.message}`).join(', ');
        const syncIndexesError = new SyncIndexesError(message, errorsMap);
        throw syncIndexesError;
    }
    return result;
};
/**
 * Switches to a different database using the same [connection pool](https://mongoosejs.com/docs/api/connectionshtml#connection_pools).
 *
 * Returns a new connection object, with the new db.
 *
 * #### Example:
 *
 *     // Connect to `initialdb` first
 *     const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/initialdb').asPromise();
 *
 *     // Creates an un-cached connection to `mydb`
 *     const db = conn.useDb('mydb');
 *     // Creates a cached connection to `mydb2`. All calls to `conn.useDb('mydb2', { useCache: true })` will return the same
 *     // connection instance as opposed to creating a new connection instance
 *     const db2 = conn.useDb('mydb2', { useCache: true });
 *
 * @method useDb
 * @memberOf Connection
 * @param {String} name The database name
 * @param {Object} [options]
 * @param {Boolean} [options.useCache=false] If true, cache results so calling `useDb()` multiple times with the same name only creates 1 connection object.
 * @param {Boolean} [options.noListener=false] If true, the connection object will not make the db listen to events on the original connection. See [issue #9961](https://github.com/Automattic/mongoose/issues/9961).
 * @return {Connection} New Connection Object
 * @api public
 */ /**
 * Runs a [db-level aggregate()](https://www.mongodb.com/docs/manual/reference/method/db.aggregate/) on this connection's underlying `db`
 *
 * @method aggregate
 * @memberOf Connection
 * @param {Array} pipeline
 * @param {Object} [options]
 * @param {Boolean} [options.cursor=false] If true, make the Aggregate resolve to a Mongoose AggregationCursor rather than an array
 * @return {Aggregate} Aggregation wrapper
 * @api public
 */ /**
 * Removes the database connection with the given name created with with `useDb()`.
 *
 * Throws an error if the database connection was not found.
 *
 * #### Example:
 *
 *     // Connect to `initialdb` first
 *     const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/initialdb').asPromise();
 *
 *     // Creates an un-cached connection to `mydb`
 *     const db = conn.useDb('mydb');
 *
 *     // Closes `db`, and removes `db` from `conn.relatedDbs` and `conn.otherDbs`
 *     await conn.removeDb('mydb');
 *
 * @method removeDb
 * @memberOf Connection
 * @param {String} name The database name
 * @return {Connection} this
 * @api public
 */ /*!
 * Module exports.
 */ Connection.STATES = STATES;
module.exports = Connection;
}),
"[project]/backend/node_modules/mongoose/lib/validOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Valid mongoose options
 */ const VALID_OPTIONS = Object.freeze([
    'allowDiskUse',
    'applyPluginsToChildSchemas',
    'applyPluginsToDiscriminators',
    'autoCreate',
    'autoIndex',
    'autoSearchIndex',
    'bufferCommands',
    'bufferTimeoutMS',
    'cloneSchemas',
    'createInitialConnection',
    'debug',
    'forceRepopulate',
    'id',
    'timestamps.createdAt.immutable',
    'maxTimeMS',
    'objectIdGetter',
    'overwriteModels',
    'returnOriginal',
    'runValidators',
    'sanitizeFilter',
    'sanitizeProjection',
    'selectPopulatedPaths',
    'setDefaultsOnInsert',
    'skipOriginalStackTraces',
    'strict',
    'strictPopulate',
    'strictQuery',
    'toJSON',
    'toObject',
    'transactionAsyncLocalStorage',
    'translateAliases'
]);
module.exports = VALID_OPTIONS;
}),
"[project]/backend/node_modules/mongoose/lib/aggregate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies
 */ const AggregationCursor = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cursor/aggregationCursor.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const Query = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/query.js [app-route] (ecmascript)");
const { applyGlobalMaxTimeMS, applyGlobalDiskUse } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/applyGlobalOption.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const prepareDiscriminatorPipeline = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/aggregate/prepareDiscriminatorPipeline.js [app-route] (ecmascript)");
const stringifyFunctionOperators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/aggregate/stringifyFunctionOperators.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const { modelSymbol } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)");
const read = Query.prototype.read;
const readConcern = Query.prototype.readConcern;
const validRedactStringValues = new Set([
    '$$DESCEND',
    '$$PRUNE',
    '$$KEEP'
]);
/**
 * Aggregate constructor used for building aggregation pipelines. Do not
 * instantiate this class directly, use [Model.aggregate()](https://mongoosejs.com/docs/api/model.html#Model.aggregate()) instead.
 *
 * #### Example:
 *
 *     const aggregate = Model.aggregate([
 *       { $project: { a: 1, b: 1 } },
 *       { $skip: 5 }
 *     ]);
 *
 *     Model.
 *       aggregate([{ $match: { age: { $gte: 21 }}}]).
 *       unwind('tags').
 *       exec();
 *
 * #### Note:
 *
 * - The documents returned are plain javascript objects, not mongoose documents (since any shape of document can be returned).
 * - Mongoose does **not** cast pipeline stages. The below will **not** work unless `_id` is a string in the database
 *
 *     new Aggregate([{ $match: { _id: '00000000000000000000000a' } }]);
 *     // Do this instead to cast to an ObjectId
 *     new Aggregate([{ $match: { _id: new mongoose.Types.ObjectId('00000000000000000000000a') } }]);
 *
 * @see MongoDB https://www.mongodb.com/docs/manual/applications/aggregation/
 * @see driver https://mongodb.github.io/node-mongodb-native/4.9/classes/Collection.html#aggregate
 * @param {Array} [pipeline] aggregation pipeline as an array of objects
 * @param {Model|Connection} [modelOrConn] the model or connection to use with this aggregate.
 * @api public
 */ function Aggregate(pipeline, modelOrConn) {
    this._pipeline = [];
    if (modelOrConn == null || modelOrConn[modelSymbol]) {
        this._model = modelOrConn;
    } else {
        this._connection = modelOrConn;
    }
    this.options = {};
    if (arguments.length === 1 && Array.isArray(pipeline)) {
        this.append.apply(this, pipeline);
    }
}
/**
 * Contains options passed down to the [aggregate command](https://www.mongodb.com/docs/manual/reference/command/aggregate/).
 * Supported options are:
 *
 * - [`allowDiskUse`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.allowDiskUse())
 * - `bypassDocumentValidation`
 * - [`collation`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.collation())
 * - `comment`
 * - [`cursor`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.cursor())
 * - [`explain`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.explain())
 * - `fieldsAsRaw`
 * - [`hint`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.hint())
 * - `let`
 * - `maxTimeMS`
 * - `raw`
 * - [`readConcern`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.readConcern())
 * - `readPreference`
 * - [`session`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.session())
 * - `writeConcern`
 *
 * @property options
 * @memberOf Aggregate
 * @api public
 */ Aggregate.prototype.options;
/**
 * Returns default options for this aggregate.
 *
 * @param {Model} model
 * @api private
 */ Aggregate.prototype._optionsForExec = function() {
    const options = this.options || {};
    const asyncLocalStorage = this.model()?.db?.base.transactionAsyncLocalStorage?.getStore();
    if (!options.hasOwnProperty('session') && asyncLocalStorage?.session != null) {
        options.session = asyncLocalStorage.session;
    }
    return options;
};
/**
 * Get/set the model that this aggregation will execute on.
 *
 * #### Example:
 *
 *     const aggregate = MyModel.aggregate([{ $match: { answer: 42 } }]);
 *     aggregate.model() === MyModel; // true
 *
 *     // Change the model. There's rarely any reason to do this.
 *     aggregate.model(SomeOtherModel);
 *     aggregate.model() === SomeOtherModel; // true
 *
 * @param {Model} [model] Set the model associated with this aggregate. If not provided, returns the already stored model.
 * @return {Model}
 * @api public
 */ Aggregate.prototype.model = function(model) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = model;
    if (model.schema != null) {
        if (this.options.readPreference == null && model.schema.options.read != null) {
            this.options.readPreference = model.schema.options.read;
        }
        if (this.options.collation == null && model.schema.options.collation != null) {
            this.options.collation = model.schema.options.collation;
        }
    }
    return model;
};
/**
 * Appends new operators to this aggregate pipeline
 *
 * #### Example:
 *
 *     aggregate.append({ $project: { field: 1 }}, { $limit: 2 });
 *
 *     // or pass an array
 *     const pipeline = [{ $match: { daw: 'Logic Audio X' }} ];
 *     aggregate.append(pipeline);
 *
 * @param {...Object|Object[]} ops operator(s) to append. Can either be a spread of objects or a single parameter of a object array.
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.append = function() {
    const args = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : [
        ...arguments
    ];
    if (!args.every(isOperator)) {
        throw new Error('Arguments must be aggregate pipeline operators');
    }
    this._pipeline = this._pipeline.concat(args);
    return this;
};
/**
 * Appends a new $addFields operator to this aggregate pipeline.
 * Requires MongoDB v3.4+ to work
 *
 * #### Example:
 *
 *     // adding new fields based on existing fields
 *     aggregate.addFields({
 *         newField: '$b.nested'
 *       , plusTen: { $add: ['$val', 10]}
 *       , sub: {
 *            name: '$a'
 *         }
 *     })
 *
 *     // etc
 *     aggregate.addFields({ salary_k: { $divide: [ "$salary", 1000 ] } });
 *
 * @param {Object} arg field specification
 * @see $addFields https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields/
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.addFields = function(arg) {
    if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
        throw new Error('Invalid addFields() argument. Must be an object');
    }
    return this.append({
        $addFields: Object.assign({}, arg)
    });
};
/**
 * Appends a new $project operator to this aggregate pipeline.
 *
 * Mongoose query [selection syntax](https://mongoosejs.com/docs/api/query.html#Query.prototype.select()) is also supported.
 *
 * #### Example:
 *
 *     // include a, include b, exclude _id
 *     aggregate.project("a b -_id");
 *
 *     // or you may use object notation, useful when
 *     // you have keys already prefixed with a "-"
 *     aggregate.project({a: 1, b: 1, _id: 0});
 *
 *     // reshaping documents
 *     aggregate.project({
 *         newField: '$b.nested'
 *       , plusTen: { $add: ['$val', 10]}
 *       , sub: {
 *            name: '$a'
 *         }
 *     })
 *
 *     // etc
 *     aggregate.project({ salary_k: { $divide: [ "$salary", 1000 ] } });
 *
 * @param {Object|String} arg field specification
 * @see projection https://www.mongodb.com/docs/manual/reference/aggregation/project/
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.project = function(arg) {
    const fields = {};
    if (typeof arg === 'object' && !Array.isArray(arg)) {
        Object.keys(arg).forEach(function(field) {
            fields[field] = arg[field];
        });
    } else if (arguments.length === 1 && typeof arg === 'string') {
        arg.split(/\s+/).forEach(function(field) {
            if (!field) {
                return;
            }
            const include = field[0] === '-' ? 0 : 1;
            if (include === 0) {
                field = field.substring(1);
            }
            fields[field] = include;
        });
    } else {
        throw new Error('Invalid project() argument. Must be string or object');
    }
    return this.append({
        $project: fields
    });
};
/**
 * Appends a new custom $group operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.group({ _id: "$department" });
 *
 * @see $group https://www.mongodb.com/docs/manual/reference/aggregation/group/
 * @method group
 * @memberOf Aggregate
 * @instance
 * @param {Object} arg $group operator contents
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new custom $match operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.match({ department: { $in: [ "sales", "engineering" ] } });
 *
 * @see $match https://www.mongodb.com/docs/manual/reference/aggregation/match/
 * @method match
 * @memberOf Aggregate
 * @instance
 * @param {Object} arg $match operator contents
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new $skip operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.skip(10);
 *
 * @see $skip https://www.mongodb.com/docs/manual/reference/aggregation/skip/
 * @method skip
 * @memberOf Aggregate
 * @instance
 * @param {Number} num number of records to skip before next stage
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new $limit operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.limit(10);
 *
 * @see $limit https://www.mongodb.com/docs/manual/reference/aggregation/limit/
 * @method limit
 * @memberOf Aggregate
 * @instance
 * @param {Number} num maximum number of records to pass to the next stage
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new $densify operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *      aggregate.densify({
 *        field: 'timestamp',
 *        range: {
 *          step: 1,
 *          unit: 'hour',
 *          bounds: [new Date('2021-05-18T00:00:00.000Z'), new Date('2021-05-18T08:00:00.000Z')]
 *        }
 *      });
 *
 * @see $densify https://www.mongodb.com/docs/manual/reference/operator/aggregation/densify/
 * @method densify
 * @memberOf Aggregate
 * @instance
 * @param {Object} arg $densify operator contents
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new $fill operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *      aggregate.fill({
 *        output: {
 *          bootsSold: { value: 0 },
 *          sandalsSold: { value: 0 },
 *          sneakersSold: { value: 0 }
 *        }
 *      });
 *
 * @see $fill https://www.mongodb.com/docs/manual/reference/operator/aggregation/fill/
 * @method fill
 * @memberOf Aggregate
 * @instance
 * @param {Object} arg $fill operator contents
 * @return {Aggregate}
 * @api public
 */ /**
 * Appends a new $geoNear operator to this aggregate pipeline.
 *
 * #### Note:
 *
 * **MUST** be used as the first operator in the pipeline.
 *
 * #### Example:
 *
 *     aggregate.near({
 *       near: { type: 'Point', coordinates: [40.724, -73.997] },
 *       distanceField: "dist.calculated", // required
 *       maxDistance: 0.008,
 *       query: { type: "public" },
 *       includeLocs: "dist.location",
 *       spherical: true,
 *     });
 *
 * @see $geoNear https://www.mongodb.com/docs/manual/reference/aggregation/geoNear/
 * @method near
 * @memberOf Aggregate
 * @instance
 * @param {Object} arg
 * @param {Object|Array<Number>} arg.near GeoJSON point or coordinates array
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.near = function(arg) {
    if (arg == null) {
        throw new MongooseError('Aggregate `near()` must be called with non-nullish argument');
    }
    if (arg.near == null) {
        throw new MongooseError('Aggregate `near()` argument must have a `near` property');
    }
    const coordinates = Array.isArray(arg.near) ? arg.near : arg.near.coordinates;
    if (typeof arg.near === 'object' && (!Array.isArray(coordinates) || coordinates.length < 2 || coordinates.find((c)=>typeof c !== 'number'))) {
        throw new MongooseError(`Aggregate \`near()\` argument has invalid coordinates, got "${coordinates}"`);
    }
    const op = {};
    op.$geoNear = arg;
    return this.append(op);
};
/*!
 * define methods
 */ 'group match skip limit out densify fill'.split(' ').forEach(function($operator) {
    Aggregate.prototype[$operator] = function(arg) {
        const op = {};
        op['$' + $operator] = arg;
        return this.append(op);
    };
});
/**
 * Appends new custom $unwind operator(s) to this aggregate pipeline.
 *
 * Note that the `$unwind` operator requires the path name to start with '$'.
 * Mongoose will prepend '$' if the specified field doesn't start '$'.
 *
 * #### Example:
 *
 *     aggregate.unwind("tags");
 *     aggregate.unwind("a", "b", "c");
 *     aggregate.unwind({ path: '$tags', preserveNullAndEmptyArrays: true });
 *
 * @see $unwind https://www.mongodb.com/docs/manual/reference/aggregation/unwind/
 * @param {String|Object|String[]|Object[]} fields the field(s) to unwind, either as field names or as [objects with options](https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/#document-operand-with-options). If passing a string, prefixing the field name with '$' is optional. If passing an object, `path` must start with '$'.
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.unwind = function() {
    const args = [
        ...arguments
    ];
    const res = [];
    for (const arg of args){
        if (arg && typeof arg === 'object') {
            res.push({
                $unwind: arg
            });
        } else if (typeof arg === 'string') {
            res.push({
                $unwind: arg[0] === '$' ? arg : '$' + arg
            });
        } else {
            throw new Error('Invalid arg "' + arg + '" to unwind(), ' + 'must be string or object');
        }
    }
    return this.append.apply(this, res);
};
/**
 * Appends a new $replaceRoot operator to this aggregate pipeline.
 *
 * Note that the `$replaceRoot` operator requires field strings to start with '$'.
 * If you are passing in a string Mongoose will prepend '$' if the specified field doesn't start '$'.
 * If you are passing in an object the strings in your expression will not be altered.
 *
 * #### Example:
 *
 *     aggregate.replaceRoot("user");
 *
 *     aggregate.replaceRoot({ x: { $concat: ['$this', '$that'] } });
 *
 * @see $replaceRoot https://www.mongodb.com/docs/manual/reference/operator/aggregation/replaceRoot
 * @param {String|Object} newRoot the field or document which will become the new root document
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.replaceRoot = function(newRoot) {
    let ret;
    if (typeof newRoot === 'string') {
        ret = newRoot.startsWith('$') ? newRoot : '$' + newRoot;
    } else {
        ret = newRoot;
    }
    return this.append({
        $replaceRoot: {
            newRoot: ret
        }
    });
};
/**
 * Appends a new $count operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.count("userCount");
 *
 * @see $count https://www.mongodb.com/docs/manual/reference/operator/aggregation/count
 * @param {String} fieldName The name of the output field which has the count as its value. It must be a non-empty string, must not start with $ and must not contain the . character.
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.count = function(fieldName) {
    return this.append({
        $count: fieldName
    });
};
/**
 * Appends a new $sortByCount operator to this aggregate pipeline. Accepts either a string field name
 * or a pipeline object.
 *
 * Note that the `$sortByCount` operator requires the new root to start with '$'.
 * Mongoose will prepend '$' if the specified field name doesn't start with '$'.
 *
 * #### Example:
 *
 *     aggregate.sortByCount('users');
 *     aggregate.sortByCount({ $mergeObjects: [ "$employee", "$business" ] })
 *
 * @see $sortByCount https://www.mongodb.com/docs/manual/reference/operator/aggregation/sortByCount/
 * @param {Object|String} arg
 * @return {Aggregate} this
 * @api public
 */ Aggregate.prototype.sortByCount = function(arg) {
    if (arg && typeof arg === 'object') {
        return this.append({
            $sortByCount: arg
        });
    } else if (typeof arg === 'string') {
        return this.append({
            $sortByCount: arg[0] === '$' ? arg : '$' + arg
        });
    } else {
        throw new TypeError('Invalid arg "' + arg + '" to sortByCount(), ' + 'must be string or object');
    }
};
/**
 * Appends new custom $lookup operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.lookup({ from: 'users', localField: 'userId', foreignField: '_id', as: 'users' });
 *
 * @see $lookup https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/#pipe._S_lookup
 * @param {Object} options to $lookup as described in the above link
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.lookup = function(options) {
    return this.append({
        $lookup: options
    });
};
/**
 * Appends new custom $graphLookup operator(s) to this aggregate pipeline, performing a recursive search on a collection.
 *
 * Note that graphLookup can only consume at most 100MB of memory, and does not allow disk use even if `{ allowDiskUse: true }` is specified.
 *
 * #### Example:
 *
 *      // Suppose we have a collection of courses, where a document might look like `{ _id: 0, name: 'Calculus', prerequisite: 'Trigonometry'}` and `{ _id: 0, name: 'Trigonometry', prerequisite: 'Algebra' }`
 *      aggregate.graphLookup({ from: 'courses', startWith: '$prerequisite', connectFromField: 'prerequisite', connectToField: 'name', as: 'prerequisites', maxDepth: 3 }) // this will recursively search the 'courses' collection up to 3 prerequisites
 *
 * @see $graphLookup https://www.mongodb.com/docs/manual/reference/operator/aggregation/graphLookup/#pipe._S_graphLookup
 * @param {Object} options to $graphLookup as described in the above link
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.graphLookup = function(options) {
    const cloneOptions = {};
    if (options) {
        if (!utils.isObject(options)) {
            throw new TypeError('Invalid graphLookup() argument. Must be an object.');
        }
        utils.mergeClone(cloneOptions, options);
        const startWith = cloneOptions.startWith;
        if (startWith && typeof startWith === 'string') {
            cloneOptions.startWith = cloneOptions.startWith.startsWith('$') ? cloneOptions.startWith : '$' + cloneOptions.startWith;
        }
    }
    return this.append({
        $graphLookup: cloneOptions
    });
};
/**
 * Appends new custom $sample operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.sample(3); // Add a pipeline that picks 3 random documents
 *
 * @see $sample https://www.mongodb.com/docs/manual/reference/operator/aggregation/sample/#pipe._S_sample
 * @param {Number} size number of random documents to pick
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.sample = function(size) {
    return this.append({
        $sample: {
            size: size
        }
    });
};
/**
 * Appends a new $sort operator to this aggregate pipeline.
 *
 * If an object is passed, values allowed are `asc`, `desc`, `ascending`, `descending`, `1`, and `-1`.
 *
 * If a string is passed, it must be a space delimited list of path names. The sort order of each path is ascending unless the path name is prefixed with `-` which will be treated as descending.
 *
 * #### Example:
 *
 *     // these are equivalent
 *     aggregate.sort({ field: 'asc', test: -1 });
 *     aggregate.sort('field -test');
 *
 * @see $sort https://www.mongodb.com/docs/manual/reference/aggregation/sort/
 * @param {Object|String} arg
 * @return {Aggregate} this
 * @api public
 */ Aggregate.prototype.sort = function(arg) {
    // TODO refactor to reuse the query builder logic
    const sort = {};
    if (getConstructorName(arg) === 'Object') {
        const desc = [
            'desc',
            'descending',
            -1
        ];
        Object.keys(arg).forEach(function(field) {
            // If sorting by text score, skip coercing into 1/-1
            if (arg[field] instanceof Object && arg[field].$meta) {
                sort[field] = arg[field];
                return;
            }
            sort[field] = desc.indexOf(arg[field]) === -1 ? 1 : -1;
        });
    } else if (arguments.length === 1 && typeof arg === 'string') {
        arg.split(/\s+/).forEach(function(field) {
            if (!field) {
                return;
            }
            const ascend = field[0] === '-' ? -1 : 1;
            if (ascend === -1) {
                field = field.substring(1);
            }
            sort[field] = ascend;
        });
    } else {
        throw new TypeError('Invalid sort() argument. Must be a string or object.');
    }
    return this.append({
        $sort: sort
    });
};
/**
 * Appends new $unionWith operator to this aggregate pipeline.
 *
 * #### Example:
 *
 *     aggregate.unionWith({ coll: 'users', pipeline: [ { $match: { _id: 1 } } ] });
 *
 * @see $unionWith https://www.mongodb.com/docs/manual/reference/operator/aggregation/unionWith
 * @param {Object} options to $unionWith query as described in the above link
 * @return {Aggregate}
 * @api public
 */ Aggregate.prototype.unionWith = function(options) {
    return this.append({
        $unionWith: options
    });
};
/**
 * Sets the readPreference option for the aggregation query.
 *
 * #### Example:
 *
 *     await Model.aggregate(pipeline).read('primaryPreferred');
 *
 * @param {String|ReadPreference} pref one of the listed preference options or their aliases
 * @param {Array} [tags] optional tags for this query.
 * @return {Aggregate} this
 * @api public
 * @see mongodb https://www.mongodb.com/docs/manual/applications/replication/#read-preference
 */ Aggregate.prototype.read = function(pref, tags) {
    read.call(this, pref, tags);
    return this;
};
/**
 * Sets the readConcern level for the aggregation query.
 *
 * #### Example:
 *
 *     await Model.aggregate(pipeline).readConcern('majority');
 *
 * @param {String} level one of the listed read concern level or their aliases
 * @see mongodb https://www.mongodb.com/docs/manual/reference/read-concern/
 * @return {Aggregate} this
 * @api public
 */ Aggregate.prototype.readConcern = function(level) {
    readConcern.call(this, level);
    return this;
};
/**
 * Appends a new $redact operator to this aggregate pipeline.
 *
 * If 3 arguments are supplied, Mongoose will wrap them with if-then-else of $cond operator respectively
 * If `thenExpr` or `elseExpr` is string, make sure it starts with $$, like `$$DESCEND`, `$$PRUNE` or `$$KEEP`.
 *
 * #### Example:
 *
 *     await Model.aggregate(pipeline).redact({
 *       $cond: {
 *         if: { $eq: [ '$level', 5 ] },
 *         then: '$$PRUNE',
 *         else: '$$DESCEND'
 *       }
 *     });
 *
 *     // $redact often comes with $cond operator, you can also use the following syntax provided by mongoose
 *     await Model.aggregate(pipeline).redact({ $eq: [ '$level', 5 ] }, '$$PRUNE', '$$DESCEND');
 *
 * @param {Object} expression redact options or conditional expression
 * @param {String|Object} [thenExpr] true case for the condition
 * @param {String|Object} [elseExpr] false case for the condition
 * @return {Aggregate} this
 * @see $redact https://www.mongodb.com/docs/manual/reference/operator/aggregation/redact/
 * @api public
 */ Aggregate.prototype.redact = function(expression, thenExpr, elseExpr) {
    if (arguments.length === 3) {
        if (typeof thenExpr === 'string' && !validRedactStringValues.has(thenExpr) || typeof elseExpr === 'string' && !validRedactStringValues.has(elseExpr)) {
            throw new Error('If thenExpr or elseExpr is string, it must be either $$DESCEND, $$PRUNE or $$KEEP');
        }
        expression = {
            $cond: {
                if: expression,
                then: thenExpr,
                else: elseExpr
            }
        };
    } else if (arguments.length !== 1) {
        throw new TypeError('Invalid arguments');
    }
    return this.append({
        $redact: expression
    });
};
/**
 * Execute the aggregation with explain
 *
 * #### Example:
 *
 *     Model.aggregate(..).explain()
 *
 * @param {String} [verbosity]
 * @return {Promise}
 */ Aggregate.prototype.explain = async function explain(verbosity) {
    if (typeof verbosity === 'function' || typeof arguments[1] === 'function') {
        throw new MongooseError('Aggregate.prototype.explain() no longer accepts a callback');
    }
    const model = this._model;
    if (!this._pipeline.length) {
        throw new Error('Aggregate has empty pipeline');
    }
    prepareDiscriminatorPipeline(this._pipeline, this._model.schema);
    await new Promise((resolve, reject)=>{
        model.hooks.execPre('aggregate', this, (error)=>{
            if (error) {
                const _opts = {
                    error: error
                };
                return model.hooks.execPost('aggregate', this, [
                    null
                ], _opts, (error)=>{
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    });
    const cursor = model.collection.aggregate(this._pipeline, this.options);
    if (verbosity == null) {
        verbosity = true;
    }
    let result = null;
    try {
        result = await cursor.explain(verbosity);
    } catch (error) {
        await new Promise((resolve, reject)=>{
            const _opts = {
                error: error
            };
            model.hooks.execPost('aggregate', this, [
                null
            ], _opts, (error)=>{
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }
    const _opts = {
        error: null
    };
    await new Promise((resolve, reject)=>{
        model.hooks.execPost('aggregate', this, [
            result
        ], _opts, (error)=>{
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
    return result;
};
/**
 * Sets the allowDiskUse option for the aggregation query
 *
 * #### Example:
 *
 *     await Model.aggregate([{ $match: { foo: 'bar' } }]).allowDiskUse(true);
 *
 * @param {Boolean} value Should tell server it can use hard drive to store data during aggregation.
 * @return {Aggregate} this
 * @see mongodb https://www.mongodb.com/docs/manual/reference/command/aggregate/
 */ Aggregate.prototype.allowDiskUse = function(value) {
    this.options.allowDiskUse = value;
    return this;
};
/**
 * Sets the hint option for the aggregation query
 *
 * #### Example:
 *
 *     Model.aggregate(..).hint({ qty: 1, category: 1 }).exec();
 *
 * @param {Object|String} value a hint object or the index name
 * @return {Aggregate} this
 * @see mongodb https://www.mongodb.com/docs/manual/reference/command/aggregate/
 */ Aggregate.prototype.hint = function(value) {
    this.options.hint = value;
    return this;
};
/**
 * Sets the session for this aggregation. Useful for [transactions](https://mongoosejs.com/docs/transactions.html).
 *
 * #### Example:
 *
 *     const session = await Model.startSession();
 *     await Model.aggregate(..).session(session);
 *
 * @param {ClientSession} session
 * @return {Aggregate} this
 * @see mongodb https://www.mongodb.com/docs/manual/reference/command/aggregate/
 */ Aggregate.prototype.session = function(session) {
    if (session == null) {
        delete this.options.session;
    } else {
        this.options.session = session;
    }
    return this;
};
/**
 * Lets you set arbitrary options, for middleware or plugins.
 *
 * #### Example:
 *
 *     const agg = Model.aggregate(..).option({ allowDiskUse: true }); // Set the `allowDiskUse` option
 *     agg.options; // `{ allowDiskUse: true }`
 *
 * @param {Object} options keys to merge into current options
 * @param {Number} [options.maxTimeMS] number limits the time this aggregation will run, see [MongoDB docs on `maxTimeMS`](https://www.mongodb.com/docs/manual/reference/operator/meta/maxTimeMS/)
 * @param {Boolean} [options.allowDiskUse] boolean if true, the MongoDB server will use the hard drive to store data during this aggregation
 * @param {Object} [options.collation] object see [`Aggregate.prototype.collation()`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.collation())
 * @param {ClientSession} [options.session] ClientSession see [`Aggregate.prototype.session()`](https://mongoosejs.com/docs/api/aggregate.html#Aggregate.prototype.session())
 * @see mongodb https://www.mongodb.com/docs/manual/reference/command/aggregate/
 * @return {Aggregate} this
 * @api public
 */ Aggregate.prototype.option = function(value) {
    for(const key in value){
        this.options[key] = value[key];
    }
    return this;
};
/**
 * Sets the `cursor` option and executes this aggregation, returning an aggregation cursor.
 * Cursors are useful if you want to process the results of the aggregation one-at-a-time
 * because the aggregation result is too big to fit into memory.
 *
 * #### Example:
 *
 *     const cursor = Model.aggregate(..).cursor({ batchSize: 1000 });
 *     cursor.eachAsync(function(doc, i) {
 *       // use doc
 *     });
 *
 * @param {Object} options
 * @param {Number} [options.batchSize] set the cursor batch size
 * @param {Boolean} [options.useMongooseAggCursor] use experimental mongoose-specific aggregation cursor (for `eachAsync()` and other query cursor semantics)
 * @return {AggregationCursor} cursor representing this aggregation
 * @api public
 * @see mongodb https://mongodb.github.io/node-mongodb-native/4.9/classes/AggregationCursor.html
 */ Aggregate.prototype.cursor = function(options) {
    this._optionsForExec();
    this.options.cursor = options || {};
    return new AggregationCursor(this); // return this;
};
/**
 * Adds a collation
 *
 * #### Example:
 *
 *     const res = await Model.aggregate(pipeline).collation({ locale: 'en_US', strength: 1 });
 *
 * @param {Object} collation options
 * @return {Aggregate} this
 * @api public
 * @see mongodb https://mongodb.github.io/node-mongodb-native/4.9/interfaces/CollationOptions.html
 */ Aggregate.prototype.collation = function(collation) {
    this.options.collation = collation;
    return this;
};
/**
 * Combines multiple aggregation pipelines.
 *
 * #### Example:
 *
 *     const res = await Model.aggregate().facet({
 *       books: [{ groupBy: '$author' }],
 *       price: [{ $bucketAuto: { groupBy: '$price', buckets: 2 } }]
 *     });
 *
 *     // Output: { books: [...], price: [{...}, {...}] }
 *
 * @param {Object} facet options
 * @return {Aggregate} this
 * @see $facet https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet/
 * @api public
 */ Aggregate.prototype.facet = function(options) {
    return this.append({
        $facet: options
    });
};
/**
 * Helper for [Atlas Text Search](https://www.mongodb.com/docs/atlas/atlas-search/tutorial/)'s
 * `$search` stage.
 *
 * #### Example:
 *
 *     const res = await Model.aggregate().
 *      search({
 *        text: {
 *          query: 'baseball',
 *          path: 'plot'
 *        }
 *      });
 *
 *     // Output: [{ plot: '...', title: '...' }]
 *
 * @param {Object} $search options
 * @return {Aggregate} this
 * @see $search https://www.mongodb.com/docs/atlas/atlas-search/tutorial/
 * @api public
 */ Aggregate.prototype.search = function(options) {
    return this.append({
        $search: options
    });
};
/**
 * Returns the current pipeline
 *
 * #### Example:
 *
 *     MyModel.aggregate().match({ test: 1 }).pipeline(); // [{ $match: { test: 1 } }]
 *
 * @return {Array} The current pipeline similar to the operation that will be executed
 * @api public
 */ Aggregate.prototype.pipeline = function() {
    return this._pipeline;
};
/**
 * Executes the aggregate pipeline on the currently bound Model.
 *
 * #### Example:
 *     const result = await aggregate.exec();
 *
 * @return {Promise}
 * @api public
 */ Aggregate.prototype.exec = async function exec() {
    if (!this._model && !this._connection) {
        throw new Error('Aggregate not bound to any Model');
    }
    if (typeof arguments[0] === 'function') {
        throw new MongooseError('Aggregate.prototype.exec() no longer accepts a callback');
    }
    if (this._connection) {
        if (!this._pipeline.length) {
            throw new MongooseError('Aggregate has empty pipeline');
        }
        this._optionsForExec();
        const cursor = await this._connection.client.db().aggregate(this._pipeline, this.options);
        return await cursor.toArray();
    }
    const model = this._model;
    const collection = this._model.collection;
    applyGlobalMaxTimeMS(this.options, model.db.options, model.base.options);
    applyGlobalDiskUse(this.options, model.db.options, model.base.options);
    this._optionsForExec();
    if (this.options && this.options.cursor) {
        return new AggregationCursor(this);
    }
    prepareDiscriminatorPipeline(this._pipeline, this._model.schema);
    stringifyFunctionOperators(this._pipeline);
    await new Promise((resolve, reject)=>{
        model.hooks.execPre('aggregate', this, (error)=>{
            if (error) {
                const _opts = {
                    error: error
                };
                return model.hooks.execPost('aggregate', this, [
                    null
                ], _opts, (error)=>{
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    });
    if (!this._pipeline.length) {
        throw new MongooseError('Aggregate has empty pipeline');
    }
    const options = clone(this.options || {});
    let result;
    try {
        const cursor = await collection.aggregate(this._pipeline, options);
        result = await cursor.toArray();
    } catch (error) {
        await new Promise((resolve, reject)=>{
            const _opts = {
                error: error
            };
            model.hooks.execPost('aggregate', this, [
                null
            ], _opts, (error)=>{
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }
    const _opts = {
        error: null
    };
    await new Promise((resolve, reject)=>{
        model.hooks.execPost('aggregate', this, [
            result
        ], _opts, (error)=>{
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
    return result;
};
/**
 * Provides a Promise-like `then` function, which will call `.exec` without a callback
 * Compatible with `await`.
 *
 * #### Example:
 *
 *     Model.aggregate(..).then(successCallback, errorCallback);
 *
 * @param {Function} [resolve] successCallback
 * @param {Function} [reject]  errorCallback
 * @return {Promise}
 */ Aggregate.prototype.then = function(resolve, reject) {
    return this.exec().then(resolve, reject);
};
/**
 * Executes the aggregation returning a `Promise` which will be
 * resolved with either the doc(s) or rejected with the error.
 * Like [`.then()`](https://mongoosejs.com/docs/api/query.html#Query.prototype.then), but only takes a rejection handler.
 * Compatible with `await`.
 *
 * @param {Function} [reject]
 * @return {Promise}
 * @api public
 */ Aggregate.prototype.catch = function(reject) {
    return this.exec().then(null, reject);
};
/**
 * Executes the aggregate returning a `Promise` which will be
 * resolved with `.finally()` chained.
 *
 * More about [Promise `finally()` in JavaScript](https://thecodebarbarian.com/using-promise-finally-in-node-js.html).
 *
 * @param {Function} [onFinally]
 * @return {Promise}
 * @api public
 */ Aggregate.prototype.finally = function(onFinally) {
    return this.exec().finally(onFinally);
};
/**
 * Returns an asyncIterator for use with [`for/await/of` loops](https://thecodebarbarian.com/getting-started-with-async-iterators-in-node-js)
 * You do not need to call this function explicitly, the JavaScript runtime
 * will call it for you.
 *
 * #### Example:
 *
 *     const agg = Model.aggregate([{ $match: { age: { $gte: 25 } } }]);
 *     for await (const doc of agg) {
 *       console.log(doc.name);
 *     }
 *
 * Node.js 10.x supports async iterators natively without any flags. You can
 * enable async iterators in Node.js 8.x using the [`--harmony_async_iteration` flag](https://github.com/tc39/proposal-async-iteration/issues/117#issuecomment-346695187).
 *
 * **Note:** This function is not set if `Symbol.asyncIterator` is undefined. If
 * `Symbol.asyncIterator` is undefined, that means your Node.js version does not
 * support async iterators.
 *
 * @method [Symbol.asyncIterator]
 * @memberOf Aggregate
 * @instance
 * @api public
 */ if (Symbol.asyncIterator != null) {
    Aggregate.prototype[Symbol.asyncIterator] = function() {
        return this.cursor({
            useMongooseAggCursor: true
        }).transformNull()._transformForAsyncIterator();
    };
}
/*!
 * Helpers
 */ /**
 * Checks whether an object is likely a pipeline operator
 *
 * @param {Object} obj object to check
 * @return {Boolean}
 * @api private
 */ function isOperator(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const k = Object.keys(obj);
    return k.length === 1 && k[0][0] === '$';
}
/**
 * Adds the appropriate `$match` pipeline step to the top of an aggregate's
 * pipeline, should it's model is a non-root discriminator type. This is
 * analogous to the `prepareDiscriminatorCriteria` function in `lib/query.js`.
 *
 * @param {Aggregate} aggregate Aggregate to prepare
 * @api private
 */ Aggregate._prepareDiscriminatorPipeline = prepareDiscriminatorPipeline;
/*!
 * Exports
 */ module.exports = Aggregate;
}),
"[project]/backend/node_modules/mongoose/lib/browserDocument.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const NodeJSDocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const Schema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)");
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const ValidationError = MongooseError.ValidationError;
const applyHooks = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/applyHooks.js [app-route] (ecmascript)");
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
/**
 * Document constructor.
 *
 * @param {Object} obj the values to set
 * @param {Object} schema
 * @param {Object} [fields] optional object containing the fields which were selected in the query returning this document and any populated paths data
 * @param {Boolean} [skipId] bool, should we auto create an ObjectId _id
 * @inherits NodeJS EventEmitter https://nodejs.org/api/events.html#class-eventemitter
 * @event `init`: Emitted on a document after it has was retrieved from the db and fully hydrated by Mongoose.
 * @event `save`: Emitted when the document is successfully saved
 * @api private
 */ function Document(obj, schema, fields, skipId, skipInit) {
    if (!(this instanceof Document)) {
        return new Document(obj, schema, fields, skipId, skipInit);
    }
    if (isObject(schema) && !schema.instanceOfSchema) {
        schema = new Schema(schema);
    }
    // When creating EmbeddedDocument, it already has the schema and he doesn't need the _id
    schema = this.schema || schema;
    // Generate ObjectId if it is missing, but it requires a scheme
    if (!this.schema && schema.options._id) {
        obj = obj || {};
        if (obj._id === undefined) {
            obj._id = new ObjectId();
        }
    }
    if (!schema) {
        throw new MongooseError.MissingSchemaError();
    }
    this.$__setSchema(schema);
    NodeJSDocument.call(this, obj, fields, skipId, skipInit);
    applyHooks(this, schema, {
        decorateDoc: true
    });
    // apply methods
    for(const m in schema.methods){
        this[m] = schema.methods[m];
    }
    // apply statics
    for(const s in schema.statics){
        this[s] = schema.statics[s];
    }
}
/*!
 * Inherit from the NodeJS document
 */ Document.prototype = Object.create(NodeJSDocument.prototype);
Document.prototype.constructor = Document;
/*!
 * ignore
 */ Document.events = new EventEmitter();
/*!
 * Browser doc exposes the event emitter API
 */ Document.$emitter = new EventEmitter();
[
    'on',
    'once',
    'emit',
    'listeners',
    'removeListener',
    'setMaxListeners',
    'removeAllListeners',
    'addListener'
].forEach(function(emitterFn) {
    Document[emitterFn] = function() {
        return Document.$emitter[emitterFn].apply(Document.$emitter, arguments);
    };
});
/*!
 * Module exports.
 */ Document.ValidationError = ValidationError;
module.exports = exports = Document;
}),
"[project]/backend/node_modules/mongoose/lib/documentProvider.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-env browser */ /*!
 * Module dependencies.
 */ const Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const BrowserDocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/browserDocument.js [app-route] (ecmascript)");
let isBrowser = false;
/**
 * Returns the Document constructor for the current context
 *
 * @api private
 */ module.exports = function documentProvider() {
    if (isBrowser) {
        return BrowserDocument;
    }
    return Document;
};
/*!
 * ignore
 */ module.exports.setBrowser = function(flag) {
    isBrowser = flag;
};
}),
"[project]/backend/node_modules/mongoose/lib/mongoose.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const Kareem = __turbopack_context__.r("[project]/backend/node_modules/kareem/index.js [app-route] (ecmascript)");
const Schema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const SchemaTypes = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/index.js [app-route] (ecmascript)");
const VirtualType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/virtualType.js [app-route] (ecmascript)");
const STATES = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connectionState.js [app-route] (ecmascript)");
const VALID_OPTIONS = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/validOptions.js [app-route] (ecmascript)");
const Types = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)");
const Query = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/query.js [app-route] (ecmascript)");
const Model = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/model.js [app-route] (ecmascript)");
const applyPlugins = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/applyPlugins.js [app-route] (ecmascript)");
const builtinPlugins = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/index.js [app-route] (ecmascript)");
const driver = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/driver.js [app-route] (ecmascript)");
const legacyPluralize = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/pluralize.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const pkg = __turbopack_context__.r("[project]/backend/node_modules/mongoose/package.json (json)");
const cast = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)");
const Aggregate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/aggregate.js [app-route] (ecmascript)");
const trusted = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)").trusted;
const sanitizeFilter = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/sanitizeFilter.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const SetOptionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/setOptionError.js [app-route] (ecmascript)");
const applyEmbeddedDiscriminators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/applyEmbeddedDiscriminators.js [app-route] (ecmascript)");
const defaultMongooseSymbol = Symbol.for('mongoose:default');
const defaultConnectionSymbol = Symbol('mongoose:defaultConnection');
__turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/printJestWarning.js [app-route] (ecmascript)");
const objectIdHexRegexp = /^[0-9A-Fa-f]{24}$/;
const { AsyncLocalStorage } = __turbopack_context__.r("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
/**
 * Mongoose constructor.
 *
 * The exports object of the `mongoose` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     mongoose instanceof mongoose.Mongoose; // true
 *
 *     // Create a new Mongoose instance with its own `connect()`, `set()`, `model()`, etc.
 *     const m = new mongoose.Mongoose();
 *
 * @api public
 * @param {Object} options see [`Mongoose#set()` docs](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.set())
 */ function Mongoose(options) {
    this.connections = [];
    this.nextConnectionId = 0;
    this.models = {};
    this.events = new EventEmitter();
    this.__driver = driver.get();
    // default global options
    this.options = Object.assign({
        pluralization: true,
        autoIndex: true,
        autoCreate: true,
        autoSearchIndex: false
    }, options);
    const createInitialConnection = utils.getOption('createInitialConnection', this.options) ?? true;
    if (createInitialConnection && this.__driver != null) {
        _createDefaultConnection(this);
    }
    if (this.options.pluralization) {
        this._pluralize = legacyPluralize;
    }
    // If a user creates their own Mongoose instance, give them a separate copy
    // of the `Schema` constructor so they get separate custom types. (gh-6933)
    if (!options || !options[defaultMongooseSymbol]) {
        const _this = this;
        this.Schema = function() {
            this.base = _this;
            return Schema.apply(this, arguments);
        };
        this.Schema.prototype = Object.create(Schema.prototype);
        Object.assign(this.Schema, Schema);
        this.Schema.base = this;
        this.Schema.Types = Object.assign({}, Schema.Types);
    } else {
        // Hack to work around babel's strange behavior with
        // `import mongoose, { Schema } from 'mongoose'`. Because `Schema` is not
        // an own property of a Mongoose global, Schema will be undefined. See gh-5648
        for (const key of [
            'Schema',
            'model'
        ]){
            this[key] = Mongoose.prototype[key];
        }
    }
    this.Schema.prototype.base = this;
    if (options?.transactionAsyncLocalStorage) {
        this.transactionAsyncLocalStorage = new AsyncLocalStorage();
    }
    Object.defineProperty(this, 'plugins', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: Object.values(builtinPlugins).map((plugin)=>[
                plugin,
                {
                    deduplicate: true
                }
            ])
    });
}
Mongoose.prototype.cast = cast;
/**
 * Expose connection states for user-land
 *
 * @memberOf Mongoose
 * @property STATES
 * @api public
 */ Mongoose.prototype.STATES = STATES;
/**
 * Expose connection states for user-land
 *
 * @memberOf Mongoose
 * @property ConnectionStates
 * @api public
 */ Mongoose.prototype.ConnectionStates = STATES;
/**
 * Object with `get()` and `set()` containing the underlying driver this Mongoose instance
 * uses to communicate with the database. A driver is a Mongoose-specific interface that defines functions
 * like `find()`.
 *
 * @deprecated
 * @memberOf Mongoose
 * @property driver
 * @api public
 */ Mongoose.prototype.driver = driver;
/**
 * Overwrites the current driver used by this Mongoose instance. A driver is a
 * Mongoose-specific interface that defines functions like `find()`.
 *
 * @memberOf Mongoose
 * @method setDriver
 * @api public
 */ Mongoose.prototype.setDriver = function setDriver(driver) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    if (_mongoose.__driver === driver) {
        return _mongoose;
    }
    const openConnection = _mongoose.connections && _mongoose.connections.find((conn)=>conn.readyState !== STATES.disconnected);
    if (openConnection) {
        const msg = 'Cannot modify Mongoose driver if a connection is already open. ' + 'Call `mongoose.disconnect()` before modifying the driver';
        throw new MongooseError(msg);
    }
    _mongoose.__driver = driver;
    if (Array.isArray(driver.plugins)) {
        for (const plugin of driver.plugins){
            if (typeof plugin === 'function') {
                _mongoose.plugin(plugin);
            }
        }
    }
    if (driver.SchemaTypes != null) {
        Object.assign(mongoose.Schema.Types, driver.SchemaTypes);
    }
    const Connection = driver.Connection;
    const oldDefaultConnection = _mongoose.connections[0];
    _mongoose.connections = [
        new Connection(_mongoose)
    ];
    _mongoose.connections[0].models = _mongoose.models;
    if (oldDefaultConnection == null) {
        return _mongoose;
    }
    // Update all models that pointed to the old default connection to
    // the new default connection, including collections
    for (const model of Object.values(_mongoose.models)){
        if (model.db !== oldDefaultConnection) {
            continue;
        }
        model.$__updateConnection(_mongoose.connections[0]);
    }
    return _mongoose;
};
/**
 * Sets mongoose options
 *
 * `key` can be used a object to set multiple options at once.
 * If a error gets thrown for one option, other options will still be evaluated.
 *
 * #### Example:
 *
 *     mongoose.set('test', value) // sets the 'test' option to `value`
 *
 *     mongoose.set('debug', true) // enable logging collection methods + arguments to the console/file
 *
 *     mongoose.set('debug', function(collectionName, methodName, ...methodArgs) {}); // use custom function to log collection methods + arguments
 *
 *     mongoose.set({ debug: true, autoIndex: false }); // set multiple options at once
 *
 * Currently supported options are:
 * - `allowDiskUse`: Set to `true` to set `allowDiskUse` to true to all aggregation operations by default.
 * - `applyPluginsToChildSchemas`: `true` by default. Set to false to skip applying global plugins to child schemas
 * - `applyPluginsToDiscriminators`: `false` by default. Set to true to apply global plugins to discriminator schemas. This typically isn't necessary because plugins are applied to the base schema and discriminators copy all middleware, methods, statics, and properties from the base schema.
 * - `autoCreate`: Set to `true` to make Mongoose call [`Model.createCollection()`](https://mongoosejs.com/docs/api/model.html#Model.createCollection()) automatically when you create a model with `mongoose.model()` or `conn.model()`. This is useful for testing transactions, change streams, and other features that require the collection to exist.
 * - `autoIndex`: `true` by default. Set to false to disable automatic index creation for all models associated with this Mongoose instance.
 * - `bufferCommands`: enable/disable mongoose's buffering mechanism for all connections and models
 * - `bufferTimeoutMS`: If bufferCommands is on, this option sets the maximum amount of time Mongoose buffering will wait before throwing an error. If not specified, Mongoose will use 10000 (10 seconds).
 * - `cloneSchemas`: `false` by default. Set to `true` to `clone()` all schemas before compiling into a model.
 * - `debug`: If `true`, prints the operations mongoose sends to MongoDB to the console. If a writable stream is passed, it will log to that stream, without colorization. If a callback function is passed, it will receive the collection name, the method name, then all arguments passed to the method. For example, if you wanted to replicate the default logging, you could output from the callback `Mongoose: ${collectionName}.${methodName}(${methodArgs.join(', ')})`.
 * - `id`: If `true`, adds a `id` virtual to all schemas unless overwritten on a per-schema basis.
 * - `timestamps.createdAt.immutable`: `true` by default. If `false`, it will change the `createdAt` field to be [`immutable: false`](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.immutable) which means you can update the `createdAt`
 * - `maxTimeMS`: If set, attaches [maxTimeMS](https://www.mongodb.com/docs/manual/reference/operator/meta/maxTimeMS/) to every query
 * - `objectIdGetter`: `true` by default. Mongoose adds a getter to MongoDB ObjectId's called `_id` that returns `this` for convenience with populate. Set this to false to remove the getter.
 * - `overwriteModels`: Set to `true` to default to overwriting models with the same name when calling `mongoose.model()`, as opposed to throwing an `OverwriteModelError`.
 * - `returnOriginal`: If `false`, changes the default `returnOriginal` option to `findOneAndUpdate()`, `findByIdAndUpdate`, and `findOneAndReplace()` to false. This is equivalent to setting the `new` option to `true` for `findOneAndX()` calls by default. Read our [`findOneAndUpdate()` tutorial](https://mongoosejs.com/docs/tutorials/findoneandupdate.html) for more information.
 * - `runValidators`: `false` by default. Set to true to enable [update validators](https://mongoosejs.com/docs/validation.html#update-validators) for all validators by default.
 * - `sanitizeFilter`: `false` by default. Set to true to enable the [sanitization of the query filters](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.sanitizeFilter()) against query selector injection attacks by wrapping any nested objects that have a property whose name starts with `$` in a `$eq`.
 * - `selectPopulatedPaths`: `true` by default. Set to false to opt out of Mongoose adding all fields that you `populate()` to your `select()`. The schema-level option `selectPopulatedPaths` overwrites this one.
 * - `strict`: `true` by default, may be `false`, `true`, or `'throw'`. Sets the default strict mode for schemas.
 * - `strictQuery`: `false` by default. May be `false`, `true`, or `'throw'`. Sets the default [strictQuery](https://mongoosejs.com/docs/guide.html#strictQuery) mode for schemas.
 * - `toJSON`: `{ transform: true, flattenDecimals: true }` by default. Overwrites default objects to [`toJSON()`](https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()), for determining how Mongoose documents get serialized by `JSON.stringify()`
 * - `toObject`: `{ transform: true, flattenDecimals: true }` by default. Overwrites default objects to [`toObject()`](https://mongoosejs.com/docs/api/document.html#Document.prototype.toObject())
 *
 * @param {String|Object} key The name of the option or a object of multiple key-value pairs
 * @param {String|Function|Boolean} value The value of the option, unused if "key" is a object
 * @returns {Mongoose} The used Mongoose instnace
 * @api public
 */ Mongoose.prototype.set = function getsetOptions(key, value) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    if (arguments.length === 1 && typeof key !== 'object') {
        if (VALID_OPTIONS.indexOf(key) === -1) {
            const error = new SetOptionError();
            error.addError(key, new SetOptionError.SetOptionInnerError(key));
            throw error;
        }
        return _mongoose.options[key];
    }
    let options = {};
    if (arguments.length === 2) {
        options = {
            [key]: value
        };
    }
    if (arguments.length === 1 && typeof key === 'object') {
        options = key;
    }
    // array for errors to collect all errors for all key-value pairs, like ".validate"
    let error = undefined;
    for (const [optionKey, optionValue] of Object.entries(options)){
        if (VALID_OPTIONS.indexOf(optionKey) === -1) {
            if (!error) {
                error = new SetOptionError();
            }
            error.addError(optionKey, new SetOptionError.SetOptionInnerError(optionKey));
            continue;
        }
        _mongoose.options[optionKey] = optionValue;
        if (optionKey === 'objectIdGetter') {
            if (optionValue) {
                Object.defineProperty(_mongoose.Types.ObjectId.prototype, '_id', {
                    enumerable: false,
                    configurable: true,
                    get: function() {
                        return this;
                    }
                });
            } else {
                delete _mongoose.Types.ObjectId.prototype._id;
            }
        } else if (optionKey === 'transactionAsyncLocalStorage') {
            if (optionValue && !_mongoose.transactionAsyncLocalStorage) {
                _mongoose.transactionAsyncLocalStorage = new AsyncLocalStorage();
            } else if (!optionValue && _mongoose.transactionAsyncLocalStorage) {
                delete _mongoose.transactionAsyncLocalStorage;
            }
        } else if (optionKey === 'createInitialConnection') {
            if (optionValue && !_mongoose.connection) {
                _createDefaultConnection(_mongoose);
            } else if (optionValue === false && _mongoose.connection && _mongoose.connection[defaultConnectionSymbol]) {
                if (_mongoose.connection.readyState === STATES.disconnected && Object.keys(_mongoose.connection.models).length === 0) {
                    _mongoose.connections.shift();
                }
            }
        }
    }
    if (error) {
        throw error;
    }
    return _mongoose;
};
/**
 * Gets mongoose options
 *
 * #### Example:
 *
 *     mongoose.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */ Mongoose.prototype.get = Mongoose.prototype.set;
/**
 * Creates a Connection instance.
 *
 * Each `connection` instance maps to a single database. This method is helpful when managing multiple db connections.
 *
 *
 * _Options passed take precedence over options included in connection strings._
 *
 * #### Example:
 *
 *     // with mongodb:// URI
 *     db = mongoose.createConnection('mongodb://user:pass@127.0.0.1:port/database');
 *
 *     // and options
 *     const opts = { db: { native_parser: true }}
 *     db = mongoose.createConnection('mongodb://user:pass@127.0.0.1:port/database', opts);
 *
 *     // replica sets
 *     db = mongoose.createConnection('mongodb://user:pass@127.0.0.1:port,anotherhost:port,yetanother:port/database');
 *
 *     // and options
 *     const opts = { replset: { strategy: 'ping', rs_name: 'testSet' }}
 *     db = mongoose.createConnection('mongodb://user:pass@127.0.0.1:port,anotherhost:port,yetanother:port/database', opts);
 *
 *     // initialize now, connect later
 *     db = mongoose.createConnection();
 *     await db.openUri('mongodb://127.0.0.1:27017/database');
 *
 * @param {String} uri mongodb URI to connect to
 * @param {Object} [options] passed down to the [MongoDB driver's `connect()` function](https://mongodb.github.io/node-mongodb-native/4.9/interfaces/MongoClientOptions.html), except for 4 mongoose-specific options explained below.
 * @param {Boolean} [options.bufferCommands=true] Mongoose specific option. Set to false to [disable buffering](https://mongoosejs.com/docs/faq.html#callback_never_executes) on all models associated with this connection.
 * @param {String} [options.dbName] The name of the database you want to use. If not provided, Mongoose uses the database name from connection string.
 * @param {String} [options.user] username for authentication, equivalent to `options.auth.username`. Maintained for backwards compatibility.
 * @param {String} [options.pass] password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility.
 * @param {Boolean} [options.autoIndex=true] Mongoose-specific option. Set to false to disable automatic index creation for all models associated with this connection.
 * @param {Class} [options.promiseLibrary] Sets the [underlying driver's promise library](https://mongodb.github.io/node-mongodb-native/4.9/interfaces/MongoClientOptions.html#promiseLibrary).
 * @param {Number} [options.maxPoolSize=5] The maximum number of sockets the MongoDB driver will keep open for this connection. Keep in mind that MongoDB only allows one operation per socket at a time, so you may want to increase this if you find you have a few slow queries that are blocking faster queries from proceeding. See [Slow Trains in MongoDB and Node.js](https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs).
 * @param {Number} [options.minPoolSize=1] The minimum number of sockets the MongoDB driver will keep open for this connection. Keep in mind that MongoDB only allows one operation per socket at a time, so you may want to increase this if you find you have a few slow queries that are blocking faster queries from proceeding. See [Slow Trains in MongoDB and Node.js](https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs).
 * @param {Number} [options.socketTimeoutMS=0] How long the MongoDB driver will wait before killing a socket due to inactivity _after initial connection_. Defaults to 0, which means Node.js will not time out the socket due to inactivity. A socket may be inactive because of either no activity or a long-running operation. This option is passed to [Node.js `socket#setTimeout()` function](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback) after the MongoDB driver successfully completes.
 * @param {Number} [options.family=0] Passed transparently to [Node.js' `dns.lookup()`](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) function. May be either `0`, `4`, or `6`. `4` means use IPv4 only, `6` means use IPv6 only, `0` means try both.
 * @return {Connection} the created Connection object. Connections are not thenable, so you can't do `await mongoose.createConnection()`. To await use `mongoose.createConnection(uri).asPromise()` instead.
 * @api public
 */ Mongoose.prototype.createConnection = function createConnection(uri, options) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    const Connection = _mongoose.__driver.Connection;
    const conn = new Connection(_mongoose);
    _mongoose.connections.push(conn);
    _mongoose.nextConnectionId++;
    _mongoose.events.emit('createConnection', conn);
    if (arguments.length > 0) {
        conn.openUri(uri, {
            ...options,
            _fireAndForget: true
        });
    }
    return conn;
};
/**
 * Opens the default mongoose connection.
 *
 * #### Example:
 *
 *     mongoose.connect('mongodb://user:pass@127.0.0.1:port/database');
 *
 *     // replica sets
 *     const uri = 'mongodb://user:pass@127.0.0.1:port,anotherhost:port,yetanother:port/mydatabase';
 *     mongoose.connect(uri);
 *
 *     // with options
 *     mongoose.connect(uri, options);
 *
 *     // Using `await` throws "MongooseServerSelectionError: Server selection timed out after 30000 ms"
 *     // if Mongoose can't connect.
 *     const uri = 'mongodb://nonexistent.domain:27000';
 *     await mongoose.connect(uri);
 *
 * @param {String} uri mongodb URI to connect to
 * @param {Object} [options] passed down to the [MongoDB driver's `connect()` function](https://mongodb.github.io/node-mongodb-native/4.9/interfaces/MongoClientOptions.html), except for 4 mongoose-specific options explained below.
 * @param {Boolean} [options.bufferCommands=true] Mongoose specific option. Set to false to [disable buffering](https://mongoosejs.com/docs/faq.html#callback_never_executes) on all models associated with this connection.
 * @param {Number} [options.bufferTimeoutMS=10000] Mongoose specific option. If `bufferCommands` is true, Mongoose will throw an error after `bufferTimeoutMS` if the operation is still buffered.
 * @param {String} [options.dbName] The name of the database we want to use. If not provided, use database name from connection string.
 * @param {String} [options.user] username for authentication, equivalent to `options.auth.username`. Maintained for backwards compatibility.
 * @param {String} [options.pass] password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility.
 * @param {Number} [options.maxPoolSize=100] The maximum number of sockets the MongoDB driver will keep open for this connection. Keep in mind that MongoDB only allows one operation per socket at a time, so you may want to increase this if you find you have a few slow queries that are blocking faster queries from proceeding. See [Slow Trains in MongoDB and Node.js](https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs).
 * @param {Number} [options.minPoolSize=0] The minimum number of sockets the MongoDB driver will keep open for this connection.
 * @param {Number} [options.serverSelectionTimeoutMS] If `useUnifiedTopology = true`, the MongoDB driver will try to find a server to send any given operation to, and keep retrying for `serverSelectionTimeoutMS` milliseconds before erroring out. If not set, the MongoDB driver defaults to using `30000` (30 seconds).
 * @param {Number} [options.heartbeatFrequencyMS] If `useUnifiedTopology = true`, the MongoDB driver sends a heartbeat every `heartbeatFrequencyMS` to check on the status of the connection. A heartbeat is subject to `serverSelectionTimeoutMS`, so the MongoDB driver will retry failed heartbeats for up to 30 seconds by default. Mongoose only emits a `'disconnected'` event after a heartbeat has failed, so you may want to decrease this setting to reduce the time between when your server goes down and when Mongoose emits `'disconnected'`. We recommend you do **not** set this setting below 1000, too many heartbeats can lead to performance degradation.
 * @param {Boolean} [options.autoIndex=true] Mongoose-specific option. Set to false to disable automatic index creation for all models associated with this connection.
 * @param {Class} [options.promiseLibrary] Sets the [underlying driver's promise library](https://mongodb.github.io/node-mongodb-native/4.9/interfaces/MongoClientOptions.html#promiseLibrary).
 * @param {Number} [options.socketTimeoutMS=0] How long the MongoDB driver will wait before killing a socket due to inactivity _after initial connection_. A socket may be inactive because of either no activity or a long-running operation. `socketTimeoutMS` defaults to 0, which means Node.js will not time out the socket due to inactivity. This option is passed to [Node.js `socket#setTimeout()` function](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback) after the MongoDB driver successfully completes.
 * @param {Number} [options.family=0] Passed transparently to [Node.js' `dns.lookup()`](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) function. May be either `0`, `4`, or `6`. `4` means use IPv4 only, `6` means use IPv6 only, `0` means try both.
 * @param {Boolean} [options.autoCreate=false] Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection.
 * @see Mongoose#createConnection https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.createConnection()
 * @api public
 * @return {Promise} resolves to `this` if connection succeeded
 */ Mongoose.prototype.connect = async function connect(uri, options) {
    if (typeof options === 'function' || arguments.length >= 3 && typeof arguments[2] === 'function') {
        throw new MongooseError('Mongoose.prototype.connect() no longer accepts a callback');
    }
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    if (_mongoose.connection == null) {
        _createDefaultConnection(_mongoose);
    }
    const conn = _mongoose.connection;
    return conn.openUri(uri, options).then(()=>_mongoose);
};
/**
 * Runs `.close()` on all connections in parallel.
 *
 * @return {Promise} resolves when all connections are closed, or rejects with the first error that occurred.
 * @api public
 */ Mongoose.prototype.disconnect = async function disconnect() {
    if (arguments.length >= 1 && typeof arguments[0] === 'function') {
        throw new MongooseError('Mongoose.prototype.disconnect() no longer accepts a callback');
    }
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    const remaining = _mongoose.connections.length;
    if (remaining <= 0) {
        return;
    }
    await Promise.all(_mongoose.connections.map((conn)=>conn.close()));
};
/**
 * _Requires MongoDB >= 3.6.0._ Starts a [MongoDB session](https://www.mongodb.com/docs/manual/release-notes/3.6/#client-sessions)
 * for benefits like causal consistency, [retryable writes](https://www.mongodb.com/docs/manual/core/retryable-writes/),
 * and [transactions](https://thecodebarbarian.com/a-node-js-perspective-on-mongodb-4-transactions.html).
 *
 * Calling `mongoose.startSession()` is equivalent to calling `mongoose.connection.startSession()`.
 * Sessions are scoped to a connection, so calling `mongoose.startSession()`
 * starts a session on the [default mongoose connection](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.connection).
 *
 * @param {Object} [options] see the [mongodb driver options](https://mongodb.github.io/node-mongodb-native/4.9/classes/MongoClient.html#startSession)
 * @param {Boolean} [options.causalConsistency=true] set to false to disable causal consistency
 * @return {Promise<ClientSession>} promise that resolves to a MongoDB driver `ClientSession`
 * @api public
 */ Mongoose.prototype.startSession = function startSession() {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    return _mongoose.connection.startSession.apply(_mongoose.connection, arguments);
};
/**
 * Getter/setter around function for pluralizing collection names.
 *
 * @param {Function|null} [fn] overwrites the function used to pluralize collection names
 * @return {Function|null} the current function used to pluralize collection names, defaults to the legacy function from `mongoose-legacy-pluralize`.
 * @api public
 */ Mongoose.prototype.pluralize = function pluralize(fn) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    if (arguments.length > 0) {
        _mongoose._pluralize = fn;
    }
    return _mongoose._pluralize;
};
/**
 * Defines a model or retrieves it.
 *
 * Models defined on the `mongoose` instance are available to all connection
 * created by the same `mongoose` instance.
 *
 * If you call `mongoose.model()` with twice the same name but a different schema,
 * you will get an `OverwriteModelError`. If you call `mongoose.model()` with
 * the same name and same schema, you'll get the same schema back.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *
 *     // define an Actor model with this mongoose instance
 *     const schema = new Schema({ name: String });
 *     mongoose.model('Actor', schema);
 *
 *     // create a new connection
 *     const conn = mongoose.createConnection(..);
 *
 *     // create Actor model
 *     const Actor = conn.model('Actor', schema);
 *     conn.model('Actor') === Actor; // true
 *     conn.model('Actor', schema) === Actor; // true, same schema
 *     conn.model('Actor', schema, 'actors') === Actor; // true, same schema and collection name
 *
 *     // This throws an `OverwriteModelError` because the schema is different.
 *     conn.model('Actor', new Schema({ name: String }));
 *
 * _When no `collection` argument is passed, Mongoose uses the model name. If you don't like this behavior, either pass a collection name, use `mongoose.pluralize()`, or set your schemas collection name option._
 *
 * #### Example:
 *
 *     const schema = new Schema({ name: String }, { collection: 'actor' });
 *
 *     // or
 *
 *     schema.set('collection', 'actor');
 *
 *     // or
 *
 *     const collectionName = 'actor';
 *     const M = mongoose.model('Actor', schema, collectionName);
 *
 * @param {String|Function} name model name or class extending Model
 * @param {Schema} [schema] the schema to use.
 * @param {String} [collection] name (optional, inferred from model name)
 * @param {Object} [options]
 * @param {Boolean} [options.overwriteModels=false] If true, overwrite existing models with the same name to avoid `OverwriteModelError`
 * @return {Model} The model associated with `name`. Mongoose will create the model if it doesn't already exist.
 * @api public
 */ Mongoose.prototype.model = function model(name, schema, collection, options) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    if (typeof schema === 'string') {
        collection = schema;
        schema = false;
    }
    if (arguments.length === 1) {
        const model = _mongoose.models[name];
        if (!model) {
            throw new _mongoose.Error.MissingSchemaError(name);
        }
        return model;
    }
    if (utils.isObject(schema) && !(schema instanceof Schema)) {
        schema = new Schema(schema);
    }
    if (schema && !(schema instanceof Schema)) {
        throw new _mongoose.Error('The 2nd parameter to `mongoose.model()` should be a ' + 'schema or a POJO');
    }
    // handle internal options from connection.model()
    options = options || {};
    const originalSchema = schema;
    if (schema) {
        if (_mongoose.get('cloneSchemas')) {
            schema = schema.clone();
        }
        _mongoose._applyPlugins(schema);
    }
    // connection.model() may be passing a different schema for
    // an existing model name. in this case don't read from cache.
    const overwriteModels = _mongoose.options.hasOwnProperty('overwriteModels') ? _mongoose.options.overwriteModels : options.overwriteModels;
    if (_mongoose.models.hasOwnProperty(name) && options.cache !== false && overwriteModels !== true) {
        if (originalSchema && originalSchema.instanceOfSchema && originalSchema !== _mongoose.models[name].schema) {
            throw new _mongoose.Error.OverwriteModelError(name);
        }
        if (collection && collection !== _mongoose.models[name].collection.name) {
            // subclass current model with alternate collection
            const model = _mongoose.models[name];
            schema = model.prototype.schema;
            const sub = model.__subclass(_mongoose.connection, schema, collection);
            // do not cache the sub model
            return sub;
        }
        return _mongoose.models[name];
    }
    if (schema == null) {
        throw new _mongoose.Error.MissingSchemaError(name);
    }
    const model = _mongoose._model(name, schema, collection, options);
    _mongoose.connection.models[name] = model;
    _mongoose.models[name] = model;
    return model;
};
/*!
 * ignore
 */ Mongoose.prototype._model = function _model(name, schema, collection, options) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    let model;
    if (typeof name === 'function') {
        model = name;
        name = model.name;
        if (!(model.prototype instanceof Model)) {
            throw new _mongoose.Error('The provided class ' + name + ' must extend Model');
        }
    }
    if (schema) {
        if (_mongoose.get('cloneSchemas')) {
            schema = schema.clone();
        }
        _mongoose._applyPlugins(schema);
    }
    // Apply relevant "global" options to the schema
    if (schema == null || !('pluralization' in schema.options)) {
        schema.options.pluralization = _mongoose.options.pluralization;
    }
    if (!collection) {
        collection = schema.get('collection') || utils.toCollectionName(name, _mongoose.pluralize());
    }
    applyEmbeddedDiscriminators(schema);
    const connection = options.connection || _mongoose.connection;
    model = _mongoose.Model.compile(model || name, schema, collection, connection, _mongoose);
    // Errors handled internally, so safe to ignore error
    model.init().catch(function $modelInitNoop() {});
    connection.emit('model', model);
    if (schema._applyDiscriminators != null) {
        for (const disc of schema._applyDiscriminators.keys()){
            const { schema: discriminatorSchema, options } = schema._applyDiscriminators.get(disc);
            model.discriminator(disc, discriminatorSchema, options);
        }
    }
    return model;
};
/**
 * Removes the model named `name` from the default connection, if it exists.
 * You can use this function to clean up any models you created in your tests to
 * prevent OverwriteModelErrors.
 *
 * Equivalent to `mongoose.connection.deleteModel(name)`.
 *
 * #### Example:
 *
 *     mongoose.model('User', new Schema({ name: String }));
 *     console.log(mongoose.model('User')); // Model object
 *     mongoose.deleteModel('User');
 *     console.log(mongoose.model('User')); // undefined
 *
 *     // Usually useful in a Mocha `afterEach()` hook
 *     afterEach(function() {
 *       mongoose.deleteModel(/.+/); // Delete every model
 *     });
 *
 * @api public
 * @param {String|RegExp} name if string, the name of the model to remove. If regexp, removes all models whose name matches the regexp.
 * @return {Mongoose} this
 */ Mongoose.prototype.deleteModel = function deleteModel(name) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    _mongoose.connection.deleteModel(name);
    delete _mongoose.models[name];
    return _mongoose;
};
/**
 * Returns an array of model names created on this instance of Mongoose.
 *
 * #### Note:
 *
 * _Does not include names of models created using `connection.model()`._
 *
 * @api public
 * @return {Array}
 */ Mongoose.prototype.modelNames = function modelNames() {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    const names = Object.keys(_mongoose.models);
    return names;
};
/**
 * Applies global plugins to `schema`.
 *
 * @param {Schema} schema
 * @api private
 */ Mongoose.prototype._applyPlugins = function _applyPlugins(schema, options) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    options = options || {};
    options.applyPluginsToDiscriminators = _mongoose.options && _mongoose.options.applyPluginsToDiscriminators || false;
    options.applyPluginsToChildSchemas = typeof (_mongoose.options && _mongoose.options.applyPluginsToChildSchemas) === 'boolean' ? _mongoose.options.applyPluginsToChildSchemas : true;
    applyPlugins(schema, _mongoose.plugins, options, '$globalPluginsApplied');
};
/**
 * Declares a global plugin executed on all Schemas.
 *
 * Equivalent to calling `.plugin(fn)` on each Schema you create.
 *
 * @param {Function} fn plugin callback
 * @param {Object} [opts] optional options
 * @return {Mongoose} this
 * @see plugins https://mongoosejs.com/docs/plugins.html
 * @api public
 */ Mongoose.prototype.plugin = function plugin(fn, opts) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    _mongoose.plugins.push([
        fn,
        opts
    ]);
    return _mongoose;
};
/**
 * The Mongoose module's default connection. Equivalent to `mongoose.connections[0]`, see [`connections`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.connections).
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     mongoose.connect(...);
 *     mongoose.connection.on('error', cb);
 *
 * This is the connection used by default for every model created using [mongoose.model](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.model()).
 *
 * To create a new connection, use [`createConnection()`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.createConnection()).
 *
 * @memberOf Mongoose
 * @instance
 * @property {Connection} connection
 * @api public
 */ Mongoose.prototype.__defineGetter__('connection', function() {
    return this.connections[0];
});
Mongoose.prototype.__defineSetter__('connection', function(v) {
    if (v instanceof this.__driver.Connection) {
        this.connections[0] = v;
        this.models = v.models;
    }
});
/**
 * An array containing all [connections](connection.html) associated with this
 * Mongoose instance. By default, there is 1 connection. Calling
 * [`createConnection()`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.createConnection()) adds a connection
 * to this array.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     mongoose.connections.length; // 1, just the default connection
 *     mongoose.connections[0] === mongoose.connection; // true
 *
 *     mongoose.createConnection('mongodb://127.0.0.1:27017/test');
 *     mongoose.connections.length; // 2
 *
 * @memberOf Mongoose
 * @instance
 * @property {Array} connections
 * @api public
 */ Mongoose.prototype.connections;
/**
 * An integer containing the value of the next connection id. Calling
 * [`createConnection()`](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.createConnection()) increments
 * this value.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     mongoose.createConnection(); // id `0`, `nextConnectionId` becomes `1`
 *     mongoose.createConnection(); // id `1`, `nextConnectionId` becomes `2`
 *     mongoose.connections[0].destroy() // Removes connection with id `0`
 *     mongoose.createConnection(); // id `2`, `nextConnectionId` becomes `3`
 *
 * @memberOf Mongoose
 * @instance
 * @property {Number} nextConnectionId
 * @api private
 */ Mongoose.prototype.nextConnectionId;
/**
 * The Mongoose Aggregate constructor
 *
 * @method Aggregate
 * @api public
 */ Mongoose.prototype.Aggregate = Aggregate;
/**
 * The Base Mongoose Collection class. `mongoose.Collection` extends from this class.
 *
 * @memberOf Mongoose
 * @instance
 * @method Collection
 * @api public
 */ Mongoose.prototype.BaseCollection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/collection.js [app-route] (ecmascript)");
/**
 * The Mongoose Collection constructor
 *
 * @memberOf Mongoose
 * @instance
 * @method Collection
 * @api public
 */ Object.defineProperty(Mongoose.prototype, 'Collection', {
    get: function() {
        return this.__driver.Collection;
    },
    set: function(Collection) {
        this.__driver.Collection = Collection;
    }
});
/**
 * The Mongoose [Connection](https://mongoosejs.com/docs/api/connection.html#Connection()) constructor
 *
 * @memberOf Mongoose
 * @instance
 * @method Connection
 * @api public
 */ Object.defineProperty(Mongoose.prototype, 'Connection', {
    get: function() {
        return this.__driver.Connection;
    },
    set: function(Connection) {
        if (Connection === this.__driver.Connection) {
            return;
        }
        this.__driver.Connection = Connection;
    }
});
/**
 * The Base Mongoose Connection class. `mongoose.Connection` extends from this class.
 *
 * @memberOf Mongoose
 * @instance
 * @method Connection
 * @api public
 */ Mongoose.prototype.BaseConnection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/connection.js [app-route] (ecmascript)");
/**
 * The Mongoose version
 *
 * #### Example:
 *
 *     console.log(mongoose.version); // '5.x.x'
 *
 * @property version
 * @api public
 */ Mongoose.prototype.version = pkg.version;
/**
 * The Mongoose constructor
 *
 * The exports of the mongoose module is an instance of this class.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     const mongoose2 = new mongoose.Mongoose();
 *
 * @method Mongoose
 * @api public
 */ Mongoose.prototype.Mongoose = Mongoose;
/**
 * The Mongoose [Schema](https://mongoosejs.com/docs/api/schema.html#Schema()) constructor
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     const Schema = mongoose.Schema;
 *     const CatSchema = new Schema(..);
 *
 * @method Schema
 * @api public
 */ Mongoose.prototype.Schema = Schema;
/**
 * The Mongoose [SchemaType](https://mongoosejs.com/docs/api/schematype.html#SchemaType()) constructor
 *
 * @method SchemaType
 * @api public
 */ Mongoose.prototype.SchemaType = SchemaType;
/**
 * The various Mongoose SchemaTypes.
 *
 * #### Note:
 *
 * _Alias of mongoose.Schema.Types for backwards compatibility._
 *
 * @property SchemaTypes
 * @see Schema.SchemaTypes https://mongoosejs.com/docs/schematypes.html
 * @api public
 */ Mongoose.prototype.SchemaTypes = Schema.Types;
/**
 * The Mongoose [VirtualType](https://mongoosejs.com/docs/api/virtualtype.html#VirtualType()) constructor
 *
 * @method VirtualType
 * @api public
 */ Mongoose.prototype.VirtualType = VirtualType;
/**
 * The various Mongoose Types.
 *
 * #### Example:
 *
 *     const mongoose = require('mongoose');
 *     const array = mongoose.Types.Array;
 *
 * #### Types:
 *
 * - [Array](https://mongoosejs.com/docs/schematypes.html#arrays)
 * - [Buffer](https://mongoosejs.com/docs/schematypes.html#buffers)
 * - [Embedded](https://mongoosejs.com/docs/schematypes.html#schemas)
 * - [DocumentArray](https://mongoosejs.com/docs/api/documentarraypath.html)
 * - [Decimal128](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.Decimal128)
 * - [ObjectId](https://mongoosejs.com/docs/schematypes.html#objectids)
 * - [Map](https://mongoosejs.com/docs/schematypes.html#maps)
 * - [Subdocument](https://mongoosejs.com/docs/schematypes.html#schemas)
 * - [Int32](https://mongoosejs.com/docs/schematypes.html#int32)
 *
 * Using this exposed access to the `ObjectId` type, we can construct ids on demand.
 *
 *     const ObjectId = mongoose.Types.ObjectId;
 *     const id1 = new ObjectId;
 *
 * @property Types
 * @api public
 */ Mongoose.prototype.Types = Types;
/**
 * The Mongoose [Query](https://mongoosejs.com/docs/api/query.html#Query()) constructor.
 *
 * @method Query
 * @api public
 */ Mongoose.prototype.Query = Query;
/**
 * The Mongoose [Model](https://mongoosejs.com/docs/api/model.html#Model()) constructor.
 *
 * @method Model
 * @api public
 */ Mongoose.prototype.Model = Model;
/**
 * The Mongoose [Document](https://mongoosejs.com/docs/api/document.html#Document()) constructor.
 *
 * @method Document
 * @api public
 */ Mongoose.prototype.Document = Document;
/**
 * The Mongoose DocumentProvider constructor. Mongoose users should not have to
 * use this directly
 *
 * @method DocumentProvider
 * @api public
 */ Mongoose.prototype.DocumentProvider = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/documentProvider.js [app-route] (ecmascript)");
/**
 * The Mongoose ObjectId [SchemaType](https://mongoosejs.com/docs/schematypes.html). Used for
 * declaring paths in your schema that should be
 * [MongoDB ObjectIds](https://www.mongodb.com/docs/manual/reference/method/ObjectId/).
 * Do not use this to create a new ObjectId instance, use `mongoose.Types.ObjectId`
 * instead.
 *
 * #### Example:
 *
 *     const childSchema = new Schema({ parentId: mongoose.ObjectId });
 *
 * @property ObjectId
 * @api public
 */ Mongoose.prototype.ObjectId = SchemaTypes.ObjectId;
/**
 * Returns true if Mongoose can cast the given value to an ObjectId, or
 * false otherwise.
 *
 * #### Example:
 *
 *     mongoose.isValidObjectId(new mongoose.Types.ObjectId()); // true
 *     mongoose.isValidObjectId('0123456789ab'); // true
 *     mongoose.isValidObjectId(6); // true
 *     mongoose.isValidObjectId(new User({ name: 'test' })); // true
 *
 *     mongoose.isValidObjectId({ test: 42 }); // false
 *
 * @method isValidObjectId
 * @param {Any} v
 * @returns {boolean} true if `v` is something Mongoose can coerce to an ObjectId
 * @api public
 */ Mongoose.prototype.isValidObjectId = function isValidObjectId(v) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    return _mongoose.Types.ObjectId.isValid(v);
};
/**
 * Returns true if the given value is a Mongoose ObjectId (using `instanceof`) or if the
 * given value is a 24 character hex string, which is the most commonly used string representation
 * of an ObjectId.
 *
 * This function is similar to `isValidObjectId()`, but considerably more strict, because
 * `isValidObjectId()` will return `true` for _any_ value that Mongoose can convert to an
 * ObjectId. That includes Mongoose documents, any string of length 12, and any number.
 * `isObjectIdOrHexString()` returns true only for `ObjectId` instances or 24 character hex
 * strings, and will return false for numbers, documents, and strings of length 12.
 *
 * #### Example:
 *
 *     mongoose.isObjectIdOrHexString(new mongoose.Types.ObjectId()); // true
 *     mongoose.isObjectIdOrHexString('62261a65d66c6be0a63c051f'); // true
 *
 *     mongoose.isObjectIdOrHexString('0123456789ab'); // false
 *     mongoose.isObjectIdOrHexString(6); // false
 *     mongoose.isObjectIdOrHexString(new User({ name: 'test' })); // false
 *     mongoose.isObjectIdOrHexString({ test: 42 }); // false
 *
 * @method isObjectIdOrHexString
 * @param {Any} v
 * @returns {boolean} true if `v` is an ObjectId instance _or_ a 24 char hex string
 * @api public
 */ Mongoose.prototype.isObjectIdOrHexString = function isObjectIdOrHexString(v) {
    return isBsonType(v, 'ObjectId') || typeof v === 'string' && objectIdHexRegexp.test(v);
};
/**
 *
 * Syncs all the indexes for the models registered with this connection.
 *
 * @param {Object} options
 * @param {Boolean} options.continueOnError `false` by default. If set to `true`, mongoose will not throw an error if one model syncing failed, and will return an object where the keys are the names of the models, and the values are the results/errors for each model.
 * @return {Promise} Returns a Promise, when the Promise resolves the value is a list of the dropped indexes.
 */ Mongoose.prototype.syncIndexes = function syncIndexes(options) {
    const _mongoose = this instanceof Mongoose ? this : mongoose;
    return _mongoose.connection.syncIndexes(options);
};
/**
 * The Mongoose Decimal128 [SchemaType](https://mongoosejs.com/docs/schematypes.html). Used for
 * declaring paths in your schema that should be
 * [128-bit decimal floating points](https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html).
 * Do not use this to create a new Decimal128 instance, use `mongoose.Types.Decimal128`
 * instead.
 *
 * #### Example:
 *
 *     const vehicleSchema = new Schema({ fuelLevel: mongoose.Decimal128 });
 *
 * @property Decimal128
 * @api public
 */ Mongoose.prototype.Decimal128 = SchemaTypes.Decimal128;
/**
 * The Mongoose Mixed [SchemaType](https://mongoosejs.com/docs/schematypes.html). Used for
 * declaring paths in your schema that Mongoose's change tracking, casting,
 * and validation should ignore.
 *
 * #### Example:
 *
 *     const schema = new Schema({ arbitrary: mongoose.Mixed });
 *
 * @property Mixed
 * @api public
 */ Mongoose.prototype.Mixed = SchemaTypes.Mixed;
/**
 * The Mongoose Date [SchemaType](https://mongoosejs.com/docs/schematypes.html).
 *
 * #### Example:
 *
 *     const schema = new Schema({ test: Date });
 *     schema.path('test') instanceof mongoose.Date; // true
 *
 * @property Date
 * @api public
 */ Mongoose.prototype.Date = SchemaTypes.Date;
/**
 * The Mongoose Number [SchemaType](https://mongoosejs.com/docs/schematypes.html). Used for
 * declaring paths in your schema that Mongoose should cast to numbers.
 *
 * #### Example:
 *
 *     const schema = new Schema({ num: mongoose.Number });
 *     // Equivalent to:
 *     const schema = new Schema({ num: 'number' });
 *
 * @property Number
 * @api public
 */ Mongoose.prototype.Number = SchemaTypes.Number;
/**
 * The [MongooseError](https://mongoosejs.com/docs/api/error.html#Error()) constructor.
 *
 * @method Error
 * @api public
 */ Mongoose.prototype.Error = MongooseError;
Mongoose.prototype.MongooseError = MongooseError;
/**
 * Mongoose uses this function to get the current time when setting
 * [timestamps](https://mongoosejs.com/docs/guide.html#timestamps). You may stub out this function
 * using a tool like [Sinon](https://www.npmjs.com/package/sinon) for testing.
 *
 * @method now
 * @returns Date the current time
 * @api public
 */ Mongoose.prototype.now = function now() {
    return new Date();
};
/**
 * The Mongoose CastError constructor
 *
 * @method CastError
 * @param {String} type The name of the type
 * @param {Any} value The value that failed to cast
 * @param {String} path The path `a.b.c` in the doc where this cast error occurred
 * @param {Error} [reason] The original error that was thrown
 * @api public
 */ Mongoose.prototype.CastError = MongooseError.CastError;
/**
 * The constructor used for schematype options
 *
 * @method SchemaTypeOptions
 * @api public
 */ Mongoose.prototype.SchemaTypeOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaTypeOptions.js [app-route] (ecmascript)");
/**
 * The [mquery](https://github.com/aheckmann/mquery) query builder Mongoose uses.
 *
 * @property mquery
 * @api public
 */ Mongoose.prototype.mquery = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/mquery.js [app-route] (ecmascript)");
/**
 * Sanitizes query filters against [query selector injection attacks](https://thecodebarbarian.com/2014/09/04/defending-against-query-selector-injection-attacks.html)
 * by wrapping any nested objects that have a property whose name starts with `$` in a `$eq`.
 *
 * ```javascript
 * const obj = { username: 'val', pwd: { $ne: null } };
 * sanitizeFilter(obj);
 * obj; // { username: 'val', pwd: { $eq: { $ne: null } } });
 * ```
 *
 * @method sanitizeFilter
 * @param {Object} filter
 * @returns Object the sanitized object
 * @api public
 */ Mongoose.prototype.sanitizeFilter = sanitizeFilter;
/**
 * Tells `sanitizeFilter()` to skip the given object when filtering out potential [query selector injection attacks](https://thecodebarbarian.com/2014/09/04/defending-against-query-selector-injection-attacks.html).
 * Use this method when you have a known query selector that you want to use.
 *
 * ```javascript
 * const obj = { username: 'val', pwd: trusted({ $type: 'string', $eq: 'my secret' }) };
 * sanitizeFilter(obj);
 *
 * // Note that `sanitizeFilter()` did not add `$eq` around `$type`.
 * obj; // { username: 'val', pwd: { $type: 'string', $eq: 'my secret' } });
 * ```
 *
 * @method trusted
 * @param {Object} obj
 * @returns Object the passed in object
 * @api public
 */ Mongoose.prototype.trusted = trusted;
/**
 * Use this function in `pre()` middleware to skip calling the wrapped function.
 *
 * #### Example:
 *
 *     schema.pre('save', function() {
 *       // Will skip executing `save()`, but will execute post hooks as if
 *       // `save()` had executed with the result `{ matchedCount: 0 }`
 *       return mongoose.skipMiddlewareFunction({ matchedCount: 0 });
 *     });
 *
 * @method skipMiddlewareFunction
 * @param {any} result
 * @api public
 */ Mongoose.prototype.skipMiddlewareFunction = Kareem.skipWrappedFunction;
/**
 * Use this function in `post()` middleware to replace the result
 *
 * #### Example:
 *
 *     schema.post('find', function(res) {
 *       // Normally you have to modify `res` in place. But with
 *       // `overwriteMiddlewarResult()`, you can make `find()` return a
 *       // completely different value.
 *       return mongoose.overwriteMiddlewareResult(res.filter(doc => !doc.isDeleted));
 *     });
 *
 * @method overwriteMiddlewareResult
 * @param {any} result
 * @api public
 */ Mongoose.prototype.overwriteMiddlewareResult = Kareem.overwriteResult;
/**
 * Takes in an object and deletes any keys from the object whose values
 * are strictly equal to `undefined`.
 * This function is useful for query filters because Mongoose treats
 * `TestModel.find({ name: undefined })` as `TestModel.find({ name: null })`.
 *
 * #### Example:
 *
 *     const filter = { name: 'John', age: undefined, status: 'active' };
 *     mongoose.omitUndefined(filter); // { name: 'John', status: 'active' }
 *     filter; // { name: 'John', status: 'active' }
 *
 *     await UserModel.findOne(mongoose.omitUndefined(filter));
 *
 * @method omitUndefined
 * @param {Object} [val] the object to remove undefined keys from
 * @returns {Object} the object passed in
 * @api public
 */ Mongoose.prototype.omitUndefined = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/omitUndefined.js [app-route] (ecmascript)");
/*!
 * Create a new default connection (`mongoose.connection`) for a Mongoose instance.
 * No-op if there is already a default connection.
 */ function _createDefaultConnection(mongoose) {
    if (mongoose.connection) {
        return;
    }
    const conn = mongoose.createConnection(); // default connection
    conn[defaultConnectionSymbol] = true;
    conn.models = mongoose.models;
}
/**
 * The exports object is an instance of Mongoose.
 *
 * @api private
 */ const mongoose = module.exports = exports = new Mongoose({
    [defaultMongooseSymbol]: true
});
}),
"[project]/backend/node_modules/mongoose/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const mongodbDriver = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/drivers/node-mongodb-native/index.js [app-route] (ecmascript)");
__turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/driver.js [app-route] (ecmascript)").set(mongodbDriver);
const mongoose = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/mongoose.js [app-route] (ecmascript)");
mongoose.setDriver(mongodbDriver);
mongoose.Mongoose.prototype.mongo = __turbopack_context__.r("[project]/backend/node_modules/mongodb/lib/index.js [app-route] (ecmascript)");
module.exports = mongoose;
}),
];

//# sourceMappingURL=6d019_mongoose_lib_45c6edda._.js.map