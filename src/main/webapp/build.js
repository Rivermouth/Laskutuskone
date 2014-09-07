var compressor = require('node-minify');
var wrench = require('wrench');
var util = require('util');

var toLoad = 6;
var hasError = false;
var loaded = function(err, msg) {
    toLoad--;

    if (err) {
        console.log(err);
    }
    else {
        console.log(msg);
    }

    if (toLoad == 0) {
        if (hasError) {
            console.log("Build success with error(s).");
        }
        else {
            console.log("Build success!");
        }
    }
}

// Concate, no-minify
new compressor.minify({
    type: 'no-compress',
    fileIn: ['lib-ext/pankkiviivakoodi/dist/pankkiviivakoodi-all.js', 'lib/bn.js',
        'js/helpers.js', 'lib/GoogleAPI/Drive.js', 'js/JobRow.js', 'js/BillMachine.js', 'js/controlpanel.js'],
    fileOut: 'dist/laskutuskone.js',
    callback: function(err, min){
        loaded(err, "Concate done.");

        // Concate and minify
        new compressor.minify({
            type: 'gcc',
            fileIn: 'dist/laskutuskone.js',
            fileOut: 'dist/laskutuskone.min.js',
            callback: function(err, min){
                loaded(err, "Minify done.");
            }
        });
    }
});

wrench.copyDirRecursive("css", "dist", {forceDelete: true}, function() {
    loaded(false, "Copy /css done.");
});

wrench.copyDirRecursive("img", "dist", {forceDelete: true}, function() {
    loaded(false, "Copy /img done.");
});

wrench.copyDirRecursive("js", "dist", {forceDelete: true}, function() {
    loaded(false, "Copy /js done.");
});

wrench.copyDirRecursive("lib", "dist", {forceDelete: true}, function() {
    loaded(false, "Copy /js done.");
});
