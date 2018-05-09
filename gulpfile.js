	const settings = {
		ftp: {
			use: false,
			host: 'host',
			user: 'user',
			pass: 'pass',
			upload: '/httpdocs'
		},
		src: {
			src: './project/src/',
			build: './project/build/',
			dist: './project/dist/'
		},
		concatLibs: true,
		concatJS: false,
		pug: true,
		css: 'sass',
		smartGrid: {
		    outputStyle: this.css, /* less || scss || sass || styl */
	   		columns: 12, /* number of grid columns */
	   	 	offset: '30px', /* gutter width px || % */
	    	mobileFirst: false,
		    container: {
		        maxWidth: '960px',
		        fields: '30px'
		    },
		    breakPoints: {
		        md: {
		            width: "992px",
		            fields: "20px"
		        },
		        sm: {
		            width: "720px",
		            fields: "10px"
		        },
		        xs: {
		            width: "576px",
		            fields: "5px"
		        },
		        xxs: {
		            width: "380px",
		            fields: "5px"
		        }
		    },
		    oldSizeStyle: false,
		    properties: [
		        'justify-content'
		    ]
		}
	},

	_ = settings;

// ###################### Requires ############################
	const   gulp    	 = require('gulp'),
			//for HTML
			pug     	 = _.pug ? require('gulp-pug') : false,
			htmlbea  	= require('gulp-html-beautify'),
			htmlmin  	= require('gulp-htmlmin'),

			//for CSS
			smartGrid   = require('smart-grid'),
			prefixer	= require('gulp-autoprefixer'),
		 	cleanCSS    = require('gulp-clean-css'),
		 	gcmq 		= require('gulp-group-css-media-queries'),
		 	cssbea      = require('gulp-cssbeautify'),
		 	concatCSS   = require('gulp-concat-css'),
			// for JS

			babel 		= require('gulp-babel'),
			uglify 		= require('gulp-uglify'),
			jsbea 		= require('gulp-jsbeautify'),
			concatJS	= require('gulp-concat'),
			// for img
			imagemin 	= require('gulp-imagemin'),

			// other
			runSequence = require('run-sequence').use(gulp),
			gulpif = require('gulp-if'),
		 	sourcemaps  = require('gulp-sourcemaps'),
			bs       	= require('browser-sync').create(),
			rimraf 		= require('gulp-rimraf'),
			cache    	= require('gulp-cache'),
			gutil       = require('gulp-util')
			ftp    		= require('vinyl-ftp');
	let		precss      = false;

	switch (_.css) {
		case 'sass':
			precss = require('gulp-sass');
			break;
		
		case 'scss':
			precss = require("gulp-sass");
			break;
		
		case 'less':
			precss = require("gulp-less");
			break;
		
		case 'styl':
			precss = require("gulp-stylus");
			break;
		
		default:
			precss = false;

	}

// ######################## HTML ##############################

	gulp.task('htmlBuild', () => {
		gulp.src(_.src.src + 'preHTML/*.pug')
			.pipe(sourcemaps.init())
			.pipe(pug().on('error', gutil.log))
			.pipe(htmlbea({indentSize: 2}))
			.pipe(sourcemaps.write('/maps'))
			.pipe(gulp.dest(_.src.build))

		gulp.src(_.src.src + 'HTML/*.html')
			.pipe(gulp.dest(_.src.build))
	})

	gulp.task('htmlDist', () => {
		gulp.src(_.src.src + 'preHTML/*.pug')
			.pipe(pug().on('error', gutil.log))
			.pipe(htmlmin())
			.pipe(gulp.dest(_.src.dist))

		gulp.src(_.src.src + 'HTML/*.html')
			.pipe(htmlmin())
			.pipe(gulp.dest(_.src.dist))
	})

