/**
 * Created by j on 04/11/2015.
 */
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        validation: {
            options: {
                reset: grunt.option('reset') || false,
                stoponerror: false,
                generateReport: true,
                errorHTMLRootDir:'w3cValidation',
                doctype:'HTML5',
                reportpath:'w3cValidation/validation-report.json',
                path:'w3cValidation/validation-status.json'
            },
            files: {
                src: [
                    'app/admin/**/*.html',
                    'app/website/**/*.html',
                    'app/index.html'
                ]
            }
        }
    });

    // Load the plugins that provide the tasks.
    grunt.loadNpmTasks('grunt-w3c-html-validation');

    //w3c validate the html files
    grunt.registerTask('default', ['validation']);

};
