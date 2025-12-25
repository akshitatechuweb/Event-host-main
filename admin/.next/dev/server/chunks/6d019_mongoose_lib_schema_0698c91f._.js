module.exports = [
"[project]/backend/node_modules/mongoose/lib/schema/operators/exists.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const castBoolean = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/boolean.js [app-route] (ecmascript)");
/*!
 * ignore
 */ module.exports = function(val) {
    const path = this != null ? this.path : null;
    return castBoolean(val, path);
};
}),
"[project]/backend/node_modules/mongoose/lib/schema/operators/type.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ module.exports = function(val) {
    if (Array.isArray(val)) {
        if (!val.every((v)=>typeof v === 'number' || typeof v === 'string')) {
            throw new Error('$type array values must be strings or numbers');
        }
        return val;
    }
    if (typeof val !== 'number' && typeof val !== 'string') {
        throw new Error('$type parameter must be number, string, or array of numbers and strings');
    }
    return val;
};
}),
"[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.schemaMixedSymbol = Symbol.for('mongoose:schema_mixed');
exports.builtInMiddleware = Symbol.for('mongoose:built-in-middleware');
}),
"[project]/backend/node_modules/mongoose/lib/schema/mixed.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const symbols = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/symbols.js [app-route] (ecmascript)");
const isObject = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isObject.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
/**
 * Mixed SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} _schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaMixed(path, options, _schemaOptions, parentSchema) {
    if (options && options.default) {
        const def = options.default;
        if (Array.isArray(def) && def.length === 0) {
            // make sure empty array defaults are handled
            options.default = Array;
        } else if (!options.shared && isObject(def) && Object.keys(def).length === 0) {
            // prevent odd "shared" objects between documents
            options.default = function() {
                return {};
            };
        }
    }
    SchemaType.call(this, path, options, 'Mixed', parentSchema);
    this[symbols.schemaMixedSymbol] = true;
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaMixed.schemaName = 'Mixed';
SchemaMixed.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaMixed.prototype = Object.create(SchemaType.prototype);
SchemaMixed.prototype.constructor = SchemaMixed;
/**
 * Attaches a getter for all Mixed paths.
 *
 * #### Example:
 *
 *     // Hide the 'hidden' path
 *     mongoose.Schema.Mixed.get(v => Object.assign({}, v, { hidden: null }));
 *
 *     const Model = mongoose.model('Test', new Schema({ test: {} }));
 *     new Model({ test: { hidden: 'Secret!' } }).test.hidden; // null
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaMixed.get = SchemaType.get;
/**
 * Sets a default option for all Mixed instances.
 *
 * #### Example:
 *
 *     // Make all mixed instances have `required` of true by default.
 *     mongoose.Schema.Mixed.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: mongoose.Mixed }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaMixed.set = SchemaType.set;
SchemaMixed.setters = [];
/**
 * Casts `val` for Mixed.
 *
 * _this is a no-op_
 *
 * @param {Object} value to cast
 * @api private
 */ SchemaMixed.prototype.cast = function(val) {
    if (val instanceof Error) {
        return utils.errorToPOJO(val);
    }
    return val;
};
/**
 * Casts contents for queries.
 *
 * @param {String} $cond
 * @param {any} [val]
 * @api private
 */ SchemaMixed.prototype.castForQuery = function($cond, val) {
    return val;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ // eslint-disable-next-line no-unused-vars
SchemaMixed.prototype.toJSONSchema = function toJSONSchema(_options) {
    return {};
};
/*!
 * Module exports.
 */ module.exports = SchemaMixed;
}),
"[project]/backend/node_modules/mongoose/lib/schema/operators/text.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const castBoolean = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/boolean.js [app-route] (ecmascript)");
const castString = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/string.js [app-route] (ecmascript)");
/**
 * Casts val to an object suitable for `$text`. Throws an error if the object
 * can't be casted.
 *
 * @param {Any} val value to cast
 * @param {String} [path] path to associate with any errors that occured
 * @return {Object} casted object
 * @see https://www.mongodb.com/docs/manual/reference/operator/query/text/
 * @api private
 */ module.exports = function castTextSearch(val, path) {
    if (val == null || typeof val !== 'object') {
        throw new CastError('$text', val, path);
    }
    if (val.$search != null) {
        val.$search = castString(val.$search, path + '.$search');
    }
    if (val.$language != null) {
        val.$language = castString(val.$language, path + '.$language');
    }
    if (val.$caseSensitive != null) {
        val.$caseSensitive = castBoolean(val.$caseSensitive, path + '.$castSensitive');
    }
    if (val.$diacriticSensitive != null) {
        val.$diacriticSensitive = castBoolean(val.$diacriticSensitive, path + '.$diacriticSensitive');
    }
    return val;
};
}),
"[project]/backend/node_modules/mongoose/lib/schema/operators/bitwise.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
/*!
 * ignore
 */ function handleBitwiseOperator(val) {
    const _this = this;
    if (Array.isArray(val)) {
        return val.map(function(v) {
            return _castNumber(_this.path, v);
        });
    } else if (Buffer.isBuffer(val)) {
        return val;
    }
    // Assume trying to cast to number
    return _castNumber(_this.path, val);
}
/*!
 * ignore
 */ function _castNumber(path, num) {
    const v = Number(num);
    if (isNaN(v)) {
        throw new CastError('number', num, path);
    }
    return v;
}
module.exports = handleBitwiseOperator;
}),
"[project]/backend/node_modules/mongoose/lib/schema/number.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const SchemaNumberOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaNumberOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/number.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const handleBitwiseOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/bitwise.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
/**
 * Number SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaNumber(key, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, key, options, 'Number', parentSchema);
}
/**
 * Attaches a getter for all Number instances.
 *
 * #### Example:
 *
 *     // Make all numbers round down
 *     mongoose.Number.get(function(v) { return Math.floor(v); });
 *
 *     const Model = mongoose.model('Test', new Schema({ test: Number }));
 *     new Model({ test: 3.14 }).test; // 3
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaNumber.get = SchemaType.get;
/**
 * Sets a default option for all Number instances.
 *
 * #### Example:
 *
 *     // Make all numbers have option `min` equal to 0.
 *     mongoose.Schema.Number.set('min', 0);
 *
 *     const Order = mongoose.model('Order', new Schema({ amount: Number }));
 *     new Order({ amount: -10 }).validateSync().errors.amount.message; // Path `amount` must be larger than 0.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaNumber.set = SchemaType.set;
SchemaNumber.setters = [];
/*!
 * ignore
 */ SchemaNumber._cast = castNumber;
