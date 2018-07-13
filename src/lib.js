const { spawn } = require('child_process');
const path = require('path');
const colors = require('colors');
const escape = require('escape-string-regexp');

module.exports = function() {
  const args = process.argv;
  const consolePath = process.cwd();
  const params = args.slice(2);

  if (!params || params.length < 1) {
    console.log('No task to run'.red);
    return;
  }
  const tasks = require(path.join(consolePath, '/rsc.config.js'));
  const packageScripts = require(path.join(consolePath, '/package.json')).scripts;

  if (packageScripts) Object.assign(tasks, packageScripts);
  const task = params.shift();

  if (task === 'list') return showList(tasks);
  let command = tasks[task];

  if (command && typeof command === 'object') command = getCommand(task, command);
  if (typeof command === 'function') command = command(...params);
  if (typeof command !== 'string') {
    console.log(`Task '${task}' not found`.red);
    return;
  }

  run(task, command);
};

function showList(tasks) {
  for (const key in tasks) {
    console.log(
      ' - ' + key + (tasks[key].hasOwnProperty('description') ? ': ' + tasks[key].description : '')
    );
  }
  process.exit(0);
}

function getCommand(task, command) {
  if (command.hasOwnProperty('command')) return command.command;
  else {
    console.log(`Tasks '${task}' not has "command" property`);
    return;
  }
}

function run(task, cmd) {
  let running = spawn('sh', ['-c', cmd]);

  running.stdout.setEncoding('utf8');
  running.stdout.on('data', data => console.log('> ' + paint(data.replace(/\n$/, ''))));

  running.stderr.on('error', function(...args) {
    throw Error(args);
  });

  running.on('exit', code => {
    let result = `Process '${task}' finished `;
    console.log(`Exit code: ${code}`);
    switch (code) {
      case 1:
        result += `with errors`;
        console.log(colors.yellow(result));
        break;
      case 127:
        result += `with errors. Check if paths are corrects (global packages not allowed)`;
        console.log(colors.yellow(result));
        break;
      default:
        console.log(result.green);
    }
  });
}

function replaceWith(message, regex, color = 'blue') {
  const matches = message.match(regex);
  if (matches)
    for (const match of matches) {
      const chain = match.substr(1, match.length - 2);
      message = message.replace(new RegExp(escape(chain), 'g'), colors[color](chain));
    }

  return message;
}

function paint(message) {
  message = replaceWith(message, /"([^"]+)"/gim, 'yellow');
  message = replaceWith(message, /'([^']+)'/gim, 'green');
  message = replaceWith(message, /\(([^(]+)\)/gim, 'blue');
  message = replaceWith(message, /\{([^{]+)\}/gim, 'red');
  message = replaceWith(message, /\[([^[]+)\]/gim, 'yellow');

  return message;
}
