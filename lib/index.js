const { spawn } = require('child_process');
const path = require('path');
const colors = require('colors');
const escape = require('escape-string-regexp');

const messages = {
  noTasks: 'No task to run',
  noConfig: 'No rsc.config.js or package.json found',
  availableCommands: 'Available commands:'
};

const log = console.log;

const rsc = async function(...params) {
  const consolePath = process.cwd();

  if (!params || !params.length) {
    log(messages.noTasks.red);
    return;
  }

  let tasks;
  let packageScripts;
  try {
    tasks = require(path.join(consolePath, '/rsc.config.js'));
    packageScripts = require(path.join(consolePath, '/package.json')).scripts;
  } catch (err) {
    log(messages.noConfig.red);
    log((err && err.message) || err);
    return;
  }

  if (packageScripts) Object.assign(tasks, packageScripts);
  const task = params.shift();

  if (task === 'list') return showList(tasks);
  let command = tasks[task];

  if (command && typeof command === 'object') command = getCommand(task, command);
  if (typeof command === 'function') command = command(...params);
  if (command instanceof Promise) {
    await command;
    return;
  }
  if (typeof command !== 'string') {
    log(`Task '${task}' not found`.red);
    return;
  }

  run(task, command);
};

function showList(tasks) {
  log(messages.availableCommands);
  for (const key in tasks) {
    log(
      `\t- ${key} ${tasks[key].hasOwnProperty('description') ? ': ' + tasks[key].description : ''}`
    );
  }
  process.exit(0);
}

function getCommand(task, command) {
  if (command.hasOwnProperty('command')) return command.command;
  else {
    log(`Tasks '${task}' not has "command" property`);
    return;
  }
}

function run(task, cmd) {
  let running = spawn('sh', ['-c', cmd]);

  running.stdout.setEncoding('utf8');
  running.stdout.on('data', data => log('> ' + paint(data.replace(/\n$/, ''))));

  running.stderr.on('error', function(...args) {
    throw Error(args);
  });

  running.on('exit', code => {
    let result = `Process '${task}' finished `;
    log(`Exit code: ${code}`);
    switch (code) {
      case 1:
        result += `with errors`;
        log(colors.yellow(result));
        break;
      case 127:
        result += `with errors. Check if paths are corrects (global packages not allowed)`;
        log(colors.yellow(result));
        break;
      default:
        log(result.green);
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

if (!module.parent) {
  const params = process.argv.slice(2);
  rsc(params);
}

module.exports = rsc;
