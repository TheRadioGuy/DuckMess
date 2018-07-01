const Op = global.db.Sequelize.Op;
const Messages = global.db.models.messages;
const Dialogs = global.db.models.dialogs;

async function getDialogs(userId) {
	let dialogs = await Dialogs.findAll({
		where: {
			owned_id: userId
		},
		include: [ global.db.models.users ],
		plain:true
	});

	if(!dialogs) dialogs = [];

	return new API(0, dialogs, 1);
}

async function sendMessage(id){

}

module.exports = {getDialogs};