/**
 * Get/set the function used to cast arbitrary values to numbers.
 *
 * #### Example:
 *
 *     // Make Mongoose cast empty strings '' to 0 for paths declared as numbers
 *     const original = mongoose.Number.cast();
 *     mongoose.Number.cast(v => {
 *       if (v === '') { return 0; }
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Number.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaNumber.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaNumber._defaultCaster = (v)=>{
    if (typeof v !== 'number') {
        throw new Error();
    }
    return v;
};
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaNumber.schemaName = 'Number';
SchemaNumber.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaNumber.prototype = Object.create(SchemaType.prototype);
SchemaNumber.prototype.constructor = SchemaNumber;
SchemaNumber.prototype.OptionsConstructor = SchemaNumberOptions;
/*!
 * ignore
 */ SchemaNumber._checkRequired = (v)=>typeof v === 'number' || v instanceof Number;
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaNumber.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaNumber.prototype.checkRequired = function checkRequired(value, doc) {
    if (typeof value === 'object' && SchemaType._isRef(this, value, doc, true)) {
        return value != null;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaNumber.checkRequired();
    return _checkRequired(value);
};
/**
 * Sets a minimum number validator.
 *
 * #### Example:
 *
 *     const s = new Schema({ n: { type: Number, min: 10 })
 *     const M = db.model('M', s)
 *     const m = new M({ n: 9 })
 *     m.save(function (err) {
 *       console.error(err) // validator error
 *       m.n = 10;
 *       m.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MIN} token which will be replaced with the invalid value
 *     const min = [10, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];
 *     const schema = new Schema({ n: { type: Number, min: min })
 *     const M = mongoose.model('Measurement', schema);
 *     const s= new M({ n: 4 });
 *     s.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `n` (4) is beneath the limit (10).
 *     })
 *
 * @param {Number} value minimum number
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaNumber.prototype.min = function(value, message) {
    if (this.minValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.minValidator;
        }, this);
    }
    if (value !== null && value !== undefined) {
        let msg = message || MongooseError.messages.Number.min;
        msg = msg.replace(/{MIN}/, value);
        this.validators.push({
            validator: this.minValidator = function(v) {
                return v == null || v >= value;
            },
            message: msg,
            type: 'min',
            min: value
        });
    }
    return this;
};
/**
 * Sets a maximum number validator.
 *
 * #### Example:
 *
 *     const s = new Schema({ n: { type: Number, max: 10 })
 *     const M = db.model('M', s)
 *     const m = new M({ n: 11 })
 *     m.save(function (err) {
 *       console.error(err) // validator error
 *       m.n = 10;
 *       m.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MAX} token which will be replaced with the invalid value
 *     const max = [10, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'];
 *     const schema = new Schema({ n: { type: Number, max: max })
 *     const M = mongoose.model('Measurement', schema);
 *     const s= new M({ n: 4 });
 *     s.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `n` (4) exceeds the limit (10).
 *     })
 *
 * @param {Number} maximum number
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaNumber.prototype.max = function(value, message) {
    if (this.maxValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.maxValidator;
        }, this);
    }
    if (value !== null && value !== undefined) {
        let msg = message || MongooseError.messages.Number.max;
        msg = msg.replace(/{MAX}/, value);
        this.validators.push({
            validator: this.maxValidator = function(v) {
                return v == null || v <= value;
            },
            message: msg,
            type: 'max',
            max: value
        });
    }
    return this;
};
/**
 * Sets a enum validator
 *
 * #### Example:
 *
 *     const s = new Schema({ n: { type: Number, enum: [1, 2, 3] });
 *     const M = db.model('M', s);
 *
 *     const m = new M({ n: 4 });
 *     await m.save(); // throws validation error
 *
 *     m.n = 3;
 *     await m.save(); // succeeds
 *
 * @param {Array} values allowed values
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaNumber.prototype.enum = function(values, message) {
    if (this.enumValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.enumValidator;
        }, this);
    }
    if (!Array.isArray(values)) {
        const isObjectSyntax = utils.isPOJO(values) && values.values != null;
        if (isObjectSyntax) {
            message = values.message;
            values = values.values;
        } else if (typeof values === 'number') {
            values = Array.prototype.slice.call(arguments);
            message = null;
        }
        if (utils.isPOJO(values)) {
            values = Object.values(values);
        }
        message = message || MongooseError.messages.Number.enum;
    }
    message = message == null ? MongooseError.messages.Number.enum : message;
    this.enumValidator = (v)=>v == null || values.indexOf(v) !== -1;
    this.validators.push({
        validator: this.enumValidator,
        message: message,
        type: 'enum',
        enumValues: values
    });
    return this;
};
/**
 * Casts to number
 *
 * @param {Object} value value to cast
 * @param {Document} doc document that triggers the casting
 * @param {Boolean} init
 * @api private
 */ SchemaNumber.prototype.cast = function(value, doc, init, prev, options) {
    if (typeof value !== 'number' && SchemaType._isRef(this, value, doc, init)) {
        if (value == null || utils.isNonBuiltinObject(value)) {
            return this._castRef(value, doc, init, options);
        }
    }
    const val = value && typeof value._id !== 'undefined' ? value._id : value;
    let castNumber;
    if (typeof this._castFunction === 'function') {
        castNumber = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castNumber = this.constructor.cast();
    } else {
        castNumber = SchemaNumber.cast();
    }
    try {
        return castNumber(val);
    } catch (err) {
        throw new CastError('Number', val, this.path, err, this);
    }
};
/*!
 * ignore
 */ function handleSingle(val) {
    return this.cast(val);
}
function handleArray(val) {
    const _this = this;
    if (!Array.isArray(val)) {
        return [
            this.cast(val)
        ];
    }
    return val.map(function(m) {
        return _this.cast(m);
    });
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $bitsAllClear: handleBitwiseOperator,
    $bitsAnyClear: handleBitwiseOperator,
    $bitsAllSet: handleBitwiseOperator,
    $bitsAnySet: handleBitwiseOperator,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle,
    $mod: handleArray
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$gte` is the function Mongoose calls to cast `$gte` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaNumber
 * @instance
 * @api public
 */ Object.defineProperty(SchemaNumber.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} [value]
 * @api private
 */ SchemaNumber.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new CastError('number', val, this.path, null, this);
        }
        return handler.call(this, val, context);
    }
    try {
        val = this.applySetters(val, context);
    } catch (err) {
        if (err instanceof CastError && err.path === this.path && this.$fullPath != null) {
            err.path = this.$fullPath;
        }
        throw err;
    }
    return val;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaNumber.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function' || this.path === '_id';
    return createJSONSchemaTypeDefinition('number', 'number', options?.useBsonType, isRequired);
};
/*!
 * Module exports.
 */ module.exports = SchemaNumber;
}),
"[project]/backend/node_modules/mongoose/lib/schema/operators/helpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements.
 */ const SchemaNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/number.js [app-route] (ecmascript)");
/*!
 * ignore
 */ exports.castToNumber = castToNumber;
exports.castArraysOfNumbers = castArraysOfNumbers;
/*!
 * ignore
 */ function castToNumber(val) {
    return SchemaNumber.cast()(val);
}
function castArraysOfNumbers(arr, self) {
    arr.forEach(function(v, i) {
        if (Array.isArray(v)) {
            castArraysOfNumbers(v, self);
        } else {
            arr[i] = castToNumber.call(self, v);
        }
    });
}
}),
"[project]/backend/node_modules/mongoose/lib/schema/operators/geospatial.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements.
 */ const castArraysOfNumbers = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/helpers.js [app-route] (ecmascript)").castArraysOfNumbers;
const castToNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/helpers.js [app-route] (ecmascript)").castToNumber;
/*!
 * ignore
 */ exports.cast$geoIntersects = cast$geoIntersects;
exports.cast$near = cast$near;
exports.cast$within = cast$within;
function cast$near(val) {
    const SchemaArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/array.js [app-route] (ecmascript)");
    if (Array.isArray(val)) {
        castArraysOfNumbers(val, this);
        return val;
    }
    _castMinMaxDistance(this, val);
    if (val && val.$geometry) {
        return cast$geometry(val, this);
    }
    if (!Array.isArray(val)) {
        throw new TypeError('$near must be either an array or an object ' + 'with a $geometry property');
    }
    return SchemaArray.prototype.castForQuery.call(this, null, val);
}
function cast$geometry(val, self) {
    switch(val.$geometry.type){
        case 'Polygon':
        case 'LineString':
        case 'Point':
            castArraysOfNumbers(val.$geometry.coordinates, self);
            break;
        default:
            break;
    }
    _castMinMaxDistance(self, val);
    return val;
}
function cast$within(val) {
    _castMinMaxDistance(this, val);
    if (val.$box || val.$polygon) {
        const type = val.$box ? '$box' : '$polygon';
        val[type].forEach((arr)=>{
            if (!Array.isArray(arr)) {
                const msg = 'Invalid $within $box argument. ' + 'Expected an array, received ' + arr;
                throw new TypeError(msg);
            }
            arr.forEach((v, i)=>{
                arr[i] = castToNumber.call(this, v);
            });
        });
    } else if (val.$center || val.$centerSphere) {
        const type = val.$center ? '$center' : '$centerSphere';
        val[type].forEach((item, i)=>{
            if (Array.isArray(item)) {
                item.forEach((v, j)=>{
                    item[j] = castToNumber.call(this, v);
                });
            } else {
                val[type][i] = castToNumber.call(this, item);
            }
        });
    } else if (val.$geometry) {
        cast$geometry(val, this);
    }
    return val;
}
function cast$geoIntersects(val) {
    const geo = val.$geometry;
    if (!geo) {
        return;
    }
    cast$geometry(val, this);
    return val;
}
function _castMinMaxDistance(self, val) {
    if (val.$maxDistance) {
        val.$maxDistance = castToNumber.call(self, val.$maxDistance);
    }
    if (val.$minDistance) {
        val.$minDistance = castToNumber.call(self, val.$minDistance);
    }
}
}),
"[project]/backend/node_modules/mongoose/lib/schema/array.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const $exists = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/exists.js [app-route] (ecmascript)");
const $type = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/type.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const SchemaArrayOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaArrayOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
const Mixed = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/mixed.js [app-route] (ecmascript)");
const VirtualOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/virtualOptions.js [app-route] (ecmascript)");
const VirtualType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/virtualType.js [app-route] (ecmascript)");
const arrayDepth = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/arrayDepth.js [app-route] (ecmascript)");
const cast = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)");
const clone = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/clone.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const isOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/isOperator.js [app-route] (ecmascript)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const castToNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/helpers.js [app-route] (ecmascript)").castToNumber;
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const geospatial = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/geospatial.js [app-route] (ecmascript)");
const getDiscriminatorByValue = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js [app-route] (ecmascript)");
let MongooseArray;
let EmbeddedDoc;
const isNestedArraySymbol = Symbol('mongoose#isNestedArray');
const emptyOpts = Object.freeze({});
/**
 * Array SchemaType constructor
 *
 * @param {String} key
 * @param {SchemaType} cast
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaArray(key, cast, options, schemaOptions, parentSchema) {
    // lazy load
    EmbeddedDoc || (EmbeddedDoc = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)").Embedded);
    let typeKey = 'type';
    if (schemaOptions && schemaOptions.typeKey) {
        typeKey = schemaOptions.typeKey;
    }
    this.schemaOptions = schemaOptions;
    if (cast) {
        let castOptions = {};
        if (utils.isPOJO(cast)) {
            if (cast[typeKey]) {
                // support { type: Woot }
                castOptions = clone(cast); // do not alter user arguments
                delete castOptions[typeKey];
                cast = cast[typeKey];
            } else {
                cast = Mixed;
            }
        }
        if (options != null && options.ref != null && castOptions.ref == null) {
            castOptions.ref = options.ref;
        }
        if (cast === Object) {
            cast = Mixed;
        }
        // support { type: 'String' }
        const name = typeof cast === 'string' ? cast : utils.getFunctionName(cast);
        const Types = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/index.js [app-route] (ecmascript)");
        const caster = Types.hasOwnProperty(name) ? Types[name] : cast;
        this.casterConstructor = caster;
        if (this.casterConstructor instanceof SchemaArray) {
            this.casterConstructor[isNestedArraySymbol] = true;
        }
        if (typeof caster === 'function' && !caster.$isArraySubdocument && !caster.$isSchemaMap) {
            const path = this.caster instanceof EmbeddedDoc ? null : key;
            if (caster === SchemaArray) {
                this.caster = new caster(path, castOptions, schemaOptions, null, parentSchema);
            } else {
                this.caster = new caster(path, castOptions, schemaOptions, parentSchema);
            }
        } else {
            this.caster = caster;
            if (!(this.caster instanceof EmbeddedDoc)) {
                this.caster.path = key;
            }
        }
        this.$embeddedSchemaType = this.caster;
    }
    this.$isMongooseArray = true;
    SchemaType.call(this, key, options, 'Array', parentSchema);
    let defaultArr;
    let fn;
    if (this.defaultValue != null) {
        defaultArr = this.defaultValue;
        fn = typeof defaultArr === 'function';
    }
    if (!('defaultValue' in this) || this.defaultValue != null) {
        const defaultFn = function() {
            // Leave it up to `cast()` to convert the array
            return fn ? defaultArr.call(this) : defaultArr != null ? [].concat(defaultArr) : [];
        };
        defaultFn.$runBeforeSetters = !fn;
        this.default(defaultFn);
    }
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaArray.schemaName = 'Array';
/**
 * Options for all arrays.
 *
 * - `castNonArrays`: `true` by default. If `false`, Mongoose will throw a CastError when a value isn't an array. If `true`, Mongoose will wrap the provided value in an array before casting.
 *
 * @static
 * @api public
 */ SchemaArray.options = {
    castNonArrays: true
};
/*!
 * ignore
 */ SchemaArray.defaultOptions = {};
/**
 * Sets a default option for all Array instances.
 *
 * #### Example:
 *
 *     // Make all Array instances have `required` of true by default.
 *     mongoose.Schema.Array.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: Array }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @api public
 */ SchemaArray.set = SchemaType.set;
SchemaArray.setters = [];
/**
 * Attaches a getter for all Array instances
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaArray.get = SchemaType.get;
/*!
 * Inherits from SchemaType.
 */ SchemaArray.prototype = Object.create(SchemaType.prototype);
SchemaArray.prototype.constructor = SchemaArray;
SchemaArray.prototype.OptionsConstructor = SchemaArrayOptions;
/*!
 * ignore
 */ SchemaArray._checkRequired = SchemaType.prototype.checkRequired;
/**
 * Override the function the required validator uses to check whether an array
 * passes the `required` check.
 *
 * #### Example:
 *
 *     // Require non-empty array to pass `required` check
 *     mongoose.Schema.Types.Array.checkRequired(v => Array.isArray(v) && v.length);
 *
 *     const M = mongoose.model({ arr: { type: Array, required: true } });
 *     new M({ arr: [] }).validateSync(); // `null`, validation fails!
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @api public
 */ SchemaArray.checkRequired = SchemaType.checkRequired;
/*!
 * Virtuals defined on this array itself.
 */ SchemaArray.prototype.virtuals = null;
/**
 * Check if the given value satisfies the `required` validator.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaArray.prototype.checkRequired = function checkRequired(value, doc) {
    if (typeof value === 'object' && SchemaType._isRef(this, value, doc, true)) {
        return !!value;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaArray.checkRequired();
    return _checkRequired(value);
};
/**
 * Adds an enum validator if this is an array of strings or numbers. Equivalent to
 * `SchemaString.prototype.enum()` or `SchemaNumber.prototype.enum()`
 *
 * @param {...String|Object} [args] enumeration values
 * @return {SchemaArray} this
 */ SchemaArray.prototype.enum = function() {
    let arr = this;
    while(true){
        const instance = arr && arr.caster && arr.caster.instance;
        if (instance === 'Array') {
            arr = arr.caster;
            continue;
        }
        if (instance !== 'String' && instance !== 'Number') {
            throw new Error('`enum` can only be set on an array of strings or numbers ' + ', not ' + instance);
        }
        break;
    }
    let enumArray = arguments;
    if (!Array.isArray(arguments) && utils.isObject(arguments)) {
        enumArray = utils.object.vals(enumArray);
    }
    arr.caster.enum.apply(arr.caster, enumArray);
    return this;
};
/**
 * Overrides the getters application for the population special-case
 *
 * @param {Object} value
 * @param {Object} scope
 * @api private
 */ SchemaArray.prototype.applyGetters = function(value, scope) {
    if (scope != null && scope.$__ != null && scope.$populated(this.path)) {
        // means the object id was populated
        return value;
    }
    const ret = SchemaType.prototype.applyGetters.call(this, value, scope);
    return ret;
};
SchemaArray.prototype._applySetters = function(value, scope, init, priorVal) {
    if (this.casterConstructor.$isMongooseArray && SchemaArray.options.castNonArrays && !this[isNestedArraySymbol]) {
        // Check nesting levels and wrap in array if necessary
        let depth = 0;
        let arr = this;
        while(arr != null && arr.$isMongooseArray && !arr.$isMongooseDocumentArray){
            ++depth;
            arr = arr.casterConstructor;
        }
        // No need to wrap empty arrays
        if (value != null && value.length !== 0) {
            const valueDepth = arrayDepth(value);
            if (valueDepth.min === valueDepth.max && valueDepth.max < depth && valueDepth.containsNonArrayItem) {
                for(let i = valueDepth.max; i < depth; ++i){
                    value = [
                        value
                    ];
                }
            }
        }
    }
    return SchemaType.prototype._applySetters.call(this, value, scope, init, priorVal);
};
/**
 * Casts values for set().
 *
 * @param {Object} value
 * @param {Document} doc document that triggers the casting
 * @param {Boolean} init whether this is an initialization cast
 * @api private
 */ SchemaArray.prototype.cast = function(value, doc, init, prev, options) {
    // lazy load
    MongooseArray || (MongooseArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)").Array);
    let i;
    let l;
    if (Array.isArray(value)) {
        const len = value.length;
        if (!len && doc) {
            const indexes = doc.schema.indexedPaths();
            const arrayPath = this.path;
            for(i = 0, l = indexes.length; i < l; ++i){
                const pathIndex = indexes[i][0][arrayPath];
                if (pathIndex === '2dsphere' || pathIndex === '2d') {
                    return;
                }
            }
            // Special case: if this index is on the parent of what looks like
            // GeoJSON, skip setting the default to empty array re: #1668, #3233
            const arrayGeojsonPath = this.path.endsWith('.coordinates') ? this.path.substring(0, this.path.lastIndexOf('.')) : null;
            if (arrayGeojsonPath != null) {
                for(i = 0, l = indexes.length; i < l; ++i){
                    const pathIndex = indexes[i][0][arrayGeojsonPath];
                    if (pathIndex === '2dsphere') {
                        return;
                    }
                }
            }
        }
        options = options || emptyOpts;
        let rawValue = utils.isMongooseArray(value) ? value.__array : value;
        let path = options.path || this.path;
        if (options.arrayPathIndex != null) {
            path += '.' + options.arrayPathIndex;
        }
        value = MongooseArray(rawValue, path, doc, this);
        rawValue = value.__array;
        if (init && doc != null && doc.$__ != null && doc.$populated(this.path)) {
            return value;
        }
        const caster = this.caster;
        const isMongooseArray = caster.$isMongooseArray;
        if (caster && this.casterConstructor !== Mixed) {
            try {
                const len = rawValue.length;
                for(i = 0; i < len; i++){
                    const opts = {};
                    // Perf: creating `arrayPath` is expensive for large arrays.
                    // We only need `arrayPath` if this is a nested array, so
                    // skip if possible.
                    if (isMongooseArray) {
                        if (options.arrayPath != null) {
                            opts.arrayPathIndex = i;
                        } else if (caster._arrayParentPath != null) {
                            opts.arrayPathIndex = i;
                        }
                    }
                    if (options.hydratedPopulatedDocs) {
                        opts.hydratedPopulatedDocs = options.hydratedPopulatedDocs;
                    }
                    rawValue[i] = caster.applySetters(rawValue[i], doc, init, void 0, opts);
                }
            } catch (e) {
                // rethrow
                throw new CastError('[' + e.kind + ']', util.inspect(value), this.path + '.' + i, e, this);
            }
        }
        return value;
    }
    const castNonArraysOption = this.options.castNonArrays != null ? this.options.castNonArrays : SchemaArray.options.castNonArrays;
    if (init || castNonArraysOption) {
        // gh-2442: if we're loading this from the db and its not an array, mark
        // the whole array as modified.
        if (!!doc && !!init) {
            doc.markModified(this.path);
        }
        return this.cast([
            value
        ], doc, init);
    }
    throw new CastError('Array', util.inspect(value), this.path, null, this);
};
/*!
 * ignore
 */ SchemaArray.prototype._castForPopulate = function _castForPopulate(value, doc) {
    // lazy load
    MongooseArray || (MongooseArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/index.js [app-route] (ecmascript)").Array);
    if (Array.isArray(value)) {
        let i;
        const rawValue = value.__array ? value.__array : value;
        const len = rawValue.length;
        const caster = this.caster;
        if (caster && this.casterConstructor !== Mixed) {
            try {
                for(i = 0; i < len; i++){
                    const opts = {};
                    // Perf: creating `arrayPath` is expensive for large arrays.
                    // We only need `arrayPath` if this is a nested array, so
                    // skip if possible.
                    if (caster.$isMongooseArray && caster._arrayParentPath != null) {
                        opts.arrayPathIndex = i;
                    }
                    rawValue[i] = caster.cast(rawValue[i], doc, false, void 0, opts);
                }
            } catch (e) {
                // rethrow
                throw new CastError('[' + e.kind + ']', util.inspect(value), this.path + '.' + i, e, this);
            }
        }
        return value;
    }
    throw new CastError('Array', util.inspect(value), this.path, null, this);
};
SchemaArray.prototype.$toObject = SchemaArray.prototype.toObject;
/*!
 * ignore
 */ SchemaArray.prototype.discriminator = function(...args) {
    let arr = this;
    while(arr.$isMongooseArray && !arr.$isMongooseDocumentArray){
        arr = arr.casterConstructor;
        if (arr == null || typeof arr === 'function') {
            throw new MongooseError('You can only add an embedded discriminator on ' + 'a document array, ' + this.path + ' is a plain array');
        }
    }
    return arr.discriminator(...args);
};
/*!
 * ignore
 */ SchemaArray.prototype.clone = function() {
    const options = Object.assign({}, this.options);
    const schematype = new this.constructor(this.path, this.caster, options, this.schemaOptions, this.parentSchema);
    schematype.validators = this.validators.slice();
    if (this.requiredValidator !== undefined) {
        schematype.requiredValidator = this.requiredValidator;
    }
    return schematype;
};
SchemaArray.prototype._castForQuery = function(val, context) {
    let Constructor = this.casterConstructor;
    if (val && Constructor.discriminators && Constructor.schema && Constructor.schema.options && Constructor.schema.options.discriminatorKey) {
        if (typeof val[Constructor.schema.options.discriminatorKey] === 'string' && Constructor.discriminators[val[Constructor.schema.options.discriminatorKey]]) {
            Constructor = Constructor.discriminators[val[Constructor.schema.options.discriminatorKey]];
        } else {
            const constructorByValue = getDiscriminatorByValue(Constructor.discriminators, val[Constructor.schema.options.discriminatorKey]);
            if (constructorByValue) {
                Constructor = constructorByValue;
            }
        }
    }
    const proto = this.casterConstructor.prototype;
    const protoCastForQuery = proto && proto.castForQuery;
    const protoCast = proto && proto.cast;
    const constructorCastForQuery = Constructor.castForQuery;
    const caster = this.caster;
    if (Array.isArray(val)) {
        this.setters.reverse().forEach((setter)=>{
            val = setter.call(this, val, this);
        });
        val = val.map(function(v) {
            if (utils.isObject(v) && v.$elemMatch) {
                return v;
            }
            if (protoCastForQuery) {
                v = protoCastForQuery.call(caster, null, v, context);
                return v;
            } else if (protoCast) {
                v = protoCast.call(caster, v);
                return v;
            } else if (constructorCastForQuery) {
                v = constructorCastForQuery.call(caster, null, v, context);
                return v;
            }
            if (v != null) {
                v = new Constructor(v);
                return v;
            }
            return v;
        });
    } else if (protoCastForQuery) {
        val = protoCastForQuery.call(caster, null, val, context);
    } else if (protoCast) {
        val = protoCast.call(caster, val);
    } else if (constructorCastForQuery) {
        val = constructorCastForQuery.call(caster, null, val, context);
    } else if (val != null) {
        val = new Constructor(val);
    }
    return val;
};
/**
 * Casts values for queries.
 *
 * @param {String} $conditional
 * @param {any} [value]
 * @api private
 */ SchemaArray.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new Error('Can\'t use ' + $conditional + ' with Array.');
        }
        return handler.call(this, val, context);
    } else {
        return this._castForQuery(val, context);
    }
};
/**
 * Add a virtual to this array. Specifically to this array, not the individual elements.
 *
 * @param {String} name
 * @param {Object} [options]
 * @api private
 */ SchemaArray.prototype.virtual = function virtual(name, options) {
    if (name instanceof VirtualType || getConstructorName(name) === 'VirtualType') {
        return this.virtual(name.path, name.options);
    }
    options = new VirtualOptions(options);
    if (utils.hasUserDefinedProperty(options, [
        'ref',
        'refPath'
    ])) {
        throw new MongooseError('Cannot set populate virtual as a property of an array');
    }
    const virtual = new VirtualType(options, name);
    if (this.virtuals === null) {
        this.virtuals = {};
    }
    this.virtuals[name] = virtual;
    return virtual;
};
function cast$all(val, context) {
    if (!Array.isArray(val)) {
        val = [
            val
        ];
    }
    val = val.map((v)=>{
        if (!utils.isObject(v)) {
            return v;
        }
        if (v.$elemMatch != null) {
            return {
                $elemMatch: cast(this.casterConstructor.schema, v.$elemMatch, null, this && this.$$context)
            };
        }
        const o = {};
        o[this.path] = v;
        return cast(this.casterConstructor.schema, o, null, this && this.$$context)[this.path];
    }, this);
    return this.castForQuery(null, val, context);
}
function cast$elemMatch(val, context) {
    const keys = Object.keys(val);
    const numKeys = keys.length;
    for(let i = 0; i < numKeys; ++i){
        const key = keys[i];
        const value = val[key];
        if (isOperator(key) && value != null) {
            val[key] = this.castForQuery(key, value, context);
        }
    }
    return val;
}
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$all` is the function Mongoose calls to cast `$all` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaArray
 * @instance
 * @api public
 */ const handle = SchemaArray.prototype.$conditionalHandlers = {};
handle.$all = cast$all;
handle.$options = String;
handle.$elemMatch = cast$elemMatch;
handle.$geoIntersects = geospatial.cast$geoIntersects;
handle.$or = createLogicalQueryOperatorHandler('$or');
handle.$and = createLogicalQueryOperatorHandler('$and');
handle.$nor = createLogicalQueryOperatorHandler('$nor');
function createLogicalQueryOperatorHandler(op) {
    return function logicalQueryOperatorHandler(val, context) {
        if (!Array.isArray(val)) {
            throw new TypeError('conditional ' + op + ' requires an array');
        }
        const ret = [];
        for (const obj of val){
            ret.push(cast(this.casterConstructor.schema ?? context.schema, obj, null, this && this.$$context));
        }
        return ret;
    };
}
handle.$near = handle.$nearSphere = geospatial.cast$near;
handle.$within = handle.$geoWithin = geospatial.cast$within;
handle.$size = handle.$minDistance = handle.$maxDistance = castToNumber;
handle.$exists = $exists;
handle.$type = $type;
handle.$eq = handle.$gt = handle.$gte = handle.$lt = handle.$lte = handle.$not = handle.$regex = handle.$ne = SchemaArray.prototype._castForQuery;
// `$in` is special because you can also include an empty array in the query
// like `$in: [1, []]`, see gh-5913
handle.$nin = SchemaType.prototype.$conditionalHandlers.$nin;
handle.$in = SchemaType.prototype.$conditionalHandlers.$in;
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaArray.prototype.toJSONSchema = function toJSONSchema(options) {
    const embeddedSchemaType = this.getEmbeddedSchemaType();
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return {
        ...createJSONSchemaTypeDefinition('array', 'array', options?.useBsonType, isRequired),
        items: embeddedSchemaType.toJSONSchema(options)
    };
};
SchemaArray.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'array';
};
/*!
 * Module exports.
 */ module.exports = SchemaArray;
}),
"[project]/backend/node_modules/mongoose/lib/schema/bigint.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castBigInt = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/bigint.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
/**
 * BigInt SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaBigInt(path, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, path, options, 'BigInt', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaBigInt.schemaName = 'BigInt';
SchemaBigInt.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaBigInt.prototype = Object.create(SchemaType.prototype);
SchemaBigInt.prototype.constructor = SchemaBigInt;
/*!
 * ignore
 */ SchemaBigInt._cast = castBigInt;
