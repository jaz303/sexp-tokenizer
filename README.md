# sexp-tokenizer

A streaming s-expression tokenizer.

Turns this:

    (foo bar (baz "a string with spaces and \"quotes\"" 1 2 3))

Into a stream of these:

    sexp.OPEN
    "foo"
    "bar"
    sexp.OPEN
    "baz"
    "a string with spaces and \"quotes\""
    1
    2
    3
    sexp.CLOSE
    sexp.CLOSE

`sexp-tokenizer` recognises three types of atom:

  * number - anything that looks like a positive/negative integer/float
  * string - a double or single quoted string. Slash-escaping is supported for `'`, `"`, `\r`, `\n` and `\t`
  * symbol - any series of non-space, non-paren characters that is neither a number nor a symbol

For each type of atom, a translation function can be assigned for managing the emitted values (see API, below).

## Installation

    $ npm install sexp-tokenizer

## Usage

    var fs = require('fs');
    var sexp = require('sexp-tokenizer');

    fs.createReadStream('foo.sexp', {encoding: 'utf8'})
      .pipe(sexp())
      .on('data', function(obj) {
        if (obj === sexp.OPEN) {
          // open paren
        } else if (obj === sexp.CLOSE) {
          // close paren
        } else {
          // atom - string, symbol, number, whatever...
        }
      })

    var sexp = require('sexp');
    var ary = sexp("(foo bar 'string with spaces' 1 (2 3 4))")

## API

#### `sexp([options])`

Supported options:

  * `translateString`: callback used to process quoted values. Default: identity.
  * `translateSymbol`: callback used to process unquoted, non-numeric values. Default: identity.
  * `translateNumber`: callback used to process numeric values. Default: `parseFloat`.
