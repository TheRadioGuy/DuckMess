require('./database.js')().then((db)=>{
  global.db = db;
  console.log(global.db.models.users.findAll());
});

global.fs.readdirSync('./core/classes').forEach((file)=>{ // Import modules
  var classname =  file.replace('.js', ''); // Filename without .js
  module.exports[classname] = require(`./classes/${file}`);
});


global.toInt = int=>isNaN(parseInt(int)) ? 0 : parseInt(int); // true magic

global.API = class {
  constructor(code, msg, is_error, secret){
    this.code=code;
    this.msg=msg;
    this.error=is_error;
    this._secret = secret;
  }
  get r(){ // server response
    return JSON.stringify({code:this.code, msg:this.msg, error:this.error});
  }
}