/**
 * Sets a default option for all BigInt instances.
 *
 * #### Example:
 *
 *     // Make all bigints required by default
 *     mongoose.Schema.BigInt.set('required', true);
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaBigInt.set = SchemaType.set;
SchemaBigInt.setters = [];
/**
 * Attaches a getter for all BigInt instances
 *
 * #### Example:
 *
 *     // Convert bigints to numbers
 *     mongoose.Schema.BigInt.get(v => v == null ? v : Number(v));
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaBigInt.get = SchemaType.get;
/**
 * Get/set the function used to cast arbitrary values to bigints.
 *
 * #### Example:
 *
 *     // Make Mongoose cast empty string '' to false.
 *     const original = mongoose.Schema.Types.BigInt.cast();
 *     mongoose.Schema.BigInt.cast(v => {
 *       if (v === '') {
 *         return false;
 *       }
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Schema.BigInt.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaBigInt.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaBigInt._checkRequired = (v)=>v != null;
/**
 * Override the function the required validator uses to check whether a value
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaBigInt.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @return {Boolean}
 * @api public
 */ SchemaBigInt.prototype.checkRequired = function(value) {
    return this.constructor._checkRequired(value);
};
/**
 * Casts to bigint
 *
 * @param {Object} value
 * @param {Object} model this value is optional
 * @api private
 */ SchemaBigInt.prototype.cast = function(value) {
    let castBigInt;
    if (typeof this._castFunction === 'function') {
        castBigInt = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castBigInt = this.constructor.cast();
    } else {
        castBigInt = SchemaBigInt.cast();
    }
    try {
        return castBigInt(value);
    } catch (error) {
        throw new CastError('BigInt', value, this.path, error, this);
    }
};
/*!
 * ignore
 */ const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$in` is the function Mongoose calls to cast `$in` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaBigInt
 * @instance
 * @api public
 */ Object.defineProperty(SchemaBigInt.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/*!
 * ignore
 */ function handleSingle(val, context) {
    return this.castForQuery(null, val, context);
}
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} val
 * @api private
 */ SchemaBigInt.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (handler) {
            return handler.call(this, val);
        }
        return this.applySetters(val, context);
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
 *
 * @api private
 */ SchemaBigInt.prototype._castNullish = function _castNullish(v) {
    if (typeof v === 'undefined') {
        return v;
    }
    const castBigInt = typeof this.constructor.cast === 'function' ? this.constructor.cast() : SchemaBigInt.cast();
    if (castBigInt == null) {
        return v;
    }
    return v;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaBigInt.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'long', options?.useBsonType, isRequired);
};
SchemaBigInt.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'long';
};
/*!
 * Module exports.
 */ module.exports = SchemaBigInt;
}),
"[project]/backend/node_modules/mongoose/lib/schema/boolean.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castBoolean = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/boolean.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
/**
 * Boolean SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaBoolean(path, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, path, options, 'Boolean', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaBoolean.schemaName = 'Boolean';
SchemaBoolean.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaBoolean.prototype = Object.create(SchemaType.prototype);
SchemaBoolean.prototype.constructor = SchemaBoolean;
/*!
 * ignore
 */ SchemaBoolean._cast = castBoolean;
/**
 * Sets a default option for all Boolean instances.
 *
 * #### Example:
 *
 *     // Make all booleans have `default` of false.
 *     mongoose.Schema.Boolean.set('default', false);
 *
 *     const Order = mongoose.model('Order', new Schema({ isPaid: Boolean }));
 *     new Order({ }).isPaid; // false
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaBoolean.set = SchemaType.set;
SchemaBoolean.setters = [];
/**
 * Attaches a getter for all Boolean instances
 *
 * #### Example:
 *
 *     mongoose.Schema.Boolean.get(v => v === true ? 'yes' : 'no');
 *
 *     const Order = mongoose.model('Order', new Schema({ isPaid: Boolean }));
 *     new Order({ isPaid: false }).isPaid; // 'no'
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaBoolean.get = SchemaType.get;
/**
 * Get/set the function used to cast arbitrary values to booleans.
 *
 * #### Example:
 *
 *     // Make Mongoose cast empty string '' to false.
 *     const original = mongoose.Schema.Boolean.cast();
 *     mongoose.Schema.Boolean.cast(v => {
 *       if (v === '') {
 *         return false;
 *       }
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Schema.Boolean.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaBoolean.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaBoolean._defaultCaster = (v)=>{
    if (v != null && typeof v !== 'boolean') {
        throw new Error();
    }
    return v;
};
/*!
 * ignore
 */ SchemaBoolean._checkRequired = (v)=>v === true || v === false;
/**
 * Override the function the required validator uses to check whether a boolean
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaBoolean.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator. For a boolean
 * to satisfy a required validator, it must be strictly equal to true or to
 * false.
 *
 * @param {Any} value
 * @return {Boolean}
 * @api public
 */ SchemaBoolean.prototype.checkRequired = function(value) {
    return this.constructor._checkRequired(value);
};
/**
 * Configure which values get casted to `true`.
 *
 * #### Example:
 *
 *     const M = mongoose.model('Test', new Schema({ b: Boolean }));
 *     new M({ b: 'affirmative' }).b; // undefined
 *     mongoose.Schema.Boolean.convertToTrue.add('affirmative');
 *     new M({ b: 'affirmative' }).b; // true
 *
 * @property convertToTrue
 * @static
 * @memberOf SchemaBoolean
 * @type {Set}
 * @api public
 */ Object.defineProperty(SchemaBoolean, 'convertToTrue', {
    get: ()=>castBoolean.convertToTrue,
    set: (v)=>{
        castBoolean.convertToTrue = v;
    }
});
/**
 * Configure which values get casted to `false`.
 *
 * #### Example:
 *
 *     const M = mongoose.model('Test', new Schema({ b: Boolean }));
 *     new M({ b: 'nay' }).b; // undefined
 *     mongoose.Schema.Types.Boolean.convertToFalse.add('nay');
 *     new M({ b: 'nay' }).b; // false
 *
 * @property convertToFalse
 * @static
 * @memberOf SchemaBoolean
 * @type {Set}
 * @api public
 */ Object.defineProperty(SchemaBoolean, 'convertToFalse', {
    get: ()=>castBoolean.convertToFalse,
    set: (v)=>{
        castBoolean.convertToFalse = v;
    }
});
/**
 * Casts to boolean
 *
 * @param {Object} value
 * @param {Object} model this value is optional
 * @api private
 */ SchemaBoolean.prototype.cast = function(value) {
    let castBoolean;
    if (typeof this._castFunction === 'function') {
        castBoolean = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castBoolean = this.constructor.cast();
    } else {
        castBoolean = SchemaBoolean.cast();
    }
    try {
        return castBoolean(value);
    } catch (error) {
        throw new CastError('Boolean', value, this.path, error, this);
    }
};
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$in` is the function Mongoose calls to cast `$in` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaBoolean
 * @instance
 * @api public
 */ Object.defineProperty(SchemaBoolean.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} val
 * @api private
 */ SchemaBoolean.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (handler) {
            return handler.call(this, val);
        }
        return this.applySetters(val, context);
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
 *
 * @api private
 */ SchemaBoolean.prototype._castNullish = function _castNullish(v) {
    if (typeof v === 'undefined') {
        return v;
    }
    const castBoolean = typeof this.constructor.cast === 'function' ? this.constructor.cast() : SchemaBoolean.cast();
    if (castBoolean == null) {
        return v;
    }
    if (castBoolean.convertToFalse instanceof Set && castBoolean.convertToFalse.has(v)) {
        return false;
    }
    if (castBoolean.convertToTrue instanceof Set && castBoolean.convertToTrue.has(v)) {
        return true;
    }
    return v;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaBoolean.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('boolean', 'bool', options?.useBsonType, isRequired);
};
SchemaBoolean.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'bool';
};
/*!
 * Module exports.
 */ module.exports = SchemaBoolean;
}),
"[project]/backend/node_modules/mongoose/lib/schema/buffer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseBuffer = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/buffer.js [app-route] (ecmascript)");
const SchemaBufferOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaBufferOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const handleBitwiseOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/bitwise.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const Binary = MongooseBuffer.Binary;
const CastError = SchemaType.CastError;
/**
 * Buffer SchemaType constructor
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaBuffer(key, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, key, options, 'Buffer', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaBuffer.schemaName = 'Buffer';
SchemaBuffer.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaBuffer.prototype = Object.create(SchemaType.prototype);
SchemaBuffer.prototype.constructor = SchemaBuffer;
SchemaBuffer.prototype.OptionsConstructor = SchemaBufferOptions;
/*!
 * ignore
 */ SchemaBuffer._checkRequired = (v)=>!!(v && v.length);
/**
 * Sets a default option for all Buffer instances.
 *
 * #### Example:
 *
 *     // Make all buffers have `required` of true by default.
 *     mongoose.Schema.Buffer.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: Buffer }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaBuffer.set = SchemaType.set;
SchemaBuffer.setters = [];
/**
 * Attaches a getter for all Buffer instances
 *
 * #### Example:
 *
 *     // Always convert to string when getting an ObjectId
 *     mongoose.Schema.Types.Buffer.get(v => v.toString('hex'));
 *
 *     const Model = mongoose.model('Test', new Schema({ buf: Buffer } }));
 *     typeof (new Model({ buf: Buffer.fromString('hello') }).buf); // 'string'
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaBuffer.get = SchemaType.get;
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * #### Example:
 *
 *     // Allow empty strings to pass `required` check
 *     mongoose.Schema.Types.String.checkRequired(v => v != null);
 *
 *     const M = mongoose.model({ buf: { type: Buffer, required: true } });
 *     new M({ buf: Buffer.from('') }).validateSync(); // validation passes!
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaBuffer.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator. To satisfy a
 * required validator, a buffer must not be null or undefined and have
 * non-zero length.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaBuffer.prototype.checkRequired = function(value, doc) {
    if (SchemaType._isRef(this, value, doc, true)) {
        return !!value;
    }
    return this.constructor._checkRequired(value);
};
/**
 * Casts contents
 *
 * @param {Object} value
 * @param {Document} doc document that triggers the casting
 * @param {Boolean} init
 * @api private
 */ SchemaBuffer.prototype.cast = function(value, doc, init, prev, options) {
    let ret;
    if (SchemaType._isRef(this, value, doc, init)) {
        if (value && value.isMongooseBuffer) {
            return value;
        }
        if (Buffer.isBuffer(value)) {
            if (!value || !value.isMongooseBuffer) {
                value = new MongooseBuffer(value, [
                    this.path,
                    doc
                ]);
                if (this.options.subtype != null) {
                    value._subtype = this.options.subtype;
                }
            }
            return value;
        }
        if (value instanceof Binary) {
            ret = new MongooseBuffer(value.value(true), [
                this.path,
                doc
            ]);
            if (typeof value.sub_type !== 'number') {
                throw new CastError('Buffer', value, this.path, null, this);
            }
            ret._subtype = value.sub_type;
            return ret;
        }
        if (value == null || utils.isNonBuiltinObject(value)) {
            return this._castRef(value, doc, init, options);
        }
    }
    // documents
    if (value && value._id) {
        value = value._id;
    }
    if (value && value.isMongooseBuffer) {
        return value;
    }
    if (Buffer.isBuffer(value)) {
        if (!value || !value.isMongooseBuffer) {
            value = new MongooseBuffer(value, [
                this.path,
                doc
            ]);
            if (this.options.subtype != null) {
                value._subtype = this.options.subtype;
            }
        }
        return value;
    }
    if (value instanceof Binary) {
        ret = new MongooseBuffer(value.value(true), [
            this.path,
            doc
        ]);
        if (typeof value.sub_type !== 'number') {
            throw new CastError('Buffer', value, this.path, null, this);
        }
        ret._subtype = value.sub_type;
        return ret;
    }
    if (value === null) {
        return value;
    }
    const type = typeof value;
    if (type === 'string' || type === 'number' || Array.isArray(value) || type === 'object' && value.type === 'Buffer' && Array.isArray(value.data) // gh-6863
    ) {
        if (type === 'number') {
            value = [
                value
            ];
        }
        ret = new MongooseBuffer(value, [
            this.path,
            doc
        ]);
        if (this.options.subtype != null) {
            ret._subtype = this.options.subtype;
        }
        return ret;
    }
    if (utils.isPOJO(value) && (value.$binary instanceof Binary || typeof value.$binary === 'string')) {
        const buf = this.cast(Buffer.from(value.$binary, 'base64'));
        if (value.$type != null) {
            buf._subtype = value.$type;
            return buf;
        }
    }
    throw new CastError('Buffer', value, this.path, null, this);
};
/**
 * Sets the default [subtype](https://studio3t.com/whats-new/best-practices-uuid-mongodb/)
 * for this buffer. You can find a [list of allowed subtypes here](https://api.mongodb.com/python/current/api/bson/binary.html).
 *
 * #### Example:
 *
 *     const s = new Schema({ uuid: { type: Buffer, subtype: 4 });
 *     const M = db.model('M', s);
 *     const m = new M({ uuid: 'test string' });
 *     m.uuid._subtype; // 4
 *
 * @param {Number} subtype the default subtype
 * @return {SchemaType} this
 * @api public
 */ SchemaBuffer.prototype.subtype = function(subtype) {
    this.options.subtype = subtype;
    return this;
};
/*!
 * ignore
 */ function handleSingle(val, context) {
    return this.castForQuery(null, val, context);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $bitsAllClear: handleBitwiseOperator,
    $bitsAnyClear: handleBitwiseOperator,
    $bitsAllSet: handleBitwiseOperator,
    $bitsAnySet: handleBitwiseOperator,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$exists` is the function Mongoose calls to cast `$exists` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaBuffer
 * @instance
 * @api public
 */ Object.defineProperty(SchemaBuffer.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} [value]
 * @api private
 */ SchemaBuffer.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new Error('Can\'t use ' + $conditional + ' with Buffer.');
        }
        return handler.call(this, val);
    }
    let casted;
    try {
        casted = this.applySetters(val, context);
    } catch (err) {
        if (err instanceof CastError && err.path === this.path && this.$fullPath != null) {
            err.path = this.$fullPath;
        }
        throw err;
    }
    return casted ? casted.toObject({
        transform: false,
        virtuals: false
    }) : casted;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaBuffer.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'binData', options?.useBsonType, isRequired);
};
SchemaBuffer.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'binData';
};
/*!
 * Module exports.
 */ module.exports = SchemaBuffer;
}),
"[project]/backend/node_modules/mongoose/lib/schema/date.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module requirements.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const SchemaDateOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaDateOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castDate = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/date.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
/**
 * Date SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaDate(key, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, key, options, 'Date', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaDate.schemaName = 'Date';
SchemaDate.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaDate.prototype = Object.create(SchemaType.prototype);
SchemaDate.prototype.constructor = SchemaDate;
SchemaDate.prototype.OptionsConstructor = SchemaDateOptions;
/*!
 * ignore
 */ SchemaDate._cast = castDate;
/**
 * Sets a default option for all Date instances.
 *
 * #### Example:
 *
 *     // Make all dates have `required` of true by default.
 *     mongoose.Schema.Date.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: Date }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaDate.set = SchemaType.set;
SchemaDate.setters = [];
/**
 * Attaches a getter for all Date instances
 *
 * #### Example:
 *
 *     // Always convert Dates to string
 *     mongoose.Date.get(v => v.toString());
 *
 *     const Model = mongoose.model('Test', new Schema({ date: { type: Date, default: () => new Date() } }));
 *     typeof (new Model({}).date); // 'string'
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaDate.get = SchemaType.get;
/**
 * Get/set the function used to cast arbitrary values to dates.
 *
 * #### Example:
 *
 *     // Mongoose converts empty string '' into `null` for date types. You
 *     // can create a custom caster to disable it.
 *     const original = mongoose.Schema.Types.Date.cast();
 *     mongoose.Schema.Types.Date.cast(v => {
 *       assert.ok(v !== '');
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Schema.Types.Date.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaDate.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaDate._defaultCaster = (v)=>{
    if (v != null && !(v instanceof Date)) {
        throw new Error();
    }
    return v;
};
/**
 * Declares a TTL index (rounded to the nearest second) for _Date_ types only.
 *
 * This sets the `expireAfterSeconds` index option available in MongoDB >= 2.1.2.
 * This index type is only compatible with Date types.
 *
 * #### Example:
 *
 *     // expire in 24 hours
 *     new Schema({ createdAt: { type: Date, expires: 60*60*24 }});
 *
 * `expires` utilizes the `ms` module from [vercel](https://github.com/vercel/ms) allowing us to use a friendlier syntax:
 *
 * #### Example:
 *
 *     // expire in 24 hours
 *     new Schema({ createdAt: { type: Date, expires: '24h' }});
 *
 *     // expire in 1.5 hours
 *     new Schema({ createdAt: { type: Date, expires: '1.5h' }});
 *
 *     // expire in 7 days
 *     const schema = new Schema({ createdAt: Date });
 *     schema.path('createdAt').expires('7d');
 *
 * @param {Number|String} when
 * @added 3.0.0
 * @return {SchemaType} this
 * @api public
 */ SchemaDate.prototype.expires = function(when) {
    if (getConstructorName(this._index) !== 'Object') {
        this._index = {};
    }
    this._index.expires = when;
    utils.expires(this._index);
    return this;
};
/*!
 * ignore
 */ SchemaDate._checkRequired = (v)=>v instanceof Date;
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * #### Example:
 *
 *     // Allow empty strings to pass `required` check
 *     mongoose.Schema.Types.String.checkRequired(v => v != null);
 *
 *     const M = mongoose.model({ str: { type: String, required: true } });
 *     new M({ str: '' }).validateSync(); // `null`, validation passes!
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaDate.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator. To satisfy
 * a required validator, the given value must be an instance of `Date`.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaDate.prototype.checkRequired = function(value, doc) {
    if (typeof value === 'object' && SchemaType._isRef(this, value, doc, true)) {
        return value != null;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaDate.checkRequired();
    return _checkRequired(value);
};
/**
 * Sets a minimum date validator.
 *
 * #### Example:
 *
 *     const s = new Schema({ d: { type: Date, min: Date('1970-01-01') })
 *     const M = db.model('M', s)
 *     const m = new M({ d: Date('1969-12-31') })
 *     m.save(function (err) {
 *       console.error(err) // validator error
 *       m.d = Date('2014-12-08');
 *       m.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MIN} token which will be replaced with the invalid value
 *     const min = [Date('1970-01-01'), 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];
 *     const schema = new Schema({ d: { type: Date, min: min })
 *     const M = mongoose.model('M', schema);
 *     const s= new M({ d: Date('1969-12-31') });
 *     s.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `d` (1969-12-31) is before the limit (1970-01-01).
 *     })
 *
 * @param {Date} value minimum date
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaDate.prototype.min = function(value, message) {
    if (this.minValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.minValidator;
        }, this);
    }
    if (value) {
        let msg = message || MongooseError.messages.Date.min;
        if (typeof msg === 'string') {
            msg = msg.replace(/{MIN}/, value === Date.now ? 'Date.now()' : value.toString());
        }
        const _this = this;
        this.validators.push({
            validator: this.minValidator = function(val) {
                let _value = value;
                if (typeof value === 'function' && value !== Date.now) {
                    _value = _value.call(this);
                }
                const min = _value === Date.now ? _value() : _this.cast(_value);
                return val === null || val.valueOf() >= min.valueOf();
            },
            message: msg,
            type: 'min',
            min: value
        });
    }
    return this;
};
/**
 * Sets a maximum date validator.
 *
 * #### Example:
 *
 *     const s = new Schema({ d: { type: Date, max: Date('2014-01-01') })
 *     const M = db.model('M', s)
 *     const m = new M({ d: Date('2014-12-08') })
 *     m.save(function (err) {
 *       console.error(err) // validator error
 *       m.d = Date('2013-12-31');
 *       m.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MAX} token which will be replaced with the invalid value
 *     const max = [Date('2014-01-01'), 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'];
 *     const schema = new Schema({ d: { type: Date, max: max })
 *     const M = mongoose.model('M', schema);
 *     const s= new M({ d: Date('2014-12-08') });
 *     s.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `d` (2014-12-08) exceeds the limit (2014-01-01).
 *     })
 *
 * @param {Date} maximum date
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaDate.prototype.max = function(value, message) {
    if (this.maxValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.maxValidator;
        }, this);
    }
    if (value) {
        let msg = message || MongooseError.messages.Date.max;
        if (typeof msg === 'string') {
            msg = msg.replace(/{MAX}/, value === Date.now ? 'Date.now()' : value.toString());
        }
        const _this = this;
        this.validators.push({
            validator: this.maxValidator = function(val) {
                let _value = value;
                if (typeof _value === 'function' && _value !== Date.now) {
                    _value = _value.call(this);
                }
                const max = _value === Date.now ? _value() : _this.cast(_value);
                return val === null || val.valueOf() <= max.valueOf();
            },
            message: msg,
            type: 'max',
            max: value
        });
    }
    return this;
};
/**
 * Casts to date
 *
 * @param {Object} value to cast
 * @api private
 */ SchemaDate.prototype.cast = function(value) {
    let castDate;
    if (typeof this._castFunction === 'function') {
        castDate = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castDate = this.constructor.cast();
    } else {
        castDate = SchemaDate.cast();
    }
    try {
        return castDate(value);
    } catch (error) {
        throw new CastError('date', value, this.path, error, this);
    }
};
/**
 * Date Query casting.
 *
 * @param {Any} val
 * @api private
 */ function handleSingle(val) {
    return this.cast(val);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$gte` is the function Mongoose calls to cast `$gte` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaDate
 * @instance
 * @api public
 */ Object.defineProperty(SchemaDate.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} [value]
 * @api private
 */ SchemaDate.prototype.castForQuery = function($conditional, val, context) {
    if ($conditional == null) {
        try {
            return this.applySetters(val, context);
        } catch (err) {
            if (err instanceof CastError && err.path === this.path && this.$fullPath != null) {
                err.path = this.$fullPath;
            }
            throw err;
        }
    }
    const handler = this.$conditionalHandlers[$conditional];
    if (!handler) {
        throw new Error('Can\'t use ' + $conditional + ' with Date.');
    }
    return handler.call(this, val);
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaDate.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'date', options?.useBsonType, isRequired);
};
SchemaDate.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'date';
};
/*!
 * Module exports.
 */ module.exports = SchemaDate;
}),
"[project]/backend/node_modules/mongoose/lib/schema/decimal128.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
const castDecimal128 = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/decimal128.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
/**
 * Decimal128 SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaDecimal128(key, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, key, options, 'Decimal128', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaDecimal128.schemaName = 'Decimal128';
SchemaDecimal128.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaDecimal128.prototype = Object.create(SchemaType.prototype);
SchemaDecimal128.prototype.constructor = SchemaDecimal128;
/*!
 * ignore
 */ SchemaDecimal128._cast = castDecimal128;
