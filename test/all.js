var test = require('tape');
var fs   = require('fs');
var sexp = require('../');

test("tokenizer", function(assert) {

    var expect = [
        sexp.OPEN,
        'foo',
        'bar',
        1.5,
        2,
        3,
        sexp.OPEN,
        sexp.OPEN,
        'a string',
        '\n\n\nanother\t"string"',
        sexp.CLOSE,
        sexp.CLOSE,
        '+',
        '-',
        'splat',
        sexp.CLOSE
    ];

    var ix = 0;

    assert.plan(expect.length);

    fs.createReadStream(__dirname + '/input.sexp', {encoding: 'utf8'})
        .pipe(sexp())
        .on('data', function(obj) {
            assert.equal(obj, expect[ix++]);
        });

});

test("translation", function(assert) {

    var expect = [
        sexp.OPEN,
        'symbol',
        'string',
        'number',
        sexp.CLOSE
    ];

    var ix = 0;

    assert.plan(expect.length);

    fs.createReadStream(__dirname + '/translate.sexp', {encoding: 'utf8'})
        .pipe(sexp({
            translateSymbol: function() { return 'symbol'; },
            translateString: function() { return 'string'; },
            translateNumber: function() { return 'number'; }
        }))
        .on('data', function(obj) {
            assert.equal(obj, expect[ix++]);
        });    

});
