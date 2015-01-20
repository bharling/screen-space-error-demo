module.exports = (grunt) ->
  
  grunt.initConfig
    
    coffee:
      compileJoined:
        options:
          join:true
        files:
          'build/js/main.js':
            [
              'src/coffee/init.coffee',
              'src/coffee/sse.coffee'
            ]
    watch:
      coffee:
        files: ['src/**/*.coffee']
        tasks:
          [
            'coffee'
          ]
            
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.registerTask 'default', ['coffee']
            
