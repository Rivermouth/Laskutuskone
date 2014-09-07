module.exports = function(grunt) {

    var destFolder = '../webapp/';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: destFolder
            }
        },
        usemin: {
            html: [destFolder + 'index.html']
        },
        copy: {
            main: {
                files: [
                     {expand: true, src: ['*', '!Gruntfile.js', '!README.md'], dest: destFolder, filter: 'isFile' },
                    { src: ["img/**"], dest: destFolder }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-filerev');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', [
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'copy',
        //   'filerev',
        'usemin'
    ]);

};
