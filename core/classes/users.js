


async function isAccountExists(login){
if(!login) return new API(999, false, 0);
var user = await global.db.models.users.findOne({
  where: {login: login},
  attributes: ['login'],
  raw:true
});
if(!user) return new API(999, false, 0);
else return new API(999, true, 0);
}

module.exports.isAccountExists=isAccountExists;
