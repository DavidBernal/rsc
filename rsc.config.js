module.exports = {
  demo: 'echo demo',
  object: {
    command: 'echo hello world',
    description: 'say hello'
  },
  ls: 'ls -a',
  search: toSearch => 'find . | grep ' + toSearch,
  push: function(message) {
    if (!message) {
      return "echo 'put a message'";
    } else {
      return "git add --all &&  git commit -m '" + message + "' && git push";
    }
  },
  async: (...params) => Promise.resolve().then(() => console.log('resolved', params))
};
