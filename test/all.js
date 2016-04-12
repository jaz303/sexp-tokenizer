var test    = require('tape');
var fs      = require('fs');
var sexp    = require('../');
var testSeq = require('tape-readable-seq');

test("tokenizer", function(assert) {

    var stream = fs.createReadStream(__dirname + '/input.sexp', {encoding: 'utf8'})
                    .pipe(sexp());

    testSeq(stream, [
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
    ])(assert);

});

test("translation", function(assert) {

    var stream = fs.createReadStream(__dirname + '/translate.sexp', {encoding: 'utf8'})
                    .pipe(sexp({
                        translateSymbol: function() { return 'symbol'; },
                        translateString: function() { return 'string'; },
                        translateNumber: function() { return 'number'; }
                    }));

    testSeq(stream, [
        sexp.OPEN,
        'symbol',
        'string',
        'number',
        sexp.CLOSE
    ])(assert);

});

test("error", function(assert) {

    assert.plan(1);

    fs.createReadStream(__dirname + '/error.sexp', {encoding: 'utf8'})
        .pipe(sexp())
        .on('error', function() {
            assert.ok(true);
        })

});

test.only("comment", function(assert) {

   var stream = fs.createReadStream(__dirname + '/comment.wast', {encoding: 'utf8'})
                    .pipe(sexp());

     testSeq(stream, [
        sexp.OPEN,
        'module',
        sexp.OPEN,
        'import',
        '$gasUsed',
        'ethereum',
        'gasUsed',
        sexp.OPEN,
        'result',
        'i64',
        sexp.CLOSE,
        sexp.CLOSE,
        sexp.OPEN,
        'export',
        'test',
        0,
        sexp.CLOSE,
        sexp.OPEN,
        'func',
        sexp.OPEN,
        'result',
        'i32',
        sexp.CLOSE,
        sexp.OPEN,
        'block',
        sexp.OPEN,
        'if',
        sexp.OPEN,
        'i64.eq',
        sexp.OPEN,
        'call_import',
        '$gasUsed',
        sexp.CLOSE,
        sexp.OPEN,
        'i64.const',
        5,
        sexp.CLOSE,
        sexp.CLOSE,
        sexp.OPEN,
        'br',
        0,
        sexp.CLOSE,
        sexp.CLOSE,
        sexp.OPEN,
        'unreachable',
        sexp.CLOSE,
        sexp.CLOSE,
        sexp.CLOSE,
        sexp.CLOSE
      ])(assert);

});
