/* jshint node: true */

// Dependencies
var _ = require('lodash'),
    fs = require('fs'),
    gulp = require('gulp'),
    mustache = require('gulp-mustache-plus');

// Variables
var mustachify,
    data;

rashtache = function (folders) {
    return folders.reduce(function (prevObject, folder) {
        var objectify;

        objectify = function (folder) {
            var files = fs.readdirSync(folder);

            // Read and combine all the files in the folder
            return files.reduce(function (object, file) {
                var filePath = folder + '/' + file,
                    isFolder,
                    isJSON,
                    property,
                    toCamelCase,
                    value;

                // Convert file/folder names to camelCase (assumimg names only
                // use lowercase letters or dashes)
                toCamelCase = function(string) {
                    string = string.replace(/\.(mustache|json)$/, '');
                    string = string.replace(/(\-)(\w)/g, function (match, dash, letter) {
                        return letter.toUpperCase();
                    });
                    return string;
                };

                // Set the property name
                property = toCamelCase(file);

                // Check to see if the 'file' is actually a directory
                if (fs.statSync(filePath).isDirectory()) {
                    // Recursively process it
                    value = objectify(filePath);
                } else {
                    // Read the file
                    value = fs.readFileSync(filePath, 'utf-8');

                    // Parse and merge the file if it's JSON, otherwise add the value to the object
                    if ((/\.json$/).test(filePath)) {
                        value = JSON.parse(value);
                    }
                }

                object[property] = value;
                return object;
            }, {});
        };

        // Process the current folder and merge it with the object
        return _.merge(prevObject, objectify(folder));
    }, {});
};

// Load the data, starting the the furthest ancestor
data = rashtache(['./parent-patterns', './patterns']);


// Generate the template
gulp.task('default', function () {
    return gulp.src('./patterns/*.html')
        .pipe(mustache(data.json, {}, data.partials))
        .pipe(gulp.dest('./dist'));
});
