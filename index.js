'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

module.exports = function () {
    var colors = require('colors');
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    var args = process.argv;
    var consolePath = process.cwd();
    var path = require('path');

    var _args = _toArray(args);

    var nodePath = _args[0];
    var scriptPath = _args[1];

    var params = _args.slice(2);

    if (!params || params.length < 1) {
        throw Error('No task to run');
    }
    var tasks = [];

    if (fs.existsSync(path.join(consolePath, '/rsc.config.js'))) {
        eval('tasks = ' + fs.readFileSync(path.join(consolePath, '/rsc.config.js'), 'utf8'));
    }

    var packageScripts;
    if (fs.existsSync(path.join(consolePath, '/package.json'))) {
        packageScripts = require(path.join(consolePath, '/package.json')).scripts;
    }

    if (packageScripts) {
        tasks = Object.assign(packageScripts, tasks);
    }

    var task = params.shift();

    if (task === 'list') {
        for (var key in tasks) {
            console.log(' - ' + key + (tasks[key].hasOwnProperty('description') ? ': ' + tasks[key].description : ''));
        }
        process.exit(0);
    }

    var command = tasks[task];

    if (command && (typeof command === 'undefined' ? 'undefined' : _typeof(command)) === 'object') {
        if (command.hasOwnProperty('command')) {
            command = command.command;
        } else {
            throw Error('Tasks ' + task + ' not has "command" property');
        }
    }

    if (command && typeof command === 'string') {
        run(command);
    } else if (command && command instanceof Function) {
        var result = command.apply(undefined, _toConsumableArray(params));

        if (result) {
            run(result);
        }
    } else {
        throw Error('Task ' + task + ' not found');
    }

    function run(cmd) {
        var running = spawn('sh', ['-c', cmd]);

        running.stdout.setEncoding('utf8');
        running.stdout.on('data', function (data) {
            console.log('> ' + paint(data.replace(/\n$/, "")));
        });

        running.on('error', function () {
            throw Error(arguments);
        });

        running.on('exit', function (code, signal) {
            var result = '';
            switch (code) {
                case 1:
                    result = 'Process ' + task + ' finished with errors';
                    throw Error(result.orange);
                case 127:
                    result = 'Process ' + task + ' finished with errors. Check if paths are corrects (global packages not allowed)';
                    throw Error(result.organe);
                default:
                    result = 'Process ' + task + ' finished';
                    console.log(result.green);
            }
        });
    }

    function paint(message) {
        quotes: {
            var matches = message.match(/\"([^\"]+)\"/gmi);
            if (!matches) {
                break quotes;
            }
            for (var i = 0; i < matches.length; i++) {
                message = message.replace(new RegExp(matches[i].toString(), 'g'), matches[i].orange);
            }
        }

        single: {
            var _matches = message.match(/\'([^\']+)\'/gmi);
            if (!_matches) {
                break single;
            }
            for (var _i = 0; _i < _matches.length; _i++) {
                message = message.replace(new RegExp(_matches[_i].toString(), 'g'), _matches[_i].blue);
            }
        }

        curly: {
            var _matches2 = message.match(/\{([^\{]+)\}/gmi);
            if (!_matches2) {
                break curly;
            }
            for (var _i2 = 0; _i2 < _matches2.length; _i2++) {
                message = message.replace(new RegExp(_matches2[_i2].toString(), 'g'), _matches2[_i2].blue);
            }
        }

        brackets: {
            var _matches3 = message.match(/\[([^\[]+)\]/gmi);
            if (!_matches3) {
                break brackets;
            }

            for (var _i3 = 0; _i3 < _matches3.length; _i3++) {
                var chain = _matches3[_i3].substr(1, _matches3[_i3].length - 2);
                console.log(chain);
                message = message.replace(new RegExp(chain, 'g'), chain.yellow);
            }
        }

        return message;
    }
};
