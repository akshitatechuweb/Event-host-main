module.exports = [
"[project]/backend/node_modules/punycode/punycode.es6.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decode",
    ()=>decode,
    "default",
    ()=>__TURBOPACK__default__export__,
    "encode",
    ()=>encode,
    "toASCII",
    ()=>toASCII,
    "toUnicode",
    ()=>toUnicode,
    "ucs2decode",
    ()=>ucs2decode,
    "ucs2encode",
    ()=>ucs2encode
]);
'use strict';
/** Highest positive signed 32-bit float value */ const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
/** Bootstring parameters */ const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = '-'; // '\x2D'
/** Regular expressions */ const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
/** Error messages */ const errors = {
    'overflow': 'Overflow: input needs wider integers to process',
    'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
    'invalid-input': 'Invalid input'
};
/** Convenience shortcuts */ const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;
/*--------------------------------------------------------------------------*/ /**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */ function error(type) {
    throw new RangeError(errors[type]);
}
/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */ function map(array, callback) {
    const result = [];
    let length = array.length;
    while(length--){
        result[length] = callback(array[length]);
    }
    return result;
}
/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {String} A new string of characters returned by the callback
 * function.
 */ function mapDomain(domain, callback) {
    const parts = domain.split('@');
    let result = '';
    if (parts.length > 1) {
        // In email addresses, only the domain name should be punycoded. Leave
        // the local part (i.e. everything up to `@`) intact.
        result = parts[0] + '@';
        domain = parts[1];
    }
    // Avoid `split(regex)` for IE8 compatibility. See #17.
    domain = domain.replace(regexSeparators, '\x2E');
    const labels = domain.split('.');
    const encoded = map(labels, callback).join('.');
    return result + encoded;
}
/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */ function ucs2decode(string) {
    const output = [];
    let counter = 0;
    const length = string.length;
    while(counter < length){
        const value = string.charCodeAt(counter++);
        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // It's a high surrogate, and there is a next character.
            const extra = string.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) {
                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
                // It's an unmatched surrogate; only append this code unit, in case the
                // next code unit is the high surrogate of a surrogate pair.
                output.push(value);
                counter--;
            }
        } else {
            output.push(value);
        }
    }
    return output;
}
/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */ const ucs2encode = (codePoints)=>String.fromCodePoint(...codePoints);
/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */ const basicToDigit = function(codePoint) {
    if (codePoint >= 0x30 && codePoint < 0x3A) {
        return 26 + (codePoint - 0x30);
    }
    if (codePoint >= 0x41 && codePoint < 0x5B) {
        return codePoint - 0x41;
    }
    if (codePoint >= 0x61 && codePoint < 0x7B) {
        return codePoint - 0x61;
    }
    return base;
};
/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */ const digitToBasic = function(digit, flag) {
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};
/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */ const adapt = function(delta, numPoints, firstTime) {
    let k = 0;
    delta = firstTime ? floor(delta / damp) : delta >> 1;
    delta += floor(delta / numPoints);
    for(; delta > baseMinusTMin * tMax >> 1; k += base){
        delta = floor(delta / baseMinusTMin);
    }
    return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};
