'use strict';

module.exports = function(){
    const colors = require('colors');
    const spawn = require('child_process').spawn;
    const fs = require('fs');
    const args = process.argv;
    const consolePath = process.cwd();
    const path = require('path');

    const [nodePath, scriptPath, ...params] = args;
    if(!params || params.length < 1){
      throw Error('No task to run');
    }
    var tasks = [];

    if(fs.existsSync(path.join(consolePath, '/rsc.config.js'))){
        eval('tasks = ' + fs.readFileSync(path.join(consolePath, '/rsc.config.js'), 'utf8'));
    }

    var packageScripts;
    if(fs.existsSync(path.join(consolePath, '/package.json'))){
      packageScripts = require(path.join(consolePath, '/package.json')).scripts;
    }

    if(packageScripts){
      tasks = Object.assign(packageScripts,tasks);
    }

    var task = params.shift();

    if(task === 'list'){
      for(let key in tasks){
          console.log(' - ' + key + (tasks[key].hasOwnProperty('description') ? (': ' + tasks[key].description): ''))
      }
      process.exit(0);
    }

    let command = tasks[task];

    if(command && typeof(command) === 'object'){
        if(command.hasOwnProperty('command')){
            command = command.command;
        } else {
            throw Error('Tasks ' + task + ' not has "command" property');
        }
    }

    if(command && typeof(command) === 'string'){
      run(command);
    } else if(command && command instanceof Function){
      let result = command(...params);

      if(result){
        run(result);
      }
    }else {
      throw Error('Task ' + task + ' not found')
    }


    function run(cmd){
      let running = spawn('sh', ['-c', cmd])

      running.stdout.setEncoding('utf8');
      running.stdout.on('data', function(data){
        console.log('> ' + paint(data.replace(/\n$/, "")));
      })

      running.on('error', function(){
        throw Error(arguments);
      })

      running.on('exit', function(code, signal){
        let result = '';
        switch (code) {
          case 1:
            result = 'Process ' + task + ' finished with errors';
            throw Error(result.orange)
          case 127:
            result = 'Process ' + task + ' finished with errors. Check if paths are corrects (global packages not allowed)';
            throw Error(result.organe)
          default:
            result = 'Process ' + task + ' finished';
            console.log(result.green)
        }
      })
    }


    function paint(message){
      quotes: {
          let matches = message.match(/\"([^\"]+)\"/gmi);
          if(!matches){
              break quotes;
          }
          for(let i = 0; i < matches.length; i++){
              message = message.replace(new RegExp(matches[i].toString(),'g'), matches[i].orange);
          }
      }

      single: {
          let matches = message.match(/\'([^\']+)\'/gmi);
          if(!matches){
              break single;
          }
          for(let i = 0; i < matches.length; i++){
              message = message.replace(new RegExp(matches[i].toString(),'g'), matches[i].blue);
          }
      }

      curly: {
          let matches = message.match(/\{([^\{]+)\}/gmi);
          if(!matches){
              break curly;
          }
          for(let i = 0; i < matches.length; i++){
              message = message.replace(new RegExp(matches[i].toString(),'g'), matches[i].blue);
          }
      }

      brackets: {
          let matches = message.match(/\[([^\[]+)\]/gmi);
          if(!matches){
              break brackets;
          }

          for(let i = 0; i < matches.length; i++){
              let chain = matches[i].substr(1,matches[i].length - 2)
              console.log(chain);
              message = message.replace(new RegExp(chain,'g'), chain.yellow);
          }
      }

      return message;
    }
};