/**
 * Sets a default option for all Decimal128 instances.
 *
 * #### Example:
 *
 *     // Make all decimal 128s have `required` of true by default.
 *     mongoose.Schema.Decimal128.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: mongoose.Decimal128 }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaDecimal128.set = SchemaType.set;
SchemaDecimal128.setters = [];
/**
 * Attaches a getter for all Decimal128 instances
 *
 * #### Example:
 *
 *     // Automatically convert Decimal128s to Numbers
 *     mongoose.Schema.Decimal128.get(v => v == null ? v : Number(v));
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaDecimal128.get = SchemaType.get;
/**
 * Get/set the function used to cast arbitrary values to decimals.
 *
 * #### Example:
 *
 *     // Make Mongoose only refuse to cast numbers as decimal128
 *     const original = mongoose.Schema.Types.Decimal128.cast();
 *     mongoose.Decimal128.cast(v => {
 *       assert.ok(typeof v !== 'number');
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Decimal128.cast(false);
 *
 * @param {Function} [caster]
 * @return {Function}
 * @function get
 * @static
 * @api public
 */ SchemaDecimal128.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaDecimal128._defaultCaster = (v)=>{
    if (v != null && !isBsonType(v, 'Decimal128')) {
        throw new Error();
    }
    return v;
};
/*!
 * ignore
 */ SchemaDecimal128._checkRequired = (v)=>isBsonType(v, 'Decimal128');
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaDecimal128.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaDecimal128.prototype.checkRequired = function checkRequired(value, doc) {
    if (SchemaType._isRef(this, value, doc, true)) {
        return !!value;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaDecimal128.checkRequired();
    return _checkRequired(value);
};
/**
 * Casts to Decimal128
 *
 * @param {Object} value
 * @param {Object} doc
 * @param {Boolean} init whether this is an initialization cast
 * @api private
 */ SchemaDecimal128.prototype.cast = function(value, doc, init, prev, options) {
    if (SchemaType._isRef(this, value, doc, init)) {
        if (isBsonType(value, 'Decimal128')) {
            return value;
        }
        return this._castRef(value, doc, init, options);
    }
    let castDecimal128;
    if (typeof this._castFunction === 'function') {
        castDecimal128 = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castDecimal128 = this.constructor.cast();
    } else {
        castDecimal128 = SchemaDecimal128.cast();
    }
    try {
        return castDecimal128(value);
    } catch (error) {
        throw new CastError('Decimal128', value, this.path, error, this);
    }
};
/*!
 * ignore
 */ function handleSingle(val) {
    return this.cast(val);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$lte` is the function Mongoose calls to cast `$lte` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaDecimal128
 * @instance
 * @api public
 */ Object.defineProperty(SchemaDecimal128.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaDecimal128.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'decimal', options?.useBsonType, isRequired);
};
SchemaDecimal128.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'decimal';
};
/*!
 * Module exports.
 */ module.exports = SchemaDecimal128;
}),
"[project]/backend/node_modules/mongoose/lib/schema/subdocument.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const ObjectExpectedError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/objectExpected.js [app-route] (ecmascript)");
const SchemaSubdocumentOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaSubdocumentOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const applyDefaults = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/applyDefaults.js [app-route] (ecmascript)");
const $exists = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/exists.js [app-route] (ecmascript)");
const castToNumber = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/helpers.js [app-route] (ecmascript)").castToNumber;
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const discriminator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/discriminator.js [app-route] (ecmascript)");
const geospatial = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/geospatial.js [app-route] (ecmascript)");
const getConstructor = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getConstructor.js [app-route] (ecmascript)");
const handleIdOption = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/handleIdOption.js [app-route] (ecmascript)");
const internalToObjectOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options.js [app-route] (ecmascript)").internalToObjectOptions;
const isExclusive = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/projection/isExclusive.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const InvalidSchemaOptionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/invalidSchemaOption.js [app-route] (ecmascript)");
let SubdocumentType;
module.exports = SchemaSubdocument;
/**
 * Single nested subdocument SchemaType constructor.
 *
 * @param {Schema} schema
 * @param {String} path
 * @param {Object} options
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaSubdocument(schema, path, options, parentSchema) {
    if (schema.options.timeseries) {
        throw new InvalidSchemaOptionError(path, 'timeseries');
    }
    const schemaTypeIdOption = SchemaSubdocument.defaultOptions && SchemaSubdocument.defaultOptions._id;
    if (schemaTypeIdOption != null) {
        options = options || {};
        options._id = schemaTypeIdOption;
    }
    schema = handleIdOption(schema, options);
    this.caster = _createConstructor(schema, null, options);
    this.caster.path = path;
    this.caster.prototype.$basePath = path;
    this.schema = schema;
    this.$isSingleNested = true;
    this.base = schema.base;
    SchemaType.call(this, path, options, 'Embedded', parentSchema);
}
/*!
 * ignore
 */ SchemaSubdocument.prototype = Object.create(SchemaType.prototype);
SchemaSubdocument.prototype.constructor = SchemaSubdocument;
SchemaSubdocument.prototype.OptionsConstructor = SchemaSubdocumentOptions;
/*!
 * ignore
 */ function _createConstructor(schema, baseClass, options) {
    // lazy load
    SubdocumentType || (SubdocumentType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/subdocument.js [app-route] (ecmascript)"));
    const _embedded = function SingleNested(value, path, parent) {
        this.$__parent = parent;
        SubdocumentType.apply(this, arguments);
        if (parent == null) {
            return;
        }
        this.$session(parent.$session());
    };
    schema._preCompile();
    const proto = baseClass != null ? baseClass.prototype : SubdocumentType.prototype;
    _embedded.prototype = Object.create(proto);
    _embedded.prototype.$__setSchema(schema);
    _embedded.prototype.constructor = _embedded;
    _embedded.prototype.$__schemaTypeOptions = options;
    _embedded.$__required = options?.required;
    _embedded.base = schema.base;
    _embedded.schema = schema;
    _embedded.$isSingleNested = true;
    _embedded.events = new EventEmitter();
    _embedded.prototype.toBSON = function() {
        return this.toObject(internalToObjectOptions);
    };
    // apply methods
    for(const i in schema.methods){
        _embedded.prototype[i] = schema.methods[i];
    }
    // apply statics
    for(const i in schema.statics){
        _embedded[i] = schema.statics[i];
    }
    for(const i in EventEmitter.prototype){
        _embedded[i] = EventEmitter.prototype[i];
    }
    return _embedded;
}
/*!
 * ignore
 */ const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers
};
/**
 * Special case for when users use a common location schema to represent
 * locations for use with $geoWithin.
 * https://www.mongodb.com/docs/manual/reference/operator/query/geoWithin/
 *
 * @param {Object} val
 * @api private
 */ $conditionalHandlers.$geoWithin = function handle$geoWithin(val, context) {
    return {
        $geometry: this.castForQuery(null, val.$geometry, context)
    };
};
/*!
 * ignore
 */ $conditionalHandlers.$near = $conditionalHandlers.$nearSphere = geospatial.cast$near;
$conditionalHandlers.$within = $conditionalHandlers.$geoWithin = geospatial.cast$within;
$conditionalHandlers.$geoIntersects = geospatial.cast$geoIntersects;
$conditionalHandlers.$minDistance = castToNumber;
$conditionalHandlers.$maxDistance = castToNumber;
$conditionalHandlers.$exists = $exists;
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$exists` is the function Mongoose calls to cast `$exists` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaSubdocument
 * @instance
 * @api public
 */ Object.defineProperty(SchemaSubdocument.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents
 *
 * @param {Object} value
 * @api private
 */ SchemaSubdocument.prototype.cast = function(val, doc, init, priorVal, options) {
    if (val && val.$isSingleNested && val.parent === doc) {
        return val;
    }
    if (val != null && (typeof val !== 'object' || Array.isArray(val))) {
        throw new ObjectExpectedError(this.path, val);
    }
    const discriminatorKeyPath = this.schema.path(this.schema.options.discriminatorKey);
    const defaultDiscriminatorValue = discriminatorKeyPath == null ? null : discriminatorKeyPath.getDefault(doc);
    const Constructor = getConstructor(this.caster, val, defaultDiscriminatorValue);
    let subdoc;
    // Only pull relevant selected paths and pull out the base path
    const parentSelected = doc && doc.$__ && doc.$__.selected;
    const path = this.path;
    const selected = parentSelected == null ? null : Object.keys(parentSelected).reduce((obj, key)=>{
        if (key.startsWith(path + '.')) {
            obj = obj || {};
            obj[key.substring(path.length + 1)] = parentSelected[key];
        }
        return obj;
    }, null);
    if (init) {
        subdoc = new Constructor(void 0, selected, doc, false, {
            defaults: false
        });
        delete subdoc.$__.defaults;
        // Don't pass `path` to $init - it's only for the subdocument itself, not its fields.
        // For change tracking, subdocuments use relative paths internally.
        // Here, `options.path` contains the absolute path and is only used by the subdocument constructor, not by $init.
        if (options.path != null) {
            options = {
                ...options
            };
            delete options.path;
        }
        subdoc.$init(val, options);
        const exclude = isExclusive(selected);
        applyDefaults(subdoc, selected, exclude);
    } else {
        options = Object.assign({}, options, {
            priorDoc: priorVal
        });
        if (Object.keys(val).length === 0) {
            return new Constructor({}, selected, doc, undefined, options);
        }
        return new Constructor(val, selected, doc, undefined, options);
    }
    return subdoc;
};
/**
 * Casts contents for query
 *
 * @param {string} [$conditional] optional query operator (like `$eq` or `$in`)
 * @param {any} value
 * @api private
 */ SchemaSubdocument.prototype.castForQuery = function($conditional, val, context, options) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new Error('Can\'t use ' + $conditional);
        }
        return handler.call(this, val);
    }
    if (val == null) {
        return val;
    }
    const Constructor = getConstructor(this.caster, val);
    if (val instanceof Constructor) {
        return val;
    }
    if (this.options.runSetters) {
        val = this._applySetters(val, context);
    }
    const overrideStrict = options != null && options.strict != null ? options.strict : void 0;
    try {
        val = new Constructor(val, overrideStrict);
    } catch (error) {
        // Make sure we always wrap in a CastError (gh-6803)
        if (!(error instanceof CastError)) {
            throw new CastError('Embedded', val, this.path, error, this);
        }
        throw error;
    }
    return val;
};
/**
 * Async validation on this single nested doc.
 *
 * @api private
 */ SchemaSubdocument.prototype.doValidate = function(value, fn, scope, options) {
    const Constructor = getConstructor(this.caster, value);
    if (value && !(value instanceof Constructor)) {
        value = new Constructor(value, null, scope != null && scope.$__ != null ? scope : null);
    }
    if (options && options.skipSchemaValidators) {
        if (!value) {
            return fn(null);
        }
        return value.validate().then(()=>fn(null), (err)=>fn(err));
    }
    SchemaType.prototype.doValidate.call(this, value, function(error) {
        if (error) {
            return fn(error);
        }
        if (!value) {
            return fn(null);
        }
        value.validate().then(()=>fn(null), (err)=>fn(err));
    }, scope, options);
};
/**
 * Synchronously validate this single nested doc
 *
 * @api private
 */ SchemaSubdocument.prototype.doValidateSync = function(value, scope, options) {
    if (!options || !options.skipSchemaValidators) {
        const schemaTypeError = SchemaType.prototype.doValidateSync.call(this, value, scope);
        if (schemaTypeError) {
            return schemaTypeError;
        }
    }
    if (!value) {
        return;
    }
    return value.validateSync();
};
/**
 * Adds a discriminator to this single nested subdocument.
 *
 * #### Example:
 *
 *     const shapeSchema = Schema({ name: String }, { discriminatorKey: 'kind' });
 *     const schema = Schema({ shape: shapeSchema });
 *
 *     const singleNestedPath = parentSchema.path('shape');
 *     singleNestedPath.discriminator('Circle', Schema({ radius: Number }));
 *
 * @param {String} name
 * @param {Schema} schema fields to add to the schema for instances of this sub-class
 * @param {Object|string} [options] If string, same as `options.value`.
 * @param {String} [options.value] the string stored in the `discriminatorKey` property. If not specified, Mongoose uses the `name` parameter.
 * @param {Boolean} [options.clone=true] By default, `discriminator()` clones the given `schema`. Set to `false` to skip cloning.
 * @return {Function} the constructor Mongoose will use for creating instances of this discriminator model
 * @see discriminators https://mongoosejs.com/docs/discriminators.html
 * @api public
 */ SchemaSubdocument.prototype.discriminator = function(name, schema, options) {
    options = options || {};
    const value = utils.isPOJO(options) ? options.value : options;
    const clone = typeof options.clone === 'boolean' ? options.clone : true;
    if (schema.instanceOfSchema && clone) {
        schema = schema.clone();
    }
    schema = discriminator(this.caster, name, schema, value, null, null, options.overwriteExisting);
    this.caster.discriminators[name] = _createConstructor(schema, this.caster);
    return this.caster.discriminators[name];
};
/*!
 * ignore
 */ SchemaSubdocument.defaultOptions = {};
