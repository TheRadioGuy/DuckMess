module.exports = _ => {
  return new Promise((resolve, reject) => {
    const Sequelize = require('sequelize');
    const path = require('path');

    const sequelize = new Sequelize(global.config.db.database, global.config.db.username, global.config.db.password, global.config.db.sequelize);
    sequelize.authenticate().then(() => {
      let db = {
        sequelize,
        Sequelize,
        models: {}
      };

      const dir = path.join(__dirname, "models");
      global.fs.readdirSync(dir).forEach(file => {
        const modelDir = path.join(dir, file);
        const model = sequelize.import(modelDir);
        db.models[model.name] = model;

      });

     // db.models.dialogs.belongsTo(db.models.users, {foreignKey:'owned_id'});
      /*db.models.users.hasMany(db.models.dialogs, {foreignKey:'owned_id'});*/

      let force = false;
      if(process.argv[3]=="true") force = true;
      sequelize.sync({force}).then(_ => resolve(db)).catch(e => reject(e))

    }).catch(e => reject(e));
  });




  // Object.keys(db.models).forEach(key => {
  //   console.log(db.models[key]);
  //   db.models[key].associate(db.models);
  // });


}