/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */ const decode = function(input) {
    // Don't use UCS-2.
    const output = [];
    const inputLength = input.length;
    let i = 0;
    let n = initialN;
    let bias = initialBias;
    // Handle the basic code points: let `basic` be the number of input code
    // points before the last delimiter, or `0` if there is none, then copy
    // the first basic code points to the output.
    let basic = input.lastIndexOf(delimiter);
    if (basic < 0) {
        basic = 0;
    }
    for(let j = 0; j < basic; ++j){
        // if it's not a basic code point
        if (input.charCodeAt(j) >= 0x80) {
            error('not-basic');
        }
        output.push(input.charCodeAt(j));
    }
    // Main decoding loop: start just after the last delimiter if any basic code
    // points were copied; start at the beginning otherwise.
    for(let index = basic > 0 ? basic + 1 : 0; index < inputLength;){
        // `index` is the index of the next character to be consumed.
        // Decode a generalized variable-length integer into `delta`,
        // which gets added to `i`. The overflow checking is easier
        // if we increase `i` as we go, then subtract off its starting
        // value at the end to obtain `delta`.
        const oldi = i;
        for(let w = 1, k = base;; k += base){
            if (index >= inputLength) {
                error('invalid-input');
            }
            const digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base) {
                error('invalid-input');
            }
            if (digit > floor((maxInt - i) / w)) {
                error('overflow');
            }
            i += digit * w;
            const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
            if (digit < t) {
                break;
            }
            const baseMinusT = base - t;
            if (w > floor(maxInt / baseMinusT)) {
                error('overflow');
            }
            w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        // `i` was supposed to wrap around from `out` to `0`,
        // incrementing `n` each time, so we'll fix that now:
        if (floor(i / out) > maxInt - n) {
            error('overflow');
        }
        n += floor(i / out);
        i %= out;
        // Insert `n` at position `i` of the output.
        output.splice(i++, 0, n);
    }
    return String.fromCodePoint(...output);
};
/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */ const encode = function(input) {
    const output = [];
    // Convert the input in UCS-2 to an array of Unicode code points.
    input = ucs2decode(input);
    // Cache the length.
    const inputLength = input.length;
    // Initialize the state.
    let n = initialN;
    let delta = 0;
    let bias = initialBias;
    // Handle the basic code points.
    for (const currentValue of input){
        if (currentValue < 0x80) {
            output.push(stringFromCharCode(currentValue));
        }
    }
    const basicLength = output.length;
    let handledCPCount = basicLength;
    // `handledCPCount` is the number of code points that have been handled;
    // `basicLength` is the number of basic code points.
    // Finish the basic string with a delimiter unless it's empty.
    if (basicLength) {
        output.push(delimiter);
    }
    // Main encoding loop:
    while(handledCPCount < inputLength){
        // All non-basic code points < n have been handled already. Find the next
        // larger one:
        let m = maxInt;
        for (const currentValue of input){
            if (currentValue >= n && currentValue < m) {
                m = currentValue;
            }
        }
        // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
        // but guard against overflow.
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error('overflow');
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input){
            if (currentValue < n && ++delta > maxInt) {
                error('overflow');
            }
            if (currentValue === n) {
                // Represent delta as a generalized variable-length integer.
                let q = delta;
                for(let k = base;; k += base){
                    const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                    if (q < t) {
                        break;
                    }
                    const qMinusT = q - t;
                    const baseMinusT = base - t;
                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                    q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
                delta = 0;
                ++handledCPCount;
            }
        }
        ++delta;
        ++n;
    }
    return output.join('');
};
/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */ const toUnicode = function(input) {
    return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
    });
};
/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */ const toASCII = function(input) {
    return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
    });
};
/*--------------------------------------------------------------------------*/ /** Define the public API */ const punycode = {
    /**
	 * A string representing the current Punycode.js version number.
	 * @memberOf punycode
	 * @type String
	 */ 'version': '2.3.1',
    /**
	 * An object of methods to convert from JavaScript's internal character
	 * representation (UCS-2) to Unicode code points, and back.
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode
	 * @type Object
	 */ 'ucs2': {
        'decode': ucs2decode,
        'encode': ucs2encode
    },
    'decode': decode,
    'encode': encode,
    'toASCII': toASCII,
    'toUnicode': toUnicode
};
;
const __TURBOPACK__default__export__ = punycode;
}),
"[project]/backend/node_modules/whatwg-url/lib/infra.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Note that we take code points as JS numbers, not JS strings.
function isASCIIDigit(c) {
    return c >= 0x30 && c <= 0x39;
}
function isASCIIAlpha(c) {
    return c >= 0x41 && c <= 0x5A || c >= 0x61 && c <= 0x7A;
}
function isASCIIAlphanumeric(c) {
    return isASCIIAlpha(c) || isASCIIDigit(c);
}
function isASCIIHex(c) {
    return isASCIIDigit(c) || c >= 0x41 && c <= 0x46 || c >= 0x61 && c <= 0x66;
}
module.exports = {
    isASCIIDigit,
    isASCIIAlpha,
    isASCIIAlphanumeric,
    isASCIIHex
};
}),
"[project]/backend/node_modules/whatwg-url/lib/encoding.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", {
    ignoreBOM: true
});
function utf8Encode(string) {
    return utf8Encoder.encode(string);
}
function utf8DecodeWithoutBOM(bytes) {
    return utf8Decoder.decode(bytes);
}
module.exports = {
    utf8Encode,
    utf8DecodeWithoutBOM
};
}),
"[project]/backend/node_modules/whatwg-url/lib/percent-encoding.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { isASCIIHex } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/infra.js [app-route] (ecmascript)");
const { utf8Encode } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/encoding.js [app-route] (ecmascript)");
function p(char) {
    return char.codePointAt(0);
}
// https://url.spec.whatwg.org/#percent-encode
function percentEncode(c) {
    let hex = c.toString(16).toUpperCase();
    if (hex.length === 1) {
        hex = `0${hex}`;
    }
    return `%${hex}`;
}
// https://url.spec.whatwg.org/#percent-decode
function percentDecodeBytes(input) {
    const output = new Uint8Array(input.byteLength);
    let outputIndex = 0;
    for(let i = 0; i < input.byteLength; ++i){
        const byte = input[i];
        if (byte !== 0x25) {
            output[outputIndex++] = byte;
        } else if (byte === 0x25 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
            output[outputIndex++] = byte;
        } else {
            const bytePoint = parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16);
            output[outputIndex++] = bytePoint;
            i += 2;
        }
    }
    return output.slice(0, outputIndex);
}
// https://url.spec.whatwg.org/#string-percent-decode
function percentDecodeString(input) {
    const bytes = utf8Encode(input);
    return percentDecodeBytes(bytes);
}
// https://url.spec.whatwg.org/#c0-control-percent-encode-set
function isC0ControlPercentEncode(c) {
    return c <= 0x1F || c > 0x7E;
}
// https://url.spec.whatwg.org/#fragment-percent-encode-set
const extraFragmentPercentEncodeSet = new Set([
    p(" "),
    p("\""),
    p("<"),
    p(">"),
    p("`")
]);
function isFragmentPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#query-percent-encode-set
const extraQueryPercentEncodeSet = new Set([
    p(" "),
    p("\""),
    p("#"),
    p("<"),
    p(">")
]);
function isQueryPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#special-query-percent-encode-set
function isSpecialQueryPercentEncode(c) {
    return isQueryPercentEncode(c) || c === p("'");
}
// https://url.spec.whatwg.org/#path-percent-encode-set
const extraPathPercentEncodeSet = new Set([
    p("?"),
    p("`"),
    p("{"),
    p("}"),
    p("^")
]);
function isPathPercentEncode(c) {
    return isQueryPercentEncode(c) || extraPathPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#userinfo-percent-encode-set
const extraUserinfoPercentEncodeSet = new Set([
    p("/"),
    p(":"),
    p(";"),
    p("="),
    p("@"),
    p("["),
    p("\\"),
    p("]"),
    p("|")
]);
function isUserinfoPercentEncode(c) {
    return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#component-percent-encode-set
const extraComponentPercentEncodeSet = new Set([
    p("$"),
    p("%"),
    p("&"),
    p("+"),
    p(",")
]);
function isComponentPercentEncode(c) {
    return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set
const extraURLEncodedPercentEncodeSet = new Set([
    p("!"),
    p("'"),
    p("("),
    p(")"),
    p("~")
]);
function isURLEncodedPercentEncode(c) {
    return isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.has(c);
}
// https://url.spec.whatwg.org/#code-point-percent-encode-after-encoding
// https://url.spec.whatwg.org/#utf-8-percent-encode
// Assuming encoding is always utf-8 allows us to trim one of the logic branches. TODO: support encoding.
// The "-Internal" variant here has code points as JS strings. The external version used by other files has code points
// as JS numbers, like the rest of the codebase.
function utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate) {
    const bytes = utf8Encode(codePoint);
    let output = "";
    for (const byte of bytes){
        // Our percentEncodePredicate operates on bytes, not code points, so this is slightly different from the spec.
        if (!percentEncodePredicate(byte)) {
            output += String.fromCharCode(byte);
        } else {
            output += percentEncode(byte);
        }
    }
    return output;
}
function utf8PercentEncodeCodePoint(codePoint, percentEncodePredicate) {
    return utf8PercentEncodeCodePointInternal(String.fromCodePoint(codePoint), percentEncodePredicate);
}
// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
// https://url.spec.whatwg.org/#string-utf-8-percent-encode
function utf8PercentEncodeString(input, percentEncodePredicate, spaceAsPlus = false) {
    let output = "";
    for (const codePoint of input){
        if (spaceAsPlus && codePoint === " ") {
            output += "+";
        } else {
            output += utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate);
        }
    }
    return output;
}
module.exports = {
    isC0ControlPercentEncode,
    isFragmentPercentEncode,
    isQueryPercentEncode,
    isSpecialQueryPercentEncode,
    isPathPercentEncode,
    isUserinfoPercentEncode,
    isURLEncodedPercentEncode,
    percentDecodeString,
    percentDecodeBytes,
    utf8PercentEncodeString,
    utf8PercentEncodeCodePoint
};
}),
"[project]/backend/node_modules/whatwg-url/lib/url-state-machine.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const tr46 = __turbopack_context__.r("[project]/backend/node_modules/tr46/index.js [app-route] (ecmascript)");
const infra = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/infra.js [app-route] (ecmascript)");
const { utf8DecodeWithoutBOM } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/encoding.js [app-route] (ecmascript)");
const { percentDecodeString, utf8PercentEncodeCodePoint, utf8PercentEncodeString, isC0ControlPercentEncode, isFragmentPercentEncode, isQueryPercentEncode, isSpecialQueryPercentEncode, isPathPercentEncode, isUserinfoPercentEncode } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/percent-encoding.js [app-route] (ecmascript)");
function p(char) {
    return char.codePointAt(0);
}
const specialSchemes = {
    ftp: 21,
    file: null,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
};
const failure = Symbol("failure");
function countSymbols(str) {
    return [
        ...str
    ].length;
}
function at(input, idx) {
    const c = input[idx];
    return isNaN(c) ? undefined : String.fromCodePoint(c);
}
function isSingleDot(buffer) {
    return buffer === "." || buffer.toLowerCase() === "%2e";
}
function isDoubleDot(buffer) {
    buffer = buffer.toLowerCase();
    return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
}
function isWindowsDriveLetterCodePoints(cp1, cp2) {
    return infra.isASCIIAlpha(cp1) && (cp2 === p(":") || cp2 === p("|"));
}
function isWindowsDriveLetterString(string) {
    return string.length === 2 && infra.isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
}
function isNormalizedWindowsDriveLetterString(string) {
    return string.length === 2 && infra.isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
}
function containsForbiddenHostCodePoint(string) {
    return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u) !== -1;
}
function containsForbiddenDomainCodePoint(string) {
    return containsForbiddenHostCodePoint(string) || string.search(/[\u0000-\u001F]|%|\u007F/u) !== -1;
}
function isSpecialScheme(scheme) {
    return specialSchemes[scheme] !== undefined;
}
function isSpecial(url) {
    return isSpecialScheme(url.scheme);
}
function isNotSpecial(url) {
    return !isSpecialScheme(url.scheme);
}
function defaultPort(scheme) {
    return specialSchemes[scheme];
}
function parseIPv4Number(input) {
    if (input === "") {
        return failure;
    }
    let R = 10;
    if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
        input = input.substring(2);
        R = 16;
    } else if (input.length >= 2 && input.charAt(0) === "0") {
        input = input.substring(1);
        R = 8;
    }
    if (input === "") {
        return 0;
    }
    let regex = /[^0-7]/u;
    if (R === 10) {
        regex = /[^0-9]/u;
    }
    if (R === 16) {
        regex = /[^0-9A-Fa-f]/u;
    }
    if (regex.test(input)) {
        return failure;
    }
    return parseInt(input, R);
}
function parseIPv4(input) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
        if (parts.length > 1) {
            parts.pop();
        }
    }
    if (parts.length > 4) {
        return failure;
    }
    const numbers = [];
    for (const part of parts){
        const n = parseIPv4Number(part);
        if (n === failure) {
            return failure;
        }
        numbers.push(n);
    }
    for(let i = 0; i < numbers.length - 1; ++i){
        if (numbers[i] > 255) {
            return failure;
        }
    }
    if (numbers[numbers.length - 1] >= 256 ** (5 - numbers.length)) {
        return failure;
    }
    let ipv4 = numbers.pop();
    let counter = 0;
    for (const n of numbers){
        ipv4 += n * 256 ** (3 - counter);
        ++counter;
    }
    return ipv4;
}
function serializeIPv4(address) {
    let output = "";
    let n = address;
    for(let i = 1; i <= 4; ++i){
        output = String(n % 256) + output;
        if (i !== 4) {
            output = `.${output}`;
        }
        n = Math.floor(n / 256);
    }
    return output;
}
function parseIPv6(input) {
    const address = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];
    let pieceIndex = 0;
    let compress = null;
    let pointer = 0;
    input = Array.from(input, (c)=>c.codePointAt(0));
    if (input[pointer] === p(":")) {
        if (input[pointer + 1] !== p(":")) {
            return failure;
        }
        pointer += 2;
        ++pieceIndex;
        compress = pieceIndex;
    }
    while(pointer < input.length){
        if (pieceIndex === 8) {
            return failure;
        }
        if (input[pointer] === p(":")) {
            if (compress !== null) {
                return failure;
            }
            ++pointer;
            ++pieceIndex;
            compress = pieceIndex;
            continue;
        }
        let value = 0;
        let length = 0;
        while(length < 4 && infra.isASCIIHex(input[pointer])){
            value = value * 0x10 + parseInt(at(input, pointer), 16);
            ++pointer;
            ++length;
        }
        if (input[pointer] === p(".")) {
            if (length === 0) {
                return failure;
            }
            pointer -= length;
            if (pieceIndex > 6) {
                return failure;
            }
            let numbersSeen = 0;
            while(input[pointer] !== undefined){
                let ipv4Piece = null;
                if (numbersSeen > 0) {
                    if (input[pointer] === p(".") && numbersSeen < 4) {
                        ++pointer;
                    } else {
                        return failure;
                    }
                }
                if (!infra.isASCIIDigit(input[pointer])) {
                    return failure;
                }
                while(infra.isASCIIDigit(input[pointer])){
                    const number = parseInt(at(input, pointer));
                    if (ipv4Piece === null) {
                        ipv4Piece = number;
                    } else if (ipv4Piece === 0) {
                        return failure;
                    } else {
                        ipv4Piece = ipv4Piece * 10 + number;
                    }
                    if (ipv4Piece > 255) {
                        return failure;
                    }
                    ++pointer;
                }
                address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece;
                ++numbersSeen;
                if (numbersSeen === 2 || numbersSeen === 4) {
                    ++pieceIndex;
                }
            }
            if (numbersSeen !== 4) {
                return failure;
            }
            break;
        } else if (input[pointer] === p(":")) {
            ++pointer;
            if (input[pointer] === undefined) {
                return failure;
            }
        } else if (input[pointer] !== undefined) {
            return failure;
        }
        address[pieceIndex] = value;
        ++pieceIndex;
    }
    if (compress !== null) {
        let swaps = pieceIndex - compress;
        pieceIndex = 7;
        while(pieceIndex !== 0 && swaps > 0){
            const temp = address[compress + swaps - 1];
            address[compress + swaps - 1] = address[pieceIndex];
            address[pieceIndex] = temp;
            --pieceIndex;
            --swaps;
        }
    } else if (compress === null && pieceIndex !== 8) {
        return failure;
    }
    return address;
}
function serializeIPv6(address) {
    let output = "";
    const compress = findTheIPv6AddressCompressedPieceIndex(address);
    let ignore0 = false;
    for(let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex){
        if (ignore0 && address[pieceIndex] === 0) {
            continue;
        } else if (ignore0) {
            ignore0 = false;
        }
        if (compress === pieceIndex) {
            const separator = pieceIndex === 0 ? "::" : ":";
            output += separator;
            ignore0 = true;
            continue;
        }
        output += address[pieceIndex].toString(16);
        if (pieceIndex !== 7) {
            output += ":";
        }
    }
    return output;
}
function parseHost(input, isOpaque = false) {
    if (input[0] === "[") {
        if (input[input.length - 1] !== "]") {
            return failure;
        }
        return parseIPv6(input.substring(1, input.length - 1));
    }
    if (isOpaque) {
        return parseOpaqueHost(input);
    }
    const domain = utf8DecodeWithoutBOM(percentDecodeString(input));
    const asciiDomain = domainToASCII(domain);
    if (asciiDomain === failure) {
        return failure;
    }
    if (endsInANumber(asciiDomain)) {
        return parseIPv4(asciiDomain);
    }
    return asciiDomain;
}
function endsInANumber(input) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
        if (parts.length === 1) {
            return false;
        }
        parts.pop();
    }
    const last = parts[parts.length - 1];
    if (parseIPv4Number(last) !== failure) {
        return true;
    }
    if (/^[0-9]+$/u.test(last)) {
        return true;
    }
    return false;
}
function parseOpaqueHost(input) {
    if (containsForbiddenHostCodePoint(input)) {
        return failure;
    }
    return utf8PercentEncodeString(input, isC0ControlPercentEncode);
}
function findTheIPv6AddressCompressedPieceIndex(address) {
    let longestIndex = null;
    let longestSize = 1; // only find elements > 1
    let foundIndex = null;
    let foundSize = 0;
    for(let pieceIndex = 0; pieceIndex < address.length; ++pieceIndex){
        if (address[pieceIndex] !== 0) {
            if (foundSize > longestSize) {
                longestIndex = foundIndex;
                longestSize = foundSize;
            }
            foundIndex = null;
            foundSize = 0;
        } else {
            if (foundIndex === null) {
                foundIndex = pieceIndex;
            }
            ++foundSize;
        }
    }
    if (foundSize > longestSize) {
        return foundIndex;
    }
    return longestIndex;
}
function serializeHost(host) {
    if (typeof host === "number") {
        return serializeIPv4(host);
    }
    // IPv6 serializer
    if (host instanceof Array) {
        return `[${serializeIPv6(host)}]`;
    }
    return host;
}
function domainToASCII(domain, beStrict = false) {
    const result = tr46.toASCII(domain, {
        checkHyphens: beStrict,
        checkBidi: true,
        checkJoiners: true,
        useSTD3ASCIIRules: beStrict,
        transitionalProcessing: false,
        verifyDNSLength: beStrict,
        ignoreInvalidPunycode: false
    });
    if (result === null) {
        return failure;
    }
    if (!beStrict) {
        if (result === "") {
            return failure;
        }
        if (containsForbiddenDomainCodePoint(result)) {
            return failure;
        }
    }
    return result;
}
function trimControlChars(string) {
    // Avoid using regexp because of this V8 bug: https://issues.chromium.org/issues/42204424
    let start = 0;
    let end = string.length;
    for(; start < end; ++start){
        if (string.charCodeAt(start) > 0x20) {
            break;
        }
    }
    for(; end > start; --end){
        if (string.charCodeAt(end - 1) > 0x20) {
            break;
        }
    }
    return string.substring(start, end);
}
function trimTabAndNewline(url) {
    return url.replace(/\u0009|\u000A|\u000D/ug, "");
}
function shortenPath(url) {
    const { path } = url;
    if (path.length === 0) {
        return;
    }
    if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
        return;
    }
    path.pop();
}
function includesCredentials(url) {
    return url.username !== "" || url.password !== "";
}
function cannotHaveAUsernamePasswordPort(url) {
    return url.host === null || url.host === "" || url.scheme === "file";
}
function hasAnOpaquePath(url) {
    return typeof url.path === "string";
}
function isNormalizedWindowsDriveLetter(string) {
    return /^[A-Za-z]:$/u.test(string);
}
function URLStateMachine(input, base, encodingOverride, url, stateOverride) {
    this.pointer = 0;
    this.input = input;
    this.base = base || null;
    this.encodingOverride = encodingOverride || "utf-8";
    this.stateOverride = stateOverride;
    this.url = url;
    this.failure = false;
    this.parseError = false;
    if (!this.url) {
        this.url = {
            scheme: "",
            username: "",
            password: "",
            host: null,
            port: null,
            path: [],
            query: null,
            fragment: null
        };
        const res = trimControlChars(this.input);
        if (res !== this.input) {
            this.parseError = true;
        }
        this.input = res;
    }
    const res = trimTabAndNewline(this.input);
    if (res !== this.input) {
        this.parseError = true;
    }
    this.input = res;
    this.state = stateOverride || "scheme start";
    this.buffer = "";
    this.atFlag = false;
    this.arrFlag = false;
    this.passwordTokenSeenFlag = false;
    this.input = Array.from(this.input, (c)=>c.codePointAt(0));
    for(; this.pointer <= this.input.length; ++this.pointer){
        const c = this.input[this.pointer];
        const cStr = isNaN(c) ? undefined : String.fromCodePoint(c);
        // exec state machine
        const ret = this[`parse ${this.state}`](c, cStr);
        if (!ret) {
            break; // terminate algorithm
        } else if (ret === failure) {
            this.failure = true;
            break;
        }
    }
}
URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
    if (infra.isASCIIAlpha(c)) {
        this.buffer += cStr.toLowerCase();
        this.state = "scheme";
    } else if (!this.stateOverride) {
        this.state = "no scheme";
        --this.pointer;
    } else {
        this.parseError = true;
        return failure;
    }
    return true;
};
URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
    if (infra.isASCIIAlphanumeric(c) || c === p("+") || c === p("-") || c === p(".")) {
        this.buffer += cStr.toLowerCase();
    } else if (c === p(":")) {
        if (this.stateOverride) {
            if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
                return false;
            }
            if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
                return false;
            }
            if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
                return false;
            }
            if (this.url.scheme === "file" && this.url.host === "") {
                return false;
            }
        }
        this.url.scheme = this.buffer;
        if (this.stateOverride) {
            if (this.url.port === defaultPort(this.url.scheme)) {
                this.url.port = null;
            }
            return false;
        }
        this.buffer = "";
        if (this.url.scheme === "file") {
            if (this.input[this.pointer + 1] !== p("/") || this.input[this.pointer + 2] !== p("/")) {
                this.parseError = true;
            }
            this.state = "file";
        } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
            this.state = "special relative or authority";
        } else if (isSpecial(this.url)) {
            this.state = "special authority slashes";
        } else if (this.input[this.pointer + 1] === p("/")) {
            this.state = "path or authority";
            ++this.pointer;
        } else {
            this.url.path = "";
            this.state = "opaque path";
        }
    } else if (!this.stateOverride) {
        this.buffer = "";
        this.state = "no scheme";
        this.pointer = -1;
    } else {
        this.parseError = true;
        return failure;
    }
    return true;
};
URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
    if (this.base === null || hasAnOpaquePath(this.base) && c !== p("#")) {
        return failure;
    } else if (hasAnOpaquePath(this.base) && c === p("#")) {
        this.url.scheme = this.base.scheme;
        this.url.path = this.base.path;
        this.url.query = this.base.query;
        this.url.fragment = "";
        this.state = "fragment";
    } else if (this.base.scheme === "file") {
        this.state = "file";
        --this.pointer;
    } else {
        this.state = "relative";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
    if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
    } else {
        this.parseError = true;
        this.state = "relative";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
    if (c === p("/")) {
        this.state = "authority";
    } else {
        this.state = "path";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
    this.url.scheme = this.base.scheme;
    if (c === p("/")) {
        this.state = "relative slash";
    } else if (isSpecial(this.url) && c === p("\\")) {
        this.parseError = true;
        this.state = "relative slash";
    } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
            this.url.query = "";
            this.state = "query";
        } else if (c === p("#")) {
            this.url.fragment = "";
            this.state = "fragment";
        } else if (!isNaN(c)) {
            this.url.query = null;
            this.url.path.pop();
            this.state = "path";
            --this.pointer;
        }
    }
    return true;
};
URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
    if (isSpecial(this.url) && (c === p("/") || c === p("\\"))) {
        if (c === p("\\")) {
            this.parseError = true;
        }
        this.state = "special authority ignore slashes";
    } else if (c === p("/")) {
        this.state = "authority";
    } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.state = "path";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
    if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
    } else {
        this.parseError = true;
        this.state = "special authority ignore slashes";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
    if (c !== p("/") && c !== p("\\")) {
        this.state = "authority";
        --this.pointer;
    } else {
        this.parseError = true;
    }
    return true;
};
URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
    if (c === p("@")) {
        this.parseError = true;
        if (this.atFlag) {
            this.buffer = `%40${this.buffer}`;
        }
        this.atFlag = true;
        // careful, this is based on buffer and has its own pointer (this.pointer != pointer) and inner chars
        const len = countSymbols(this.buffer);
        for(let pointer = 0; pointer < len; ++pointer){
            const codePoint = this.buffer.codePointAt(pointer);
            if (codePoint === p(":") && !this.passwordTokenSeenFlag) {
                this.passwordTokenSeenFlag = true;
                continue;
            }
            const encodedCodePoints = utf8PercentEncodeCodePoint(codePoint, isUserinfoPercentEncode);
            if (this.passwordTokenSeenFlag) {
                this.url.password += encodedCodePoints;
            } else {
                this.url.username += encodedCodePoints;
            }
        }
        this.buffer = "";
    } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        if (this.atFlag && this.buffer === "") {
            this.parseError = true;
            return failure;
        }
        this.pointer -= countSymbols(this.buffer) + 1;
        this.buffer = "";
        this.state = "host";
    } else {
        this.buffer += cStr;
    }
    return true;
};
URLStateMachine.prototype["parse hostname"] = URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
    if (this.stateOverride && this.url.scheme === "file") {
        --this.pointer;
        this.state = "file host";
    } else if (c === p(":") && !this.arrFlag) {
        if (this.buffer === "") {
            this.parseError = true;
            return failure;
        }
        if (this.stateOverride === "hostname") {
            return false;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
            return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "port";
    } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        --this.pointer;
        if (isSpecial(this.url) && this.buffer === "") {
            this.parseError = true;
            return failure;
        } else if (this.stateOverride && this.buffer === "" && (includesCredentials(this.url) || this.url.port !== null)) {
            this.parseError = true;
            return false;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
            return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "path start";
        if (this.stateOverride) {
            return false;
        }
    } else {
        if (c === p("[")) {
            this.arrFlag = true;
        } else if (c === p("]")) {
            this.arrFlag = false;
        }
        this.buffer += cStr;
    }
    return true;
};
URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
    if (infra.isASCIIDigit(c)) {
        this.buffer += cStr;
    } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\") || this.stateOverride) {
        if (this.buffer !== "") {
            const port = parseInt(this.buffer);
            if (port > 2 ** 16 - 1) {
                this.parseError = true;
                return failure;
            }
            this.url.port = port === defaultPort(this.url.scheme) ? null : port;
            this.buffer = "";
        }
        if (this.stateOverride) {
            return false;
        }
        this.state = "path start";
        --this.pointer;
    } else {
        this.parseError = true;
        return failure;
    }
    return true;
};
const fileOtherwiseCodePoints = new Set([
    p("/"),
    p("\\"),
    p("?"),
    p("#")
]);
function startsWithWindowsDriveLetter(input, pointer) {
    const length = input.length - pointer;
    return length >= 2 && isWindowsDriveLetterCodePoints(input[pointer], input[pointer + 1]) && (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]));
}
URLStateMachine.prototype["parse file"] = function parseFile(c) {
    this.url.scheme = "file";
    this.url.host = "";
    if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
            this.parseError = true;
        }
        this.state = "file slash";
    } else if (this.base !== null && this.base.scheme === "file") {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
            this.url.query = "";
            this.state = "query";
        } else if (c === p("#")) {
            this.url.fragment = "";
            this.state = "fragment";
        } else if (!isNaN(c)) {
            this.url.query = null;
            if (!startsWithWindowsDriveLetter(this.input, this.pointer)) {
                shortenPath(this.url);
            } else {
                this.parseError = true;
                this.url.path = [];
            }
            this.state = "path";
            --this.pointer;
        }
    } else {
        this.state = "path";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
    if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
            this.parseError = true;
        }
        this.state = "file host";
    } else {
        if (this.base !== null && this.base.scheme === "file") {
            if (!startsWithWindowsDriveLetter(this.input, this.pointer) && isNormalizedWindowsDriveLetterString(this.base.path[0])) {
                this.url.path.push(this.base.path[0]);
            }
            this.url.host = this.base.host;
        }
        this.state = "path";
        --this.pointer;
    }
    return true;
};
URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
    if (isNaN(c) || c === p("/") || c === p("\\") || c === p("?") || c === p("#")) {
        --this.pointer;
        if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
            this.parseError = true;
            this.state = "path";
        } else if (this.buffer === "") {
            this.url.host = "";
            if (this.stateOverride) {
                return false;
            }
            this.state = "path start";
        } else {
            let host = parseHost(this.buffer, isNotSpecial(this.url));
            if (host === failure) {
                return failure;
            }
            if (host === "localhost") {
                host = "";
            }
            this.url.host = host;
            if (this.stateOverride) {
                return false;
            }
            this.buffer = "";
            this.state = "path start";
        }
    } else {
        this.buffer += cStr;
    }
    return true;
};
URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
    if (isSpecial(this.url)) {
        if (c === p("\\")) {
            this.parseError = true;
        }
        this.state = "path";
        if (c !== p("/") && c !== p("\\")) {
            --this.pointer;
        }
    } else if (!this.stateOverride && c === p("?")) {
        this.url.query = "";
        this.state = "query";
    } else if (!this.stateOverride && c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
    } else if (c !== undefined) {
        this.state = "path";
        if (c !== p("/")) {
            --this.pointer;
        }
    } else if (this.stateOverride && this.url.host === null) {
        this.url.path.push("");
    }
    return true;
};
URLStateMachine.prototype["parse path"] = function parsePath(c) {
    if (isNaN(c) || c === p("/") || isSpecial(this.url) && c === p("\\") || !this.stateOverride && (c === p("?") || c === p("#"))) {
        if (isSpecial(this.url) && c === p("\\")) {
            this.parseError = true;
        }
        if (isDoubleDot(this.buffer)) {
            shortenPath(this.url);
            if (c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
                this.url.path.push("");
            }
        } else if (isSingleDot(this.buffer) && c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
            this.url.path.push("");
        } else if (!isSingleDot(this.buffer)) {
            if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
                this.buffer = `${this.buffer[0]}:`;
            }
            this.url.path.push(this.buffer);
        }
        this.buffer = "";
        if (c === p("?")) {
            this.url.query = "";
            this.state = "query";
        }
        if (c === p("#")) {
            this.url.fragment = "";
            this.state = "fragment";
        }
    } else {
        // TODO: If c is not a URL code point and not "%", parse error.
        if (c === p("%") && (!infra.isASCIIHex(this.input[this.pointer + 1]) || !infra.isASCIIHex(this.input[this.pointer + 2]))) {
            this.parseError = true;
        }
        this.buffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
    }
    return true;
};
URLStateMachine.prototype["parse opaque path"] = function parseOpaquePath(c) {
    if (c === p("?")) {
        this.url.query = "";
        this.state = "query";
    } else if (c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
    } else if (c === p(" ")) {
        const remaining = this.input[this.pointer + 1];
        if (remaining === p("?") || remaining === p("#")) {
            this.url.path += "%20";
        } else {
            this.url.path += " ";
        }
    } else {
        // TODO: Add: not a URL code point
        if (!isNaN(c) && c !== p("%")) {
            this.parseError = true;
        }
        if (c === p("%") && (!infra.isASCIIHex(this.input[this.pointer + 1]) || !infra.isASCIIHex(this.input[this.pointer + 2]))) {
            this.parseError = true;
        }
        if (!isNaN(c)) {
            this.url.path += utf8PercentEncodeCodePoint(c, isC0ControlPercentEncode);
        }
    }
    return true;
};
URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
    if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
        this.encodingOverride = "utf-8";
    }
    if (!this.stateOverride && c === p("#") || isNaN(c)) {
        const queryPercentEncodePredicate = isSpecial(this.url) ? isSpecialQueryPercentEncode : isQueryPercentEncode;
        this.url.query += utf8PercentEncodeString(this.buffer, queryPercentEncodePredicate);
        this.buffer = "";
        if (c === p("#")) {
            this.url.fragment = "";
            this.state = "fragment";
        }
    } else if (!isNaN(c)) {
        // TODO: If c is not a URL code point and not "%", parse error.
        if (c === p("%") && (!infra.isASCIIHex(this.input[this.pointer + 1]) || !infra.isASCIIHex(this.input[this.pointer + 2]))) {
            this.parseError = true;
        }
        this.buffer += cStr;
    }
    return true;
};
URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
    if (!isNaN(c)) {
        // TODO: If c is not a URL code point and not "%", parse error.
        if (c === p("%") && (!infra.isASCIIHex(this.input[this.pointer + 1]) || !infra.isASCIIHex(this.input[this.pointer + 2]))) {
            this.parseError = true;
        }
        this.url.fragment += utf8PercentEncodeCodePoint(c, isFragmentPercentEncode);
    }
    return true;
};
function serializeURL(url, excludeFragment) {
    let output = `${url.scheme}:`;
    if (url.host !== null) {
        output += "//";
        if (url.username !== "" || url.password !== "") {
            output += url.username;
            if (url.password !== "") {
                output += `:${url.password}`;
            }
            output += "@";
        }
        output += serializeHost(url.host);
        if (url.port !== null) {
            output += `:${url.port}`;
        }
    }
    if (url.host === null && !hasAnOpaquePath(url) && url.path.length > 1 && url.path[0] === "") {
        output += "/.";
    }
    output += serializePath(url);
    if (url.query !== null) {
        output += `?${url.query}`;
    }
    if (!excludeFragment && url.fragment !== null) {
        output += `#${url.fragment}`;
    }
    return output;
}
function serializeOrigin(tuple) {
    let result = `${tuple.scheme}://`;
    result += serializeHost(tuple.host);
    if (tuple.port !== null) {
        result += `:${tuple.port}`;
    }
    return result;
}
function serializePath(url) {
    if (hasAnOpaquePath(url)) {
        return url.path;
    }
    let output = "";
    for (const segment of url.path){
        output += `/${segment}`;
    }
    return output;
}
module.exports.serializeURL = serializeURL;
module.exports.serializePath = serializePath;
module.exports.serializeURLOrigin = function(url) {
    // https://url.spec.whatwg.org/#concept-url-origin
    switch(url.scheme){
        case "blob":
            {
                const pathURL = module.exports.parseURL(serializePath(url));
                if (pathURL === null) {
                    return "null";
                }
                if (pathURL.scheme !== "http" && pathURL.scheme !== "https") {
                    return "null";
                }
                return module.exports.serializeURLOrigin(pathURL);
            }
        case "ftp":
        case "http":
        case "https":
        case "ws":
        case "wss":
            return serializeOrigin({
                scheme: url.scheme,
                host: url.host,
                port: url.port
            });
        case "file":
            // The spec says:
            // > Unfortunate as it is, this is left as an exercise to the reader. When in doubt, return a new opaque origin.
            // Browsers tested so far:
            // - Chrome says "file://", but treats file: URLs as cross-origin for most (all?) purposes; see e.g.
            //   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
            // - Firefox says "null", but treats file: URLs as same-origin sometimes based on directory stuff; see
            //   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs
            return "null";
        default:
            // serializing an opaque origin returns "null"
            return "null";
    }
};
module.exports.basicURLParse = function(input, options) {
    if (options === undefined) {
        options = {};
    }
    const usm = new URLStateMachine(input, options.baseURL, options.encodingOverride, options.url, options.stateOverride);
    if (usm.failure) {
        return null;
    }
    return usm.url;
};
module.exports.setTheUsername = function(url, username) {
    url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
};
module.exports.setThePassword = function(url, password) {
    url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
};
module.exports.serializeHost = serializeHost;
module.exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;
module.exports.hasAnOpaquePath = hasAnOpaquePath;
module.exports.serializeInteger = function(integer) {
    return String(integer);
};
module.exports.parseURL = function(input, options) {
    if (options === undefined) {
        options = {};
    }
    // We don't handle blobs, so this just delegates:
    return module.exports.basicURLParse(input, {
        baseURL: options.baseURL,
        encodingOverride: options.encodingOverride
    });
};
}),
"[project]/backend/node_modules/whatwg-url/lib/urlencoded.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { utf8Encode, utf8DecodeWithoutBOM } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/encoding.js [app-route] (ecmascript)");
const { percentDecodeBytes, utf8PercentEncodeString, isURLEncodedPercentEncode } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/percent-encoding.js [app-route] (ecmascript)");
function p(char) {
    return char.codePointAt(0);
}
// https://url.spec.whatwg.org/#concept-urlencoded-parser
function parseUrlencoded(input) {
    const sequences = strictlySplitByteSequence(input, p("&"));
    const output = [];
    for (const bytes of sequences){
        if (bytes.length === 0) {
            continue;
        }
        let name, value;
        const indexOfEqual = bytes.indexOf(p("="));
        if (indexOfEqual >= 0) {
            name = bytes.slice(0, indexOfEqual);
            value = bytes.slice(indexOfEqual + 1);
        } else {
            name = bytes;
            value = new Uint8Array(0);
        }
        name = replaceByteInByteSequence(name, 0x2B, 0x20);
        value = replaceByteInByteSequence(value, 0x2B, 0x20);
        const nameString = utf8DecodeWithoutBOM(percentDecodeBytes(name));
        const valueString = utf8DecodeWithoutBOM(percentDecodeBytes(value));
        output.push([
            nameString,
            valueString
        ]);
    }
    return output;
}
// https://url.spec.whatwg.org/#concept-urlencoded-string-parser
function parseUrlencodedString(input) {
    return parseUrlencoded(utf8Encode(input));
}
// https://url.spec.whatwg.org/#concept-urlencoded-serializer
function serializeUrlencoded(tuples) {
    // TODO: accept and use encoding argument
    let output = "";
    for (const [i, tuple] of tuples.entries()){
        const name = utf8PercentEncodeString(tuple[0], isURLEncodedPercentEncode, true);
        const value = utf8PercentEncodeString(tuple[1], isURLEncodedPercentEncode, true);
        if (i !== 0) {
            output += "&";
        }
        output += `${name}=${value}`;
    }
    return output;
}
function strictlySplitByteSequence(buf, cp) {
    const list = [];
    let last = 0;
    let i = buf.indexOf(cp);
    while(i >= 0){
        list.push(buf.slice(last, i));
        last = i + 1;
        i = buf.indexOf(cp, last);
    }
    if (last !== buf.length) {
        list.push(buf.slice(last));
    }
    return list;
}
function replaceByteInByteSequence(buf, from, to) {
    let i = buf.indexOf(from);
    while(i >= 0){
        buf[i] = to;
        i = buf.indexOf(from, i + 1);
    }
    return buf;
}
module.exports = {
    parseUrlencodedString,
    serializeUrlencoded
};
}),
"[project]/backend/node_modules/whatwg-url/lib/URLSearchParams-impl.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const urlencoded = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/urlencoded.js [app-route] (ecmascript)");
exports.implementation = class URLSearchParamsImpl {
    constructor(globalObject, constructorArgs, { doNotStripQMark = false }){
        let init = constructorArgs[0];
        this._list = [];
        this._url = null;
        if (!doNotStripQMark && typeof init === "string" && init[0] === "?") {
            init = init.slice(1);
        }
        if (Array.isArray(init)) {
            for (const pair of init){
                if (pair.length !== 2) {
                    throw new TypeError("Failed to construct 'URLSearchParams': parameter 1 sequence's element does not " + "contain exactly two elements.");
                }
                this._list.push([
                    pair[0],
                    pair[1]
                ]);
            }
        } else if (typeof init === "object" && Object.getPrototypeOf(init) === null) {
            for (const name of Object.keys(init)){
                const value = init[name];
                this._list.push([
                    name,
                    value
                ]);
            }
        } else {
            this._list = urlencoded.parseUrlencodedString(init);
        }
    }
    _updateSteps() {
        if (this._url !== null) {
            let serializedQuery = urlencoded.serializeUrlencoded(this._list);
            if (serializedQuery === "") {
                serializedQuery = null;
            }
            this._url._url.query = serializedQuery;
        }
    }
    get size() {
        return this._list.length;
    }
    append(name, value) {
        this._list.push([
            name,
            value
        ]);
        this._updateSteps();
    }
    delete(name, value) {
        let i = 0;
        while(i < this._list.length){
            if (this._list[i][0] === name && (value === undefined || this._list[i][1] === value)) {
                this._list.splice(i, 1);
            } else {
                i++;
            }
        }
        this._updateSteps();
    }
    get(name) {
        for (const tuple of this._list){
            if (tuple[0] === name) {
                return tuple[1];
            }
        }
        return null;
    }
    getAll(name) {
        const output = [];
        for (const tuple of this._list){
            if (tuple[0] === name) {
                output.push(tuple[1]);
            }
        }
        return output;
    }
    has(name, value) {
        for (const tuple of this._list){
            if (tuple[0] === name && (value === undefined || tuple[1] === value)) {
                return true;
            }
        }
        return false;
    }
    set(name, value) {
        let found = false;
        let i = 0;
        while(i < this._list.length){
            if (this._list[i][0] === name) {
                if (found) {
                    this._list.splice(i, 1);
                } else {
                    found = true;
                    this._list[i][1] = value;
                    i++;
                }
            } else {
                i++;
            }
        }
        if (!found) {
            this._list.push([
                name,
                value
            ]);
        }
        this._updateSteps();
    }
    sort() {
        this._list.sort((a, b)=>{
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        });
        this._updateSteps();
    }
    [Symbol.iterator]() {
        return this._list[Symbol.iterator]();
    }
    toString() {
        return urlencoded.serializeUrlencoded(this._list);
    }
};
}),
"[project]/backend/node_modules/whatwg-url/lib/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Returns "Type(value) is Object" in ES terminology.
function isObject(value) {
    return typeof value === "object" && value !== null || typeof value === "function";
}
const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
// Like `Object.assign`, but using `[[GetOwnProperty]]` and `[[DefineOwnProperty]]`
// instead of `[[Get]]` and `[[Set]]` and only allowing objects
function define(target, source) {
    for (const key of Reflect.ownKeys(source)){
        const descriptor = Reflect.getOwnPropertyDescriptor(source, key);
        if (descriptor && !Reflect.defineProperty(target, key, descriptor)) {
            throw new TypeError(`Cannot redefine property: ${String(key)}`);
        }
    }
}
function newObjectInRealm(globalObject, object) {
    const ctorRegistry = initCtorRegistry(globalObject);
    return Object.defineProperties(Object.create(ctorRegistry["%Object.prototype%"]), Object.getOwnPropertyDescriptors(object));
}
const wrapperSymbol = Symbol("wrapper");
const implSymbol = Symbol("impl");
const sameObjectCaches = Symbol("SameObject caches");
const ctorRegistrySymbol = Symbol.for("[webidl2js] constructor registry");
const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function*() {}).prototype);
function initCtorRegistry(globalObject) {
    if (hasOwn(globalObject, ctorRegistrySymbol)) {
        return globalObject[ctorRegistrySymbol];
    }
    const ctorRegistry = Object.create(null);
    // In addition to registering all the WebIDL2JS-generated types in the constructor registry,
    // we also register a few intrinsics that we make use of in generated code, since they are not
    // easy to grab from the globalObject variable.
    ctorRegistry["%Object.prototype%"] = globalObject.Object.prototype;
    ctorRegistry["%IteratorPrototype%"] = Object.getPrototypeOf(Object.getPrototypeOf(new globalObject.Array()[Symbol.iterator]()));
    try {
        ctorRegistry["%AsyncIteratorPrototype%"] = Object.getPrototypeOf(Object.getPrototypeOf(globalObject.eval("(async function* () {})").prototype));
    } catch  {
        ctorRegistry["%AsyncIteratorPrototype%"] = AsyncIteratorPrototype;
    }
    globalObject[ctorRegistrySymbol] = ctorRegistry;
    return ctorRegistry;
}
function getSameObject(wrapper, prop, creator) {
    if (!wrapper[sameObjectCaches]) {
        wrapper[sameObjectCaches] = Object.create(null);
    }
    if (prop in wrapper[sameObjectCaches]) {
        return wrapper[sameObjectCaches][prop];
    }
    wrapper[sameObjectCaches][prop] = creator();
    return wrapper[sameObjectCaches][prop];
}
function wrapperForImpl(impl) {
    return impl ? impl[wrapperSymbol] : null;
}
function implForWrapper(wrapper) {
    return wrapper ? wrapper[implSymbol] : null;
}
function tryWrapperForImpl(impl) {
    const wrapper = wrapperForImpl(impl);
    return wrapper ? wrapper : impl;
}
function tryImplForWrapper(wrapper) {
    const impl = implForWrapper(wrapper);
    return impl ? impl : wrapper;
}
const iterInternalSymbol = Symbol("internal");
function isArrayIndexPropName(P) {
    if (typeof P !== "string") {
        return false;
    }
    const i = P >>> 0;
    if (i === 2 ** 32 - 1) {
        return false;
    }
    const s = `${i}`;
    if (P !== s) {
        return false;
    }
    return true;
}
const byteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
function isArrayBuffer(value) {
    try {
        byteLengthGetter.call(value);
        return true;
    } catch (e) {
        return false;
    }
}
function iteratorResult([key, value], kind) {
    let result;
    switch(kind){
        case "key":
            result = key;
            break;
        case "value":
            result = value;
            break;
        case "key+value":
            result = [
                key,
                value
            ];
            break;
    }
    return {
        value: result,
        done: false
    };
}
const supportsPropertyIndex = Symbol("supports property index");
const supportedPropertyIndices = Symbol("supported property indices");
const supportsPropertyName = Symbol("supports property name");
const supportedPropertyNames = Symbol("supported property names");
const indexedGet = Symbol("indexed property get");
const indexedSetNew = Symbol("indexed property set new");
const indexedSetExisting = Symbol("indexed property set existing");
const namedGet = Symbol("named property get");
const namedSetNew = Symbol("named property set new");
const namedSetExisting = Symbol("named property set existing");
const namedDelete = Symbol("named property delete");
const asyncIteratorNext = Symbol("async iterator get the next iteration result");
const asyncIteratorReturn = Symbol("async iterator return steps");
const asyncIteratorInit = Symbol("async iterator initialization steps");
const asyncIteratorEOI = Symbol("async iterator end of iteration");
module.exports = exports = {
    isObject,
    hasOwn,
    define,
    newObjectInRealm,
    wrapperSymbol,
    implSymbol,
    getSameObject,
    ctorRegistrySymbol,
    initCtorRegistry,
    wrapperForImpl,
    implForWrapper,
    tryWrapperForImpl,
    tryImplForWrapper,
    iterInternalSymbol,
    isArrayBuffer,
    isArrayIndexPropName,
    supportsPropertyIndex,
    supportedPropertyIndices,
    supportsPropertyName,
    supportedPropertyNames,
    indexedGet,
    indexedSetNew,
    indexedSetExisting,
    namedGet,
    namedSetNew,
    namedSetExisting,
    namedDelete,
    asyncIteratorNext,
    asyncIteratorReturn,
    asyncIteratorInit,
    asyncIteratorEOI,
    iteratorResult
};
}),
"[project]/backend/node_modules/whatwg-url/lib/Function.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const conversions = __turbopack_context__.r("[project]/backend/node_modules/webidl-conversions/lib/index.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/utils.js [app-route] (ecmascript)");
exports.convert = (globalObject, value, { context = "The provided value" } = {})=>{
    if (typeof value !== "function") {
        throw new globalObject.TypeError(context + " is not a function");
    }
    function invokeTheCallbackFunction(...args) {
        const thisArg = utils.tryWrapperForImpl(this);
        let callResult;
        for(let i = 0; i < args.length; i++){
            args[i] = utils.tryWrapperForImpl(args[i]);
        }
        callResult = Reflect.apply(value, thisArg, args);
        callResult = conversions["any"](callResult, {
            context: context,
            globals: globalObject
        });
        return callResult;
    }
    invokeTheCallbackFunction.construct = (...args)=>{
        for(let i = 0; i < args.length; i++){
            args[i] = utils.tryWrapperForImpl(args[i]);
        }
        let callResult = Reflect.construct(value, args);
        callResult = conversions["any"](callResult, {
            context: context,
            globals: globalObject
        });
        return callResult;
    };
    invokeTheCallbackFunction[utils.wrapperSymbol] = value;
    invokeTheCallbackFunction.objectReference = value;
    return invokeTheCallbackFunction;
};
}),
"[project]/backend/node_modules/whatwg-url/lib/URLSearchParams.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const conversions = __turbopack_context__.r("[project]/backend/node_modules/webidl-conversions/lib/index.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/utils.js [app-route] (ecmascript)");
const Function = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/Function.js [app-route] (ecmascript)");
const newObjectInRealm = utils.newObjectInRealm;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const interfaceName = "URLSearchParams";
exports.is = (value)=>{
    return utils.isObject(value) && utils.hasOwn(value, implSymbol) && value[implSymbol] instanceof Impl.implementation;
};
exports.isImpl = (value)=>{
    return utils.isObject(value) && value instanceof Impl.implementation;
};
exports.convert = (globalObject, value, { context = "The provided value" } = {})=>{
    if (exports.is(value)) {
        return utils.implForWrapper(value);
    }
    throw new globalObject.TypeError(`${context} is not of type 'URLSearchParams'.`);
};
exports.createDefaultIterator = (globalObject, target, kind)=>{
    const ctorRegistry = globalObject[ctorRegistrySymbol];
    const iteratorPrototype = ctorRegistry["URLSearchParams Iterator"];
    const iterator = Object.create(iteratorPrototype);
    Object.defineProperty(iterator, utils.iterInternalSymbol, {
        value: {
            target,
            kind,
            index: 0
        },
        configurable: true
    });
    return iterator;
};
function makeWrapper(globalObject, newTarget) {
    let proto;
    if (newTarget !== undefined) {
        proto = newTarget.prototype;
    }
    if (!utils.isObject(proto)) {
        proto = globalObject[ctorRegistrySymbol]["URLSearchParams"].prototype;
    }
    return Object.create(proto);
}
exports.create = (globalObject, constructorArgs, privateData)=>{
    const wrapper = makeWrapper(globalObject);
    return exports.setup(wrapper, globalObject, constructorArgs, privateData);
};
exports.createImpl = (globalObject, constructorArgs, privateData)=>{
    const wrapper = exports.create(globalObject, constructorArgs, privateData);
    return utils.implForWrapper(wrapper);
};
exports._internalSetup = (wrapper, globalObject)=>{};
exports.setup = (wrapper, globalObject, constructorArgs = [], privateData = {})=>{
    privateData.wrapper = wrapper;
    exports._internalSetup(wrapper, globalObject);
    Object.defineProperty(wrapper, implSymbol, {
        value: new Impl.implementation(globalObject, constructorArgs, privateData),
        configurable: true
    });
    wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
    if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
    }
    return wrapper;
};
exports.new = (globalObject, newTarget)=>{
    const wrapper = makeWrapper(globalObject, newTarget);
    exports._internalSetup(wrapper, globalObject);
    Object.defineProperty(wrapper, implSymbol, {
        value: Object.create(Impl.implementation.prototype),
        configurable: true
    });
    wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
    if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
    }
    return wrapper[implSymbol];
};
const exposed = new Set([
    "Window",
    "Worker"
]);
exports.install = (globalObject, globalNames)=>{
    if (!globalNames.some((globalName)=>exposed.has(globalName))) {
        return;
    }
    const ctorRegistry = utils.initCtorRegistry(globalObject);
    class URLSearchParams {
        constructor(){
            const args = [];
            {
                let curArg = arguments[0];
                if (curArg !== undefined) {
                    if (utils.isObject(curArg)) {
                        if (curArg[Symbol.iterator] !== undefined) {
                            if (!utils.isObject(curArg)) {
                                throw new globalObject.TypeError("Failed to construct 'URLSearchParams': parameter 1" + " sequence" + " is not an iterable object.");
                            } else {
                                const V = [];
                                const tmp = curArg;
                                for (let nextItem of tmp){
                                    if (!utils.isObject(nextItem)) {
                                        throw new globalObject.TypeError("Failed to construct 'URLSearchParams': parameter 1" + " sequence" + "'s element" + " is not an iterable object.");
                                    } else {
                                        const V = [];
                                        const tmp = nextItem;
                                        for (let nextItem of tmp){
                                            nextItem = conversions["USVString"](nextItem, {
                                                context: "Failed to construct 'URLSearchParams': parameter 1" + " sequence" + "'s element" + "'s element",
                                                globals: globalObject
                                            });
                                            V.push(nextItem);
                                        }
                                        nextItem = V;
                                    }
                                    V.push(nextItem);
                                }
                                curArg = V;
                            }
                        } else {
                            if (!utils.isObject(curArg)) {
                                throw new globalObject.TypeError("Failed to construct 'URLSearchParams': parameter 1" + " record" + " is not an object.");
                            } else {
                                const result = Object.create(null);
                                for (const key of Reflect.ownKeys(curArg)){
                                    const desc = Object.getOwnPropertyDescriptor(curArg, key);
                                    if (desc && desc.enumerable) {
                                        let typedKey = key;
                                        typedKey = conversions["USVString"](typedKey, {
                                            context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s key",
                                            globals: globalObject
                                        });
                                        let typedValue = curArg[key];
                                        typedValue = conversions["USVString"](typedValue, {
                                            context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s value",
                                            globals: globalObject
                                        });
                                        result[typedKey] = typedValue;
                                    }
                                }
                                curArg = result;
                            }
                        }
                    } else {
                        curArg = conversions["USVString"](curArg, {
                            context: "Failed to construct 'URLSearchParams': parameter 1",
                            globals: globalObject
                        });
                    }
                } else {
                    curArg = "";
                }
                args.push(curArg);
            }
            return exports.setup(Object.create(new.target.prototype), globalObject, args);
        }
        append(name, value) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'append' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 2) {
                throw new globalObject.TypeError(`Failed to execute 'append' on 'URLSearchParams': 2 arguments required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'append' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'append' on 'URLSearchParams': parameter 2",
                    globals: globalObject
                });
                args.push(curArg);
            }
            return utils.tryWrapperForImpl(esValue[implSymbol].append(...args));
        }
        delete(name) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'delete' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'delete' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'delete' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                if (curArg !== undefined) {
                    curArg = conversions["USVString"](curArg, {
                        context: "Failed to execute 'delete' on 'URLSearchParams': parameter 2",
                        globals: globalObject
                    });
                }
                args.push(curArg);
            }
            return utils.tryWrapperForImpl(esValue[implSymbol].delete(...args));
        }
        get(name) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'get' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'get' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            return esValue[implSymbol].get(...args);
        }
        getAll(name) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'getAll' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'getAll' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'getAll' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            return utils.tryWrapperForImpl(esValue[implSymbol].getAll(...args));
        }
        has(name) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'has' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'has' on 'URLSearchParams': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'has' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                if (curArg !== undefined) {
                    curArg = conversions["USVString"](curArg, {
                        context: "Failed to execute 'has' on 'URLSearchParams': parameter 2",
                        globals: globalObject
                    });
                }
                args.push(curArg);
            }
            return esValue[implSymbol].has(...args);
        }
        set(name, value) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 2) {
                throw new globalObject.TypeError(`Failed to execute 'set' on 'URLSearchParams': 2 arguments required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'set' on 'URLSearchParams': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'set' on 'URLSearchParams': parameter 2",
                    globals: globalObject
                });
                args.push(curArg);
            }
            return utils.tryWrapperForImpl(esValue[implSymbol].set(...args));
        }
        sort() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'sort' called on an object that is not a valid instance of URLSearchParams.");
            }
            return utils.tryWrapperForImpl(esValue[implSymbol].sort());
        }
        toString() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'toString' called on an object that is not a valid instance of URLSearchParams.");
            }
            return esValue[implSymbol].toString();
        }
        keys() {
            if (!exports.is(this)) {
                throw new globalObject.TypeError("'keys' called on an object that is not a valid instance of URLSearchParams.");
            }
            return exports.createDefaultIterator(globalObject, this, "key");
        }
        values() {
            if (!exports.is(this)) {
                throw new globalObject.TypeError("'values' called on an object that is not a valid instance of URLSearchParams.");
            }
            return exports.createDefaultIterator(globalObject, this, "value");
        }
        entries() {
            if (!exports.is(this)) {
                throw new globalObject.TypeError("'entries' called on an object that is not a valid instance of URLSearchParams.");
            }
            return exports.createDefaultIterator(globalObject, this, "key+value");
        }
        forEach(callback) {
            if (!exports.is(this)) {
                throw new globalObject.TypeError("'forEach' called on an object that is not a valid instance of URLSearchParams.");
            }
            if (arguments.length < 1) {
                throw new globalObject.TypeError("Failed to execute 'forEach' on 'iterable': 1 argument required, but only 0 present.");
            }
            callback = Function.convert(globalObject, callback, {
                context: "Failed to execute 'forEach' on 'iterable': The callback provided as parameter 1"
            });
            const thisArg = arguments[1];
            let pairs = Array.from(this[implSymbol]);
            let i = 0;
            while(i < pairs.length){
                const [key, value] = pairs[i].map(utils.tryWrapperForImpl);
                callback.call(thisArg, value, key, this);
                pairs = Array.from(this[implSymbol]);
                i++;
            }
        }
        get size() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get size' called on an object that is not a valid instance of URLSearchParams.");
            }
            return esValue[implSymbol]["size"];
        }
    }
    Object.defineProperties(URLSearchParams.prototype, {
        append: {
            enumerable: true
        },
        delete: {
            enumerable: true
        },
        get: {
            enumerable: true
        },
        getAll: {
            enumerable: true
        },
        has: {
            enumerable: true
        },
        set: {
            enumerable: true
        },
        sort: {
            enumerable: true
        },
        toString: {
            enumerable: true
        },
        keys: {
            enumerable: true
        },
        values: {
            enumerable: true
        },
        entries: {
            enumerable: true
        },
        forEach: {
            enumerable: true
        },
        size: {
            enumerable: true
        },
        [Symbol.toStringTag]: {
            value: "URLSearchParams",
            configurable: true
        },
        [Symbol.iterator]: {
            value: URLSearchParams.prototype.entries,
            configurable: true,
            writable: true
        }
    });
    ctorRegistry[interfaceName] = URLSearchParams;
    ctorRegistry["URLSearchParams Iterator"] = Object.create(ctorRegistry["%IteratorPrototype%"], {
        [Symbol.toStringTag]: {
            configurable: true,
            value: "URLSearchParams Iterator"
        }
    });
    utils.define(ctorRegistry["URLSearchParams Iterator"], {
        next () {
            const internal = this && this[utils.iterInternalSymbol];
            if (!internal) {
                throw new globalObject.TypeError("next() called on a value that is not a URLSearchParams iterator object");
            }
            const { target, kind, index } = internal;
            const values = Array.from(target[implSymbol]);
            const len = values.length;
            if (index >= len) {
                return newObjectInRealm(globalObject, {
                    value: undefined,
                    done: true
                });
            }
            const pair = values[index];
            internal.index = index + 1;
            return newObjectInRealm(globalObject, utils.iteratorResult(pair.map(utils.tryWrapperForImpl), kind));
        }
    });
    Object.defineProperty(globalObject, interfaceName, {
        configurable: true,
        writable: true,
        value: URLSearchParams
    });
};
const Impl = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/URLSearchParams-impl.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/whatwg-url/lib/URL-impl.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const usm = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/url-state-machine.js [app-route] (ecmascript)");
const urlencoded = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/urlencoded.js [app-route] (ecmascript)");
const URLSearchParams = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/URLSearchParams.js [app-route] (ecmascript)");
exports.implementation = class URLImpl {
    // Unlike the spec, we duplicate some code between the constructor and canParse, because we want to give useful error
    // messages in the constructor that distinguish between the different causes of failure.
    constructor(globalObject, [url, base]){
        let parsedBase = null;
        if (base !== undefined) {
            parsedBase = usm.basicURLParse(base);
            if (parsedBase === null) {
                throw new TypeError(`Invalid base URL: ${base}`);
            }
        }
        const parsedURL = usm.basicURLParse(url, {
            baseURL: parsedBase
        });
        if (parsedURL === null) {
            throw new TypeError(`Invalid URL: ${url}`);
        }
        const query = parsedURL.query !== null ? parsedURL.query : "";
        this._url = parsedURL;
        // We cannot invoke the "new URLSearchParams object" algorithm without going through the constructor, which strips
        // question mark by default. Therefore the doNotStripQMark hack is used.
        this._query = URLSearchParams.createImpl(globalObject, [
            query
        ], {
            doNotStripQMark: true
        });
        this._query._url = this;
    }
    static parse(globalObject, input, base) {
        try {
            return new URLImpl(globalObject, [
                input,
                base
            ]);
        } catch  {
            return null;
        }
    }
    static canParse(url, base) {
        let parsedBase = null;
        if (base !== undefined) {
            parsedBase = usm.basicURLParse(base);
            if (parsedBase === null) {
                return false;
            }
        }
        const parsedURL = usm.basicURLParse(url, {
            baseURL: parsedBase
        });
        if (parsedURL === null) {
            return false;
        }
        return true;
    }
    get href() {
        return usm.serializeURL(this._url);
    }
    set href(v) {
        const parsedURL = usm.basicURLParse(v);
        if (parsedURL === null) {
            throw new TypeError(`Invalid URL: ${v}`);
        }
        this._url = parsedURL;
        this._query._list.splice(0);
        const { query } = parsedURL;
        if (query !== null) {
            this._query._list = urlencoded.parseUrlencodedString(query);
        }
    }
    get origin() {
        return usm.serializeURLOrigin(this._url);
    }
    get protocol() {
        return `${this._url.scheme}:`;
    }
    set protocol(v) {
        usm.basicURLParse(`${v}:`, {
            url: this._url,
            stateOverride: "scheme start"
        });
    }
    get username() {
        return this._url.username;
    }
    set username(v) {
        if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
            return;
        }
        usm.setTheUsername(this._url, v);
    }
    get password() {
        return this._url.password;
    }
    set password(v) {
        if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
            return;
        }
        usm.setThePassword(this._url, v);
    }
    get host() {
        const url = this._url;
        if (url.host === null) {
            return "";
        }
        if (url.port === null) {
            return usm.serializeHost(url.host);
        }
        return `${usm.serializeHost(url.host)}:${usm.serializeInteger(url.port)}`;
    }
    set host(v) {
        if (usm.hasAnOpaquePath(this._url)) {
            return;
        }
        usm.basicURLParse(v, {
            url: this._url,
            stateOverride: "host"
        });
    }
    get hostname() {
        if (this._url.host === null) {
            return "";
        }
        return usm.serializeHost(this._url.host);
    }
    set hostname(v) {
        if (usm.hasAnOpaquePath(this._url)) {
            return;
        }
        usm.basicURLParse(v, {
            url: this._url,
            stateOverride: "hostname"
        });
    }
    get port() {
        if (this._url.port === null) {
            return "";
        }
        return usm.serializeInteger(this._url.port);
    }
    set port(v) {
        if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
            return;
        }
        if (v === "") {
            this._url.port = null;
        } else {
            usm.basicURLParse(v, {
                url: this._url,
                stateOverride: "port"
            });
        }
    }
    get pathname() {
        return usm.serializePath(this._url);
    }
    set pathname(v) {
        if (usm.hasAnOpaquePath(this._url)) {
            return;
        }
        this._url.path = [];
        usm.basicURLParse(v, {
            url: this._url,
            stateOverride: "path start"
        });
    }
    get search() {
        if (this._url.query === null || this._url.query === "") {
            return "";
        }
        return `?${this._url.query}`;
    }
    set search(v) {
        const url = this._url;
        if (v === "") {
            url.query = null;
            this._query._list = [];
            return;
        }
        const input = v[0] === "?" ? v.substring(1) : v;
        url.query = "";
        usm.basicURLParse(input, {
            url,
            stateOverride: "query"
        });
        this._query._list = urlencoded.parseUrlencodedString(input);
    }
    get searchParams() {
        return this._query;
    }
    get hash() {
        if (this._url.fragment === null || this._url.fragment === "") {
            return "";
        }
        return `#${this._url.fragment}`;
    }
    set hash(v) {
        if (v === "") {
            this._url.fragment = null;
            return;
        }
        const input = v[0] === "#" ? v.substring(1) : v;
        this._url.fragment = "";
        usm.basicURLParse(input, {
            url: this._url,
            stateOverride: "fragment"
        });
    }
    toJSON() {
        return this.href;
    }
};
}),
"[project]/backend/node_modules/whatwg-url/lib/URL.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const conversions = __turbopack_context__.r("[project]/backend/node_modules/webidl-conversions/lib/index.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/utils.js [app-route] (ecmascript)");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const interfaceName = "URL";
exports.is = (value)=>{
    return utils.isObject(value) && utils.hasOwn(value, implSymbol) && value[implSymbol] instanceof Impl.implementation;
};
exports.isImpl = (value)=>{
    return utils.isObject(value) && value instanceof Impl.implementation;
};
exports.convert = (globalObject, value, { context = "The provided value" } = {})=>{
    if (exports.is(value)) {
        return utils.implForWrapper(value);
    }
    throw new globalObject.TypeError(`${context} is not of type 'URL'.`);
};
function makeWrapper(globalObject, newTarget) {
    let proto;
    if (newTarget !== undefined) {
        proto = newTarget.prototype;
    }
    if (!utils.isObject(proto)) {
        proto = globalObject[ctorRegistrySymbol]["URL"].prototype;
    }
    return Object.create(proto);
}
exports.create = (globalObject, constructorArgs, privateData)=>{
    const wrapper = makeWrapper(globalObject);
    return exports.setup(wrapper, globalObject, constructorArgs, privateData);
};
exports.createImpl = (globalObject, constructorArgs, privateData)=>{
    const wrapper = exports.create(globalObject, constructorArgs, privateData);
    return utils.implForWrapper(wrapper);
};
exports._internalSetup = (wrapper, globalObject)=>{};
exports.setup = (wrapper, globalObject, constructorArgs = [], privateData = {})=>{
    privateData.wrapper = wrapper;
    exports._internalSetup(wrapper, globalObject);
    Object.defineProperty(wrapper, implSymbol, {
        value: new Impl.implementation(globalObject, constructorArgs, privateData),
        configurable: true
    });
    wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
    if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
    }
    return wrapper;
};
exports.new = (globalObject, newTarget)=>{
    const wrapper = makeWrapper(globalObject, newTarget);
    exports._internalSetup(wrapper, globalObject);
    Object.defineProperty(wrapper, implSymbol, {
        value: Object.create(Impl.implementation.prototype),
        configurable: true
    });
    wrapper[implSymbol][utils.wrapperSymbol] = wrapper;
    if (Impl.init) {
        Impl.init(wrapper[implSymbol]);
    }
    return wrapper[implSymbol];
};
const exposed = new Set([
    "Window",
    "Worker"
]);
exports.install = (globalObject, globalNames)=>{
    if (!globalNames.some((globalName)=>exposed.has(globalName))) {
        return;
    }
    const ctorRegistry = utils.initCtorRegistry(globalObject);
    class URL {
        constructor(url){
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to construct 'URL': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to construct 'URL': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                if (curArg !== undefined) {
                    curArg = conversions["USVString"](curArg, {
                        context: "Failed to construct 'URL': parameter 2",
                        globals: globalObject
                    });
                }
                args.push(curArg);
            }
            return exports.setup(Object.create(new.target.prototype), globalObject, args);
        }
        toJSON() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'toJSON' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol].toJSON();
        }
        get href() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get href' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["href"];
        }
        set href(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set href' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'href' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["href"] = V;
        }
        toString() {
            const esValue = this;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'toString' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["href"];
        }
        get origin() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get origin' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["origin"];
        }
        get protocol() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get protocol' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["protocol"];
        }
        set protocol(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set protocol' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'protocol' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["protocol"] = V;
        }
        get username() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get username' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["username"];
        }
        set username(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set username' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'username' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["username"] = V;
        }
        get password() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get password' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["password"];
        }
        set password(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set password' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'password' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["password"] = V;
        }
        get host() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get host' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["host"];
        }
        set host(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set host' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'host' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["host"] = V;
        }
        get hostname() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get hostname' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["hostname"];
        }
        set hostname(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set hostname' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'hostname' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["hostname"] = V;
        }
        get port() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get port' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["port"];
        }
        set port(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set port' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'port' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["port"] = V;
        }
        get pathname() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get pathname' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["pathname"];
        }
        set pathname(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set pathname' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'pathname' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["pathname"] = V;
        }
        get search() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get search' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["search"];
        }
        set search(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set search' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'search' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["search"] = V;
        }
        get searchParams() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get searchParams' called on an object that is not a valid instance of URL.");
            }
            return utils.getSameObject(this, "searchParams", ()=>{
                return utils.tryWrapperForImpl(esValue[implSymbol]["searchParams"]);
            });
        }
        get hash() {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'get hash' called on an object that is not a valid instance of URL.");
            }
            return esValue[implSymbol]["hash"];
        }
        set hash(V) {
            const esValue = this !== null && this !== undefined ? this : globalObject;
            if (!exports.is(esValue)) {
                throw new globalObject.TypeError("'set hash' called on an object that is not a valid instance of URL.");
            }
            V = conversions["USVString"](V, {
                context: "Failed to set the 'hash' property on 'URL': The provided value",
                globals: globalObject
            });
            esValue[implSymbol]["hash"] = V;
        }
        static parse(url) {
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'parse' on 'URL': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'parse' on 'URL': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                if (curArg !== undefined) {
                    curArg = conversions["USVString"](curArg, {
                        context: "Failed to execute 'parse' on 'URL': parameter 2",
                        globals: globalObject
                    });
                }
                args.push(curArg);
            }
            return utils.tryWrapperForImpl(Impl.implementation.parse(globalObject, ...args));
        }
        static canParse(url) {
            if (arguments.length < 1) {
                throw new globalObject.TypeError(`Failed to execute 'canParse' on 'URL': 1 argument required, but only ${arguments.length} present.`);
            }
            const args = [];
            {
                let curArg = arguments[0];
                curArg = conversions["USVString"](curArg, {
                    context: "Failed to execute 'canParse' on 'URL': parameter 1",
                    globals: globalObject
                });
                args.push(curArg);
            }
            {
                let curArg = arguments[1];
                if (curArg !== undefined) {
                    curArg = conversions["USVString"](curArg, {
                        context: "Failed to execute 'canParse' on 'URL': parameter 2",
                        globals: globalObject
                    });
                }
                args.push(curArg);
            }
            return Impl.implementation.canParse(...args);
        }
    }
    Object.defineProperties(URL.prototype, {
        toJSON: {
            enumerable: true
        },
        href: {
            enumerable: true
        },
        toString: {
            enumerable: true
        },
        origin: {
            enumerable: true
        },
        protocol: {
            enumerable: true
        },
        username: {
            enumerable: true
        },
        password: {
            enumerable: true
        },
        host: {
            enumerable: true
        },
        hostname: {
            enumerable: true
        },
        port: {
            enumerable: true
        },
        pathname: {
            enumerable: true
        },
        search: {
            enumerable: true
        },
        searchParams: {
            enumerable: true
        },
        hash: {
            enumerable: true
        },
        [Symbol.toStringTag]: {
            value: "URL",
            configurable: true
        }
    });
    Object.defineProperties(URL, {
        parse: {
            enumerable: true
        },
        canParse: {
            enumerable: true
        }
    });
    ctorRegistry[interfaceName] = URL;
    Object.defineProperty(globalObject, interfaceName, {
        configurable: true,
        writable: true,
        value: URL
    });
    if (globalNames.includes("Window")) {
        Object.defineProperty(globalObject, "webkitURL", {
            configurable: true,
            writable: true,
            value: URL
        });
    }
};
const Impl = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/URL-impl.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/whatwg-url/webidl2js-wrapper.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const URL = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/URL.js [app-route] (ecmascript)");
const URLSearchParams = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/URLSearchParams.js [app-route] (ecmascript)");
exports.URL = URL;
exports.URLSearchParams = URLSearchParams;
}),
"[project]/backend/node_modules/whatwg-url/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { URL, URLSearchParams } = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/webidl2js-wrapper.js [app-route] (ecmascript)");
const urlStateMachine = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/url-state-machine.js [app-route] (ecmascript)");
const percentEncoding = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/lib/percent-encoding.js [app-route] (ecmascript)");
const sharedGlobalObject = {
    Array,
    Object,
    Promise,
    String,
    TypeError
};
URL.install(sharedGlobalObject, [
    "Window"
]);
URLSearchParams.install(sharedGlobalObject, [
    "Window"
]);
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;
exports.parseURL = urlStateMachine.parseURL;
exports.basicURLParse = urlStateMachine.basicURLParse;
exports.serializeURL = urlStateMachine.serializeURL;
exports.serializePath = urlStateMachine.serializePath;
exports.serializeHost = urlStateMachine.serializeHost;
exports.serializeInteger = urlStateMachine.serializeInteger;
exports.serializeURLOrigin = urlStateMachine.serializeURLOrigin;
exports.setTheUsername = urlStateMachine.setTheUsername;
exports.setThePassword = urlStateMachine.setThePassword;
exports.cannotHaveAUsernamePasswordPort = urlStateMachine.cannotHaveAUsernamePasswordPort;
exports.hasAnOpaquePath = urlStateMachine.hasAnOpaquePath;
exports.percentDecodeString = percentEncoding.percentDecodeString;
exports.percentDecodeBytes = percentEncoding.percentDecodeBytes;
}),
"[project]/backend/node_modules/webidl-conversions/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function makeException(ErrorType, message, options) {
    if (options.globals) {
        ErrorType = options.globals[ErrorType.name];
    }
    return new ErrorType(`${options.context ? options.context : "Value"} ${message}.`);
}
function toNumber(value, options) {
    if (typeof value === "bigint") {
        throw makeException(TypeError, "is a BigInt which cannot be converted to a number", options);
    }
    if (!options.globals) {
        return Number(value);
    }
    return options.globals.Number(value);
}
// Round x to the nearest integer, choosing the even integer if it lies halfway between two.
function evenRound(x) {
    // There are four cases for numbers with fractional part being .5:
    //
    // case |     x     | floor(x) | round(x) | expected | x <> 0 | x % 1 | x & 1 |   example
    //   1  |  2n + 0.5 |  2n      |  2n + 1  |  2n      |   >    |  0.5  |   0   |  0.5 ->  0
    //   2  |  2n + 1.5 |  2n + 1  |  2n + 2  |  2n + 2  |   >    |  0.5  |   1   |  1.5 ->  2
    //   3  | -2n - 0.5 | -2n - 1  | -2n      | -2n      |   <    | -0.5  |   0   | -0.5 ->  0
    //   4  | -2n - 1.5 | -2n - 2  | -2n - 1  | -2n - 2  |   <    | -0.5  |   1   | -1.5 -> -2
    // (where n is a non-negative integer)
    //
    // Branch here for cases 1 and 4
    if (x > 0 && x % 1 === +0.5 && (x & 1) === 0 || x < 0 && x % 1 === -0.5 && (x & 1) === 1) {
        return censorNegativeZero(Math.floor(x));
    }
    return censorNegativeZero(Math.round(x));
}
function integerPart(n) {
    return censorNegativeZero(Math.trunc(n));
}
function sign(x) {
    return x < 0 ? -1 : 1;
}
function modulo(x, y) {
    // https://tc39.github.io/ecma262/#eqn-modulo
    // Note that http://stackoverflow.com/a/4467559/3191 does NOT work for large modulos
    const signMightNotMatch = x % y;
    if (sign(y) !== sign(signMightNotMatch)) {
        return signMightNotMatch + y;
    }
    return signMightNotMatch;
}
function censorNegativeZero(x) {
    return x === 0 ? 0 : x;
}
function createIntegerConversion(bitLength, { unsigned }) {
    let lowerBound, upperBound;
    if (unsigned) {
        lowerBound = 0;
        upperBound = 2 ** bitLength - 1;
    } else {
        lowerBound = -(2 ** (bitLength - 1));
        upperBound = 2 ** (bitLength - 1) - 1;
    }
    const twoToTheBitLength = 2 ** bitLength;
    const twoToOneLessThanTheBitLength = 2 ** (bitLength - 1);
    return (value, options = {})=>{
        let x = toNumber(value, options);
        x = censorNegativeZero(x);
        if (options.enforceRange) {
            if (!Number.isFinite(x)) {
                throw makeException(TypeError, "is not a finite number", options);
            }
            x = integerPart(x);
            if (x < lowerBound || x > upperBound) {
                throw makeException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
            }
            return x;
        }
        if (!Number.isNaN(x) && options.clamp) {
            x = Math.min(Math.max(x, lowerBound), upperBound);
            x = evenRound(x);
            return x;
        }
        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }
        x = integerPart(x);
        // Math.pow(2, 64) is not accurately representable in JavaScript, so try to avoid these per-spec operations if
        // possible. Hopefully it's an optimization for the non-64-bitLength cases too.
        if (x >= lowerBound && x <= upperBound) {
            return x;
        }
        // These will not work great for bitLength of 64, but oh well. See the README for more details.
        x = modulo(x, twoToTheBitLength);
        if (!unsigned && x >= twoToOneLessThanTheBitLength) {
            return x - twoToTheBitLength;
        }
        return x;
    };
}
function createLongLongConversion(bitLength, { unsigned }) {
    const upperBound = Number.MAX_SAFE_INTEGER;
    const lowerBound = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    const asBigIntN = unsigned ? BigInt.asUintN : BigInt.asIntN;
    return (value, options = {})=>{
        let x = toNumber(value, options);
        x = censorNegativeZero(x);
        if (options.enforceRange) {
            if (!Number.isFinite(x)) {
                throw makeException(TypeError, "is not a finite number", options);
            }
            x = integerPart(x);
            if (x < lowerBound || x > upperBound) {
                throw makeException(TypeError, `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, options);
            }
            return x;
        }
        if (!Number.isNaN(x) && options.clamp) {
            x = Math.min(Math.max(x, lowerBound), upperBound);
            x = evenRound(x);
            return x;
        }
        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }
        let xBigInt = BigInt(integerPart(x));
        xBigInt = asBigIntN(bitLength, xBigInt);
        return Number(xBigInt);
    };
}
exports.any = (value)=>{
    return value;
};
exports.undefined = ()=>{
    return undefined;
};
exports.boolean = (value)=>{
    return Boolean(value);
};
exports.byte = createIntegerConversion(8, {
    unsigned: false
});
exports.octet = createIntegerConversion(8, {
    unsigned: true
});
exports.short = createIntegerConversion(16, {
    unsigned: false
});
exports["unsigned short"] = createIntegerConversion(16, {
    unsigned: true
});
exports.long = createIntegerConversion(32, {
    unsigned: false
});
exports["unsigned long"] = createIntegerConversion(32, {
    unsigned: true
});
exports["long long"] = createLongLongConversion(64, {
    unsigned: false
});
exports["unsigned long long"] = createLongLongConversion(64, {
    unsigned: true
});
exports.double = (value, options = {})=>{
    const x = toNumber(value, options);
    if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", options);
    }
    return x;
};
exports["unrestricted double"] = (value, options = {})=>{
    const x = toNumber(value, options);
    return x;
};
exports.float = (value, options = {})=>{
    const x = toNumber(value, options);
    if (!Number.isFinite(x)) {
        throw makeException(TypeError, "is not a finite floating-point value", options);
    }
    if (Object.is(x, -0)) {
        return x;
    }
    const y = Math.fround(x);
    if (!Number.isFinite(y)) {
        throw makeException(TypeError, "is outside the range of a single-precision floating-point value", options);
    }
    return y;
};
exports["unrestricted float"] = (value, options = {})=>{
    const x = toNumber(value, options);
    if (isNaN(x)) {
        return x;
    }
    if (Object.is(x, -0)) {
        return x;
    }
    return Math.fround(x);
};
exports.DOMString = (value, options = {})=>{
    if (options.treatNullAsEmptyString && value === null) {
        return "";
    }
    if (typeof value === "symbol") {
        throw makeException(TypeError, "is a symbol, which cannot be converted to a string", options);
    }
    const StringCtor = options.globals ? options.globals.String : String;
    return StringCtor(value);
};
exports.ByteString = (value, options = {})=>{
    const x = exports.DOMString(value, options);
    let c;
    for(let i = 0; (c = x.codePointAt(i)) !== undefined; ++i){
        if (c > 255) {
            throw makeException(TypeError, "is not a valid ByteString", options);
        }
    }
    return x;
};
exports.USVString = (value, options = {})=>{
    const S = exports.DOMString(value, options);
    const n = S.length;
    const U = [];
    for(let i = 0; i < n; ++i){
        const c = S.charCodeAt(i);
        if (c < 0xD800 || c > 0xDFFF) {
            U.push(String.fromCodePoint(c));
        } else if (0xDC00 <= c && c <= 0xDFFF) {
            U.push(String.fromCodePoint(0xFFFD));
        } else if (i === n - 1) {
            U.push(String.fromCodePoint(0xFFFD));
        } else {
            const d = S.charCodeAt(i + 1);
            if (0xDC00 <= d && d <= 0xDFFF) {
                const a = c & 0x3FF;
                const b = d & 0x3FF;
                U.push(String.fromCodePoint((2 << 15) + (2 << 9) * a + b));
                ++i;
            } else {
                U.push(String.fromCodePoint(0xFFFD));
            }
        }
    }
    return U.join("");
};
exports.object = (value, options = {})=>{
    if (value === null || typeof value !== "object" && typeof value !== "function") {
        throw makeException(TypeError, "is not an object", options);
    }
    return value;
};
const abByteLengthGetter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
const sabByteLengthGetter = typeof SharedArrayBuffer === "function" ? Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get : null;
function isNonSharedArrayBuffer(value) {
    try {
        // This will throw on SharedArrayBuffers, but not detached ArrayBuffers.
        // (The spec says it should throw, but the spec conflicts with implementations: https://github.com/tc39/ecma262/issues/678)
        abByteLengthGetter.call(value);
        return true;
    } catch  {
        return false;
    }
}
function isSharedArrayBuffer(value) {
    try {
        sabByteLengthGetter.call(value);
        return true;
    } catch  {
        return false;
    }
}
function isArrayBufferDetached(value) {
    try {
        // eslint-disable-next-line no-new
        new Uint8Array(value);
        return false;
    } catch  {
        return true;
    }
}
exports.ArrayBuffer = (value, options = {})=>{
    if (!isNonSharedArrayBuffer(value)) {
        if (options.allowShared && !isSharedArrayBuffer(value)) {
            throw makeException(TypeError, "is not an ArrayBuffer or SharedArrayBuffer", options);
        }
        throw makeException(TypeError, "is not an ArrayBuffer", options);
    }
    if (isArrayBufferDetached(value)) {
        throw makeException(TypeError, "is a detached ArrayBuffer", options);
    }
    return value;
};
const dvByteLengthGetter = Object.getOwnPropertyDescriptor(DataView.prototype, "byteLength").get;
exports.DataView = (value, options = {})=>{
    try {
        dvByteLengthGetter.call(value);
    } catch (e) {
        throw makeException(TypeError, "is not a DataView", options);
    }
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
        throw makeException(TypeError, "is backed by a SharedArrayBuffer, which is not allowed", options);
    }
    if (isArrayBufferDetached(value.buffer)) {
        throw makeException(TypeError, "is backed by a detached ArrayBuffer", options);
    }
    return value;
};
// Returns the unforgeable `TypedArray` constructor name or `undefined`,
// if the `this` value isn't a valid `TypedArray` object.
//
// https://tc39.es/ecma262/#sec-get-%typedarray%.prototype-@@tostringtag
const typedArrayNameGetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array).prototype, Symbol.toStringTag).get;
[
    Int8Array,
    Int16Array,
    Int32Array,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Uint8ClampedArray,
    Float32Array,
    Float64Array
].forEach((func)=>{
    const { name } = func;
    const article = /^[AEIOU]/u.test(name) ? "an" : "a";
    exports[name] = (value, options = {})=>{
        if (!ArrayBuffer.isView(value) || typedArrayNameGetter.call(value) !== name) {
            throw makeException(TypeError, `is not ${article} ${name} object`, options);
        }
        if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
            throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
        }
        if (isArrayBufferDetached(value.buffer)) {
            throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
        }
        return value;
    };
});
// Common definitions
exports.ArrayBufferView = (value, options = {})=>{
    if (!ArrayBuffer.isView(value)) {
        throw makeException(TypeError, "is not a view on an ArrayBuffer or SharedArrayBuffer", options);
    }
    if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
        throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
    }
    if (isArrayBufferDetached(value.buffer)) {
        throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
    }
    return value;
};
exports.BufferSource = (value, options = {})=>{
    if (ArrayBuffer.isView(value)) {
        if (!options.allowShared && isSharedArrayBuffer(value.buffer)) {
            throw makeException(TypeError, "is a view on a SharedArrayBuffer, which is not allowed", options);
        }
        if (isArrayBufferDetached(value.buffer)) {
            throw makeException(TypeError, "is a view on a detached ArrayBuffer", options);
        }
        return value;
    }
    if (!options.allowShared && !isNonSharedArrayBuffer(value)) {
        throw makeException(TypeError, "is not an ArrayBuffer or a view on one", options);
    }
    if (options.allowShared && !isSharedArrayBuffer(value) && !isNonSharedArrayBuffer(value)) {
        throw makeException(TypeError, "is not an ArrayBuffer, SharedArrayBuffer, or a view on one", options);
    }
    if (isArrayBufferDetached(value)) {
        throw makeException(TypeError, "is a detached ArrayBuffer", options);
    }
    return value;
};
exports.DOMTimeStamp = exports["unsigned long long"];
}),
"[project]/backend/node_modules/mongodb-connection-string-url/lib/redact.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.redactConnectionString = exports.redactValidConnectionString = void 0;
const index_1 = __importStar(__turbopack_context__.r("[project]/backend/node_modules/mongodb-connection-string-url/lib/index.js [app-route] (ecmascript)"));
function redactValidConnectionString(inputUrl, options) {
    var _a, _b;
    const url = inputUrl.clone();
    const replacementString = (_a = options === null || options === void 0 ? void 0 : options.replacementString) !== null && _a !== void 0 ? _a : '_credentials_';
    const redactUsernames = (_b = options === null || options === void 0 ? void 0 : options.redactUsernames) !== null && _b !== void 0 ? _b : true;
    if ((url.username || url.password) && redactUsernames) {
        url.username = replacementString;
        url.password = '';
    } else if (url.password) {
        url.password = replacementString;
    }
    if (url.searchParams.has('authMechanismProperties')) {
        const props = new index_1.CommaAndColonSeparatedRecord(url.searchParams.get('authMechanismProperties'));
        if (props.get('AWS_SESSION_TOKEN')) {
            props.set('AWS_SESSION_TOKEN', replacementString);
            url.searchParams.set('authMechanismProperties', props.toString());
        }
    }
    if (url.searchParams.has('tlsCertificateKeyFilePassword')) {
        url.searchParams.set('tlsCertificateKeyFilePassword', replacementString);
    }
    if (url.searchParams.has('proxyUsername') && redactUsernames) {
        url.searchParams.set('proxyUsername', replacementString);
    }
    if (url.searchParams.has('proxyPassword')) {
        url.searchParams.set('proxyPassword', replacementString);
    }
    return url;
}
exports.redactValidConnectionString = redactValidConnectionString;
function redactConnectionString(uri, options) {
    var _a, _b;
    const replacementString = (_a = options === null || options === void 0 ? void 0 : options.replacementString) !== null && _a !== void 0 ? _a : '<credentials>';
    const redactUsernames = (_b = options === null || options === void 0 ? void 0 : options.redactUsernames) !== null && _b !== void 0 ? _b : true;
    let parsed;
    try {
        parsed = new index_1.default(uri);
    } catch (_c) {}
    if (parsed) {
        options = {
            ...options,
            replacementString: '___credentials___'
        };
        return parsed.redact(options).toString().replace(/___credentials___/g, replacementString);
    }
    const R = replacementString;
    const replacements = [
        (uri)=>uri.replace(redactUsernames ? /(\/\/)(.*)(@)/g : /(\/\/[^@]*:)(.*)(@)/g, `$1${R}$3`),
        (uri)=>uri.replace(/(AWS_SESSION_TOKEN(:|%3A))([^,&]+)/gi, `$1${R}`),
        (uri)=>uri.replace(/(tlsCertificateKeyFilePassword=)([^&]+)/gi, `$1${R}`),
        (uri)=>redactUsernames ? uri.replace(/(proxyUsername=)([^&]+)/gi, `$1${R}`) : uri,
        (uri)=>uri.replace(/(proxyPassword=)([^&]+)/gi, `$1${R}`)
    ];
    for (const replacer of replacements){
        uri = replacer(uri);
    }
    return uri;
}
exports.redactConnectionString = redactConnectionString; //# sourceMappingURL=redact.js.map
}),
"[project]/backend/node_modules/mongodb-connection-string-url/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CommaAndColonSeparatedRecord = exports.ConnectionString = exports.redactConnectionString = void 0;
const whatwg_url_1 = __turbopack_context__.r("[project]/backend/node_modules/whatwg-url/index.js [app-route] (ecmascript)");
const redact_1 = __turbopack_context__.r("[project]/backend/node_modules/mongodb-connection-string-url/lib/redact.js [app-route] (ecmascript)");
Object.defineProperty(exports, "redactConnectionString", {
    enumerable: true,
    get: function() {
        return redact_1.redactConnectionString;
    }
});
const DUMMY_HOSTNAME = '__this_is_a_placeholder__';
function connectionStringHasValidScheme(connectionString) {
    return connectionString.startsWith('mongodb://') || connectionString.startsWith('mongodb+srv://');
}
const HOSTS_REGEX = /^(?<protocol>[^/]+):\/\/(?:(?<username>[^:@]*)(?::(?<password>[^@]*))?@)?(?<hosts>(?!:)[^/?@]*)(?<rest>.*)/;
class CaseInsensitiveMap extends Map {
    delete(name) {
        return super.delete(this._normalizeKey(name));
    }
    get(name) {
        return super.get(this._normalizeKey(name));
    }
    has(name) {
        return super.has(this._normalizeKey(name));
    }
    set(name, value) {
        return super.set(this._normalizeKey(name), value);
    }
    _normalizeKey(name) {
        name = `${name}`;
        for (const key of this.keys()){
            if (key.toLowerCase() === name.toLowerCase()) {
                name = key;
                break;
            }
        }
        return name;
    }
}
function caseInsenstiveURLSearchParams(Ctor) {
    return class CaseInsenstiveURLSearchParams extends Ctor {
        append(name, value) {
            return super.append(this._normalizeKey(name), value);
        }
        delete(name) {
            return super.delete(this._normalizeKey(name));
        }
        get(name) {
            return super.get(this._normalizeKey(name));
        }
        getAll(name) {
            return super.getAll(this._normalizeKey(name));
        }
        has(name) {
            return super.has(this._normalizeKey(name));
        }
        set(name, value) {
            return super.set(this._normalizeKey(name), value);
        }
        keys() {
            return super.keys();
        }
        values() {
            return super.values();
        }
        entries() {
            return super.entries();
        }
        [Symbol.iterator]() {
            return super[Symbol.iterator]();
        }
        _normalizeKey(name) {
            return CaseInsensitiveMap.prototype._normalizeKey.call(this, name);
        }
    };
}
class URLWithoutHost extends whatwg_url_1.URL {
}
class MongoParseError extends Error {
    get name() {
        return 'MongoParseError';
    }
}
class ConnectionString extends URLWithoutHost {
    constructor(uri, options = {}){
        var _a;
        const { looseValidation } = options;
        if (!looseValidation && !connectionStringHasValidScheme(uri)) {
            throw new MongoParseError('Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"');
        }
        const match = uri.match(HOSTS_REGEX);
        if (!match) {
            throw new MongoParseError(`Invalid connection string "${uri}"`);
        }
        const { protocol, username, password, hosts, rest } = (_a = match.groups) !== null && _a !== void 0 ? _a : {};
        if (!looseValidation) {
            if (!protocol || !hosts) {
                throw new MongoParseError(`Protocol and host list are required in "${uri}"`);
            }
            try {
                decodeURIComponent(username !== null && username !== void 0 ? username : '');
                decodeURIComponent(password !== null && password !== void 0 ? password : '');
            } catch (err) {
                throw new MongoParseError(err.message);
            }
            const illegalCharacters = /[:/?#[\]@]/gi;
            if (username === null || username === void 0 ? void 0 : username.match(illegalCharacters)) {
                throw new MongoParseError(`Username contains unescaped characters ${username}`);
            }
            if (!username || !password) {
                const uriWithoutProtocol = uri.replace(`${protocol}://`, '');
                if (uriWithoutProtocol.startsWith('@') || uriWithoutProtocol.startsWith(':')) {
                    throw new MongoParseError('URI contained empty userinfo section');
                }
            }
            if (password === null || password === void 0 ? void 0 : password.match(illegalCharacters)) {
                throw new MongoParseError('Password contains unescaped characters');
            }
        }
        let authString = '';
        if (typeof username === 'string') authString += username;
        if (typeof password === 'string') authString += `:${password}`;
        if (authString) authString += '@';
        try {
            super(`${protocol.toLowerCase()}://${authString}${DUMMY_HOSTNAME}${rest}`);
        } catch (err) {
            if (looseValidation) {
                new ConnectionString(uri, {
                    ...options,
                    looseValidation: false
                });
            }
            if (typeof err.message === 'string') {
                err.message = err.message.replace(DUMMY_HOSTNAME, hosts);
            }
            throw err;
        }
        this._hosts = hosts.split(',');
        if (!looseValidation) {
            if (this.isSRV && this.hosts.length !== 1) {
                throw new MongoParseError('mongodb+srv URI cannot have multiple service names');
            }
            if (this.isSRV && this.hosts.some((host)=>host.includes(':'))) {
                throw new MongoParseError('mongodb+srv URI cannot have port number');
            }
        }
        if (!this.pathname) {
            this.pathname = '/';
        }
        Object.setPrototypeOf(this.searchParams, caseInsenstiveURLSearchParams(this.searchParams.constructor).prototype);
    }
    get host() {
        return DUMMY_HOSTNAME;
    }
    set host(_ignored) {
        throw new Error('No single host for connection string');
    }
    get hostname() {
        return DUMMY_HOSTNAME;
    }
    set hostname(_ignored) {
        throw new Error('No single host for connection string');
    }
    get port() {
        return '';
    }
    set port(_ignored) {
        throw new Error('No single host for connection string');
    }
    get href() {
        return this.toString();
    }
    set href(_ignored) {
        throw new Error('Cannot set href for connection strings');
    }
    get isSRV() {
        return this.protocol.includes('srv');
    }
    get hosts() {
        return this._hosts;
    }
    set hosts(list) {
        this._hosts = list;
    }
    toString() {
        return super.toString().replace(DUMMY_HOSTNAME, this.hosts.join(','));
    }
    clone() {
        return new ConnectionString(this.toString(), {
            looseValidation: true
        });
    }
    redact(options) {
        return (0, redact_1.redactValidConnectionString)(this, options);
    }
    typedSearchParams() {
        const sametype = false && new (caseInsenstiveURLSearchParams(whatwg_url_1.URLSearchParams))();
        return this.searchParams;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        const { href, origin, protocol, username, password, hosts, pathname, search, searchParams, hash } = this;
        return {
            href,
            origin,
            protocol,
            username,
            password,
            hosts,
            pathname,
            search,
            searchParams,
            hash
        };
    }
}
exports.ConnectionString = ConnectionString;
class CommaAndColonSeparatedRecord extends CaseInsensitiveMap {
    constructor(from){
        super();
        for (const entry of (from !== null && from !== void 0 ? from : '').split(',')){
            if (!entry) continue;
            const colonIndex = entry.indexOf(':');
            if (colonIndex === -1) {
                this.set(entry, '');
            } else {
                this.set(entry.slice(0, colonIndex), entry.slice(colonIndex + 1));
            }
        }
    }
    toString() {
        return [
            ...this
        ].map((entry)=>entry.join(':')).join(',');
    }
}
exports.CommaAndColonSeparatedRecord = CommaAndColonSeparatedRecord;
exports.default = ConnectionString; //# sourceMappingURL=index.js.map
}),
"[project]/backend/node_modules/@mongodb-js/saslprep/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const getCodePoint = (character)=>character.codePointAt(0);
const first = (x)=>x[0];
const last = (x)=>x[x.length - 1];
function toCodePoints(input) {
    const codepoints = [];
    const size = input.length;
    for(let i = 0; i < size; i += 1){
        const before = input.charCodeAt(i);
        if (before >= 0xd800 && before <= 0xdbff && size > i + 1) {
            const next = input.charCodeAt(i + 1);
            if (next >= 0xdc00 && next <= 0xdfff) {
                codepoints.push((before - 0xd800) * 0x400 + next - 0xdc00 + 0x10000);
                i += 1;
                continue;
            }
        }
        codepoints.push(before);
    }
    return codepoints;
}
function saslprep({ unassigned_code_points, commonly_mapped_to_nothing, non_ASCII_space_characters, prohibited_characters, bidirectional_r_al, bidirectional_l }, input, opts = {}) {
    const mapping2space = non_ASCII_space_characters;
    const mapping2nothing = commonly_mapped_to_nothing;
    if (typeof input !== 'string') {
        throw new TypeError('Expected string.');
    }
    if (input.length === 0) {
        return '';
    }
    const mapped_input = toCodePoints(input).map((character)=>mapping2space.get(character) ? 0x20 : character).filter((character)=>!mapping2nothing.get(character));
    const normalized_input = String.fromCodePoint.apply(null, mapped_input).normalize('NFKC');
    const normalized_map = toCodePoints(normalized_input);
    const hasProhibited = normalized_map.some((character)=>prohibited_characters.get(character));
    if (hasProhibited) {
        throw new Error('Prohibited character, see https://tools.ietf.org/html/rfc4013#section-2.3');
    }
    if (opts.allowUnassigned !== true) {
        const hasUnassigned = normalized_map.some((character)=>unassigned_code_points.get(character));
        if (hasUnassigned) {
            throw new Error('Unassigned code point, see https://tools.ietf.org/html/rfc4013#section-2.5');
        }
    }
    const hasBidiRAL = normalized_map.some((character)=>bidirectional_r_al.get(character));
    const hasBidiL = normalized_map.some((character)=>bidirectional_l.get(character));
    if (hasBidiRAL && hasBidiL) {
        throw new Error('String must not contain RandALCat and LCat at the same time,' + ' see https://tools.ietf.org/html/rfc3454#section-6');
    }
    const isFirstBidiRAL = bidirectional_r_al.get(getCodePoint(first(normalized_input)));
    const isLastBidiRAL = bidirectional_r_al.get(getCodePoint(last(normalized_input)));
    if (hasBidiRAL && !(isFirstBidiRAL && isLastBidiRAL)) {
        throw new Error('Bidirectional RandALCat character must be the first and the last' + ' character of the string, see https://tools.ietf.org/html/rfc3454#section-6');
    }
    return normalized_input;
}
saslprep.saslprep = saslprep;
saslprep.default = saslprep;
module.exports = saslprep; //# sourceMappingURL=index.js.map
}),
"[project]/backend/node_modules/@mongodb-js/saslprep/dist/memory-code-points.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createMemoryCodePoints = createMemoryCodePoints;
const sparse_bitfield_1 = __importDefault(__turbopack_context__.r("[project]/backend/node_modules/sparse-bitfield/index.js [app-route] (ecmascript)"));
function createMemoryCodePoints(data) {
    let offset = 0;
    function read() {
        const size = data.readUInt32BE(offset);
        offset += 4;
        const codepoints = data.slice(offset, offset + size);
        offset += size;
        return (0, sparse_bitfield_1.default)({
            buffer: codepoints
        });
    }
    const unassigned_code_points = read();
    const commonly_mapped_to_nothing = read();
    const non_ASCII_space_characters = read();
    const prohibited_characters = read();
    const bidirectional_r_al = read();
    const bidirectional_l = read();
    return {
        unassigned_code_points,
        commonly_mapped_to_nothing,
        non_ASCII_space_characters,
        prohibited_characters,
        bidirectional_r_al,
        bidirectional_l
    };
} //# sourceMappingURL=memory-code-points.js.map
}),
"[project]/backend/node_modules/@mongodb-js/saslprep/dist/code-points-data.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const zlib_1 = __turbopack_context__.r("[externals]/zlib [external] (zlib, cjs)");
exports.default = (0, zlib_1.gunzipSync)(Buffer.from('H4sIAAAAAAACA+3dTYgcaRkA4LemO9Mhxm0FITnE9Cwr4jHgwgZ22B6YywqCJ0HQg5CL4sGTuOjCtGSF4CkHEW856MlTQHD3EJnWkU0Owh5VxE3LHlYQdNxd2U6mU59UV/d09fw4M2EySSXPAzNdP1/9fX/99bzVNZEN4jisRDulVFnQmLxm1aXF9Id/2/xMxNJ4XZlg576yuYlGt9gupV6xoFf8jhu9YvulVrFlp5XSx+lfvYhORGPXvqIRWSxERKtIm8bKFd10WNfKDS5Fo9jJWrq2+M2IlW+8uHgl/+BsROfPF4v5L7148Ur68Sha6dqZpYiVVy8tvLCWXo80Sf/lS89dGX2wHGvpzoXVn75/YWH5wmqe8uika82ViJXTy83Ve2k5Urozm38wm4/ls6t5uT6yfsTSJ7J3T0VKt8c5ExEXI8aFkH729c3eT+7EC6ca8cVULZUiYacX0R5PNWNxlh9L1y90q5kyzrpyy+9WcvOV6URntqw7La9sNVstXyczWVaWYbaaTYqzOHpr7pyiNT3/YzKuT63Z/FqKZlFTiuXtFM2vVOtIq7jiyKJbWZaOWD0euz0yoV2Z7kY0xq2x0YhfzVpmM5px9nTEH7JZ0ot5u39p0ma75Z472/s/H+2yr2inYyuq7fMvJivH2rM72N/Z3lyL31F2b1ya1P0zn816k2KP6JU9UzseucdQH5YqVeH/lFajSN2udg+TLJ9rksNxlvV2lki19rXKI43TPLejFu4ov7k3nMbhyhfY3Xb37f8BAGCf0eMTOH5szf154KmnNgKcnLb+Fzi2AfXktbN7fJelwTAiO/W5uQ2KINXRYu+znqo/WTAdLadURHmy3qciazd3bra4T3w16/f7t7Ms9U5gfJu10955sx1r3vmhBAAAAAAAgId20J1iZbDowNvIjuH427Gr5l/eiC+8OplZON8sVjx/qr9y+Pj+YRItT+NqAM+kkZs3AAAAAID6yfx1FwCAI97/dCh1/ub6SA0AAAAAAAAAgNoT/wcAAAAAAACA+hP/BwAAAAAAAID6E/8HAAAAAAAAgPoT/wcAAAAAAACA+hP/BwAAAAAAAID6E/8HAAAAAAAAgPoT/wcAAAAAAACA+hP/BwAAAAAAAID6E/8HAAAAAAAAgPoT/wcAAAAAAACA+hutp5SiQpYAAAAAAAAAQO2MIpZiT804flnAE2fhwjOeAZXr76kOAAAAAAAA8FjNf4N/l0NE3U/vuVQskLpSd4/Yh2xu9xTu0tFeeNYsLI2f/VMdNxTzj6Je9E/+6pp6Nn3awW3A54goe4Bss6v+PGsjQGMAAAAAAOBp5XEgwH6e7J7rwEQHRb/XvAMAAAAAAAA8yzoDeQDwVGjIAgAAAAAAAACoPfF/AAAAAAAAAKg/8X8AAAAAAAAAqD/xfwAAAAAAAACoP/F/AAAAAAAAAKg/8X8AAAAAAAAAqD/xfwAAAAAAAACoP/F/AAAAAAAAAKg/8X8AAAAAAAAAqD/xfwAAAAAAAACoP/F/AAAAAAAAAKg/8X8AAAAAAAAAqL/GSkSkClkCAAAAAAAAALXTSAAAAAAAAABA3Y1kAQAAAAAAAADUX8RSXZ9dsHC9+M8Fg2Ex/em1lAZpEBGttcrVjZqLEa+k0XpKw9mG4zWx4ukPUMhkAQAAAAAAABzBqbSe3//rXOS9HxGdo4TqR2XkutCdBu+LaPZw/lBbO7cbHnh2C7N7AIo4evEznllqLqWUp/LnYOtpM2bnOH66wI1+9GO4sOuISwv/TOlumu56FDv3NZhc4mR9v7zYIrafr40j/Cccvj9Xns3t3mu99E7qxUv3bqS0/ouNH/08++RGemfQ+nsx/5uNXsQPGulynPvv3ZTW37zd+1ovrqaYpP/122X6Xpx779Z3zr/3YOPKW1lkaRDf31pPaf3j/msRsVGkL+d/f+/m4sJsPm1cfSsr16e8m9Ldj/KsnyIuR3nXw83Is3EhxLd/2V773ks3m/cj/THKUummdP9qKhIOImuOU0Xjwb3y+oqt735rpTetVbF9n8R4x9crRfO77TKqVOZpDclv5bfK18lMnk+q0K18UpxF/RrGXE0Zxtqx3tWSj+vxbL4XaasfKb0dRbtLW73JsfPGg177H+OmGKlfvS1msllt7JEJm9XOJqXR+Fkfo1H66uy5H1v3Xx5+uJmGLw9jro2u7Loj4PnuR6+f+e3d261+eazNhzrL7X83MohoHpS4PddV8ki1it61//pw1g7z6p1U/26Nm2llST57B5rUvuG0XqSU/rPd7jYrqWcbd+beJQ77BgPMDwn37/8BAGCf0eMTOH4cPlufv9VGgJOzqf8Fjm1APXkd7B7f5dF57GPMaWy/MTvjvNvtXj6h8W2+GXvnzXaseeeHEgAAAAAAAB7aQXeKlcGiadBoEOeLb2dtpGOL2MyOtf391a3P/zD96c3JzIP3t4oV797vrh8+vn+YRL5bBuj/AQAAAABqJvfHXQAAHkX82zfXAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACeAgkAAAAAAAAAqLuRLAAAAAAAAACA2hv9D1iu/VAYaAYA', 'base64')); //# sourceMappingURL=code-points-data.js.map
}),
"[project]/backend/node_modules/@mongodb-js/saslprep/dist/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
const index_1 = __importDefault(__turbopack_context__.r("[project]/backend/node_modules/@mongodb-js/saslprep/dist/index.js [app-route] (ecmascript)"));
const memory_code_points_1 = __turbopack_context__.r("[project]/backend/node_modules/@mongodb-js/saslprep/dist/memory-code-points.js [app-route] (ecmascript)");
const code_points_data_1 = __importDefault(__turbopack_context__.r("[project]/backend/node_modules/@mongodb-js/saslprep/dist/code-points-data.js [app-route] (ecmascript)"));
const codePoints = (0, memory_code_points_1.createMemoryCodePoints)(code_points_data_1.default);
function saslprep(input, opts) {
    return (0, index_1.default)(codePoints, input, opts);
}
saslprep.saslprep = saslprep;
saslprep.default = saslprep;
module.exports = saslprep; //# sourceMappingURL=node.js.map
}),
"[project]/backend/node_modules/memory-pager/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = Pager;
function Pager(pageSize, opts) {
    if (!(this instanceof Pager)) return new Pager(pageSize, opts);
    this.length = 0;
    this.updates = [];
    this.path = new Uint16Array(4);
    this.pages = new Array(32768);
    this.maxPages = this.pages.length;
    this.level = 0;
    this.pageSize = pageSize || 1024;
    this.deduplicate = opts ? opts.deduplicate : null;
    this.zeros = this.deduplicate ? alloc(this.deduplicate.length) : null;
}
Pager.prototype.updated = function(page) {
    while(this.deduplicate && page.buffer[page.deduplicate] === this.deduplicate[page.deduplicate]){
        page.deduplicate++;
        if (page.deduplicate === this.deduplicate.length) {
            page.deduplicate = 0;
            if (page.buffer.equals && page.buffer.equals(this.deduplicate)) page.buffer = this.deduplicate;
            break;
        }
    }
    if (page.updated || !this.updates) return;
    page.updated = true;
    this.updates.push(page);
};
Pager.prototype.lastUpdate = function() {
    if (!this.updates || !this.updates.length) return null;
    var page = this.updates.pop();
    page.updated = false;
    return page;
};
Pager.prototype._array = function(i, noAllocate) {
    if (i >= this.maxPages) {
        if (noAllocate) return;
        grow(this, i);
    }
    factor(i, this.path);
    var arr = this.pages;
    for(var j = this.level; j > 0; j--){
        var p = this.path[j];
        var next = arr[p];
        if (!next) {
            if (noAllocate) return;
            next = arr[p] = new Array(32768);
        }
        arr = next;
    }
    return arr;
};
Pager.prototype.get = function(i, noAllocate) {
    var arr = this._array(i, noAllocate);
    var first = this.path[0];
    var page = arr && arr[first];
    if (!page && !noAllocate) {
        page = arr[first] = new Page(i, alloc(this.pageSize));
        if (i >= this.length) this.length = i + 1;
    }
    if (page && page.buffer === this.deduplicate && this.deduplicate && !noAllocate) {
        page.buffer = copy(page.buffer);
        page.deduplicate = 0;
    }
    return page;
};
Pager.prototype.set = function(i, buf) {
    var arr = this._array(i, false);
    var first = this.path[0];
    if (i >= this.length) this.length = i + 1;
    if (!buf || this.zeros && buf.equals && buf.equals(this.zeros)) {
        arr[first] = undefined;
        return;
    }
    if (this.deduplicate && buf.equals && buf.equals(this.deduplicate)) {
        buf = this.deduplicate;
    }
    var page = arr[first];
    var b = truncate(buf, this.pageSize);
    if (page) page.buffer = b;
    else arr[first] = new Page(i, b);
};
Pager.prototype.toBuffer = function() {
    var list = new Array(this.length);
    var empty = alloc(this.pageSize);
    var ptr = 0;
    while(ptr < list.length){
        var arr = this._array(ptr, true);
        for(var i = 0; i < 32768 && ptr < list.length; i++){
            list[ptr++] = arr && arr[i] ? arr[i].buffer : empty;
        }
    }
    return Buffer.concat(list);
};
function grow(pager, index) {
    while(pager.maxPages < index){
        var old = pager.pages;
        pager.pages = new Array(32768);
        pager.pages[0] = old;
        pager.level++;
        pager.maxPages *= 32768;
    }
}
function truncate(buf, len) {
    if (buf.length === len) return buf;
    if (buf.length > len) return buf.slice(0, len);
    var cpy = alloc(len);
    buf.copy(cpy);
    return cpy;
}
function alloc(size) {
    if (Buffer.alloc) return Buffer.alloc(size);
    var buf = new Buffer(size);
    buf.fill(0);
    return buf;
}
function copy(buf) {
    var cpy = Buffer.allocUnsafe ? Buffer.allocUnsafe(buf.length) : new Buffer(buf.length);
    buf.copy(cpy);
    return cpy;
}
function Page(i, buf) {
    this.offset = i * buf.length;
    this.buffer = buf;
    this.updated = false;
    this.deduplicate = 0;
}
function factor(n, out) {
    n = (n - (out[0] = n & 32767)) / 32768;
    n = (n - (out[1] = n & 32767)) / 32768;
    out[3] = (n - (out[2] = n & 32767)) / 32768 & 32767;
}
}),
"[project]/backend/node_modules/sparse-bitfield/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var pager = __turbopack_context__.r("[project]/backend/node_modules/memory-pager/index.js [app-route] (ecmascript)");
module.exports = Bitfield;
function Bitfield(opts) {
    if (!(this instanceof Bitfield)) return new Bitfield(opts);
    if (!opts) opts = {};
    if (Buffer.isBuffer(opts)) opts = {
        buffer: opts
    };
    this.pageOffset = opts.pageOffset || 0;
    this.pageSize = opts.pageSize || 1024;
    this.pages = opts.pages || pager(this.pageSize);
    this.byteLength = this.pages.length * this.pageSize;
    this.length = 8 * this.byteLength;
    if (!powerOfTwo(this.pageSize)) throw new Error('The page size should be a power of two');
    this._trackUpdates = !!opts.trackUpdates;
    this._pageMask = this.pageSize - 1;
    if (opts.buffer) {
        for(var i = 0; i < opts.buffer.length; i += this.pageSize){
            this.pages.set(i / this.pageSize, opts.buffer.slice(i, i + this.pageSize));
        }
        this.byteLength = opts.buffer.length;
        this.length = 8 * this.byteLength;
    }
}
Bitfield.prototype.get = function(i) {
    var o = i & 7;
    var j = (i - o) / 8;
    return !!(this.getByte(j) & 128 >> o);
};
Bitfield.prototype.getByte = function(i) {
    var o = i & this._pageMask;
    var j = (i - o) / this.pageSize;
    var page = this.pages.get(j, true);
    return page ? page.buffer[o + this.pageOffset] : 0;
};
Bitfield.prototype.set = function(i, v) {
    var o = i & 7;
    var j = (i - o) / 8;
    var b = this.getByte(j);
    return this.setByte(j, v ? b | 128 >> o : b & (255 ^ 128 >> o));
};
Bitfield.prototype.toBuffer = function() {
    var all = alloc(this.pages.length * this.pageSize);
    for(var i = 0; i < this.pages.length; i++){
        var next = this.pages.get(i, true);
        var allOffset = i * this.pageSize;
        if (next) next.buffer.copy(all, allOffset, this.pageOffset, this.pageOffset + this.pageSize);
    }
    return all;
};
Bitfield.prototype.setByte = function(i, b) {
    var o = i & this._pageMask;
    var j = (i - o) / this.pageSize;
    var page = this.pages.get(j, false);
    o += this.pageOffset;
    if (page.buffer[o] === b) return false;
    page.buffer[o] = b;
    if (i >= this.byteLength) {
        this.byteLength = i + 1;
        this.length = this.byteLength * 8;
    }
    if (this._trackUpdates) this.pages.updated(page);
    return true;
};
function alloc(n) {
    if (Buffer.alloc) return Buffer.alloc(n);
    var b = new Buffer(n);
    b.fill(0);
    return b;
}
function powerOfTwo(x) {
    return !(x & x - 1);
}
}),
"[project]/backend/node_modules/ms/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Helpers.
 */ var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */ module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
        return parse(val);
    } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */ function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch(type){
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
        return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
}
/**
 * Pluralization helper.
 */ function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}
}),
"[project]/backend/node_modules/mpath/lib/stringToParts.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function stringToParts(str) {
    const result = [];
    let curPropertyName = '';
    let state = 'DEFAULT';
    for(let i = 0; i < str.length; ++i){
        // Fall back to treating as property name rather than bracket notation if
        // square brackets contains something other than a number.
        if (state === 'IN_SQUARE_BRACKETS' && !/\d/.test(str[i]) && str[i] !== ']') {
            state = 'DEFAULT';
            curPropertyName = result[result.length - 1] + '[' + curPropertyName;
            result.splice(result.length - 1, 1);
        }
        if (str[i] === '[') {
            if (state !== 'IMMEDIATELY_AFTER_SQUARE_BRACKETS') {
                result.push(curPropertyName);
                curPropertyName = '';
            }
            state = 'IN_SQUARE_BRACKETS';
        } else if (str[i] === ']') {
            if (state === 'IN_SQUARE_BRACKETS') {
                state = 'IMMEDIATELY_AFTER_SQUARE_BRACKETS';
                result.push(curPropertyName);
                curPropertyName = '';
            } else {
                state = 'DEFAULT';
                curPropertyName += str[i];
            }
        } else if (str[i] === '.') {
            if (state !== 'IMMEDIATELY_AFTER_SQUARE_BRACKETS') {
                result.push(curPropertyName);
                curPropertyName = '';
            }
            state = 'DEFAULT';
        } else {
            curPropertyName += str[i];
        }
    }
    if (state !== 'IMMEDIATELY_AFTER_SQUARE_BRACKETS') {
        result.push(curPropertyName);
    }
    return result;
};
}),
"[project]/backend/node_modules/mpath/lib/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* eslint strict:off */ /* eslint no-var: off */ /* eslint no-redeclare: off */ var stringToParts = __turbopack_context__.r("[project]/backend/node_modules/mpath/lib/stringToParts.js [app-route] (ecmascript)");
// These properties are special and can open client libraries to security
// issues
var ignoreProperties = [
    '__proto__',
    'constructor',
    'prototype'
];
/**
 * Returns the value of object `o` at the given `path`.
 *
 * ####Example:
 *
 *     var obj = {
 *         comments: [
 *             { title: 'exciting!', _doc: { title: 'great!' }}
 *           , { title: 'number dos' }
 *         ]
 *     }
 *
 *     mpath.get('comments.0.title', o)         // 'exciting!'
 *     mpath.get('comments.0.title', o, '_doc') // 'great!'
 *     mpath.get('comments.title', o)           // ['exciting!', 'number dos']
 *
 *     // summary
 *     mpath.get(path, o)
 *     mpath.get(path, o, special)
 *     mpath.get(path, o, map)
 *     mpath.get(path, o, special, map)
 *
 * @param {String} path
 * @param {Object} o
 * @param {String} [special] When this property name is present on any object in the path, walking will continue on the value of this property.
 * @param {Function} [map] Optional function which receives each individual found value. The value returned from `map` is used in the original values place.
 */ exports.get = function(path, o, special, map) {
    var lookup;
    if ('function' == typeof special) {
        if (special.length < 2) {
            map = special;
            special = undefined;
        } else {
            lookup = special;
            special = undefined;
        }
    }
    map || (map = K);
    var parts = 'string' == typeof path ? stringToParts(path) : path;
    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }
    var obj = o, part;
    for(var i = 0; i < parts.length; ++i){
        part = parts[i];
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `get()` must be a string or number, got ' + typeof parts[i]);
        }
        if (Array.isArray(obj) && !/^\d+$/.test(part)) {
            // reading a property from the array items
            var paths = parts.slice(i);
            // Need to `concat()` to avoid `map()` calling a constructor of an array
            // subclass
            return [].concat(obj).map(function(item) {
                return item ? exports.get(paths, item, special || lookup, map) : map(undefined);
            });
        }
        if (lookup) {
            obj = lookup(obj, part);
        } else {
            var _from = special && obj[special] ? obj[special] : obj;
            obj = _from instanceof Map ? _from.get(part) : _from[part];
        }
        if (!obj) return map(obj);
    }
    return map(obj);
};
/**
 * Returns true if `in` returns true for every piece of the path
 *
 * @param {String} path
 * @param {Object} o
 */ exports.has = function(path, o) {
    var parts = typeof path === 'string' ? stringToParts(path) : path;
    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }
    var len = parts.length;
    var cur = o;
    for(var i = 0; i < len; ++i){
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `has()` must be a string or number, got ' + typeof parts[i]);
        }
        if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
            return false;
        }
        cur = cur[parts[i]];
    }
    return true;
};
/**
 * Deletes the last piece of `path`
 *
 * @param {String} path
 * @param {Object} o
 */ exports.unset = function(path, o) {
    var parts = typeof path === 'string' ? stringToParts(path) : path;
    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }
    var len = parts.length;
    var cur = o;
    for(var i = 0; i < len; ++i){
        if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
            return false;
        }
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `unset()` must be a string or number, got ' + typeof parts[i]);
        }
        // Disallow any updates to __proto__ or special properties.
        if (ignoreProperties.indexOf(parts[i]) !== -1) {
            return false;
        }
        if (i === len - 1) {
            delete cur[parts[i]];
            return true;
        }
        cur = cur instanceof Map ? cur.get(parts[i]) : cur[parts[i]];
    }
    return true;
};
/**
 * Sets the `val` at the given `path` of object `o`.
 *
 * @param {String} path
 * @param {Anything} val
 * @param {Object} o
 * @param {String} [special] When this property name is present on any object in the path, walking will continue on the value of this property.
 * @param {Function} [map] Optional function which is passed each individual value before setting it. The value returned from `map` is used in the original values place.
 */ exports.set = function(path, val, o, special, map, _copying) {
    var lookup;
    if ('function' == typeof special) {
        if (special.length < 2) {
            map = special;
            special = undefined;
        } else {
            lookup = special;
            special = undefined;
        }
    }
    map || (map = K);
    var parts = 'string' == typeof path ? stringToParts(path) : path;
    if (!Array.isArray(parts)) {
        throw new TypeError('Invalid `path`. Must be either string or array');
    }
    if (null == o) return;
    for(var i = 0; i < parts.length; ++i){
        if (typeof parts[i] !== 'string' && typeof parts[i] !== 'number') {
            throw new TypeError('Each segment of path to `set()` must be a string or number, got ' + typeof parts[i]);
        }
        // Silently ignore any updates to `__proto__`, these are potentially
        // dangerous if using mpath with unsanitized data.
        if (ignoreProperties.indexOf(parts[i]) !== -1) {
            return;
        }
    }
    // the existance of $ in a path tells us if the user desires
    // the copying of an array instead of setting each value of
    // the array to the one by one to matching positions of the
    // current array. Unless the user explicitly opted out by passing
    // false, see Automattic/mongoose#6273
    var copy = _copying || /\$/.test(path) && _copying !== false, obj = o, part;
    for(var i = 0, len = parts.length - 1; i < len; ++i){
        part = parts[i];
        if ('$' == part) {
            if (i == len - 1) {
                break;
            } else {
                continue;
            }
        }
        if (Array.isArray(obj) && !/^\d+$/.test(part)) {
            var paths = parts.slice(i);
            if (!copy && Array.isArray(val)) {
                for(var j = 0; j < obj.length && j < val.length; ++j){
                    // assignment of single values of array
                    exports.set(paths, val[j], obj[j], special || lookup, map, copy);
                }
            } else {
                for(var j = 0; j < obj.length; ++j){
                    // assignment of entire value
                    exports.set(paths, val, obj[j], special || lookup, map, copy);
                }
            }
            return;
        }
        if (lookup) {
            obj = lookup(obj, part);
        } else {
            var _to = special && obj[special] ? obj[special] : obj;
            obj = _to instanceof Map ? _to.get(part) : _to[part];
        }
        if (!obj) return;
    }
    // process the last property of the path
    part = parts[len];
    // use the special property if exists
    if (special && obj[special]) {
        obj = obj[special];
    }
    // set the value on the last branch
    if (Array.isArray(obj) && !/^\d+$/.test(part)) {
        if (!copy && Array.isArray(val)) {
            _setArray(obj, val, part, lookup, special, map);
        } else {
            for(var j = 0; j < obj.length; ++j){
                var item = obj[j];
                if (item) {
                    if (lookup) {
                        lookup(item, part, map(val));
                    } else {
                        if (item[special]) item = item[special];
                        item[part] = map(val);
                    }
                }
            }
        }
    } else {
        if (lookup) {
            lookup(obj, part, map(val));
        } else if (obj instanceof Map) {
            obj.set(part, map(val));
        } else {
            obj[part] = map(val);
        }
    }
};
/*!
 * Split a string path into components delimited by '.' or
 * '[\d+]'
 *
 * #### Example:
 *     stringToParts('foo[0].bar.1'); // ['foo', '0', 'bar', '1']
 */ exports.stringToParts = stringToParts;
