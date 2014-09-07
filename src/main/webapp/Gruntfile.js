module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: ['dist/index.html']
        },
        copy: {
            main: {
                files: [
                    {expand: true, src: ['*', '!Gruntfile.js', '!README.md'], dest: 'dist/', filter: 'isFile'},
                    { src: ["img/**"], dest: "dist/" }
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
