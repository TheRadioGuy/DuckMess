const Op = global.db.Sequelize.Op;
const Messages = global.db.models.messages;
const Dialogs = global.db.models.dialogs;
const Tokens = global.db.models.message_tokens;
const sha256 = require('sha256').x2;

async function getDialogs(userId) {
	let dialogs = await Dialogs.findAll({
		where: {
			owned_id: userId
		},
		include: [global.db.models.users],
		plain: true
	});

	if (!dialogs) dialogs = [];

	return new API(0, dialogs, 1);
}

async function sendMessage(id) {

}

async function getTokenToMessageConnect(id) {
	let token = sha256((Math.random() * 9999999999 + id + Date.now()).toString()) + sha256((Math.random() * 9999999999 + id + Date.now()).toString());
	await Tokens.create({
		user_id: id,
		token
	});
	return new API(0, {
		token
	}, 1);
}

async function _connectToWebSocket(token, socketId) {
	var response = await Tokens.update({
		is_active: 1,
		socket_id: socketId
	}, {
		where: {
			token
		}
	});
	if (response.includes(1)) return true;
	else return false;

}

async function _disconnectToWebSockets(token) {
	Tokens.destroy({
		where: {
			token
		}
	});
}

async function _getWebSocketsByUserId(id) {
	let ids = await Tokens.findAll({
		where: {
			user_id: id
		},
		raw:true
	});
	return ids.map((value)=>{
		let id = value.socket_id;
		return id;
	});
}

module.exports = {
	getDialogs,
	getTokenToMessageConnect,
	_connectToWebSocket,
	_disconnectToWebSockets,
	_getWebSocketsByUserId
};