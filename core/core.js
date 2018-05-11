require('./database.js')().then((db)=>{
  global.db = db;
  console.log(global.db.models.users.findAll());
});
