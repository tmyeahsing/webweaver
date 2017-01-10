let gulp = require('gulp');
let fs = require('fs');
let gulp_sass = require('gulp-sass');
let imagemin = require('gulp-imagemin');
let minifyCss = require('gulp-minify-css');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let pump = require('pump');
let path = require('path');
let express = require('express');
let app = express();
let serveIndex = require('serve-index');
let c = require('child_process');
let tap = require('gulp-tap');
let mimeTypes = require('mime-types');
let lr = require('tiny-lr')();
let cl = require('connect-livereload');
let browserify = require('gulp-browserify');
let shtml = require('gulp-shtml');
let replace = require('gulp-replace');
let rename = require('gulp-rename');

gulp.task('default', function(){

});

gulp.task('scf', function(){
    fs.mkdir('wwwroot', function(err){
        if(!err){
            fs.mkdir('wwwroot/css', function(err){
                if(!err){
                    fs.writeFile('wwwroot/css/style.scss', 'body{}', function(err){
                        if(!err){
                            console.log("css文件夹创建成功")
                        }
                    })
                }
            })
            fs.mkdir('wwwroot/images', function(err){
                if(!err){
                    console.log("images文件夹创建成功")
                }
            })
            fs.mkdir('wwwroot/js', function(err){
                if(!err){
                    console.log("js文件夹创建成功")
                }
            })
        }
    })
});

gulp.task('dev', ['watch'], function(){
    lr.listen(35729);
    app.use('/', serveIndex('./wwwroot', {'icons': true}));
    //auto append livereload.js to html/shtml files
    app.use(cl({
        include: [/.s?html/]
    }));
    //add ssi support
    /*app.use(cssi({
        baseDir: __dirname + '/wwwroot'
    }));*/
    app.use('/', function(req, res, next){
        let _path = './wwwroot' + req.originalUrl;
        if(fs.existsSync(_path)){
            let _compileArray = getLiveCompileArray(_path);
            if(_compileArray.length){
                let _pumpArray = [
                    gulp.src(_path)
                ];
                _pumpArray = _pumpArray.concat(_compileArray);
                let _r = pump(_pumpArray);
                res.set('Content-Type', getMimeType(_path));
                _r.pipe(tap(function(file){
                    res.send(file.contents);
                }));
            }else{
                next();
            }
        }else{
            next();
        }
    });
    app.use('/', express.static('./wwwroot'));
    app.listen(8080, function (err) {
        if (err) {
            console.log(err)
            return
        }
        //open localhost
        c.exec('start http://localhost:8080')
    });
})

gulp.task('build', function(cb){
    console.log('building...');
    gulp.src('wwwroot/**/!(_*).*')
        .pipe(tap(function(file){
            let _path =path.relative('', file.path);
            let _compileArray = [gulp.src(_path, {base: 'wwwroot'})].concat(getBuildCompileArray(_path)).concat([gulp.dest('build')]);
            pump(_compileArray);
        }));
    cb();
})

gulp.task('watch', function(){
    gulp.watch('wwwroot/**/*.*', function(event){
        let _base = path.relative(event.path, './wwwroot')
        _base = path.resolve(event.path, _base)
        lr.changed({
            body: {
                files: [_base]
            }
        });
    })
})

function getBuildCompileArray(filepath){
    let _ret = [];
    let _extname = path.extname(filepath);
    switch (_extname){
        case '.shtml':
            _ret = [
                shtml({
                    wwwroot: './wwwroot'
                }),
                replace(/(\s+href="\S+?)(?:\.scss|\.sass|\.less)"/g, function(){
                    return arguments[1] + '.css"';
                }),
                rename(function (path) {
                    path.extname = ".html"
                }),
            ];
            break;
        case '.js':
            _ret = [
                babel({
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }),
                browserify({
                    insertGlobals : true
                }),
                uglify({
                    output: {
                        quote_keys: true
                    }
                }),
            ];
            break;
        case '.sass':
        case '.scss':
            _ret = [
                gulp_sass(),
                minifyCss(),
            ];
            break;
        case '.jpg':
        case '.png':
        case '.gif':
            _ret = [
                imagemin(),
            ];
            break;
        default :
            break;
    }
    return _ret;
}

function getLiveCompileArray(filepath){
    let _ret = [];
    let _extname = path.extname(filepath);
    switch (_extname){
        case '.shtml':
            _ret = [
                shtml({
                    wwwroot: './wwwroot'
                }),
            ];
            break;
        case '.sass':
        case '.scss':
            _ret = [
                //rename to avoid that sass would skip compiling if file name is started with "_"
                rename({
                    basename: 'anyname'
                }),
                gulp_sass(),
            ];
            break;
        case '.js':
            _ret = [
                babel({
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }),
                /*browserify({
                    insertGlobals : true
                }),*/
            ];
            break;
        default :
            break;
    }
    return _ret;
}

function getMimeType(filepath){
    let _ret = '';
    let _extname = path.extname(filepath);
    switch (_extname){
        case '.scss':
            _ret = 'text/css; charset=utf-8';
            break;
        default :
            _ret = mimeTypes.lookup(filepath);
            break;
    }
    return _ret;
}