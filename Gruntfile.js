module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    ngdocs: {
      options: {
        scripts: ['angular.js', '../js/robot.js', '../js/commonModuke.js', '../js/propositionService.js', '../js/gameService.js',
			'../js/loggedApp.js', '../js/loggedAppCtrls.js', '../js/login.js'],
        html5Mode: false
      },
      all: ['js/**/*.js']
    },
	uglify: {
		my_target: {
			files: {
				'js/min/main.min.js': ['js/robot.js', 'js/commonModuke.js', 'js/propositionService.js', 'js/gameService.js', 
				'js/loggedApp.js', 'js/loggedAppCtrls.js', 'js/login.js']
			}
		}
	},
	jshint: {
		all: ['js/robot.js', 'js/commonModuke.js', 'js/propositionService.js', 'js/gameService.js', 
			'js/loggedApp.js', 'js/loggedAppCtrls.js', 'js/login.js']
	},
	connect: {
      options: {
        keepalive: true
      },
      server: {}
    },
    clean: ['docs']
  });

  grunt.registerTask('default', ['clean', 'ngdocs', 'connect']);

};