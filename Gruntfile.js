module.exports = function(grunt) {
  // configuration
  grunt.initConfig({
    mochaTest: {
      route: {
        options: {
          reporter: 'spec'
        },
        src: ['test/routes/**/*.js']
      },
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/**/*.js']
      }
    },
    shell: {
      migrate_up: {
        options: {
          stderr: false,
          stdout: false
        },
        command: function () {
          return './node_modules/db-migrate/bin/db-migrate up --env ' + process.env.NODE_ENV;
        }
      },
      migrate_down: {
        options: {
          stderr: false,
          stdout: false
        },
        command: function () {
          return './node_modules/db-migrate/bin/db-migrate down -c 9999 --env ' + process.env.NODE_ENV;
        }
      }
    },
    env: {
      coverage: {
        APP_DIR_FOR_CODE_COVERAGE: '../test/coverage/instrument/app/',
        NODE_ENV : 'test',
        CF_SYS_DOMAIN : "localhost",
        CF_APPS_DOMAIN : "localhost"
      },
      test : {
        NODE_ENV : 'test',
        CF_SYS_DOMAIN : "localhost",
        CF_APPS_DOMAIN : "localhost"
      }
    },
    clean: {
      coverage: {
        src: ['test/coverage/']
      }
    },
    copy: {
      configs: {
        expand: true,
        flatten: true,
        src: ['config/*'],
        dest: 'test/coverage/instrument/config'
      },
      package : {
        expand: true,
        flatten: true,
        src: ['./package.json'],
        dest: 'test/coverage/instrument/'
      }
    },
    instrument: {
      files: 'app/**/*.js',
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument/'
      }
    },
    storeCoverage: {
      options: {
        dir: 'test/coverage/reports'
      }
    },
    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail'
      }
    },
    watch: {
      test : {
          files: [ 'app/**/*.js', 'test/**/*.js', "!test/coverage/**/*.js", "Gruntfile.js", "package.json"],
          tasks: ['test'],
          options: {
            debounceDelay: 3000,
          }
      },
      coverage : {
          files: ['app/**/*.js', 'test/routes/**/*.js','test/unit/**/*.js', 'test/**/*.js', "!test/coverage/**/*.js", "Gruntfile.js", "package.json"],
          tasks: ['coverage'],
          options: {
            debounceDelay: 5000,
          }
      }
    }
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-shell');


  grunt.registerTask('unitTest', ['env:test', 'mochaTest:unit']);

  grunt.registerTask('test', ['env:test', 'shell:migrate_up', 'mochaTest:route', 'mochaTest:unit', 'shell:migrate_down']);

  grunt.registerTask('integration', ['mochaTest:route']);

  grunt.registerTask('coverage', ['clean', 'env:coverage', 'copy:configs', 'copy:package',
    'instrument', 'test', 'storeCoverage', 'makeReport']);

};