// ######################### CSS ##############################

	gulp.task('cssBuild', () => {
		return gulp.src(_.src.src + 'preCSS/*.+(sass|scss|less|styl)')
			.pipe(sourcemaps.init())
			.pipe(precss().on('error', precss.logError))
	    	.pipe(gcmq())
	    	.pipe(prefixer({
	            browsers: ['last 2 versions'],
	            cascade: false
	        }))
	    	.pipe(cssbea())
	    	.pipe(sourcemaps.write('/maps'))
	    	.pipe(gulp.dest(_.src.build + 'css'))
	})

	gulp.task('cssDist', () => {
		return gulp.src(_.src.src + 'preCSS/*.+(sass|scss|less|styl)')
			.pipe(precss().on('error', precss.logError))
			.pipe(prefixer({
	            browsers: ['last 10 versions'],
	            cascade: false
	        }))
			.pipe(gcmq())
			.pipe(cleanCSS({debug: true, level: 2}, (details) => {
	     		 console.log(`${details.name}: ${details.stats.originalSize}`);
	     		 console.log(`${details.name}: ${details.stats.minifiedSize}`);
	    	}))
	    	.pipe(gulp.dest(_.src.dist + 'css'))
	})


	gulp.task('libsCssBuild', () => {
		return gulp.src(_.src.src + 'libsCSS/**/*.css')
			.pipe(sourcemaps.init())
			.pipe(gulpif(_.concatLibs, concatCSS('libs.css')))
			.pipe(cleanCSS({level: 2}))
			.pipe(sourcemaps.write('/maps'))
			.pipe(gulp.dest(_.src.build + 'libs'))
	})


	gulp.task('libsCssDist', () => {
		return gulp.src(_.src.src + 'libsCSS/**/*.css')
			.pipe(gulpif(_.concatLibs,concatCSS('libs.css')))
			.pipe(cleanCSS({level: 2}))
			.pipe(gulp.dest(_.src.dist + 'libs'))
	})

// ###################### JavaScript ##########################

	gulp.task('jsBuild', () => {
		return gulp.src(_.src.src + 'js/*.js')
			.pipe(sourcemaps.init())
			.pipe(babel({
	            	presets: ['env']
	        }).on('error', gutil.log))
	        .pipe(jsbea())
	        .pipe(sourcemaps.write('/maps'))
	        .pipe(gulp.dest(_.src.build + 'js'))

	})

	gulp.task('libsJsBuild', () => {
		return gulp.src(_.src.src + 'libsJS/**/*.js')
	    	.pipe(sourcemaps.init())
	    	.pipe(babel({
	            	presets: ['env']
	        }).on('error', gutil.log))
	    	.pipe(uglify().on('error', gutil.log))
	    	.pipe(gulpif(_.concatJS, concatJS('libs.js')))
	    	.pipe(sourcemaps.write('/maps'))
	    	.pipe(gulp.dest(_.src.build + 'libs'))
	})

	gulp.task('jsDist', () => {
		gulp.src(_.src.src + 'js/*.js')
			.pipe(babel({
	            	presets: ['env']
	        }).on('error', gutil.log))
			.pipe(uglify().on('error', gutil.log))
	        .pipe(gulp.dest(_.src.dist + 'js'))


	     gulp.src(_.src.src + 'libsJS/*/*.js')
	    	.pipe(gulpif(_.concatJS, concatJS('libs.js')))
	    	.pipe(uglify().on('error', gutil.log))
	    	.pipe(gulp.dest(_.src.dist + 'libs'))
	})

	gulp.task('libsJsDist', () => {
		return gulp.src(_.src.src + 'libsJS/**/*.js')
			.pipe(babel({
	            	presets: ['env']
	        }).on('error', gutil.log))
	    	.pipe(uglify().on('error', gutil.log))
	    	.pipe(concatJS('libs.js'))
	    	.pipe(gulp.dest(_.src.dist + 'libs'))
	})

