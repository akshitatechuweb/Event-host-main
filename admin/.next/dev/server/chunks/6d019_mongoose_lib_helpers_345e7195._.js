module.exports = [
"[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Centralize this so we can more easily work around issues with people
 * stubbing out `process.nextTick()` in tests using sinon:
 * https://github.com/sinonjs/lolex#automatically-incrementing-mocked-time
 * See gh-6074
 */ const nextTick = typeof process !== 'undefined' && typeof process.nextTick === 'function' ? process.nextTick.bind(process) : (cb)=>setTimeout(cb, 0); // Fallback for browser build
module.exports = function immediate(cb) {
    return nextTick(cb);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.arrayAtomicsBackupSymbol = Symbol('mongoose#Array#atomicsBackup');
exports.arrayAtomicsSymbol = Symbol('mongoose#Array#_atomics');
exports.arrayParentSymbol = Symbol('mongoose#Array#_parent');
exports.arrayPathSymbol = Symbol('mongoose#Array#_path');
exports.arraySchemaSymbol = Symbol('mongoose#Array#_schema');
exports.documentArrayParent = Symbol('mongoose#documentArrayParent');
exports.documentIsSelected = Symbol('mongoose#Document#isSelected');
exports.documentIsModified = Symbol('mongoose#Document#isModified');
exports.documentModifiedPaths = Symbol('mongoose#Document#modifiedPaths');
exports.documentSchemaSymbol = Symbol('mongoose#Document#schema');
exports.getSymbol = Symbol('mongoose#Document#get');
exports.modelSymbol = Symbol('mongoose#Model');
exports.objectIdSymbol = Symbol('mongoose#ObjectId');
exports.populateModelSymbol = Symbol('mongoose#PopulateOptions#Model');
exports.schemaTypeSymbol = Symbol('mongoose#schemaType');
exports.sessionNewDocuments = Symbol('mongoose#ClientSession#newDocuments');
exports.scopeSymbol = Symbol('mongoose#Document#scope');
exports.validatorErrorSymbol = Symbol('mongoose#validatorError');
}),
"[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * If `val` is an object, returns constructor name, if possible. Otherwise returns undefined.
 * @api private
 */ module.exports = function getConstructorName(val) {
    if (val == null) {
        return void 0;
    }
    if (typeof val.constructor !== 'function') {
        return void 0;
    }
    return val.constructor.name;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = new Set([
    '__proto__',
    'constructor',
    'prototype'
]);
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isMongooseObject.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isMongooseArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/isMongooseArray.js [app-route] (ecmascript)").isMongooseArray;
/**
 * Returns if `v` is a mongoose object that has a `toObject()` method we can use.
 *
 * This is for compatibility with libs like Date.js which do foolish things to Natives.
 *
 * @param {Any} v
 * @api private
 */ module.exports = function(v) {
    return v != null && (isMongooseArray(v) || // Array or Document Array
    v.$__ != null || // Document
    v.isMongooseBuffer || // Buffer
    v.$isMongooseMap // Map
    );
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/getFunctionName.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const functionNameRE = /^function\s*([^\s(]+)/;
module.exports = function(fn) {
    return fn.name || (fn.toString().trim().match(functionNameRE) || [])[1];
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Get the bson type, if it exists
 * @api private
 */ function isBsonType(obj, typename) {
    return obj != null && obj._bsontype === typename;
}
module.exports = isBsonType;
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */ module.exports = function(arg) {
    return Buffer.isBuffer(arg) || Object.prototype.toString.call(arg) === '[object Object]';
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function isPOJO(arg) {
    if (arg == null || typeof arg !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(arg);
    // Prototype may be null if you used `Object.create(null)`
    // Checking `proto`'s constructor is safe because `getPrototypeOf()`
    // explicitly crosses the boundary from object data to object metadata
    return !proto || proto.constructor.name === 'Object';
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const trustedSymbol = Symbol('mongoose#trustedSymbol');
exports.trustedSymbol = trustedSymbol;
exports.trusted = function trusted(obj) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    obj[trustedSymbol] = true;
    return obj;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Decimal = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/decimal128.js [app-route] (ecmascript)");
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const specialProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)");
const isMongooseObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isMongooseObject.js [app-route] (ecmascript)");
const getFunctionName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getFunctionName.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const isMongooseArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/array/isMongooseArray.js [app-route] (ecmascript)").isMongooseArray;
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
const isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)");
const symbols = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)");
const trustedSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)").trustedSymbol;
const BSON = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)");
/**
 * Object clone with Mongoose natives support.
 *
 * If options.minimize is true, creates a minimal data object. Empty objects and undefined values will not be cloned. This makes the data payload sent to MongoDB as small as possible.
 *
 * Functions and primitives are never cloned.
 *
 * @param {Object} obj the object to clone
 * @param {Object} options
 * @param {Boolean} isArrayChild true if cloning immediately underneath an array. Special case for minimize.
 * @return {Object} the cloned object
 * @api private
 */ function clone(obj, options, isArrayChild) {
    if (obj == null) {
        return obj;
    }
    if (isBsonType(obj, 'Double')) {
        return new BSON.Double(obj.value);
    }
    if (typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean' || typeof obj === 'bigint') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return cloneArray(obj, options);
    }
    if (isMongooseObject(obj)) {
        if (options) {
            if (options.retainDocuments && obj.$__ != null) {
                const clonedDoc = obj.$clone();
                if (obj.__index != null) {
                    clonedDoc.__index = obj.__index;
                }
                if (obj.__parentArray != null) {
                    clonedDoc.__parentArray = obj.__parentArray;
                }
                clonedDoc.$__parent = obj.$__parent;
                return clonedDoc;
            }
        }
        if (isPOJO(obj) && obj.$__ != null && obj._doc != null) {
            return obj._doc;
        }
        let ret;
        if (options && options.json && typeof obj.toJSON === 'function') {
            ret = obj.toJSON(options);
        } else {
            ret = obj.toObject(options);
        }
        return ret;
    }
    const objConstructor = obj.constructor;
    if (objConstructor) {
        switch(getFunctionName(objConstructor)){
            case 'Object':
                return cloneObject(obj, options, isArrayChild);
            case 'Date':
                return new objConstructor(+obj);
            case 'RegExp':
                return cloneRegExp(obj);
            default:
                break;
        }
    }
    if (isBsonType(obj, 'ObjectId')) {
        if (options && options.flattenObjectIds) {
            return obj.toJSON();
        }
        return new ObjectId(obj.id);
    }
    if (isBsonType(obj, 'Decimal128')) {
        if (options && options.flattenDecimals) {
            return obj.toJSON();
        }
        return Decimal.fromString(obj.toString());
    }
    // object created with Object.create(null)
    if (!objConstructor && isObject(obj)) {
        return cloneObject(obj, options, isArrayChild);
    }
    if (typeof obj === 'object' && obj[symbols.schemaTypeSymbol]) {
        return obj.clone();
    }
    // If we're cloning this object to go into a MongoDB command,
    // and there's a `toBSON()` function, assume this object will be
    // stored as a primitive in MongoDB and doesn't need to be cloned.
    if (options && options.bson && typeof obj.toBSON === 'function') {
        return obj;
    }
    if (typeof obj.valueOf === 'function') {
        return obj.valueOf();
    }
    return cloneObject(obj, options, isArrayChild);
}
module.exports = clone;
/*!
 * ignore
 */ function cloneObject(obj, options, isArrayChild) {
    const minimize = options && options.minimize;
    const omitUndefined = options && options.omitUndefined;
    const seen = options && options._seen;
    const ret = {};
    let hasKeys;
    if (seen && seen.has(obj)) {
        return seen.get(obj);
    } else if (seen) {
        seen.set(obj, ret);
    }
    if (trustedSymbol in obj && options?.copyTrustedSymbol !== false) {
        ret[trustedSymbol] = obj[trustedSymbol];
    }
    const keys = Object.keys(obj);
    const len = keys.length;
    for(let i = 0; i < len; ++i){
        const key = keys[i];
        if (specialProperties.has(key)) {
            continue;
        }
        // Don't pass `isArrayChild` down
        const val = clone(obj[key], options, false);
        if ((minimize === false || omitUndefined) && typeof val === 'undefined') {
            delete ret[key];
        } else if (minimize !== true || typeof val !== 'undefined') {
            hasKeys || (hasKeys = true);
            ret[key] = val;
        }
    }
    return minimize && !isArrayChild ? hasKeys && ret : ret;
}
function cloneArray(arr, options) {
    let i = 0;
    const len = arr.length;
    let ret = null;
    if (options?.retainDocuments) {
        if (arr.isMongooseDocumentArray) {
            ret = new (arr.$schemaType()).schema.base.Types.DocumentArray([], arr.$path(), arr.$parent(), arr.$schemaType());
        } else if (arr.isMongooseArray) {
            ret = new (arr.$parent()).schema.base.Types.Array([], arr.$path(), arr.$parent(), arr.$schemaType());
        } else {
            ret = new Array(len);
        }
    } else {
        ret = new Array(len);
    }
    arr = isMongooseArray(arr) ? arr.__array : arr;
    for(i = 0; i < len; ++i){
        ret[i] = clone(arr[i], options, true);
    }
    return ret;
}
function cloneRegExp(regexp) {
    const ret = new RegExp(regexp.source, regexp.flags);
    if (ret.lastIndex !== regexp.lastIndex) {
        ret.lastIndex = regexp.lastIndex;
    }
    return ret;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/error/combinePathErrors.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function combinePathErrors(err) {
    const keys = Object.keys(err.errors || {});
    const len = keys.length;
    const msgs = [];
    let key;
    for(let i = 0; i < len; ++i){
        key = keys[i];
        if (err === err.errors[key]) {
            continue;
        }
        msgs.push(key + ': ' + err.errors[key].message);
    }
    return msgs.join(', ');
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/topology/allServersUnknown.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
module.exports = function allServersUnknown(topologyDescription) {
    if (getConstructorName(topologyDescription) !== 'TopologyDescription') {
        return false;
    }
    const servers = Array.from(topologyDescription.servers.values());
    return servers.length > 0 && servers.every((server)=>server.type === 'Unknown');
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/topology/isAtlas.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
/**
 * @typedef { import('mongodb').TopologyDescription } TopologyDescription
 */ /**
 * Checks if topologyDescription contains servers connected to an atlas instance
 *
 * @param  {TopologyDescription} topologyDescription
 * @returns {boolean}
 */ module.exports = function isAtlas(topologyDescription) {
    if (getConstructorName(topologyDescription) !== 'TopologyDescription') {
        return false;
    }
    if (topologyDescription.servers.size === 0) {
        return false;
    }
    for (const server of topologyDescription.servers.values()){
        if (server.host.endsWith('.mongodb.net') === false || server.port !== 27017) {
            return false;
        }
    }
    return true;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/topology/isSSLError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const nonSSLMessage = 'Client network socket disconnected before secure TLS ' + 'connection was established';
module.exports = function isSSLError(topologyDescription) {
    if (getConstructorName(topologyDescription) !== 'TopologyDescription') {
        return false;
    }
    const descriptions = Array.from(topologyDescription.servers.values());
    return descriptions.length > 0 && descriptions.every((descr)=>descr.error && descr.error.message.indexOf(nonSSLMessage) !== -1);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schematype/handleImmutable.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function(schematype) {
    if (schematype.$immutable) {
        schematype.$immutableSetter = createImmutableSetter(schematype.path, schematype.options.immutable);
        schematype.set(schematype.$immutableSetter);
    } else if (schematype.$immutableSetter) {
        schematype.setters = schematype.setters.filter((fn)=>fn !== schematype.$immutableSetter);
        delete schematype.$immutableSetter;
    }
};
function createImmutableSetter(path, immutable) {
    return function immutableSetter(v, _priorVal, _doc, options) {
        if (this == null || this.$__ == null) {
            return v;
        }
        if (this.isNew) {
            return v;
        }
        if (options && options.overwriteImmutable) {
            return v;
        }
        const _immutable = typeof immutable === 'function' ? immutable.call(this, this) : immutable;
        if (!_immutable) {
            return v;
        }
        const _value = this.$__.priorDoc != null ? this.$__.priorDoc.$__getValue(path) : this.$__getValue(path);
        if (this.$__.strictMode === 'throw' && v !== _value) {
            throw new StrictModeError(path, 'Path `' + path + '` is immutable ' + 'and strict mode is set to throw.', true);
        }
        return _value;
    };
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isAsyncFunction.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function isAsyncFunction(v) {
    return typeof v === 'function' && v.constructor && v.constructor.name === 'AsyncFunction';
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isSimpleValidator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Determines if `arg` is a flat object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @api private
 * @return {Boolean}
 */ module.exports = function isSimpleValidator(obj) {
    const keys = Object.keys(obj);
    let result = true;
    for(let i = 0, len = keys.length; i < len; ++i){
        if (typeof obj[keys[i]] === 'object' && obj[keys[i]] !== null) {
            result = false;
            break;
        }
    }
    return result;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
const emittedSymbol = Symbol('mongoose#emitted');
module.exports = function promiseOrCallback(callback, fn, ee, Promise) {
    if (typeof callback === 'function') {
        try {
            return fn(function(error) {
                if (error != null) {
                    if (ee != null && ee.listeners != null && ee.listeners('error').length > 0 && !error[emittedSymbol]) {
                        error[emittedSymbol] = true;
                        ee.emit('error', error);
                    }
                    try {
                        callback(error);
                    } catch (error) {
                        return immediate(()=>{
                            throw error;
                        });
                    }
                    return;
                }
                callback.apply(this, arguments);
            });
        } catch (error) {
            if (ee != null && ee.listeners != null && ee.listeners('error').length > 0 && !error[emittedSymbol]) {
                error[emittedSymbol] = true;
                ee.emit('error', error);
            }
            return callback(error);
        }
    }
    Promise = Promise || /*TURBOPACK member replacement*/ __turbopack_context__.g.Promise;
    return new Promise((resolve, reject)=>{
        fn(function(error, res) {
            if (error != null) {
                if (ee != null && ee.listeners != null && ee.listeners('error').length > 0 && !error[emittedSymbol]) {
                    error[emittedSymbol] = true;
                    ee.emit('error', error);
                }
                return reject(error);
            }
            if (arguments.length > 2) {
                return resolve(Array.prototype.slice.call(arguments, 1));
            }
            resolve(res);
        });
    });
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/merge.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function merge(s1, s2, skipConflictingPaths) {
    const paths = Object.keys(s2.tree);
    const pathsToAdd = {};
    for (const key of paths){
        if (skipConflictingPaths && (s1.paths[key] || s1.nested[key] || s1.singleNestedPaths[key])) {
            continue;
        }
        pathsToAdd[key] = s2.tree[key];
    }
    s1.options._isMerging = true;
    s1.add(pathsToAdd, null);
    delete s1.options._isMerging;
    s1.callQueue = s1.callQueue.concat(s2.callQueue);
    s1.method(s2.methods);
    s1.static(s2.statics);
    for (const [option, value] of Object.entries(s2._userProvidedOptions)){
        if (!(option in s1._userProvidedOptions)) {
            s1.set(option, value);
        }
    }
    for(const query in s2.query){
        s1.query[query] = s2.query[query];
    }
    for(const virtual in s2.virtuals){
        s1.virtuals[virtual] = s2.virtuals[virtual].clone();
    }
    s1._indexes = s1._indexes.concat(s2._indexes || []);
    s1.s.hooks.merge(s2.s.hooks, false);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/hasIncludedChildren.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Creates an object that precomputes whether a given path has child fields in
 * the projection.
 *
 * #### Example:
 *
 *     const res = hasIncludedChildren({ 'a.b.c': 0 });
 *     res.a; // 1
 *     res['a.b']; // 1
 *     res['a.b.c']; // 1
 *     res['a.c']; // undefined
 *
 * @param {Object} fields
 * @api private
 */ module.exports = function hasIncludedChildren(fields) {
    const hasIncludedChildren = {};
    const keys = Object.keys(fields);
    for (const key of keys){
        if (key.indexOf('.') === -1) {
            hasIncludedChildren[key] = 1;
            continue;
        }
        const parts = key.split('.');
        let c = parts[0];
        for(let i = 0; i < parts.length; ++i){
            hasIncludedChildren[c] = 1;
            if (i + 1 < parts.length) {
                c = c + '.' + parts[i + 1];
            }
        }
    }
    return hasIncludedChildren;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isNestedProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function isNestedProjection(val) {
    if (val == null || typeof val !== 'object') {
        return false;
    }
    return val.$slice == null && val.$elemMatch == null && val.$meta == null && val.$ == null;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/applyDefaults.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isNestedProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isNestedProjection.js [app-route] (ecmascript)");
module.exports = function applyDefaults(doc, fields, exclude, hasIncludedChildren, isBeforeSetters, pathsToSkip, options) {
    const paths = Object.keys(doc.$__schema.paths);
    const plen = paths.length;
    const skipParentChangeTracking = options && options.skipParentChangeTracking;
    for(let i = 0; i < plen; ++i){
        let def;
        let curPath = '';
        const p = paths[i];
        if (p === '_id' && doc.$__.skipId) {
            continue;
        }
        const type = doc.$__schema.paths[p];
        const path = type.splitPath();
        const len = path.length;
        if (path[len - 1] === '$*') {
            continue;
        }
        let included = false;
        let doc_ = doc._doc;
        for(let j = 0; j < len; ++j){
            if (doc_ == null) {
                break;
            }
            const piece = path[j];
            curPath += (!curPath.length ? '' : '.') + piece;
            if (exclude === true) {
                if (curPath in fields) {
                    break;
                }
            } else if (exclude === false && fields && !included) {
                const hasSubpaths = type.$isSingleNested || type.$isMongooseDocumentArray;
                if (curPath in fields && !isNestedProjection(fields[curPath]) || j === len - 1 && hasSubpaths && hasIncludedChildren != null && hasIncludedChildren[curPath]) {
                    included = true;
                } else if (hasIncludedChildren != null && !hasIncludedChildren[curPath]) {
                    break;
                }
            }
            if (j === len - 1) {
                if (doc_[piece] !== void 0) {
                    break;
                }
                if (isBeforeSetters != null) {
                    if (typeof type.defaultValue === 'function') {
                        if (!type.defaultValue.$runBeforeSetters && isBeforeSetters) {
                            break;
                        }
                        if (type.defaultValue.$runBeforeSetters && !isBeforeSetters) {
                            break;
                        }
                    } else if (!isBeforeSetters) {
                        continue;
                    }
                }
                if (pathsToSkip && pathsToSkip[curPath]) {
                    break;
                }
                if (fields && exclude !== null) {
                    if (exclude === true) {
                        // apply defaults to all non-excluded fields
                        if (p in fields) {
                            continue;
                        }
                        try {
                            def = type.getDefault(doc, false);
                        } catch (err) {
                            doc.invalidate(p, err);
                            break;
                        }
                        if (typeof def !== 'undefined') {
                            doc_[piece] = def;
                            applyChangeTracking(doc, p, skipParentChangeTracking);
                        }
                    } else if (included) {
                        // selected field
                        try {
                            def = type.getDefault(doc, false);
                        } catch (err) {
                            doc.invalidate(p, err);
                            break;
                        }
                        if (typeof def !== 'undefined') {
                            doc_[piece] = def;
                            applyChangeTracking(doc, p, skipParentChangeTracking);
                        }
                    }
                } else {
                    try {
                        def = type.getDefault(doc, false);
                    } catch (err) {
                        doc.invalidate(p, err);
                        break;
                    }
                    if (typeof def !== 'undefined') {
                        doc_[piece] = def;
                        applyChangeTracking(doc, p, skipParentChangeTracking);
                    }
                }
            } else {
                doc_ = doc_[piece];
            }
        }
    }
};
/*!
 * ignore
 */ function applyChangeTracking(doc, fullPath, skipParentChangeTracking) {
    doc.$__.activePaths.default(fullPath);
    if (!skipParentChangeTracking && doc.$isSubdocument && doc.$isSingleNested && doc.$parent() != null) {
        doc.$parent().$__.activePaths.default(doc.$__pathRelativeToParent(fullPath));
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/cleanModifiedSubpaths.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function cleanModifiedSubpaths(doc, path, options) {
    options = options || {};
    const skipDocArrays = options.skipDocArrays;
    let deleted = 0;
    if (!doc) {
        return deleted;
    }
    for (const modifiedPath of Object.keys(doc.$__.activePaths.getStatePaths('modify'))){
        if (skipDocArrays) {
            const schemaType = doc.$__schema.path(modifiedPath);
            if (schemaType && schemaType.$isMongooseDocumentArray) {
                continue;
            }
        }
        if (modifiedPath.startsWith(path + '.')) {
            doc.$__.activePaths.clearPath(modifiedPath);
            ++deleted;
            if (doc.$isSubdocument) {
                cleanParent(doc, modifiedPath);
            }
        }
    }
    return deleted;
};
function cleanParent(doc, path, seen = new Set()) {
    if (seen.has(doc)) {
        throw new Error('Infinite subdocument loop: subdoc with _id ' + doc._id + ' is a parent of itself');
    }
    const parent = doc.$parent();
    const newPath = doc.$__pathRelativeToParent(void 0, false) + '.' + path;
    parent.$__.activePaths.clearPath(newPath);
    if (parent.$isSubdocument) {
        cleanParent(parent, newPath, seen);
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/compile.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const documentSchemaSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").documentSchemaSymbol;
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
let Document;
const getSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").getSymbol;
const scopeSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").scopeSymbol;
const isPOJO = utils.isPOJO;
/*!
 * exports
 */ exports.compile = compile;
exports.defineKey = defineKey;
const _isEmptyOptions = Object.freeze({
    minimize: true,
    virtuals: false,
    getters: false,
    transform: false
});
const noDottedPathGetOptions = Object.freeze({
    noDottedPath: true
});
/**
 * Compiles schemas.
 * @param {Object} tree
 * @param {Any} proto
 * @param {String} prefix
 * @param {Object} options
 * @api private
 */ function compile(tree, proto, prefix, options) {
    Document = Document || __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
    const typeKey = options.typeKey;
    for (const key of Object.keys(tree)){
        const limb = tree[key];
        const hasSubprops = isPOJO(limb) && Object.keys(limb).length > 0 && (!limb[typeKey] || typeKey === 'type' && isPOJO(limb.type) && limb.type.type);
        const subprops = hasSubprops ? limb : null;
        defineKey({
            prop: key,
            subprops: subprops,
            prototype: proto,
            prefix: prefix,
            options: options
        });
    }
}
/**
 * Defines the accessor named prop on the incoming prototype.
 * @param {Object} options
 * @param {String} options.prop
 * @param {Boolean} options.subprops
 * @param {Any} options.prototype
 * @param {String} [options.prefix]
 * @param {Object} options.options
 * @api private
 */ function defineKey({ prop, subprops, prototype, prefix, options }) {
    Document = Document || __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)");
    const path = (prefix ? prefix + '.' : '') + prop;
    prefix = prefix || '';
    const useGetOptions = prefix ? Object.freeze({}) : noDottedPathGetOptions;
    if (subprops) {
        Object.defineProperty(prototype, prop, {
            enumerable: true,
            configurable: true,
            get: function() {
                const _this = this;
                if (!this.$__.getters) {
                    this.$__.getters = {};
                }
                if (!this.$__.getters[path]) {
                    const nested = Object.create(Document.prototype, getOwnPropertyDescriptors(this));
                    // save scope for nested getters/setters
                    if (!prefix) {
                        nested.$__[scopeSymbol] = this;
                    }
                    nested.$__.nestedPath = path;
                    Object.defineProperty(nested, 'schema', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: prototype.schema
                    });
                    Object.defineProperty(nested, '$__schema', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: prototype.schema
                    });
                    Object.defineProperty(nested, documentSchemaSymbol, {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: prototype.schema
                    });
                    Object.defineProperty(nested, 'toObject', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: function() {
                            return clone(_this.get(path, null, {
                                virtuals: this && this.schema && this.schema.options && this.schema.options.toObject && this.schema.options.toObject.virtuals || null
                            }));
                        }
                    });
                    Object.defineProperty(nested, '$__get', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: function() {
                            return _this.get(path, null, {
                                virtuals: this && this.schema && this.schema.options && this.schema.options.toObject && this.schema.options.toObject.virtuals || null
                            });
                        }
                    });
                    Object.defineProperty(nested, 'toJSON', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: function() {
                            return _this.get(path, null, {
                                virtuals: this && this.schema && this.schema.options && this.schema.options.toJSON && this.schema.options.toJSON.virtuals || null
                            });
                        }
                    });
                    Object.defineProperty(nested, '$__isNested', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: true
                    });
                    Object.defineProperty(nested, '$isEmpty', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: function() {
                            return Object.keys(this.get(path, null, _isEmptyOptions) || {}).length === 0;
                        }
                    });
                    Object.defineProperty(nested, '$__parent', {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: this
                    });
                    compile(subprops, nested, path, options);
                    this.$__.getters[path] = nested;
                }
                return this.$__.getters[path];
            },
            set: function(v) {
                if (v != null && v.$__isNested) {
                    // Convert top-level to POJO, but leave subdocs hydrated so `$set`
                    // can handle them. See gh-9293.
                    v = v.$__get();
                } else if (v instanceof Document && !v.$__isNested) {
                    v = v.$toObject(internalToObjectOptions);
                }
                const doc = this.$__[scopeSymbol] || this;
                doc.$set(path, v);
            }
        });
    } else {
        Object.defineProperty(prototype, prop, {
            enumerable: true,
            configurable: true,
            get: function() {
                return this[getSymbol].call(this.$__[scopeSymbol] || this, path, null, useGetOptions);
            },
            set: function(v) {
                this.$set.call(this.$__[scopeSymbol] || this, path, v);
            }
        });
    }
}
// gets descriptors for all properties of `object`
// makes all properties non-enumerable to match previous behavior to #2211
function getOwnPropertyDescriptors(object) {
    const result = {};
    Object.getOwnPropertyNames(object).forEach(function(key) {
        const skip = [
            'isNew',
            '$__',
            '$errors',
            'errors',
            '_doc',
            '$locals',
            '$op',
            '__parentArray',
            '__index',
            '$isDocumentArrayElement'
        ].indexOf(key) === -1;
        if (skip) {
            return;
        }
        result[key] = Object.getOwnPropertyDescriptor(object, key);
        result[key].enumerable = false;
    });
    return result;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/firstKey.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function firstKey(obj) {
    if (obj == null) {
        return null;
    }
    return Object.keys(obj)[0];
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/common.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const Binary = __turbopack_context__.r("[project]/backend/node_modules/bson/lib/bson.cjs [app-route] (ecmascript)").Binary;
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const isMongooseObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isMongooseObject.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
exports.flatten = flatten;
exports.modifiedPaths = modifiedPaths;
/*!
 * ignore
 */ function flatten(update, path, options, schema) {
    let keys;
    if (update && isMongooseObject(update) && !Buffer.isBuffer(update)) {
        keys = Object.keys(update.toObject({
            transform: false,
            virtuals: false
        }) || {});
    } else {
        keys = Object.keys(update || {});
    }
    const numKeys = keys.length;
    const result = {};
    path = path ? path + '.' : '';
    for(let i = 0; i < numKeys; ++i){
        const key = keys[i];
        const val = update[key];
        result[path + key] = val;
        // Avoid going into mixed paths if schema is specified
        const keySchema = schema && schema.path && schema.path(path + key);
        const isNested = schema && schema.nested && schema.nested[path + key];
        if (keySchema && keySchema.instance === 'Mixed') continue;
        if (shouldFlatten(val)) {
            if (options && options.skipArrays && Array.isArray(val)) {
                continue;
            }
            const flat = flatten(val, path + key, options, schema);
            for(const k in flat){
                result[k] = flat[k];
            }
            if (Array.isArray(val)) {
                result[path + key] = val;
            }
        }
        if (isNested) {
            const paths = Object.keys(schema.paths);
            for (const p of paths){
                if (p.startsWith(path + key + '.') && !result.hasOwnProperty(p)) {
                    result[p] = void 0;
                }
            }
        }
    }
    return result;
}
/*!
 * ignore
 */ function modifiedPaths(update, path, result, recursion = null) {
    if (update == null || typeof update !== 'object') {
        return;
    }
    if (recursion == null) {
        recursion = {
            raw: {
                update,
                path
            },
            trace: new WeakSet()
        };
    }
    if (recursion.trace.has(update)) {
        throw new MongooseError(`a circular reference in the update value, updateValue:
${util.inspect(recursion.raw.update, {
            showHidden: false,
            depth: 1
        })}
updatePath: '${recursion.raw.path}'`);
    }
    recursion.trace.add(update);
    const keys = Object.keys(update || {});
    const numKeys = keys.length;
    result = result || {};
    path = path ? path + '.' : '';
    for(let i = 0; i < numKeys; ++i){
        const key = keys[i];
        let val = update[key];
        const _path = path + key;
        result[_path] = true;
        if (!Buffer.isBuffer(val) && isMongooseObject(val)) {
            val = val.toObject({
                transform: false,
                virtuals: false
            });
        }
        if (shouldFlatten(val)) {
            modifiedPaths(val, path + key, result, recursion);
        }
    }
    recursion.trace.delete(update);
    return result;
}
/*!
 * ignore
 */ function shouldFlatten(val) {
    return val && typeof val === 'object' && !(val instanceof Date) && !isBsonType(val, 'ObjectId') && (!Array.isArray(val) || val.length !== 0) && !(val instanceof Buffer) && !isBsonType(val, 'Decimal128') && !(val instanceof Binary);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Simplified lodash.get to work around the annoying null quirk. See:
 * https://github.com/lodash/lodash/issues/3659
 * @api private
 */ module.exports = function get(obj, path, def) {
    let parts;
    let isPathArray = false;
    if (typeof path === 'string') {
        if (path.indexOf('.') === -1) {
            const _v = getProperty(obj, path);
            if (_v == null) {
                return def;
            }
            return _v;
        }
        parts = path.split('.');
    } else {
        isPathArray = true;
        parts = path;
        if (parts.length === 1) {
            const _v = getProperty(obj, parts[0]);
            if (_v == null) {
                return def;
            }
            return _v;
        }
    }
    let rest = path;
    let cur = obj;
    for (const part of parts){
        if (cur == null) {
            return def;
        }
        // `lib/cast.js` depends on being able to get dotted paths in updates,
        // like `{ $set: { 'a.b': 42 } }`
        if (!isPathArray && cur[rest] != null) {
            return cur[rest];
        }
        cur = getProperty(cur, part);
        if (!isPathArray) {
            rest = rest.substr(part.length + 1);
        }
    }
    return cur == null ? def : cur;
};
function getProperty(obj, prop) {
    if (obj == null) {
        return obj;
    }
    if (obj instanceof Map) {
        return obj.get(prop);
    }
    return obj[prop];
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/areDiscriminatorValuesEqual.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
module.exports = function areDiscriminatorValuesEqual(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a === b;
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return a === b;
    }
    if (isBsonType(a, 'ObjectId') && isBsonType(b, 'ObjectId')) {
        return a.toString() === b.toString();
    }
    return false;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getSchemaDiscriminatorByValue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const areDiscriminatorValuesEqual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/areDiscriminatorValuesEqual.js [app-route] (ecmascript)");
/**
 * returns discriminator by discriminatorMapping.value
 *
 * @param {Schema} schema
 * @param {string} value
 * @api private
 */ module.exports = function getSchemaDiscriminatorByValue(schema, value) {
    if (schema == null || schema.discriminators == null) {
        return null;
    }
    for (const key of Object.keys(schema.discriminators)){
        const discriminatorSchema = schema.discriminators[key];
        if (discriminatorSchema.discriminatorMapping == null) {
            continue;
        }
        if (areDiscriminatorValuesEqual(discriminatorSchema.discriminatorMapping.value, value)) {
            return discriminatorSchema;
        }
    }
    return null;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/getEmbeddedDiscriminatorPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getSchemaDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getSchemaDiscriminatorByValue.js [app-route] (ecmascript)");
/**
 * Like `schema.path()`, except with a document, because impossible to
 * determine path type without knowing the embedded discriminator key.
 *
 * @param {Document} doc
 * @param {String|String[]} path
 * @param {Object} [options]
 * @api private
 */ module.exports = function getEmbeddedDiscriminatorPath(doc, path, options) {
    options = options || {};
    const typeOnly = options.typeOnly;
    const parts = Array.isArray(path) ? path : path.indexOf('.') === -1 ? [
        path
    ] : path.split('.');
    let schemaType = null;
    let type = 'adhocOrUndefined';
    const schema = getSchemaDiscriminatorByValue(doc.schema, doc.get(doc.schema.options.discriminatorKey)) || doc.schema;
    for(let i = 0; i < parts.length; ++i){
        const subpath = parts.slice(0, i + 1).join('.');
        schemaType = schema.path(subpath);
        if (schemaType == null) {
            type = 'adhocOrUndefined';
            continue;
        }
        if (schemaType.instance === 'Mixed') {
            return typeOnly ? 'real' : schemaType;
        }
        type = schema.pathType(subpath);
        if ((schemaType.$isSingleNested || schemaType.$isMongooseDocumentArrayElement) && schemaType.schema.discriminators != null) {
            const discriminators = schemaType.schema.discriminators;
            const discriminatorKey = doc.get(subpath + '.' + get(schemaType, 'schema.options.discriminatorKey'));
            if (discriminatorKey == null || discriminators[discriminatorKey] == null) {
                continue;
            }
            const rest = parts.slice(i + 1).join('.');
            return getEmbeddedDiscriminatorPath(doc.get(subpath), rest, options);
        }
    }
    // Are we getting the whole schema or just the type, 'real', 'nested', etc.
    return typeOnly ? type : schemaType;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/getKeysInSchemaOrder.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
module.exports = function getKeysInSchemaOrder(schema, val, path) {
    const schemaKeys = path != null ? Object.keys(get(schema.tree, path, {})) : Object.keys(schema.tree);
    const valKeys = new Set(Object.keys(val));
    let keys;
    if (valKeys.size > 1) {
        keys = new Set();
        for (const key of schemaKeys){
            if (valKeys.has(key)) {
                keys.add(key);
            }
        }
        for (const key of valKeys){
            if (!keys.has(key)) {
                keys.add(key);
            }
        }
        keys = Array.from(keys);
    } else {
        keys = Array.from(valKeys);
    }
    return keys;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/getSubdocumentStrictValue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Find the `strict` mode setting for the deepest subdocument along a given path
 * to ensure we have the correct default value for `strict`. When setting values
 * underneath a subdocument, we should use the subdocument's `strict` setting by
 * default, not the top-level document's.
 *
 * @param {Schema} schema
 * @param {String[]} parts
 * @returns {boolean | 'throw' | undefined}
 */ module.exports = function getSubdocumentStrictValue(schema, parts) {
    if (parts.length === 1) {
        return undefined;
    }
    let cur = parts[0];
    let strict = undefined;
    for(let i = 0; i < parts.length - 1; ++i){
        const curSchemaType = schema.path(cur);
        if (curSchemaType && curSchemaType.schema) {
            strict = curSchemaType.schema.options.strict;
            schema = curSchemaType.schema;
            cur = curSchemaType.$isMongooseDocumentArray && !isNaN(parts[i + 1]) ? '' : parts[i + 1];
        } else {
            cur += cur.length ? '.' + parts[i + 1] : parts[i + 1];
        }
    }
    return strict;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/handleSpreadDoc.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const keysToSkip = new Set([
    '__index',
    '__parentArray',
    '_doc'
]);
/**
 * Using spread operator on a Mongoose document gives you a
 * POJO that has a tendency to cause infinite recursion. So
 * we use this function on `set()` to prevent that.
 */ module.exports = function handleSpreadDoc(v, includeExtraKeys) {
    if (utils.isPOJO(v) && v.$__ != null && v._doc != null) {
        if (includeExtraKeys) {
            const extraKeys = {};
            for (const key of Object.keys(v)){
                if (typeof key === 'symbol') {
                    continue;
                }
                if (key[0] === '$') {
                    continue;
                }
                if (keysToSkip.has(key)) {
                    continue;
                }
                extraKeys[key] = v[key];
            }
            return {
                ...v._doc,
                ...extraKeys
            };
        }
        return v._doc;
    }
    return v;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isDefiningProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function isDefiningProjection(val) {
    if (val == null) {
        // `undefined` or `null` become exclusive projections
        return true;
    }
    if (typeof val === 'object') {
        // Only cases where a value does **not** define whether the whole projection
        // is inclusive or exclusive are `$meta` and `$slice`.
        return !('$meta' in val) && !('$slice' in val);
    }
    return true;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isExclusive.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isDefiningProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isDefiningProjection.js [app-route] (ecmascript)");
const isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function isExclusive(projection) {
    if (projection == null) {
        return null;
    }
    const keys = Object.keys(projection);
    let exclude = null;
    if (keys.length === 1 && keys[0] === '_id') {
        exclude = !projection._id;
    } else {
        for(let ki = 0; ki < keys.length; ++ki){
            // Does this projection explicitly define inclusion/exclusion?
            // Explicitly avoid `$meta` and `$slice`
            const key = keys[ki];
            if (key !== '_id' && isDefiningProjection(projection[key])) {
                exclude = isPOJO(projection[key]) ? isExclusive(projection[key]) ?? exclude : !projection[key];
                if (exclude != null) {
                    break;
                }
            }
        }
    }
    return exclude;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isPathExcluded.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isDefiningProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isDefiningProjection.js [app-route] (ecmascript)");
/**
 * Determines if `path` is excluded by `projection`
 *
 * @param {Object} projection
 * @param {String} path
 * @return {Boolean}
 * @api private
 */ module.exports = function isPathExcluded(projection, path) {
    if (projection == null) {
        return false;
    }
    if (path === '_id') {
        return projection._id === 0;
    }
    const paths = Object.keys(projection);
    let type = null;
    for (const _path of paths){
        if (isDefiningProjection(projection[_path])) {
            type = projection[path] === 1 ? 'inclusive' : 'exclusive';
            break;
        }
    }
    if (type === 'inclusive') {
        return projection[path] !== 1;
    }
    if (type === 'exclusive') {
        return projection[path] === 0;
    }
    return false;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/markArraySubdocsPopulated.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/**
 * If populating a path within a document array, make sure each
 * subdoc within the array knows its subpaths are populated.
 *
 * #### Example:
 *
 *     const doc = await Article.findOne().populate('comments.author');
 *     doc.comments[0].populated('author'); // Should be set
 *
 * @param {Document} doc
 * @param {Object} [populated]
 * @api private
 */ module.exports = function markArraySubdocsPopulated(doc, populated) {
    if (doc._doc._id == null || populated == null || populated.length === 0) {
        return;
    }
    const id = String(doc._doc._id);
    for (const item of populated){
        if (item.isVirtual) {
            continue;
        }
        const path = item.path;
        const pieces = path.split('.');
        for(let i = 0; i < pieces.length - 1; ++i){
            const subpath = pieces.slice(0, i + 1).join('.');
            const rest = pieces.slice(i + 1).join('.');
            const val = doc.get(subpath);
            if (val == null) {
                continue;
            }
            if (utils.isMongooseDocumentArray(val)) {
                for(let j = 0; j < val.length; ++j){
                    if (val[j]) {
                        val[j].populated(rest, item._docs[id] == null ? void 0 : item._docs[id][j], item);
                    }
                }
                break;
            }
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/minimize.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { isPOJO } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
module.exports = minimize;
/**
 * Minimizes an object, removing undefined values and empty objects
 *
 * @param {Object} object to minimize
 * @return {Object|undefined}
 * @api private
 */ function minimize(obj) {
    const keys = Object.keys(obj);
    let i = keys.length;
    let hasKeys;
    let key;
    let val;
    while(i--){
        key = keys[i];
        val = obj[key];
        if (isPOJO(val)) {
            obj[key] = minimize(val);
        }
        if (undefined === obj[key]) {
            delete obj[key];
            continue;
        }
        hasKeys = true;
    }
    return hasKeys ? obj : undefined;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/path/parentPaths.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const dotRE = /\./g;
module.exports = function parentPaths(path) {
    if (path.indexOf('.') === -1) {
        return [
            path
        ];
    }
    const pieces = path.split(dotRE);
    const len = pieces.length;
    const ret = new Array(len);
    let cur = '';
    for(let i = 0; i < len; ++i){
        cur += cur.length !== 0 ? '.' + pieces[i] : pieces[i];
        ret[i] = cur;
    }
    return ret;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/checkEmbeddedDiscriminatorKeyProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function checkEmbeddedDiscriminatorKeyProjection(userProjection, path, schema, selected, addedPaths) {
    const userProjectedInPath = Object.keys(userProjection).reduce((cur, key)=>cur || key.startsWith(path + '.'), false);
    const _discriminatorKey = path + '.' + schema.options.discriminatorKey;
    if (!userProjectedInPath && addedPaths.length === 1 && addedPaths[0] === _discriminatorKey) {
        selected.splice(selected.indexOf(_discriminatorKey), 1);
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const areDiscriminatorValuesEqual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/areDiscriminatorValuesEqual.js [app-route] (ecmascript)");
/**
 * returns discriminator by discriminatorMapping.value
 *
 * @param {Object} discriminators
 * @param {string} value
 * @api private
 */ module.exports = function getDiscriminatorByValue(discriminators, value) {
    if (discriminators == null) {
        return null;
    }
    for (const name of Object.keys(discriminators)){
        const it = discriminators[name];
        if (it.schema && it.schema.discriminatorMapping && areDiscriminatorValuesEqual(it.schema.discriminatorMapping.value, value)) {
            return it;
        }
    }
    return null;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isPathSelectedInclusive.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function isPathSelectedInclusive(fields, path) {
    const chunks = path.split('.');
    let cur = '';
    let j;
    let keys;
    let numKeys;
    for(let i = 0; i < chunks.length; ++i){
        cur += cur.length ? '.' : '' + chunks[i];
        if (fields[cur]) {
            keys = Object.keys(fields);
            numKeys = keys.length;
            for(j = 0; j < numKeys; ++j){
                if (keys[i].indexOf(cur + '.') === 0 && keys[i].indexOf(path) !== 0) {
                    continue;
                }
            }
            return true;
        }
    }
    return false;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/isPromise.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function isPromise(val) {
    return !!val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
}
module.exports = isPromise;
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/getDeepestSubdocumentForPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Find the deepest subdocument along a given path to ensure setter functions run
 * with the correct subdocument as `this`. If no subdocuments, returns the top-level
 * document.
 *
 * @param {Document} doc
 * @param {String[]} parts
 * @param {Schema} schema
 * @returns Document
 */ module.exports = function getDeepestSubdocumentForPath(doc, parts, schema) {
    let curPath = parts[0];
    let curSchema = schema;
    let subdoc = doc;
    for(let i = 0; i < parts.length - 1; ++i){
        const curSchemaType = curSchema.path(curPath);
        if (curSchemaType && curSchemaType.schema) {
            let newSubdoc = subdoc.get(curPath);
            curSchema = curSchemaType.schema;
            curPath = parts[i + 1];
            if (Array.isArray(newSubdoc) && !isNaN(curPath)) {
                newSubdoc = newSubdoc[curPath];
                curPath = '';
            }
            if (newSubdoc == null) {
                break;
            }
            subdoc = newSubdoc;
        } else {
            curPath += curPath.length ? '.' + parts[i + 1] : parts[i + 1];
        }
    }
    return subdoc;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/lookupLocalFields.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function lookupLocalFields(cur, path, val) {
    if (cur == null) {
        return cur;
    }
    if (cur._doc != null) {
        cur = cur._doc;
    }
    if (arguments.length >= 3) {
        if (typeof cur !== 'object') {
            return void 0;
        }
        if (val === void 0) {
            return void 0;
        }
        if (cur instanceof Map) {
            cur.set(path, val);
        } else {
            cur[path] = val;
        }
        return val;
    }
    // Support populating paths under maps using `map.$*.subpath`
    if (path === '$*') {
        return cur instanceof Map ? Array.from(cur.values()) : Object.keys(cur).map((key)=>cur[key]);
    }
    if (cur instanceof Map) {
        return cur.get(path);
    }
    return cur[path];
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/modelNamesFromRefPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const isPathExcluded = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isPathExcluded.js [app-route] (ecmascript)");
const lookupLocalFields = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/lookupLocalFields.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const hasNumericPropRE = /(\.\d+$|\.\d+\.)/g;
module.exports = function modelNamesFromRefPath(refPath, doc, populatedPath, modelSchema, queryProjection) {
    if (refPath == null) {
        return [];
    }
    if (typeof refPath === 'string' && queryProjection != null && isPathExcluded(queryProjection, refPath)) {
        throw new MongooseError('refPath `' + refPath + '` must not be excluded in projection, got ' + util.inspect(queryProjection));
    }
    // If populated path has numerics, the end `refPath` should too. For example,
    // if populating `a.0.b` instead of `a.b` and `b` has `refPath = a.c`, we
    // should return `a.0.c` for the refPath.
    if (hasNumericPropRE.test(populatedPath)) {
        const chunks = populatedPath.split(hasNumericPropRE);
        if (chunks[chunks.length - 1] === '') {
            throw new Error('Can\'t populate individual element in an array');
        }
        let _refPath = '';
        let _remaining = refPath;
        // 2nd, 4th, etc. will be numeric props. For example: `[ 'a', '.0.', 'b' ]`
        for(let i = 0; i < chunks.length; i += 2){
            const chunk = chunks[i];
            if (_remaining.startsWith(chunk + '.')) {
                _refPath += _remaining.substring(0, chunk.length) + chunks[i + 1];
                _remaining = _remaining.substring(chunk.length + 1);
            } else if (i === chunks.length - 1) {
                _refPath += _remaining;
                _remaining = '';
                break;
            } else {
                throw new Error('Could not normalize ref path, chunk ' + chunk + ' not in populated path');
            }
        }
        const refValue = mpath.get(_refPath, doc, lookupLocalFields);
        let modelNames = Array.isArray(refValue) ? refValue : [
            refValue
        ];
        modelNames = utils.array.flatten(modelNames);
        return modelNames;
    }
    const refValue = mpath.get(refPath, doc, lookupLocalFields);
    let modelNames;
    if (modelSchema != null && modelSchema.virtuals.hasOwnProperty(refPath)) {
        modelNames = [
            modelSchema.virtuals[refPath].applyGetters(void 0, doc)
        ];
    } else {
        modelNames = Array.isArray(refValue) ? refValue : [
            refValue
        ];
    }
    return modelNames;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/arrayDepth.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = arrayDepth;
function arrayDepth(arr) {
    if (!Array.isArray(arr)) {
        return {
            min: 0,
            max: 0,
            containsNonArrayItem: true
        };
    }
    if (arr.length === 0) {
        return {
            min: 1,
            max: 1,
            containsNonArrayItem: false
        };
    }
    if (arr.length === 1 && !Array.isArray(arr[0])) {
        return {
            min: 1,
            max: 1,
            containsNonArrayItem: false
        };
    }
    const res = arrayDepth(arr[0]);
    for(let i = 1; i < arr.length; ++i){
        const _res = arrayDepth(arr[i]);
        if (_res.min < res.min) {
            res.min = _res.min;
        }
        if (_res.max > res.max) {
            res.max = _res.max;
        }
        res.containsNonArrayItem = res.containsNonArrayItem || _res.containsNonArrayItem;
    }
    res.min = res.min + 1;
    res.max = res.max + 1;
    return res;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/omitUndefined.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function omitUndefined(val) {
    if (val == null || typeof val !== 'object') {
        return val;
    }
    if (Array.isArray(val)) {
        for(let i = val.length - 1; i >= 0; --i){
            if (val[i] === undefined) {
                val.splice(i, 1);
            }
        }
    }
    for (const key of Object.keys(val)){
        if (val[key] === void 0) {
            delete val[key];
        }
    }
    return val;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/cast$expr.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
const castNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/number.js [app-route] (ecmascript)");
const omitUndefined = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/omitUndefined.js [app-route] (ecmascript)");
const booleanComparison = new Set([
    '$and',
    '$or'
]);
const comparisonOperator = new Set([
    '$cmp',
    '$eq',
    '$lt',
    '$lte',
    '$gt',
    '$gte'
]);
const arithmeticOperatorArray = new Set([
    // avoid casting '$add' or '$subtract', because expressions can be either number or date,
    // and we don't have a good way of inferring which arguments should be numbers and which should
    // be dates.
    '$multiply',
    '$divide',
    '$log',
    '$mod',
    '$trunc',
    '$avg',
    '$max',
    '$min',
    '$stdDevPop',
    '$stdDevSamp',
    '$sum'
]);
const arithmeticOperatorNumber = new Set([
    '$abs',
    '$exp',
    '$ceil',
    '$floor',
    '$ln',
    '$log10',
    '$sqrt',
    '$sin',
    '$cos',
    '$tan',
    '$asin',
    '$acos',
    '$atan',
    '$atan2',
    '$asinh',
    '$acosh',
    '$atanh',
    '$sinh',
    '$cosh',
    '$tanh',
    '$degreesToRadians',
    '$radiansToDegrees'
]);
const arrayElementOperators = new Set([
    '$arrayElemAt',
    '$first',
    '$last'
]);
const dateOperators = new Set([
    '$year',
    '$month',
    '$week',
    '$dayOfMonth',
    '$dayOfYear',
    '$hour',
    '$minute',
    '$second',
    '$isoDayOfWeek',
    '$isoWeekYear',
    '$isoWeek',
    '$millisecond'
]);
const expressionOperator = new Set([
    '$not'
]);
module.exports = function cast$expr(val, schema, strictQuery) {
    if (typeof val === 'boolean') {
        return val;
    }
    if (typeof val !== 'object' || val === null) {
        throw new Error('`$expr` must be an object or boolean literal');
    }
    return _castExpression(val, schema, strictQuery);
};
function _castExpression(val, schema, strictQuery) {
    // Preserve the value if it represents a path or if it's null
    if (isPath(val) || val === null) {
        return val;
    }
    if (val.$cond != null) {
        if (Array.isArray(val.$cond)) {
            val.$cond = val.$cond.map((expr)=>_castExpression(expr, schema, strictQuery));
        } else {
            val.$cond.if = _castExpression(val.$cond.if, schema, strictQuery);
            val.$cond.then = _castExpression(val.$cond.then, schema, strictQuery);
            val.$cond.else = _castExpression(val.$cond.else, schema, strictQuery);
        }
    } else if (val.$ifNull != null) {
        val.$ifNull.map((v)=>_castExpression(v, schema, strictQuery));
    } else if (val.$switch != null) {
        if (Array.isArray(val.$switch.branches)) {
            val.$switch.branches = val.$switch.branches.map((v)=>_castExpression(v, schema, strictQuery));
        }
        if ('default' in val.$switch) {
            val.$switch.default = _castExpression(val.$switch.default, schema, strictQuery);
        }
    }
    const keys = Object.keys(val);
    for (const key of keys){
        if (booleanComparison.has(key)) {
            val[key] = val[key].map((v)=>_castExpression(v, schema, strictQuery));
        } else if (comparisonOperator.has(key)) {
            val[key] = castComparison(val[key], schema, strictQuery);
        } else if (arithmeticOperatorArray.has(key)) {
            val[key] = castArithmetic(val[key], schema, strictQuery);
        } else if (arithmeticOperatorNumber.has(key)) {
            val[key] = castNumberOperator(val[key], schema, strictQuery);
        } else if (expressionOperator.has(key)) {
            val[key] = _castExpression(val[key], schema, strictQuery);
        }
    }
    if (val.$in) {
        val.$in = castIn(val.$in, schema, strictQuery);
    }
    if (val.$size) {
        val.$size = castNumberOperator(val.$size, schema, strictQuery);
    }
    if (val.$round) {
        const $round = val.$round;
        if (!Array.isArray($round) || $round.length < 1 || $round.length > 2) {
            throw new CastError('Array', $round, '$round');
        }
        val.$round = $round.map((v)=>castNumberOperator(v, schema, strictQuery));
    }
    omitUndefined(val);
    return val;
}
// { $op: <number> }
function castNumberOperator(val) {
    if (!isLiteral(val)) {
        return val;
    }
    try {
        return castNumber(val);
    } catch (err) {
        throw new CastError('Number', val);
    }
}
function castIn(val, schema, strictQuery) {
    const path = val[1];
    if (!isPath(path)) {
        return val;
    }
    const search = val[0];
    const schematype = schema.path(path.slice(1));
    if (schematype === null) {
        if (strictQuery === false) {
            return val;
        } else if (strictQuery === 'throw') {
            throw new StrictModeError('$in');
        }
        return void 0;
    }
    if (!schematype.$isMongooseArray) {
        throw new Error('Path must be an array for $in');
    }
    return [
        schematype.$isMongooseDocumentArray ? schematype.$embeddedSchemaType.cast(search) : schematype.caster.cast(search),
        path
    ];
}
// { $op: [<number>, <number>] }
function castArithmetic(val) {
    if (!Array.isArray(val)) {
        if (!isLiteral(val)) {
            return val;
        }
        try {
            return castNumber(val);
        } catch (err) {
            throw new CastError('Number', val);
        }
    }
    return val.map((v)=>{
        if (!isLiteral(v)) {
            return v;
        }
        try {
            return castNumber(v);
        } catch (err) {
            throw new CastError('Number', v);
        }
    });
}
// { $op: [expression, expression] }
function castComparison(val, schema, strictQuery) {
    if (!Array.isArray(val) || val.length !== 2) {
        throw new Error('Comparison operator must be an array of length 2');
    }
    val[0] = _castExpression(val[0], schema, strictQuery);
    const lhs = val[0];
    if (isLiteral(val[1])) {
        let path = null;
        let schematype = null;
        let caster = null;
        if (isPath(lhs)) {
            path = lhs.slice(1);
            schematype = schema.path(path);
        } else if (typeof lhs === 'object' && lhs != null) {
            for (const key of Object.keys(lhs)){
                if (dateOperators.has(key) && isPath(lhs[key])) {
                    path = lhs[key].slice(1) + '.' + key;
                    caster = castNumber;
                } else if (arrayElementOperators.has(key) && isPath(lhs[key])) {
                    path = lhs[key].slice(1) + '.' + key;
                    schematype = schema.path(lhs[key].slice(1));
                    if (schematype != null) {
                        if (schematype.$isMongooseDocumentArray) {
                            schematype = schematype.$embeddedSchemaType;
                        } else if (schematype.$isMongooseArray) {
                            schematype = schematype.caster;
                        }
                    }
                }
            }
        }
        const is$literal = typeof val[1] === 'object' && val[1] != null && val[1].$literal != null;
        if (schematype != null) {
            if (is$literal) {
                val[1] = {
                    $literal: schematype.cast(val[1].$literal)
                };
            } else {
                val[1] = schematype.cast(val[1]);
            }
        } else if (caster != null) {
            if (is$literal) {
                try {
                    val[1] = {
                        $literal: caster(val[1].$literal)
                    };
                } catch (err) {
                    throw new CastError(caster.name.replace(/^cast/, ''), val[1], path + '.$literal');
                }
            } else {
                try {
                    val[1] = caster(val[1]);
                } catch (err) {
                    throw new CastError(caster.name.replace(/^cast/, ''), val[1], path);
                }
            }
        } else if (path != null && strictQuery === true) {
            return void 0;
        } else if (path != null && strictQuery === 'throw') {
            throw new StrictModeError(path);
        }
    } else {
        val[1] = _castExpression(val[1]);
    }
    return val;
}
function isPath(val) {
    return typeof val === 'string' && val[0] === '$';
}
function isLiteral(val) {
    if (typeof val === 'string' && val[0] === '$') {
        return false;
    }
    if (typeof val === 'object' && val !== null && Object.keys(val).find((key)=>key[0] === '$')) {
        // The `$literal` expression can make an object a literal
        // https://www.mongodb.com/docs/manual/reference/operator/aggregation/literal/#mongodb-expression-exp.-literal
        return val.$literal != null;
    }
    return true;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/isOperator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const specialKeys = new Set([
    '$ref',
    '$id',
    '$db'
]);
module.exports = function isOperator(path) {
    return path[0] === '$' && !specialKeys.has(path);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Handles creating `{ type: 'object' }` vs `{ bsonType: 'object' }` vs `{ bsonType: ['object', 'null'] }`
 *
 * @param {String} type
 * @param {String} bsonType
 * @param {Boolean} useBsonType
 * @param {Boolean} isRequired
 */ module.exports = function createJSONSchemaTypeArray(type, bsonType, useBsonType, isRequired) {
    if (useBsonType) {
        if (isRequired) {
            return {
                bsonType
            };
        }
        return {
            bsonType: [
                bsonType,
                'null'
            ]
        };
    } else {
        if (isRequired) {
            return {
                type
            };
        }
        return {
            type: [
                type,
                'null'
            ]
        };
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/each.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function each(arr, cb, done) {
    if (arr.length === 0) {
        return done();
    }
    let remaining = arr.length;
    let err = null;
    for (const v of arr){
        cb(v, function(_err) {
            if (err != null) {
                return;
            }
            if (_err != null) {
                err = _err;
                return done(err);
            }
            if (--remaining <= 0) {
                return done();
            }
        });
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/applyBuiltinPlugins.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const builtinPlugins = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/plugins/index.js [app-route] (ecmascript)");
module.exports = function applyBuiltinPlugins(schema) {
    for (const plugin of Object.values(builtinPlugins)){
        plugin(schema, {
            deduplicate: true
        });
    }
    schema.plugins = Object.values(builtinPlugins).map((fn)=>({
            fn,
            opts: {
                deduplicate: true
            }
        })).concat(schema.plugins);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/mergeDiscriminatorSchema.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const schemaMerge = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/merge.js [app-route] (ecmascript)");
const specialProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
/**
 * Merges `from` into `to` without overwriting existing properties.
 *
 * @param {Object} to
 * @param {Object} from
 * @param {String} [path]
 * @api private
 */ module.exports = function mergeDiscriminatorSchema(to, from, path, seen) {
    const keys = Object.keys(from);
    let i = 0;
    const len = keys.length;
    let key;
    path = path || '';
    seen = seen || new WeakSet();
    if (seen.has(from)) {
        return;
    }
    seen.add(from);
    while(i < len){
        key = keys[i++];
        if (!path) {
            if (key === 'discriminators' || key === 'base' || key === '_applyDiscriminators' || key === '_userProvidedOptions' || key === 'options' || key === 'tree') {
                continue;
            }
        }
        if (path === 'tree' && from != null && from.instanceOfSchema) {
            continue;
        }
        if (specialProperties.has(key)) {
            continue;
        }
        if (to[key] == null) {
            to[key] = from[key];
        } else if (isObject(from[key])) {
            if (!isObject(to[key])) {
                to[key] = {};
            }
            if (from[key] != null) {
                // Skip merging schemas if we're creating a discriminator schema and
                // base schema has a given path as a single nested but discriminator schema
                // has the path as a document array, or vice versa (gh-9534)
                if (from[key].$isSingleNested && to[key].$isMongooseDocumentArray || from[key].$isMongooseDocumentArray && to[key].$isSingleNested || from[key].$isMongooseDocumentArrayElement && to[key].$isMongooseDocumentArrayElement) {
                    continue;
                } else if (from[key].instanceOfSchema) {
                    if (to[key].instanceOfSchema) {
                        schemaMerge(to[key], from[key].clone(), true);
                    } else {
                        to[key] = from[key].clone();
                    }
                    continue;
                } else if (isBsonType(from[key], 'ObjectId')) {
                    to[key] = new ObjectId(from[key]);
                    continue;
                } else if (from[key] instanceof SchemaType) {
                    if (to[key] == null) {
                        to[key] = from[key].clone();
                    }
                    // For container types with nested schemas, we need to continue to the
                    // recursive merge below to properly merge the nested schemas
                    if (!from[key].$isMongooseDocumentArray && !from[key].$isSingleNested) {
                        continue;
                    }
                }
            }
            mergeDiscriminatorSchema(to[key], from[key], path ? path + '.' + key : key, seen);
        }
    }
    if (from != null && from.instanceOfSchema) {
        to.tree = Object.assign({}, from.tree, to.tree);
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/discriminator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Mixed = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/mixed.js [app-route] (ecmascript)");
const applyBuiltinPlugins = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/applyBuiltinPlugins.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const defineKey = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/compile.js [app-route] (ecmascript)").defineKey;
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const mergeDiscriminatorSchema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/mergeDiscriminatorSchema.js [app-route] (ecmascript)");
const CUSTOMIZABLE_DISCRIMINATOR_OPTIONS = {
    toJSON: true,
    toObject: true,
    _id: true,
    id: true,
    virtuals: true,
    methods: true,
    statics: true
};
/**
 * Validate fields declared on the child schema when either schema is configured for encryption.  Specifically, this function ensures that:
 *
 * - any encrypted fields are declared on exactly one of the schemas (not both)
 * - encrypted fields cannot be declared on either the parent or child schema, where the other schema declares the same field without encryption.
 *
 * @param {Schema} parentSchema
 * @param {Schema} childSchema
 */ function validateDiscriminatorSchemasForEncryption(parentSchema, childSchema) {
    if (parentSchema.encryptionType() == null && childSchema.encryptionType() == null) return;
    const allSharedNestedPaths = setIntersection(allNestedPaths(parentSchema), allNestedPaths(childSchema));
    for (const path of allSharedNestedPaths){
        if (parentSchema._hasEncryptedField(path) && childSchema._hasEncryptedField(path)) {
            throw new Error(`encrypted fields cannot be declared on both the base schema and the child schema in a discriminator. path=${path}`);
        }
        if (parentSchema._hasEncryptedField(path) || childSchema._hasEncryptedField(path)) {
            throw new Error(`encrypted fields cannot have the same path as a non-encrypted field for discriminators. path=${path}`);
        }
    }
    function allNestedPaths(schema) {
        return [
            ...Object.keys(schema.paths),
            ...Object.keys(schema.singleNestedPaths)
        ];
    }
    /**
   * @param {Iterable<string>} i1
   * @param {Iterable<string>} i2
   */ function* setIntersection(i1, i2) {
        const s1 = new Set(i1);
        for (const item of i2){
            if (s1.has(item)) {
                yield item;
            }
        }
    }
}
/*!
 * ignore
 */ module.exports = function discriminator(model, name, schema, tiedValue, applyPlugins, mergeHooks, overwriteExisting) {
    if (!(schema && schema.instanceOfSchema)) {
        throw new Error('You must pass a valid discriminator Schema');
    }
    mergeHooks = mergeHooks == null ? true : mergeHooks;
    if (model.schema.discriminatorMapping && !model.schema.discriminatorMapping.isRoot) {
        throw new Error('Discriminator "' + name + '" can only be a discriminator of the root model');
    }
    if (applyPlugins) {
        const applyPluginsToDiscriminators = get(model.base, 'options.applyPluginsToDiscriminators', false) || !mergeHooks;
        // Even if `applyPluginsToDiscriminators` isn't set, we should still apply
        // global plugins to schemas embedded in the discriminator schema (gh-7370)
        model.base._applyPlugins(schema, {
            skipTopLevel: !applyPluginsToDiscriminators
        });
    } else if (!mergeHooks) {
        applyBuiltinPlugins(schema);
    }
    const key = model.schema.options.discriminatorKey;
    const existingPath = model.schema.path(key);
    if (existingPath != null) {
        if (!utils.hasUserDefinedProperty(existingPath.options, 'select')) {
            existingPath.options.select = true;
        }
        existingPath.options.$skipDiscriminatorCheck = true;
    } else {
        const baseSchemaAddition = {};
        baseSchemaAddition[key] = {
            default: void 0,
            select: true,
            $skipDiscriminatorCheck: true
        };
        baseSchemaAddition[key][model.schema.options.typeKey] = String;
        model.schema.add(baseSchemaAddition);
        defineKey({
            prop: key,
            prototype: model.prototype,
            options: model.schema.options
        });
    }
    if (schema.path(key) && schema.path(key).options.$skipDiscriminatorCheck !== true) {
        throw new Error('Discriminator "' + name + '" cannot have field with name "' + key + '"');
    }
    let value = name;
    if (typeof tiedValue === 'string' && tiedValue.length || tiedValue != null) {
        value = tiedValue;
    }
    validateDiscriminatorSchemasForEncryption(model.schema, schema);
    function merge(schema, baseSchema) {
        // Retain original schema before merging base schema
        schema._baseSchema = baseSchema;
        if (baseSchema.paths._id && baseSchema.paths._id.options && !baseSchema.paths._id.options.auto) {
            schema.remove('_id');
        }
        // Find conflicting paths: if something is a path in the base schema
        // and a nested path in the child schema, overwrite the base schema path.
        // See gh-6076
        const baseSchemaPaths = Object.keys(baseSchema.paths);
        const conflictingPaths = [];
        for (const path of baseSchemaPaths){
            if (schema.nested[path]) {
                conflictingPaths.push(path);
                continue;
            }
            if (path.indexOf('.') === -1) {
                continue;
            }
            const sp = path.split('.').slice(0, -1);
            let cur = '';
            for (const piece of sp){
                cur += (cur.length ? '.' : '') + piece;
                if (schema.paths[cur] instanceof Mixed || schema.singleNestedPaths[cur] instanceof Mixed) {
                    conflictingPaths.push(path);
                }
            }
        }
        // Shallow clone `obj` so we can add additional properties without modifying original
        // schema. `Schema.prototype.clone()` copies `obj` by reference, no cloning.
        schema.obj = {
            ...schema.obj
        };
        mergeDiscriminatorSchema(schema, baseSchema);
        schema._gatherChildSchemas();
        // Clean up conflicting paths _after_ merging re: gh-6076
        for (const conflictingPath of conflictingPaths){
            delete schema.paths[conflictingPath];
        }
        // Rebuild schema models because schemas may have been merged re: #7884
        schema.childSchemas.forEach((obj)=>{
            obj.model.prototype.$__setSchema(obj.schema);
        });
        const obj = {};
        obj[key] = {
            default: value,
            select: true,
            set: function(newName) {
                if (newName === value || Array.isArray(value) && utils.deepEqual(newName, value)) {
                    return value;
                }
                throw new Error('Can\'t set discriminator key "' + key + '"');
            },
            $skipDiscriminatorCheck: true
        };
        obj[key][schema.options.typeKey] = existingPath ? existingPath.options[schema.options.typeKey] : String;
        schema.add(obj);
        schema.discriminatorMapping = {
            key: key,
            value: value,
            isRoot: false
        };
        if (baseSchema.options.collection) {
            schema.options.collection = baseSchema.options.collection;
        }
        const toJSON = schema.options.toJSON;
        const toObject = schema.options.toObject;
        const _id = schema.options._id;
        const id = schema.options.id;
        const keys = Object.keys(schema.options);
        schema.options.discriminatorKey = baseSchema.options.discriminatorKey;
        const userProvidedOptions = schema._userProvidedOptions;
        for (const _key of keys){
            if (!CUSTOMIZABLE_DISCRIMINATOR_OPTIONS[_key]) {
                // Use `schema.options` in `deepEqual()` because of `discriminatorKey`
                // set above. We don't allow customizing discriminator key, always
                // overwrite. See gh-9238
                if (_key in userProvidedOptions && !utils.deepEqual(schema.options[_key], baseSchema.options[_key])) {
                    throw new Error('Can\'t customize discriminator option ' + _key + ' (can only modify ' + Object.keys(CUSTOMIZABLE_DISCRIMINATOR_OPTIONS).join(', ') + ')');
                }
            }
        }
        schema.options = clone(baseSchema.options);
        for (const _key of Object.keys(userProvidedOptions)){
            schema.options[_key] = userProvidedOptions[_key];
        }
        if (toJSON) schema.options.toJSON = toJSON;
        if (toObject) schema.options.toObject = toObject;
        if (typeof _id !== 'undefined') {
            schema.options._id = _id;
        }
        schema.options.id = id;
        if (mergeHooks) {
            schema.s.hooks = model.schema.s.hooks.merge(schema.s.hooks);
        }
        if (applyPlugins) {
            schema.plugins = Array.prototype.slice.call(baseSchema.plugins);
        }
        schema.callQueue = baseSchema.callQueue.concat(schema.callQueue);
        delete schema._requiredpaths; // reset just in case Schema#requiredPaths() was called on either schema
    }
    // merges base schema into new discriminator schema and sets new type field.
    merge(schema, model.schema);
    if (!model.discriminators) {
        model.discriminators = {};
    }
    if (!model.schema.discriminatorMapping) {
        model.schema.discriminatorMapping = {
            key: key,
            value: null,
            isRoot: true
        };
    }
    if (!model.schema.discriminators) {
        model.schema.discriminators = {};
    }
    model.schema.discriminators[name] = schema;
    if (model.discriminators[name] && !schema.options.overwriteModels && !overwriteExisting) {
        throw new Error('Discriminator with name "' + name + '" already exists');
    }
    return schema;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getConstructor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
/**
 * Find the correct constructor, taking into account discriminators
 * @api private
 */ module.exports = function getConstructor(Constructor, value, defaultDiscriminatorValue) {
    const discriminatorKey = Constructor.schema.options.discriminatorKey;
    let discriminatorValue = value != null && value[discriminatorKey];
    if (discriminatorValue == null) {
        discriminatorValue = defaultDiscriminatorValue;
    }
    if (Constructor.discriminators && discriminatorValue != null) {
        if (Constructor.discriminators[discriminatorValue]) {
            Constructor = Constructor.discriminators[discriminatorValue];
        } else {
            const constructorByValue = getDiscriminatorByValue(Constructor.discriminators, discriminatorValue);
            if (constructorByValue) {
                Constructor = constructorByValue;
            }
        }
    }
    return Constructor;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/addAutoId.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function addAutoId(schema) {
    const _obj = {
        _id: {
            auto: true
        }
    };
    _obj._id[schema.options.typeKey] = 'ObjectId';
    schema.add(_obj);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/handleIdOption.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const addAutoId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/addAutoId.js [app-route] (ecmascript)");
module.exports = function handleIdOption(schema, options) {
    if (options == null || options._id == null) {
        return schema;
    }
    schema = schema.clone();
    if (!options._id) {
        schema.remove('_id');
        schema.options._id = false;
    } else if (!schema.paths['_id']) {
        addAutoId(schema);
        schema.options._id = true;
    }
    return schema;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/decorateDiscriminatorIndexOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function decorateDiscriminatorIndexOptions(schema, indexOptions) {
    // If the model is a discriminator and has an index, add a
    // partialFilterExpression by default so the index will only apply
    // to that discriminator.
    const discriminatorName = schema.discriminatorMapping && schema.discriminatorMapping.value;
    if (discriminatorName && !('sparse' in indexOptions)) {
        const discriminatorKey = schema.options.discriminatorKey;
        indexOptions.partialFilterExpression = indexOptions.partialFilterExpression || {};
        indexOptions.partialFilterExpression[discriminatorKey] = discriminatorName;
    }
    return indexOptions;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/getIndexes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const helperIsObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
const decorateDiscriminatorIndexOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/indexes/decorateDiscriminatorIndexOptions.js [app-route] (ecmascript)");
/**
 * Gather all indexes defined in the schema, including single nested,
 * document arrays, and embedded discriminators.
 * @param {Schema} schema
 * @api private
 */ module.exports = function getIndexes(schema) {
    let indexes = [];
    const schemaStack = new WeakMap();
    const indexTypes = schema.constructor.indexTypes;
    const indexByName = new Map();
    collectIndexes(schema);
    return indexes;
    //TURBOPACK unreachable
    ;
    function collectIndexes(schema, prefix, baseSchema) {
        // Ignore infinitely nested schemas, if we've already seen this schema
        // along this path there must be a cycle
        if (schemaStack.has(schema)) {
            return;
        }
        schemaStack.set(schema, true);
        prefix = prefix || '';
        const keys = Object.keys(schema.paths);
        for (const key of keys){
            const path = schema.paths[key];
            if (baseSchema != null && baseSchema.paths[key]) {
                continue;
            }
            if (path._duplicateKeyErrorMessage != null) {
                schema._duplicateKeyErrorMessagesByPath = schema._duplicateKeyErrorMessagesByPath || {};
                schema._duplicateKeyErrorMessagesByPath[key] = path._duplicateKeyErrorMessage;
            }
            if (path.$isMongooseDocumentArray || path.$isSingleNested) {
                if (get(path, 'options.excludeIndexes') !== true && get(path, 'schemaOptions.excludeIndexes') !== true && get(path, 'schema.options.excludeIndexes') !== true) {
                    collectIndexes(path.schema, prefix + key + '.');
                }
                if (path.schema.discriminators != null) {
                    const discriminators = path.schema.discriminators;
                    const discriminatorKeys = Object.keys(discriminators);
                    for (const discriminatorKey of discriminatorKeys){
                        collectIndexes(discriminators[discriminatorKey], prefix + key + '.', path.schema);
                    }
                }
                // Retained to minimize risk of backwards breaking changes due to
                // gh-6113
                if (path.$isMongooseDocumentArray) {
                    continue;
                }
            }
            const index = path._index || path.caster && path.caster._index;
            if (index !== false && index !== null && index !== undefined) {
                const field = {};
                const isObject = helperIsObject(index);
                const options = isObject ? {
                    ...index
                } : {};
                const type = typeof index === 'string' ? index : isObject ? index.type : false;
                if (type && indexTypes.indexOf(type) !== -1) {
                    field[prefix + key] = type;
                } else if (options.text) {
                    field[prefix + key] = 'text';
                    delete options.text;
                } else {
                    let isDescendingIndex = false;
                    if (index === 'descending' || index === 'desc') {
                        isDescendingIndex = true;
                    } else if (index === 'ascending' || index === 'asc') {
                        isDescendingIndex = false;
                    } else {
                        isDescendingIndex = Number(index) === -1;
                    }
                    field[prefix + key] = isDescendingIndex ? -1 : 1;
                }
                delete options.type;
                if (!('background' in options)) {
                    options.background = true;
                }
                if (schema.options.autoIndex != null) {
                    options._autoIndex = schema.options.autoIndex;
                }
                const indexName = options && options.name;
                if (typeof indexName === 'string') {
                    if (indexByName.has(indexName)) {
                        Object.assign(indexByName.get(indexName), field);
                    } else {
                        indexes.push([
                            field,
                            options
                        ]);
                        indexByName.set(indexName, field);
                    }
                } else {
                    indexes.push([
                        field,
                        options
                    ]);
                    indexByName.set(indexName, field);
                }
            }
        }
        schemaStack.delete(schema);
        if (prefix) {
            fixSubIndexPaths(schema, prefix);
        } else {
            schema._indexes.forEach(function(index) {
                const options = index[1];
                if (!('background' in options)) {
                    options.background = true;
                }
                decorateDiscriminatorIndexOptions(schema, options);
            });
            indexes = indexes.concat(schema._indexes);
        }
    }
    /**
   * Checks for indexes added to subdocs using Schema.index().
   * These indexes need their paths prefixed properly.
   *
   * schema._indexes = [ [indexObj, options], [indexObj, options] ..]
   * @param {Schema} schema
   * @param {String} prefix
   * @api private
   */ function fixSubIndexPaths(schema, prefix) {
        const subindexes = schema._indexes;
        const len = subindexes.length;
        for(let i = 0; i < len; ++i){
            const indexObj = subindexes[i][0];
            const indexOptions = subindexes[i][1];
            const keys = Object.keys(indexObj);
            const klen = keys.length;
            const newindex = {};
            // use forward iteration, order matters
            for(let j = 0; j < klen; ++j){
                const key = keys[j];
                newindex[prefix + key] = indexObj[key];
            }
            const newIndexOptions = Object.assign({}, indexOptions);
            if (indexOptions != null && indexOptions.partialFilterExpression != null) {
                newIndexOptions.partialFilterExpression = {};
                const partialFilterExpression = indexOptions.partialFilterExpression;
                for (const key of Object.keys(partialFilterExpression)){
                    newIndexOptions.partialFilterExpression[prefix + key] = partialFilterExpression[key];
                }
            }
            indexes.push([
                newindex,
                newIndexOptions
            ]);
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/handleReadPreferenceAliases.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function handleReadPreferenceAliases(pref) {
    switch(pref){
        case 'p':
            pref = 'primary';
            break;
        case 'pp':
            pref = 'primaryPreferred';
            break;
        case 's':
            pref = 'secondary';
            break;
        case 'sp':
            pref = 'secondaryPreferred';
            break;
        case 'n':
            pref = 'nearest';
            break;
    }
    return pref;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/idGetter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function addIdGetter(schema) {
    // ensure the documents receive an id getter unless disabled
    const autoIdGetter = !schema.paths['id'] && schema.paths['_id'] && schema.options.id;
    if (!autoIdGetter) {
        return schema;
    }
    if (schema.aliases && schema.aliases.id) {
        return schema;
    }
    schema.virtual('id').get(idGetter);
    return schema;
};
/**
 * Returns this documents _id cast to a string.
 * @api private
 */ function idGetter() {
    if (this._id != null) {
        return this._id.toString();
    }
    return null;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/isIndexSpecEqual.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Compares two index specifications to determine if they are equal.
 *
 * #### Example:
 *     isIndexSpecEqual({ a: 1, b: 1 }, { a: 1, b: 1 }); // true
 *     isIndexSpecEqual({ a: 1, b: 1 }, { b: 1, a: 1 }); // false
 *     isIndexSpecEqual({ a: 1, b: -1 }, { a: 1, b: 1 }); // false
 *
 * @param {Object} spec1 The first index specification to compare.
 * @param {Object} spec2 The second index specification to compare.
 * @returns {Boolean} Returns true if the index specifications are equal, otherwise returns false.
 */ module.exports = function isIndexSpecEqual(spec1, spec2) {
    const spec1Keys = Object.keys(spec1);
    const spec2Keys = Object.keys(spec2);
    if (spec1Keys.length !== spec2Keys.length) {
        return false;
    }
    for(let i = 0; i < spec1Keys.length; i++){
        const key = spec1Keys[i];
        if (key !== spec2Keys[i] || spec1[key] !== spec2[key]) {
            return false;
        }
    }
    return true;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/setPopulatedVirtualValue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Set a populated virtual value on a document's `$$populatedVirtuals` value
 *
 * @param {*} populatedVirtuals A document's `$$populatedVirtuals`
 * @param {*} name The virtual name
 * @param {*} v The result of the populate query
 * @param {*} options The populate options. This function handles `justOne` and `count` options.
 * @returns {Array<Document>|Document|Object|Array<Object>} the populated virtual value that was set
 */ module.exports = function setPopulatedVirtualValue(populatedVirtuals, name, v, options) {
    if (options.justOne || options.count) {
        populatedVirtuals[name] = Array.isArray(v) ? v[0] : v;
        if (typeof populatedVirtuals[name] !== 'object') {
            populatedVirtuals[name] = options.count ? v : null;
        }
    } else {
        populatedVirtuals[name] = Array.isArray(v) ? v : v == null ? [] : [
            v
        ];
        populatedVirtuals[name] = populatedVirtuals[name].filter(function(doc) {
            return doc && typeof doc === 'object';
        });
    }
    return populatedVirtuals[name];
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/cleanPositionalOperators.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * For consistency's sake, we replace positional operator `$` and array filters
 * `$[]` and `$[foo]` with `0` when looking up schema paths.
 */ module.exports = function cleanPositionalOperators(path) {
    return path.replace(/\.\$(\[[^\]]*\])?(?=\.)/g, '.0').replace(/\.\$(\[[^\]]*\])?$/g, '.0');
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/handleTimestampOption.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = handleTimestampOption;
/*!
 * ignore
 */ function handleTimestampOption(arg, prop) {
    if (arg == null) {
        return null;
    }
    if (typeof arg === 'boolean') {
        return prop;
    }
    if (typeof arg[prop] === 'boolean') {
        return arg[prop] ? prop : null;
    }
    if (!(prop in arg)) {
        return prop;
    }
    return arg[prop];
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToChildren.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const cleanPositionalOperators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/cleanPositionalOperators.js [app-route] (ecmascript)");
const handleTimestampOption = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/handleTimestampOption.js [app-route] (ecmascript)");
module.exports = applyTimestampsToChildren;
/*!
 * ignore
 */ function applyTimestampsToChildren(now, update, schema) {
    if (update == null) {
        return;
    }
    const keys = Object.keys(update);
    const hasDollarKey = keys.some((key)=>key[0] === '$');
    if (hasDollarKey) {
        if (update.$push) {
            _applyTimestampToUpdateOperator(update.$push);
        }
        if (update.$addToSet) {
            _applyTimestampToUpdateOperator(update.$addToSet);
        }
        if (update.$set != null) {
            const keys = Object.keys(update.$set);
            for (const key of keys){
                applyTimestampsToUpdateKey(schema, key, update.$set, now);
            }
        }
        if (update.$setOnInsert != null) {
            const keys = Object.keys(update.$setOnInsert);
            for (const key of keys){
                applyTimestampsToUpdateKey(schema, key, update.$setOnInsert, now);
            }
        }
    }
    const updateKeys = Object.keys(update).filter((key)=>key[0] !== '$');
    for (const key of updateKeys){
        applyTimestampsToUpdateKey(schema, key, update, now);
    }
    function _applyTimestampToUpdateOperator(op) {
        for (const key of Object.keys(op)){
            const $path = schema.path(key.replace(/\.\$\./i, '.').replace(/.\$$/, ''));
            if (op[key] && $path && $path.$isMongooseDocumentArray && $path.schema.options.timestamps) {
                const timestamps = $path.schema.options.timestamps;
                const createdAt = handleTimestampOption(timestamps, 'createdAt');
                const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
                if (op[key].$each) {
                    op[key].$each.forEach(function(subdoc) {
                        if (updatedAt != null) {
                            subdoc[updatedAt] = now;
                        }
                        if (createdAt != null) {
                            subdoc[createdAt] = now;
                        }
                        applyTimestampsToChildren(now, subdoc, $path.schema);
                    });
                } else {
                    if (updatedAt != null) {
                        op[key][updatedAt] = now;
                    }
                    if (createdAt != null) {
                        op[key][createdAt] = now;
                    }
                    applyTimestampsToChildren(now, op[key], $path.schema);
                }
            }
        }
    }
}
function applyTimestampsToDocumentArray(arr, schematype, now) {
    const timestamps = schematype.schema.options.timestamps;
    const len = arr.length;
    if (!timestamps) {
        for(let i = 0; i < len; ++i){
            applyTimestampsToChildren(now, arr[i], schematype.schema);
        }
        return;
    }
    const createdAt = handleTimestampOption(timestamps, 'createdAt');
    const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
    for(let i = 0; i < len; ++i){
        if (updatedAt != null) {
            arr[i][updatedAt] = now;
        }
        if (createdAt != null) {
            arr[i][createdAt] = now;
        }
        applyTimestampsToChildren(now, arr[i], schematype.schema);
    }
}
function applyTimestampsToSingleNested(subdoc, schematype, now) {
    const timestamps = schematype.schema.options.timestamps;
    if (!timestamps) {
        applyTimestampsToChildren(now, subdoc, schematype.schema);
        return;
    }
    const createdAt = handleTimestampOption(timestamps, 'createdAt');
    const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
    if (updatedAt != null) {
        subdoc[updatedAt] = now;
    }
    if (createdAt != null) {
        subdoc[createdAt] = now;
    }
    applyTimestampsToChildren(now, subdoc, schematype.schema);
}
function applyTimestampsToUpdateKey(schema, key, update, now) {
    // Replace positional operator `$` and array filters `$[]` and `$[.*]`
    const keyToSearch = cleanPositionalOperators(key);
    const path = schema.path(keyToSearch);
    if (!path) {
        return;
    }
    const parentSchemaTypes = [];
    const pieces = keyToSearch.split('.');
    for(let i = pieces.length - 1; i > 0; --i){
        const s = schema.path(pieces.slice(0, i).join('.'));
        if (s != null && (s.$isMongooseDocumentArray || s.$isSingleNested)) {
            parentSchemaTypes.push({
                parentPath: key.split('.').slice(0, i).join('.'),
                parentSchemaType: s
            });
        }
    }
    if (Array.isArray(update[key]) && path.$isMongooseDocumentArray) {
        applyTimestampsToDocumentArray(update[key], path, now);
    } else if (update[key] && path.$isSingleNested) {
        applyTimestampsToSingleNested(update[key], path, now);
    } else if (parentSchemaTypes.length > 0) {
        for (const item of parentSchemaTypes){
            const parentPath = item.parentPath;
            const parentSchemaType = item.parentSchemaType;
            const timestamps = parentSchemaType.schema.options.timestamps;
            const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
            if (!timestamps || updatedAt == null) {
                continue;
            }
            if (parentSchemaType.$isSingleNested) {
                // Single nested is easy
                update[parentPath + '.' + updatedAt] = now;
            } else if (parentSchemaType.$isMongooseDocumentArray) {
                let childPath = key.substring(parentPath.length + 1);
                if (/^\d+$/.test(childPath)) {
                    update[parentPath + '.' + childPath][updatedAt] = now;
                    continue;
                }
                const firstDot = childPath.indexOf('.');
                childPath = firstDot !== -1 ? childPath.substring(0, firstDot) : childPath;
                update[parentPath + '.' + childPath + '.' + updatedAt] = now;
            }
        }
    } else if (path.schema != null && path.schema != schema && update[key]) {
        const timestamps = path.schema.options.timestamps;
        const createdAt = handleTimestampOption(timestamps, 'createdAt');
        const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
        if (!timestamps) {
            return;
        }
        if (updatedAt != null) {
            update[key][updatedAt] = now;
        }
        if (createdAt != null) {
            update[key][createdAt] = now;
        }
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToUpdate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
module.exports = applyTimestampsToUpdate;
/*!
 * ignore
 */ function applyTimestampsToUpdate(now, createdAt, updatedAt, currentUpdate, options, isReplace) {
    const updates = currentUpdate;
    let _updates = updates;
    const timestamps = get(options, 'timestamps', true);
    // Support skipping timestamps at the query level, see gh-6980
    if (!timestamps || updates == null) {
        return currentUpdate;
    }
    const skipCreatedAt = timestamps != null && timestamps.createdAt === false;
    const skipUpdatedAt = timestamps != null && timestamps.updatedAt === false;
    if (isReplace) {
        if (currentUpdate && currentUpdate.$set) {
            currentUpdate = currentUpdate.$set;
            updates.$set = {};
            _updates = updates.$set;
        }
        if (!skipUpdatedAt && updatedAt && !currentUpdate[updatedAt]) {
            _updates[updatedAt] = now;
        }
        if (!skipCreatedAt && createdAt && !currentUpdate[createdAt]) {
            _updates[createdAt] = now;
        }
        return updates;
    }
    currentUpdate = currentUpdate || {};
    if (Array.isArray(updates)) {
        // Update with aggregation pipeline
        if (updatedAt == null) {
            return updates;
        }
        updates.push({
            $set: {
                [updatedAt]: now
            }
        });
        return updates;
    }
    updates.$set = updates.$set || {};
    if (!skipUpdatedAt && updatedAt && (!currentUpdate.$currentDate || !currentUpdate.$currentDate[updatedAt])) {
        let timestampSet = false;
        if (updatedAt.indexOf('.') !== -1) {
            const pieces = updatedAt.split('.');
            for(let i = 1; i < pieces.length; ++i){
                const remnant = pieces.slice(-i).join('.');
                const start = pieces.slice(0, -i).join('.');
                if (currentUpdate[start] != null) {
                    currentUpdate[start][remnant] = now;
                    timestampSet = true;
                    break;
                } else if (currentUpdate.$set && currentUpdate.$set[start]) {
                    currentUpdate.$set[start][remnant] = now;
                    timestampSet = true;
                    break;
                }
            }
        }
        if (!timestampSet) {
            updates.$set[updatedAt] = now;
        }
        if (updates.hasOwnProperty(updatedAt)) {
            delete updates[updatedAt];
        }
    }
    if (!skipCreatedAt && createdAt) {
        if (currentUpdate[createdAt]) {
            delete currentUpdate[createdAt];
        }
        if (currentUpdate.$set && currentUpdate.$set[createdAt]) {
            delete currentUpdate.$set[createdAt];
        }
        let timestampSet = false;
        if (createdAt.indexOf('.') !== -1) {
            const pieces = createdAt.split('.');
            for(let i = 1; i < pieces.length; ++i){
                const remnant = pieces.slice(-i).join('.');
                const start = pieces.slice(0, -i).join('.');
                if (currentUpdate[start] != null) {
                    currentUpdate[start][remnant] = now;
                    timestampSet = true;
                    break;
                } else if (currentUpdate.$set && currentUpdate.$set[start]) {
                    currentUpdate.$set[start][remnant] = now;
                    timestampSet = true;
                    break;
                }
            }
        }
        if (!timestampSet) {
            updates.$setOnInsert = updates.$setOnInsert || {};
            updates.$setOnInsert[createdAt] = now;
        }
    }
    if (Object.keys(updates.$set).length === 0) {
        delete updates.$set;
    }
    return updates;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/timestamps/setDocumentTimestamps.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function setDocumentTimestamps(doc, timestampOption, currentTime, createdAt, updatedAt) {
    const skipUpdatedAt = timestampOption != null && timestampOption.updatedAt === false;
    const skipCreatedAt = timestampOption != null && timestampOption.createdAt === false;
    const defaultTimestamp = currentTime != null ? currentTime() : doc.ownerDocument().constructor.base.now();
    if (!skipCreatedAt && (doc.isNew || doc.$isSubdocument) && createdAt && !doc.$__getValue(createdAt) && doc.$__isSelected(createdAt)) {
        doc.$set(createdAt, defaultTimestamp, undefined, {
            overwriteImmutable: true
        });
    }
    if (!skipUpdatedAt && updatedAt && (doc.isNew || doc.$isModified())) {
        let ts = defaultTimestamp;
        if (doc.isNew && createdAt != null) {
            ts = doc.$__getValue(createdAt);
        }
        doc.$set(updatedAt, ts);
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/timestamps/setupTimestamps.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const applyTimestampsToChildren = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToChildren.js [app-route] (ecmascript)");
const applyTimestampsToUpdate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToUpdate.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const handleTimestampOption = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/handleTimestampOption.js [app-route] (ecmascript)");
const setDocumentTimestamps = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/timestamps/setDocumentTimestamps.js [app-route] (ecmascript)");
const symbols = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)");
const replaceOps = new Set([
    'replaceOne',
    'findOneAndReplace'
]);
module.exports = function setupTimestamps(schema, timestamps) {
    const childHasTimestamp = schema.childSchemas.find(withTimestamp);
    function withTimestamp(s) {
        const ts = s.schema.options.timestamps;
        return !!ts;
    }
    if (!timestamps && !childHasTimestamp) {
        return;
    }
    const createdAt = handleTimestampOption(timestamps, 'createdAt');
    const updatedAt = handleTimestampOption(timestamps, 'updatedAt');
    const currentTime = timestamps != null && timestamps.hasOwnProperty('currentTime') ? timestamps.currentTime : null;
    const schemaAdditions = {};
    schema.$timestamps = {
        createdAt: createdAt,
        updatedAt: updatedAt
    };
    if (createdAt && !schema.paths[createdAt]) {
        const baseImmutableCreatedAt = schema.base != null ? schema.base.get('timestamps.createdAt.immutable') : null;
        const immutable = baseImmutableCreatedAt != null ? baseImmutableCreatedAt : true;
        schemaAdditions[createdAt] = {
            [schema.options.typeKey || 'type']: Date,
            immutable
        };
    }
    if (updatedAt && !schema.paths[updatedAt]) {
        schemaAdditions[updatedAt] = Date;
    }
    schema.add(schemaAdditions);
    schema.pre('save', function timestampsPreSave(next) {
        const timestampOption = get(this, '$__.saveOptions.timestamps');
        if (timestampOption === false) {
            return next();
        }
        setDocumentTimestamps(this, timestampOption, currentTime, createdAt, updatedAt);
        next();
    });
    schema.methods.initializeTimestamps = function() {
        const ts = currentTime != null ? currentTime() : this.constructor.base.now();
        if (createdAt && !this.get(createdAt)) {
            this.$set(createdAt, ts);
        }
        if (updatedAt && !this.get(updatedAt)) {
            this.$set(updatedAt, ts);
        }
        if (this.$isSubdocument) {
            return this;
        }
        const subdocs = this.$getAllSubdocs();
        for (const subdoc of subdocs){
            if (subdoc.initializeTimestamps) {
                subdoc.initializeTimestamps();
            }
        }
        return this;
    };
    _setTimestampsOnUpdate[symbols.builtInMiddleware] = true;
    const opts = {
        query: true,
        model: false
    };
    schema.pre('findOneAndReplace', opts, _setTimestampsOnUpdate);
    schema.pre('findOneAndUpdate', opts, _setTimestampsOnUpdate);
    schema.pre('replaceOne', opts, _setTimestampsOnUpdate);
    schema.pre('update', opts, _setTimestampsOnUpdate);
    schema.pre('updateOne', opts, _setTimestampsOnUpdate);
    schema.pre('updateMany', opts, _setTimestampsOnUpdate);
    function _setTimestampsOnUpdate(next) {
        const now = currentTime != null ? currentTime() : this.model.base.now();
        // Replacing with null update should still trigger timestamps
        if (replaceOps.has(this.op) && this.getUpdate() == null) {
            this.setUpdate({});
        }
        applyTimestampsToUpdate(now, createdAt, updatedAt, this.getUpdate(), this._mongooseOptions, replaceOps.has(this.op));
        applyTimestampsToChildren(now, this.getUpdate(), this.model.schema);
        next();
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/validateRef.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
module.exports = validateRef;
function validateRef(ref, path) {
    if (typeof ref === 'string') {
        return;
    }
    if (typeof ref === 'function') {
        return;
    }
    throw new MongooseError('Invalid ref at path "' + path + '". Got ' + util.inspect(ref, {
        depth: 0
    }));
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/applyHooks.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const symbols = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)");
const promiseOrCallback = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = applyHooks;
/*!
 * ignore
 */ applyHooks.middlewareFunctions = [
    'deleteOne',
    'save',
    'validate',
    'remove',
    'updateOne',
    'init'
];
/*!
 * ignore
 */ const alreadyHookedFunctions = new Set(applyHooks.middlewareFunctions.flatMap((fn)=>[
        fn,
        `$__${fn}`
    ]));
/**
 * Register hooks for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @param {Object} options
 * @api private
 */ function applyHooks(model, schema, options) {
    options = options || {};
    const kareemOptions = {
        useErrorHandlers: true,
        numCallbackParams: 1,
        nullResultByDefault: true,
        contextParameter: true
    };
    const objToDecorate = options.decorateDoc ? model : model.prototype;
    model.$appliedHooks = true;
    for (const key of Object.keys(schema.paths)){
        const type = schema.paths[key];
        let childModel = null;
        if (type.$isSingleNested) {
            childModel = type.caster;
        } else if (type.$isMongooseDocumentArray) {
            childModel = type.Constructor;
        } else {
            continue;
        }
        if (childModel.$appliedHooks) {
            continue;
        }
        applyHooks(childModel, type.schema, {
            ...options,
            isChildSchema: true
        });
        if (childModel.discriminators != null) {
            const keys = Object.keys(childModel.discriminators);
            for (const key of keys){
                applyHooks(childModel.discriminators[key], childModel.discriminators[key].schema, options);
            }
        }
    }
    // Built-in hooks rely on hooking internal functions in order to support
    // promises and make it so that `doc.save.toString()` provides meaningful
    // information.
    const middleware = schema.s.hooks.filter((hook)=>{
        if (hook.name === 'updateOne' || hook.name === 'deleteOne') {
            return !!hook['document'];
        }
        if (hook.name === 'remove' || hook.name === 'init') {
            return hook['document'] == null || !!hook['document'];
        }
        if (hook.query != null || hook.document != null) {
            return hook.document !== false;
        }
        return true;
    }).filter((hook)=>{
        // If user has overwritten the method, don't apply built-in middleware
        if (schema.methods[hook.name]) {
            return !hook.fn[symbols.builtInMiddleware];
        }
        return true;
    });
    model._middleware = middleware;
    objToDecorate.$__originalValidate = objToDecorate.$__originalValidate || objToDecorate.$__validate;
    const internalMethodsToWrap = options && options.isChildSchema ? [
        'save',
        'validate',
        'deleteOne'
    ] : [
        'save',
        'validate'
    ];
    for (const method of internalMethodsToWrap){
        const toWrap = method === 'validate' ? '$__originalValidate' : `$__${method}`;
        const wrapped = middleware.createWrapper(method, objToDecorate[toWrap], null, kareemOptions);
        objToDecorate[`$__${method}`] = wrapped;
    }
    objToDecorate.$__init = middleware.createWrapperSync('init', objToDecorate.$__init, null, kareemOptions);
    // Support hooks for custom methods
    const customMethods = Object.keys(schema.methods);
    const customMethodOptions = Object.assign({}, kareemOptions, {
        // Only use `checkForPromise` for custom methods, because mongoose
        // query thunks are not as consistent as I would like about returning
        // a nullish value rather than the query. If a query thunk returns
        // a query, `checkForPromise` causes infinite recursion
        checkForPromise: true
    });
    for (const method of customMethods){
        if (alreadyHookedFunctions.has(method)) {
            continue;
        }
        if (!middleware.hasHooks(method)) {
            continue;
        }
        const originalMethod = objToDecorate[method];
        objToDecorate[method] = function() {
            const args = Array.prototype.slice.call(arguments);
            const cb = args.slice(-1).pop();
            const argsWithoutCallback = typeof cb === 'function' ? args.slice(0, args.length - 1) : args;
            return promiseOrCallback(cb, (callback)=>{
                return this[`$__${method}`].apply(this, argsWithoutCallback.concat([
                    callback
                ]));
            }, model.events);
        };
        objToDecorate[`$__${method}`] = middleware.createWrapper(method, originalMethod, null, customMethodOptions);
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/applyPlugins.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function applyPlugins(schema, plugins, options, cacheKey) {
    if (schema[cacheKey]) {
        return;
    }
    schema[cacheKey] = true;
    if (!options || !options.skipTopLevel) {
        let pluginTags = null;
        for (const plugin of plugins){
            const tags = plugin[1] == null ? null : plugin[1].tags;
            if (!Array.isArray(tags)) {
                schema.plugin(plugin[0], plugin[1]);
                continue;
            }
            pluginTags = pluginTags || new Set(schema.options.pluginTags || []);
            if (!tags.find((tag)=>pluginTags.has(tag))) {
                continue;
            }
            schema.plugin(plugin[0], plugin[1]);
        }
    }
    options = Object.assign({}, options);
    delete options.skipTopLevel;
    if (options.applyPluginsToChildSchemas !== false) {
        for (const path of Object.keys(schema.paths)){
            const type = schema.paths[path];
            if (type.schema != null) {
                applyPlugins(type.schema, plugins, options, cacheKey);
                // Recompile schema because plugins may have changed it, see gh-7572
                type.caster.prototype.$__setSchema(type.schema);
            }
        }
    }
    const discriminators = schema.discriminators;
    if (discriminators == null) {
        return;
    }
    const applyPluginsToDiscriminators = options.applyPluginsToDiscriminators;
    const keys = Object.keys(discriminators);
    for (const discriminatorKey of keys){
        const discriminatorSchema = discriminators[discriminatorKey];
        applyPlugins(discriminatorSchema, plugins, {
            skipTopLevel: !applyPluginsToDiscriminators
        }, cacheKey);
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/getDefaultBulkwriteResult.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function getDefaultBulkwriteResult() {
    return {
        ok: 1,
        nInserted: 0,
        nUpserted: 0,
        nMatched: 0,
        nModified: 0,
        nRemoved: 0,
        upserted: [],
        writeErrors: [],
        insertedIds: [],
        writeConcernErrors: []
    };
}
module.exports = getDefaultBulkwriteResult;
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/modifiedPaths.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const _modifiedPaths = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/common.js [app-route] (ecmascript)").modifiedPaths;
/**
 * Given an update document with potential update operators (`$set`, etc.)
 * returns an object whose keys are the directly modified paths.
 *
 * If there are any top-level keys that don't start with `$`, we assume those
 * will get wrapped in a `$set`. The Mongoose Query is responsible for wrapping
 * top-level keys in `$set`.
 *
 * @param {Object} update
 * @return {Object} modified
 */ module.exports = function modifiedPaths(update) {
    const keys = Object.keys(update);
    const res = {};
    const withoutDollarKeys = {};
    for (const key of keys){
        if (key.startsWith('$')) {
            _modifiedPaths(update[key], '', res);
            continue;
        }
        withoutDollarKeys[key] = update[key];
    }
    _modifiedPaths(withoutDollarKeys, '', res);
    return res;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/updatedPathsByArrayFilter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const modifiedPaths = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/modifiedPaths.js [app-route] (ecmascript)");
module.exports = function updatedPathsByArrayFilter(update) {
    if (update == null) {
        return {};
    }
    const updatedPaths = modifiedPaths(update);
    return Object.keys(updatedPaths).reduce((cur, path)=>{
        const matches = path.match(/\$\[[^\]]+\]/g);
        if (matches == null) {
            return cur;
        }
        for (const match of matches){
            const firstMatch = path.indexOf(match);
            if (firstMatch !== path.lastIndexOf(match)) {
                throw new Error(`Path '${path}' contains the same array filter multiple times`);
            }
            cur[match.substring(2, match.length - 1)] = path.substring(0, firstMatch - 1).replace(/\$\[[^\]]+\]/g, '0');
        }
        return cur;
    }, {});
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/getEmbeddedDiscriminatorPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const cleanPositionalOperators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/cleanPositionalOperators.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const updatedPathsByArrayFilter = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/updatedPathsByArrayFilter.js [app-route] (ecmascript)");
/**
 * Like `schema.path()`, except with a document, because impossible to
 * determine path type without knowing the embedded discriminator key.
 * @param {Schema} schema
 * @param {Object} [update]
 * @param {Object} [filter]
 * @param {String} path
 * @param {Object} [options]
 * @api private
 */ module.exports = function getEmbeddedDiscriminatorPath(schema, update, filter, path, options) {
    const parts = path.indexOf('.') === -1 ? [
        path
    ] : path.split('.');
    let schematype = null;
    let type = 'adhocOrUndefined';
    filter = filter || {};
    update = update || {};
    const arrayFilters = options != null && Array.isArray(options.arrayFilters) ? options.arrayFilters : [];
    const updatedPathsByFilter = updatedPathsByArrayFilter(update);
    let startIndex = 0;
    for(let i = 0; i < parts.length; ++i){
        const originalSubpath = parts.slice(startIndex, i + 1).join('.');
        const subpath = cleanPositionalOperators(originalSubpath);
        schematype = schema.path(subpath);
        if (schematype == null) {
            continue;
        }
        type = schema.pathType(subpath);
        if ((schematype.$isSingleNested || schematype.$isMongooseDocumentArrayElement) && schematype.schema.discriminators != null) {
            const key = get(schematype, 'schema.options.discriminatorKey');
            const discriminatorValuePath = subpath + '.' + key;
            const discriminatorFilterPath = discriminatorValuePath.replace(/\.\d+\./, '.');
            let discriminatorKey = null;
            if (discriminatorValuePath in filter) {
                discriminatorKey = filter[discriminatorValuePath];
            }
            if (discriminatorFilterPath in filter) {
                discriminatorKey = filter[discriminatorFilterPath];
            }
            const wrapperPath = subpath.replace(/\.\d+$/, '');
            if (schematype.$isMongooseDocumentArrayElement && get(filter[wrapperPath], '$elemMatch.' + key) != null) {
                discriminatorKey = filter[wrapperPath].$elemMatch[key];
            }
            const discriminatorKeyUpdatePath = originalSubpath + '.' + key;
            if (discriminatorKeyUpdatePath in update) {
                discriminatorKey = update[discriminatorKeyUpdatePath];
            }
            if (discriminatorValuePath in update) {
                discriminatorKey = update[discriminatorValuePath];
            }
            for (const filterKey of Object.keys(updatedPathsByFilter)){
                const schemaKey = updatedPathsByFilter[filterKey] + '.' + key;
                const arrayFilterKey = filterKey + '.' + key;
                if (schemaKey === discriminatorFilterPath) {
                    const filter = arrayFilters.find((filter)=>filter.hasOwnProperty(arrayFilterKey));
                    if (filter != null) {
                        discriminatorKey = filter[arrayFilterKey];
                    }
                }
            }
            if (discriminatorKey == null) {
                continue;
            }
            const discriminator = getDiscriminatorByValue(schematype.caster.discriminators, discriminatorKey);
            const discriminatorSchema = discriminator && discriminator.schema;
            if (discriminatorSchema == null) {
                continue;
            }
            const rest = parts.slice(i + 1).join('.');
            schematype = discriminatorSchema.path(rest);
            schema = discriminatorSchema;
            startIndex = i + 1;
            if (schematype != null) {
                type = discriminatorSchema._getPathType(rest);
                break;
            }
        }
    }
    return {
        type: type,
        schematype: schematype
    };
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/handleImmutable.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
/**
 * Handle immutable option for a given path when casting updates based on options
 *
 * @param {SchemaType} schematype the resolved schematype for this path
 * @param {Boolean | 'throw' | null} strict whether strict mode is set for this query
 * @param {Object} obj the object containing the value being checked so we can delete
 * @param {String} key the key in `obj` which we are checking for immutability
 * @param {String} fullPath the full path being checked
 * @param {Object} options the query options
 * @param {Query} ctx the query. Passed as `this` and first param to the `immutable` option, if `immutable` is a function
 * @returns true if field was removed, false otherwise
 */ module.exports = function handleImmutable(schematype, strict, obj, key, fullPath, options, ctx) {
    if (schematype == null || !schematype.options || !schematype.options.immutable) {
        return false;
    }
    let immutable = schematype.options.immutable;
    if (typeof immutable === 'function') {
        immutable = immutable.call(ctx, ctx);
    }
    if (!immutable) {
        return false;
    }
    if (options && options.overwriteImmutable) {
        return false;
    }
    if (strict === false) {
        return false;
    }
    if (strict === 'throw') {
        throw new StrictModeError(null, `Field ${fullPath} is immutable and strict = 'throw'`);
    }
    delete obj[key];
    return true;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/moveImmutableProperties.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
/**
 * Given an update, move all $set on immutable properties to $setOnInsert.
 * This should only be called for upserts, because $setOnInsert bypasses the
 * strictness check for immutable properties.
 */ module.exports = function moveImmutableProperties(schema, update, ctx) {
    if (update == null) {
        return;
    }
    const keys = Object.keys(update);
    for (const key of keys){
        const isDollarKey = key.startsWith('$');
        if (key === '$set') {
            const updatedPaths = Object.keys(update[key]);
            for (const path of updatedPaths){
                _walkUpdatePath(schema, update[key], path, update, ctx);
            }
        } else if (!isDollarKey) {
            _walkUpdatePath(schema, update, key, update, ctx);
        }
    }
};
function _walkUpdatePath(schema, op, path, update, ctx) {
    const schematype = schema.path(path);
    if (schematype == null) {
        return;
    }
    let immutable = get(schematype, 'options.immutable', null);
    if (immutable == null) {
        return;
    }
    if (typeof immutable === 'function') {
        immutable = immutable.call(ctx, ctx);
    }
    if (!immutable) {
        return;
    }
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert[path] = op[path];
    delete op[path];
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/path/setDottedPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const specialProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/specialProperties.js [app-route] (ecmascript)");
module.exports = function setDottedPath(obj, path, val) {
    if (path.indexOf('.') === -1) {
        if (specialProperties.has(path)) {
            return;
        }
        obj[path] = val;
        return;
    }
    const parts = path.split('.');
    const last = parts.pop();
    let cur = obj;
    for (const part of parts){
        if (specialProperties.has(part)) {
            continue;
        }
        if (cur[part] == null) {
            cur[part] = {};
        }
        cur = cur[part];
    }
    if (!specialProperties.has(last)) {
        cur[last] = val;
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/castUpdate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const SchemaString = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/string.js [app-route] (ecmascript)");
const StrictModeError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strict.js [app-route] (ecmascript)");
const ValidationError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/validation.js [app-route] (ecmascript)");
const castNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/number.js [app-route] (ecmascript)");
const cast = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const getEmbeddedDiscriminatorPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/getEmbeddedDiscriminatorPath.js [app-route] (ecmascript)");
const handleImmutable = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/handleImmutable.js [app-route] (ecmascript)");
const moveImmutableProperties = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/moveImmutableProperties.js [app-route] (ecmascript)");
const schemaMixedSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)").schemaMixedSymbol;
const setDottedPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/path/setDottedPath.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const { internalToObjectOptions } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)");
const mongodbUpdateOperators = new Set([
    '$currentDate',
    '$inc',
    '$min',
    '$max',
    '$mul',
    '$rename',
    '$set',
    '$setOnInsert',
    '$unset',
    '$addToSet',
    '$pop',
    '$pull',
    '$push',
    '$pullAll',
    '$bit'
]);
/**
 * Casts an update op based on the given schema
 *
 * @param {Schema} schema
 * @param {Object} obj
 * @param {Object} [options]
 * @param {Boolean|String} [options.strict] defaults to true
 * @param {Query} context passed to setters
 * @return {Boolean} true iff the update is non-empty
 * @api private
 */ module.exports = function castUpdate(schema, obj, options, context, filter) {
    if (obj == null) {
        return undefined;
    }
    options = options || {};
    // Update pipeline
    if (Array.isArray(obj)) {
        const len = obj.length;
        for(let i = 0; i < len; ++i){
            const ops = Object.keys(obj[i]);
            for (const op of ops){
                obj[i][op] = castPipelineOperator(op, obj[i][op]);
            }
        }
        return obj;
    }
    if (schema != null && filter != null && utils.hasUserDefinedProperty(filter, schema.options.discriminatorKey) && typeof filter[schema.options.discriminatorKey] !== 'object' && schema.discriminators != null) {
        const discriminatorValue = filter[schema.options.discriminatorKey];
        const byValue = getDiscriminatorByValue(context.model.discriminators, discriminatorValue);
        schema = schema.discriminators[discriminatorValue] || byValue && byValue.schema || schema;
    } else if (schema != null && options.overwriteDiscriminatorKey && utils.hasUserDefinedProperty(obj, schema.options.discriminatorKey) && schema.discriminators != null) {
        const discriminatorValue = obj[schema.options.discriminatorKey];
        const byValue = getDiscriminatorByValue(context.model.discriminators, discriminatorValue);
        schema = schema.discriminators[discriminatorValue] || byValue && byValue.schema || schema;
    } else if (schema != null && options.overwriteDiscriminatorKey && obj.$set != null && utils.hasUserDefinedProperty(obj.$set, schema.options.discriminatorKey) && schema.discriminators != null) {
        const discriminatorValue = obj.$set[schema.options.discriminatorKey];
        const byValue = getDiscriminatorByValue(context.model.discriminators, discriminatorValue);
        schema = schema.discriminators[discriminatorValue] || byValue && byValue.schema || schema;
    }
    if (options.upsert) {
        moveImmutableProperties(schema, obj, context);
    }
    const ops = Object.keys(obj);
    let i = ops.length;
    const ret = {};
    let val;
    let hasDollarKey = false;
    filter = filter || {};
    while(i--){
        const op = ops[i];
        if (!mongodbUpdateOperators.has(op)) {
            // fix up $set sugar
            if (!ret.$set) {
                if (obj.$set) {
                    ret.$set = obj.$set;
                } else {
                    ret.$set = {};
                }
            }
            ret.$set[op] = obj[op];
            ops.splice(i, 1);
            if (!~ops.indexOf('$set')) ops.push('$set');
        } else if (op === '$set') {
            if (!ret.$set) {
                ret[op] = obj[op];
            }
        } else {
            ret[op] = obj[op];
        }
    }
    // cast each value
    i = ops.length;
    while(i--){
        const op = ops[i];
        val = ret[op];
        hasDollarKey = hasDollarKey || op.startsWith('$');
        if (val != null && val.$__) {
            val = val.toObject(internalToObjectOptions);
            ret[op] = val;
        }
        if (val && typeof val === 'object' && !Buffer.isBuffer(val) && mongodbUpdateOperators.has(op)) {
            walkUpdatePath(schema, val, op, options, context, filter);
        } else {
            const msg = 'Invalid atomic update value for ' + op + '. ' + 'Expected an object, received ' + typeof val;
            throw new Error(msg);
        }
        if (op.startsWith('$') && utils.isEmptyObject(val)) {
            delete ret[op];
        }
    }
    if (Object.keys(ret).length === 0 && options.upsert && Object.keys(filter).length > 0) {
        // Trick the driver into allowing empty upserts to work around
        // https://github.com/mongodb/node-mongodb-native/pull/2490
        // Shallow clone to avoid passing defaults in re: gh-13962
        return {
            $setOnInsert: {
                ...filter
            }
        };
    }
    return ret;
};
/*!
 * ignore
 */ function castPipelineOperator(op, val) {
    if (op === '$unset') {
        if (typeof val !== 'string' && (!Array.isArray(val) || val.find((v)=>typeof v !== 'string'))) {
            throw new MongooseError('Invalid $unset in pipeline, must be ' + ' a string or an array of strings');
        }
        return val;
    }
    if (op === '$project') {
        if (val == null || typeof val !== 'object') {
            throw new MongooseError('Invalid $project in pipeline, must be an object');
        }
        return val;
    }
    if (op === '$addFields' || op === '$set') {
        if (val == null || typeof val !== 'object') {
            throw new MongooseError('Invalid ' + op + ' in pipeline, must be an object');
        }
        return val;
    } else if (op === '$replaceRoot' || op === '$replaceWith') {
        if (val == null || typeof val !== 'object') {
            throw new MongooseError('Invalid ' + op + ' in pipeline, must be an object');
        }
        return val;
    }
    throw new MongooseError('Invalid update pipeline operator: "' + op + '"');
}
/**
 * Walk each path of obj and cast its values
 * according to its schema.
 *
 * @param {Schema} schema
 * @param {Object} obj part of a query
 * @param {String} op the atomic operator ($pull, $set, etc)
 * @param {Object} [options]
 * @param {Boolean|String} [options.strict]
 * @param {Query} context
 * @param {Object} filter
 * @param {String} pref path prefix (internal only)
 * @return {Bool} true if this path has keys to update
 * @api private
 */ function walkUpdatePath(schema, obj, op, options, context, filter, prefix) {
    const strict = options.strict;
    prefix = prefix ? prefix + '.' : '';
    const keys = Object.keys(obj);
    let i = keys.length;
    let hasKeys = false;
    let schematype;
    let key;
    let val;
    let aggregatedError = null;
    const strictMode = strict != null ? strict : schema.options.strict;
    while(i--){
        key = keys[i];
        val = obj[key];
        // `$pull` is special because we need to cast the RHS as a query, not as
        // an update.
        if (op === '$pull') {
            schematype = schema._getSchema(prefix + key);
            if (schematype == null) {
                const _res = getEmbeddedDiscriminatorPath(schema, obj, filter, prefix + key, options);
                if (_res.schematype != null) {
                    schematype = _res.schematype;
                }
            }
            if (schematype != null && schematype.schema != null) {
                obj[key] = cast(schematype.schema, obj[key], options, context);
                hasKeys = true;
                continue;
            }
        }
        const discriminatorKey = prefix ? prefix + key : key;
        if (schema.discriminatorMapping != null && discriminatorKey === schema.options.discriminatorKey && schema.discriminatorMapping.value !== obj[key] && !options.overwriteDiscriminatorKey) {
            if (strictMode === 'throw') {
                const err = new Error('Can\'t modify discriminator key "' + discriminatorKey + '" on discriminator model');
                aggregatedError = _appendError(err, context, discriminatorKey, aggregatedError);
                continue;
            } else if (strictMode) {
                delete obj[key];
                continue;
            }
        }
        if (getConstructorName(val) === 'Object') {
            // watch for embedded doc schemas
            schematype = schema._getSchema(prefix + key);
            if (schematype == null) {
                const _res = getEmbeddedDiscriminatorPath(schema, obj, filter, prefix + key, options);
                if (_res.schematype != null) {
                    schematype = _res.schematype;
                }
            }
            if (op !== '$setOnInsert' && handleImmutable(schematype, strict, obj, key, prefix + key, options, context)) {
                continue;
            }
            if (schematype && schematype.caster && op in castOps) {
                // embedded doc schema
                if ('$each' in val) {
                    hasKeys = true;
                    try {
                        obj[key] = {
                            $each: castUpdateVal(schematype, val.$each, op, key, context, prefix + key)
                        };
                    } catch (error) {
                        aggregatedError = _appendError(error, context, key, aggregatedError);
                    }
                    if (val.$slice != null) {
                        obj[key].$slice = val.$slice | 0;
                    }
                    if (val.$sort) {
                        obj[key].$sort = val.$sort;
                    }
                    if (val.$position != null) {
                        obj[key].$position = castNumber(val.$position);
                    }
                } else {
                    if (schematype != null && schematype.$isSingleNested) {
                        const _strict = strict == null ? schematype.schema.options.strict : strict;
                        try {
                            obj[key] = schematype.castForQuery(null, val, context, {
                                strict: _strict
                            });
                        } catch (error) {
                            aggregatedError = _appendError(error, context, key, aggregatedError);
                        }
                    } else {
                        try {
                            obj[key] = castUpdateVal(schematype, val, op, key, context, prefix + key);
                        } catch (error) {
                            aggregatedError = _appendError(error, context, key, aggregatedError);
                        }
                    }
                    if (obj[key] === void 0) {
                        delete obj[key];
                        continue;
                    }
                    hasKeys = true;
                }
            } else if (op === '$currentDate' || op in castOps && schematype) {
                // $currentDate can take an object
                try {
                    obj[key] = castUpdateVal(schematype, val, op, key, context, prefix + key);
                } catch (error) {
                    aggregatedError = _appendError(error, context, key, aggregatedError);
                }
                if (obj[key] === void 0) {
                    delete obj[key];
                    continue;
                }
                hasKeys = true;
            } else if (op === '$rename') {
                const schematype = new SchemaString(`${prefix}${key}.$rename`);
                try {
                    obj[key] = castUpdateVal(schematype, val, op, key, context, prefix + key);
                } catch (error) {
                    aggregatedError = _appendError(error, context, key, aggregatedError);
                }
                if (obj[key] === void 0) {
                    delete obj[key];
                    continue;
                }
                hasKeys = true;
            } else {
                const pathToCheck = prefix + key;
                const v = schema._getPathType(pathToCheck);
                let _strict = strict;
                if (v && v.schema && _strict == null) {
                    _strict = v.schema.options.strict;
                }
                if (v.pathType === 'undefined') {
                    if (_strict === 'throw') {
                        throw new StrictModeError(pathToCheck);
                    } else if (_strict) {
                        delete obj[key];
                        continue;
                    }
                }
                // gh-2314
                // we should be able to set a schema-less field
                // to an empty object literal
                hasKeys |= walkUpdatePath(schema, val, op, options, context, filter, prefix + key) || utils.isObject(val) && Object.keys(val).length === 0;
            }
        } else {
            const isModifier = key === '$each' || key === '$or' || key === '$and' || key === '$in';
            if (isModifier && !prefix) {
                throw new MongooseError('Invalid update: Unexpected modifier "' + key + '" as a key in operator. ' + 'Did you mean something like { $addToSet: { fieldName: { $each: [...] } } }? ' + 'Modifiers such as "$each", "$or", "$and", "$in" must appear under a valid field path.');
            }
            const checkPath = isModifier ? prefix : prefix + key;
            schematype = schema._getSchema(checkPath);
            // You can use `$setOnInsert` with immutable keys
            if (op !== '$setOnInsert' && handleImmutable(schematype, strict, obj, key, prefix + key, options, context)) {
                continue;
            }
            let pathDetails = schema._getPathType(checkPath);
            // If no schema type, check for embedded discriminators because the
            // filter or update may imply an embedded discriminator type. See #8378
            if (schematype == null) {
                const _res = getEmbeddedDiscriminatorPath(schema, obj, filter, checkPath, options);
                if (_res.schematype != null) {
                    schematype = _res.schematype;
                    pathDetails = _res.type;
                }
            }
            let isStrict = strict;
            if (pathDetails && pathDetails.schema && strict == null) {
                isStrict = pathDetails.schema.options.strict;
            }
            const skip = isStrict && !schematype && !/real|nested/.test(pathDetails.pathType);
            if (skip) {
                // Even if strict is `throw`, avoid throwing an error because of
                // virtuals because of #6731
                if (isStrict === 'throw' && schema.virtuals[checkPath] == null) {
                    throw new StrictModeError(prefix + key);
                } else {
                    delete obj[key];
                }
            } else {
                if (op === '$rename') {
                    if (obj[key] == null) {
                        throw new CastError('String', obj[key], `${prefix}${key}.$rename`);
                    }
                    const schematype = new SchemaString(`${prefix}${key}.$rename`, null, null, schema);
                    obj[key] = schematype.castForQuery(null, obj[key], context);
                    continue;
                }
                try {
                    if (prefix.length === 0 || key.indexOf('.') === -1) {
                        obj[key] = castUpdateVal(schematype, val, op, key, context, prefix + key);
                    } else if (isStrict !== false || schematype != null) {
                        // Setting a nested dotted path that's in the schema. We don't allow paths with '.' in
                        // a schema, so replace the dotted path with a nested object to avoid ending up with
                        // dotted properties in the updated object. See (gh-10200)
                        setDottedPath(obj, key, castUpdateVal(schematype, val, op, key, context, prefix + key));
                        delete obj[key];
                    }
                } catch (error) {
                    aggregatedError = _appendError(error, context, key, aggregatedError);
                }
                if (Array.isArray(obj[key]) && (op === '$addToSet' || op === '$push') && key !== '$each') {
                    if (schematype && schematype.caster && !schematype.caster.$isMongooseArray && !schematype.caster[schemaMixedSymbol]) {
                        obj[key] = {
                            $each: obj[key]
                        };
                    }
                }
                if (obj[key] === void 0) {
                    delete obj[key];
                    continue;
                }
                hasKeys = true;
            }
        }
    }
    if (aggregatedError != null) {
        throw aggregatedError;
    }
    return hasKeys;
}
/*!
 * ignore
 */ function _appendError(error, query, key, aggregatedError) {
    if (typeof query !== 'object' || !query.options.multipleCastError) {
        throw error;
    }
    aggregatedError = aggregatedError || new ValidationError();
    aggregatedError.addError(key, error);
    return aggregatedError;
}
/**
 * These operators should be cast to numbers instead
 * of their path schema type.
 * @api private
 */ const numberOps = {
    $pop: 1,
    $inc: 1
};
/**
 * These ops require no casting because the RHS doesn't do anything.
 * @api private
 */ const noCastOps = {
    $unset: 1
};
/**
 * These operators require casting docs
 * to real Documents for Update operations.
 * @api private
 */ const castOps = {
    $push: 1,
    $addToSet: 1,
    $set: 1,
    $setOnInsert: 1
};
/*!
 * ignore
 */ const overwriteOps = {
    $set: 1,
    $setOnInsert: 1
};
/**
 * Casts `val` according to `schema` and atomic `op`.
 *
 * @param {SchemaType} schema
 * @param {Object} val
 * @param {String} op the atomic operator ($pull, $set, etc)
 * @param {String} $conditional
 * @param {Query} context
 * @param {String} path
 * @api private
 */ function castUpdateVal(schema, val, op, $conditional, context, path) {
    if (!schema) {
        // non-existing schema path
        if (op in numberOps) {
            try {
                return castNumber(val);
            } catch (err) {
                throw new CastError('number', val, path);
            }
        }
        return val;
    }
    // console.log('CastUpdateVal', path, op, val, schema);
    const cond = schema.caster && op in castOps && (utils.isObject(val) || Array.isArray(val));
    if (cond && !overwriteOps[op]) {
        // Cast values for ops that add data to MongoDB.
        // Ensures embedded documents get ObjectIds etc.
        let schemaArrayDepth = 0;
        let cur = schema;
        while(cur.$isMongooseArray){
            ++schemaArrayDepth;
            cur = cur.caster;
        }
        let arrayDepth = 0;
        let _val = val;
        while(Array.isArray(_val)){
            ++arrayDepth;
            _val = _val[0];
        }
        const additionalNesting = schemaArrayDepth - arrayDepth;
        while(arrayDepth < schemaArrayDepth){
            val = [
                val
            ];
            ++arrayDepth;
        }
        let tmp = schema.applySetters(Array.isArray(val) ? val : [
            val
        ], context);
        for(let i = 0; i < additionalNesting; ++i){
            tmp = tmp[0];
        }
        return tmp;
    }
    if (op in noCastOps) {
        return val;
    }
    if (op in numberOps) {
        // Null and undefined not allowed for $pop, $inc
        if (val == null) {
            throw new CastError('number', val, schema.path);
        }
        if (op === '$inc') {
            // Support `$inc` with long, int32, etc. (gh-4283)
            return schema.castForQuery(null, val, context);
        }
        try {
            return castNumber(val);
        } catch (error) {
            throw new CastError('number', val, schema.path);
        }
    }
    if (op === '$currentDate') {
        if (typeof val === 'object') {
            return {
                $type: val.$type
            };
        }
        return Boolean(val);
    }
    if (mongodbUpdateOperators.has($conditional)) {
        return schema.castForQuery($conditional, val, context);
    }
    if (overwriteOps[op]) {
        const skipQueryCastForUpdate = val != null && schema.$isMongooseArray && schema.$fullPath != null && !schema.$fullPath.match(/\d+$/);
        const applySetters = schema[schemaMixedSymbol] != null;
        if (skipQueryCastForUpdate || applySetters) {
            return schema.applySetters(val, context);
        }
        return schema.castForQuery(null, val, context);
    }
    return schema.castForQuery(null, val, context);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/decorateUpdateWithVersionKey.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Decorate the update with a version key, if necessary
 * @api private
 */ module.exports = function decorateUpdateWithVersionKey(update, options, versionKey) {
    if (!versionKey || !(options && options.upsert || false)) {
        return;
    }
    if (options.overwrite) {
        if (!hasKey(update, versionKey)) {
            update[versionKey] = 0;
        }
    } else if (!hasKey(update, versionKey) && !hasKey(update?.$set, versionKey) && !hasKey(update?.$inc, versionKey) && !hasKey(update?.$setOnInsert, versionKey)) {
        if (!update.$setOnInsert) {
            update.$setOnInsert = {};
        }
        update.$setOnInsert[versionKey] = 0;
    }
};
function hasKey(obj, key) {
    if (obj == null || typeof obj !== 'object') {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(obj, key);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/setDefaultsOnInsert.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
/**
 * Applies defaults to update and findOneAndUpdate operations.
 *
 * @param {Object} filter
 * @param {Schema} schema
 * @param {Object} castedDoc
 * @param {Object} options
 * @method setDefaultsOnInsert
 * @api private
 */ module.exports = function(filter, schema, castedDoc, options) {
    options = options || {};
    const shouldSetDefaultsOnInsert = options.setDefaultsOnInsert != null ? options.setDefaultsOnInsert : schema.base.options.setDefaultsOnInsert;
    if (!options.upsert || shouldSetDefaultsOnInsert === false) {
        return castedDoc;
    }
    const keys = Object.keys(castedDoc || {});
    const updatedKeys = {};
    const updatedValues = {};
    const numKeys = keys.length;
    let hasDollarUpdate = false;
    for(let i = 0; i < numKeys; ++i){
        if (keys[i].charAt(0) === '$') {
            hasDollarUpdate = true;
            break;
        }
    }
    const paths = Object.keys(filter);
    const numPaths = paths.length;
    for(let i = 0; i < numPaths; ++i){
        const path = paths[i];
        const condition = filter[path];
        if (condition && typeof condition === 'object') {
            const conditionKeys = Object.keys(condition);
            const numConditionKeys = conditionKeys.length;
            let hasDollarKey = false;
            for(let j = 0; j < numConditionKeys; ++j){
                if (conditionKeys[j].charAt(0) === '$') {
                    hasDollarKey = true;
                    break;
                }
            }
            if (hasDollarKey) {
                continue;
            }
        }
        updatedKeys[path] = true;
    }
    if (options && options.overwrite && !hasDollarUpdate) {
        // Defaults will be set later, since we're overwriting we'll cast
        // the whole update to a document
        return castedDoc;
    }
    schema.eachPath(function(path, schemaType) {
        // Skip single nested paths if underneath a map
        if (schemaType.path === '_id' && schemaType.options.auto) {
            return;
        }
        const def = schemaType.getDefault(null, true);
        if (typeof def === 'undefined') {
            return;
        }
        const pathPieces = schemaType.splitPath();
        if (pathPieces.includes('$*')) {
            // Skip defaults underneath maps. We should never do `$setOnInsert` on a path with `$*`
            return;
        }
        if (isModified(castedDoc, updatedKeys, path, pathPieces, hasDollarUpdate)) {
            return;
        }
        castedDoc = castedDoc || {};
        castedDoc.$setOnInsert = castedDoc.$setOnInsert || {};
        if (get(castedDoc, path) == null) {
            castedDoc.$setOnInsert[path] = def;
        }
        updatedValues[path] = def;
    });
    return castedDoc;
};
function isModified(castedDoc, updatedKeys, path, pathPieces, hasDollarUpdate) {
    // Check if path is in filter (updatedKeys)
    if (updatedKeys[path]) {
        return true;
    }
    // Check if any parent path is in filter
    let cur = pathPieces[0];
    for(let i = 1; i < pathPieces.length; ++i){
        if (updatedKeys[cur]) {
            return true;
        }
        cur += '.' + pathPieces[i];
    }
    // Check if path is modified in the update
    if (hasDollarUpdate) {
        // Check each update operator
        for(const key in castedDoc){
            if (key.charAt(0) === '$') {
                if (pathExistsInUpdate(castedDoc[key], path, pathPieces)) {
                    return true;
                }
            }
        }
    } else {
        // No dollar operators, check the castedDoc directly
        if (pathExistsInUpdate(castedDoc, path, pathPieces)) {
            return true;
        }
    }
    return false;
}
function pathExistsInUpdate(update, targetPath, pathPieces) {
    if (update == null || typeof update !== 'object') {
        return false;
    }
    // Check exact match
    if (update.hasOwnProperty(targetPath)) {
        return true;
    }
    // Check if any parent path exists
    let cur = pathPieces[0];
    for(let i = 1; i < pathPieces.length; ++i){
        if (update.hasOwnProperty(cur)) {
            return true;
        }
        cur += '.' + pathPieces[i];
    }
    // Check if any child path exists (e.g., path is "a" and update has "a.b")
    const prefix = targetPath + '.';
    for(const key in update){
        if (key.startsWith(prefix)) {
            return true;
        }
    }
    return false;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/castBulkWrite.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const applyTimestampsToChildren = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToChildren.js [app-route] (ecmascript)");
const applyTimestampsToUpdate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/applyTimestampsToUpdate.js [app-route] (ecmascript)");
const cast = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)");
const castUpdate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/castUpdate.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const decorateUpdateWithVersionKey = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/decorateUpdateWithVersionKey.js [app-route] (ecmascript)");
const { inspect } = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const setDefaultsOnInsert = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/setDefaultsOnInsert.js [app-route] (ecmascript)");
/**
 * Given a model and a bulkWrite op, return a thunk that handles casting and
 * validating the individual op.
 * @param {Model} originalModel
 * @param {Object} op
 * @param {Object} [options]
 * @api private
 */ module.exports = function castBulkWrite(originalModel, op, options) {
    const now = originalModel.base.now();
    if (op['insertOne']) {
        return (callback)=>module.exports.castInsertOne(originalModel, op['insertOne'], options).then(()=>callback(null), (err)=>callback(err));
    } else if (op['updateOne']) {
        return (callback)=>{
            try {
                module.exports.castUpdateOne(originalModel, op['updateOne'], options, now);
                callback(null);
            } catch (err) {
                callback(err);
            }
        };
    } else if (op['updateMany']) {
        return (callback)=>{
            try {
                module.exports.castUpdateMany(originalModel, op['updateMany'], options, now);
                callback(null);
            } catch (err) {
                callback(err);
            }
        };
    } else if (op['replaceOne']) {
        return (callback)=>{
            module.exports.castReplaceOne(originalModel, op['replaceOne'], options).then(()=>callback(null), (err)=>callback(err));
        };
    } else if (op['deleteOne']) {
        return (callback)=>{
            try {
                module.exports.castDeleteOne(originalModel, op['deleteOne']);
                callback(null);
            } catch (err) {
                callback(err);
            }
        };
    } else if (op['deleteMany']) {
        return (callback)=>{
            try {
                module.exports.castDeleteMany(originalModel, op['deleteMany']);
                callback(null);
            } catch (err) {
                callback(err);
            }
        };
    } else {
        return (callback)=>{
            const error = new MongooseError(`Invalid op passed to \`bulkWrite()\`: ${inspect(op)}`);
            callback(error, null);
        };
    }
};
module.exports.castInsertOne = async function castInsertOne(originalModel, insertOne, options) {
    const model = decideModelByObject(originalModel, insertOne['document']);
    const doc = new model(insertOne['document']);
    if (model.schema.options.timestamps && getTimestampsOpt(insertOne, options)) {
        doc.initializeTimestamps();
    }
    if (options.session != null) {
        doc.$session(options.session);
    }
    const versionKey = model?.schema?.options?.versionKey;
    if (versionKey && doc[versionKey] == null) {
        doc[versionKey] = 0;
    }
    insertOne['document'] = doc;
    if (options.skipValidation || insertOne.skipValidation) {
        return insertOne;
    }
    await insertOne['document'].$validate();
    return insertOne;
};
module.exports.castUpdateOne = function castUpdateOne(originalModel, updateOne, options, now) {
    if (!updateOne['filter']) {
        throw new Error('Must provide a filter object.');
    }
    if (!updateOne['update']) {
        throw new Error('Must provide an update object.');
    }
    const model = decideModelByObject(originalModel, updateOne['filter']);
    const schema = model.schema;
    const strict = options.strict != null ? options.strict : model.schema.options.strict;
    const update = clone(updateOne['update']);
    _addDiscriminatorToObject(schema, updateOne['filter']);
    const doInitTimestamps = getTimestampsOpt(updateOne, options);
    if (model.schema.$timestamps != null && doInitTimestamps) {
        const createdAt = model.schema.$timestamps.createdAt;
        const updatedAt = model.schema.$timestamps.updatedAt;
        applyTimestampsToUpdate(now, createdAt, updatedAt, update, {});
    }
    if (doInitTimestamps) {
        applyTimestampsToChildren(now, update, model.schema);
    }
    const globalSetDefaultsOnInsert = originalModel.base.options.setDefaultsOnInsert;
    const shouldSetDefaultsOnInsert = updateOne.setDefaultsOnInsert == null ? globalSetDefaultsOnInsert : updateOne.setDefaultsOnInsert;
    if (shouldSetDefaultsOnInsert !== false) {
        setDefaultsOnInsert(updateOne['filter'], model.schema, update, {
            setDefaultsOnInsert: true,
            upsert: updateOne.upsert
        });
    }
    decorateUpdateWithVersionKey(update, updateOne, model.schema.options.versionKey);
    updateOne['filter'] = cast(model.schema, updateOne['filter'], {
        strict: strict,
        upsert: updateOne.upsert
    });
    updateOne['update'] = castUpdate(model.schema, update, {
        strict: strict,
        upsert: updateOne.upsert,
        arrayFilters: updateOne.arrayFilters,
        overwriteDiscriminatorKey: updateOne.overwriteDiscriminatorKey
    }, model, updateOne['filter']);
    return updateOne;
};
module.exports.castUpdateMany = function castUpdateMany(originalModel, updateMany, options, now) {
    if (!updateMany['filter']) {
        throw new Error('Must provide a filter object.');
    }
    if (!updateMany['update']) {
        throw new Error('Must provide an update object.');
    }
    const model = decideModelByObject(originalModel, updateMany['filter']);
    const schema = model.schema;
    const strict = options.strict != null ? options.strict : model.schema.options.strict;
    const globalSetDefaultsOnInsert = originalModel.base.options.setDefaultsOnInsert;
    const shouldSetDefaultsOnInsert = updateMany.setDefaultsOnInsert == null ? globalSetDefaultsOnInsert : updateMany.setDefaultsOnInsert;
    if (shouldSetDefaultsOnInsert !== false) {
        setDefaultsOnInsert(updateMany['filter'], model.schema, updateMany['update'], {
            setDefaultsOnInsert: true,
            upsert: updateMany.upsert
        });
    }
    const doInitTimestamps = getTimestampsOpt(updateMany, options);
    if (model.schema.$timestamps != null && doInitTimestamps) {
        const createdAt = model.schema.$timestamps.createdAt;
        const updatedAt = model.schema.$timestamps.updatedAt;
        applyTimestampsToUpdate(now, createdAt, updatedAt, updateMany['update'], {});
    }
    if (doInitTimestamps) {
        applyTimestampsToChildren(now, updateMany['update'], model.schema);
    }
    _addDiscriminatorToObject(schema, updateMany['filter']);
    decorateUpdateWithVersionKey(updateMany['update'], updateMany, model.schema.options.versionKey);
    updateMany['filter'] = cast(model.schema, updateMany['filter'], {
        strict: strict,
        upsert: updateMany.upsert
    });
    updateMany['update'] = castUpdate(model.schema, updateMany['update'], {
        strict: strict,
        upsert: updateMany.upsert,
        arrayFilters: updateMany.arrayFilters,
        overwriteDiscriminatorKey: updateMany.overwriteDiscriminatorKey
    }, model, updateMany['filter']);
};
module.exports.castReplaceOne = async function castReplaceOne(originalModel, replaceOne, options) {
    const model = decideModelByObject(originalModel, replaceOne['filter']);
    const schema = model.schema;
    const strict = options.strict != null ? options.strict : model.schema.options.strict;
    _addDiscriminatorToObject(schema, replaceOne['filter']);
    replaceOne['filter'] = cast(model.schema, replaceOne['filter'], {
        strict: strict,
        upsert: replaceOne.upsert
    });
    // set `skipId`, otherwise we get "_id field cannot be changed"
    const doc = new model(replaceOne['replacement'], strict, true);
    if (model.schema.options.timestamps && getTimestampsOpt(replaceOne, options)) {
        doc.initializeTimestamps();
    }
    if (options.session != null) {
        doc.$session(options.session);
    }
    const versionKey = model?.schema?.options?.versionKey;
    if (versionKey && doc[versionKey] == null) {
        doc[versionKey] = 0;
    }
    replaceOne['replacement'] = doc;
    if (options.skipValidation || replaceOne.skipValidation) {
        replaceOne['replacement'] = replaceOne['replacement'].toBSON();
        return;
    }
    await replaceOne['replacement'].$validate();
    replaceOne['replacement'] = replaceOne['replacement'].toBSON();
};
module.exports.castDeleteOne = function castDeleteOne(originalModel, deleteOne) {
    const model = decideModelByObject(originalModel, deleteOne['filter']);
    const schema = model.schema;
    _addDiscriminatorToObject(schema, deleteOne['filter']);
    deleteOne['filter'] = cast(model.schema, deleteOne['filter']);
};
module.exports.castDeleteMany = function castDeleteMany(originalModel, deleteMany) {
    const model = decideModelByObject(originalModel, deleteMany['filter']);
    const schema = model.schema;
    _addDiscriminatorToObject(schema, deleteMany['filter']);
    deleteMany['filter'] = cast(model.schema, deleteMany['filter']);
};
module.exports.cast = {
    insertOne: module.exports.castInsertOne,
    updateOne: module.exports.castUpdateOne,
    updateMany: module.exports.castUpdateMany,
    replaceOne: module.exports.castReplaceOne,
    deleteOne: module.exports.castDeleteOne,
    deleteMany: module.exports.castDeleteMany
};
function _addDiscriminatorToObject(schema, obj) {
    if (schema == null) {
        return;
    }
    if (schema.discriminatorMapping && !schema.discriminatorMapping.isRoot) {
        obj[schema.discriminatorMapping.key] = schema.discriminatorMapping.value;
    }
}
/**
 * gets discriminator model if discriminator key is present in object
 * @api private
 */ function decideModelByObject(model, object) {
    const discriminatorKey = model.schema.options.discriminatorKey;
    if (object != null && object.hasOwnProperty(discriminatorKey)) {
        model = getDiscriminatorByValue(model.discriminators, object[discriminatorKey]) || model;
    }
    return model;
}
/**
 * gets timestamps option for a given operation. If the option is set within an individual operation, use it. Otherwise, use the global timestamps option configured in the `bulkWrite` options. Overall default is `true`.
 * @api private
 */ function getTimestampsOpt(opCommand, options) {
    const opLevelOpt = opCommand.timestamps;
    const bulkLevelOpt = options.timestamps;
    if (opLevelOpt != null) {
        return opLevelOpt;
    } else if (bulkLevelOpt != null) {
        return bulkLevelOpt;
    }
    return true;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/decorateBulkWriteResult.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function decorateBulkWriteResult(resultOrError, validationErrors, results) {
    resultOrError.mongoose = resultOrError.mongoose || {};
    resultOrError.mongoose.validationErrors = validationErrors;
    resultOrError.mongoose.results = results;
    return resultOrError;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/processConnectionOptions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
function processConnectionOptions(uri, options) {
    const opts = options ? options : {};
    const readPreference = opts.readPreference ? opts.readPreference : getUriReadPreference(uri);
    const clonedOpts = clone(opts);
    const resolvedOpts = readPreference && readPreference !== 'primary' && readPreference !== 'primaryPreferred' ? resolveOptsConflicts(readPreference, clonedOpts) : clonedOpts;
    return resolvedOpts;
}
function resolveOptsConflicts(pref, opts) {
    // don't silently override user-provided indexing options
    if (setsIndexOptions(opts) && setsSecondaryRead(pref)) {
        throwReadPreferenceError();
    } else {
        return defaultIndexOptsToFalse(opts);
    }
}
function setsIndexOptions(opts) {
    const configIdx = opts.config && opts.config.autoIndex;
    const { autoCreate, autoIndex } = opts;
    return !!(configIdx || autoCreate || autoIndex);
}
function setsSecondaryRead(prefString) {
    return !!(prefString === 'secondary' || prefString === 'secondaryPreferred');
}
function getUriReadPreference(connectionString) {
    const exp = /(?:&|\?)readPreference=(\w+)(?:&|$)/;
    const match = exp.exec(connectionString);
    return match ? match[1] : null;
}
function defaultIndexOptsToFalse(opts) {
    opts.config = {
        autoIndex: false
    };
    opts.autoCreate = false;
    opts.autoIndex = false;
    return opts;
}
function throwReadPreferenceError() {
    throw new MongooseError('MongoDB prohibits index creation on connections that read from ' + 'non-primary replicas.  Connections that set "readPreference" to "secondary" or ' + '"secondaryPreferred" may not opt-in to the following connection options: ' + 'autoCreate, autoIndex');
}
module.exports = processConnectionOptions;
}),
"[project]/backend/node_modules/mongoose/lib/helpers/timers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.setTimeout = setTimeout;
}),
"[project]/backend/node_modules/mongoose/lib/helpers/cursor/eachAsync.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const EachAsyncMultiError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/eachAsyncMultiError.js [app-route] (ecmascript)");
const immediate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/immediate.js [app-route] (ecmascript)");
/**
 * Execute `fn` for every document in the cursor. If `fn` returns a promise,
 * will wait for the promise to resolve before iterating on to the next one.
 * Returns a promise that resolves when done.
 *
 * @param {Function} next the thunk to call to get the next document
 * @param {Function} fn
 * @param {Object} options
 * @param {Number} [options.batchSize=null] if set, Mongoose will call `fn` with an array of at most `batchSize` documents, instead of a single document
 * @param {Number} [options.parallel=1] maximum number of `fn` calls that Mongoose will run in parallel
 * @param {AbortSignal} [options.signal] allow cancelling this eachAsync(). Once the abort signal is fired, `eachAsync()` will immediately fulfill the returned promise (or call the callback) and not fetch any more documents.
 * @return {Promise}
 * @api public
 * @method eachAsync
 */ module.exports = async function eachAsync(next, fn, options) {
    const parallel = options.parallel || 1;
    const batchSize = options.batchSize;
    const signal = options.signal;
    const continueOnError = options.continueOnError;
    const aggregatedErrors = [];
    const enqueue = asyncQueue();
    let aborted = false;
    return new Promise((resolve, reject)=>{
        if (signal != null) {
            if (signal.aborted) {
                return resolve(null);
            }
            signal.addEventListener('abort', ()=>{
                aborted = true;
                return resolve(null);
            }, {
                once: true
            });
        }
        if (batchSize != null) {
            if (typeof batchSize !== 'number') {
                throw new TypeError('batchSize must be a number');
            } else if (!Number.isInteger(batchSize)) {
                throw new TypeError('batchSize must be an integer');
            } else if (batchSize < 1) {
                throw new TypeError('batchSize must be at least 1');
            }
        }
        iterate((err, res)=>{
            if (err != null) {
                return reject(err);
            }
            resolve(res);
        });
    });
    //TURBOPACK unreachable
    ;
    function iterate(finalCallback) {
        let handleResultsInProgress = 0;
        let currentDocumentIndex = 0;
        let error = null;
        for(let i = 0; i < parallel; ++i){
            enqueue(createFetch());
        }
        function createFetch() {
            let documentsBatch = [];
            let drained = false;
            return fetch;
            //TURBOPACK unreachable
            ;
            function fetch(done) {
                if (drained || aborted) {
                    return done();
                } else if (error) {
                    return done();
                }
                next(function(err, doc) {
                    if (error != null) {
                        return done();
                    }
                    if (err != null) {
                        if (err.name === 'MongoCursorExhaustedError') {
                            // We may end up calling `next()` multiple times on an exhausted
                            // cursor, which leads to an error. In case cursor is exhausted,
                            // just treat it as if the cursor returned no document, which is
                            // how a cursor indicates it is exhausted.
                            doc = null;
                        } else if (continueOnError) {
                            aggregatedErrors.push(err);
                        } else {
                            error = err;
                            finalCallback(err);
                            return done();
                        }
                    }
                    if (doc == null) {
                        drained = true;
                        if (handleResultsInProgress <= 0) {
                            const finalErr = continueOnError ? createEachAsyncMultiError(aggregatedErrors) : error;
                            finalCallback(finalErr);
                        } else if (batchSize && documentsBatch.length) {
                            handleNextResult(documentsBatch, currentDocumentIndex++, handleNextResultCallBack);
                        }
                        return done();
                    }
                    ++handleResultsInProgress;
                    // Kick off the subsequent `next()` before handling the result, but
                    // make sure we know that we still have a result to handle re: #8422
                    immediate(()=>done());
                    if (batchSize) {
                        documentsBatch.push(doc);
                    }
                    // If the current documents size is less than the provided batch size don't process the documents yet
                    if (batchSize && documentsBatch.length !== batchSize) {
                        immediate(()=>enqueue(fetch));
                        return;
                    }
                    const docsToProcess = batchSize ? documentsBatch : doc;
                    function handleNextResultCallBack(err) {
                        if (batchSize) {
                            handleResultsInProgress -= documentsBatch.length;
                            documentsBatch = [];
                        } else {
                            --handleResultsInProgress;
                        }
                        if (err != null) {
                            if (continueOnError) {
                                aggregatedErrors.push(err);
                            } else {
                                error = err;
                                return finalCallback(err);
                            }
                        }
                        if ((drained || aborted) && handleResultsInProgress <= 0) {
                            const finalErr = continueOnError ? createEachAsyncMultiError(aggregatedErrors) : error;
                            return finalCallback(finalErr);
                        }
                        immediate(()=>enqueue(fetch));
                    }
                    handleNextResult(docsToProcess, currentDocumentIndex++, handleNextResultCallBack);
                });
            }
        }
    }
    function handleNextResult(doc, i, callback) {
        let maybePromise;
        try {
            maybePromise = fn(doc, i);
        } catch (err) {
            return callback(err);
        }
        if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then(function() {
                callback(null);
            }, function(error) {
                callback(error || new Error('`eachAsync()` promise rejected without error'));
            });
        } else {
            callback(null);
        }
    }
};
// `next()` can only execute one at a time, so make sure we always execute
// `next()` in series, while still allowing multiple `fn()` instances to run
// in parallel.
function asyncQueue() {
    const _queue = [];
    let inProgress = null;
    let id = 0;
    return function enqueue(fn) {
        if (inProgress === null && _queue.length === 0) {
            inProgress = id++;
            return fn(_step);
        }
        _queue.push(fn);
    };
    //TURBOPACK unreachable
    ;
    function _step() {
        if (_queue.length !== 0) {
            inProgress = id++;
            const fn = _queue.shift();
            fn(_step);
        } else {
            inProgress = null;
        }
    }
}
function createEachAsyncMultiError(aggregatedErrors) {
    if (aggregatedErrors.length === 0) {
        return null;
    }
    return new EachAsyncMultiError(aggregatedErrors);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/applyGlobalOption.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
function applyGlobalMaxTimeMS(options, connectionOptions, baseOptions) {
    applyGlobalOption(options, connectionOptions, baseOptions, 'maxTimeMS');
}
function applyGlobalDiskUse(options, connectionOptions, baseOptions) {
    applyGlobalOption(options, connectionOptions, baseOptions, 'allowDiskUse');
}
module.exports = {
    applyGlobalMaxTimeMS,
    applyGlobalDiskUse
};
function applyGlobalOption(options, connectionOptions, baseOptions, optionName) {
    if (utils.hasUserDefinedProperty(options, optionName)) {
        return;
    }
    if (utils.hasUserDefinedProperty(connectionOptions, optionName)) {
        options[optionName] = connectionOptions[optionName];
    } else if (utils.hasUserDefinedProperty(baseOptions, optionName)) {
        options[optionName] = baseOptions[optionName];
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/applyReadConcern.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function applyReadConcern(schema, options) {
    if (options.readConcern !== undefined) {
        return;
    }
    // Don't apply default read concern to operations in transactions,
    // because you shouldn't set read concern on individual operations
    // within a transaction.
    // See: https://www.mongodb.com/docs/manual/reference/read-concern/
    if (options && options.session && options.session.transaction) {
        return;
    }
    const level = schema.options?.readConcern?.level;
    if (level != null) {
        options.readConcern = {
            level
        };
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/applyWriteConcern.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function applyWriteConcern(schema, options) {
    if (options.writeConcern != null) {
        return;
    }
    // Don't apply default write concern to operations in transactions,
    // because setting write concern on an operation in a transaction is an error
    // See: https://www.mongodb.com/docs/manual/reference/write-concern/
    if (options && options.session && options.session.transaction) {
        return;
    }
    const writeConcern = schema.options.writeConcern ?? {};
    if (Object.keys(writeConcern).length != 0) {
        options.writeConcern = {};
        if (!('w' in options) && writeConcern.w != null) {
            options.writeConcern.w = writeConcern.w;
        }
        if (!('j' in options) && writeConcern.j != null) {
            options.writeConcern.j = writeConcern.j;
        }
        if (!('wtimeout' in options) && writeConcern.wtimeout != null) {
            options.writeConcern.wtimeout = writeConcern.wtimeout;
        }
    } else {
        if (!('w' in options) && writeConcern.w != null) {
            options.w = writeConcern.w;
        }
        if (!('j' in options) && writeConcern.j != null) {
            options.j = writeConcern.j;
        }
        if (!('wtimeout' in options) && writeConcern.wtimeout != null) {
            options.wtimeout = writeConcern.wtimeout;
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/castFilterPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/isOperator.js [app-route] (ecmascript)");
module.exports = function castFilterPath(ctx, schematype, val) {
    const any$conditionals = Object.keys(val).some(isOperator);
    if (!any$conditionals) {
        return schematype.castForQuery(null, val, ctx);
    }
    const ks = Object.keys(val);
    let k = ks.length;
    while(k--){
        const $cond = ks[k];
        const nested = val[$cond];
        if ($cond === '$not') {
            if (nested && schematype && !schematype.caster) {
                const _keys = Object.keys(nested);
                if (_keys.length && isOperator(_keys[0])) {
                    for (const key of Object.keys(nested)){
                        nested[key] = schematype.castForQuery(key, nested[key], ctx);
                    }
                } else {
                    val[$cond] = schematype.castForQuery($cond, nested, ctx);
                }
                continue;
            }
        } else {
            val[$cond] = schematype.castForQuery($cond, nested, ctx);
        }
    }
    return val;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/schema/getPath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const numberRE = /^\d+$/;
/**
 * Behaves like `Schema#path()`, except for it also digs into arrays without
 * needing to put `.0.`, so `getPath(schema, 'docArr.elProp')` works.
 * @api private
 */ module.exports = function getPath(schema, path, discriminatorValueMap) {
    let schematype = schema.path(path);
    if (schematype != null) {
        return schematype;
    }
    const pieces = path.split('.');
    let cur = '';
    let isArray = false;
    for (const piece of pieces){
        if (isArray && numberRE.test(piece)) {
            continue;
        }
        cur = cur.length === 0 ? piece : cur + '.' + piece;
        schematype = schema.path(cur);
        if (schematype?.schema) {
            schema = schematype.schema;
            if (!isArray && schematype.$isMongooseDocumentArray) {
                isArray = true;
            }
            if (discriminatorValueMap && discriminatorValueMap[cur]) {
                schema = schema.discriminators[discriminatorValueMap[cur]] ?? schema;
            }
            cur = '';
        } else if (schematype?.instance === 'Mixed') {
            break;
        }
    }
    return schematype;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/castArrayFilters.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const castFilterPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/castFilterPath.js [app-route] (ecmascript)");
const cleanPositionalOperators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/cleanPositionalOperators.js [app-route] (ecmascript)");
const getPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/getPath.js [app-route] (ecmascript)");
const updatedPathsByArrayFilter = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/update/updatedPathsByArrayFilter.js [app-route] (ecmascript)");
module.exports = function castArrayFilters(query) {
    const arrayFilters = query.options.arrayFilters;
    if (!Array.isArray(arrayFilters)) {
        return;
    }
    const update = query.getUpdate();
    const schema = query.schema;
    const updatedPathsByFilter = updatedPathsByArrayFilter(update);
    let strictQuery = schema.options.strict;
    if (query._mongooseOptions.strict != null) {
        strictQuery = query._mongooseOptions.strict;
    }
    if (query.model && query.model.base.options.strictQuery != null) {
        strictQuery = query.model.base.options.strictQuery;
    }
    if (schema._userProvidedOptions.strictQuery != null) {
        strictQuery = schema._userProvidedOptions.strictQuery;
    }
    if (query._mongooseOptions.strictQuery != null) {
        strictQuery = query._mongooseOptions.strictQuery;
    }
    _castArrayFilters(arrayFilters, schema, strictQuery, updatedPathsByFilter, query);
};
function _castArrayFilters(arrayFilters, schema, strictQuery, updatedPathsByFilter, query) {
    // Map to store discriminator values for embedded documents in the array filters.
    // This is used to handle cases where array filters target specific embedded document types.
    const discriminatorValueMap = {};
    for (const filter of arrayFilters){
        if (filter == null) {
            throw new Error(`Got null array filter in ${arrayFilters}`);
        }
        const keys = Object.keys(filter).filter((key)=>filter[key] != null);
        if (keys.length === 0) {
            continue;
        }
        const firstKey = keys[0];
        if (firstKey === '$and' || firstKey === '$or') {
            for (const key of keys){
                _castArrayFilters(filter[key], schema, strictQuery, updatedPathsByFilter, query);
            }
            continue;
        }
        const dot = firstKey.indexOf('.');
        const filterWildcardPath = dot === -1 ? firstKey : firstKey.substring(0, dot);
        if (updatedPathsByFilter[filterWildcardPath] == null) {
            continue;
        }
        const baseFilterPath = cleanPositionalOperators(updatedPathsByFilter[filterWildcardPath]);
        const baseSchematype = getPath(schema, baseFilterPath, discriminatorValueMap);
        let filterBaseSchema = baseSchematype != null ? baseSchematype.schema : null;
        if (filterBaseSchema != null && filterBaseSchema.discriminators != null && filter[filterWildcardPath + '.' + filterBaseSchema.options.discriminatorKey]) {
            filterBaseSchema = filterBaseSchema.discriminators[filter[filterWildcardPath + '.' + filterBaseSchema.options.discriminatorKey]] || filterBaseSchema;
            discriminatorValueMap[baseFilterPath] = filter[filterWildcardPath + '.' + filterBaseSchema.options.discriminatorKey];
        }
        for (const key of keys){
            if (updatedPathsByFilter[key] === null) {
                continue;
            }
            if (Object.keys(updatedPathsByFilter).length === 0) {
                continue;
            }
            const dot = key.indexOf('.');
            let filterPathRelativeToBase = dot === -1 ? null : key.substring(dot);
            let schematype;
            if (filterPathRelativeToBase == null || filterBaseSchema == null) {
                schematype = baseSchematype;
            } else {
                // If there are multiple array filters in the path being updated, make sure
                // to replace them so we can get the schema path.
                filterPathRelativeToBase = cleanPositionalOperators(filterPathRelativeToBase);
                schematype = getPath(filterBaseSchema, filterPathRelativeToBase, discriminatorValueMap);
            }
            if (schematype == null) {
                if (!strictQuery) {
                    return;
                }
                const filterPath = filterPathRelativeToBase == null ? baseFilterPath + '.0' : baseFilterPath + '.0' + filterPathRelativeToBase;
                // For now, treat `strictQuery = true` and `strictQuery = 'throw'` as
                // equivalent for casting array filters. `strictQuery = true` doesn't
                // quite work in this context because we never want to silently strip out
                // array filters, even if the path isn't in the schema.
                throw new Error(`Could not find path "${filterPath}" in schema`);
            }
            if (typeof filter[key] === 'object') {
                filter[key] = castFilterPath(query, schematype, filter[key]);
            } else {
                filter[key] = schematype.castForQuery(null, filter[key]);
            }
        }
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isInclusive.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isDefiningProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isDefiningProjection.js [app-route] (ecmascript)");
const isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isPOJO.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function isInclusive(projection) {
    if (projection == null) {
        return false;
    }
    const props = Object.keys(projection);
    const numProps = props.length;
    if (numProps === 0) {
        return false;
    }
    for(let i = 0; i < numProps; ++i){
        const prop = props[i];
        // Plus paths can't define the projection (see gh-7050)
        if (prop.startsWith('+')) {
            continue;
        }
        // If field is truthy (1, true, etc.) and not an object, then this
        // projection must be inclusive. If object, assume its $meta, $slice, etc.
        if (isDefiningProjection(projection[prop]) && !!projection[prop]) {
            if (isPOJO(projection[prop])) {
                return isInclusive(projection[prop]);
            } else {
                return !!projection[prop];
            }
        }
    }
    return false;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/isSubpath.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Determines if `path2` is a subpath of or equal to `path1`
 *
 * @param {string} path1
 * @param {string} path2
 * @return {Boolean}
 * @api private
 */ module.exports = function isSubpath(path1, path2) {
    return path1 === path2 || path2.startsWith(path1 + '.');
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/parseProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Convert a string or array into a projection object, retaining all
 * `-` and `+` paths.
 */ module.exports = function parseProjection(v, retainMinusPaths) {
    const type = typeof v;
    if (type === 'string') {
        v = v.split(/\s+/);
    }
    if (!Array.isArray(v) && Object.prototype.toString.call(v) !== '[object Arguments]') {
        return v;
    }
    const len = v.length;
    const ret = {};
    for(let i = 0; i < len; ++i){
        let field = v[i];
        if (!field) {
            continue;
        }
        const include = '-' == field[0] ? 0 : 1;
        if (!retainMinusPaths && include === 0) {
            field = field.substring(1);
        }
        ret[field] = include;
    }
    return ret;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/update/removeUnusedArrayFilters.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * MongoDB throws an error if there's unused array filters. That is, if `options.arrayFilters` defines
 * a filter, but none of the `update` keys use it. This should be enough to filter out all unused array
 * filters.
 */ module.exports = function removeUnusedArrayFilters(update, arrayFilters) {
    const updateKeys = Object.keys(update).map((key)=>Object.keys(update[key])).reduce((cur, arr)=>cur.concat(arr), []);
    return arrayFilters.filter((obj)=>{
        return _checkSingleFilterKey(obj, updateKeys);
    });
};
function _checkSingleFilterKey(arrayFilter, updateKeys) {
    const firstKey = Object.keys(arrayFilter)[0];
    if (firstKey === '$and' || firstKey === '$or') {
        if (!Array.isArray(arrayFilter[firstKey])) {
            return false;
        }
        return arrayFilter[firstKey].find((filter)=>_checkSingleFilterKey(filter, updateKeys)) != null;
    }
    const firstDot = firstKey.indexOf('.');
    const arrayFilterKey = firstDot === -1 ? firstKey : firstKey.slice(0, firstDot);
    return updateKeys.find((key)=>key.includes('$[' + arrayFilterKey + ']')) != null;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/hasDollarKeys.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function hasDollarKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const keys = Object.keys(obj);
    const len = keys.length;
    for(let i = 0; i < len; ++i){
        if (keys[i][0] === '$') {
            return true;
        }
    }
    return false;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/sanitizeFilter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const hasDollarKeys = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/hasDollarKeys.js [app-route] (ecmascript)");
const { trustedSymbol } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)");
module.exports = function sanitizeFilter(filter) {
    if (filter == null || typeof filter !== 'object') {
        return filter;
    }
    if (Array.isArray(filter)) {
        for (const subfilter of filter){
            sanitizeFilter(subfilter);
        }
        return filter;
    }
    const filterKeys = Object.keys(filter);
    for (const key of filterKeys){
        const value = filter[key];
        if (value != null && value[trustedSymbol]) {
            continue;
        }
        if (key === '$and' || key === '$or') {
            sanitizeFilter(value);
            continue;
        }
        if (hasDollarKeys(value)) {
            const keys = Object.keys(value);
            if (keys.length === 1 && keys[0] === '$eq') {
                continue;
            }
            filter[key] = {
                $eq: filter[key]
            };
        }
    }
    return filter;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/sanitizeProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function sanitizeProjection(projection) {
    if (projection == null) {
        return;
    }
    const keys = Object.keys(projection);
    for(let i = 0; i < keys.length; ++i){
        if (typeof projection[keys[i]] === 'string') {
            projection[keys[i]] = 1;
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/query/selectPopulatedFields.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isExclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isExclusive.js [app-route] (ecmascript)");
const isInclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isInclusive.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function selectPopulatedFields(fields, userProvidedFields, populateOptions) {
    if (populateOptions == null) {
        return;
    }
    const paths = Object.keys(populateOptions);
    userProvidedFields = userProvidedFields || {};
    if (isInclusive(fields)) {
        for (const path of paths){
            if (!isPathInFields(userProvidedFields, path)) {
                fields[path] = 1;
            } else if (userProvidedFields[path] === 0) {
                delete fields[path];
            }
            const refPath = populateOptions[path]?.refPath;
            if (typeof refPath === 'string') {
                if (!isPathInFields(userProvidedFields, refPath)) {
                    fields[refPath] = 1;
                } else if (userProvidedFields[refPath] === 0) {
                    delete fields[refPath];
                }
            }
        }
    } else if (isExclusive(fields)) {
        for (const path of paths){
            if (userProvidedFields[path] == null) {
                delete fields[path];
            }
            const refPath = populateOptions[path]?.refPath;
            if (typeof refPath === 'string' && userProvidedFields[refPath] == null) {
                delete fields[refPath];
            }
        }
    }
};
/*!
 * ignore
 */ function isPathInFields(userProvidedFields, path) {
    const pieces = path.split('.');
    const len = pieces.length;
    let cur = pieces[0];
    for(let i = 1; i < len; ++i){
        if (userProvidedFields[cur] != null || userProvidedFields[cur + '.$'] != null) {
            return true;
        }
        cur += '.' + pieces[i];
    }
    return userProvidedFields[cur] != null || userProvidedFields[cur + '.$'] != null;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/updateValidators.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const ValidationError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/validation.js [app-route] (ecmascript)");
const cleanPositionalOperators = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/cleanPositionalOperators.js [app-route] (ecmascript)");
const flatten = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/common.js [app-route] (ecmascript)").flatten;
/**
 * Applies validators and defaults to update and findOneAndUpdate operations,
 * specifically passing a null doc as `this` to validators and defaults
 *
 * @param {Query} query
 * @param {Schema} schema
 * @param {Object} castedDoc
 * @param {Object} options
 * @method runValidatorsOnUpdate
 * @api private
 */ module.exports = function(query, schema, castedDoc, options, callback) {
    const keys = Object.keys(castedDoc || {});
    let updatedKeys = {};
    let updatedValues = {};
    const isPull = {};
    const arrayAtomicUpdates = {};
    const numKeys = keys.length;
    let hasDollarUpdate = false;
    let currentUpdate;
    let key;
    let i;
    for(i = 0; i < numKeys; ++i){
        if (keys[i].startsWith('$')) {
            hasDollarUpdate = true;
            if (keys[i] === '$push' || keys[i] === '$addToSet') {
                const _keys = Object.keys(castedDoc[keys[i]]);
                for(let ii = 0; ii < _keys.length; ++ii){
                    currentUpdate = castedDoc[keys[i]][_keys[ii]];
                    if (currentUpdate && currentUpdate.$each) {
                        arrayAtomicUpdates[_keys[ii]] = (arrayAtomicUpdates[_keys[ii]] || []).concat(currentUpdate.$each);
                    } else {
                        arrayAtomicUpdates[_keys[ii]] = (arrayAtomicUpdates[_keys[ii]] || []).concat([
                            currentUpdate
                        ]);
                    }
                }
                continue;
            }
            const flat = flatten(castedDoc[keys[i]], null, null, schema);
            const paths = Object.keys(flat);
            const numPaths = paths.length;
            for(let j = 0; j < numPaths; ++j){
                const updatedPath = cleanPositionalOperators(paths[j]);
                key = keys[i];
                // With `$pull` we might flatten `$in`. Skip stuff nested under `$in`
                // for the rest of the logic, it will get handled later.
                if (updatedPath.includes('$')) {
                    continue;
                }
                if (key === '$set' || key === '$setOnInsert' || key === '$pull' || key === '$pullAll') {
                    updatedValues[updatedPath] = flat[paths[j]];
                    isPull[updatedPath] = key === '$pull' || key === '$pullAll';
                } else if (key === '$unset') {
                    updatedValues[updatedPath] = undefined;
                }
                updatedKeys[updatedPath] = true;
            }
        }
    }
    if (!hasDollarUpdate) {
        updatedValues = flatten(castedDoc, null, null, schema);
        updatedKeys = Object.keys(updatedValues);
    }
    const updates = Object.keys(updatedValues);
    const numUpdates = updates.length;
    const validatorsToExecute = [];
    const validationErrors = [];
    const alreadyValidated = [];
    const context = query;
    function iter(i, v) {
        const schemaPath = schema._getSchema(updates[i]);
        if (schemaPath == null) {
            return;
        }
        if (schemaPath.instance === 'Mixed' && schemaPath.path !== updates[i]) {
            return;
        }
        if (v && Array.isArray(v.$in)) {
            v.$in.forEach((v, i)=>{
                validatorsToExecute.push(function(callback) {
                    schemaPath.doValidate(v, function(err) {
                        if (err) {
                            err.path = updates[i] + '.$in.' + i;
                            validationErrors.push(err);
                        }
                        callback(null);
                    }, context, {
                        updateValidator: true
                    });
                });
            });
        } else {
            if (isPull[updates[i]] && schemaPath.$isMongooseArray) {
                return;
            }
            if (schemaPath.$isMongooseDocumentArrayElement && v != null && v.$__ != null) {
                alreadyValidated.push(updates[i]);
                validatorsToExecute.push(function(callback) {
                    schemaPath.doValidate(v, function(err) {
                        if (err) {
                            if (err.errors) {
                                for (const key of Object.keys(err.errors)){
                                    const _err = err.errors[key];
                                    _err.path = updates[i] + '.' + key;
                                    validationErrors.push(_err);
                                }
                            } else {
                                err.path = updates[i];
                                validationErrors.push(err);
                            }
                        }
                        return callback(null);
                    }, context, {
                        updateValidator: true
                    });
                });
            } else {
                validatorsToExecute.push(function(callback) {
                    for (const path of alreadyValidated){
                        if (updates[i].startsWith(path + '.')) {
                            return callback(null);
                        }
                    }
                    if (schemaPath.$isSingleNested) {
                        alreadyValidated.push(updates[i]);
                    }
                    schemaPath.doValidate(v, function(err) {
                        if (schemaPath.schema != null && schemaPath.schema.options.storeSubdocValidationError === false && err instanceof ValidationError) {
                            return callback(null);
                        }
                        if (err) {
                            err.path = updates[i];
                            validationErrors.push(err);
                        }
                        callback(null);
                    }, context, {
                        updateValidator: true
                    });
                });
            }
        }
    }
    for(i = 0; i < numUpdates; ++i){
        iter(i, updatedValues[updates[i]]);
    }
    const arrayUpdates = Object.keys(arrayAtomicUpdates);
    for (const arrayUpdate of arrayUpdates){
        let schemaPath = schema._getSchema(arrayUpdate);
        if (schemaPath && schemaPath.$isMongooseDocumentArray) {
            validatorsToExecute.push(function(callback) {
                schemaPath.doValidate(arrayAtomicUpdates[arrayUpdate], getValidationCallback(arrayUpdate, validationErrors, callback), options && options.context === 'query' ? query : null);
            });
        } else {
            schemaPath = schema._getSchema(arrayUpdate + '.0');
            for (const atomicUpdate of arrayAtomicUpdates[arrayUpdate]){
                validatorsToExecute.push(function(callback) {
                    schemaPath.doValidate(atomicUpdate, getValidationCallback(arrayUpdate, validationErrors, callback), options && options.context === 'query' ? query : null, {
                        updateValidator: true
                    });
                });
            }
        }
    }
    if (callback != null) {
        let numValidators = validatorsToExecute.length;
        if (numValidators === 0) {
            return _done(callback);
        }
        for (const validator of validatorsToExecute){
            validator(function() {
                if (--numValidators <= 0) {
                    _done(callback);
                }
            });
        }
        return;
    }
    return function(callback) {
        let numValidators = validatorsToExecute.length;
        if (numValidators === 0) {
            return _done(callback);
        }
        for (const validator of validatorsToExecute){
            validator(function() {
                if (--numValidators <= 0) {
                    _done(callback);
                }
            });
        }
    };
    //TURBOPACK unreachable
    ;
    function _done(callback) {
        if (validationErrors.length) {
            const err = new ValidationError(null);
            for (const validationError of validationErrors){
                err.addError(validationError.path, validationError);
            }
            return callback(err);
        }
        callback(null);
    }
    function getValidationCallback(arrayUpdate, validationErrors, callback) {
        return function(err) {
            if (err) {
                err.path = arrayUpdate;
                validationErrors.push(err);
            }
            callback(null);
        };
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/aggregate/prepareDiscriminatorPipeline.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function prepareDiscriminatorPipeline(pipeline, schema, prefix) {
    const discriminatorMapping = schema && schema.discriminatorMapping;
    prefix = prefix || '';
    if (discriminatorMapping && !discriminatorMapping.isRoot) {
        const originalPipeline = pipeline;
        const filterKey = (prefix.length > 0 ? prefix + '.' : prefix) + discriminatorMapping.key;
        const discriminatorValue = discriminatorMapping.value;
        // If the first pipeline stage is a match and it doesn't specify a `__t`
        // key, add the discriminator key to it. This allows for potential
        // aggregation query optimizations not to be disturbed by this feature.
        if (originalPipeline[0] != null && originalPipeline[0].$match && (originalPipeline[0].$match[filterKey] === undefined || originalPipeline[0].$match[filterKey] === discriminatorValue)) {
            originalPipeline[0].$match[filterKey] = discriminatorValue;
        // `originalPipeline` is a ref, so there's no need for
        // aggregate._pipeline = originalPipeline
        } else if (originalPipeline[0] != null && originalPipeline[0].$geoNear) {
            originalPipeline[0].$geoNear.query = originalPipeline[0].$geoNear.query || {};
            originalPipeline[0].$geoNear.query[filterKey] = discriminatorValue;
        } else if (originalPipeline[0] != null && originalPipeline[0].$search) {
            if (originalPipeline[1] && originalPipeline[1].$match != null) {
                originalPipeline[1].$match[filterKey] = originalPipeline[1].$match[filterKey] || discriminatorValue;
            } else {
                const match = {};
                match[filterKey] = discriminatorValue;
                originalPipeline.splice(1, 0, {
                    $match: match
                });
            }
        } else {
            const match = {};
            match[filterKey] = discriminatorValue;
            originalPipeline.unshift({
                $match: match
            });
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/aggregate/stringifyFunctionOperators.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function stringifyFunctionOperators(pipeline) {
    if (!Array.isArray(pipeline)) {
        return;
    }
    for (const stage of pipeline){
        if (stage == null) {
            continue;
        }
        const canHaveAccumulator = stage.$group || stage.$bucket || stage.$bucketAuto;
        if (canHaveAccumulator != null) {
            for (const key of Object.keys(canHaveAccumulator)){
                handleAccumulator(canHaveAccumulator[key]);
            }
        }
        const stageType = Object.keys(stage)[0];
        if (stageType && typeof stage[stageType] === 'object') {
            const stageOptions = stage[stageType];
            for (const key of Object.keys(stageOptions)){
                if (stageOptions[key] != null && stageOptions[key].$function != null && typeof stageOptions[key].$function.body === 'function') {
                    stageOptions[key].$function.body = stageOptions[key].$function.body.toString();
                }
            }
        }
        if (stage.$facet != null) {
            for (const key of Object.keys(stage.$facet)){
                stringifyFunctionOperators(stage.$facet[key]);
            }
        }
    }
};
function handleAccumulator(operator) {
    if (operator == null || operator.$accumulator == null) {
        return;
    }
    for (const key of [
        'init',
        'accumulate',
        'merge',
        'finalize'
    ]){
        if (typeof operator.$accumulator[key] === 'function') {
            operator.$accumulator[key] = String(operator.$accumulator[key]);
        }
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/applyDefaultsToPOJO.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function applyDefaultsToPOJO(doc, schema) {
    const paths = Object.keys(schema.paths);
    const plen = paths.length;
    for(let i = 0; i < plen; ++i){
        let curPath = '';
        const p = paths[i];
        const type = schema.paths[p];
        const path = type.splitPath();
        const len = path.length;
        let doc_ = doc;
        for(let j = 0; j < len; ++j){
            if (doc_ == null) {
                break;
            }
            const piece = path[j];
            curPath += (!curPath.length ? '' : '.') + piece;
            if (j === len - 1) {
                if (typeof doc_[piece] !== 'undefined') {
                    if (type.$isSingleNested) {
                        applyDefaultsToPOJO(doc_[piece], type.caster.schema);
                    } else if (type.$isMongooseDocumentArray && Array.isArray(doc_[piece])) {
                        doc_[piece].forEach((el)=>applyDefaultsToPOJO(el, type.schema));
                    }
                    break;
                }
                const def = type.getDefault(doc, false, {
                    skipCast: true
                });
                if (typeof def !== 'undefined') {
                    doc_[piece] = def;
                    if (type.$isSingleNested) {
                        applyDefaultsToPOJO(def, type.caster.schema);
                    } else if (type.$isMongooseDocumentArray && Array.isArray(def)) {
                        def.forEach((el)=>applyDefaultsToPOJO(el, type.schema));
                    }
                }
            } else {
                if (doc_[piece] == null) {
                    doc_[piece] = {};
                }
                doc_ = doc_[piece];
            }
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/discriminator/applyEmbeddedDiscriminators.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = applyEmbeddedDiscriminators;
function applyEmbeddedDiscriminators(schema, seen = new WeakSet(), overwriteExisting = false) {
    if (seen.has(schema)) {
        return;
    }
    seen.add(schema);
    for (const path of Object.keys(schema.paths)){
        const schemaType = schema.paths[path];
        if (!schemaType.schema) {
            continue;
        }
        applyEmbeddedDiscriminators(schemaType.schema, seen);
        if (!schemaType.schema._applyDiscriminators) {
            continue;
        }
        if (schemaType._appliedDiscriminators && !overwriteExisting) {
            continue;
        }
        for (const discriminatorKey of schemaType.schema._applyDiscriminators.keys()){
            const { schema: discriminatorSchema, options } = schemaType.schema._applyDiscriminators.get(discriminatorKey);
            applyEmbeddedDiscriminators(discriminatorSchema, seen);
            schemaType.discriminator(discriminatorKey, discriminatorSchema, overwriteExisting ? {
                ...options,
                overwriteExisting: true
            } : options);
        }
        schemaType._appliedDiscriminators = true;
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/applyMethods.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/**
 * Register methods for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */ module.exports = function applyMethods(model, schema) {
    const Model = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/model.js [app-route] (ecmascript)");
    function apply(method, schema) {
        Object.defineProperty(model.prototype, method, {
            get: function() {
                const h = {};
                for(const k in schema.methods[method]){
                    h[k] = schema.methods[method][k].bind(this);
                }
                return h;
            },
            configurable: true
        });
    }
    for (const method of Object.keys(schema.methods)){
        const fn = schema.methods[method];
        if (schema.tree.hasOwnProperty(method)) {
            throw new Error('You have a method and a property in your schema both ' + 'named "' + method + '"');
        }
        // Avoid making custom methods if user sets a method to itself, e.g.
        // `schema.method(save, Document.prototype.save)`. Can happen when
        // calling `loadClass()` with a class that `extends Document`. See gh-12254
        if (typeof fn === 'function' && Model.prototype[method] === fn) {
            delete schema.methods[method];
            continue;
        }
        if (schema.reserved[method] && !get(schema, `methodOptions.${method}.suppressWarning`, false)) {
            utils.warn(`mongoose: the method name "${method}" is used by mongoose ` + 'internally, overwriting it may cause bugs. If you\'re sure you know ' + 'what you\'re doing, you can suppress this error by using ' + `\`schema.method('${method}', fn, { suppressWarning: true })\`.`);
        }
        if (typeof fn === 'function') {
            model.prototype[method] = fn;
        } else {
            apply(method, schema);
        }
    }
    // Recursively call `applyMethods()` on child schemas
    model.$appliedMethods = true;
    for (const key of Object.keys(schema.paths)){
        const type = schema.paths[key];
        if (type.$isSingleNested && !type.caster.$appliedMethods) {
            applyMethods(type.caster, type.schema);
        }
        if (type.$isMongooseDocumentArray && !type.Constructor.$appliedMethods) {
            applyMethods(type.Constructor, type.schema);
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/projection/applyProjection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const hasIncludedChildren = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/hasIncludedChildren.js [app-route] (ecmascript)");
const isExclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isExclusive.js [app-route] (ecmascript)");
const isInclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isInclusive.js [app-route] (ecmascript)");
const isPOJO = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)").isPOJO;
module.exports = function applyProjection(doc, projection, _hasIncludedChildren) {
    if (projection == null) {
        return doc;
    }
    if (doc == null) {
        return doc;
    }
    let exclude = null;
    if (isInclusive(projection)) {
        exclude = false;
    } else if (isExclusive(projection)) {
        exclude = true;
    }
    if (exclude == null) {
        return doc;
    } else if (exclude) {
        _hasIncludedChildren = _hasIncludedChildren || hasIncludedChildren(projection);
        return applyExclusiveProjection(doc, projection, _hasIncludedChildren);
    } else {
        _hasIncludedChildren = _hasIncludedChildren || hasIncludedChildren(projection);
        return applyInclusiveProjection(doc, projection, _hasIncludedChildren);
    }
};
function applyExclusiveProjection(doc, projection, hasIncludedChildren, projectionLimb, prefix) {
    if (doc == null || typeof doc !== 'object') {
        return doc;
    }
    if (Array.isArray(doc)) {
        return doc.map((el)=>applyExclusiveProjection(el, projection, hasIncludedChildren, projectionLimb, prefix));
    }
    const ret = {
        ...doc
    };
    projectionLimb = prefix ? projectionLimb || {} : projection;
    for (const key of Object.keys(ret)){
        const fullPath = prefix ? prefix + '.' + key : key;
        if (projection.hasOwnProperty(fullPath) || projectionLimb.hasOwnProperty(key)) {
            if (isPOJO(projection[fullPath]) || isPOJO(projectionLimb[key])) {
                ret[key] = applyExclusiveProjection(ret[key], projection, hasIncludedChildren, projectionLimb[key], fullPath);
            } else {
                delete ret[key];
            }
        } else if (hasIncludedChildren[fullPath]) {
            ret[key] = applyExclusiveProjection(ret[key], projection, hasIncludedChildren, projectionLimb[key], fullPath);
        }
    }
    return ret;
}
function applyInclusiveProjection(doc, projection, hasIncludedChildren, projectionLimb, prefix) {
    if (doc == null || typeof doc !== 'object') {
        return doc;
    }
    if (Array.isArray(doc)) {
        return doc.map((el)=>applyInclusiveProjection(el, projection, hasIncludedChildren, projectionLimb, prefix));
    }
    const ret = {
        ...doc
    };
    projectionLimb = prefix ? projectionLimb || {} : projection;
    for (const key of Object.keys(ret)){
        const fullPath = prefix ? prefix + '.' + key : key;
        if (projection.hasOwnProperty(fullPath) || projectionLimb.hasOwnProperty(key)) {
            if (isPOJO(projection[fullPath]) || isPOJO(projectionLimb[key])) {
                ret[key] = applyInclusiveProjection(ret[key], projection, hasIncludedChildren, projectionLimb[key], fullPath);
            }
            continue;
        } else if (hasIncludedChildren[fullPath]) {
            ret[key] = applyInclusiveProjection(ret[key], projection, hasIncludedChildren, projectionLimb[key], fullPath);
        } else {
            delete ret[key];
        }
    }
    return ret;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/isTextIndex.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Returns `true` if the given index options have a `text` option.
 */ module.exports = function isTextIndex(indexKeys) {
    let isTextIndex = false;
    for (const key of Object.keys(indexKeys)){
        if (indexKeys[key] === 'text') {
            isTextIndex = true;
        }
    }
    return isTextIndex;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/applySchemaCollation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const isTextIndex = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/indexes/isTextIndex.js [app-route] (ecmascript)");
module.exports = function applySchemaCollation(indexKeys, indexOptions, schemaOptions) {
    if (isTextIndex(indexKeys)) {
        return;
    }
    if (schemaOptions.hasOwnProperty('collation') && !indexOptions.hasOwnProperty('collation')) {
        indexOptions.collation = schemaOptions.collation;
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/applyStaticHooks.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const promiseOrCallback = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js [app-route] (ecmascript)");
const { queryMiddlewareFunctions, aggregateMiddlewareFunctions, modelMiddlewareFunctions, documentMiddlewareFunctions } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/constants.js [app-route] (ecmascript)");
const middlewareFunctions = Array.from(new Set([
    ...queryMiddlewareFunctions,
    ...aggregateMiddlewareFunctions,
    ...modelMiddlewareFunctions,
    ...documentMiddlewareFunctions
]));
module.exports = function applyStaticHooks(model, hooks, statics) {
    const kareemOptions = {
        useErrorHandlers: true,
        numCallbackParams: 1
    };
    model.$__insertMany = hooks.createWrapper('insertMany', model.$__insertMany, model, kareemOptions);
    hooks = hooks.filter((hook)=>{
        // If the custom static overwrites an existing middleware, don't apply
        // middleware to it by default. This avoids a potential backwards breaking
        // change with plugins like `mongoose-delete` that use statics to overwrite
        // built-in Mongoose functions.
        if (middlewareFunctions.indexOf(hook.name) !== -1) {
            return !!hook.model;
        }
        return hook.model !== false;
    });
    for (const key of Object.keys(statics)){
        if (hooks.hasHooks(key)) {
            const original = model[key];
            model[key] = function() {
                const numArgs = arguments.length;
                const lastArg = numArgs > 0 ? arguments[numArgs - 1] : null;
                const cb = typeof lastArg === 'function' ? lastArg : null;
                const args = Array.prototype.slice.call(arguments, 0, cb == null ? numArgs : numArgs - 1);
                // Special case: can't use `Kareem#wrap()` because it doesn't currently
                // support wrapped functions that return a promise.
                return promiseOrCallback(cb, (callback)=>{
                    hooks.execPre(key, model, args, function(err) {
                        if (err != null) {
                            return callback(err);
                        }
                        let postCalled = 0;
                        const ret = original.apply(model, args.concat(post));
                        if (ret != null && typeof ret.then === 'function') {
                            ret.then((res)=>post(null, res), (err)=>post(err));
                        }
                        function post(error, res) {
                            if (postCalled++ > 0) {
                                return;
                            }
                            if (error != null) {
                                return callback(error);
                            }
                            hooks.execPost(key, model, [
                                res
                            ], function(error) {
                                if (error != null) {
                                    return callback(error);
                                }
                                callback(null, res);
                            });
                        }
                    });
                }, model.events);
            };
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/applyStatics.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Register statics for this model
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */ module.exports = function applyStatics(model, schema) {
    for(const i in schema.statics){
        model[i] = schema.statics[i];
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/applyTimestamps.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const handleTimestampOption = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/handleTimestampOption.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
module.exports = applyTimestamps;
/**
 * Apply a given schema's timestamps to the given POJO
 *
 * @param {Schema} schema
 * @param {Object} obj
 * @param {Object} [options]
 * @param {Boolean} [options.isUpdate=false] if true, treat this as an update: just set updatedAt, skip setting createdAt. If false, set both createdAt and updatedAt
 * @param {Function} [options.currentTime] if set, Mongoose will call this function to get the current time.
 */ function applyTimestamps(schema, obj, options) {
    if (obj == null) {
        return obj;
    }
    applyTimestampsToChildren(schema, obj, options);
    return applyTimestampsToDoc(schema, obj, options);
}
/**
 * Apply timestamps to any subdocuments
 *
 * @param {Schema} schema subdocument schema
 * @param {Object} res subdocument
 * @param {Object} [options]
 * @param {Boolean} [options.isUpdate=false] if true, treat this as an update: just set updatedAt, skip setting createdAt. If false, set both createdAt and updatedAt
 * @param {Function} [options.currentTime] if set, Mongoose will call this function to get the current time.
 */ function applyTimestampsToChildren(schema, res, options) {
    for (const childSchema of schema.childSchemas){
        const _path = childSchema.model.path;
        const _schema = childSchema.schema;
        if (!_path) {
            continue;
        }
        const _obj = mpath.get(_path, res);
        if (_obj == null || Array.isArray(_obj) && _obj.flat(Infinity).length === 0) {
            continue;
        }
        applyTimestamps(_schema, _obj, options);
    }
}
/**
 * Apply timestamps to a given document. Does not apply timestamps to subdocuments: use `applyTimestampsToChildren` instead
 *
 * @param {Schema} schema
 * @param {Object} obj
 * @param {Object} [options]
 * @param {Boolean} [options.isUpdate=false] if true, treat this as an update: just set updatedAt, skip setting createdAt. If false, set both createdAt and updatedAt
 * @param {Function} [options.currentTime] if set, Mongoose will call this function to get the current time.
 */ function applyTimestampsToDoc(schema, obj, options) {
    if (obj == null || typeof obj !== 'object') {
        return;
    }
    if (Array.isArray(obj)) {
        for (const el of obj){
            applyTimestampsToDoc(schema, el, options);
        }
        return;
    }
    if (schema.discriminators && Object.keys(schema.discriminators).length > 0) {
        for (const discriminatorKey of Object.keys(schema.discriminators)){
            const discriminator = schema.discriminators[discriminatorKey];
            const key = discriminator.discriminatorMapping.key;
            const value = discriminator.discriminatorMapping.value;
            if (obj[key] == value) {
                schema = discriminator;
                break;
            }
        }
    }
    const createdAt = handleTimestampOption(schema.options.timestamps, 'createdAt');
    const updatedAt = handleTimestampOption(schema.options.timestamps, 'updatedAt');
    const currentTime = options?.currentTime;
    let ts = null;
    if (currentTime != null) {
        ts = currentTime();
    } else if (schema.base?.now) {
        ts = schema.base.now();
    } else {
        ts = new Date();
    }
    if (createdAt && obj[createdAt] == null && !options?.isUpdate) {
        obj[createdAt] = ts;
    }
    if (updatedAt) {
        obj[updatedAt] = ts;
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/document/applyVirtuals.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
module.exports = applyVirtuals;
/**
 * Apply a given schema's virtuals to a given POJO
 *
 * @param {Schema} schema
 * @param {Object} obj
 * @param {Array<string>} [virtuals] optional whitelist of virtuals to apply
 * @returns
 */ function applyVirtuals(schema, obj, virtuals) {
    if (obj == null) {
        return obj;
    }
    let virtualsForChildren = virtuals;
    let toApply = null;
    if (Array.isArray(virtuals)) {
        virtualsForChildren = [];
        toApply = [];
        for (const virtual of virtuals){
            if (virtual.length === 1) {
                toApply.push(virtual[0]);
            } else {
                virtualsForChildren.push(virtual);
            }
        }
    }
    applyVirtualsToChildren(schema, obj, virtualsForChildren);
    return applyVirtualsToDoc(schema, obj, toApply);
}
/**
 * Apply virtuals to any subdocuments
 *
 * @param {Schema} schema subdocument schema
 * @param {Object} res subdocument
 * @param {Array<String>} [virtuals] optional whitelist of virtuals to apply
 */ function applyVirtualsToChildren(schema, res, virtuals) {
    let attachedVirtuals = false;
    for (const childSchema of schema.childSchemas){
        const _path = childSchema.model.path;
        const _schema = childSchema.schema;
        if (!_path) {
            continue;
        }
        const _obj = mpath.get(_path, res);
        if (_obj == null || Array.isArray(_obj) && _obj.flat(Infinity).length === 0) {
            continue;
        }
        let virtualsForChild = null;
        if (Array.isArray(virtuals)) {
            virtualsForChild = [];
            for (const virtual of virtuals){
                if (virtual[0] == _path) {
                    virtualsForChild.push(virtual.slice(1));
                }
            }
            if (virtualsForChild.length === 0) {
                continue;
            }
        }
        applyVirtuals(_schema, _obj, virtualsForChild);
        attachedVirtuals = true;
    }
    if (virtuals && virtuals.length && !attachedVirtuals) {
        applyVirtualsToDoc(schema, res, virtuals);
    }
}
/**
 * Apply virtuals to a given document. Does not apply virtuals to subdocuments: use `applyVirtualsToChildren` instead
 *
 * @param {Schema} schema
 * @param {Object} doc
 * @param {Array<String>} [virtuals] optional whitelist of virtuals to apply
 * @returns
 */ function applyVirtualsToDoc(schema, obj, virtuals) {
    if (obj == null || typeof obj !== 'object') {
        return;
    }
    if (Array.isArray(obj)) {
        for (const el of obj){
            applyVirtualsToDoc(schema, el, virtuals);
        }
        return;
    }
    if (schema.discriminators && Object.keys(schema.discriminators).length > 0) {
        for (const discriminatorKey of Object.keys(schema.discriminators)){
            const discriminator = schema.discriminators[discriminatorKey];
            const key = discriminator.discriminatorMapping.key;
            const value = discriminator.discriminatorMapping.value;
            if (obj[key] == value) {
                schema = discriminator;
                break;
            }
        }
    }
    if (virtuals == null) {
        virtuals = Object.keys(schema.virtuals);
    }
    for (const virtual of virtuals){
        if (schema.virtuals[virtual] == null) {
            continue;
        }
        const virtualType = schema.virtuals[virtual];
        const sp = Array.isArray(virtual) ? virtual : virtual.indexOf('.') === -1 ? [
            virtual
        ] : virtual.split('.');
        let cur = obj;
        for(let i = 0; i < sp.length - 1; ++i){
            cur[sp[i]] = sp[i] in cur ? cur[sp[i]] : {};
            cur = cur[sp[i]];
        }
        let val = virtualType.applyGetters(cur[sp[sp.length - 1]], obj);
        const isPopulateVirtual = virtualType.options && (virtualType.options.ref || virtualType.options.refPath);
        if (isPopulateVirtual && val === undefined) {
            if (virtualType.options.justOne) {
                val = null;
            } else {
                val = [];
            }
        }
        cur[sp[sp.length - 1]] = val;
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/skipPopulateValue.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function SkipPopulateValue(val) {
    if (!(this instanceof SkipPopulateValue)) {
        return new SkipPopulateValue(val);
    }
    this.val = val;
    return this;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/leanPopulateMap.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = new WeakMap();
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/assignRawDocsToIdStructure.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const leanPopulateMap = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/leanPopulateMap.js [app-route] (ecmascript)");
const modelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").modelSymbol;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
module.exports = assignRawDocsToIdStructure;
const kHasArray = Symbol('mongoose#assignRawDocsToIdStructure#hasArray');
/**
 * Assign `vals` returned by mongo query to the `rawIds`
 * structure returned from utils.getVals() honoring
 * query sort order if specified by user.
 *
 * This can be optimized.
 *
 * Rules:
 *
 *   if the value of the path is not an array, use findOne rules, else find.
 *   for findOne the results are assigned directly to doc path (including null results).
 *   for find, if user specified sort order, results are assigned directly
 *   else documents are put back in original order of array if found in results
 *
 * @param {Array} rawIds
 * @param {Array} resultDocs
 * @param {Array} resultOrder
 * @param {Object} options
 * @param {Boolean} recursed
 * @api private
 */ function assignRawDocsToIdStructure(rawIds, resultDocs, resultOrder, options, recursed) {
    // honor user specified sort order, unless we're populating a single
    // virtual underneath an array (e.g. populating `employees.mostRecentShift` where
    // `mostRecentShift` is a virtual with `justOne`)
    const newOrder = [];
    const sorting = options.isVirtual && options.justOne && rawIds.length > 1 ? false : options.sort && rawIds.length > 1;
    const nullIfNotFound = options.$nullIfNotFound;
    let doc;
    let sid;
    let id;
    if (utils.isMongooseArray(rawIds)) {
        rawIds = rawIds.__array;
    }
    let i = 0;
    const len = rawIds.length;
    if (sorting && recursed && options[kHasArray] === undefined) {
        options[kHasArray] = false;
        for(const key in resultOrder){
            if (Array.isArray(resultOrder[key])) {
                options[kHasArray] = true;
                break;
            }
        }
    }
    for(i = 0; i < len; ++i){
        id = rawIds[i];
        if (Array.isArray(id)) {
            // handle [ [id0, id2], [id3] ]
            assignRawDocsToIdStructure(id, resultDocs, resultOrder, options, true);
            newOrder.push(id);
            continue;
        }
        if (id === null && sorting === false) {
            // keep nulls for findOne unless sorting, which always
            // removes them (backward compat)
            newOrder.push(id);
            continue;
        }
        if (id?.constructor?.name === 'Binary' && id.sub_type === 4 && typeof id.toUUID === 'function') {
            // Workaround for gh-15315 because Mongoose UUIDs don't use BSON UUIDs yet.
            sid = String(id.toUUID());
        } else if (id?.constructor?.name === 'Buffer' && id._subtype === 4 && typeof id.toUUID === 'function') {
            sid = String(id.toUUID());
        } else {
            sid = String(id);
        }
        doc = resultDocs[sid];
        // If user wants separate copies of same doc, use this option
        if (options.clone && doc != null) {
            if (options.lean) {
                const _model = leanPopulateMap.get(doc);
                doc = clone(doc);
                leanPopulateMap.set(doc, _model);
            } else {
                doc = doc.constructor.hydrate(doc._doc);
            }
        }
        if (recursed) {
            if (doc) {
                if (sorting) {
                    const _resultOrder = resultOrder[sid];
                    if (options[kHasArray]) {
                        // If result arrays, rely on the MongoDB server response for ordering
                        newOrder.push(doc);
                    } else {
                        newOrder[_resultOrder] = doc;
                    }
                } else {
                    newOrder.push(doc);
                }
            } else if (id != null && id[modelSymbol] != null) {
                newOrder.push(id);
            } else {
                newOrder.push(options.retainNullValues || nullIfNotFound ? null : id);
            }
        } else {
            // apply findOne behavior - if document in results, assign, else assign null
            newOrder[i] = doc || null;
        }
    }
    rawIds.length = 0;
    if (newOrder.length) {
        // reassign the documents based on corrected order
        // forEach skips over sparse entries in arrays so we
        // can safely use this to our advantage dealing with sorted
        // result sets too.
        newOrder.forEach(function(doc, i) {
            rawIds[i] = doc;
        });
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/getVirtual.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = getVirtual;
/*!
 * ignore
 */ function getVirtual(schema, name) {
    if (schema.virtuals[name]) {
        return {
            virtual: schema.virtuals[name],
            path: void 0
        };
    }
    const parts = name.split('.');
    let cur = '';
    let nestedSchemaPath = '';
    for(let i = 0; i < parts.length; ++i){
        cur += (cur.length > 0 ? '.' : '') + parts[i];
        if (schema.virtuals[cur]) {
            if (i === parts.length - 1) {
                return {
                    virtual: schema.virtuals[cur],
                    path: nestedSchemaPath
                };
            }
            continue;
        }
        if (schema.nested[cur]) {
            continue;
        }
        if (schema.paths[cur] && schema.paths[cur].schema) {
            schema = schema.paths[cur].schema;
            const rest = parts.slice(i + 1).join('.');
            if (schema.virtuals[rest]) {
                if (i === parts.length - 2) {
                    return {
                        virtual: schema.virtuals[rest],
                        nestedSchemaPath: [
                            nestedSchemaPath,
                            cur
                        ].filter((v)=>!!v).join('.')
                    };
                }
                continue;
            }
            if (i + 1 < parts.length && schema.discriminators) {
                for (const key of Object.keys(schema.discriminators)){
                    const res = getVirtual(schema.discriminators[key], rest);
                    if (res != null) {
                        const _path = [
                            nestedSchemaPath,
                            cur,
                            res.nestedSchemaPath
                        ].filter((v)=>!!v).join('.');
                        return {
                            virtual: res.virtual,
                            nestedSchemaPath: _path
                        };
                    }
                }
            }
            nestedSchemaPath += (nestedSchemaPath.length > 0 ? '.' : '') + cur;
            cur = '';
            continue;
        } else if (schema.paths[cur]?.$isSchemaMap && schema.paths[cur].$__schemaType?.schema) {
            schema = schema.paths[cur].$__schemaType.schema;
            ++i;
            const rest = parts.slice(i + 1).join('.');
            if (schema.virtuals[rest]) {
                if (i === parts.length - 2) {
                    return {
                        virtual: schema.virtuals[rest],
                        nestedSchemaPath: [
                            nestedSchemaPath,
                            cur,
                            '$*'
                        ].filter((v)=>!!v).join('.')
                    };
                }
                continue;
            }
            if (i + 1 < parts.length && schema.discriminators) {
                for (const key of Object.keys(schema.discriminators)){
                    const res = getVirtual(schema.discriminators[key], rest);
                    if (res != null) {
                        const _path = [
                            nestedSchemaPath,
                            cur,
                            res.nestedSchemaPath,
                            '$*'
                        ].filter((v)=>!!v).join('.');
                        return {
                            virtual: res.virtual,
                            nestedSchemaPath: _path
                        };
                    }
                }
            }
            nestedSchemaPath += (nestedSchemaPath.length > 0 ? '.' : '') + '$*' + cur;
            cur = '';
        }
        if (schema.discriminators) {
            for (const discriminatorKey of Object.keys(schema.discriminators)){
                const virtualFromDiscriminator = getVirtual(schema.discriminators[discriminatorKey], name);
                if (virtualFromDiscriminator) return virtualFromDiscriminator;
            }
        }
        return null;
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/assignVals.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseMap = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/map.js [app-route] (ecmascript)");
const SkipPopulateValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/skipPopulateValue.js [app-route] (ecmascript)");
const assignRawDocsToIdStructure = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/assignRawDocsToIdStructure.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getVirtual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/getVirtual.js [app-route] (ecmascript)");
const leanPopulateMap = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/leanPopulateMap.js [app-route] (ecmascript)");
const lookupLocalFields = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/lookupLocalFields.js [app-route] (ecmascript)");
const markArraySubdocsPopulated = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/markArraySubdocsPopulated.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const sift = __turbopack_context__.r("[project]/backend/node_modules/sift/es5m/index.js [app-route] (ecmascript)").default;
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const { populateModelSymbol } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)");
module.exports = function assignVals(o) {
    // Options that aren't explicitly listed in `populateOptions`
    const userOptions = Object.assign({}, get(o, 'allOptions.options.options'), get(o, 'allOptions.options'));
    // `o.options` contains options explicitly listed in `populateOptions`, like
    // `match` and `limit`.
    const populateOptions = Object.assign({}, o.options, userOptions, {
        justOne: o.justOne,
        isVirtual: o.isVirtual
    });
    populateOptions.$nullIfNotFound = o.isVirtual;
    const populatedModel = o.populatedModel;
    const originalIds = [].concat(o.rawIds);
    // replace the original ids in our intermediate _ids structure
    // with the documents found by query
    o.allIds = [].concat(o.allIds);
    assignRawDocsToIdStructure(o.rawIds, o.rawDocs, o.rawOrder, populateOptions);
    // now update the original documents being populated using the
    // result structure that contains real documents.
    const docs = o.docs;
    const rawIds = o.rawIds;
    const options = o.options;
    const count = o.count && o.isVirtual;
    let i;
    let setValueIndex = 0;
    function setValue(val) {
        ++setValueIndex;
        if (count) {
            return val;
        }
        if (val instanceof SkipPopulateValue) {
            return val.val;
        }
        if (val === void 0) {
            return val;
        }
        const _allIds = o.allIds[i];
        if (o.path.endsWith('.$*')) {
            // Skip maps re: gh-12494
            return valueFilter(val, options, populateOptions, _allIds);
        }
        if (o.justOne === true && Array.isArray(val)) {
            // Might be an embedded discriminator (re: gh-9244) with multiple models, so make sure to pick the right
            // model before assigning.
            const ret = [];
            for (const doc of val){
                const _docPopulatedModel = leanPopulateMap.get(doc);
                if (_docPopulatedModel == null || _docPopulatedModel === populatedModel) {
                    ret.push(doc);
                }
            }
            // Since we don't want to have to create a new mongoosearray, make sure to
            // modify the array in place
            while(val.length > ret.length){
                Array.prototype.pop.apply(val, []);
            }
            for(let i = 0; i < ret.length; ++i){
                val[i] = ret[i];
            }
            return valueFilter(val[0], options, populateOptions, _allIds);
        } else if (o.justOne === false && !Array.isArray(val)) {
            return valueFilter([
                val
            ], options, populateOptions, _allIds);
        } else if (o.justOne === true && !Array.isArray(val) && Array.isArray(_allIds)) {
            return valueFilter(val, options, populateOptions, val == null ? val : _allIds[setValueIndex - 1]);
        }
        return valueFilter(val, options, populateOptions, _allIds);
    }
    for(i = 0; i < docs.length; ++i){
        setValueIndex = 0;
        const _path = o.path.endsWith('.$*') ? o.path.slice(0, -3) : o.path;
        const existingVal = mpath.get(_path, docs[i], lookupLocalFields);
        if (existingVal == null && !getVirtual(o.originalModel.schema, _path)) {
            continue;
        }
        let valueToSet;
        if (count) {
            valueToSet = numDocs(rawIds[i]);
        } else if (Array.isArray(o.match)) {
            valueToSet = Array.isArray(rawIds[i]) ? rawIds[i].filter((v)=>v == null || sift(o.match[i])(v)) : [
                rawIds[i]
            ].filter((v)=>v == null || sift(o.match[i])(v))[0];
        } else {
            valueToSet = rawIds[i];
        }
        // If we're populating a map, the existing value will be an object, so
        // we need to transform again
        const originalSchema = o.originalModel.schema;
        const isDoc = get(docs[i], '$__', null) != null;
        let isMap = isDoc ? existingVal instanceof Map : utils.isPOJO(existingVal);
        // If we pass the first check, also make sure the local field's schematype
        // is map (re: gh-6460)
        isMap = isMap && get(originalSchema._getSchema(_path), '$isSchemaMap');
        if (!o.isVirtual && isMap) {
            const _keys = existingVal instanceof Map ? Array.from(existingVal.keys()) : Object.keys(existingVal);
            valueToSet = valueToSet.reduce((cur, v, i)=>{
                cur.set(_keys[i], v);
                return cur;
            }, new Map());
        }
        if (isDoc && Array.isArray(valueToSet)) {
            for (const val of valueToSet){
                if (val != null && val.$__ != null) {
                    val.$__.parent = docs[i];
                }
            }
        } else if (isDoc && valueToSet != null && valueToSet.$__ != null) {
            valueToSet.$__.parent = docs[i];
        }
        if (o.isVirtual && isDoc) {
            docs[i].$populated(_path, o.justOne ? originalIds[0] : originalIds, o.allOptions);
            // If virtual populate and doc is already init-ed, need to walk through
            // the actual doc to set rather than setting `_doc` directly
            if (Array.isArray(valueToSet)) {
                valueToSet = valueToSet.map((v)=>v == null ? void 0 : v);
            }
            mpath.set(_path, valueToSet, docs[i], // Handle setting paths underneath maps using $* by converting arrays into maps of values
            function lookup(obj, part, val) {
                if (arguments.length >= 3) {
                    obj[part] = val;
                    return obj[part];
                }
                if (obj instanceof Map && part === '$*') {
                    return [
                        ...obj.values()
                    ];
                }
                return obj[part];
            }, setValue, false);
            continue;
        }
        const parts = _path.split('.');
        let cur = docs[i];
        for(let j = 0; j < parts.length - 1; ++j){
            // If we get to an array with a dotted path, like `arr.foo`, don't set
            // `foo` on the array.
            if (Array.isArray(cur) && !utils.isArrayIndex(parts[j])) {
                break;
            }
            if (parts[j] === '$*') {
                break;
            }
            if (cur[parts[j]] == null) {
                // If nothing to set, avoid creating an unnecessary array. Otherwise
                // we'll end up with a single doc in the array with only defaults.
                // See gh-8342, gh-8455
                const curPath = parts.slice(0, j + 1).join('.');
                const schematype = originalSchema._getSchema(curPath);
                if (valueToSet == null && schematype != null && schematype.$isMongooseArray) {
                    break;
                }
                cur[parts[j]] = {};
            }
            cur = cur[parts[j]];
            // If the property in MongoDB is a primitive, we won't be able to populate
            // the nested path, so skip it. See gh-7545
            if (typeof cur !== 'object') {
                break;
            }
        }
        if (docs[i].$__) {
            o.allOptions.options[populateModelSymbol] = o.allOptions.model;
            docs[i].$populated(_path, o.unpopulatedValues[i], o.allOptions.options);
            if (valueToSet != null && valueToSet.$__ != null) {
                valueToSet.$__.wasPopulated = {
                    value: o.unpopulatedValues[i]
                };
            }
            if (valueToSet instanceof Map && !valueToSet.$isMongooseMap) {
                valueToSet = new MongooseMap(valueToSet, _path, docs[i], docs[i].schema.path(_path).$__schemaType);
            }
        }
        // If lean, need to check that each individual virtual respects
        // `justOne`, because you may have a populated virtual with `justOne`
        // underneath an array. See gh-6867
        mpath.set(_path, valueToSet, docs[i], lookupLocalFields, setValue, false);
        if (docs[i].$__) {
            markArraySubdocsPopulated(docs[i], [
                o.allOptions.options
            ]);
        }
    }
};
function numDocs(v) {
    if (Array.isArray(v)) {
        // If setting underneath an array of populated subdocs, we may have an
        // array of arrays. See gh-7573
        if (v.some((el)=>Array.isArray(el) || el === null)) {
            return v.map((el)=>{
                if (el == null) {
                    return 0;
                }
                if (Array.isArray(el)) {
                    return el.filter((el)=>el != null).length;
                }
                return 1;
            });
        }
        return v.filter((el)=>el != null).length;
    }
    return v == null ? 0 : 1;
}
/**
 * 1) Apply backwards compatible find/findOne behavior to sub documents
 *
 *    find logic:
 *      a) filter out non-documents
 *      b) remove _id from sub docs when user specified
 *
 *    findOne
 *      a) if no doc found, set to null
 *      b) remove _id from sub docs when user specified
 *
 * 2) Remove _ids when specified by users query.
 *
 * background:
 * _ids are left in the query even when user excludes them so
 * that population mapping can occur.
 * @param {Any} val
 * @param {Object} assignmentOpts
 * @param {Object} populateOptions
 * @param {Function} [populateOptions.transform]
 * @param {Boolean} allIds
 * @api private
 */ function valueFilter(val, assignmentOpts, populateOptions, allIds) {
    const userSpecifiedTransform = typeof populateOptions.transform === 'function';
    const transform = userSpecifiedTransform ? populateOptions.transform : (v)=>v;
    if (Array.isArray(val)) {
        // find logic
        const ret = [];
        const numValues = val.length;
        for(let i = 0; i < numValues; ++i){
            let subdoc = val[i];
            const _allIds = Array.isArray(allIds) ? allIds[i] : allIds;
            if (!isPopulatedObject(subdoc) && (!populateOptions.retainNullValues || subdoc != null) && !userSpecifiedTransform) {
                continue;
            } else if (!populateOptions.retainNullValues && subdoc == null) {
                continue;
            } else if (userSpecifiedTransform) {
                subdoc = transform(isPopulatedObject(subdoc) ? subdoc : null, _allIds);
            }
            maybeRemoveId(subdoc, assignmentOpts);
            ret.push(subdoc);
            if (assignmentOpts.originalLimit && ret.length >= assignmentOpts.originalLimit) {
                break;
            }
        }
        const rLen = ret.length;
        // Since we don't want to have to create a new mongoosearray, make sure to
        // modify the array in place
        while(val.length > rLen){
            Array.prototype.pop.apply(val, []);
        }
        let i = 0;
        if (utils.isMongooseArray(val)) {
            for(i = 0; i < rLen; ++i){
                val.set(i, ret[i], true);
            }
        } else {
            for(i = 0; i < rLen; ++i){
                val[i] = ret[i];
            }
        }
        return val;
    }
    // findOne
    if (isPopulatedObject(val) || utils.isPOJO(val)) {
        maybeRemoveId(val, assignmentOpts);
        return transform(val, allIds);
    }
    if (val instanceof Map) {
        return val;
    }
    if (populateOptions.justOne === false) {
        return [];
    }
    return val == null ? transform(val, allIds) : transform(null, allIds);
}
/**
 * Remove _id from `subdoc` if user specified "lean" query option
 * @param {Document} subdoc
 * @param {Object} assignmentOpts
 * @api private
 */ function maybeRemoveId(subdoc, assignmentOpts) {
    if (subdoc != null && assignmentOpts.excludeId) {
        if (typeof subdoc.$__setValue === 'function') {
            delete subdoc._doc._id;
        } else {
            delete subdoc._id;
        }
    }
}
/**
 * Determine if `obj` is something we can set a populated path to. Can be a
 * document, a lean document, or an array/map that contains docs.
 * @param {Any} obj
 * @api private
 */ function isPopulatedObject(obj) {
    if (obj == null) {
        return false;
    }
    return Array.isArray(obj) || obj.$isMongooseMap || obj.$__ != null || leanPopulateMap.has(obj);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/createPopulateQueryFilter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SkipPopulateValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/skipPopulateValue.js [app-route] (ecmascript)");
const parentPaths = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/path/parentPaths.js [app-route] (ecmascript)");
const { trusted } = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/trusted.js [app-route] (ecmascript)");
const hasDollarKeys = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/hasDollarKeys.js [app-route] (ecmascript)");
module.exports = function createPopulateQueryFilter(ids, _match, _foreignField, model, skipInvalidIds) {
    const match = _formatMatch(_match);
    if (_foreignField.size === 1) {
        const foreignField = Array.from(_foreignField)[0];
        const foreignSchemaType = model.schema.path(foreignField);
        if (foreignField !== '_id' || !match['_id']) {
            ids = _filterInvalidIds(ids, foreignSchemaType, skipInvalidIds);
            match[foreignField] = trusted({
                $in: ids
            });
        } else if (foreignField === '_id' && match['_id']) {
            const userSpecifiedMatch = hasDollarKeys(match[foreignField]) ? match[foreignField] : {
                $eq: match[foreignField]
            };
            match[foreignField] = {
                ...trusted({
                    $in: ids
                }),
                ...userSpecifiedMatch
            };
        }
        const _parentPaths = parentPaths(foreignField);
        for(let i = 0; i < _parentPaths.length - 1; ++i){
            const cur = _parentPaths[i];
            if (match[cur] != null && match[cur].$elemMatch != null) {
                match[cur].$elemMatch[foreignField.slice(cur.length + 1)] = trusted({
                    $in: ids
                });
                delete match[foreignField];
                break;
            }
        }
    } else {
        const $or = [];
        if (Array.isArray(match.$or)) {
            match.$and = [
                {
                    $or: match.$or
                },
                {
                    $or: $or
                }
            ];
            delete match.$or;
        } else {
            match.$or = $or;
        }
        for (const foreignField of _foreignField){
            if (foreignField !== '_id' || !match['_id']) {
                const foreignSchemaType = model.schema.path(foreignField);
                ids = _filterInvalidIds(ids, foreignSchemaType, skipInvalidIds);
                $or.push({
                    [foreignField]: {
                        $in: ids
                    }
                });
            } else if (foreignField === '_id' && match['_id']) {
                const userSpecifiedMatch = hasDollarKeys(match[foreignField]) ? match[foreignField] : {
                    $eq: match[foreignField]
                };
                match[foreignField] = {
                    ...trusted({
                        $in: ids
                    }),
                    ...userSpecifiedMatch
                };
            }
        }
    }
    return match;
};
/**
 * Optionally filter out invalid ids that don't conform to foreign field's schema
 * to avoid cast errors (gh-7706)
 * @param {Array} ids
 * @param {SchemaType} foreignSchemaType
 * @param {Boolean} [skipInvalidIds]
 * @api private
 */ function _filterInvalidIds(ids, foreignSchemaType, skipInvalidIds) {
    ids = ids.filter((v)=>!(v instanceof SkipPopulateValue));
    if (!skipInvalidIds) {
        return ids;
    }
    return ids.filter((id)=>{
        try {
            foreignSchemaType.cast(id);
            return true;
        } catch (err) {
            return false;
        }
    });
}
/**
 * Format `mod.match` given that it may be an array that we need to $or if
 * the client has multiple docs with match functions
 * @param {Array|Any} match
 * @api private
 */ function _formatMatch(match) {
    if (Array.isArray(match)) {
        if (match.length > 1) {
            return {
                $or: [].concat(match.map((m)=>Object.assign({}, m)))
            };
        }
        return Object.assign({}, match[0]);
    }
    return Object.assign({}, match);
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/getSchemaTypes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ const Mixed = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/mixed.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const leanPopulateMap = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/leanPopulateMap.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const populateModelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").populateModelSymbol;
/**
 * Given a model and its schema, find all possible schema types for `path`,
 * including searching through discriminators. If `doc` is specified, will
 * use the doc's values for discriminator keys when searching, otherwise
 * will search all discriminators.
 *
 * @param {Model} model
 * @param {Schema} schema
 * @param {Object} doc POJO
 * @param {string} path
 * @api private
 */ module.exports = function getSchemaTypes(model, schema, doc, path) {
    const pathschema = schema.path(path);
    const topLevelDoc = doc;
    if (pathschema) {
        return pathschema;
    }
    const discriminatorKey = schema.discriminatorMapping && schema.discriminatorMapping.key;
    if (discriminatorKey && model != null) {
        if (doc != null && doc[discriminatorKey] != null) {
            const discriminator = getDiscriminatorByValue(model.discriminators, doc[discriminatorKey]);
            schema = discriminator ? discriminator.schema : schema;
        } else if (model.discriminators != null) {
            return Object.keys(model.discriminators).reduce((arr, name)=>{
                const disc = model.discriminators[name];
                return arr.concat(getSchemaTypes(disc, disc.schema, null, path));
            }, []);
        }
    }
    function search(parts, schema, subdoc, nestedPath) {
        let p = parts.length + 1;
        let foundschema;
        let trypath;
        while(p--){
            trypath = parts.slice(0, p).join('.');
            foundschema = schema.path(trypath);
            if (foundschema == null) {
                continue;
            }
            if (foundschema.caster) {
                // array of Mixed?
                if (foundschema.caster instanceof Mixed) {
                    return foundschema.caster;
                }
                let schemas = null;
                if (foundschema.schema != null && foundschema.schema.discriminators != null) {
                    const discriminators = foundschema.schema.discriminators;
                    const discriminatorKeyPath = trypath + '.' + foundschema.schema.options.discriminatorKey;
                    const keys = subdoc ? mpath.get(discriminatorKeyPath, subdoc) || [] : [];
                    schemas = Object.keys(discriminators).reduce(function(cur, discriminator) {
                        const tiedValue = discriminators[discriminator].discriminatorMapping.value;
                        if (doc == null || keys.indexOf(discriminator) !== -1 || keys.indexOf(tiedValue) !== -1) {
                            cur.push(discriminators[discriminator]);
                        }
                        return cur;
                    }, []);
                }
                // Now that we found the array, we need to check if there
                // are remaining document paths to look up for casting.
                // Also we need to handle array.$.path since schema.path
                // doesn't work for that.
                // If there is no foundschema.schema we are dealing with
                // a path like array.$
                if (p !== parts.length && foundschema.schema) {
                    let ret;
                    if (parts[p] === '$') {
                        if (p + 1 === parts.length) {
                            // comments.$
                            return foundschema;
                        }
                        // comments.$.comments.$.title
                        ret = search(parts.slice(p + 1), schema, subdoc ? mpath.get(trypath, subdoc) : null, nestedPath.concat(parts.slice(0, p)));
                        if (ret) {
                            ret.$parentSchemaDocArray = ret.$parentSchemaDocArray || (foundschema.schema.$isSingleNested ? null : foundschema);
                        }
                        return ret;
                    }
                    if (schemas != null && schemas.length > 0) {
                        ret = [];
                        for (const schema of schemas){
                            const _ret = search(parts.slice(p), schema, subdoc ? mpath.get(trypath, subdoc) : null, nestedPath.concat(parts.slice(0, p)));
                            if (_ret != null) {
                                _ret.$parentSchemaDocArray = _ret.$parentSchemaDocArray || (foundschema.schema.$isSingleNested ? null : foundschema);
                                if (_ret.$parentSchemaDocArray) {
                                    ret.$parentSchemaDocArray = _ret.$parentSchemaDocArray;
                                }
                                ret.push(_ret);
                            }
                        }
                        return ret;
                    } else {
                        ret = search(parts.slice(p), foundschema.schema, subdoc ? mpath.get(trypath, subdoc) : null, nestedPath.concat(parts.slice(0, p)));
                        if (ret) {
                            ret.$parentSchemaDocArray = ret.$parentSchemaDocArray || (foundschema.schema.$isSingleNested ? null : foundschema);
                        }
                        return ret;
                    }
                } else if (p !== parts.length && foundschema.$isMongooseArray && foundschema.casterConstructor.$isMongooseArray) {
                    // Nested arrays. Drill down to the bottom of the nested array.
                    let type = foundschema;
                    while(type.$isMongooseArray && !type.$isMongooseDocumentArray){
                        type = type.casterConstructor;
                    }
                    const ret = search(parts.slice(p), type.schema, null, nestedPath.concat(parts.slice(0, p)));
                    if (ret != null) {
                        return ret;
                    }
                    if (type.schema.discriminators) {
                        const discriminatorPaths = [];
                        for (const discriminatorName of Object.keys(type.schema.discriminators)){
                            const _schema = type.schema.discriminators[discriminatorName] || type.schema;
                            const ret = search(parts.slice(p), _schema, null, nestedPath.concat(parts.slice(0, p)));
                            if (ret != null) {
                                discriminatorPaths.push(ret);
                            }
                        }
                        if (discriminatorPaths.length > 0) {
                            return discriminatorPaths;
                        }
                    }
                }
            } else if (foundschema.$isSchemaMap && foundschema.$__schemaType instanceof Mixed) {
                return foundschema.$__schemaType;
            }
            const fullPath = nestedPath.concat([
                trypath
            ]).join('.');
            if (topLevelDoc != null && topLevelDoc.$__ && topLevelDoc.$populated(fullPath, true) && p < parts.length) {
                const model = topLevelDoc.$populated(fullPath, true).options[populateModelSymbol];
                if (model != null) {
                    const ret = search(parts.slice(p), model.schema, subdoc ? mpath.get(trypath, subdoc) : null, nestedPath.concat(parts.slice(0, p)));
                    return ret;
                }
            }
            const _val = get(topLevelDoc, trypath);
            if (_val != null) {
                const model = Array.isArray(_val) && _val.length > 0 ? leanPopulateMap.get(_val[0]) : leanPopulateMap.get(_val);
                // Populated using lean, `leanPopulateMap` value is the foreign model
                const schema = model != null ? model.schema : null;
                if (schema != null) {
                    const ret = search(parts.slice(p), schema, subdoc ? mpath.get(trypath, subdoc) : null, nestedPath.concat(parts.slice(0, p)));
                    if (ret != null) {
                        ret.$parentSchemaDocArray = ret.$parentSchemaDocArray || (schema.$isSingleNested ? null : schema);
                        return ret;
                    }
                }
            }
            return foundschema;
        }
    }
    // look for arrays
    const parts = path.split('.');
    for(let i = 0; i < parts.length; ++i){
        if (parts[i] === '$') {
            // Re: gh-5628, because `schema.path()` doesn't take $ into account.
            parts[i] = '0';
        }
    }
    return search(parts, schema, doc, []);
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/getModelsMapForPopulate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const SkipPopulateValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/skipPopulateValue.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const getSchemaTypes = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/getSchemaTypes.js [app-route] (ecmascript)");
const getVirtual = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/getVirtual.js [app-route] (ecmascript)");
const lookupLocalFields = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/lookupLocalFields.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const modelNamesFromRefPath = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/populate/modelNamesFromRefPath.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const modelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").modelSymbol;
const populateModelSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").populateModelSymbol;
const schemaMixedSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)").schemaMixedSymbol;
const StrictPopulate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/strictPopulate.js [app-route] (ecmascript)");
module.exports = function getModelsMapForPopulate(model, docs, options) {
    let doc;
    const len = docs.length;
    const map = [];
    const modelNameFromQuery = options.model && options.model.modelName || options.model;
    let schema;
    let refPath;
    let modelNames;
    const available = {};
    const modelSchema = model.schema;
    // Populating a nested path should always be a no-op re: #9073.
    // People shouldn't do this, but apparently they do.
    if (options._localModel != null && options._localModel.schema.nested[options.path]) {
        return [];
    }
    const _virtualRes = getVirtual(model.schema, options.path);
    const virtual = _virtualRes == null ? null : _virtualRes.virtual;
    if (virtual != null) {
        return _virtualPopulate(model, docs, options, _virtualRes);
    }
    let allSchemaTypes = getSchemaTypes(model, modelSchema, null, options.path);
    allSchemaTypes = Array.isArray(allSchemaTypes) ? allSchemaTypes : [
        allSchemaTypes
    ].filter((v)=>v != null);
    const isStrictPopulateDisabled = options.strictPopulate === false || options.options?.strictPopulate === false;
    if (!isStrictPopulateDisabled && allSchemaTypes.length === 0 && options._localModel != null) {
        return new StrictPopulate(options._fullPath || options.path);
    }
    for(let i = 0; i < len; i++){
        doc = docs[i];
        let justOne = null;
        if (doc.$__ != null && doc.populated(options.path)) {
            const forceRepopulate = options.forceRepopulate != null ? options.forceRepopulate : doc.constructor.base.options.forceRepopulate;
            if (forceRepopulate === false) {
                continue;
            }
        }
        const docSchema = doc != null && doc.$__ != null ? doc.$__schema : modelSchema;
        schema = getSchemaTypes(model, docSchema, doc, options.path);
        // Special case: populating a path that's a DocumentArray unless
        // there's an explicit `ref` or `refPath` re: gh-8946
        if (schema != null && schema.$isMongooseDocumentArray && schema.options.ref == null && schema.options.refPath == null) {
            continue;
        }
        const isUnderneathDocArray = schema && schema.$parentSchemaDocArray;
        if (isUnderneathDocArray && get(options, 'options.sort') != null) {
            return new MongooseError('Cannot populate with `sort` on path ' + options.path + ' because it is a subproperty of a document array');
        }
        modelNames = null;
        let isRefPath = false;
        let normalizedRefPath = null;
        let schemaOptions = null;
        let modelNamesInOrder = null;
        if (schema != null && schema.instance === 'Embedded') {
            if (schema.options.ref) {
                const data = {
                    localField: options.path + '._id',
                    foreignField: '_id',
                    justOne: true
                };
                const res = _getModelNames(doc, schema, modelNameFromQuery, model);
                const unpopulatedValue = mpath.get(options.path, doc);
                const id = mpath.get('_id', unpopulatedValue);
                addModelNamesToMap(model, map, available, res.modelNames, options, data, id, doc, schemaOptions, unpopulatedValue);
            }
            continue;
        }
        if (Array.isArray(schema)) {
            const schemasArray = schema;
            for (const _schema of schemasArray){
                let _modelNames;
                let res;
                try {
                    res = _getModelNames(doc, _schema, modelNameFromQuery, model);
                    _modelNames = res.modelNames;
                    isRefPath = isRefPath || res.isRefPath;
                    normalizedRefPath = normalizedRefPath || res.refPath;
                    justOne = res.justOne;
                } catch (error) {
                    return error;
                }
                if (isRefPath && !res.isRefPath) {
                    continue;
                }
                if (!_modelNames) {
                    continue;
                }
                modelNames = modelNames || [];
                for (const modelName of _modelNames){
                    if (modelNames.indexOf(modelName) === -1) {
                        modelNames.push(modelName);
                    }
                }
            }
        } else {
            try {
                const res = _getModelNames(doc, schema, modelNameFromQuery, model);
                modelNames = res.modelNames;
                isRefPath = res.isRefPath;
                normalizedRefPath = normalizedRefPath || res.refPath;
                justOne = res.justOne;
                schemaOptions = get(schema, 'options.populate', null);
                // Dedupe, because `refPath` can return duplicates of the same model name,
                // and that causes perf issues.
                if (isRefPath) {
                    modelNamesInOrder = modelNames;
                    modelNames = Array.from(new Set(modelNames));
                }
            } catch (error) {
                return error;
            }
            if (!modelNames) {
                continue;
            }
        }
        const data = {};
        const localField = options.path;
        const foreignField = '_id';
        // `justOne = null` means we don't know from the schema whether the end
        // result should be an array or a single doc. This can result from
        // populating a POJO using `Model.populate()`
        if ('justOne' in options && options.justOne !== void 0) {
            justOne = options.justOne;
        } else if (schema && !schema[schemaMixedSymbol]) {
            // Skip Mixed types because we explicitly don't do casting on those.
            if (options.path.endsWith('.' + schema.path) || options.path === schema.path) {
                justOne = Array.isArray(schema) ? schema.every((schema)=>!schema.$isMongooseArray) : !schema.$isMongooseArray;
            }
        }
        if (!modelNames) {
            continue;
        }
        data.isVirtual = false;
        data.justOne = justOne;
        data.localField = localField;
        data.foreignField = foreignField;
        // Get local fields
        const ret = _getLocalFieldValues(doc, localField, model, options, null, schema);
        const id = String(utils.getValue(foreignField, doc));
        options._docs[id] = Array.isArray(ret) ? ret.slice() : ret;
        let match = get(options, 'match', null);
        const hasMatchFunction = typeof match === 'function';
        if (hasMatchFunction) {
            match = match.call(doc, doc);
        }
        throwOn$where(match);
        data.match = match;
        data.hasMatchFunction = hasMatchFunction;
        data.isRefPath = isRefPath;
        data.modelNamesInOrder = modelNamesInOrder;
        if (isRefPath) {
            const embeddedDiscriminatorModelNames = _findRefPathForDiscriminators(doc, modelSchema, data, options, normalizedRefPath, ret);
            modelNames = embeddedDiscriminatorModelNames || modelNames;
        }
        try {
            addModelNamesToMap(model, map, available, modelNames, options, data, ret, doc, schemaOptions);
        } catch (err) {
            return err;
        }
    }
    return map;
    //TURBOPACK unreachable
    ;
    function _getModelNames(doc, schema, modelNameFromQuery, model) {
        let modelNames;
        let isRefPath = false;
        let justOne = null;
        const originalSchema = schema;
        if (schema && schema.instance === 'Array') {
            schema = schema.caster;
        }
        if (schema && schema.$isSchemaMap) {
            schema = schema.$__schemaType;
        }
        const ref = schema && schema.options && schema.options.ref;
        refPath = schema && schema.options && schema.options.refPath;
        if (schema != null && schema[schemaMixedSymbol] && !ref && !refPath && !modelNameFromQuery) {
            return {
                modelNames: null
            };
        }
        if (modelNameFromQuery) {
            modelNames = [
                modelNameFromQuery
            ]; // query options
        } else if (refPath != null) {
            if (typeof refPath === 'function') {
                const subdocPath = options.path.slice(0, options.path.length - schema.path.length - 1);
                const vals = mpath.get(subdocPath, doc, lookupLocalFields);
                const subdocsBeingPopulated = Array.isArray(vals) ? utils.array.flatten(vals) : vals ? [
                    vals
                ] : [];
                modelNames = new Set();
                for (const subdoc of subdocsBeingPopulated){
                    refPath = refPath.call(subdoc, subdoc, options.path);
                    modelNamesFromRefPath(refPath, doc, options.path, modelSchema, options._queryProjection).forEach((name)=>modelNames.add(name));
                }
                modelNames = Array.from(modelNames);
            } else {
                modelNames = modelNamesFromRefPath(refPath, doc, options.path, modelSchema, options._queryProjection);
            }
            isRefPath = true;
        } else {
            let ref;
            let refPath;
            let schemaForCurrentDoc;
            let discriminatorValue;
            let modelForCurrentDoc = model;
            const discriminatorKey = model.schema.options.discriminatorKey;
            if (!schema && discriminatorKey && (discriminatorValue = utils.getValue(discriminatorKey, doc))) {
                // `modelNameForFind` is the discriminator value, so we might need
                // find the discriminated model name
                const discriminatorModel = getDiscriminatorByValue(model.discriminators, discriminatorValue) || model;
                if (discriminatorModel != null) {
                    modelForCurrentDoc = discriminatorModel;
                } else {
                    try {
                        modelForCurrentDoc = _getModelFromConn(model.db, discriminatorValue);
                    } catch (error) {
                        return error;
                    }
                }
                schemaForCurrentDoc = modelForCurrentDoc.schema._getSchema(options.path);
                if (schemaForCurrentDoc && schemaForCurrentDoc.caster) {
                    schemaForCurrentDoc = schemaForCurrentDoc.caster;
                }
            } else {
                schemaForCurrentDoc = schema;
            }
            if (originalSchema && originalSchema.path.endsWith('.$*')) {
                justOne = !originalSchema.$isMongooseArray && !originalSchema._arrayPath;
            } else if (schemaForCurrentDoc != null) {
                justOne = !schemaForCurrentDoc.$isMongooseArray && !schemaForCurrentDoc._arrayPath;
            }
            if ((ref = get(schemaForCurrentDoc, 'options.ref')) != null) {
                if (schemaForCurrentDoc != null && typeof ref === 'function' && options.path.endsWith('.' + schemaForCurrentDoc.path)) {
                    // Ensure correct context for ref functions: subdoc, not top-level doc. See gh-8469
                    modelNames = new Set();
                    const subdocPath = options.path.slice(0, options.path.length - schemaForCurrentDoc.path.length - 1);
                    const vals = mpath.get(subdocPath, doc, lookupLocalFields);
                    const subdocsBeingPopulated = Array.isArray(vals) ? utils.array.flatten(vals) : vals ? [
                        vals
                    ] : [];
                    for (const subdoc of subdocsBeingPopulated){
                        modelNames.add(handleRefFunction(ref, subdoc));
                    }
                    if (subdocsBeingPopulated.length === 0) {
                        modelNames = [
                            handleRefFunction(ref, doc)
                        ];
                    } else {
                        modelNames = Array.from(modelNames);
                    }
                } else {
                    ref = handleRefFunction(ref, doc);
                    modelNames = [
                        ref
                    ];
                }
            } else if ((schemaForCurrentDoc = get(schema, 'options.refPath')) != null) {
                isRefPath = true;
                if (typeof refPath === 'function') {
                    const subdocPath = options.path.slice(0, options.path.length - schemaForCurrentDoc.path.length - 1);
                    const vals = mpath.get(subdocPath, doc, lookupLocalFields);
                    const subdocsBeingPopulated = Array.isArray(vals) ? utils.array.flatten(vals) : vals ? [
                        vals
                    ] : [];
                    modelNames = new Set();
                    for (const subdoc of subdocsBeingPopulated){
                        refPath = refPath.call(subdoc, subdoc, options.path);
                        modelNamesFromRefPath(refPath, doc, options.path, modelSchema, options._queryProjection).forEach((name)=>modelNames.add(name));
                    }
                    modelNames = Array.from(modelNames);
                } else {
                    modelNames = modelNamesFromRefPath(refPath, doc, options.path, modelSchema, options._queryProjection);
                }
            }
        }
        if (!modelNames) {
            // `Model.populate()` on a POJO with no known local model. Default to using the `Model`
            if (options._localModel == null) {
                modelNames = [
                    model.modelName
                ];
            } else {
                return {
                    modelNames: modelNames,
                    justOne: justOne,
                    isRefPath: isRefPath,
                    refPath: refPath
                };
            }
        }
        if (!Array.isArray(modelNames)) {
            modelNames = [
                modelNames
            ];
        }
        return {
            modelNames: modelNames,
            justOne: justOne,
            isRefPath: isRefPath,
            refPath: refPath
        };
    }
};
/*!
 * ignore
 */ function _virtualPopulate(model, docs, options, _virtualRes) {
    const map = [];
    const available = {};
    const virtual = _virtualRes.virtual;
    for (const doc of docs){
        let modelNames = null;
        const data = {};
        // localField and foreignField
        let localField;
        const virtualPrefix = _virtualRes.nestedSchemaPath ? _virtualRes.nestedSchemaPath + '.' : '';
        if (typeof options.localField === 'string') {
            localField = options.localField;
        } else if (typeof virtual.options.localField === 'function') {
            localField = virtualPrefix + virtual.options.localField.call(doc, doc);
        } else if (Array.isArray(virtual.options.localField)) {
            localField = virtual.options.localField.map((field)=>virtualPrefix + field);
        } else {
            localField = virtualPrefix + virtual.options.localField;
        }
        data.count = virtual.options.count;
        if (virtual.options.skip != null && !options.hasOwnProperty('skip')) {
            options.skip = virtual.options.skip;
        }
        if (virtual.options.limit != null && !options.hasOwnProperty('limit')) {
            options.limit = virtual.options.limit;
        }
        if (virtual.options.perDocumentLimit != null && !options.hasOwnProperty('perDocumentLimit')) {
            options.perDocumentLimit = virtual.options.perDocumentLimit;
        }
        let foreignField = virtual.options.foreignField;
        if (!localField || !foreignField) {
            return new MongooseError(`Cannot populate virtual \`${options.path}\` on model \`${model.modelName}\`, because options \`localField\` and / or \`foreignField\` are missing`);
        }
        if (typeof localField === 'function') {
            localField = localField.call(doc, doc);
        }
        if (typeof foreignField === 'function') {
            foreignField = foreignField.call(doc, doc);
        }
        data.isRefPath = false;
        // `justOne = null` means we don't know from the schema whether the end
        // result should be an array or a single doc. This can result from
        // populating a POJO using `Model.populate()`
        let justOne = null;
        if ('justOne' in options && options.justOne !== void 0) {
            justOne = options.justOne;
        }
        modelNames = virtual._getModelNamesForPopulate(doc);
        if (virtual.options.refPath) {
            justOne = !!virtual.options.justOne;
            data.isRefPath = true;
        } else if (virtual.options.ref) {
            justOne = !!virtual.options.justOne;
        }
        data.isVirtual = true;
        data.virtual = virtual;
        data.justOne = justOne;
        // `match`
        const baseMatch = get(data, 'virtual.options.match', null) || get(data, 'virtual.options.options.match', null);
        let match = get(options, 'match', null) || baseMatch;
        let hasMatchFunction = typeof match === 'function';
        if (hasMatchFunction) {
            match = match.call(doc, doc, data.virtual);
        }
        if (Array.isArray(localField) && Array.isArray(foreignField) && localField.length === foreignField.length) {
            match = Object.assign({}, match);
            for(let i = 1; i < localField.length; ++i){
                match[foreignField[i]] = convertTo_id(mpath.get(localField[i], doc, lookupLocalFields), model.schema);
                hasMatchFunction = true;
            }
            localField = localField[0];
            foreignField = foreignField[0];
        }
        data.localField = localField;
        data.foreignField = foreignField;
        data.match = match;
        data.hasMatchFunction = hasMatchFunction;
        throwOn$where(match);
        // Get local fields
        const ret = _getLocalFieldValues(doc, localField, model, options, virtual);
        try {
            addModelNamesToMap(model, map, available, modelNames, options, data, ret, doc);
        } catch (err) {
            return err;
        }
    }
    return map;
}
/*!
 * ignore
 */ function addModelNamesToMap(model, map, available, modelNames, options, data, ret, doc, schemaOptions, unpopulatedValue) {
    // `PopulateOptions#connection`: if the model is passed as a string, the
    // connection matters because different connections have different models.
    const connection = options.connection != null ? options.connection : model.db;
    unpopulatedValue = unpopulatedValue === void 0 ? ret : unpopulatedValue;
    if (Array.isArray(unpopulatedValue)) {
        unpopulatedValue = utils.cloneArrays(unpopulatedValue);
    }
    if (modelNames == null) {
        return;
    }
    const flatModelNames = utils.array.flatten(modelNames);
    let k = flatModelNames.length;
    while(k--){
        let modelName = flatModelNames[k];
        if (modelName == null) {
            continue;
        }
        let Model;
        if (options.model && options.model[modelSymbol]) {
            Model = options.model;
        } else if (modelName[modelSymbol]) {
            Model = modelName;
            modelName = Model.modelName;
        } else {
            try {
                Model = _getModelFromConn(connection, modelName);
            } catch (err) {
                if (ret !== void 0) {
                    throw err;
                }
                Model = null;
            }
        }
        let ids = ret;
        const modelNamesForRefPath = data.modelNamesInOrder ? data.modelNamesInOrder : modelNames;
        if (data.isRefPath && Array.isArray(ret) && ret.length === modelNamesForRefPath.length) {
            ids = matchIdsToRefPaths(ret, modelNamesForRefPath, modelName);
        }
        const perDocumentLimit = options.perDocumentLimit == null ? get(options, 'options.perDocumentLimit', null) : options.perDocumentLimit;
        if (!available[modelName] || perDocumentLimit != null) {
            const currentOptions = {
                model: Model
            };
            if (data.isVirtual && get(data.virtual, 'options.options')) {
                currentOptions.options = clone(data.virtual.options.options);
            } else if (schemaOptions != null) {
                currentOptions.options = Object.assign({}, schemaOptions);
            }
            utils.merge(currentOptions, options);
            // Used internally for checking what model was used to populate this
            // path.
            options[populateModelSymbol] = Model;
            currentOptions[populateModelSymbol] = Model;
            available[modelName] = {
                model: Model,
                options: currentOptions,
                match: data.hasMatchFunction ? [
                    data.match
                ] : data.match,
                docs: [
                    doc
                ],
                ids: [
                    ids
                ],
                allIds: [
                    ret
                ],
                unpopulatedValues: [
                    unpopulatedValue
                ],
                localField: new Set([
                    data.localField
                ]),
                foreignField: new Set([
                    data.foreignField
                ]),
                justOne: data.justOne,
                isVirtual: data.isVirtual,
                virtual: data.virtual,
                count: data.count,
                [populateModelSymbol]: Model
            };
            map.push(available[modelName]);
        } else {
            available[modelName].localField.add(data.localField);
            available[modelName].foreignField.add(data.foreignField);
            available[modelName].docs.push(doc);
            available[modelName].ids.push(ids);
            available[modelName].allIds.push(ret);
            available[modelName].unpopulatedValues.push(unpopulatedValue);
            if (data.hasMatchFunction) {
                available[modelName].match.push(data.match);
            }
        }
    }
}
function _getModelFromConn(conn, modelName) {
    /* If this connection has a parent from `useDb()`, bubble up to parent's models */ if (conn.models[modelName] == null && conn._parent != null) {
        return _getModelFromConn(conn._parent, modelName);
    }
    return conn.model(modelName);
}
function matchIdsToRefPaths(ids, refPaths, refPathToFind) {
    if (!Array.isArray(refPaths)) {
        return refPaths === refPathToFind ? Array.isArray(ids) ? utils.array.flatten(ids) : [
            ids
        ] : [];
    }
    if (Array.isArray(ids) && Array.isArray(refPaths)) {
        return ids.flatMap((id, index)=>matchIdsToRefPaths(id, refPaths[index], refPathToFind));
    }
    return [];
}
/*!
 * ignore
 */ function handleRefFunction(ref, doc) {
    if (typeof ref === 'function' && !ref[modelSymbol]) {
        return ref.call(doc, doc);
    }
    return ref;
}
/*!
 * ignore
 */ function _getLocalFieldValues(doc, localField, model, options, virtual, schema) {
    // Get Local fields
    const localFieldPathType = model.schema._getPathType(localField);
    const localFieldPath = localFieldPathType === 'real' ? model.schema.path(localField) : localFieldPathType.schema;
    const localFieldGetters = localFieldPath && localFieldPath.getters ? localFieldPath.getters : [];
    localField = localFieldPath != null && localFieldPath.instance === 'Embedded' ? localField + '._id' : localField;
    const _populateOptions = get(options, 'options', {});
    const getters = 'getters' in _populateOptions ? _populateOptions.getters : get(virtual, 'options.getters', false);
    if (localFieldGetters.length !== 0 && getters) {
        const hydratedDoc = doc.$__ != null ? doc : model.hydrate(doc);
        const localFieldValue = utils.getValue(localField, doc);
        if (Array.isArray(localFieldValue)) {
            const localFieldHydratedValue = utils.getValue(localField.split('.').slice(0, -1), hydratedDoc);
            return localFieldValue.map((localFieldArrVal, localFieldArrIndex)=>localFieldPath.applyGetters(localFieldArrVal, localFieldHydratedValue[localFieldArrIndex]));
        } else {
            return localFieldPath.applyGetters(localFieldValue, hydratedDoc);
        }
    } else {
        return convertTo_id(mpath.get(localField, doc, lookupLocalFields), schema);
    }
}
/**
 * Retrieve the _id of `val` if a Document or Array of Documents.
 *
 * @param {Array|Document|Any} val
 * @param {Schema} schema
 * @return {Array|Document|Any}
 * @api private
 */ function convertTo_id(val, schema) {
    if (val != null && val.$__ != null) {
        return val._doc._id;
    }
    if (val != null && val._id != null && (schema == null || !schema.$isSchemaMap)) {
        return val._id;
    }
    if (Array.isArray(val)) {
        const rawVal = val.__array != null ? val.__array : val;
        for(let i = 0; i < rawVal.length; ++i){
            if (rawVal[i] != null && rawVal[i].$__ != null) {
                rawVal[i] = rawVal[i]._doc._id;
            }
        }
        if (utils.isMongooseArray(val) && val.$schema()) {
            return val.$schema()._castForPopulate(val, val.$parent());
        }
        return [].concat(val);
    }
    // `populate('map')` may be an object if populating on a doc that hasn't
    // been hydrated yet
    if (getConstructorName(val) === 'Object' && // The intent here is we should only flatten the object if we expect
    // to get a Map in the end. Avoid doing this for mixed types.
    (schema == null || schema[schemaMixedSymbol] == null)) {
        const ret = [];
        for (const key of Object.keys(val)){
            ret.push(val[key]);
        }
        return ret;
    }
    // If doc has already been hydrated, e.g. `doc.populate('map')`
    // then `val` will already be a map
    if (val instanceof Map) {
        return Array.from(val.values());
    }
    return val;
}
/*!
 * ignore
 */ function _findRefPathForDiscriminators(doc, modelSchema, data, options, normalizedRefPath, ret) {
    // Re: gh-8452. Embedded discriminators may not have `refPath`, so clear
    // out embedded discriminator docs that don't have a `refPath` on the
    // populated path.
    if (!data.isRefPath || normalizedRefPath == null) {
        return;
    }
    const pieces = normalizedRefPath.split('.');
    let cur = '';
    let modelNames = void 0;
    for(let i = 0; i < pieces.length; ++i){
        const piece = pieces[i];
        cur = cur + (cur.length === 0 ? '' : '.') + piece;
        const schematype = modelSchema.path(cur);
        if (schematype != null && schematype.$isMongooseArray && schematype.caster.discriminators != null && Object.keys(schematype.caster.discriminators).length !== 0) {
            const subdocs = utils.getValue(cur, doc);
            const remnant = options.path.substring(cur.length + 1);
            const discriminatorKey = schematype.caster.schema.options.discriminatorKey;
            modelNames = [];
            for (const subdoc of subdocs){
                const discriminatorName = utils.getValue(discriminatorKey, subdoc);
                const discriminator = schematype.caster.discriminators[discriminatorName];
                const discriminatorSchema = discriminator && discriminator.schema;
                if (discriminatorSchema == null) {
                    continue;
                }
                const _path = discriminatorSchema.path(remnant);
                if (_path == null || _path.options.refPath == null) {
                    const docValue = utils.getValue(data.localField.substring(cur.length + 1), subdoc);
                    ret.forEach((v, i)=>{
                        if (v === docValue) {
                            ret[i] = SkipPopulateValue(v);
                        }
                    });
                    continue;
                }
                const modelName = utils.getValue(pieces.slice(i + 1).join('.'), subdoc);
                modelNames.push(modelName);
            }
        }
    }
    return modelNames;
}
/**
 * Throw an error if there are any $where keys
 */ function throwOn$where(match) {
    if (match == null) {
        return;
    }
    if (typeof match !== 'object') {
        return;
    }
    for (const key of Object.keys(match)){
        if (key === '$where') {
            throw new MongooseError('Cannot use $where filter with populate() match');
        }
        if (match[key] != null && typeof match[key] === 'object') {
            throwOn$where(match[key]);
        }
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/isDefaultIdIndex.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
module.exports = function isDefaultIdIndex(index) {
    if (Array.isArray(index)) {
        // Mongoose syntax
        const keys = Object.keys(index[0]);
        return keys.length === 1 && keys[0] === '_id' && index[0]._id !== 'hashed';
    }
    if (typeof index !== 'object') {
        return false;
    }
    const key = get(index, 'key', {});
    return Object.keys(key).length === 1 && key.hasOwnProperty('_id');
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/isIndexEqual.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/**
 * Given a Mongoose index definition (key + options objects) and a MongoDB server
 * index definition, determine if the two indexes are equal.
 *
 * @param {Object} schemaIndexKeysObject the Mongoose index spec
 * @param {Object} options the Mongoose index definition's options
 * @param {Object} dbIndex the index in MongoDB as returned by `listIndexes()`
 * @api private
 */ module.exports = function isIndexEqual(schemaIndexKeysObject, options, dbIndex) {
    // Special case: text indexes have a special format in the db. For example,
    // `{ name: 'text' }` becomes:
    // {
    //   v: 2,
    //   key: { _fts: 'text', _ftsx: 1 },
    //   name: 'name_text',
    //   ns: 'test.tests',
    //   background: true,
    //   weights: { name: 1 },
    //   default_language: 'english',
    //   language_override: 'language',
    //   textIndexVersion: 3
    // }
    if (dbIndex.textIndexVersion != null) {
        delete dbIndex.key._fts;
        delete dbIndex.key._ftsx;
        const weights = {
            ...dbIndex.weights,
            ...dbIndex.key
        };
        if (Object.keys(weights).length !== Object.keys(schemaIndexKeysObject).length) {
            return false;
        }
        for (const prop of Object.keys(weights)){
            if (!(prop in schemaIndexKeysObject)) {
                return false;
            }
            const weight = weights[prop];
            if (weight !== get(options, 'weights.' + prop) && !(weight === 1 && get(options, 'weights.' + prop) == null)) {
                return false;
            }
        }
        if (options['default_language'] !== dbIndex['default_language']) {
            return dbIndex['default_language'] === 'english' && options['default_language'] == null;
        }
        return true;
    }
    const optionKeys = [
        'unique',
        'partialFilterExpression',
        'sparse',
        'expireAfterSeconds',
        'collation'
    ];
    for (const key of optionKeys){
        if (!(key in options) && !(key in dbIndex)) {
            continue;
        }
        if (key === 'collation') {
            if (options[key] == null || dbIndex[key] == null) {
                return options[key] == null && dbIndex[key] == null;
            }
            const definedKeys = Object.keys(options.collation);
            const schemaCollation = options.collation;
            const dbCollation = dbIndex.collation;
            for (const opt of definedKeys){
                if (get(schemaCollation, opt) !== get(dbCollation, opt)) {
                    return false;
                }
            }
        } else if (!utils.deepEqual(options[key], dbIndex[key])) {
            return false;
        }
    }
    const schemaIndexKeys = Object.keys(schemaIndexKeysObject);
    const dbIndexKeys = Object.keys(dbIndex.key);
    if (schemaIndexKeys.length !== dbIndexKeys.length) {
        return false;
    }
    for(let i = 0; i < schemaIndexKeys.length; ++i){
        if (schemaIndexKeys[i] !== dbIndexKeys[i]) {
            return false;
        }
        if (!utils.deepEqual(schemaIndexKeysObject[schemaIndexKeys[i]], dbIndex.key[dbIndexKeys[i]])) {
            return false;
        }
    }
    return true;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/isTimeseriesIndex.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Returns `true` if the given index matches the schema's `timestamps` options
 */ module.exports = function isTimeseriesIndex(dbIndex, schemaOptions) {
    if (schemaOptions.timeseries == null) {
        return false;
    }
    const { timeField, metaField } = schemaOptions.timeseries;
    if (typeof timeField !== 'string' || typeof metaField !== 'string') {
        return false;
    }
    return Object.keys(dbIndex.key).length === 2 && dbIndex.key[timeField] === 1 && dbIndex.key[metaField] === 1;
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/indexes/getRelatedIndexes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const hasDollarKeys = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/hasDollarKeys.js [app-route] (ecmascript)");
function getRelatedSchemaIndexes(model, schemaIndexes) {
    return getRelatedIndexes({
        baseModelName: model.baseModelName,
        discriminatorMapping: model.schema.discriminatorMapping,
        indexes: schemaIndexes,
        indexesType: 'schema'
    });
}
function getRelatedDBIndexes(model, dbIndexes) {
    return getRelatedIndexes({
        baseModelName: model.baseModelName,
        discriminatorMapping: model.schema.discriminatorMapping,
        indexes: dbIndexes,
        indexesType: 'db'
    });
}
module.exports = {
    getRelatedSchemaIndexes,
    getRelatedDBIndexes
};
function getRelatedIndexes({ baseModelName, discriminatorMapping, indexes, indexesType }) {
    const discriminatorKey = discriminatorMapping && discriminatorMapping.key;
    const discriminatorValue = discriminatorMapping && discriminatorMapping.value;
    if (!discriminatorKey) {
        return indexes;
    }
    const isChildDiscriminatorModel = Boolean(baseModelName);
    if (isChildDiscriminatorModel) {
        return indexes.filter((index)=>{
            const partialFilterExpression = getPartialFilterExpression(index, indexesType);
            return partialFilterExpression && partialFilterExpression[discriminatorKey] === discriminatorValue;
        });
    }
    return indexes.filter((index)=>{
        const partialFilterExpression = getPartialFilterExpression(index, indexesType);
        return !partialFilterExpression || !partialFilterExpression[discriminatorKey] || hasDollarKeys(partialFilterExpression[discriminatorKey]) && !('$eq' in partialFilterExpression[discriminatorKey]);
    });
}
function getPartialFilterExpression(index, indexesType) {
    if (indexesType === 'schema') {
        const options = index[1];
        return options && options.partialFilterExpression;
    }
    return index.partialFilterExpression;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/parallelLimit.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = parallelLimit;
/*!
 * ignore
 */ function parallelLimit(fns, limit, callback) {
    let numInProgress = 0;
    let numFinished = 0;
    let error = null;
    if (limit <= 0) {
        throw new Error('Limit must be positive');
    }
    if (fns.length === 0) {
        return callback(null, []);
    }
    for(let i = 0; i < fns.length && i < limit; ++i){
        _start();
    }
    function _start() {
        fns[numFinished + numInProgress](_done(numFinished + numInProgress));
        ++numInProgress;
    }
    const results = [];
    function _done(index) {
        return (err, res)=>{
            --numInProgress;
            ++numFinished;
            if (error != null) {
                return;
            }
            if (err != null) {
                error = err;
                return callback(error);
            }
            results[index] = res;
            if (numFinished === fns.length) {
                return callback(null, results);
            } else if (numFinished + numInProgress < fns.length) {
                _start();
            }
        };
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/model/pushNestedArrayPaths.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function pushNestedArrayPaths(paths, nestedArray, path) {
    if (nestedArray == null) {
        return;
    }
    for(let i = 0; i < nestedArray.length; ++i){
        if (Array.isArray(nestedArray[i])) {
            pushNestedArrayPaths(paths, nestedArray[i], path + '.' + i);
        } else {
            paths.push(path + '.' + i);
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/populate/removeDeselectedForeignField.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const get = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/get.js [app-route] (ecmascript)");
const mpath = __turbopack_context__.r("[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)");
const parseProjection = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/parseProjection.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function removeDeselectedForeignField(foreignFields, options, docs) {
    const projection = parseProjection(get(options, 'select', null), true) || parseProjection(get(options, 'options.select', null), true);
    if (projection == null) {
        return;
    }
    for (const foreignField of foreignFields){
        if (!projection.hasOwnProperty('-' + foreignField)) {
            continue;
        }
        for (const val of docs){
            if (val.$__ != null) {
                mpath.unset(foreignField, val._doc);
            } else {
                mpath.unset(foreignField, val);
            }
        }
    }
};
}),
"[project]/backend/node_modules/mongoose/lib/helpers/pluralize.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = pluralize;
/**
 * Pluralization rules.
 */ exports.pluralization = [
    [
        /human$/gi,
        'humans'
    ],
    [
        /(m)an$/gi,
        '$1en'
    ],
    [
        /(pe)rson$/gi,
        '$1ople'
    ],
    [
        /(child)$/gi,
        '$1ren'
    ],
    [
        /^(ox)$/gi,
        '$1en'
    ],
    [
        /(ax|test)is$/gi,
        '$1es'
    ],
    [
        /(octop|vir)us$/gi,
        '$1i'
    ],
    [
        /(alias|status)$/gi,
        '$1es'
    ],
    [
        /(bu)s$/gi,
        '$1ses'
    ],
    [
        /(buffal|tomat|potat)o$/gi,
        '$1oes'
    ],
    [
        /([ti])um$/gi,
        '$1a'
    ],
    [
        /sis$/gi,
        'ses'
    ],
    [
        /(?:([^f])fe|([lr])f)$/gi,
        '$1$2ves'
    ],
    [
        /(hive)$/gi,
        '$1s'
    ],
    [
        /([^aeiouy]|qu)y$/gi,
        '$1ies'
    ],
    [
        /(x|ch|ss|sh)$/gi,
        '$1es'
    ],
    [
        /(matr|vert|ind)ix|ex$/gi,
        '$1ices'
    ],
    [
        /([m|l])ouse$/gi,
        '$1ice'
    ],
    [
        /(kn|w|l)ife$/gi,
        '$1ives'
    ],
    [
        /(quiz)$/gi,
        '$1zes'
    ],
    [
        /^goose$/i,
        'geese'
    ],
    [
        /s$/gi,
        's'
    ],
    [
        /([^a-z])$/,
        '$1'
    ],
    [
        /$/gi,
        's'
    ]
];
const rules = exports.pluralization;
/**
 * Uncountable words.
 *
 * These words are applied while processing the argument to `toCollectionName`.
 * @api public
 */ exports.uncountables = [
    'advice',
    'energy',
    'excretion',
    'digestion',
    'cooperation',
    'health',
    'justice',
    'labour',
    'machinery',
    'equipment',
    'information',
    'pollution',
    'sewage',
    'paper',
    'money',
    'species',
    'series',
    'rain',
    'rice',
    'fish',
    'sheep',
    'moose',
    'deer',
    'news',
    'expertise',
    'status',
    'media'
];
const uncountables = exports.uncountables;
/**
 * Pluralize function.
 *
 * @author TJ Holowaychuk (extracted from _ext.js_)
 * @param {String} string to pluralize
 * @api private
 */ function pluralize(str) {
    let found;
    str = str.toLowerCase();
    if (!~uncountables.indexOf(str)) {
        found = rules.filter(function(rule) {
            return str.match(rule[0]);
        });
        if (found[0]) {
            return str.replace(found[0][0], found[0][1]);
        }
    }
    return str;
}
}),
"[project]/backend/node_modules/mongoose/lib/helpers/printJestWarning.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
if (typeof jest !== 'undefined' && !process.env.SUPPRESS_JEST_WARNINGS) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (setTimeout.clock != null && typeof setTimeout.clock.Date === 'function') {
        utils.warn('Mongoose: looks like you\'re trying to test a Mongoose app ' + 'with Jest\'s mock timers enabled. Please make sure you read ' + 'Mongoose\'s docs on configuring Jest to test Node.js apps: ' + 'https://mongoosejs.com/docs/jest.html. Set the SUPPRESS_JEST_WARNINGS to true ' + 'to hide this warning.');
    }
}
}),
];

//# sourceMappingURL=6d019_mongoose_lib_helpers_345e7195._.js.map