/**
 * Sets a default option for all Subdocument instances.
 *
 * #### Example:
 *
 *     // Make all numbers have option `min` equal to 0.
 *     mongoose.Schema.Subdocument.set('required', true);
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {void}
 * @function set
 * @static
 * @api public
 */ SchemaSubdocument.set = SchemaType.set;
SchemaSubdocument.setters = [];
/**
 * Attaches a getter for all Subdocument instances
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaSubdocument.get = SchemaType.get;
/*!
 * ignore
 */ SchemaSubdocument.prototype.toJSON = function toJSON() {
    return {
        path: this.path,
        options: this.options
    };
};
/*!
 * ignore
 */ SchemaSubdocument.prototype.clone = function() {
    const schematype = new this.constructor(this.schema, this.path, {
        ...this.options,
        _skipApplyDiscriminators: true
    }, this.parentSchema);
    schematype.validators = this.validators.slice();
    if (this.requiredValidator !== undefined) {
        schematype.requiredValidator = this.requiredValidator;
    }
    schematype.caster.discriminators = Object.assign({}, this.caster.discriminators);
    schematype._appliedDiscriminators = this._appliedDiscriminators;
    return schematype;
};
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaSubdocument.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return {
        ...this.schema.toJSONSchema(options),
        ...createJSONSchemaTypeDefinition('object', 'object', options?.useBsonType, isRequired)
    };
};
}),
"[project]/backend/node_modules/mongoose/lib/schema/documentArrayElement.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const SchemaSubdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/subdocument.js [app-route] (ecmascript)");
const getConstructor = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getConstructor.js [app-route] (ecmascript)");
/**
 * DocumentArrayElement SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaDocumentArrayElement(path, options, _schemaOptions, parentSchema) {
    this.$parentSchemaType = options && options.$parentSchemaType;
    if (!this.$parentSchemaType) {
        throw new MongooseError('Cannot create DocumentArrayElement schematype without a parent');
    }
    delete options.$parentSchemaType;
    SchemaType.call(this, path, options, 'DocumentArrayElement', parentSchema);
    this.$isMongooseDocumentArrayElement = true;
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaDocumentArrayElement.schemaName = 'DocumentArrayElement';
SchemaDocumentArrayElement.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaDocumentArrayElement.prototype = Object.create(SchemaType.prototype);
SchemaDocumentArrayElement.prototype.constructor = SchemaDocumentArrayElement;
/**
 * Casts `val` for DocumentArrayElement.
 *
 * @param {Object} value to cast
 * @api private
 */ SchemaDocumentArrayElement.prototype.cast = function(...args) {
    return this.$parentSchemaType.cast(...args)[0];
};
/**
 * Casts contents for queries.
 *
 * @param {String} $cond
 * @param {any} [val]
 * @api private
 */ SchemaDocumentArrayElement.prototype.doValidate = function(value, fn, scope, options) {
    const Constructor = getConstructor(this.caster, value);
    if (value && !(value instanceof Constructor)) {
        value = new Constructor(value, scope, null, null, options && options.index != null ? options.index : null);
    }
    return SchemaSubdocument.prototype.doValidate.call(this, value, fn, scope, options);
};
/**
 * Clone the current SchemaType
 *
 * @return {DocumentArrayElement} The cloned instance
 * @api private
 */ SchemaDocumentArrayElement.prototype.clone = function() {
    this.options.$parentSchemaType = this.$parentSchemaType;
    const ret = SchemaType.prototype.clone.apply(this, arguments);
    delete this.options.$parentSchemaType;
    ret.caster = this.caster;
    ret.schema = this.schema;
    return ret;
};
/*!
 * Module exports.
 */ module.exports = SchemaDocumentArrayElement;
}),
"[project]/backend/node_modules/mongoose/lib/schema/documentArray.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const DocumentArrayElement = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/documentArrayElement.js [app-route] (ecmascript)");
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
const SchemaArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/array.js [app-route] (ecmascript)");
const SchemaDocumentArrayOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaDocumentArrayOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const cast = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const discriminator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/model/discriminator.js [app-route] (ecmascript)");
const handleIdOption = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/schema/handleIdOption.js [app-route] (ecmascript)");
const handleSpreadDoc = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/document/handleSpreadDoc.js [app-route] (ecmascript)");
const isOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/query/isOperator.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const getConstructor = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/discriminator/getConstructor.js [app-route] (ecmascript)");
const InvalidSchemaOptionError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/invalidSchemaOption.js [app-route] (ecmascript)");
const arrayAtomicsSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayAtomicsSymbol;
const arrayPathSymbol = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").arrayPathSymbol;
const documentArrayParent = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/symbols.js [app-route] (ecmascript)").documentArrayParent;
let MongooseDocumentArray;
let Subdocument;
/**
 * SubdocsArray SchemaType constructor
 *
 * @param {String} key
 * @param {Schema} schema
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaArray
 * @api public
 */ function SchemaDocumentArray(key, schema, options, schemaOptions, parentSchema) {
    if (schema.options && schema.options.timeseries) {
        throw new InvalidSchemaOptionError(key, 'timeseries');
    }
    const schemaTypeIdOption = SchemaDocumentArray.defaultOptions && SchemaDocumentArray.defaultOptions._id;
    if (schemaTypeIdOption != null) {
        schemaOptions = schemaOptions || {};
        schemaOptions._id = schemaTypeIdOption;
    }
    if (schemaOptions != null && schemaOptions._id != null) {
        schema = handleIdOption(schema, schemaOptions);
    } else if (options != null && options._id != null) {
        schema = handleIdOption(schema, options);
    }
    const EmbeddedDocument = _createConstructor(schema, options);
    EmbeddedDocument.prototype.$basePath = key;
    SchemaArray.call(this, key, EmbeddedDocument, options, null, parentSchema);
    this.schema = schema;
    // EmbeddedDocument schematype options
    this.schemaOptions = schemaOptions || {};
    this.$isMongooseDocumentArray = true;
    this.Constructor = EmbeddedDocument;
    EmbeddedDocument.base = schema.base;
    const fn = this.defaultValue;
    if (!('defaultValue' in this) || fn != null) {
        this.default(function() {
            let arr = fn.call(this);
            if (arr != null && !Array.isArray(arr)) {
                arr = [
                    arr
                ];
            }
            // Leave it up to `cast()` to convert this to a documentarray
            return arr;
        });
    }
    const $parentSchemaType = this;
    this.$embeddedSchemaType = new DocumentArrayElement(key + '.$', {
        ...schemaOptions || {},
        $parentSchemaType
    }, schemaOptions, parentSchema);
    this.$embeddedSchemaType.caster = this.Constructor;
    this.$embeddedSchemaType.schema = this.schema;
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaDocumentArray.schemaName = 'DocumentArray';
/**
 * Options for all document arrays.
 *
 * - `castNonArrays`: `true` by default. If `false`, Mongoose will throw a CastError when a value isn't an array. If `true`, Mongoose will wrap the provided value in an array before casting.
 *
 * @api public
 */ SchemaDocumentArray.options = {
    castNonArrays: true
};
/*!
 * Inherits from SchemaArray.
 */ SchemaDocumentArray.prototype = Object.create(SchemaArray.prototype);
SchemaDocumentArray.prototype.constructor = SchemaDocumentArray;
SchemaDocumentArray.prototype.OptionsConstructor = SchemaDocumentArrayOptions;
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$size` is the function Mongoose calls to cast `$size` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaDocumentArray
 * @instance
 * @api public
 */ Object.defineProperty(SchemaDocumentArray.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: {
        ...SchemaArray.prototype.$conditionalHandlers
    }
});
/*!
 * ignore
 */ function _createConstructor(schema, options, baseClass) {
    Subdocument || (Subdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/arraySubdocument.js [app-route] (ecmascript)"));
    // compile an embedded document for this schema
    function EmbeddedDocument() {
        Subdocument.apply(this, arguments);
        if (this.__parentArray == null || this.__parentArray.getArrayParent() == null) {
            return;
        }
        this.$session(this.__parentArray.getArrayParent().$session());
    }
    schema._preCompile();
    const proto = baseClass != null ? baseClass.prototype : Subdocument.prototype;
    EmbeddedDocument.prototype = Object.create(proto);
    EmbeddedDocument.prototype.$__setSchema(schema);
    EmbeddedDocument.schema = schema;
    EmbeddedDocument.prototype.constructor = EmbeddedDocument;
    EmbeddedDocument.$isArraySubdocument = true;
    EmbeddedDocument.events = new EventEmitter();
    EmbeddedDocument.base = schema.base;
    // apply methods
    for(const i in schema.methods){
        EmbeddedDocument.prototype[i] = schema.methods[i];
    }
    // apply statics
    for(const i in schema.statics){
        EmbeddedDocument[i] = schema.statics[i];
    }
    for(const i in EventEmitter.prototype){
        EmbeddedDocument[i] = EventEmitter.prototype[i];
    }
    EmbeddedDocument.options = options;
    return EmbeddedDocument;
}
/**
 * Adds a discriminator to this document array.
 *
 * #### Example:
 *
 *     const shapeSchema = Schema({ name: String }, { discriminatorKey: 'kind' });
 *     const schema = Schema({ shapes: [shapeSchema] });
 *
 *     const docArrayPath = parentSchema.path('shapes');
 *     docArrayPath.discriminator('Circle', Schema({ radius: Number }));
 *
 * @param {String} name
 * @param {Schema} schema fields to add to the schema for instances of this sub-class
 * @param {Object|string} [options] If string, same as `options.value`.
 * @param {String} [options.value] the string stored in the `discriminatorKey` property. If not specified, Mongoose uses the `name` parameter.
 * @param {Boolean} [options.clone=true] By default, `discriminator()` clones the given `schema`. Set to `false` to skip cloning.
 * @see discriminators https://mongoosejs.com/docs/discriminators.html
 * @return {Function} the constructor Mongoose will use for creating instances of this discriminator model
 * @api public
 */ SchemaDocumentArray.prototype.discriminator = function(name, schema, options) {
    if (typeof name === 'function') {
        name = utils.getFunctionName(name);
    }
    options = options || {};
    const tiedValue = utils.isPOJO(options) ? options.value : options;
    const clone = typeof options.clone === 'boolean' ? options.clone : true;
    if (schema.instanceOfSchema && clone) {
        schema = schema.clone();
    }
    schema = discriminator(this.casterConstructor, name, schema, tiedValue, null, null, options?.overwriteExisting);
    const EmbeddedDocument = _createConstructor(schema, null, this.casterConstructor);
    EmbeddedDocument.baseCasterConstructor = this.casterConstructor;
    try {
        Object.defineProperty(EmbeddedDocument, 'name', {
            value: name
        });
    } catch (error) {
    // Ignore error, only happens on old versions of node
    }
    this.casterConstructor.discriminators[name] = EmbeddedDocument;
    return this.casterConstructor.discriminators[name];
};
/**
 * Performs local validations first, then validations on each embedded doc
 *
 * @api private
 */ SchemaDocumentArray.prototype.doValidate = function(array, fn, scope, options) {
    // lazy load
    MongooseDocumentArray || (MongooseDocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/index.js [app-route] (ecmascript)"));
    const _this = this;
    try {
        SchemaType.prototype.doValidate.call(this, array, cb, scope);
    } catch (err) {
        return fn(err);
    }
    function cb(err) {
        if (err) {
            return fn(err);
        }
        let count = array && array.length;
        let error;
        if (!count) {
            return fn();
        }
        if (options && options.updateValidator) {
            return fn();
        }
        if (!utils.isMongooseDocumentArray(array)) {
            array = new MongooseDocumentArray(array, _this.path, scope);
        }
        // handle sparse arrays, do not use array.forEach which does not
        // iterate over sparse elements yet reports array.length including
        // them :(
        function callback(err) {
            if (err != null) {
                error = err;
            }
            --count || fn(error);
        }
        for(let i = 0, len = count; i < len; ++i){
            // sidestep sparse entries
            let doc = array[i];
            if (doc == null) {
                --count || fn(error);
                continue;
            }
            // If you set the array index directly, the doc might not yet be
            // a full fledged mongoose subdoc, so make it into one.
            if (!(doc instanceof Subdocument)) {
                const Constructor = getConstructor(_this.casterConstructor, array[i]);
                doc = array[i] = new Constructor(doc, array, undefined, undefined, i);
            }
            if (options != null && options.validateModifiedOnly && !doc.$isModified()) {
                --count || fn(error);
                continue;
            }
            doc.$__validate(null, options, callback);
        }
    }
};
/**
 * Performs local validations first, then validations on each embedded doc.
 *
 * #### Note:
 *
 * This method ignores the asynchronous validators.
 *
 * @return {MongooseError|undefined}
 * @api private
 */ SchemaDocumentArray.prototype.doValidateSync = function(array, scope, options) {
    const schemaTypeError = SchemaType.prototype.doValidateSync.call(this, array, scope);
    if (schemaTypeError != null) {
        return schemaTypeError;
    }
    const count = array && array.length;
    let resultError = null;
    if (!count) {
        return;
    }
    // handle sparse arrays, do not use array.forEach which does not
    // iterate over sparse elements yet reports array.length including
    // them :(
    for(let i = 0, len = count; i < len; ++i){
        // sidestep sparse entries
        let doc = array[i];
        if (!doc) {
            continue;
        }
        // If you set the array index directly, the doc might not yet be
        // a full fledged mongoose subdoc, so make it into one.
        if (!(doc instanceof Subdocument)) {
            const Constructor = getConstructor(this.casterConstructor, array[i]);
            doc = array[i] = new Constructor(doc, array, undefined, undefined, i);
        }
        if (options != null && options.validateModifiedOnly && !doc.$isModified()) {
            continue;
        }
        const subdocValidateError = doc.validateSync(options);
        if (subdocValidateError && resultError == null) {
            resultError = subdocValidateError;
        }
    }
    return resultError;
};
/*!
 * ignore
 */ SchemaDocumentArray.prototype.getDefault = function(scope, init, options) {
    let ret = typeof this.defaultValue === 'function' ? this.defaultValue.call(scope) : this.defaultValue;
    if (ret == null) {
        return ret;
    }
    if (options && options.skipCast) {
        return ret;
    }
    // lazy load
    MongooseDocumentArray || (MongooseDocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/index.js [app-route] (ecmascript)"));
    if (!Array.isArray(ret)) {
        ret = [
            ret
        ];
    }
    ret = new MongooseDocumentArray(ret, this.path, scope);
    for(let i = 0; i < ret.length; ++i){
        const Constructor = getConstructor(this.casterConstructor, ret[i]);
        const _subdoc = new Constructor({}, ret, undefined, undefined, i);
        _subdoc.$init(ret[i]);
        _subdoc.isNew = true;
        // Make sure all paths in the subdoc are set to `default` instead
        // of `init` since we used `init`.
        Object.assign(_subdoc.$__.activePaths.default, _subdoc.$__.activePaths.init);
        _subdoc.$__.activePaths.init = {};
        ret[i] = _subdoc;
    }
    return ret;
};
const _toObjectOptions = Object.freeze({
    transform: false,
    virtuals: false
});
const initDocumentOptions = Object.freeze({
    skipId: false,
    willInit: true
});
/**
 * Casts contents
 *
 * @param {Object} value
 * @param {Document} document that triggers the casting
 * @api private
 */ SchemaDocumentArray.prototype.cast = function(value, doc, init, prev, options) {
    // lazy load
    MongooseDocumentArray || (MongooseDocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/documentArray/index.js [app-route] (ecmascript)"));
    // Skip casting if `value` is the same as the previous value, no need to cast. See gh-9266
    if (value != null && value[arrayPathSymbol] != null && value === prev) {
        return value;
    }
    let selected;
    let subdoc;
    options = options || {};
    const path = options.path || this.path;
    if (!Array.isArray(value)) {
        if (!init && !SchemaDocumentArray.options.castNonArrays) {
            throw new CastError('DocumentArray', value, this.path, null, this);
        }
        // gh-2442 mark whole array as modified if we're initializing a doc from
        // the db and the path isn't an array in the document
        if (!!doc && init) {
            doc.markModified(path);
        }
        return this.cast([
            value
        ], doc, init, prev, options);
    }
    // We need to create a new array, otherwise change tracking will
    // update the old doc (gh-4449)
    if (!options.skipDocumentArrayCast || utils.isMongooseDocumentArray(value)) {
        value = new MongooseDocumentArray(value, path, doc, this);
    }
    if (prev != null) {
        value[arrayAtomicsSymbol] = prev[arrayAtomicsSymbol] || {};
    }
    if (options.arrayPathIndex != null) {
        value[arrayPathSymbol] = path + '.' + options.arrayPathIndex;
    }
    const rawArray = utils.isMongooseDocumentArray(value) ? value.__array : value;
    const len = rawArray.length;
    for(let i = 0; i < len; ++i){
        if (!rawArray[i]) {
            continue;
        }
        const Constructor = getConstructor(this.casterConstructor, rawArray[i]);
        const spreadDoc = handleSpreadDoc(rawArray[i], true);
        if (rawArray[i] !== spreadDoc) {
            rawArray[i] = spreadDoc;
        }
        if (rawArray[i] instanceof Subdocument) {
            if (rawArray[i][documentArrayParent] !== doc) {
                if (init) {
                    const subdoc = new Constructor(null, value, initDocumentOptions, selected, i);
                    rawArray[i] = subdoc.$init(rawArray[i]);
                } else {
                    const subdoc = new Constructor(rawArray[i], value, undefined, undefined, i);
                    rawArray[i] = subdoc;
                }
            }
            // Might not have the correct index yet, so ensure it does.
            if (rawArray[i].__index == null) {
                rawArray[i].$setIndex(i);
            }
        } else if (rawArray[i] != null) {
            if (init) {
                if (doc) {
                    selected || (selected = scopePaths(this, doc.$__.selected, init));
                } else {
                    selected = true;
                }
                subdoc = new Constructor(null, value, initDocumentOptions, selected, i);
                rawArray[i] = subdoc.$init(rawArray[i], options);
            } else {
                if (prev && typeof prev.id === 'function') {
                    subdoc = prev.id(rawArray[i]._id);
                }
                if (prev && subdoc && utils.deepEqual(subdoc.toObject(_toObjectOptions), rawArray[i])) {
                    // handle resetting doc with existing id and same data
                    subdoc.set(rawArray[i]);
                    // if set() is hooked it will have no return value
                    // see gh-746
                    rawArray[i] = subdoc;
                } else {
                    try {
                        subdoc = new Constructor(rawArray[i], value, undefined, undefined, i);
                        // if set() is hooked it will have no return value
                        // see gh-746
                        rawArray[i] = subdoc;
                    } catch (error) {
                        throw new CastError('embedded', rawArray[i], value[arrayPathSymbol], error, this);
                    }
                }
            }
        }
    }
    return value;
};
/*!
 * ignore
 */ SchemaDocumentArray.prototype.clone = function() {
    const options = Object.assign({}, this.options);
    const schematype = new this.constructor(this.path, this.schema, options, this.schemaOptions, this.parentSchema);
    schematype.validators = this.validators.slice();
    if (this.requiredValidator !== undefined) {
        schematype.requiredValidator = this.requiredValidator;
    }
    schematype.Constructor.discriminators = Object.assign({}, this.Constructor.discriminators);
    schematype._appliedDiscriminators = this._appliedDiscriminators;
    return schematype;
};
/*!
 * ignore
 */ SchemaDocumentArray.prototype.applyGetters = function(value, scope) {
    return SchemaType.prototype.applyGetters.call(this, value, scope);
};
/**
 * Scopes paths selected in a query to this array.
 * Necessary for proper default application of subdocument values.
 *
 * @param {DocumentArrayPath} array the array to scope `fields` paths
 * @param {Object|undefined} fields the root fields selected in the query
 * @param {Boolean|undefined} init if we are being created part of a query result
 * @api private
 */ function scopePaths(array, fields, init) {
    if (!(init && fields)) {
        return undefined;
    }
    const path = array.path + '.';
    const keys = Object.keys(fields);
    let i = keys.length;
    const selected = {};
    let hasKeys;
    let key;
    let sub;
    while(i--){
        key = keys[i];
        if (key.startsWith(path)) {
            sub = key.substring(path.length);
            if (sub === '$') {
                continue;
            }
            if (sub.startsWith('$.')) {
                sub = sub.substring(2);
            }
            hasKeys || (hasKeys = true);
            selected[sub] = fields[key];
        }
    }
    return hasKeys && selected || undefined;
}
/*!
 * ignore
 */ SchemaDocumentArray.defaultOptions = {};
/**
 * Sets a default option for all DocumentArray instances.
 *
 * #### Example:
 *
 *     // Make all numbers have option `min` equal to 0.
 *     mongoose.Schema.DocumentArray.set('_id', false);
 *
 * @param {String} option The name of the option you'd like to set (e.g. trim, lowercase, etc...)
 * @param {Any} value The value of the option you'd like to set.
 * @return {void}
 * @function set
 * @static
 * @api public
 */ SchemaDocumentArray.set = SchemaType.set;
SchemaDocumentArray.setters = [];
/**
 * Attaches a getter for all DocumentArrayPath instances
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaDocumentArray.get = SchemaType.get;
/*!
 * Handle casting $elemMatch operators
 */ SchemaDocumentArray.prototype.$conditionalHandlers.$elemMatch = cast$elemMatch;
function cast$elemMatch(val, context) {
    const keys = Object.keys(val);
    const numKeys = keys.length;
    for(let i = 0; i < numKeys; ++i){
        const key = keys[i];
        const value = val[key];
        if (isOperator(key) && value != null) {
            val[key] = this.castForQuery(key, value, context);
        }
    }
    // Is this an embedded discriminator and is the discriminator key set?
    // If so, use the discriminator schema. See gh-7449
    const discriminatorKey = this && this.casterConstructor && this.casterConstructor.schema && this.casterConstructor.schema.options && this.casterConstructor.schema.options.discriminatorKey;
    const discriminators = this && this.casterConstructor && this.casterConstructor.schema && this.casterConstructor.schema.discriminators || {};
    if (discriminatorKey != null && val[discriminatorKey] != null && discriminators[val[discriminatorKey]] != null) {
        return cast(discriminators[val[discriminatorKey]], val, null, this && this.$$context);
    }
    const schema = this.casterConstructor.schema ?? context.schema;
    return cast(schema, val, null, this && this.$$context);
}
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaDocumentArray.prototype.toJSONSchema = function toJSONSchema(options) {
    const itemsTypeDefinition = createJSONSchemaTypeDefinition('object', 'object', options?.useBsonType, false);
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return {
        ...createJSONSchemaTypeDefinition('array', 'array', options?.useBsonType, isRequired),
        items: {
            ...itemsTypeDefinition,
            ...this.schema.toJSONSchema(options)
        }
    };
};
/*!
 * Module exports.
 */ module.exports = SchemaDocumentArray;
}),
"[project]/backend/node_modules/mongoose/lib/schema/double.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castDouble = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/double.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
/**
 * Double SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaDouble(path, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, path, options, 'Double', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaDouble.schemaName = 'Double';
SchemaDouble.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaDouble.prototype = Object.create(SchemaType.prototype);
SchemaDouble.prototype.constructor = SchemaDouble;
/*!
 * ignore
 */ SchemaDouble._cast = castDouble;
/**
 * Sets a default option for all Double instances.
 *
 * #### Example:
 *
 *     // Make all Double fields required by default
 *     mongoose.Schema.Double.set('required', true);
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaDouble.set = SchemaType.set;
SchemaDouble.setters = [];
/**
 * Attaches a getter for all Double instances
 *
 * #### Example:
 *
 *     // Converts Double to be a represent milliseconds upon access
 *     mongoose.Schema.Double.get(v => v == null ? '0.000 ms' : v.toString() + ' ms');
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaDouble.get = SchemaType.get;
/*!
 * ignore
 */ SchemaDouble._defaultCaster = (v)=>{
    if (v != null) {
        if (v._bsontype !== 'Double') {
            throw new Error();
        }
    }
    return v;
};
/**
 * Get/set the function used to cast arbitrary values to  IEEE 754-2008 floating points
 *
 * #### Example:
 *
 *     // Make Mongoose cast any NaNs to 0
 *     const defaultCast = mongoose.Schema.Types.Double.cast();
 *     mongoose.Schema.Types.Double.cast(v => {
 *       if (isNaN(v)) {
 *         return 0;
 *       }
 *       return defaultCast(v);
 *     });
 *
 *     // Or disable casting for Doubles entirely (only JS numbers are permitted)
 *     mongoose.Schema.Double.cast(false);
 *
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaDouble.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaDouble._checkRequired = (v)=>v != null;
/**
 * Override the function the required validator uses to check whether a value
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaDouble.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @return {Boolean}
 * @api public
 */ SchemaDouble.prototype.checkRequired = function(value) {
    return this.constructor._checkRequired(value);
};
/**
 * Casts to Double
 *
 * @param {Object} value
 * @param {Object} model this value is optional
 * @api private
 */ SchemaDouble.prototype.cast = function(value) {
    let castDouble;
    if (typeof this._castFunction === 'function') {
        castDouble = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castDouble = this.constructor.cast();
    } else {
        castDouble = SchemaDouble.cast();
    }
    try {
        return castDouble(value);
    } catch (error) {
        throw new CastError('Double', value, this.path, error, this);
    }
};
/*!
 * ignore
 */ function handleSingle(val) {
    return this.cast(val);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$lt` is the function Mongoose calls to cast `$lt` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaDouble
 * @instance
 * @api public
 */ Object.defineProperty(SchemaDouble.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaDouble.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('number', 'double', options?.useBsonType, isRequired);
};
SchemaDouble.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'double';
};
/*!
 * Module exports.
 */ module.exports = SchemaDouble;
}),
"[project]/backend/node_modules/mongoose/lib/schema/int32.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const CastError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/cast.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castInt32 = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/int32.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const handleBitwiseOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/bitwise.js [app-route] (ecmascript)");
/**
 * Int32 SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaInt32(path, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, path, options, 'Int32', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaInt32.schemaName = 'Int32';
SchemaInt32.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaInt32.prototype = Object.create(SchemaType.prototype);
SchemaInt32.prototype.constructor = SchemaInt32;
/*!
 * ignore
 */ SchemaInt32._cast = castInt32;
