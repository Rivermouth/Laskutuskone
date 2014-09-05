var compressor = require('node-minify');

var toLoad = 2;
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
    fileIn: ['lib/pankkiviivakoodi/dist/pankkiviivakoodi-all.js', 'bn.js', 'billmachine.js', 'controlpanel.js'],
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
