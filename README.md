# rsc

## summary

Run scripts from node like cmd alias using `rsc`

## installation

It needs to be installed globally: `npm install rsc -g`

## why

`rsc` can run scripts dynamically from javascript functions

## usage

Create `rsc.config.js` file in your directory. Example:

```
module.exports = {
    "demo": "echo 'hello world'",
    "hello": function(name){
        return "echo hello " + name;
    },
    "push": function(message){
        return "git add --all &&  git commit -m '" + message + "' && git push"
    },
    "search": function(toSearch){
        return "find . | grep " + toSearch;
    },
    "bye": {
        "command": "echo bye",
        "description": "Say bye"
    },
}
```

Call your scripts with `rsc {script name} [parameters]`
Examples:

```
rsc bye
rsc hello david
rsc push 'initial commit'
```

Also can call npm scripts (rsc.config.js has priority)

package.json:
```
...
"scripts" :{
    "server": "node server.js"
}
...

rsc server
```

## list

`list` is a reserved word that display list of scripts in rs.config and package.json

`rsc list`:

```
- demo
- hello
- push
- search
- bye: Say bye
- server

```

If script is object with description will see in list