/*!
 * Recursively set nested arrays
 */ function _setArray(obj, val, part, lookup, special, map) {
    for(var item, j = 0; j < obj.length && j < val.length; ++j){
        item = obj[j];
        if (Array.isArray(item) && Array.isArray(val[j])) {
            _setArray(item, val[j], part, lookup, special, map);
        } else if (item) {
            if (lookup) {
                lookup(item, part, map(val[j]));
            } else {
                if (item[special]) item = item[special];
                item[part] = map(val[j]);
            }
        }
    }
}
/*!
 * Returns the value passed to it.
 */ function K(v) {
    return v;
}
}),
"[project]/backend/node_modules/mpath/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = exports = __turbopack_context__.r("[project]/backend/node_modules/mpath/lib/index.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/kareem/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Create a new instance
 */ function Kareem() {
    this._pres = new Map();
    this._posts = new Map();
}
Kareem.skipWrappedFunction = function skipWrappedFunction() {
    if (!(this instanceof Kareem.skipWrappedFunction)) {
        return new Kareem.skipWrappedFunction(...arguments);
    }
    this.args = [
        ...arguments
    ];
};
Kareem.overwriteResult = function overwriteResult() {
    if (!(this instanceof Kareem.overwriteResult)) {
        return new Kareem.overwriteResult(...arguments);
    }
    this.args = [
        ...arguments
    ];
};
/**
 * Execute all "pre" hooks for "name"
 * @param {String} name The hook name to execute
 * @param {*} context Overwrite the "this" for the hook
 * @param {Array|Function} args Optional arguments or directly the callback
 * @param {Function} [callback] The callback to call when executing all hooks are finished
 * @returns {void}
 */ Kareem.prototype.execPre = function(name, context, args, callback) {
    if (arguments.length === 3) {
        callback = args;
        args = [];
    }
    const pres = this._pres.get(name) || [];
    const numPres = pres.length;
    const numAsyncPres = pres.numAsync || 0;
    let currentPre = 0;
    let asyncPresLeft = numAsyncPres;
    let done = false;
    const $args = args;
    let shouldSkipWrappedFunction = null;
    if (!numPres) {
        return nextTick(function() {
            callback(null);
        });
    }
    function next() {
        if (currentPre >= numPres) {
            return;
        }
        const pre = pres[currentPre];
        if (pre.isAsync) {
            const args = [
                decorateNextFn(_next),
                decorateNextFn(function(error) {
                    if (error) {
                        if (done) {
                            return;
                        }
                        if (error instanceof Kareem.skipWrappedFunction) {
                            shouldSkipWrappedFunction = error;
                        } else {
                            done = true;
                            return callback(error);
                        }
                    }
                    if (--asyncPresLeft === 0 && currentPre >= numPres) {
                        return callback(shouldSkipWrappedFunction);
                    }
                })
            ];
            callMiddlewareFunction(pre.fn, context, args, args[0]);
        } else if (pre.fn.length > 0) {
            const args = [
                decorateNextFn(_next)
            ];
            const _args = arguments.length >= 2 ? arguments : [
                null
            ].concat($args);
            for(let i = 1; i < _args.length; ++i){
                if (i === _args.length - 1 && typeof _args[i] === 'function') {
                    continue; // skip callbacks to avoid accidentally calling the callback from a hook
                }
                args.push(_args[i]);
            }
            callMiddlewareFunction(pre.fn, context, args, args[0]);
        } else {
            let maybePromiseLike = null;
            try {
                maybePromiseLike = pre.fn.call(context);
            } catch (err) {
                if (err != null) {
                    return callback(err);
                }
            }
            if (isPromiseLike(maybePromiseLike)) {
                maybePromiseLike.then(()=>_next(), (err)=>_next(err));
            } else {
                if (++currentPre >= numPres) {
                    if (asyncPresLeft > 0) {
                        // Leave parallel hooks to run
                        return;
                    } else {
                        return nextTick(function() {
                            callback(shouldSkipWrappedFunction);
                        });
                    }
                }
                next();
            }
        }
    }
    next.apply(null, [
        null
    ].concat(args));
    function _next(error) {
        if (error) {
            if (done) {
                return;
            }
            if (error instanceof Kareem.skipWrappedFunction) {
                shouldSkipWrappedFunction = error;
            } else {
                done = true;
                return callback(error);
            }
        }
        if (++currentPre >= numPres) {
            if (asyncPresLeft > 0) {
                // Leave parallel hooks to run
                return;
            } else {
                return callback(shouldSkipWrappedFunction);
            }
        }
        next.apply(context, arguments);
    }
};
/**
 * Execute all "pre" hooks for "name" synchronously
 * @param {String} name The hook name to execute
 * @param {*} context Overwrite the "this" for the hook
 * @param {Array} [args] Apply custom arguments to the hook
 * @returns {void}
 */ Kareem.prototype.execPreSync = function(name, context, args) {
    const pres = this._pres.get(name) || [];
    const numPres = pres.length;
    for(let i = 0; i < numPres; ++i){
        pres[i].fn.apply(context, args || []);
    }
};
/**
 * Execute all "post" hooks for "name"
 * @param {String} name The hook name to execute
 * @param {*} context Overwrite the "this" for the hook
 * @param {Array|Function} args Apply custom arguments to the hook
 * @param {*} options Optional options or directly the callback
 * @param {Function} [callback] The callback to call when executing all hooks are finished
 * @returns {void}
 */ Kareem.prototype.execPost = function(name, context, args, options, callback) {
    if (arguments.length < 5) {
        callback = options;
        options = null;
    }
    const posts = this._posts.get(name) || [];
    const numPosts = posts.length;
    let currentPost = 0;
    let firstError = null;
    if (options && options.error) {
        firstError = options.error;
    }
    if (!numPosts) {
        return nextTick(function() {
            callback.apply(null, [
                firstError
            ].concat(args));
        });
    }
    function next() {
        const post = posts[currentPost].fn;
        let numArgs = 0;
        const argLength = args.length;
        const newArgs = [];
        for(let i = 0; i < argLength; ++i){
            numArgs += args[i] && args[i]._kareemIgnore ? 0 : 1;
            if (!args[i] || !args[i]._kareemIgnore) {
                newArgs.push(args[i]);
            }
        }
        if (firstError) {
            if (isErrorHandlingMiddleware(posts[currentPost], numArgs)) {
                const _cb = decorateNextFn(function(error) {
                    if (error) {
                        if (error instanceof Kareem.overwriteResult) {
                            args = error.args;
                            if (++currentPost >= numPosts) {
                                return callback.call(null, firstError);
                            }
                            return next();
                        }
                        firstError = error;
                    }
                    if (++currentPost >= numPosts) {
                        return callback.call(null, firstError);
                    }
                    next();
                });
                callMiddlewareFunction(post, context, [
                    firstError
                ].concat(newArgs).concat([
                    _cb
                ]), _cb);
            } else {
                if (++currentPost >= numPosts) {
                    return callback.call(null, firstError);
                }
                next();
            }
        } else {
            const _cb = decorateNextFn(function(error) {
                if (error) {
                    if (error instanceof Kareem.overwriteResult) {
                        args = error.args;
                        if (++currentPost >= numPosts) {
                            return callback.apply(null, [
                                null
                            ].concat(args));
                        }
                        return next();
                    }
                    firstError = error;
                    return next();
                }
                if (++currentPost >= numPosts) {
                    return callback.apply(null, [
                        null
                    ].concat(args));
                }
                next();
            });
            if (isErrorHandlingMiddleware(posts[currentPost], numArgs)) {
                // Skip error handlers if no error
                if (++currentPost >= numPosts) {
                    return callback.apply(null, [
                        null
                    ].concat(args));
                }
                return next();
            }
            if (post.length === numArgs + 1) {
                callMiddlewareFunction(post, context, newArgs.concat([
                    _cb
                ]), _cb);
            } else {
                let error;
                let maybePromiseLike;
                try {
                    maybePromiseLike = post.apply(context, newArgs);
                } catch (err) {
                    error = err;
                    firstError = err;
                }
                if (isPromiseLike(maybePromiseLike)) {
                    return maybePromiseLike.then((res)=>{
                        _cb(res instanceof Kareem.overwriteResult ? res : null);
                    }, (err)=>_cb(err));
                }
                if (maybePromiseLike instanceof Kareem.overwriteResult) {
                    args = maybePromiseLike.args;
                }
                if (++currentPost >= numPosts) {
                    return callback.apply(null, [
                        error
                    ].concat(args));
                }
                next();
            }
        }
    }
    next();
};
/**
 * Execute all "post" hooks for "name" synchronously
 * @param {String} name The hook name to execute
 * @param {*} context Overwrite the "this" for the hook
 * @param {Array|Function} args Apply custom arguments to the hook
 * @returns {Array} The used arguments
 */ Kareem.prototype.execPostSync = function(name, context, args) {
    const posts = this._posts.get(name) || [];
    const numPosts = posts.length;
    for(let i = 0; i < numPosts; ++i){
        const res = posts[i].fn.apply(context, args || []);
        if (res instanceof Kareem.overwriteResult) {
            args = res.args;
        }
    }
    return args;
};
/**
 * Create a synchronous wrapper for "fn"
 * @param {String} name The name of the hook
 * @param {Function} fn The function to wrap
 * @returns {Function} The wrapped function
 */ Kareem.prototype.createWrapperSync = function(name, fn) {
    const _this = this;
    return function syncWrapper() {
        _this.execPreSync(name, this, arguments);
        const toReturn = fn.apply(this, arguments);
        const result = _this.execPostSync(name, this, [
            toReturn
        ]);
        return result[0];
    };
};
function _handleWrapError(instance, error, name, context, args, options, callback) {
    if (options.useErrorHandlers) {
        return instance.execPost(name, context, args, {
            error: error
        }, function(error) {
            return typeof callback === 'function' && callback(error);
        });
    } else {
        return typeof callback === 'function' && callback(error);
    }
}
/**
 * Executes pre hooks, followed by the wrapped function, followed by post hooks.
 * @param {String} name The name of the hook
 * @param {Function} fn The function for the hook
 * @param {*} context Overwrite the "this" for the hook
 * @param {Array} args Apply custom arguments to the hook
 * @param {Object} [options]
 * @param {Boolean} [options.checkForPromise]
 * @returns {void}
 */ Kareem.prototype.wrap = function(name, fn, context, args, options) {
    const lastArg = args.length > 0 ? args[args.length - 1] : null;
    const argsWithoutCb = Array.from(args);
    typeof lastArg === 'function' && argsWithoutCb.pop();
    const _this = this;
    options = options || {};
    const checkForPromise = options.checkForPromise;
    this.execPre(name, context, args, function(error) {
        if (error && !(error instanceof Kareem.skipWrappedFunction)) {
            const numCallbackParams = options.numCallbackParams || 0;
            const errorArgs = options.contextParameter ? [
                context
            ] : [];
            for(let i = errorArgs.length; i < numCallbackParams; ++i){
                errorArgs.push(null);
            }
            return _handleWrapError(_this, error, name, context, errorArgs, options, lastArg);
        }
        const numParameters = fn.length;
        let ret;
        if (error instanceof Kareem.skipWrappedFunction) {
            ret = error.args[0];
            return _cb(null, ...error.args);
        } else {
            try {
                ret = fn.apply(context, argsWithoutCb.concat(_cb));
            } catch (err) {
                return _cb(err);
            }
        }
        if (checkForPromise) {
            if (isPromiseLike(ret)) {
                // Thenable, use it
                return ret.then((res)=>_cb(null, res), (err)=>_cb(err));
            }
            // If `fn()` doesn't have a callback argument and doesn't return a
            // promise, assume it is sync
            if (numParameters < argsWithoutCb.length + 1) {
                return _cb(null, ret);
            }
        }
        function _cb() {
            const argsWithoutError = Array.from(arguments);
            argsWithoutError.shift();
            if (options.nullResultByDefault && argsWithoutError.length === 0) {
                argsWithoutError.push(null);
            }
            if (arguments[0]) {
                // Assume error
                return _handleWrapError(_this, arguments[0], name, context, argsWithoutError, options, lastArg);
            } else {
                _this.execPost(name, context, argsWithoutError, function() {
                    if (lastArg === null) {
                        return;
                    }
                    arguments[0] ? lastArg(arguments[0]) : lastArg.apply(context, arguments);
                });
            }
        }
    });
};
/**
 * Filter current instance for something specific and return the filtered clone
 * @param {Function} fn The filter function
 * @returns {Kareem} The cloned and filtered instance
 */ Kareem.prototype.filter = function(fn) {
    const clone = this.clone();
    const pres = Array.from(clone._pres.keys());
    for (const name of pres){
        const hooks = this._pres.get(name).map((h)=>Object.assign({}, h, {
                name: name
            })).filter(fn);
        if (hooks.length === 0) {
            clone._pres.delete(name);
            continue;
        }
        hooks.numAsync = hooks.filter((h)=>h.isAsync).length;
        clone._pres.set(name, hooks);
    }
    const posts = Array.from(clone._posts.keys());
    for (const name of posts){
        const hooks = this._posts.get(name).map((h)=>Object.assign({}, h, {
                name: name
            })).filter(fn);
        if (hooks.length === 0) {
            clone._posts.delete(name);
            continue;
        }
        clone._posts.set(name, hooks);
    }
    return clone;
};
/**
 * Check for a "name" to exist either in pre or post hooks
 * @param {String} name The name of the hook
 * @returns {Boolean} "true" if found, "false" otherwise
 */ Kareem.prototype.hasHooks = function(name) {
    return this._pres.has(name) || this._posts.has(name);
};
/**
 * Create a Wrapper for "fn" on "name" and return the wrapped function
 * @param {String} name The name of the hook
 * @param {Function} fn The function to wrap
 * @param {*} context Overwrite the "this" for the hook
 * @param {Object} [options]
 * @returns {Function} The wrapped function
 */ Kareem.prototype.createWrapper = function(name, fn, context, options) {
    const _this = this;
    if (!this.hasHooks(name)) {
        // Fast path: if there's no hooks for this function, just return the
        // function wrapped in a nextTick()
        return function() {
            nextTick(()=>fn.apply(this, arguments));
        };
    }
    return function() {
        const _context = context || this;
        _this.wrap(name, fn, _context, Array.from(arguments), options);
    };
};
/**
 * Register a new hook for "pre"
 * @param {String} name The name of the hook
 * @param {Boolean} [isAsync]
 * @param {Function} fn The function to register for "name"
 * @param {never} error Unused
 * @param {Boolean} [unshift] Wheter to "push" or to "unshift" the new hook
 * @returns {Kareem}
 */ Kareem.prototype.pre = function(name, isAsync, fn, error, unshift) {
    let options = {};
    if (typeof isAsync === 'object' && isAsync !== null) {
        options = isAsync;
        isAsync = options.isAsync;
    } else if (typeof arguments[1] !== 'boolean') {
        fn = isAsync;
        isAsync = false;
    }
    const pres = this._pres.get(name) || [];
    this._pres.set(name, pres);
    if (isAsync) {
        pres.numAsync = pres.numAsync || 0;
        ++pres.numAsync;
    }
    if (typeof fn !== 'function') {
        throw new Error('pre() requires a function, got "' + typeof fn + '"');
    }
    if (unshift) {
        pres.unshift(Object.assign({}, options, {
            fn: fn,
            isAsync: isAsync
        }));
    } else {
        pres.push(Object.assign({}, options, {
            fn: fn,
            isAsync: isAsync
        }));
    }
    return this;
};
/**
 * Register a new hook for "post"
 * @param {String} name The name of the hook
 * @param {Object} [options]
 * @param {Function} fn The function to register for "name"
 * @param {Boolean} [unshift] Wheter to "push" or to "unshift" the new hook
 * @returns {Kareem}
 */ Kareem.prototype.post = function(name, options, fn, unshift) {
    const posts = this._posts.get(name) || [];
    if (typeof options === 'function') {
        unshift = !!fn;
        fn = options;
        options = {};
    }
    if (typeof fn !== 'function') {
        throw new Error('post() requires a function, got "' + typeof fn + '"');
    }
    if (unshift) {
        posts.unshift(Object.assign({}, options, {
            fn: fn
        }));
    } else {
        posts.push(Object.assign({}, options, {
            fn: fn
        }));
    }
    this._posts.set(name, posts);
    return this;
};
/**
 * Clone the current instance
 * @returns {Kareem} The cloned instance
 */ Kareem.prototype.clone = function() {
    const n = new Kareem();
    for (const key of this._pres.keys()){
        const clone = this._pres.get(key).slice();
        clone.numAsync = this._pres.get(key).numAsync;
        n._pres.set(key, clone);
    }
    for (const key of this._posts.keys()){
        n._posts.set(key, this._posts.get(key).slice());
    }
    return n;
};
/**
 * Merge "other" into self or "clone"
 * @param {Kareem} other The instance to merge with
 * @param {Kareem} [clone] The instance to merge onto (if not defined, using "this")
 * @returns {Kareem} The merged instance
 */ Kareem.prototype.merge = function(other, clone) {
    clone = arguments.length === 1 ? true : clone;
    const ret = clone ? this.clone() : this;
    for (const key of other._pres.keys()){
        const sourcePres = ret._pres.get(key) || [];
        const deduplicated = other._pres.get(key).// Deduplicate based on `fn`
        filter((p)=>sourcePres.map((_p)=>_p.fn).indexOf(p.fn) === -1);
        const combined = sourcePres.concat(deduplicated);
        combined.numAsync = sourcePres.numAsync || 0;
        combined.numAsync += deduplicated.filter((p)=>p.isAsync).length;
        ret._pres.set(key, combined);
    }
    for (const key of other._posts.keys()){
        const sourcePosts = ret._posts.get(key) || [];
        const deduplicated = other._posts.get(key).filter((p)=>sourcePosts.indexOf(p) === -1);
        ret._posts.set(key, sourcePosts.concat(deduplicated));
    }
    return ret;
};
function callMiddlewareFunction(fn, context, args, next) {
    let maybePromiseLike;
    try {
        maybePromiseLike = fn.apply(context, args);
    } catch (error) {
        return next(error);
    }
    if (isPromiseLike(maybePromiseLike)) {
        maybePromiseLike.then(()=>next(), (err)=>next(err));
    }
}
function isPromiseLike(v) {
    return typeof v === 'object' && v !== null && typeof v.then === 'function';
}
function decorateNextFn(fn) {
    let called = false;
    const _this = this;
    return function() {
        // Ensure this function can only be called once
        if (called) {
            return;
        }
        called = true;
        // Make sure to clear the stack so try/catch doesn't catch errors
        // in subsequent middleware
        return nextTick(()=>fn.apply(_this, arguments));
    };
}
const nextTick = typeof process === 'object' && process !== null && process.nextTick || function nextTick(cb) {
    setTimeout(cb, 0);
};
function isErrorHandlingMiddleware(post, numArgs) {
    if (post.errorHandler) {
        return true;
    }
    return post.fn.length === numArgs + 2;
}
module.exports = Kareem;
}),
"[project]/backend/node_modules/mquery/lib/permissions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const denied = exports;
denied.distinct = function(self) {
    if (self._fields && Object.keys(self._fields).length > 0) {
        return 'field selection and slice';
    }
    const keys = Object.keys(denied.distinct);
    let err;
    keys.every(function(option) {
        if (self.options[option]) {
            err = option;
            return false;
        }
        return true;
    });
    return err;
};
denied.distinct.select = denied.distinct.slice = denied.distinct.sort = denied.distinct.limit = denied.distinct.skip = denied.distinct.batchSize = denied.distinct.hint = denied.distinct.tailable = true;
// aggregation integration
denied.findOneAndUpdate = denied.findOneAndRemove = function(self) {
    const keys = Object.keys(denied.findOneAndUpdate);
    let err;
    keys.every(function(option) {
        if (self.options[option]) {
            err = option;
            return false;
        }
        return true;
    });
    return err;
};
denied.findOneAndUpdate.limit = denied.findOneAndUpdate.skip = denied.findOneAndUpdate.batchSize = denied.findOneAndUpdate.tailable = true;
denied.count = function(self) {
    if (self._fields && Object.keys(self._fields).length > 0) {
        return 'field selection and slice';
    }
    const keys = Object.keys(denied.count);
    let err;
    keys.every(function(option) {
        if (self.options[option]) {
            err = option;
            return false;
        }
        return true;
    });
    return err;
};
denied.count.slice = denied.count.batchSize = denied.count.tailable = true;
}),
"[project]/backend/node_modules/mquery/lib/env.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

