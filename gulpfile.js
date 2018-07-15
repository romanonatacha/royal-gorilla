const modes = ['development', 'staging', 'production', 'beta'];
const gulp = require('gulp');
const log = require('./gulp/rg-gulp-easter').MessageHelper;
const rename = require('gulp-rename');
const path = require("path");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("./tsconfig.json");
const pm2 = require('pm2');
const nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');

process.env.NODE_ENV="development"

if(!process.env.NODE_ENV || modes.indexOf(process.env.NODE_ENV.trim()) < 0){
    throw new Error(`Mode inválido NODE_ENV: ${process.env.NODE_ENV}`);
} else {
    if(process.env.NODE_ENV == 'development'){
        require('./gulp/rg-gulp-easter').Logo();
        log.title('\\m/');
    }
    log.title(`Mode NODE_ENV: ${process.env.NODE_ENV}`);
}

gulp.task('copy-config', (done) => {
    gulp.src([`config/env/${process.env.NODE_ENV}.env`])
        .pipe(rename('.env'))
        .pipe(gulp.dest('./'))
        .on('end', () => { 
            done();
        });
});

gulp.task('typescript-compile', (done) => {

    let tsBuild = tsProject.src();

    if(process.env.NODE_ENV != 'production'){
        tsBuild = tsBuild.pipe(sourcemaps.init());
    }
    tsBuild = tsBuild.pipe(tsProject());
    if(process.env.NODE_ENV != 'production'){

        tsBuild = tsBuild.pipe(sourcemaps.mapSources(function(sourcePath, file) {
            // source paths are prefixed with '../src/'
            var curr = __dirname;
            var filePath = path.relative(file.dirname, path.join(__dirname, sourcePath)).substr(3);
                        

            return filePath;

          }))

        tsBuild = tsBuild.pipe(sourcemaps.write( '.' 
        // ,{
        //     sourceRoot: (file) => {
        //         var curr = __dirname;
        //         var t = path.relative(file.dirname, path.join(__dirname, 'src-server'))

        //       return t;
        //     },
        //   }
        ));
    }
    tsBuild = tsBuild.pipe(gulp.dest("./build"));
    tsBuild.on('end', () => { 
        done();
    });

});

gulp.task('server-pm2', (done) => {
    if(process.env.NODE_ENV == 'production') {
        pm2.connect(function(err) {
            if (err) {
              console.error(err);
              process.exit(2);
            }
            
            pm2.start({
                name : 'royal-gorilla',
                script:'./build/RoyalGorillaApp.js'
            }, function(err, apps) {
                log.title('PM2 Started');
                done();
                process.exit(0);
            });
        });
    }
    else {
        var nodemonOptions = { 
            nodemon: require('nodemon'),
            script: './build/RoyalGorillaApp.js',
            watch: ['./build/*.js']
        }

        if(process.env.NODE_ENV == 'development') {
            require('./gulp/rg-gulp-easter').Rule();
            nodemonOptions.exec = 'node --inspect-brk';
        }

        var stream = nodemon(nodemonOptions);
 
        stream
            .on('start', () => {
                log.title('NODEMON Started');
                done();
            })
            .on('restart', function () {
                log.warn('NODEMON Restarted');
            })
            .on('crash', function() {
                log.error('Application has crashed!\n');
                stream.emit('restart', 3);
            })
            .on('exit',() => {
                log.lightInfo('NODEMON Exited!');
            });
    }
});

gulp.task('super', gulp.series('copy-config', gulp.parallel('typescript-compile'), 'server-pm2'), (done) => {
    done();
});