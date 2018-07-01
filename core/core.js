require('./database.js')().then((db) => {
  global.db = db;
  var redis = require("redis"), client = redis.createClient();
  global.redis = client;
  global.fs.readdirSync('./core/classes').forEach((file) => { // Import modules
    var classname = file.replace('.js', ''); // Filename without .js
    module.exports[classname] = require(`./classes/${file}`);
  });
});

global.toInt = int => isNaN(parseInt(int)) ? 0 : parseInt(int); // true magic

global.API = class {
  constructor(code, msg, is_error, secret) {
    this.code = code;
    this.msg = msg;
    this.error = is_error;
    this._secret = secret;
  }
  get r() { // server response
    return {
      code: this.code,
      msg: this.msg,
      error: this.error
    };
  }
}