exports.isNode = 'undefined' != typeof process && 'object' == ("TURBOPACK compile-time value", "object") && 'object' == ("TURBOPACK compile-time value", "object") && 'function' == typeof Buffer && process.argv;
exports.isMongo = !exports.isNode && 'function' == typeof printjson && 'function' == typeof ObjectId && 'function' == typeof rs && 'function' == typeof sh;
exports.isBrowser = !exports.isNode && !exports.isMongo && 'undefined' != ("TURBOPACK compile-time value", "undefined");
exports.type = exports.isNode ? 'node' : exports.isMongo ? 'mongo' : exports.isBrowser ? 'browser' : 'unknown';
}),
"[project]/backend/node_modules/mquery/lib/collection/collection.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * methods a collection must implement
 */ const methods = [
    'find',
    'findOne',
    'updateMany',
    'updateOne',
    'replaceOne',
    'count',
    'distinct',
    'findOneAndDelete',
    'findOneAndUpdate',
    'aggregate',
    'findCursor',
    'deleteOne',
    'deleteMany'
];
/**
 * Collection base class from which implementations inherit
 */ function Collection() {}
for(let i = 0, len = methods.length; i < len; ++i){
    const method = methods[i];
    Collection.prototype[method] = notImplemented(method);
}
module.exports = exports = Collection;
Collection.methods = methods;
/**
 * creates a function which throws an implementation error
 */ function notImplemented(method) {
    return function() {
        throw new Error('collection.' + method + ' not implemented');
    };
}
}),
"[project]/backend/node_modules/mquery/lib/collection/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Module dependencies
 */ const Collection = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/collection.js [app-route] (ecmascript)");