/**
 * Sets a default option for all Int32 instances.
 *
 * #### Example:
 *
 *     // Make all Int32 fields required by default
 *     mongoose.Schema.Int32.set('required', true);
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaInt32.set = SchemaType.set;
SchemaInt32.setters = [];
/**
 * Attaches a getter for all Int32 instances
 *
 * #### Example:
 *
 *     // Converts int32 to be a represent milliseconds upon access
 *     mongoose.Schema.Int32.get(v => v == null ? '0 ms' : v.toString() + ' ms');
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaInt32.get = SchemaType.get;
/*!
 * ignore
 */ SchemaInt32._defaultCaster = (v)=>{
    const INT32_MAX = 0x7FFFFFFF;
    const INT32_MIN = -0x80000000;
    if (v != null) {
        if (typeof v !== 'number' || v !== (v | 0) || v < INT32_MIN || v > INT32_MAX) {
            throw new Error();
        }
    }
    return v;
};
/**
 * Get/set the function used to cast arbitrary values to 32-bit integers
 *
 * #### Example:
 *
 *     // Make Mongoose cast NaN to 0
 *     const defaultCast = mongoose.Schema.Types.Int32.cast();
 *     mongoose.Schema.Types.Int32.cast(v => {
 *       if (isNaN(v)) {
 *         return 0;
 *       }
 *       return defaultCast(v);
 *     });
 *
 *     // Or disable casting for Int32s entirely (only JS numbers within 32-bit integer bounds and null-ish values are permitted)
 *     mongoose.Schema.Int32.cast(false);
 *
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaInt32.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaInt32._checkRequired = (v)=>v != null;
/**
 * Override the function the required validator uses to check whether a value
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaInt32.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @return {Boolean}
 * @api public
 */ SchemaInt32.prototype.checkRequired = function(value) {
    return this.constructor._checkRequired(value);
};
/**
 * Casts to Int32
 *
 * @param {Object} value
 * @param {Object} model this value is optional
 * @api private
 */ SchemaInt32.prototype.cast = function(value) {
    let castInt32;
    if (typeof this._castFunction === 'function') {
        castInt32 = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castInt32 = this.constructor.cast();
    } else {
        castInt32 = SchemaInt32.cast();
    }
    try {
        return castInt32(value);
    } catch (error) {
        throw new CastError('Int32', value, this.path, error, this);
    }
};
/*!
 * ignore
 */ const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle,
    $bitsAllClear: handleBitwiseOperator,
    $bitsAnyClear: handleBitwiseOperator,
    $bitsAllSet: handleBitwiseOperator,
    $bitsAnySet: handleBitwiseOperator
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$gt` is the function Mongoose calls to cast `$gt` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaInt32
 * @instance
 * @api public
 */ Object.defineProperty(SchemaInt32.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/*!
 * ignore
 */ function handleSingle(val, context) {
    return this.castForQuery(null, val, context);
}
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} val
 * @api private
 */ SchemaInt32.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (handler) {
            return handler.call(this, val);
        }
        return this.applySetters(val, context);
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
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaInt32.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('number', 'int', options?.useBsonType, isRequired);
};
SchemaInt32.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'int';
};
/*!
 * Module exports.
 */ module.exports = SchemaInt32;
}),
"[project]/backend/node_modules/mongoose/lib/schema/map.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ const MongooseMap = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/map.js [app-route] (ecmascript)");
const SchemaMapOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaMapOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/mongooseError.js [app-route] (ecmascript)");
const Schema = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
class SchemaMap extends SchemaType {
    /**
   * Map SchemaType constructor.
   *
   * @param {String} path
   * @param {Object} options
   * @param {Object} schemaOptions
   * @param {Schema} parentSchema
   * @inherits SchemaType
   * @api public
   */ constructor(key, options, schemaOptions, parentSchema){
        super(key, options, 'Map', parentSchema);
        this.$isSchemaMap = true;
        // Create the nested schema type for the map values
        this._createNestedSchemaType(parentSchema, key, options, schemaOptions);
    }
    /**
   * Sets a default option for all Map instances.
   *
   * @param {String} option The option you'd like to set the value for
   * @param {Any} value value for option
   * @return {undefined}
   * @function set
   * @api public
   */ set(option, value) {
        return SchemaType.set(option, value);
    }
    /**
   * Casts to Map
   *
   * @param {Object} value
   * @param {Object} model this value is optional
   * @api private
   */ cast(val, doc, init, prev, options) {
        if (val instanceof MongooseMap) {
            return val;
        }
        const path = this.path;
        if (init) {
            const map = new MongooseMap({}, path, doc, this.$__schemaType, options);
            // Use the map's path for passing to nested casts.
            // If map's parent is a subdocument, use the relative path so nested casts get relative paths.
            const mapPath = map.$__pathRelativeToParent != null ? map.$__pathRelativeToParent : map.$__path;
            if (val instanceof /*TURBOPACK member replacement*/ __turbopack_context__.g.Map) {
                for (const key of val.keys()){
                    let _val = val.get(key);
                    if (_val == null) {
                        _val = map.$__schemaType._castNullish(_val);
                    } else {
                        _val = map.$__schemaType.cast(_val, doc, true, null, {
                            ...options,
                            path: mapPath + '.' + key
                        });
                    }
                    map.$init(key, _val);
                }
            } else {
                for (const key of Object.keys(val)){
                    let _val = val[key];
                    if (_val == null) {
                        _val = map.$__schemaType._castNullish(_val);
                    } else {
                        _val = map.$__schemaType.cast(_val, doc, true, null, {
                            ...options,
                            path: mapPath + '.' + key
                        });
                    }
                    map.$init(key, _val);
                }
            }
            return map;
        }
        return new MongooseMap(val, path, doc, this.$__schemaType, options);
    }
    /**
   * Creates a copy of this map schema type.
   *
   * @api private
   */ clone() {
        const schematype = super.clone();
        if (this.$__schemaType != null) {
            schematype.$__schemaType = this.$__schemaType.clone();
        }
        return schematype;
    }
    /**
   * Returns the embedded schema type (i.e. the `.$*` path)
   *
   * @api public
   */ getEmbeddedSchemaType() {
        return this.$__schemaType;
    }
    /**
   * Returns this schema type's representation in a JSON schema.
   *
   * @param [options]
   * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
   * @returns {Object} JSON schema properties
   */ toJSONSchema(options) {
        const useBsonType = options?.useBsonType;
        const embeddedSchemaType = this.getEmbeddedSchemaType();
        const isRequired = this.options.required && typeof this.options.required !== 'function';
        const result = createJSONSchemaTypeDefinition('object', 'object', useBsonType, isRequired);
        result.additionalProperties = embeddedSchemaType.toJSONSchema(options);
        return result;
    }
    /**
   * Returns the auto encryption type for this schema type.
   *
   * @api public
   */ autoEncryptionType() {
        return 'object';
    }
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaMap.schemaName = 'Map';
SchemaMap.prototype.OptionsConstructor = SchemaMapOptions;
SchemaMap.defaultOptions = {};
/*!
 * ignore
 */ SchemaMap.prototype._createNestedSchemaType = function _createNestedSchemaType(schema, path, obj, options) {
    const mapPath = path + '.$*';
    let _mapType = {
        type: {}
    };
    if (utils.hasUserDefinedProperty(obj, 'of')) {
        const isInlineSchema = utils.isPOJO(obj.of) && Object.keys(obj.of).length > 0 && !utils.hasUserDefinedProperty(obj.of, schema.options.typeKey);
        if (isInlineSchema) {
            _mapType = {
                [schema.options.typeKey]: new Schema(obj.of)
            };
        } else if (utils.isPOJO(obj.of)) {
            _mapType = Object.assign({}, obj.of);
        } else {
            _mapType = {
                [schema.options.typeKey]: obj.of
            };
        }
        if (_mapType[schema.options.typeKey] && _mapType[schema.options.typeKey].instanceOfSchema) {
            const subdocumentSchema = _mapType[schema.options.typeKey];
            subdocumentSchema.eachPath((subpath, type)=>{
                if (type.options.select === true || type.options.select === false) {
                    throw new MongooseError('Cannot use schema-level projections (`select: true` or `select: false`) within maps at path "' + path + '.' + subpath + '"');
                }
            });
        }
        if (utils.hasUserDefinedProperty(obj, 'ref')) {
            _mapType.ref = obj.ref;
        }
    }
    this.$__schemaType = schema.interpretAsType(mapPath, _mapType, options);
};
module.exports = SchemaMap;
}),
"[project]/backend/node_modules/mongoose/lib/schema/objectId.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const SchemaObjectIdOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaObjectIdOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const castObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/objectid.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const getConstructorName = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/getConstructorName.js [app-route] (ecmascript)");
const oid = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/objectid.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
let Document;
/**
 * ObjectId SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaObjectId(key, options, _schemaOptions, parentSchema) {
    const isKeyHexStr = typeof key === 'string' && key.length === 24 && /^[a-f0-9]+$/i.test(key);
    const suppressWarning = options && options.suppressWarning;
    if ((isKeyHexStr || typeof key === 'undefined') && !suppressWarning) {
        utils.warn('mongoose: To create a new ObjectId please try ' + '`Mongoose.Types.ObjectId` instead of using ' + '`Mongoose.Schema.ObjectId`. Set the `suppressWarning` option if ' + 'you\'re trying to create a hex char path in your schema.');
    }
    SchemaType.call(this, key, options, 'ObjectId', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaObjectId.schemaName = 'ObjectId';
SchemaObjectId.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaObjectId.prototype = Object.create(SchemaType.prototype);
SchemaObjectId.prototype.constructor = SchemaObjectId;
SchemaObjectId.prototype.OptionsConstructor = SchemaObjectIdOptions;
/**
 * Attaches a getter for all ObjectId instances
 *
 * #### Example:
 *
 *     // Always convert to string when getting an ObjectId
 *     mongoose.ObjectId.get(v => v.toString());
 *
 *     const Model = mongoose.model('Test', new Schema({}));
 *     typeof (new Model({})._id); // 'string'
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaObjectId.get = SchemaType.get;
/**
 * Sets a default option for all ObjectId instances.
 *
 * #### Example:
 *
 *     // Make all object ids have option `required` equal to true.
 *     mongoose.Schema.ObjectId.set('required', true);
 *
 *     const Order = mongoose.model('Order', new Schema({ userId: ObjectId }));
 *     new Order({ }).validateSync().errors.userId.message; // Path `userId` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaObjectId.set = SchemaType.set;
SchemaObjectId.setters = [];
/**
 * Adds an auto-generated ObjectId default if turnOn is true.
 * @param {Boolean} turnOn auto generated ObjectId defaults
 * @api public
 * @return {SchemaType} this
 */ SchemaObjectId.prototype.auto = function(turnOn) {
    if (turnOn) {
        this.default(defaultId);
        this.set(resetId);
    }
    return this;
};
/*!
 * ignore
 */ SchemaObjectId._checkRequired = (v)=>isBsonType(v, 'ObjectId');
/*!
 * ignore
 */ SchemaObjectId._cast = castObjectId;
/**
 * Get/set the function used to cast arbitrary values to objectids.
 *
 * #### Example:
 *
 *     // Make Mongoose only try to cast length 24 strings. By default, any 12
 *     // char string is a valid ObjectId.
 *     const original = mongoose.ObjectId.cast();
 *     mongoose.ObjectId.cast(v => {
 *       assert.ok(typeof v !== 'string' || v.length === 24);
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.ObjectId.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaObjectId.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaObjectId._defaultCaster = (v)=>{
    if (!isBsonType(v, 'ObjectId')) {
        throw new Error(v + ' is not an instance of ObjectId');
    }
    return v;
};
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * #### Example:
 *
 *     // Allow empty strings to pass `required` check
 *     mongoose.Schema.Types.String.checkRequired(v => v != null);
 *
 *     const M = mongoose.model({ str: { type: String, required: true } });
 *     new M({ str: '' }).validateSync(); // `null`, validation passes!
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaObjectId.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaObjectId.prototype.checkRequired = function checkRequired(value, doc) {
    if (SchemaType._isRef(this, value, doc, true)) {
        return !!value;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaObjectId.checkRequired();
    return _checkRequired(value);
};
/**
 * Casts to ObjectId
 *
 * @param {Object} value
 * @param {Object} doc
 * @param {Boolean} init whether this is an initialization cast
 * @api private
 */ SchemaObjectId.prototype.cast = function(value, doc, init, prev, options) {
    if (!isBsonType(value, 'ObjectId') && SchemaType._isRef(this, value, doc, init)) {
        // wait! we may need to cast this to a document
        if ((getConstructorName(value) || '').toLowerCase() === 'objectid') {
            return new oid(value.toHexString());
        }
        if (value == null || utils.isNonBuiltinObject(value)) {
            return this._castRef(value, doc, init, options);
        }
    }
    let castObjectId;
    if (typeof this._castFunction === 'function') {
        castObjectId = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castObjectId = this.constructor.cast();
    } else {
        castObjectId = SchemaObjectId.cast();
    }
    try {
        return castObjectId(value);
    } catch (error) {
        throw new CastError('ObjectId', value, this.path, error, this);
    }
};
/*!
 * ignore
 */ function handleSingle(val) {
    return this.cast(val);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$in` is the function Mongoose calls to cast `$in` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaObjectId
 * @instance
 * @api public
 */ Object.defineProperty(SchemaObjectId.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/*!
 * ignore
 */ function defaultId() {
    return new oid();
}
defaultId.$runBeforeSetters = true;
function resetId(v) {
    Document || (Document = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/document.js [app-route] (ecmascript)"));
    if (this instanceof Document) {
        if (v === void 0) {
            const _v = new oid();
            return _v;
        }
    }
    return v;
}
/**
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 * @api public
 */ SchemaObjectId.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function' || this.path === '_id';
    return createJSONSchemaTypeDefinition('string', 'objectId', options?.useBsonType, isRequired);
};
SchemaObjectId.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'objectId';
};
/*!
 * Module exports.
 */ module.exports = SchemaObjectId;
}),
"[project]/backend/node_modules/mongoose/lib/schema/string.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const MongooseError = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/error/index.js [app-route] (ecmascript)");
const SchemaStringOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaStringOptions.js [app-route] (ecmascript)");
const castString = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/string.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const isBsonType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/isBsonType.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
/**
 * String SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaString(key, options, _schemaOptions, parentSchema) {
    this.enumValues = [];
    this.regExp = null;
    SchemaType.call(this, key, options, 'String', parentSchema);
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaString.schemaName = 'String';
SchemaString.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaString.prototype = Object.create(SchemaType.prototype);
SchemaString.prototype.constructor = SchemaString;
Object.defineProperty(SchemaString.prototype, 'OptionsConstructor', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: SchemaStringOptions
});
/*!
 * ignore
 */ SchemaString._cast = castString;