// ######################## Image #############################

	gulp.task('imgBuild', () => {
		return gulp.src(_.src.src + '**/*.{gif,ico,jpg,png,svg}')
			.pipe(cache(
				imagemin([
						    imagemin.gifsicle({interlaced: true}),
						    imagemin.jpegtran({progressive: true}),
						    imagemin.optipng({optimizationLevel: 5}),
						    imagemin.svgo({
						        plugins: [
						            {removeViewBox: true},
						            {cleanupIDs: false}
						        ]
						    })
						])
				))
			.pipe(gulp.dest(_.src.build))
	})

	gulp.task('imgDist', () => {
		return gulp.src(_.src.src + '**/*.{gif,ico,jpg,png,svg}')
			.pipe(imagemin([
						    imagemin.gifsicle({interlaced: true}),
						    imagemin.jpegtran({progressive: true}),
						    imagemin.optipng({optimizationLevel: 5}),
						    imagemin.svgo({
						        plugins: [
						            {removeViewBox: true},
						            {cleanupIDs: false}
						        ]
						    })
						])
				)
			.pipe(gulp.dest(_.src.dist))
	})

// ######################## Fonts #############################
	
	gulp.task('fontBuild', () => {
		return gulp.src(_.src.src + 'fonts/**/*.*')
			.pipe(gulp.dest(_.src.build + 'fonts'))
	})

	gulp.task('fontDist', () => {
		return gulp.src(_.src.src + 'fonts/**/*.*')
			.pipe(gulp.dest(_.src.dist + 'fonts'))
	})

// ######################## Other #############################

	gulp.task('smartGrid', () => {
		smartGrid(_.src.src + 'preCSS/includes', _.smartGrid);
	});

	gulp.task('bs', function() {
	    bs.init({
	        server: {
	            baseDir: "./project/build/",
	        },
	         notify: false
	    });
	});

	gulp.task('clearBuild', () => {
		return gulp.src(_.src.build + '*', { read: false })
				   .pipe(rimraf())
	})

	gulp.task('clearDist', () => {
		return gulp.src(_.src.dist + '*', { read: false })
				   .pipe(rimraf())
		})

	gulp.task('ftp', () => {
		if (_.ftp.use) {
				var conn = ftp.create( {
					host: _.ftp.host,
					user: _.ftp.user,
					password: _.ftp.pass,
					parallel: 10,
					log:      gutil.log
				} );

				let globs = [_.src.dist + '**/*'];

				return gulp.src( globs, { base: './project/dist/', buffer: false } )
	        .pipe( conn.newer( _.ftp.upload ) ) 
	        .pipe( conn.dest( _.ftp.upload ) );
	    }

	})

// ######################## Watch #############################
	
	gulp.task('default',   () => {
	runSequence( 
				 'clearBuild' ,
				  ['htmlBuild', 
				  'cssBuild', 
  				  'jsBuild', 
  				  'imgBuild', 
  				  'fontBuild',
  				  'libsCssBuild',
  				  'libsJsBuild' ],
				  'bs'
		);
	gulp.watch(_.src.src + 'preHTML/**/*.pug', ['htmlBuild']);
	gulp.watch(_.src.src + 'HTML/**/*.html', ['htmlBuild']);
	gulp.watch(_.src.src + 'preCSS/**/*.*', ['cssBuild']);
	gulp.watch(_.src.src + 'js/**/*.*', ['jsBuild']);
	gulp.watch(_.src.src + 'fonts/**/*.*', ['fontBuild']);
	gulp.watch(_.src.src + 'img/**/*.*', ['imgBuild']);
	gulp.watch(_.src.src + 'libsJS/**/*.*', ['libsJsBuild']);
	gulp.watch(_.src.src + 'libsCSS/**/*.*', ['libsCssBuild']);
	gulp.watch(_.src.src + '**/*.*').on('change', bs.reload);
		});

// ###################### Ditribute ###########################
	gulp.task('dist', () => {
						  	runSequence(
						  		'clearDist',
						  		['htmlDist', 
						  		'cssDist', 
						  		'jsDist', 
						  		'imgDist', 
						  		'fontDist',
						  		'libsCssDist',
						 		'libsJsDist'],
						 		'ftp',
						 		() => {console.log('Complete')});
						  	
						  });

	