class NodeCollection extends Collection {
    constructor(col){
        super();
        this.collection = col;
        this.collectionName = col.collectionName;
    }
    /**
   * find(match, options)
   */ async find(match, options) {
        const cursor = this.collection.find(match, options);
        return cursor.toArray();
    }
    /**
   * findOne(match, options)
   */ async findOne(match, options) {
        return this.collection.findOne(match, options);
    }
    /**
   * count(match, options)
   */ async count(match, options) {
        return this.collection.count(match, options);
    }
    /**
   * distinct(prop, match, options)
   */ async distinct(prop, match, options) {
        return this.collection.distinct(prop, match, options);
    }
    /**
   * updateMany(match, update, options)
   */ async updateMany(match, update, options) {
        return this.collection.updateMany(match, update, options);
    }
    /**
   * updateOne(match, update, options)
   */ async updateOne(match, update, options) {
        return this.collection.updateOne(match, update, options);
    }
    /**
   * replaceOne(match, update, options)
   */ async replaceOne(match, update, options) {
        return this.collection.replaceOne(match, update, options);
    }
    /**
   * deleteOne(match, options)
   */ async deleteOne(match, options) {
        return this.collection.deleteOne(match, options);
    }
    /**
   * deleteMany(match, options)
   */ async deleteMany(match, options) {
        return this.collection.deleteMany(match, options);
    }
    /**
   * findOneAndDelete(match, options, function(err[, result])
   */ async findOneAndDelete(match, options) {
        return this.collection.findOneAndDelete(match, options);
    }
    /**
   * findOneAndUpdate(match, update, options)
   */ async findOneAndUpdate(match, update, options) {
        return this.collection.findOneAndUpdate(match, update, options);
    }
    /**
   * var cursor = findCursor(match, options)
   */ findCursor(match, options) {
        return this.collection.find(match, options);
    }
}
/**
 * Expose
 */ module.exports = exports = NodeCollection;
}),
"[project]/backend/node_modules/mquery/lib/collection/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const env = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/env.js [app-route] (ecmascript)");
if ('unknown' == env.type) {
    throw new Error('Unknown environment');
}
module.exports = env.isNode ? __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/node.js [app-route] (ecmascript)") : env.isMongo ? __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/collection.js [app-route] (ecmascript)") : __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/collection.js [app-route] (ecmascript)");
}),
"[project]/backend/node_modules/mquery/lib/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * Module dependencies.
 */ const specialProperties = [
    '__proto__',
    'constructor',
    'prototype'
];
/**
 * Clones objects
 *
 * @param {Object} obj the object to clone
 * @param {Object} options
 * @return {Object} the cloned object
 * @api private
 */ const clone = exports.clone = function clone(obj, options) {
    if (obj === undefined || obj === null) return obj;
    if (Array.isArray(obj)) return exports.cloneArray(obj, options);
    if (obj.constructor) {
        if (/ObjectI[dD]$/.test(obj.constructor.name)) {
            return 'function' == typeof obj.clone ? obj.clone() : new obj.constructor(obj.id);
        }
        if (obj.constructor.name === 'ReadPreference') {
            return new obj.constructor(obj.mode, clone(obj.tags, options));
        }
        if ('Binary' == obj._bsontype && obj.buffer && obj.value) {
            return 'function' == typeof obj.clone ? obj.clone() : new obj.constructor(obj.value(true), obj.sub_type);
        }
        if ('Date' === obj.constructor.name || 'Function' === obj.constructor.name) return new obj.constructor(+obj);
        if ('RegExp' === obj.constructor.name) return new RegExp(obj);
        if ('Buffer' === obj.constructor.name) return Buffer.from(obj);
    }
    if (isObject(obj)) return exports.cloneObject(obj, options);
    if (obj.valueOf) return obj.valueOf();
};
/*!
 * ignore
 */ exports.cloneObject = function cloneObject(obj, options) {
    const minimize = options && options.minimize, ret = {}, keys = Object.keys(obj), len = keys.length;
    let hasKeys = false, val, k = '', i = 0;
    for(i = 0; i < len; ++i){
        k = keys[i];
        // Not technically prototype pollution because this wouldn't merge properties
        // onto `Object.prototype`, but avoid properties like __proto__ as a precaution.
        if (specialProperties.indexOf(k) !== -1) {
            continue;
        }
        val = clone(obj[k], options);
        if (!minimize || 'undefined' !== typeof val) {
            hasKeys || (hasKeys = true);
            ret[k] = val;
        }
    }
    return minimize ? hasKeys && ret : ret;
};
exports.cloneArray = function cloneArray(arr, options) {
    const ret = [], l = arr.length;
    let i = 0;
    for(; i < l; i++)ret.push(clone(arr[i], options));
    return ret;
};
/**
 * Merges `from` into `to` without overwriting existing properties.
 *
 * @param {Object} to
 * @param {Object} from
 * @api private
 */ exports.merge = function merge(to, from) {
    const keys = Object.keys(from);
    for (const key of keys){
        if (specialProperties.indexOf(key) !== -1) {
            continue;
        }
        if ('undefined' === typeof to[key]) {
            to[key] = from[key];
        } else {
            if (exports.isObject(from[key])) {
                merge(to[key], from[key]);
            } else {
                to[key] = from[key];
            }
        }
    }
};
/**
 * Same as merge but clones the assigned values.
 *
 * @param {Object} to
 * @param {Object} from
 * @api private
 */ exports.mergeClone = function mergeClone(to, from) {
    const keys = Object.keys(from);
    for (const key of keys){
        if (specialProperties.indexOf(key) !== -1) {
            continue;
        }
        if ('undefined' === typeof to[key]) {
            to[key] = clone(from[key]);
        } else {
            if (exports.isObject(from[key])) {
                mergeClone(to[key], from[key]);
            } else {
                to[key] = clone(from[key]);
            }
        }
    }
};
/**
 * Read pref helper (mongo 2.2 drivers support this)
 *
 * Allows using aliases instead of full preference names:
 *
 *     p   primary
 *     pp  primaryPreferred
 *     s   secondary
 *     sp  secondaryPreferred
 *     n   nearest
 *
 * @param {String} pref
 */ exports.readPref = function readPref(pref) {
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
/**
 * Read Concern helper (mongo 3.2 drivers support this)
 *
 * Allows using string to specify read concern level:
 *
 *     local          3.2+
 *     available      3.6+
 *     majority       3.2+
 *     linearizable   3.4+
 *     snapshot       4.0+
 *
 * @param {String|Object} concern
 */ exports.readConcern = function readConcern(concern) {
    if ('string' === typeof concern) {
        switch(concern){
            case 'l':
                concern = 'local';
                break;
            case 'a':
                concern = 'available';
                break;
            case 'm':
                concern = 'majority';
                break;
            case 'lz':
                concern = 'linearizable';
                break;
            case 's':
                concern = 'snapshot';
                break;
        }
        concern = {
            level: concern
        };
    }
    return concern;
};
/**
 * Object.prototype.toString.call helper
 */ const _toString = Object.prototype.toString;
exports.toString = function(arg) {
    return _toString.call(arg);
};
/**
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @return {Boolean}
 */ const isObject = exports.isObject = function(arg) {
    return '[object Object]' == exports.toString(arg);
};
/**
 * Object.keys helper
 */ exports.keys = Object.keys;
/**
 * Basic Object.create polyfill.
 * Only one argument is supported.
 *
 * Based on https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 */ exports.create = 'function' == typeof Object.create ? Object.create : create;
function create(proto) {
    if (arguments.length > 1) {
        throw new Error('Adding properties is not supported');
    }
    function F() {}
    F.prototype = proto;
    return new F;
}
/**
 * inheritance
 */ exports.inherits = function(ctor, superCtor) {
    ctor.prototype = exports.create(superCtor.prototype);
    ctor.prototype.constructor = ctor;
};
/**
 * Check if this object is an arguments object
 *
 * @param {Any} v
 * @return {Boolean}
 */ exports.isArgumentsObject = function(v) {
    return Object.prototype.toString.call(v) === '[object Arguments]';
};
}),
"[project]/backend/node_modules/mquery/lib/mquery.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const utils = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/utils.js [app-route] (ecmascript)");
const debug = __turbopack_context__.r("[project]/backend/node_modules/debug/src/index.js [app-route] (ecmascript)")('mquery');
/**
 * Query constructor used for building queries.
 *
 * #### Example:
 *
 *     var query = new Query({ name: 'mquery' });
 *     query.setOptions({ collection: moduleCollection })
 *     await query.where('age').gte(21).exec();
 *
 * @param {Object} [criteria] criteria for the query OR the collection instance to use
 * @param {Object} [options]
 * @api public
 */ function Query(criteria, options) {
    if (!(this instanceof Query)) return new Query(criteria, options);
    const proto = this.constructor.prototype;
    this.op = proto.op || undefined;
    this.options = Object.assign({}, proto.options);
    this._conditions = proto._conditions ? utils.clone(proto._conditions) : {};
    this._fields = proto._fields ? utils.clone(proto._fields) : undefined;
    this._updateDoc = proto._updateDoc ? utils.clone(proto._updateDoc) : undefined;
    this._path = proto._path || undefined;
    this._distinctDoc = proto._distinctDoc || undefined;
    this._collection = proto._collection || undefined;
    this._traceFunction = proto._traceFunction || undefined;
    if (options) {
        this.setOptions(options);
    }
    if (criteria) {
        this.find(criteria);
    }
}
/**
 * This is a parameter that the user can set which determines if mquery
 * uses $within or $geoWithin for queries. It defaults to true which
 * means $geoWithin will be used. If using MongoDB < 2.4 you should
 * set this to false.
 *
 * @api public
 * @property use$geoWithin
 */ let $withinCmd = '$geoWithin';
