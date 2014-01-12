//
// export

module.exports = function(options) {
    return new SexpStream(options);
}

var OPEN    = module.exports.OPEN   = {},
    CLOSE   = module.exports.CLOSE  = {};

var SPACE   = /^[ \r\n\t]+/,
    NUMBER  = /^-?\d+(?:\.\d+)?/,
    ATOM    = /^[^\(\)'"\r\n\t ]+/,
    STRING  = /^("(?:\\[rnt\\'"]|[^\\"])*"|'(?:\\[rnt\\'"]|[^\\'])*')/;

//
// helpers

function decodeString(str) {
    return str.substr(1, str.length - 2)
              .replace(/\\r/g,  "\r")
              .replace(/\\n/g,  "\n")
              .replace(/\\t/g,  "\t")
              .replace(/\\\\/g, "\\")
              .replace(/\\'/g,  "'")
              .replace(/\\"/g,  "\"");
}
    
//
// stream

var Transform   = require('stream').Transform,
    util        = require('util');

util.inherits(SexpStream, Transform);

function SexpStream(options) {

    options = options || {};
    options.objectMode = true;

    this._txNumber = options.translateNumber || parseFloat;
    this._txSymbol = options.translateSymbol || function(s) { return s; };
    this._txString = options.translateString || function(s) { return s; };
    
    Transform.call(this, options);
    
    this._remain = '';

}

SexpStream.prototype._transform = function(chunk, encoding, done) {

    this._remain += chunk;
    
    var match, len;

    while (this._remain.length) {
        if (this._remain[0] === '(') {
            this.push(OPEN);
            len = 1;
        } else if (this._remain[0] === ')') {
            this.push(CLOSE);
            len = 1;
        } else if ((match = SPACE.exec(this._remain))) {
            len = match[0].length;
        } else {
            if ((match = NUMBER.exec(this._remain))) {
                if (match[0].length < this._remain.length) {
                    this.push(this._txNumber(match[0]));
                    len = match[0].length;
                } else {
                    break;
                }
            } else if ((match = ATOM.exec(this._remain))) {
                if (match[0].length < this._remain.length) {
                    this.push(this._txSymbol(match[0]));
                    len = match[0].length;
                } else {
                    break;
                }
            } else if ((match = STRING.exec(this._remain))) {
                this.push(this._txString(decodeString(match[0])));
                len = match[0].length;
            } else {
                break;
            }
        }
        this._remain = this._remain.slice(len);
    }

    done();

};

SexpStream.prototype._flush = function(cb) {
    cb(this._remain.length ? new Error("unexpected EOF") : null);
};