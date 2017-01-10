# webweaver
A gulp-based tool for static webpage weaving

# Install

```
npm install
```

# Instructions

Integrate some frequently used plugins to handle types of files.
Locate your files under 'wwwroot' directory.
Write css with sass(scss), js with es6, html with shtml.
Delegate resources with appropriate plugin lines for development preview.
When building, the references like './css/style.scss' will be transformed to './css/style.css'.

##gulp scf

Scaffold.

##gulp dev

Start a simple proxy server for development with express, along with a livereload server. The 'wwwroot' directory will be regarded as the base directory.

##gulp build

Compile and build to 'build' directory.

##npm run build

Do what are the same with 'gulp build', but clear 'build' directory before compiling.