Object.defineProperty(Query, 'use$geoWithin', {
    get: function() {
        return $withinCmd == '$geoWithin';
    },
    set: function(v) {
        if (true === v) {
            // mongodb >= 2.4
            $withinCmd = '$geoWithin';
        } else {
            $withinCmd = '$within';
        }
    }
});
/**
 * Converts this query to a constructor function with all arguments and options retained.
 *
 * #### Example:
 *
 *     // Create a query that will read documents with a "video" category from
 *     // `aCollection` on the primary node in the replica-set unless it is down,
 *     // in which case we'll read from a secondary node.
 *     var query = mquery({ category: 'video' })
 *     query.setOptions({ collection: aCollection, read: 'primaryPreferred' });
 *
 *     // create a constructor based off these settings
 *     var Video = query.toConstructor();
 *
 *     // Video is now a subclass of mquery() and works the same way but with the
 *     // default query parameters and options set.
 *
 *     // run a query with the previous settings but filter for movies with names
 *     // that start with "Life".
 *     Video().where({ name: /^Life/ }).exec(cb);
 *
 * @return {Query} new Query
 * @api public
 */ Query.prototype.toConstructor = function toConstructor() {
    function CustomQuery(criteria, options) {
        if (!(this instanceof CustomQuery)) return new CustomQuery(criteria, options);
        Query.call(this, criteria, options);
    }
    utils.inherits(CustomQuery, Query);
    // set inherited defaults
    const p = CustomQuery.prototype;
    p.options = {};
    p.setOptions(this.options);
    p.op = this.op;
    p._conditions = utils.clone(this._conditions);
    p._fields = utils.clone(this._fields);
    p._updateDoc = utils.clone(this._updateDoc);
    p._path = this._path;
    p._distinctDoc = this._distinctDoc;
    p._collection = this._collection;
    p._traceFunction = this._traceFunction;
    return CustomQuery;
};
/**
 * Sets query options.
 *
 * #### Options:
 *
 * - [tailable](http://www.mongodb.org/display/DOCS/Tailable+Cursors) *
 * - [sort](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7Bsort(\)%7D%7D) *
 * - [limit](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7Blimit%28%29%7D%7D) *
 * - [skip](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7Bskip%28%29%7D%7D) *
 * - [maxTime](http://docs.mongodb.org/manual/reference/operator/meta/maxTimeMS/#op._S_maxTimeMS) *
 * - [batchSize](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7BbatchSize%28%29%7D%7D) *
 * - [comment](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24comment) *
 * - [hint](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24hint) *
 * - [slaveOk](http://docs.mongodb.org/manual/applications/replication/#read-preference) *
 * - [safe](http://www.mongodb.org/display/DOCS/getLastError+Command)
 * - collection the collection to query against
 *
 * _* denotes a query helper method is also available_
 *
 * @param {Object} options
 * @api public
 */ Query.prototype.setOptions = function(options) {
    if (!(options && utils.isObject(options))) return this;
    // set arbitrary options
    const methods = utils.keys(options);
    let method;
    for(let i = 0; i < methods.length; ++i){
        method = methods[i];
        // use methods if exist (safer option manipulation)
        if ('function' == typeof this[method]) {
            const args = Array.isArray(options[method]) ? options[method] : [
                options[method]
            ];
            this[method].apply(this, args);
        } else {
            this.options[method] = options[method];
        }
    }
    return this;
};
/**
 * Sets this Querys collection.
 *
 * @param {Collection} coll
 * @return {Query} this
 */ Query.prototype.collection = function collection(coll) {
    this._collection = new Query.Collection(coll);
    return this;
};
/**
 * Adds a collation to this op (MongoDB 3.4 and up)
 *
 * #### Example:
 *
 *     query.find().collation({ locale: "en_US", strength: 1 })
 *
 * @param {Object} value
 * @return {Query} this
 * @see MongoDB docs https://docs.mongodb.com/manual/reference/method/cursor.collation/#cursor.collation
 * @api public
 */ Query.prototype.collation = function(value) {
    this.options.collation = value;
    return this;
};
/**
 * Specifies a `$where` condition
 *
 * Use `$where` when you need to select documents using a JavaScript expression.
 *
 * #### Example:
 *
 *     query.$where('this.comments.length > 10 || this.name.length > 5')
 *
 *     query.$where(function () {
 *       return this.comments.length > 10 || this.name.length > 5;
 *     })
 *
 * @param {String|Function} js javascript string or function
 * @return {Query} this
 * @memberOf Query
 * @method $where
 * @api public
 */ Query.prototype.$where = function(js) {
    this._conditions.$where = js;
    return this;
};
/**
 * Specifies a `path` for use with chaining.
 *
 * #### Example:
 *
 *     // instead of writing:
 *     await User.find({age: {$gte: 21, $lte: 65}});
 *
 *     // we can instead write:
 *     User.where('age').gte(21).lte(65);
 *
 *     // passing query conditions is permitted
 *     User.find().where({ name: 'vonderful' })
 *
 *     // chaining
 *     await User
 *       .where('age').gte(21).lte(65)
 *       .where('name', /^vonderful/i)
 *       .where('friends').slice(10)
 *       .exec()
 *
 * @param {String} [path]
 * @param {Object} [val]
 * @return {Query} this
 * @api public
 */ Query.prototype.where = function() {
    if (!arguments.length) return this;
    if (!this.op) this.op = 'find';
    const type = typeof arguments[0];
    if ('string' == type) {
        this._path = arguments[0];
        if (2 === arguments.length) {
            this._conditions[this._path] = arguments[1];
        }
        return this;
    }
    if ('object' == type && !Array.isArray(arguments[0])) {
        return this.merge(arguments[0]);
    }
    throw new TypeError('path must be a string or object');
};
/**
 * Specifies the complementary comparison value for paths specified with `where()`
 *
 * #### Example:
 *
 *     User.where('age').equals(49);
 *
 *     // is the same as
 *
 *     User.where('age', 49);
 *
 * @param {Object} val
 * @return {Query} this
 * @api public
 */ Query.prototype.equals = function equals(val) {
    this._ensurePath('equals');
    const path = this._path;
    this._conditions[path] = val;
    return this;
};
/**
 * Specifies the complementary comparison value for paths specified with `where()`
 * This is alias of `equals`
 *
 * #### Example:
 *
 *     User.where('age').eq(49);
 *
 *     // is the same as
 *
 *     User.shere('age').equals(49);
 *
 *     // is the same as
 *
 *     User.where('age', 49);
 *
 * @param {Object} val
 * @return {Query} this
 * @api public
 */ Query.prototype.eq = function eq(val) {
    this._ensurePath('eq');
    const path = this._path;
    this._conditions[path] = val;
    return this;
};
/**
 * Specifies arguments for an `$or` condition.
 *
 * #### Example:
 *
 *     query.or([{ color: 'red' }, { status: 'emergency' }])
 *
 * @param {Array} array array of conditions
 * @return {Query} this
 * @api public
 */ Query.prototype.or = function or(array) {
    const or = this._conditions.$or || (this._conditions.$or = []);
    if (!Array.isArray(array)) array = [
        array
    ];
    or.push.apply(or, array);
    return this;
};
/**
 * Specifies arguments for a `$nor` condition.
 *
 * #### Example:
 *
 *     query.nor([{ color: 'green' }, { status: 'ok' }])
 *
 * @param {Array} array array of conditions
 * @return {Query} this
 * @api public
 */ Query.prototype.nor = function nor(array) {
    const nor = this._conditions.$nor || (this._conditions.$nor = []);
    if (!Array.isArray(array)) array = [
        array
    ];
    nor.push.apply(nor, array);
    return this;
};
/**
 * Specifies arguments for a `$and` condition.
 *
 * #### Example:
 *
 *     query.and([{ color: 'green' }, { status: 'ok' }])
 *
 * @see $and http://docs.mongodb.org/manual/reference/operator/and/
 * @param {Array} array array of conditions
 * @return {Query} this
 * @api public
 */ Query.prototype.and = function and(array) {
    const and = this._conditions.$and || (this._conditions.$and = []);
    if (!Array.isArray(array)) array = [
        array
    ];
    and.push.apply(and, array);
    return this;
};
/**
 * Specifies a $gt query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * #### Example:
 *
 *     Thing.find().where('age').gt(21)
 *
 *     // or
 *     Thing.find().gt('age', 21)
 *
 * @method gt
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $gte query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method gte
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $lt query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method lt
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $lte query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method lte
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $ne query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method ne
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies an $in query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method in
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies an $nin query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method nin
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies an $all query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method all
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $size query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method size
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /**
 * Specifies a $regex query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method regex
 * @memberOf Query
 * @param {String} [path]
 * @param {String|RegExp} val
 * @api public
 */ /**
 * Specifies a $maxDistance query condition.
 *
 * When called with one argument, the most recent path passed to `where()` is used.
 *
 * @method maxDistance
 * @memberOf Query
 * @param {String} [path]
 * @param {Number} val
 * @api public
 */ /*!
 * gt, gte, lt, lte, ne, in, nin, all, regex, size, maxDistance
 *
 *     Thing.where('type').nin(array)
 */ 'gt gte lt lte ne in nin all regex size maxDistance minDistance'.split(' ').forEach(function($conditional) {
    Query.prototype[$conditional] = function() {
        let path, val;
        if (1 === arguments.length) {
            this._ensurePath($conditional);
            val = arguments[0];
            path = this._path;
        } else {
            val = arguments[1];
            path = arguments[0];
        }
        const conds = this._conditions[path] === null || typeof this._conditions[path] === 'object' ? this._conditions[path] : this._conditions[path] = {};
        conds['$' + $conditional] = val;
        return this;
    };
});
/**
 * Specifies a `$mod` condition
 *
 * @param {String} [path]
 * @param {Number} val
 * @return {Query} this
 * @api public
 */ Query.prototype.mod = function() {
    let val, path;
    if (1 === arguments.length) {
        this._ensurePath('mod');
        val = arguments[0];
        path = this._path;
    } else if (2 === arguments.length && !Array.isArray(arguments[1])) {
        this._ensurePath('mod');
        val = [
            arguments[0],
            arguments[1]
        ];
        path = this._path;
    } else if (3 === arguments.length) {
        val = [
            arguments[1],
            arguments[2]
        ];
        path = arguments[0];
    } else {
        val = arguments[1];
        path = arguments[0];
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds.$mod = val;
    return this;
};
/**
 * Specifies an `$exists` condition
 *
 * #### Example:
 *
 *     // { name: { $exists: true }}
 *     Thing.where('name').exists()
 *     Thing.where('name').exists(true)
 *     Thing.find().exists('name')
 *
 *     // { name: { $exists: false }}
 *     Thing.where('name').exists(false);
 *     Thing.find().exists('name', false);
 *
 * @param {String} [path]
 * @param {Number} val
 * @return {Query} this
 * @api public
 */ Query.prototype.exists = function() {
    let path, val;
    if (0 === arguments.length) {
        this._ensurePath('exists');
        path = this._path;
        val = true;
    } else if (1 === arguments.length) {
        if ('boolean' === typeof arguments[0]) {
            this._ensurePath('exists');
            path = this._path;
            val = arguments[0];
        } else {
            path = arguments[0];
            val = true;
        }
    } else if (2 === arguments.length) {
        path = arguments[0];
        val = arguments[1];
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds.$exists = val;
    return this;
};
/**
 * Specifies an `$elemMatch` condition
 *
 * #### Example:
 *
 *     query.elemMatch('comment', { author: 'autobot', votes: {$gte: 5}})
 *
 *     query.where('comment').elemMatch({ author: 'autobot', votes: {$gte: 5}})
 *
 *     query.elemMatch('comment', function (elem) {
 *       elem.where('author').equals('autobot');
 *       elem.where('votes').gte(5);
 *     })
 *
 *     query.where('comment').elemMatch(function (elem) {
 *       elem.where({ author: 'autobot' });
 *       elem.where('votes').gte(5);
 *     })
 *
 * @param {String|Object|Function} path
 * @param {Object|Function} criteria
 * @return {Query} this
 * @api public
 */ Query.prototype.elemMatch = function() {
    if (null == arguments[0]) throw new TypeError('Invalid argument');
    let fn, path, criteria;
    if ('function' === typeof arguments[0]) {
        this._ensurePath('elemMatch');
        path = this._path;
        fn = arguments[0];
    } else if (utils.isObject(arguments[0])) {
        this._ensurePath('elemMatch');
        path = this._path;
        criteria = arguments[0];
    } else if ('function' === typeof arguments[1]) {
        path = arguments[0];
        fn = arguments[1];
    } else if (arguments[1] && utils.isObject(arguments[1])) {
        path = arguments[0];
        criteria = arguments[1];
    } else {
        throw new TypeError('Invalid argument');
    }
    if (fn) {
        criteria = new Query;
        fn(criteria);
        criteria = criteria._conditions;
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds.$elemMatch = criteria;
    return this;
};
// Spatial queries
/**
 * Sugar for geo-spatial queries.
 *
 * #### Example:
 *
 *     query.within().box()
 *     query.within().circle()
 *     query.within().geometry()
 *
 *     query.where('loc').within({ center: [50,50], radius: 10, unique: true, spherical: true });
 *     query.where('loc').within({ box: [[40.73, -73.9], [40.7, -73.988]] });
 *     query.where('loc').within({ polygon: [[],[],[],[]] });
 *
 *     query.where('loc').within([], [], []) // polygon
 *     query.where('loc').within([], []) // box
 *     query.where('loc').within({ type: 'LineString', coordinates: [...] }); // geometry
 *
 * #### Note:
 *
 * Must be used after `where()`.
 *
 * @memberOf Query
 * @return {Query} this
 * @api public
 */ Query.prototype.within = function within() {
    // opinionated, must be used after where
    this._ensurePath('within');
    this._geoComparison = $withinCmd;
    if (0 === arguments.length) {
        return this;
    }
    if (2 === arguments.length) {
        return this.box.apply(this, arguments);
    } else if (2 < arguments.length) {
        return this.polygon.apply(this, arguments);
    }
    const area = arguments[0];
    if (!area) throw new TypeError('Invalid argument');
    if (area.center) return this.circle(area);
    if (area.box) return this.box.apply(this, area.box);
    if (area.polygon) return this.polygon.apply(this, area.polygon);
    if (area.type && area.coordinates) return this.geometry(area);
    throw new TypeError('Invalid argument');
};
/**
 * Specifies a $box condition
 *
 * #### Example:
 *
 *     var lowerLeft = [40.73083, -73.99756]
 *     var upperRight= [40.741404,  -73.988135]
 *
 *     query.where('loc').within().box(lowerLeft, upperRight)
 *     query.box('loc', lowerLeft, upperRight )
 *
 * @see http://www.mongodb.org/display/DOCS/Geospatial+Indexing
 * @see Query#within #query_Query-within
 * @param {String} path
 * @param {Object} val
 * @return {Query} this
 * @api public
 */ Query.prototype.box = function() {
    let path, box;
    if (3 === arguments.length) {
        // box('loc', [], [])
        path = arguments[0];
        box = [
            arguments[1],
            arguments[2]
        ];
    } else if (2 === arguments.length) {
        // box([], [])
        this._ensurePath('box');
        path = this._path;
        box = [
            arguments[0],
            arguments[1]
        ];
    } else {
        throw new TypeError('Invalid argument');
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds[this._geoComparison || $withinCmd] = {
        $box: box
    };
    return this;
};
/**
 * Specifies a $polygon condition
 *
 * #### Example:
 *
 *     query.where('loc').within().polygon([10,20], [13, 25], [7,15])
 *     query.polygon('loc', [10,20], [13, 25], [7,15])
 *
 * @param {String|Array} [path]
 * @param {Array|Object} [val]
 * @return {Query} this
 * @see http://www.mongodb.org/display/DOCS/Geospatial+Indexing
 * @api public
 */ Query.prototype.polygon = function() {
    let val, path;
    if ('string' == typeof arguments[0]) {
        // polygon('loc', [],[],[])
        val = Array.from(arguments);
        path = val.shift();
    } else {
        // polygon([],[],[])
        this._ensurePath('polygon');
        path = this._path;
        val = Array.from(arguments);
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds[this._geoComparison || $withinCmd] = {
        $polygon: val
    };
    return this;
};
/**
 * Specifies a $center or $centerSphere condition.
 *
 * #### Example:
 *
 *     var area = { center: [50, 50], radius: 10, unique: true }
 *     query.where('loc').within().circle(area)
 *     query.center('loc', area);
 *
 *     // for spherical calculations
 *     var area = { center: [50, 50], radius: 10, unique: true, spherical: true }
 *     query.where('loc').within().circle(area)
 *     query.center('loc', area);
 *
 * @param {String} [path]
 * @param {Object} area
 * @return {Query} this
 * @see http://www.mongodb.org/display/DOCS/Geospatial+Indexing
 * @api public
 */ Query.prototype.circle = function() {
    let path, val;
    if (1 === arguments.length) {
        this._ensurePath('circle');
        path = this._path;
        val = arguments[0];
    } else if (2 === arguments.length) {
        path = arguments[0];
        val = arguments[1];
    } else {
        throw new TypeError('Invalid argument');
    }
    if (!('radius' in val && val.center)) throw new Error('center and radius are required');
    const conds = this._conditions[path] || (this._conditions[path] = {});
    const type = val.spherical ? '$centerSphere' : '$center';
    const wKey = this._geoComparison || $withinCmd;
    conds[wKey] = {};
    conds[wKey][type] = [
        val.center,
        val.radius
    ];
    if ('unique' in val) conds[wKey].$uniqueDocs = !!val.unique;
    return this;
};
/**
 * Specifies a `$near` or `$nearSphere` condition
 *
 * These operators return documents sorted by distance.
 *
 * #### Example:
 *
 *     query.where('loc').near({ center: [10, 10] });
 *     query.where('loc').near({ center: [10, 10], maxDistance: 5 });
 *     query.where('loc').near({ center: [10, 10], maxDistance: 5, spherical: true });
 *     query.near('loc', { center: [10, 10], maxDistance: 5 });
 *     query.near({ center: { type: 'Point', coordinates: [..] }})
 *     query.near().geometry({ type: 'Point', coordinates: [..] })
 *
 * @param {String} [path]
 * @param {Object} val
 * @return {Query} this
 * @see http://www.mongodb.org/display/DOCS/Geospatial+Indexing
 * @api public
 */ Query.prototype.near = function near() {
    let path, val;
    this._geoComparison = '$near';
    if (0 === arguments.length) {
        return this;
    } else if (1 === arguments.length) {
        this._ensurePath('near');
        path = this._path;
        val = arguments[0];
    } else if (2 === arguments.length) {
        path = arguments[0];
        val = arguments[1];
    } else {
        throw new TypeError('Invalid argument');
    }
    if (!val.center) {
        throw new Error('center is required');
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    const type = val.spherical ? '$nearSphere' : '$near';
    // center could be a GeoJSON object or an Array
    if (Array.isArray(val.center)) {
        conds[type] = val.center;
        const radius = 'maxDistance' in val ? val.maxDistance : null;
        if (null != radius) {
            conds.$maxDistance = radius;
        }
        if (null != val.minDistance) {
            conds.$minDistance = val.minDistance;
        }
    } else {
        // GeoJSON?
        if (val.center.type != 'Point' || !Array.isArray(val.center.coordinates)) {
            throw new Error(util.format('Invalid GeoJSON specified for %s', type));
        }
        conds[type] = {
            $geometry: val.center
        };
        // MongoDB 2.6 insists on maxDistance being in $near / $nearSphere
        if ('maxDistance' in val) {
            conds[type]['$maxDistance'] = val.maxDistance;
        }
        if ('minDistance' in val) {
            conds[type]['$minDistance'] = val.minDistance;
        }
    }
    return this;
};
/**
 * Declares an intersects query for `geometry()`.
 *
 * #### Example:
 *
 *     query.where('path').intersects().geometry({
 *         type: 'LineString'
 *       , coordinates: [[180.0, 11.0], [180, 9.0]]
 *     })
 *
 *     query.where('path').intersects({
 *         type: 'LineString'
 *       , coordinates: [[180.0, 11.0], [180, 9.0]]
 *     })
 *
 * @param {Object} [arg]
 * @return {Query} this
 * @api public
 */ Query.prototype.intersects = function intersects() {
    // opinionated, must be used after where
    this._ensurePath('intersects');
    this._geoComparison = '$geoIntersects';
    if (0 === arguments.length) {
        return this;
    }
    const area = arguments[0];
    if (null != area && area.type && area.coordinates) return this.geometry(area);
    throw new TypeError('Invalid argument');
};
/**
 * Specifies a `$geometry` condition
 *
 * #### Example:
 *
 *     var polyA = [[[ 10, 20 ], [ 10, 40 ], [ 30, 40 ], [ 30, 20 ]]]
 *     query.where('loc').within().geometry({ type: 'Polygon', coordinates: polyA })
 *
 *     // or
 *     var polyB = [[ 0, 0 ], [ 1, 1 ]]
 *     query.where('loc').within().geometry({ type: 'LineString', coordinates: polyB })
 *
 *     // or
 *     var polyC = [ 0, 0 ]
 *     query.where('loc').within().geometry({ type: 'Point', coordinates: polyC })
 *
 *     // or
 *     query.where('loc').intersects().geometry({ type: 'Point', coordinates: polyC })
 *
 * #### Note:
 *
 * `geometry()` **must** come after either `intersects()` or `within()`.
 *
 * The `object` argument must contain `type` and `coordinates` properties.
 * - type {String}
 * - coordinates {Array}
 *
 * The most recent path passed to `where()` is used.
 *
 * @param {Object} object Must contain a `type` property which is a String and a `coordinates` property which is an Array. See the examples.
 * @return {Query} this
 * @see http://docs.mongodb.org/manual/release-notes/2.4/#new-geospatial-indexes-with-geojson-and-improved-spherical-geometry
 * @see http://www.mongodb.org/display/DOCS/Geospatial+Indexing
 * @see $geometry http://docs.mongodb.org/manual/reference/operator/geometry/
 * @api public
 */ Query.prototype.geometry = function geometry() {
    if (!('$within' == this._geoComparison || '$geoWithin' == this._geoComparison || '$near' == this._geoComparison || '$geoIntersects' == this._geoComparison)) {
        throw new Error('geometry() must come after `within()`, `intersects()`, or `near()');
    }
    let val, path;
    if (1 === arguments.length) {
        this._ensurePath('geometry');
        path = this._path;
        val = arguments[0];
    } else {
        throw new TypeError('Invalid argument');
    }
    if (!(val.type && Array.isArray(val.coordinates))) {
        throw new TypeError('Invalid argument');
    }
    const conds = this._conditions[path] || (this._conditions[path] = {});
    conds[this._geoComparison] = {
        $geometry: val
    };
    return this;
};
// end spatial
/**
 * Specifies which document fields to include or exclude
 *
 * #### String syntax
 *
 * When passing a string, prefixing a path with `-` will flag that path as excluded. When a path does not have the `-` prefix, it is included.
 *
 * #### Example:
 *
 *     // include a and b, exclude c
 *     query.select('a b -c');
 *
 *     // or you may use object notation, useful when
 *     // you have keys already prefixed with a "-"
 *     query.select({a: 1, b: 1, c: 0});
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @param {Object|String} arg
 * @return {Query} this
 * @see SchemaType
 * @api public
 */ Query.prototype.select = function select() {
    let arg = arguments[0];
    if (!arg) return this;
    if (arguments.length !== 1) {
        throw new Error('Invalid select: select only takes 1 argument');
    }
    this._validate('select');
    const fields = this._fields || (this._fields = {});
    const type = typeof arg;
    let i, len;
    if (('string' == type || utils.isArgumentsObject(arg)) && 'number' == typeof arg.length || Array.isArray(arg)) {
        if ('string' == type) arg = arg.split(/\s+/);
        for(i = 0, len = arg.length; i < len; ++i){
            let field = arg[i];
            if (!field) continue;
            const include = '-' == field[0] ? 0 : 1;
            if (include === 0) field = field.substring(1);
            fields[field] = include;
        }
        return this;
    }
    if (utils.isObject(arg)) {
        const keys = utils.keys(arg);
        for(i = 0; i < keys.length; ++i){
            fields[keys[i]] = arg[keys[i]];
        }
        return this;
    }
    throw new TypeError('Invalid select() argument. Must be string or object.');
};
/**
 * Specifies a $slice condition for a `path`
 *
 * #### Example:
 *
 *     query.slice('comments', 5)
 *     query.slice('comments', -5)
 *     query.slice('comments', [10, 5])
 *     query.where('comments').slice(5)
 *     query.where('comments').slice([-10, 5])
 *
 * @param {String} [path]
 * @param {Number} val number/range of elements to slice
 * @return {Query} this
 * @see mongodb http://www.mongodb.org/display/DOCS/Retrieving+a+Subset+of+Fields#RetrievingaSubsetofFields-RetrievingaSubrangeofArrayElements
 * @api public
 */ Query.prototype.slice = function() {
    if (0 === arguments.length) return this;
    this._validate('slice');
    let path, val;
    if (1 === arguments.length) {
        const arg = arguments[0];
        if (typeof arg === 'object' && !Array.isArray(arg)) {
            const keys = Object.keys(arg);
            const numKeys = keys.length;
            for(let i = 0; i < numKeys; ++i){
                this.slice(keys[i], arg[keys[i]]);
            }
            return this;
        }
        this._ensurePath('slice');
        path = this._path;
        val = arguments[0];
    } else if (2 === arguments.length) {
        if ('number' === typeof arguments[0]) {
            this._ensurePath('slice');
            path = this._path;
            val = [
                arguments[0],
                arguments[1]
            ];
        } else {
            path = arguments[0];
            val = arguments[1];
        }
    } else if (3 === arguments.length) {
        path = arguments[0];
        val = [
            arguments[1],
            arguments[2]
        ];
    }
    const myFields = this._fields || (this._fields = {});
    myFields[path] = {
        $slice: val
    };
    return this;
};
/**
 * Sets the sort order
 *
 * If an object is passed, values allowed are 'asc', 'desc', 'ascending', 'descending', 1, and -1.
 *
 * If a string is passed, it must be a space delimited list of path names. The sort order of each path is ascending unless the path name is prefixed with `-` which will be treated as descending.
 *
 * #### Example:
 *
 *     // these are equivalent
 *     query.sort({ field: 'asc', test: -1 });
 *     query.sort('field -test');
 *     query.sort([['field', 1], ['test', -1]]);
 *
 * #### Note:
 *
 *  - The array syntax `.sort([['field', 1], ['test', -1]])` can only be used with [mongodb driver >= 2.0.46](https://github.com/mongodb/node-mongodb-native/blob/2.1/HISTORY.md#2046-2015-10-15).
 *  - Cannot be used with `distinct()`
 *
 * @param {Object|String|Array} arg
 * @return {Query} this
 * @api public
 */ Query.prototype.sort = function(arg) {
    if (!arg) return this;
    let i, len, field;
    this._validate('sort');
    const type = typeof arg;
    // .sort([['field', 1], ['test', -1]])
    if (Array.isArray(arg)) {
        len = arg.length;
        for(i = 0; i < arg.length; ++i){
            if (!Array.isArray(arg[i])) {
                throw new Error('Invalid sort() argument, must be array of arrays');
            }
            _pushArr(this.options, arg[i][0], arg[i][1]);
        }
        return this;
    }
    // .sort('field -test')
    if (1 === arguments.length && 'string' == type) {
        arg = arg.split(/\s+/);
        len = arg.length;
        for(i = 0; i < len; ++i){
            field = arg[i];
            if (!field) continue;
            const ascend = '-' == field[0] ? -1 : 1;
            if (ascend === -1) field = field.substring(1);
            push(this.options, field, ascend);
        }
        return this;
    }
    // .sort({ field: 1, test: -1 })
    if (utils.isObject(arg)) {
        const keys = utils.keys(arg);
        for(i = 0; i < keys.length; ++i){
            field = keys[i];
            push(this.options, field, arg[field]);
        }
        return this;
    }
    if (typeof Map !== 'undefined' && arg instanceof Map) {
        _pushMap(this.options, arg);
        return this;
    }
    throw new TypeError('Invalid sort() argument. Must be a string, object, or array.');
};
/*!
 * @ignore
 */ const _validSortValue = {
    1: 1,
    '-1': -1,
    asc: 1,
    ascending: 1,
    desc: -1,
    descending: -1
};
function push(opts, field, value) {
    if (Array.isArray(opts.sort)) {
        throw new TypeError('Can\'t mix sort syntaxes. Use either array or object:' + '\n- `.sort([[\'field\', 1], [\'test\', -1]])`' + '\n- `.sort({ field: 1, test: -1 })`');
    }
    let s;
    if (value && value.$meta) {
        s = opts.sort || (opts.sort = {});
        s[field] = {
            $meta: value.$meta
        };
        return;
    }
    s = opts.sort || (opts.sort = {});
    let val = String(value || 1).toLowerCase();
    val = _validSortValue[val];
    if (!val) throw new TypeError('Invalid sort value: { ' + field + ': ' + value + ' }');
    s[field] = val;
}
function _pushArr(opts, field, value) {
    opts.sort = opts.sort || [];
    if (!Array.isArray(opts.sort)) {
        throw new TypeError('Can\'t mix sort syntaxes. Use either array or object:' + '\n- `.sort([[\'field\', 1], [\'test\', -1]])`' + '\n- `.sort({ field: 1, test: -1 })`');
    }
    let val = String(value || 1).toLowerCase();
    val = _validSortValue[val];
    if (!val) throw new TypeError('Invalid sort value: [ ' + field + ', ' + value + ' ]');
    opts.sort.push([
        field,
        val
    ]);
}
function _pushMap(opts, map) {
    opts.sort = opts.sort || new Map();
    if (!(opts.sort instanceof Map)) {
        throw new TypeError('Can\'t mix sort syntaxes. Use either array or ' + 'object or map consistently');
    }
    map.forEach(function(value, key) {
        let val = String(value || 1).toLowerCase();
        val = _validSortValue[val];
        if (!val) throw new TypeError('Invalid sort value: < ' + key + ': ' + value + ' >');
        opts.sort.set(key, val);
    });
}
/**
 * Specifies the limit option.
 *
 * #### Example:
 *
 *     query.limit(20)
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @method limit
 * @memberOf Query
 * @param {Number} val
 * @see mongodb http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7Blimit%28%29%7D%7D
 * @api public
 */ /**
 * Specifies the skip option.
 *
 * #### Example:
 *
 *     query.skip(100).limit(20)
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @method skip
 * @memberOf Query
 * @param {Number} val
 * @see mongodb http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7Bskip%28%29%7D%7D
 * @api public
 */ /**
 * Specifies the batchSize option.
 *
 * #### Example:
 *
 *     query.batchSize(100)
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @method batchSize
 * @memberOf Query
 * @param {Number} val
 * @see mongodb http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%7B%7BbatchSize%28%29%7D%7D
 * @api public
 */ /**
 * Specifies the `comment` option.
 *
 * #### Example:
 *
 *     query.comment('login query')
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @method comment
 * @memberOf Query
 * @param {Number} val
 * @see mongodb http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24comment
 * @api public
 */ /*!
 * limit, skip, batchSize, comment
 *
 * Sets these associated options.
 *
 *     query.comment('feed query');
 */ [
    'limit',
    'skip',
    'batchSize',
    'comment'
].forEach(function(method) {
    Query.prototype[method] = function(v) {
        this._validate(method);
        this.options[method] = v;
        return this;
    };
});
/**
 * Specifies the maxTimeMS option.
 *
 * #### Example:
 *
 *     query.maxTime(100)
 *     query.maxTimeMS(100)
 *
 * @method maxTime
 * @memberOf Query
 * @param {Number} ms
 * @see mongodb http://docs.mongodb.org/manual/reference/operator/meta/maxTimeMS/#op._S_maxTimeMS
 * @api public
 */ Query.prototype.maxTime = Query.prototype.maxTimeMS = function(ms) {
    this._validate('maxTime');
    this.options.maxTimeMS = ms;
    return this;
};
/**
 * Sets query hints.
 *
 * #### Example:
 *
 *     query.hint({ indexA: 1, indexB: -1});
 *     query.hint('indexA_1_indexB_1');
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @param {Object|string} val a hint object or the index name
 * @return {Query} this
 * @see mongodb http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24hint
 * @api public
 */ Query.prototype.hint = function() {
    if (0 === arguments.length) return this;
    this._validate('hint');
    const arg = arguments[0];
    if (utils.isObject(arg)) {
        const hint = this.options.hint || (this.options.hint = {});
        // must keep object keys in order so don't use Object.keys()
        for(const k in arg){
            hint[k] = arg[k];
        }
        return this;
    }
    if (typeof arg === 'string') {
        this.options.hint = arg;
        return this;
    }
    throw new TypeError('Invalid hint. ' + arg);
};
/**
 * Requests acknowledgement that this operation has been persisted to MongoDB's
 * on-disk journal.
 * This option is only valid for operations that write to the database:
 *
 * - `deleteOne()`
 * - `deleteMany()`
 * - `findOneAndDelete()`
 * - `findOneAndUpdate()`
 * - `updateOne()`
 * - `updateMany()`
 *
 * Defaults to the `j` value if it is specified in writeConcern options
 *
 * #### Example:
 *
 *     mquery().w(2).j(true).wtimeout(2000);
 *
 * @method j
 * @memberOf Query
 * @instance
 * @param {boolean} val
 * @see mongodb https://docs.mongodb.com/manual/reference/write-concern/#j-option
 * @return {Query} this
 * @api public
 */ Query.prototype.j = function j(val) {
    this.options.j = val;
    return this;
};
/**
 * Sets the slaveOk option. _Deprecated_ in MongoDB 2.2 in favor of read preferences.
 *
 * #### Example:
 *
 *     query.slaveOk() // true
 *     query.slaveOk(true)
 *     query.slaveOk(false)
 *
 * @deprecated use read() preferences instead if on mongodb >= 2.2
 * @param {Boolean} v defaults to true
 * @see mongodb http://docs.mongodb.org/manual/applications/replication/#read-preference
 * @see read()
 * @return {Query} this
 * @api public
 */ Query.prototype.slaveOk = function(v) {
    this.options.slaveOk = arguments.length ? !!v : true;
    return this;
};
/**
 * Sets the readPreference option for the query.
 *
 * #### Example:
 *
 *     new Query().read('primary')
 *     new Query().read('p')  // same as primary
 *
 *     new Query().read('primaryPreferred')
 *     new Query().read('pp') // same as primaryPreferred
 *
 *     new Query().read('secondary')
 *     new Query().read('s')  // same as secondary
 *
 *     new Query().read('secondaryPreferred')
 *     new Query().read('sp') // same as secondaryPreferred
 *
 *     new Query().read('nearest')
 *     new Query().read('n')  // same as nearest
 *
 *     // you can also use mongodb.ReadPreference class to also specify tags
 *     new Query().read(mongodb.ReadPreference('secondary', [{ dc:'sf', s: 1 },{ dc:'ma', s: 2 }]))
 *
 *     new Query().setReadPreference('primary') // alias of .read()
 *
 * #### Preferences:
 *
 *     primary - (default)  Read from primary only. Operations will produce an error if primary is unavailable. Cannot be combined with tags.
 *     secondary            Read from secondary if available, otherwise error.
 *     primaryPreferred     Read from primary if available, otherwise a secondary.
 *     secondaryPreferred   Read from a secondary if available, otherwise read from the primary.
 *     nearest              All operations read from among the nearest candidates, but unlike other modes, this option will include both the primary and all secondaries in the random selection.
 *
 * Aliases
 *
 *     p   primary
 *     pp  primaryPreferred
 *     s   secondary
 *     sp  secondaryPreferred
 *     n   nearest
 *
 * Read more about how to use read preferences [here](http://docs.mongodb.org/manual/applications/replication/#read-preference) and [here](http://mongodb.github.com/node-mongodb-native/driver-articles/anintroductionto1_1and2_2.html#read-preferences).
 *
 * @param {String|ReadPreference} pref one of the listed preference options or their aliases
 * @see mongodb http://docs.mongodb.org/manual/applications/replication/#read-preference
 * @see driver http://mongodb.github.com/node-mongodb-native/driver-articles/anintroductionto1_1and2_2.html#read-preferences
 * @return {Query} this
 * @api public
 */ Query.prototype.read = Query.prototype.setReadPreference = function(pref) {
    if (arguments.length > 1 && !Query.prototype.read.deprecationWarningIssued) {
        console.error('Deprecation warning: \'tags\' argument is not supported anymore in Query.read() method. Please use mongodb.ReadPreference object instead.');
        Query.prototype.read.deprecationWarningIssued = true;
    }
    this.options.readPreference = utils.readPref(pref);
    return this;
};
/**
 * Sets the readConcern option for the query.
 *
 * #### Example:
 *
 *     new Query().readConcern('local')
 *     new Query().readConcern('l')  // same as local
 *
 *     new Query().readConcern('available')
 *     new Query().readConcern('a')  // same as available
 *
 *     new Query().readConcern('majority')
 *     new Query().readConcern('m')  // same as majority
 *
 *     new Query().readConcern('linearizable')
 *     new Query().readConcern('lz') // same as linearizable
 *
 *     new Query().readConcern('snapshot')
 *     new Query().readConcern('s')  // same as snapshot
 *
 *     new Query().r('s') // r is alias of readConcern
 *
 *
 * #### Read Concern Level:
 *
 *     local         MongoDB 3.2+ The query returns from the instance with no guarantee guarantee that the data has been written to a majority of the replica set members (i.e. may be rolled back).
 *     available     MongoDB 3.6+ The query returns from the instance with no guarantee guarantee that the data has been written to a majority of the replica set members (i.e. may be rolled back).
 *     majority      MongoDB 3.2+ The query returns the data that has been acknowledged by a majority of the replica set members. The documents returned by the read operation are durable, even in the event of failure.
 *     linearizable  MongoDB 3.4+ The query returns data that reflects all successful majority-acknowledged writes that completed prior to the start of the read operation. The query may wait for concurrently executing writes to propagate to a majority of replica set members before returning results.
 *     snapshot      MongoDB 4.0+ Only available for operations within multi-document transactions. Upon transaction commit with write concern "majority", the transaction operations are guaranteed to have read from a snapshot of majority-committed data.
 *
 * Aliases
 *
 *     l   local
 *     a   available
 *     m   majority
 *     lz  linearizable
 *     s   snapshot
 *
 * Read more about how to use read concern [here](https://docs.mongodb.com/manual/reference/read-concern/).
 *
 * @param {String} level one of the listed read concern level or their aliases
 * @see mongodb https://docs.mongodb.com/manual/reference/read-concern/
 * @return {Query} this
 * @api public
 */ Query.prototype.readConcern = Query.prototype.r = function(level) {
    this.options.readConcern = utils.readConcern(level);
    return this;
};
/**
 * Sets tailable option.
 *
 * #### Example:
 *
 *     query.tailable() <== true
 *     query.tailable(true)
 *     query.tailable(false)
 *
 * #### Note:
 *
 * Cannot be used with `distinct()`
 *
 * @param {Boolean} v defaults to true
 * @see mongodb http://www.mongodb.org/display/DOCS/Tailable+Cursors
 * @api public
 */ Query.prototype.tailable = function() {
    this._validate('tailable');
    this.options.tailable = arguments.length ? !!arguments[0] : true;
    return this;
};
/**
 * Sets the specified number of `mongod` servers, or tag set of `mongod` servers,
 * that must acknowledge this write before this write is considered successful.
 * This option is only valid for operations that write to the database:
 *
 * - `deleteOne()`
 * - `deleteMany()`
 * - `findOneAndDelete()`
 * - `findOneAndUpdate()`
 * - `updateOne()`
 * - `updateMany()`
 *
 * Defaults to the `w` value if it is specified in writeConcern options
 *
 * #### Example:
 *
 *     mquery().writeConcern(0)
 *     mquery().writeConcern(1)
 *     mquery().writeConcern({ w: 1, j: true, wtimeout: 2000 })
 *     mquery().writeConcern('majority')
 *     mquery().writeConcern('m') // same as majority
 *     mquery().writeConcern('tagSetName') // if the tag set is 'm', use .writeConcern({ w: 'm' }) instead
 *     mquery().w(1) // w is alias of writeConcern
 *
 * @method writeConcern
 * @memberOf Query
 * @instance
 * @param {String|number|object} concern 0 for fire-and-forget, 1 for acknowledged by one server, 'majority' for majority of the replica set, or [any of the more advanced options](https://docs.mongodb.com/manual/reference/write-concern/#w-option).
 * @see mongodb https://docs.mongodb.com/manual/reference/write-concern/#w-option
 * @return {Query} this
 * @api public
 */ Query.prototype.writeConcern = Query.prototype.w = function writeConcern(concern) {
    if ('object' === typeof concern) {
        if ('undefined' !== typeof concern.j) this.options.j = concern.j;
        if ('undefined' !== typeof concern.w) this.options.w = concern.w;
        if ('undefined' !== typeof concern.wtimeout) this.options.wtimeout = concern.wtimeout;
    } else {
        this.options.w = 'm' === concern ? 'majority' : concern;
    }
    return this;
};
/**
 * Specifies a time limit, in milliseconds, for the write concern.
 * If `ms > 1`, it is maximum amount of time to wait for this write
 * to propagate through the replica set before this operation fails.
 * The default is `0`, which means no timeout.
 *
 * This option is only valid for operations that write to the database:
 *
 * - `deleteOne()`
 * - `deleteMany()`
 * - `findOneAndDelete()`
 * - `findOneAndUpdate()`
 * - `updateOne()`
 * - `updateMany()`
 *
 * Defaults to `wtimeout` value if it is specified in writeConcern
 *
 * #### Example:
 *
 *     mquery().w(2).j(true).wtimeout(2000)
 *
 * @method wtimeout
 * @memberOf Query
 * @instance
 * @param {number} ms number of milliseconds to wait
 * @see mongodb https://docs.mongodb.com/manual/reference/write-concern/#wtimeout
 * @return {Query} this
 * @api public
 */ Query.prototype.wtimeout = Query.prototype.wTimeout = function wtimeout(ms) {
    this.options.wtimeout = ms;
    return this;
};
/**
 * Merges another Query or conditions object into this one.
 *
 * When a Query is passed, conditions, field selection and options are merged.
 *
 * @param {Query|Object} source
 * @return {Query} this
 */ Query.prototype.merge = function(source) {
    if (!source) return this;
    if (!Query.canMerge(source)) throw new TypeError('Invalid argument. Expected instanceof mquery or plain object');
    if (source instanceof Query) {
        // if source has a feature, apply it to ourselves
        if (source._conditions) {
            utils.merge(this._conditions, source._conditions);
        }
        if (source._fields) {
            this._fields || (this._fields = {});
            utils.merge(this._fields, source._fields);
        }
        if (source.options) {
            this.options || (this.options = {});
            utils.merge(this.options, source.options);
        }
        if (source._updateDoc) {
            this._updateDoc || (this._updateDoc = {});
            utils.mergeClone(this._updateDoc, source._updateDoc);
        }
        if (source._distinctDoc) {
            this._distinctDoc = source._distinctDoc;
        }
        return this;
    }
    // plain object
    utils.merge(this._conditions, source);
    return this;
};
/**
 * Finds documents.
 *
 * #### Example:
 *
 *     query.find()
 *     await query.find()
 *     await query.find({ name: 'Burning Lights' })
 *
 * @param {Object} [criteria] mongodb selector
 * @return {Query} this
 * @api public
 */ Query.prototype.find = function(criteria) {
    this.op = 'find';
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `find` Query
 * @returns the result
 */ Query.prototype._find = async function _find() {
    const conds = this._conditions;
    const options = this._optionsForExec();
    if (this.$useProjection) {
        options.projection = this._fieldsForExec();
    } else {
        options.fields = this._fieldsForExec();
    }
    debug('_find', this._collection.collectionName, conds, options);
    return this._collection.find(conds, options);
};
/**
 * Returns the query cursor
 *
 * #### Examples:
 *
 *     query.find().cursor();
 *     query.cursor({ name: 'Burning Lights' });
 *
 * @param {Object} [criteria] mongodb selector
 * @return {Object} cursor
 * @api public
 */ Query.prototype.cursor = function cursor(criteria) {
    if (this.op) {
        if (this.op !== 'find') {
            throw new TypeError('.cursor only support .find method');
        }
    } else {
        this.find(criteria);
    }
    const conds = this._conditions;
    const options = this._optionsForExec();
    if (this.$useProjection) {
        options.projection = this._fieldsForExec();
    } else {
        options.fields = this._fieldsForExec();
    }
    debug('findCursor', this._collection.collectionName, conds, options);
    return this._collection.findCursor(conds, options);
};
/**
 * Executes the query as a findOne() operation.
 *
 * #### Example:
 *
 *     query.findOne().where('name', /^Burning/);
 *
 *     query.findOne({ name: /^Burning/ })
 *
 *     await query.findOne({ name: /^Burning/ }); // executes
 *
 * @param {Object|Query} [criteria] mongodb selector
 * @return {Query} this
 * @api public
 */ Query.prototype.findOne = function(criteria) {
    this.op = 'findOne';
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `findOne` Query
 * @returns the results
 */ Query.prototype._findOne = async function _findOne() {
    const conds = this._conditions;
    const options = this._optionsForExec();
    if (this.$useProjection) {
        options.projection = this._fieldsForExec();
    } else {
        options.fields = this._fieldsForExec();
    }
    debug('findOne', this._collection.collectionName, conds, options);
    return this._collection.findOne(conds, options);
};
/**
 * Exectues the query as a count() operation.
 *
 * #### Example:
 *
 *     query.count().where('color', 'black').exec();
 *
 *     query.count({ color: 'black' })
 *
 *     await query.count({ color: 'black' });
 *
 *     const doc = await query.where('color', 'black').count();
 *     console.log('there are %d kittens', count);
 *
 * @param {Object} [criteria] mongodb selector
 * @return {Query} this
 * @see mongodb http://www.mongodb.org/display/DOCS/Aggregation#Aggregation-Count
 * @api public
 */ Query.prototype.count = function(criteria) {
    this.op = 'count';
    this._validate();
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `count` Query
 * @returns the results
 */ Query.prototype._count = async function _count() {
    const conds = this._conditions, options = this._optionsForExec();
    debug('count', this._collection.collectionName, conds, options);
    return this._collection.count(conds, options);
};
/**
 * Declares or executes a distinct() operation.
 *
 * #### Example:
 *
 *     await distinct(criteria, field)
 *     distinct(criteria, field)
 *     await distinct(field)
 *     distinct(field)
 *     await distinct()
 *     distinct()
 *
 * @param {Object|Query} [criteria]
 * @param {String} [field]
 * @return {Query} this
 * @see mongodb http://www.mongodb.org/display/DOCS/Aggregation#Aggregation-Distinct
 * @api public
 */ Query.prototype.distinct = function(criteria, field) {
    this.op = 'distinct';
    this._validate();
    if (!field && typeof criteria === 'string') {
        field = criteria;
        criteria = undefined;
    }
    if ('string' == typeof field) {
        this._distinctDoc = field;
    }
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `distinct` Query
 * @returns the results
 */ Query.prototype._distinct = async function _distinct() {
    if (!this._distinctDoc) {
        throw new Error('No value for `distinct` has been declared');
    }
    const conds = this._conditions, options = this._optionsForExec();
    debug('distinct', this._collection.collectionName, conds, options);
    return this._collection.distinct(this._distinctDoc, conds, options);
};
/**
 * Declare and/or execute this query as an `updateMany()` operation. This function will update _all_ documents that match
 * `criteria`, rather than just the first one.
 *
 * _All paths passed that are not $atomic operations will become $set ops._
 *
 * #### Example:
 *
 *     // Update every document whose `title` contains 'test'
 *     mquery().updateMany({ title: /test/ }, { year: 2017 })
 *
 * @param {Object} [criteria]
 * @param {Object} [doc] the update command
 * @param {Object} [options]
 * @return {Query} this
 * @api public
 */ Query.prototype.updateMany = function updateMany(criteria, doc, options) {
    if (arguments.length === 1) {
        doc = criteria;
        criteria = options = undefined;
    }
    return _update(this, 'updateMany', criteria, doc, options);
};
/**
 * Executes a `updateMany` Query
 * @returns the results
 */ Query.prototype._updateMany = async function() {
    return _updateExec(this, 'updateMany');
};
/**
 * Declare and/or execute this query as an `updateOne()` operation. This function will _always_ update just one document,
 * regardless of the `multi` option.
 *
 * _All paths passed that are not $atomic operations will become $set ops._
 *
 * #### Example:
 *
 *     // Update the first document whose `title` contains 'test'
 *     mquery().updateMany({ title: /test/ }, { year: 2017 })
 *
 * @param {Object} [criteria]
 * @param {Object} [doc] the update command
 * @param {Object} [options]
 * @return {Query} this
 * @api public
 */ Query.prototype.updateOne = function updateOne(criteria, doc, options) {
    if (arguments.length === 1) {
        doc = criteria;
        criteria = options = undefined;
    }
    return _update(this, 'updateOne', criteria, doc, options);
};
/**
 * Executes a `updateOne` Query
 * @returns the results
 */ Query.prototype._updateOne = async function() {
    return _updateExec(this, 'updateOne');
};
/**
 * Declare and/or execute this query as an `replaceOne()` operation. Similar
 * to `updateOne()`, except `replaceOne()` is not allowed to use atomic
 * modifiers (`$set`, `$push`, etc.). Calling `replaceOne()` will always
 * replace the existing doc.
 *
 * #### Example:
 *
 *     // Replace the document with `_id` 1 with `{ _id: 1, year: 2017 }`
 *     mquery().replaceOne({ _id: 1 }, { year: 2017 })
 *
 * @param {Object} [criteria]
 * @param {Object} [doc] the update command
 * @param {Object} [options]
 * @return {Query} this
 * @api public
 */ Query.prototype.replaceOne = function replaceOne(criteria, doc, options) {
    if (arguments.length === 1) {
        doc = criteria;
        criteria = options = undefined;
    }
    this.setOptions({
        overwrite: true
    });
    return _update(this, 'replaceOne', criteria, doc, options);
};
/**
 * Executes a `replaceOne` Query
 * @returns the results
 */ Query.prototype._replaceOne = async function() {
    return _updateExec(this, 'replaceOne');
};
/*!
 * Internal helper for updateMany, updateOne
 */ function _update(query, op, criteria, doc, options) {
    query.op = op;
    if (Query.canMerge(criteria)) {
        query.merge(criteria);
    }
    if (doc) {
        query._mergeUpdate(doc);
    }
    if (utils.isObject(options)) {
        // { overwrite: true }
        query.setOptions(options);
    }
    return query;
}
/**
 * Helper for de-duplicating "update*" functions
 * @param {Query} query The Query Object (replacement for "this")
 * @param {String} op The Operation to be done
 * @returns the results
 */ async function _updateExec(query, op) {
    const options = query._optionsForExec();
    const criteria = query._conditions;
    const doc = query._updateForExec();
    debug('update', query._collection.collectionName, criteria, doc, options);
    return query._collection[op](criteria, doc, options);
}
/**
 * Declare and/or execute this query as a `deleteOne()` operation.
 *
 * #### Example:
 *
 *     await mquery(collection).deleteOne({ artist: 'Anne Murray' })
 *
 * @param {Object|Query} [criteria] mongodb selector
 * @return {Query} this
 * @api public
 */ Query.prototype.deleteOne = function(criteria) {
    this.op = 'deleteOne';
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `deleteOne` Query
 * @returns the results
 */ Query.prototype._deleteOne = async function() {
    const options = this._optionsForExec();
    delete options.justOne;
    const conds = this._conditions;
    debug('deleteOne', this._collection.collectionName, conds, options);
    return this._collection.deleteOne(conds, options);
};
/**
 * Declare and/or execute this query as a `deleteMany()` operation. Always deletes
 * _every_ document that matches `criteria`.
 *
 * #### Example:
 *
 *     await mquery(collection).deleteMany({ artist: 'Anne Murray' })
 *
 * @param {Object|Query} [criteria] mongodb selector
 * @return {Query} this
 * @api public
 */ Query.prototype.deleteMany = function(criteria) {
    this.op = 'deleteMany';
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    return this;
};
/**
 * Executes a `deleteMany` Query
 * @returns the results
 */ Query.prototype._deleteMany = async function() {
    const options = this._optionsForExec();
    delete options.justOne;
    const conds = this._conditions;
    debug('deleteOne', this._collection.collectionName, conds, options);
    return this._collection.deleteMany(conds, options);
};
/**
 * Issues a mongodb [findAndModify](http://www.mongodb.org/display/DOCS/findAndModify+Command) update command.
 *
 * Finds a matching document, updates it according to the `update` arg, passing any `options`, and returns the found document (if any).
 *
 * #### Available options
 *
 * - `new`: bool - true to return the modified document rather than the original. defaults to true
 * - `upsert`: bool - creates the object if it doesn't exist. defaults to false.
 * - `sort`: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
 *
 * #### Examples:
 *
 *     await query.findOneAndUpdate(conditions, update, options) // executes
 *     query.findOneAndUpdate(conditions, update, options)  // returns Query
 *     await query.findOneAndUpdate(conditions, update) // executes
 *     query.findOneAndUpdate(conditions, update)           // returns Query
 *     await query.findOneAndUpdate(update)             // returns Query
 *     query.findOneAndUpdate(update)                       // returns Query
 *     await query.findOneAndUpdate()                     // executes
 *     query.findOneAndUpdate()                             // returns Query
 *
 * @param {Object|Query} [query]
 * @param {Object} [doc]
 * @param {Object} [options]
 * @see mongodb http://www.mongodb.org/display/DOCS/findAndModify+Command
 * @return {Query} this
 * @api public
 */ Query.prototype.findOneAndUpdate = function(criteria, doc, options) {
    this.op = 'findOneAndUpdate';
    this._validate();
    if (arguments.length === 1) {
        doc = criteria;
        criteria = options = undefined;
    }
    if (Query.canMerge(criteria)) {
        this.merge(criteria);
    }
    // apply doc
    if (doc) {
        this._mergeUpdate(doc);
    }
    options && this.setOptions(options);
    return this;
};
/**
 * Executes a `findOneAndUpdate` Query
 * @returns the results
 */ Query.prototype._findOneAndUpdate = async function() {
    const conds = this._conditions;
    const update = this._updateForExec();
    const options = this._optionsForExec();
    return this._collection.findOneAndUpdate(conds, update, options);
};
/**
 * Issues a mongodb [findAndModify](http://www.mongodb.org/display/DOCS/findAndModify+Command) remove command.
 *
 * Finds a matching document, removes it, returning the found document (if any).
 *
 * #### Available options
 *
 * - `sort`: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
 *
 * #### Examples:
 *
 *     await A.where().findOneAndRemove(conditions, options) // executes
 *     A.where().findOneAndRemove(conditions, options)  // return Query
 *     await A.where().findOneAndRemove(conditions) // executes
 *     A.where().findOneAndRemove(conditions) // returns Query
 *     await A.where().findOneAndRemove()   // executes
 *     A.where().findOneAndRemove()           // returns Query
 *     A.where().findOneAndDelete()           // alias of .findOneAndRemove()
 *
 * @param {Object} [conditions]
 * @param {Object} [options]
 * @return {Query} this
 * @see mongodb http://www.mongodb.org/display/DOCS/findAndModify+Command
 * @api public
 */ Query.prototype.findOneAndRemove = Query.prototype.findOneAndDelete = function(conditions, options) {
    this.op = 'findOneAndRemove';
    this._validate();
    // apply conditions
    if (Query.canMerge(conditions)) {
        this.merge(conditions);
    }
    // apply options
    options && this.setOptions(options);
    return this;
};
/**
 * Executes a `findOneAndRemove` Query
 * @returns the results
 */ Query.prototype._findOneAndRemove = async function() {
    const options = this._optionsForExec();
    const conds = this._conditions;
    return this._collection.findOneAndDelete(conds, options);
};
/**
 * Add trace function that gets called when the query is executed.
 * The function will be called with (method, queryInfo, query) and
 * should return a callback function which will be called
 * with (err, result, millis) when the query is complete.
 *
 * queryInfo is an object containing: {
 *   collectionName: <name of the collection>,
 *   conditions: <query criteria>,
 *   options: <comment, fields, readPreference, etc>,
 *   doc: [document to update, if applicable]
 * }
 *
 * NOTE: Does not trace stream queries.
 *
 * @param {Function} traceFunction
 * @return {Query} this
 * @api public
 */ Query.prototype.setTraceFunction = function(traceFunction) {
    this._traceFunction = traceFunction;
    return this;
};
/**
 * Executes the query
 *
 * #### Examples:
 *
 *     query.exec();
 *     await query.exec();
 *     query.exec('update');
 *     await query.exec('find');
 *
 * @param {String|Function} [operation]
 * @api public
 */ Query.prototype.exec = async function exec(op) {
    if (typeof op === 'string') {
        this.op = op;
    }
    assert.ok(this.op, 'Missing query type: (find, etc)');
    const fnName = '_' + this.op;
    // better error, because default would list it as "this[fnName] is not a function"
    if (typeof this[fnName] !== 'function') {
        throw new TypeError(`this[${fnName}] is not a function`);
    }
    return this[fnName]();
};
/**
 * Executes the query returning a `Promise` which will be
 * resolved with either the doc(s) or rejected with the error.
 *
 * @param {Function} [resolve]
 * @param {Function} [reject]
 * @return {Promise}
 * @api public
 */ Query.prototype.then = async function(res, rej) {
    return this.exec().then(res, rej);
};
/**
 * Returns a cursor for the given `find` query.
 *
 * @throws Error if operation is not a find
 * @returns {Cursor} MongoDB driver cursor
 */ Query.prototype.cursor = function() {
    if ('find' != this.op) throw new Error('cursor() is only available for find');
    const conds = this._conditions;
    const options = this._optionsForExec();
    if (this.$useProjection) {
        options.projection = this._fieldsForExec();
    } else {
        options.fields = this._fieldsForExec();
    }
    debug('cursor', this._collection.collectionName, conds, options);
    return this._collection.findCursor(conds, options);
};
/**
 * Determines if field selection has been made.
 *
 * @return {Boolean}
 * @api public
 */ Query.prototype.selected = function selected() {
    return !!(this._fields && Object.keys(this._fields).length > 0);
};
/**
 * Determines if inclusive field selection has been made.
 *
 *     query.selectedInclusively() // false
 *     query.select('name')
 *     query.selectedInclusively() // true
 *     query.selectedExlusively() // false
 *
 * @returns {Boolean}
 */ Query.prototype.selectedInclusively = function selectedInclusively() {
    if (!this._fields) return false;
    const keys = Object.keys(this._fields);
    if (0 === keys.length) return false;
    for(let i = 0; i < keys.length; ++i){
        const key = keys[i];
        if (0 === this._fields[key]) return false;
        if (this._fields[key] && typeof this._fields[key] === 'object' && this._fields[key].$meta) {
            return false;
        }
    }
    return true;
};
/**
 * Determines if exclusive field selection has been made.
 *
 *     query.selectedExlusively() // false
 *     query.select('-name')
 *     query.selectedExlusively() // true
 *     query.selectedInclusively() // false
 *
 * @returns {Boolean}
 */ Query.prototype.selectedExclusively = function selectedExclusively() {
    if (!this._fields) return false;
    const keys = Object.keys(this._fields);
    if (0 === keys.length) return false;
    for(let i = 0; i < keys.length; ++i){
        const key = keys[i];
        if (0 === this._fields[key]) return true;
    }
    return false;
};
/**
 * Merges `doc` with the current update object.
 *
 * @param {Object} doc
 */ Query.prototype._mergeUpdate = function(doc) {
    if (!this._updateDoc) this._updateDoc = {};
    if (doc instanceof Query) {
        if (doc._updateDoc) {
            utils.mergeClone(this._updateDoc, doc._updateDoc);
        }
    } else {
        utils.mergeClone(this._updateDoc, doc);
    }
};
/**
 * Returns default options.
 *
 * @return {Object}
 * @api private
 */ Query.prototype._optionsForExec = function() {
    const options = utils.clone(this.options);
    return options;
};
/**
 * Returns fields selection for this query.
 *
 * @return {Object}
 * @api private
 */ Query.prototype._fieldsForExec = function() {
    return utils.clone(this._fields);
};
/**
 * Return an update document with corrected $set operations.
 *
 * @api private
 */ Query.prototype._updateForExec = function() {
    const update = utils.clone(this._updateDoc);
    const ops = utils.keys(update);
    const ret = {};
    for (const op of ops){
        if (this.options.overwrite) {
            ret[op] = update[op];
            continue;
        }
        if ('$' !== op[0]) {
            // fix up $set sugar
            if (!ret.$set) {
                if (update.$set) {
                    ret.$set = update.$set;
                } else {
                    ret.$set = {};
                }
            }
            ret.$set[op] = update[op];
            if (!~ops.indexOf('$set')) ops.push('$set');
        } else if ('$set' === op) {
            if (!ret.$set) {
                ret[op] = update[op];
            }
        } else {
            ret[op] = update[op];
        }
    }
    this._compiledUpdate = ret;
    return ret;
};
/**
 * Make sure _path is set.
 *
 * @parmam {String} method
 */ Query.prototype._ensurePath = function(method) {
    if (!this._path) {
        const msg = method + '() must be used after where() ' + 'when called with these arguments';
        throw new Error(msg);
    }
};
/*!
 * Permissions
 */ Query.permissions = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/permissions.js [app-route] (ecmascript)");
Query._isPermitted = function(a, b) {
    const denied = Query.permissions[b];
    if (!denied) return true;
    return true !== denied[a];
};
Query.prototype._validate = function(action) {
    let fail;
    let validator;
    if (undefined === action) {
        validator = Query.permissions[this.op];
        if ('function' != typeof validator) return true;
        fail = validator(this);
    } else if (!Query._isPermitted(action, this.op)) {
        fail = action;
    }
    if (fail) {
        throw new Error(fail + ' cannot be used with ' + this.op);
    }
};
/**
 * Determines if `conds` can be merged using `mquery().merge()`
 *
 * @param {Object} conds
 * @return {Boolean}
 */ Query.canMerge = function(conds) {
    return conds instanceof Query || utils.isObject(conds);
};
/**
 * Set a trace function that will get called whenever a
 * query is executed.
 *
 * See `setTraceFunction()` for details.
 *
 * @param {Object} conds
 * @return {Boolean}
 */ Query.setGlobalTraceFunction = function(traceFunction) {
    Query.traceFunction = traceFunction;
};
/*!
 * Exports.
 */ Query.utils = utils;
Query.env = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/env.js [app-route] (ecmascript)");
Query.Collection = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/index.js [app-route] (ecmascript)");
Query.BaseCollection = __turbopack_context__.r("[project]/backend/node_modules/mquery/lib/collection/collection.js [app-route] (ecmascript)");
module.exports = exports = Query; // TODO
 // test utils
}),
"[project]/backend/node_modules/debug/src/common.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */ function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = __turbopack_context__.r("[project]/backend/node_modules/ms/index.js [app-route] (ecmascript)");
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    /**
	* The currently active debug mode names, and names to skip.
	*/ createDebug.names = [];
    createDebug.skips = [];
    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/ createDebug.formatters = {};
    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/ function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/ function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
                return;
            }
            const self = debug;
            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
                // Anything else let's inspect with %O
                args.unshift('%O');
            }
            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format)=>{
                // If we encounter an escaped % then don't increase the array index
                if (match === '%%') {
                    return '%';
                }
                index++;
                const formatter = createDebug.formatters[format];
                if (typeof formatter === 'function') {
                    const val = args[index];
                    match = formatter.call(self, val);
                    // Now we need to remove `args[index]` since it's inlined in the `format`
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
        Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: ()=>{
                if (enableOverride !== null) {
                    return enableOverride;
                }
                if (namespacesCache !== createDebug.namespaces) {
                    namespacesCache = createDebug.namespaces;
                    enabledCache = createDebug.enabled(namespace);
                }
                return enabledCache;
            },
            set: (v)=>{
                enableOverride = v;
            }
        });
        // Env-specific initialization logic for debug instances
        if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/ function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(/\s+/g, ',').split(',').filter(Boolean);
        for (const ns of split){
            if (ns[0] === '-') {
                createDebug.skips.push(ns.slice(1));
            } else {
                createDebug.names.push(ns);
            }
        }
    }
    /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */ function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while(searchIndex < search.length){
            if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
                // Match character or proceed with wildcard
                if (template[templateIndex] === '*') {
                    starIndex = templateIndex;
                    matchIndex = searchIndex;
                    templateIndex++; // Skip the '*'
                } else {
                    searchIndex++;
                    templateIndex++;
                }
            } else if (starIndex !== -1) {
                // Backtrack to the last '*' and try to match more characters
                templateIndex = starIndex + 1;
                matchIndex++;
                searchIndex = matchIndex;
            } else {
                return false; // No match
            }
        }
        // Handle trailing '*' in template
        while(templateIndex < template.length && template[templateIndex] === '*'){
            templateIndex++;
        }
        return templateIndex === template.length;
    }
    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/ function disable() {
        const namespaces = [
            ...createDebug.names,
            ...createDebug.skips.map((namespace)=>'-' + namespace)
        ].join(',');
        createDebug.enable('');
        return namespaces;
    }
    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/ function enabled(name) {
        for (const skip of createDebug.skips){
            if (matchesTemplate(name, skip)) {
                return false;
            }
        }
        for (const ns of createDebug.names){
            if (matchesTemplate(name, ns)) {
                return true;
            }
        }
        return false;
    }
    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/ function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/ function destroy() {
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
module.exports = setup;
}),
"[project]/backend/node_modules/debug/src/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Module dependencies.
 */ const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * This is the Node.js implementation of `debug()`.
 */ exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(()=>{}, 'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
/**
 * Colors.
 */ exports.colors = [
    6,
    2,
    3,
    4,
    5,
    1
];
try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const supportsColor = __turbopack_context__.r("[project]/backend/node_modules/supports-color/index.js [app-route] (ecmascript)");
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
        ];
    }
} catch (error) {
// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}
/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */ exports.inspectOpts = Object.keys(process.env).filter((key)=>{
    return /^debug_/i.test(key);
}).reduce((obj, key)=>{
    // Camel-case
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k)=>{
        return k.toUpperCase();
    });
    // Coerce string value into JS value
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
    } else if (val === 'null') {
        val = null;
    } else {
        val = Number(val);
    }
    obj[prop] = val;
    return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */ function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
    } else {
        args[0] = getDate() + name + ' ' + args[0];
    }
}
function getDate() {
    if (exports.inspectOpts.hideDate) {
        return '';
    }
    return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */ function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    if (namespaces) {
        process.env.DEBUG = namespaces;
    } else {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */ function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for(let i = 0; i < keys.length; i++){
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
}
module.exports = __turbopack_context__.r("[project]/backend/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */ formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split('\n').map((str)=>str.trim()).join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */ formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
};
}),
"[project]/backend/node_modules/debug/src/browser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* eslint-env browser */ /**
 * This is the web browser implementation of `debug()`.
 */ exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (()=>{
    let warned = false;
    return ()=>{
        if (!warned) {
            warned = true;
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
    };
})();
/**
 * Colors.
 */ exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */ // eslint-disable-next-line complexity
function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
    }
    let m;
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
    if (!this.useColors) {
        return;
    }
    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');
    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match)=>{
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
        }
    });
    args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */ exports.log = console.debug || console.log || (()=>{});
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    try {
        if (namespaces) {
            exports.storage.setItem('debug', namespaces);
        } else {
            exports.storage.removeItem('debug');
        }
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    let r;
    try {
        r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG');
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
    }
    return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */ function localstorage() {
    try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage;
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
module.exports = __turbopack_context__.r("[project]/backend/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */ formatters.j = function(v) {
    try {
        return JSON.stringify(v);
    } catch (error) {
        return '[UnexpectedJSONParseError]: ' + error.message;
    }
};
}),
"[project]/backend/node_modules/debug/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */ if (typeof process === 'undefined' || process.type === 'renderer' || ("TURBOPACK compile-time value", false) === true || process.__nwjs) {
    module.exports = __turbopack_context__.r("[project]/backend/node_modules/debug/src/browser.js [app-route] (ecmascript)");
} else {
    module.exports = __turbopack_context__.r("[project]/backend/node_modules/debug/src/node.js [app-route] (ecmascript)");
}
}),
"[project]/backend/node_modules/has-flag/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (flag, argv)=>{
    argv = argv || process.argv;
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const pos = argv.indexOf(prefix + flag);
    const terminatorPos = argv.indexOf('--');
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};
}),
"[project]/backend/node_modules/supports-color/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const hasFlag = __turbopack_context__.r("[project]/backend/node_modules/has-flag/index.js [app-route] (ecmascript)");
const env = process.env;
let forceColor;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
    forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    forceColor = true;
}
if ('FORCE_COLOR' in env) {
    forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}