/**
 * Get/set the function used to cast arbitrary values to strings.
 *
 * #### Example:
 *
 *     // Throw an error if you pass in an object. Normally, Mongoose allows
 *     // objects with custom `toString()` functions.
 *     const original = mongoose.Schema.Types.String.cast();
 *     mongoose.Schema.Types.String.cast(v => {
 *       assert.ok(v == null || typeof v !== 'object');
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.Schema.Types.String.cast(false);
 *
 * @param {Function} caster
 * @return {Function}
 * @function cast
 * @static
 * @api public
 */ SchemaString.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaString._defaultCaster = (v)=>{
    if (v != null && typeof v !== 'string') {
        throw new Error();
    }
    return v;
};
/**
 * Attaches a getter for all String instances.
 *
 * #### Example:
 *
 *     // Make all numbers round down
 *     mongoose.Schema.String.get(v => v.toLowerCase());
 *
 *     const Model = mongoose.model('Test', new Schema({ test: String }));
 *     new Model({ test: 'FOO' }).test; // 'foo'
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaString.get = SchemaType.get;
/**
 * Sets a default option for all String instances.
 *
 * #### Example:
 *
 *     // Make all strings have option `trim` equal to true.
 *     mongoose.Schema.String.set('trim', true);
 *
 *     const User = mongoose.model('User', new Schema({ name: String }));
 *     new User({ name: '   John Doe   ' }).name; // 'John Doe'
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaString.set = SchemaType.set;
SchemaString.setters = [];
/*!
 * ignore
 */ SchemaString._checkRequired = (v)=>(v instanceof String || typeof v === 'string') && v.length;
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * #### Example:
 *
 *     // Allow empty strings to pass `required` check
 *     mongoose.Schema.Types.String.checkRequired(v => v != null);
 *
 *     const M = mongoose.model({ str: { type: String, required: true } });
 *     new M({ str: '' }).validateSync(); // `null`, validation passes!
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaString.checkRequired = SchemaType.checkRequired;
/**
 * Adds an enum validator
 *
 * #### Example:
 *
 *     const states = ['opening', 'open', 'closing', 'closed']
 *     const s = new Schema({ state: { type: String, enum: states }})
 *     const M = db.model('M', s)
 *     const m = new M({ state: 'invalid' })
 *     await m.save()
 *       .catch((err) => console.error(err)); // ValidationError: `invalid` is not a valid enum value for path `state`.
 *     m.state = 'open';
 *     await m.save();
 *     // success
 *
 *     // or with custom error messages
 *     const enum = {
 *       values: ['opening', 'open', 'closing', 'closed'],
 *       message: 'enum validator failed for path `{PATH}` with value `{VALUE}`'
 *     }
 *     const s = new Schema({ state: { type: String, enum: enum })
 *     const M = db.model('M', s)
 *     const m = new M({ state: 'invalid' })
 *     await m.save()
 *       .catch((err) => console.error(err)); // ValidationError: enum validator failed for path `state` with value `invalid`
 *     m.state = 'open';
 *     await m.save();
 *     // success
 *
 * @param {...String|Object} [args] enumeration values
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @see Enums in JavaScript https://masteringjs.io/tutorials/fundamentals/enum
 * @api public
 */ SchemaString.prototype.enum = function() {
    if (this.enumValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.enumValidator;
        }, this);
        this.enumValidator = false;
    }
    if (arguments[0] === void 0 || arguments[0] === false) {
        return this;
    }
    let values;
    let errorMessage;
    if (utils.isObject(arguments[0])) {
        if (Array.isArray(arguments[0].values)) {
            values = arguments[0].values;
            errorMessage = arguments[0].message;
        } else {
            values = utils.object.vals(arguments[0]);
            errorMessage = MongooseError.messages.String.enum;
        }
    } else {
        values = arguments;
        errorMessage = MongooseError.messages.String.enum;
    }
    for (const value of values){
        if (value !== undefined) {
            this.enumValues.push(this.cast(value));
        }
    }
    const vals = this.enumValues;
    this.enumValidator = function(v) {
        return null == v || ~vals.indexOf(v);
    };
    this.validators.push({
        validator: this.enumValidator,
        message: errorMessage,
        type: 'enum',
        enumValues: vals
    });
    return this;
};
/**
 * Adds a lowercase [setter](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.set()).
 *
 * #### Example:
 *
 *     const s = new Schema({ email: { type: String, lowercase: true }})
 *     const M = db.model('M', s);
 *     const m = new M({ email: 'SomeEmail@example.COM' });
 *     console.log(m.email) // someemail@example.com
 *     M.find({ email: 'SomeEmail@example.com' }); // Queries by 'someemail@example.com'
 *
 * Note that `lowercase` does **not** affect regular expression queries:
 *
 * #### Example:
 *
 *     // Still queries for documents whose `email` matches the regular
 *     // expression /SomeEmail/. Mongoose does **not** convert the RegExp
 *     // to lowercase.
 *     M.find({ email: /SomeEmail/ });
 *
 * @api public
 * @return {SchemaType} this
 */ SchemaString.prototype.lowercase = function(shouldApply) {
    if (arguments.length > 0 && !shouldApply) {
        return this;
    }
    return this.set((v)=>{
        if (typeof v !== 'string') {
            v = this.cast(v);
        }
        if (v) {
            return v.toLowerCase();
        }
        return v;
    });
};
/**
 * Adds an uppercase [setter](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.set()).
 *
 * #### Example:
 *
 *     const s = new Schema({ caps: { type: String, uppercase: true }})
 *     const M = db.model('M', s);
 *     const m = new M({ caps: 'an example' });
 *     console.log(m.caps) // AN EXAMPLE
 *     M.find({ caps: 'an example' }) // Matches documents where caps = 'AN EXAMPLE'
 *
 * Note that `uppercase` does **not** affect regular expression queries:
 *
 * #### Example:
 *
 *     // Mongoose does **not** convert the RegExp to uppercase.
 *     M.find({ email: /an example/ });
 *
 * @api public
 * @return {SchemaType} this
 */ SchemaString.prototype.uppercase = function(shouldApply) {
    if (arguments.length > 0 && !shouldApply) {
        return this;
    }
    return this.set((v)=>{
        if (typeof v !== 'string') {
            v = this.cast(v);
        }
        if (v) {
            return v.toUpperCase();
        }
        return v;
    });
};
/**
 * Adds a trim [setter](https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.set()).
 *
 * The string value will be [trimmed](https://masteringjs.io/tutorials/fundamentals/trim-string) when set.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: { type: String, trim: true }});
 *     const M = db.model('M', s);
 *     const string = ' some name ';
 *     console.log(string.length); // 11
 *     const m = new M({ name: string });
 *     console.log(m.name.length); // 9
 *
 *     // Equivalent to `findOne({ name: string.trim() })`
 *     M.findOne({ name: string });
 *
 * Note that `trim` does **not** affect regular expression queries:
 *
 * #### Example:
 *
 *     // Mongoose does **not** trim whitespace from the RegExp.
 *     M.find({ name: / some name / });
 *
 * @api public
 * @return {SchemaType} this
 */ SchemaString.prototype.trim = function(shouldTrim) {
    if (arguments.length > 0 && !shouldTrim) {
        return this;
    }
    return this.set((v)=>{
        if (typeof v !== 'string') {
            v = this.cast(v);
        }
        if (v) {
            return v.trim();
        }
        return v;
    });
};
/**
 * Sets a minimum length validator.
 *
 * #### Example:
 *
 *     const schema = new Schema({ postalCode: { type: String, minLength: 5 })
 *     const Address = db.model('Address', schema)
 *     const address = new Address({ postalCode: '9512' })
 *     address.save(function (err) {
 *       console.error(err) // validator error
 *       address.postalCode = '95125';
 *       address.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MINLENGTH} token which will be replaced with the minimum allowed length
 *     const minLength = [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).'];
 *     const schema = new Schema({ postalCode: { type: String, minLength: minLength })
 *     const Address = mongoose.model('Address', schema);
 *     const address = new Address({ postalCode: '9512' });
 *     address.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `postalCode` (`9512`) is shorter than the minimum length (5).
 *     })
 *
 * @param {Number} value minimum string length
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaString.prototype.minlength = function(value, message) {
    if (this.minlengthValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.minlengthValidator;
        }, this);
    }
    if (value !== null && value !== undefined) {
        let msg = message || MongooseError.messages.String.minlength;
        msg = msg.replace(/{MINLENGTH}/, value);
        this.validators.push({
            validator: this.minlengthValidator = function(v) {
                return v === null || v.length >= value;
            },
            message: msg,
            type: 'minlength',
            minlength: value
        });
    }
    return this;
};
SchemaString.prototype.minLength = SchemaString.prototype.minlength;
/**
 * Sets a maximum length validator.
 *
 * #### Example:
 *
 *     const schema = new Schema({ postalCode: { type: String, maxlength: 9 })
 *     const Address = db.model('Address', schema)
 *     const address = new Address({ postalCode: '9512512345' })
 *     address.save(function (err) {
 *       console.error(err) // validator error
 *       address.postalCode = '95125';
 *       address.save() // success
 *     })
 *
 *     // custom error messages
 *     // We can also use the special {MAXLENGTH} token which will be replaced with the maximum allowed length
 *     const maxlength = [9, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).'];
 *     const schema = new Schema({ postalCode: { type: String, maxlength: maxlength })
 *     const Address = mongoose.model('Address', schema);
 *     const address = new Address({ postalCode: '9512512345' });
 *     address.validate(function (err) {
 *       console.log(String(err)) // ValidationError: The value of path `postalCode` (`9512512345`) exceeds the maximum allowed length (9).
 *     })
 *
 * @param {Number} value maximum string length
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaString.prototype.maxlength = function(value, message) {
    if (this.maxlengthValidator) {
        this.validators = this.validators.filter(function(v) {
            return v.validator !== this.maxlengthValidator;
        }, this);
    }
    if (value !== null && value !== undefined) {
        let msg = message || MongooseError.messages.String.maxlength;
        msg = msg.replace(/{MAXLENGTH}/, value);
        this.validators.push({
            validator: this.maxlengthValidator = function(v) {
                return v === null || v.length <= value;
            },
            message: msg,
            type: 'maxlength',
            maxlength: value
        });
    }
    return this;
};
SchemaString.prototype.maxLength = SchemaString.prototype.maxlength;
/**
 * Sets a regexp validator.
 *
 * Any value that does not pass `regExp`.test(val) will fail validation.
 *
 * #### Example:
 *
 *     const s = new Schema({ name: { type: String, match: /^a/ }})
 *     const M = db.model('M', s)
 *     const m = new M({ name: 'I am invalid' })
 *     m.validate(function (err) {
 *       console.error(String(err)) // "ValidationError: Path `name` is invalid (I am invalid)."
 *       m.name = 'apples'
 *       m.validate(function (err) {
 *         assert.ok(err) // success
 *       })
 *     })
 *
 *     // using a custom error message
 *     const match = [ /\.html$/, "That file doesn't end in .html ({VALUE})" ];
 *     const s = new Schema({ file: { type: String, match: match }})
 *     const M = db.model('M', s);
 *     const m = new M({ file: 'invalid' });
 *     m.validate(function (err) {
 *       console.log(String(err)) // "ValidationError: That file doesn't end in .html (invalid)"
 *     })
 *
 * Empty strings, `undefined`, and `null` values always pass the match validator. If you require these values, enable the `required` validator also.
 *
 *     const s = new Schema({ name: { type: String, match: /^a/, required: true }})
 *
 * @param {RegExp} regExp regular expression to test against
 * @param {String} [message] optional custom error message
 * @return {SchemaType} this
 * @see Customized Error Messages https://mongoosejs.com/docs/api/error.html#Error.messages
 * @api public
 */ SchemaString.prototype.match = function match(regExp, message) {
    // yes, we allow multiple match validators
    const msg = message || MongooseError.messages.String.match;
    const matchValidator = function(v) {
        if (!regExp) {
            return false;
        }
        // In case RegExp happens to have `/g` flag set, we need to reset the
        // `lastIndex`, otherwise `match` will intermittently fail.
        regExp.lastIndex = 0;
        const ret = v != null && v !== '' ? regExp.test(v) : true;
        return ret;
    };
    this.validators.push({
        validator: matchValidator,
        message: msg,
        type: 'regexp',
        regexp: regExp
    });
    return this;
};
/**
 * Check if the given value satisfies the `required` validator. The value is
 * considered valid if it is a string (that is, not `null` or `undefined`) and
 * has positive length. The `required` validator **will** fail for empty
 * strings.
 *
 * @param {Any} value
 * @param {Document} doc
 * @return {Boolean}
 * @api public
 */ SchemaString.prototype.checkRequired = function checkRequired(value, doc) {
    if (typeof value === 'object' && SchemaType._isRef(this, value, doc, true)) {
        return value != null;
    }
    // `require('util').inherits()` does **not** copy static properties, and
    // plugins like mongoose-float use `inherits()` for pre-ES6.
    const _checkRequired = typeof this.constructor.checkRequired === 'function' ? this.constructor.checkRequired() : SchemaString.checkRequired();
    return _checkRequired(value);
};
/**
 * Casts to String
 *
 * @api private
 */ SchemaString.prototype.cast = function(value, doc, init, prev, options) {
    if (typeof value !== 'string' && SchemaType._isRef(this, value, doc, init)) {
        return this._castRef(value, doc, init, options);
    }
    let castString;
    if (typeof this._castFunction === 'function') {
        castString = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castString = this.constructor.cast();
    } else {
        castString = SchemaString.cast();
    }
    try {
        return castString(value);
    } catch (error) {
        throw new CastError('string', value, this.path, null, this);
    }
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
/*!
 * ignore
 */ function handleSingleNoSetters(val) {
    if (val == null) {
        return this._castNullish(val);
    }
    return this.cast(val, this);
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $all: handleArray,
    $gt: handleSingle,
    $gte: handleSingle,
    $lt: handleSingle,
    $lte: handleSingle,
    $options: handleSingleNoSetters,
    $regex: function handle$regex(val) {
        if (Object.prototype.toString.call(val) === '[object RegExp]') {
            return val;
        }
        return handleSingleNoSetters.call(this, val);
    },
    $not: handleSingle
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$exists` is the function Mongoose calls to cast `$exists` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaString
 * @instance
 * @api public
 */ Object.defineProperty(SchemaString.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} [val]
 * @api private
 */ SchemaString.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) {
            throw new Error('Can\'t use ' + $conditional + ' with String.');
        }
        return handler.call(this, val, context);
    }
    if (Object.prototype.toString.call(val) === '[object RegExp]' || isBsonType(val, 'BSONRegExp')) {
        return val;
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
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaString.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'string', options?.useBsonType, isRequired);
};
SchemaString.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'string';
};
/*!
 * Module exports.
 */ module.exports = SchemaString;
}),
"[project]/backend/node_modules/mongoose/lib/schema/uuid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const MongooseBuffer = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/types/buffer.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const CastError = SchemaType.CastError;
const castUUID = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/cast/uuid.js [app-route] (ecmascript)");
const createJSONSchemaTypeDefinition = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/helpers/createJSONSchemaTypeDefinition.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/utils.js [app-route] (ecmascript)");
const handleBitwiseOperator = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/operators/bitwise.js [app-route] (ecmascript)");
const UUID_FORMAT = castUUID.UUID_FORMAT;
const Binary = MongooseBuffer.Binary;
/**
 * Convert binary to a uuid string
 * @param {Buffer|Binary|String} uuidBin The value to process
 * @returns {String} The completed uuid-string
 * @api private
 */ function binaryToString(uuidBin) {
    // i(hasezoey) dont quite know why, but "uuidBin" may sometimes also be the already processed string
    let hex;
    if (typeof uuidBin !== 'string' && uuidBin != null) {
        hex = uuidBin.toString('hex');
        const uuidStr = hex.substring(0, 8) + '-' + hex.substring(8, 8 + 4) + '-' + hex.substring(12, 12 + 4) + '-' + hex.substring(16, 16 + 4) + '-' + hex.substring(20, 20 + 12);
        return uuidStr;
    }
    return uuidBin;
}
/**
 * UUIDv1 SchemaType constructor.
 *
 * @param {String} key
 * @param {Object} options
 * @param {Object} _schemaOptions
 * @param {Schema} parentSchema
 * @inherits SchemaType
 * @api public
 */ function SchemaUUID(key, options, _schemaOptions, parentSchema) {
    SchemaType.call(this, key, options, 'UUID', parentSchema);
    this.getters.push(function(value) {
        // For populated
        if (value != null && value.$__ != null) {
            return value;
        }
        if (Buffer.isBuffer(value)) {
            return binaryToString(value);
        } else if (value instanceof Binary) {
            return binaryToString(value.buffer);
        } else if (utils.isPOJO(value) && value.type === 'Buffer' && Array.isArray(value.data)) {
            // Cloned buffers look like `{ type: 'Buffer', data: [5, 224, ...] }`
            return binaryToString(Buffer.from(value.data));
        }
        return value;
    });
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ SchemaUUID.schemaName = 'UUID';
SchemaUUID.defaultOptions = {};
/*!
 * Inherits from SchemaType.
 */ SchemaUUID.prototype = Object.create(SchemaType.prototype);
SchemaUUID.prototype.constructor = SchemaUUID;
/*!
 * ignore
 */ SchemaUUID._cast = castUUID;
/**
 * Attaches a getter for all UUID instances.
 *
 * #### Example:
 *
 *     // Note that `v` is a string by default
 *     mongoose.Schema.UUID.get(v => v.toUpperCase());
 *
 *     const Model = mongoose.model('Test', new Schema({ test: 'UUID' }));
 *     new Model({ test: uuid.v4() }).test; // UUID with all uppercase
 *
 * @param {Function} getter
 * @return {this}
 * @function get
 * @static
 * @api public
 */ SchemaUUID.get = SchemaType.get;
/**
 * Sets a default option for all UUID instances.
 *
 * #### Example:
 *
 *     // Make all UUIDs have `required` of true by default.
 *     mongoose.Schema.UUID.set('required', true);
 *
 *     const User = mongoose.model('User', new Schema({ test: mongoose.UUID }));
 *     new User({ }).validateSync().errors.test.message; // Path `test` is required.
 *
 * @param {String} option The option you'd like to set the value for
 * @param {Any} value value for option
 * @return {undefined}
 * @function set
 * @static
 * @api public
 */ SchemaUUID.set = SchemaType.set;
SchemaUUID.setters = [];
/**
 * Get/set the function used to cast arbitrary values to UUIDs.
 *
 * #### Example:
 *
 *     // Make Mongoose refuse to cast UUIDs with 0 length
 *     const original = mongoose.Schema.Types.UUID.cast();
 *     mongoose.UUID.cast(v => {
 *       assert.ok(typeof v === "string" && v.length > 0);
 *       return original(v);
 *     });
 *
 *     // Or disable casting entirely
 *     mongoose.UUID.cast(false);
 *
 * @param {Function} [caster]
 * @return {Function}
 * @function get
 * @static
 * @api public
 */ SchemaUUID.cast = function cast(caster) {
    if (arguments.length === 0) {
        return this._cast;
    }
    if (caster === false) {
        caster = this._defaultCaster;
    }
    this._cast = caster;
    return this._cast;
};
/*!
 * ignore
 */ SchemaUUID._checkRequired = (v)=>v != null;
/**
 * Override the function the required validator uses to check whether a string
 * passes the `required` check.
 *
 * @param {Function} fn
 * @return {Function}
 * @function checkRequired
 * @static
 * @api public
 */ SchemaUUID.checkRequired = SchemaType.checkRequired;
/**
 * Check if the given value satisfies a required validator.
 *
 * @param {Any} value
 * @return {Boolean}
 * @api public
 */ SchemaUUID.prototype.checkRequired = function checkRequired(value) {
    if (Buffer.isBuffer(value)) {
        value = binaryToString(value);
    }
    return value != null && UUID_FORMAT.test(value);
};
/**
 * Casts to UUID
 *
 * @param {Object} value
 * @param {Object} doc
 * @param {Boolean} init whether this is an initialization cast
 * @api private
 */ SchemaUUID.prototype.cast = function(value, doc, init, prev, options) {
    if (utils.isNonBuiltinObject(value) && SchemaType._isRef(this, value, doc, init)) {
        return this._castRef(value, doc, init, options);
    }
    let castFn;
    if (typeof this._castFunction === 'function') {
        castFn = this._castFunction;
    } else if (typeof this.constructor.cast === 'function') {
        castFn = this.constructor.cast();
    } else {
        castFn = SchemaUUID.cast();
    }
    try {
        return castFn(value);
    } catch (error) {
        throw new CastError(SchemaUUID.schemaName, value, this.path, error, this);
    }
};
/*!
 * ignore
 */ function handleSingle(val) {
    return this.cast(val);
}
/*!
 * ignore
 */ function handleArray(val) {
    return val.map((m)=>{
        return this.cast(m);
    });
}
const $conditionalHandlers = {
    ...SchemaType.prototype.$conditionalHandlers,
    $bitsAllClear: handleBitwiseOperator,
    $bitsAnyClear: handleBitwiseOperator,
    $bitsAllSet: handleBitwiseOperator,
    $bitsAnySet: handleBitwiseOperator,
    $all: handleArray,
    $gt: handleSingle,
    $gte: handleSingle,
    $in: handleArray,
    $lt: handleSingle,
    $lte: handleSingle,
    $ne: handleSingle,
    $nin: handleArray
};
/**
 * Contains the handlers for different query operators for this schema type.
 * For example, `$conditionalHandlers.$exists` is the function Mongoose calls to cast `$exists` filter operators.
 *
 * @property $conditionalHandlers
 * @memberOf SchemaUUID
 * @instance
 * @api public
 */ Object.defineProperty(SchemaUUID.prototype, '$conditionalHandlers', {
    enumerable: false,
    value: $conditionalHandlers
});
/**
 * Casts contents for queries.
 *
 * @param {String} $conditional
 * @param {any} val
 * @api private
 */ SchemaUUID.prototype.castForQuery = function($conditional, val, context) {
    let handler;
    if ($conditional != null) {
        handler = this.$conditionalHandlers[$conditional];
        if (!handler) throw new Error('Can\'t use ' + $conditional + ' with UUID.');
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
 * Returns this schema type's representation in a JSON schema.
 *
 * @param [options]
 * @param [options.useBsonType=false] If true, return a representation with `bsonType` for use with MongoDB's `$jsonSchema`.
 * @returns {Object} JSON schema properties
 */ SchemaUUID.prototype.toJSONSchema = function toJSONSchema(options) {
    const isRequired = this.options.required && typeof this.options.required !== 'function';
    return createJSONSchemaTypeDefinition('string', 'binData', options?.useBsonType, isRequired);
};
SchemaUUID.prototype.autoEncryptionType = function autoEncryptionType() {
    return 'binData';
};
/*!
 * Module exports.
 */ module.exports = SchemaUUID;
}),
"[project]/backend/node_modules/mongoose/lib/schema/union.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * ignore
 */ const SchemaUnionOptions = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/options/schemaUnionOptions.js [app-route] (ecmascript)");
const SchemaType = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schemaType.js [app-route] (ecmascript)");
const firstValueSymbol = Symbol('firstValue');
/*!
 * ignore
 */ class Union extends SchemaType {
    /**
   * Create a Union schema type.
   *
   * @param {String} key the path in the schema for this schema type
   * @param {Object} options SchemaType-specific options (must have 'of' as array)
   * @param {Object} schemaOptions additional options from the schema this schematype belongs to
   * @param {Schema} parentSchema the schema this schematype belongs to
   */ constructor(key, options, schemaOptions, parentSchema){
        super(key, options, 'Union', parentSchema);
        if (!options || !Array.isArray(options.of) || options.of.length === 0) {
            throw new Error('Union schema type requires an array of types');
        }
        this.schemaTypes = options.of.map((obj)=>parentSchema.interpretAsType(key, obj, schemaOptions));
    }
    cast(val, doc, init, prev, options) {
        let firstValue = firstValueSymbol;
        let lastError;
        // Loop through each schema type in the union. If one of the schematypes returns a value that is `=== val`, then
        // use `val`. Otherwise, if one of the schematypes casted successfully, use the first successfully casted value.
        // Finally, if none of the schematypes casted successfully, throw the error from the last schema type in the union.
        // The `=== val` check is a workaround to ensure that the original value is returned if it matches one of the schema types,
        // avoiding cases like where numbers are casted to strings or dates even if the schema type is a number.
        for(let i = 0; i < this.schemaTypes.length; ++i){
            try {
                const casted = this.schemaTypes[i].cast(val, doc, init, prev, options);
                if (casted === val) {
                    return casted;
                }
                if (firstValue === firstValueSymbol) {
                    firstValue = casted;
                }
            } catch (error) {
                lastError = error;
            }
        }
        if (firstValue !== firstValueSymbol) {
            return firstValue;
        }
        throw lastError;
    }
    // Setters also need to be aware of casting - we need to apply the setters of the entry in the union we choose.
    applySetters(val, doc, init, prev, options) {
        let firstValue = firstValueSymbol;
        let lastError;
        // Loop through each schema type in the union. If one of the schematypes returns a value that is `=== val`, then
        // use `val`. Otherwise, if one of the schematypes casted successfully, use the first successfully casted value.
        // Finally, if none of the schematypes casted successfully, throw the error from the last schema type in the union.
        // The `=== val` check is a workaround to ensure that the original value is returned if it matches one of the schema types,
        // avoiding cases like where numbers are casted to strings or dates even if the schema type is a number.
        for(let i = 0; i < this.schemaTypes.length; ++i){
            try {
                let castedVal = this.schemaTypes[i]._applySetters(val, doc, init, prev, options);
                if (castedVal == null) {
                    castedVal = this.schemaTypes[i]._castNullish(castedVal);
                } else {
                    castedVal = this.schemaTypes[i].cast(castedVal, doc, init, prev, options);
                }
                if (castedVal === val) {
                    return castedVal;
                }
                if (firstValue === firstValueSymbol) {
                    firstValue = castedVal;
                }
            } catch (error) {
                lastError = error;
            }
        }
        if (firstValue !== firstValueSymbol) {
            return firstValue;
        }
        throw lastError;
    }
    clone() {
        const schematype = super.clone();
        schematype.schemaTypes = this.schemaTypes.map((schemaType)=>schemaType.clone());
        return schematype;
    }
}
/**
 * This schema type's name, to defend against minifiers that mangle
 * function names.
 *
 * @api public
 */ Union.schemaName = 'Union';
Union.defaultOptions = {};
Union.prototype.OptionsConstructor = SchemaUnionOptions;
module.exports = Union;
}),
"[project]/backend/node_modules/mongoose/lib/schema/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module exports.
 */ exports.Array = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/array.js [app-route] (ecmascript)");
exports.BigInt = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/bigint.js [app-route] (ecmascript)");
exports.Boolean = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/boolean.js [app-route] (ecmascript)");
exports.Buffer = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/buffer.js [app-route] (ecmascript)");
exports.Date = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/date.js [app-route] (ecmascript)");
exports.Decimal128 = exports.Decimal = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/decimal128.js [app-route] (ecmascript)");
exports.DocumentArray = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/documentArray.js [app-route] (ecmascript)");
exports.Double = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/double.js [app-route] (ecmascript)");
exports.Int32 = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/int32.js [app-route] (ecmascript)");
exports.Map = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/map.js [app-route] (ecmascript)");
exports.Mixed = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/mixed.js [app-route] (ecmascript)");
exports.Number = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/number.js [app-route] (ecmascript)");
exports.ObjectId = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/objectId.js [app-route] (ecmascript)");
exports.String = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/string.js [app-route] (ecmascript)");
exports.Subdocument = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/subdocument.js [app-route] (ecmascript)");
exports.UUID = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/uuid.js [app-route] (ecmascript)");
exports.Union = __turbopack_context__.r("[project]/backend/node_modules/mongoose/lib/schema/union.js [app-route] (ecmascript)");
// alias
exports.Oid = exports.ObjectId;
exports.Object = exports.Mixed;
exports.Bool = exports.Boolean;
exports.ObjectID = exports.ObjectId;
}),
];

//# sourceMappingURL=6d019_mongoose_lib_schema_0698c91f._.js.map