function translateLevel(level) {
    if (level === 0) {
        return false;
    }
    return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
    };
}
function supportsColor(stream) {
    if (forceColor === false) {
        return 0;
    }
    if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
        return 3;
    }
    if (hasFlag('color=256')) {
        return 2;
    }
    if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
    }
    const min = forceColor ? 1 : 0;
    if ("TURBOPACK compile-time truthy", 1) {
        // Node.js 7.5.0 is the first version of Node.js to include a patch to
        // libuv that enables 256 color output on Windows. Anything earlier and it
        // won't work. However, here we target Node.js 8 at minimum as it is an LTS
        // release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
        // release that supports 256 colors. Windows 10 build 14931 is the first release
        // that supports 16m/TrueColor.
        const osRelease = os.release().split('.');
        if (Number(process.versions.node.split('.')[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
    }
    //TURBOPACK unreachable
    ;
}
function getSupportLevel(stream) {
    const level = supportsColor(stream);
    return translateLevel(level);
}
module.exports = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel(process.stdout),
    stderr: getSupportLevel(process.stderr)
};
}),
"[project]/backend/node_modules/sift/es5m/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol */ __turbopack_context__.s([
    "$Size",
    ()=>$Size,
    "$all",
    ()=>$all,
    "$and",
    ()=>$and,
    "$elemMatch",
    ()=>$elemMatch,
    "$eq",
    ()=>$eq,
    "$exists",
    ()=>$exists,
    "$gt",
    ()=>$gt,
    "$gte",
    ()=>$gte,
    "$in",
    ()=>$in,
    "$lt",
    ()=>$lt,
    "$lte",
    ()=>$lte,
    "$mod",
    ()=>$mod,
    "$ne",
    ()=>$ne,
    "$nin",
    ()=>$nin,
    "$nor",
    ()=>$nor,
    "$not",
    ()=>$not,
    "$options",
    ()=>$options,
    "$or",
    ()=>$or,
    "$regex",
    ()=>$regex,
    "$size",
    ()=>$size,
    "$type",
    ()=>$type,
    "$where",
    ()=>$where,
    "EqualsOperation",
    ()=>EqualsOperation,
    "createDefaultQueryOperation",
    ()=>createDefaultQueryOperation,
    "createEqualsOperation",
    ()=>createEqualsOperation,
    "createOperationTester",
    ()=>createOperationTester,
    "createQueryOperation",
    ()=>createQueryOperation,
    "createQueryTester",
    ()=>createQueryTester,
    "default",
    ()=>createDefaultQueryTester
]);
var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var typeChecker = function(type) {
    var typeString = "[object " + type + "]";
    return function(value) {
        return getClassName(value) === typeString;
    };
};
var getClassName = function(value) {
    return Object.prototype.toString.call(value);
};
var comparable = function(value) {
    if (value instanceof Date) {
        return value.getTime();
    } else if (isArray(value)) {
        return value.map(comparable);
    } else if (value && typeof value.toJSON === "function") {
        return value.toJSON();
    }
    return value;
};
var coercePotentiallyNull = function(value) {
    return value == null ? null : value;
};
var isArray = typeChecker("Array");
var isObject = typeChecker("Object");
var isFunction = typeChecker("Function");
var isProperty = function(item, key) {
    return item.hasOwnProperty(key) && !isFunction(item[key]);
};
var isVanillaObject = function(value) {
    return value && (value.constructor === Object || value.constructor === Array || value.constructor.toString() === "function Object() { [native code] }" || value.constructor.toString() === "function Array() { [native code] }") && !value.toJSON;
};
var equals = function(a, b) {
    if (a == null && a == b) {
        return true;
    }
    if (a === b) {
        return true;
    }
    if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
        return false;
    }
    if (isArray(a)) {
        if (a.length !== b.length) {
            return false;
        }
        for(var i = 0, length_1 = a.length; i < length_1; i++){
            if (!equals(a[i], b[i])) return false;
        }
        return true;
    } else if (isObject(a)) {
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        for(var key in a){
            if (!equals(a[key], b[key])) return false;
        }
        return true;
    }
    return false;
};
/**
 * Walks through each value given the context - used for nested operations. E.g:
 * { "person.address": { $eq: "blarg" }}
 */ var walkKeyPathValues = function(item, keyPath, next, depth, key, owner) {
    var currentKey = keyPath[depth];
    // if array, then try matching. Might fall through for cases like:
    // { $eq: [1, 2, 3] }, [ 1, 2, 3 ].
    if (isArray(item) && isNaN(Number(currentKey)) && !isProperty(item, currentKey)) {
        for(var i = 0, length_1 = item.length; i < length_1; i++){
            // if FALSE is returned, then terminate walker. For operations, this simply
            // means that the search critera was met.
            if (!walkKeyPathValues(item[i], keyPath, next, depth, i, item)) {
                return false;
            }
        }
    }
    if (depth === keyPath.length || item == null) {
        return next(item, key, owner, depth === 0, depth === keyPath.length);
    }
    return walkKeyPathValues(item[currentKey], keyPath, next, depth + 1, currentKey, item);
};
var BaseOperation = function() {
    function BaseOperation(params, owneryQuery, options, name) {
        this.params = params;
        this.owneryQuery = owneryQuery;
        this.options = options;
        this.name = name;
        this.init();
    }
    BaseOperation.prototype.init = function() {};
    BaseOperation.prototype.reset = function() {
        this.done = false;
        this.keep = false;
    };
    return BaseOperation;
}();
var GroupOperation = function(_super) {
    __extends(GroupOperation, _super);
    function GroupOperation(params, owneryQuery, options, children) {
        var _this = _super.call(this, params, owneryQuery, options) || this;
        _this.children = children;
        return _this;
    }
    /**
     */ GroupOperation.prototype.reset = function() {
        this.keep = false;
        this.done = false;
        for(var i = 0, length_2 = this.children.length; i < length_2; i++){
            this.children[i].reset();
        }
    };
    /**
     */ GroupOperation.prototype.childrenNext = function(item, key, owner, root, leaf) {
        var done = true;
        var keep = true;
        for(var i = 0, length_3 = this.children.length; i < length_3; i++){
            var childOperation = this.children[i];
            if (!childOperation.done) {
                childOperation.next(item, key, owner, root, leaf);
            }
            if (!childOperation.keep) {
                keep = false;
            }
            if (childOperation.done) {
                if (!childOperation.keep) {
                    break;
                }
            } else {
                done = false;
            }
        }
        this.done = done;
        this.keep = keep;
    };
    return GroupOperation;
}(BaseOperation);
var NamedGroupOperation = function(_super) {
    __extends(NamedGroupOperation, _super);
    function NamedGroupOperation(params, owneryQuery, options, children, name) {
        var _this = _super.call(this, params, owneryQuery, options, children) || this;
        _this.name = name;
        return _this;
    }
    return NamedGroupOperation;
}(GroupOperation);
var QueryOperation = function(_super) {
    __extends(QueryOperation, _super);
    function QueryOperation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    /**
     */ QueryOperation.prototype.next = function(item, key, parent, root) {
        this.childrenNext(item, key, parent, root);
    };
    return QueryOperation;
}(GroupOperation);
var NestedOperation = function(_super) {
    __extends(NestedOperation, _super);
    function NestedOperation(keyPath, params, owneryQuery, options, children) {
        var _this = _super.call(this, params, owneryQuery, options, children) || this;
        _this.keyPath = keyPath;
        _this.propop = true;
        /**
         */ _this._nextNestedValue = function(value, key, owner, root, leaf) {
            _this.childrenNext(value, key, owner, root, leaf);
            return !_this.done;
        };
        return _this;
    }
    /**
     */ NestedOperation.prototype.next = function(item, key, parent) {
        walkKeyPathValues(item, this.keyPath, this._nextNestedValue, 0, key, parent);
    };
    return NestedOperation;
}(GroupOperation);
var createTester = function(a, compare) {
    if (a instanceof Function) {
        return a;
    }
    if (a instanceof RegExp) {
        return function(b) {
            var result = typeof b === "string" && a.test(b);
            a.lastIndex = 0;
            return result;
        };
    }
    var comparableA = comparable(a);
    return function(b) {
        return compare(comparableA, comparable(b));
    };
};
var EqualsOperation = function(_super) {
    __extends(EqualsOperation, _super);
    function EqualsOperation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    EqualsOperation.prototype.init = function() {
        this._test = createTester(this.params, this.options.compare);
    };
    EqualsOperation.prototype.next = function(item, key, parent) {
        if (!Array.isArray(parent) || parent.hasOwnProperty(key)) {
            if (this._test(item, key, parent)) {
                this.done = true;
                this.keep = true;
            }
        }
    };
    return EqualsOperation;
}(BaseOperation);
var createEqualsOperation = function(params, owneryQuery, options) {
    return new EqualsOperation(params, owneryQuery, options);
};
var numericalOperationCreator = function(createNumericalOperation) {
    return function(params, owneryQuery, options, name) {
        return createNumericalOperation(params, owneryQuery, options, name);
    };
};
var numericalOperation = function(createTester) {
    return numericalOperationCreator(function(params, owneryQuery, options, name) {
        var typeofParams = typeof comparable(params);
        var test = createTester(params);
        return new EqualsOperation(function(b) {
            var actualValue = coercePotentiallyNull(b);
            return typeof comparable(actualValue) === typeofParams && test(actualValue);
        }, owneryQuery, options, name);
    });
};
var createNamedOperation = function(name, params, parentQuery, options) {
    var operationCreator = options.operations[name];
    if (!operationCreator) {
        throwUnsupportedOperation(name);
    }
    return operationCreator(params, parentQuery, options, name);
};
var throwUnsupportedOperation = function(name) {
    throw new Error("Unsupported operation: ".concat(name));
};
var containsOperation = function(query, options) {
    for(var key in query){
        if (options.operations.hasOwnProperty(key) || key.charAt(0) === "$") return true;
    }
    return false;
};
var createNestedOperation = function(keyPath, nestedQuery, parentKey, owneryQuery, options) {
    if (containsOperation(nestedQuery, options)) {
        var _a = createQueryOperations(nestedQuery, parentKey, options), selfOperations = _a[0], nestedOperations = _a[1];
        if (nestedOperations.length) {
            throw new Error("Property queries must contain only operations, or exact objects.");
        }
        return new NestedOperation(keyPath, nestedQuery, owneryQuery, options, selfOperations);
    }
    return new NestedOperation(keyPath, nestedQuery, owneryQuery, options, [
        new EqualsOperation(nestedQuery, owneryQuery, options)
    ]);
};
var createQueryOperation = function(query, owneryQuery, _a) {
    if (owneryQuery === void 0) {
        owneryQuery = null;
    }
    var _b = _a === void 0 ? {} : _a, compare = _b.compare, operations = _b.operations;
    var options = {
        compare: compare || equals,
        operations: Object.assign({}, operations || {})
    };
    var _c = createQueryOperations(query, null, options), selfOperations = _c[0], nestedOperations = _c[1];
    var ops = [];
    if (selfOperations.length) {
        ops.push(new NestedOperation([], query, owneryQuery, options, selfOperations));
    }
    ops.push.apply(ops, nestedOperations);
    if (ops.length === 1) {
        return ops[0];
    }
    return new QueryOperation(query, owneryQuery, options, ops);
};
var createQueryOperations = function(query, parentKey, options) {
    var selfOperations = [];
    var nestedOperations = [];
    if (!isVanillaObject(query)) {
        selfOperations.push(new EqualsOperation(query, query, options));
        return [
            selfOperations,
            nestedOperations
        ];
    }
    for(var key in query){
        if (options.operations.hasOwnProperty(key)) {
            var op = createNamedOperation(key, query[key], query, options);
            if (op) {
                if (!op.propop && parentKey && !options.operations[parentKey]) {
                    throw new Error("Malformed query. ".concat(key, " cannot be matched against property."));
                }
            }
            // probably just a flag for another operation (like $options)
            if (op != null) {
                selfOperations.push(op);
            }
        } else if (key.charAt(0) === "$") {
            throwUnsupportedOperation(key);
        } else {
            nestedOperations.push(createNestedOperation(key.split("."), query[key], key, query, options));
        }
    }
    return [
        selfOperations,
        nestedOperations
    ];
};
var createOperationTester = function(operation) {
    return function(item, key, owner) {
        operation.reset();
        operation.next(item, key, owner);
        return operation.keep;
    };
};
var createQueryTester = function(query, options) {
    if (options === void 0) {
        options = {};
    }
    return createOperationTester(createQueryOperation(query, null, options));
};
var $Ne = function(_super) {
    __extends($Ne, _super);
    function $Ne() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $Ne.prototype.init = function() {
        this._test = createTester(this.params, this.options.compare);
    };
    $Ne.prototype.reset = function() {
        _super.prototype.reset.call(this);
        this.keep = true;
    };
    $Ne.prototype.next = function(item) {
        if (this._test(item)) {
            this.done = true;
            this.keep = false;
        }
    };
    return $Ne;
}(BaseOperation);
// https://docs.mongodb.com/manual/reference/operator/query/elemMatch/
var $ElemMatch = function(_super) {
    __extends($ElemMatch, _super);
    function $ElemMatch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $ElemMatch.prototype.init = function() {
        if (!this.params || typeof this.params !== "object") {
            throw new Error("Malformed query. $elemMatch must by an object.");
        }
        this._queryOperation = createQueryOperation(this.params, this.owneryQuery, this.options);
    };
    $ElemMatch.prototype.reset = function() {
        _super.prototype.reset.call(this);
        this._queryOperation.reset();
    };
    $ElemMatch.prototype.next = function(item) {
        if (isArray(item)) {
            for(var i = 0, length_1 = item.length; i < length_1; i++){
                // reset query operation since item being tested needs to pass _all_ query
                // operations for it to be a success
                this._queryOperation.reset();
                var child = item[i];
                this._queryOperation.next(child, i, item, false);
                this.keep = this.keep || this._queryOperation.keep;
            }
            this.done = true;
        } else {
            this.done = false;
            this.keep = false;
        }
    };
    return $ElemMatch;
}(BaseOperation);
var $Not = function(_super) {
    __extends($Not, _super);
    function $Not() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $Not.prototype.init = function() {
        this._queryOperation = createQueryOperation(this.params, this.owneryQuery, this.options);
    };
    $Not.prototype.reset = function() {
        _super.prototype.reset.call(this);
        this._queryOperation.reset();
    };
    $Not.prototype.next = function(item, key, owner, root) {
        this._queryOperation.next(item, key, owner, root);
        this.done = this._queryOperation.done;
        this.keep = !this._queryOperation.keep;
    };
    return $Not;
}(BaseOperation);
var $Size = function(_super) {
    __extends($Size, _super);
    function $Size() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $Size.prototype.init = function() {};
    $Size.prototype.next = function(item) {
        if (isArray(item) && item.length === this.params) {
            this.done = true;
            this.keep = true;
        }
    // if (parent && parent.length === this.params) {
    //   this.done = true;
    //   this.keep = true;
    // }
    };
    return $Size;
}(BaseOperation);
var assertGroupNotEmpty = function(values) {
    if (values.length === 0) {
        throw new Error("$and/$or/$nor must be a nonempty array");
    }
};
var $Or = function(_super) {
    __extends($Or, _super);
    function $Or() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = false;
        return _this;
    }
    $Or.prototype.init = function() {
        var _this = this;
        assertGroupNotEmpty(this.params);
        this._ops = this.params.map(function(op) {
            return createQueryOperation(op, null, _this.options);
        });
    };
    $Or.prototype.reset = function() {
        this.done = false;
        this.keep = false;
        for(var i = 0, length_2 = this._ops.length; i < length_2; i++){
            this._ops[i].reset();
        }
    };
    $Or.prototype.next = function(item, key, owner) {
        var done = false;
        var success = false;
        for(var i = 0, length_3 = this._ops.length; i < length_3; i++){
            var op = this._ops[i];
            op.next(item, key, owner);
            if (op.keep) {
                done = true;
                success = op.keep;
                break;
            }
        }
        this.keep = success;
        this.done = done;
    };
    return $Or;
}(BaseOperation);
var $Nor = function(_super) {
    __extends($Nor, _super);
    function $Nor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = false;
        return _this;
    }
    $Nor.prototype.next = function(item, key, owner) {
        _super.prototype.next.call(this, item, key, owner);
        this.keep = !this.keep;
    };
    return $Nor;
}($Or);
var $In = function(_super) {
    __extends($In, _super);
    function $In() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $In.prototype.init = function() {
        var _this = this;
        var params = Array.isArray(this.params) ? this.params : [
            this.params
        ];
        this._testers = params.map(function(value) {
            if (containsOperation(value, _this.options)) {
                throw new Error("cannot nest $ under ".concat(_this.name.toLowerCase()));
            }
            return createTester(value, _this.options.compare);
        });
    };
    $In.prototype.next = function(item, key, owner) {
        var done = false;
        var success = false;
        for(var i = 0, length_4 = this._testers.length; i < length_4; i++){
            var test = this._testers[i];
            if (test(item)) {
                done = true;
                success = true;
                break;
            }
        }
        this.keep = success;
        this.done = done;
    };
    return $In;
}(BaseOperation);
var $Nin = function(_super) {
    __extends($Nin, _super);
    function $Nin(params, ownerQuery, options, name) {
        var _this = _super.call(this, params, ownerQuery, options, name) || this;
        _this.propop = true;
        _this._in = new $In(params, ownerQuery, options, name);
        return _this;
    }
    $Nin.prototype.next = function(item, key, owner, root) {
        this._in.next(item, key, owner);
        if (isArray(owner) && !root) {
            if (this._in.keep) {
                this.keep = false;
                this.done = true;
            } else if (key == owner.length - 1) {
                this.keep = true;
                this.done = true;
            }
        } else {
            this.keep = !this._in.keep;
            this.done = true;
        }
    };
    $Nin.prototype.reset = function() {
        _super.prototype.reset.call(this);
        this._in.reset();
    };
    return $Nin;
}(BaseOperation);
var $Exists = function(_super) {
    __extends($Exists, _super);
    function $Exists() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propop = true;
        return _this;
    }
    $Exists.prototype.next = function(item, key, owner, root, leaf) {
        if (!leaf) {
            this.done = true;
            this.keep = !this.params;
        } else if (owner.hasOwnProperty(key) === this.params) {
            this.done = true;
            this.keep = true;
        }
    };
    return $Exists;
}(BaseOperation);
var $And = function(_super) {
    __extends($And, _super);
    function $And(params, owneryQuery, options, name) {
        var _this = _super.call(this, params, owneryQuery, options, params.map(function(query) {
            return createQueryOperation(query, owneryQuery, options);
        }), name) || this;
        _this.propop = false;
        assertGroupNotEmpty(params);
        return _this;
    }
    $And.prototype.next = function(item, key, owner, root) {
        this.childrenNext(item, key, owner, root);
    };
    return $And;
}(NamedGroupOperation);
var $All = function(_super) {
    __extends($All, _super);
    function $All(params, owneryQuery, options, name) {
        var _this = _super.call(this, params, owneryQuery, options, params.map(function(query) {
            return createQueryOperation(query, owneryQuery, options);
        }), name) || this;
        _this.propop = true;
        return _this;
    }
    $All.prototype.next = function(item, key, owner, root) {
        this.childrenNext(item, key, owner, root);
    };
    return $All;
}(NamedGroupOperation);
var $eq = function(params, owneryQuery, options) {
    return new EqualsOperation(params, owneryQuery, options);
};
var $ne = function(params, owneryQuery, options, name) {
    return new $Ne(params, owneryQuery, options, name);
};
var $or = function(params, owneryQuery, options, name) {
    return new $Or(params, owneryQuery, options, name);
};
var $nor = function(params, owneryQuery, options, name) {
    return new $Nor(params, owneryQuery, options, name);
};
var $elemMatch = function(params, owneryQuery, options, name) {
    return new $ElemMatch(params, owneryQuery, options, name);
};
var $nin = function(params, owneryQuery, options, name) {
    return new $Nin(params, owneryQuery, options, name);
};
var $in = function(params, owneryQuery, options, name) {
    return new $In(params, owneryQuery, options, name);
};
var $lt = numericalOperation(function(params) {
    return function(b) {
        return b != null && b < params;
    };
});
var $lte = numericalOperation(function(params) {
    return function(b) {
        return b === params || b <= params;
    };
});
var $gt = numericalOperation(function(params) {
    return function(b) {
        return b != null && b > params;
    };
});
var $gte = numericalOperation(function(params) {
    return function(b) {
        return b === params || b >= params;
    };
});
var $mod = function(_a, owneryQuery, options) {
    var mod = _a[0], equalsValue = _a[1];
    return new EqualsOperation(function(b) {
        return comparable(b) % mod === equalsValue;
    }, owneryQuery, options);
};
var $exists = function(params, owneryQuery, options, name) {
    return new $Exists(params, owneryQuery, options, name);
};
var $regex = function(pattern, owneryQuery, options) {
    return new EqualsOperation(new RegExp(pattern, owneryQuery.$options), owneryQuery, options);
};
var $not = function(params, owneryQuery, options, name) {
    return new $Not(params, owneryQuery, options, name);
};
var typeAliases = {
    number: function(v) {
        return typeof v === "number";
    },
    string: function(v) {
        return typeof v === "string";
    },
    bool: function(v) {
        return typeof v === "boolean";
    },
    array: function(v) {
        return Array.isArray(v);
    },
    null: function(v) {
        return v === null;
    },
    timestamp: function(v) {
        return v instanceof Date;
    }
};
var $type = function(clazz, owneryQuery, options) {
    return new EqualsOperation(function(b) {
        if (typeof clazz === "string") {
            if (!typeAliases[clazz]) {
                throw new Error("Type alias does not exist");
            }
            return typeAliases[clazz](b);
        }
        return b != null ? b instanceof clazz || b.constructor === clazz : false;
    }, owneryQuery, options);
};
var $and = function(params, ownerQuery, options, name) {
    return new $And(params, ownerQuery, options, name);
};
var $all = function(params, ownerQuery, options, name) {
    return new $All(params, ownerQuery, options, name);
};
var $size = function(params, ownerQuery, options) {
    return new $Size(params, ownerQuery, options, "$size");
};
var $options = function() {
    return null;
};
var $where = function(params, ownerQuery, options) {
    var test;
    if (isFunction(params)) {
        test = params;
    } else if (!process.env.CSP_ENABLED) {
        test = new Function("obj", "return " + params);
    } else {
        throw new Error("In CSP mode, sift does not support strings in \"$where\" condition");
    }
    return new EqualsOperation(function(b) {
        return test.bind(b)(b);
    }, ownerQuery, options);
};
var defaultOperations = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    $Size: $Size,
    $all: $all,
    $and: $and,
    $elemMatch: $elemMatch,
    $eq: $eq,
    $exists: $exists,
    $gt: $gt,
    $gte: $gte,
    $in: $in,
    $lt: $lt,
    $lte: $lte,
    $mod: $mod,
    $ne: $ne,
    $nin: $nin,
    $nor: $nor,
    $not: $not,
    $options: $options,
    $or: $or,
    $regex: $regex,
    $size: $size,
    $type: $type,
    $where: $where
});
var createDefaultQueryOperation = function(query, ownerQuery, _a) {
    var _b = _a === void 0 ? {} : _a, compare = _b.compare, operations = _b.operations;
    return createQueryOperation(query, ownerQuery, {
        compare: compare,
        operations: Object.assign({}, defaultOperations, operations || {})
    });
};
var createDefaultQueryTester = function(query, options) {
    if (options === void 0) {
        options = {};
    }
    var op = createDefaultQueryOperation(query, null, options);
    return createOperationTester(op);
};
;
 //# sourceMappingURL=index.js.map
}),
];

//# sourceMappingURL=6d019_cbb05475._.js.map