const Op = global.db.Sequelize.Op;
const Messages = global.db.models.messages;
const Dialogs = global.db.models.dialogs;
const Tokens = global.db.models.message_tokens;
const sha256 = require('sha256').x2;

async function getDialogs(userId) {
	/*let dialogs = await Dialogs.findAll({
		where: {
			owned_id: userId
		},
		include: [global.db.models.users],
		plain: true
	});*/

	let dialogs = await Dialogs.findAll({
		where: {
			owned_id: userId
		},
		raw: true
	});

	if (!dialogs) dialogs = [];

	{
		let isValueFound = false;

		/* Убираем диалоги когда мы писали самому себе */
		dialogs = dialogs.filter(dialog => {
			if (!isValueFound && dialog.author_id == userId) {
				isValueFound = true;
				return false;
			} else return true;
		});
	}

	let userPromises = [];

	dialogs.forEach(dialog => {
		let userInfoPromise = global.core.users.getUserInfo(dialog.to_id);
		userPromises.push(userInfoPromise);
	});

	let usersInfo = await Promise.all(userPromises);

	let newDialogs = dialogs.map((dialog, i) => {
		return Object.assign(dialog, usersInfo[i]);
	});


	

	return new API(0, newDialogs, 1);
}

/**
 * Отправляет сообщение в диалог
 * @param  {[type]} id         [description]
 * @param  {[type]} to         [description]
 * @param  {[type]} text       [description]
 * @param  {String} attachment [description]
 * @return {[type]}            [description]
 */
async function sendMessage(id, to, text, attachment='', toDialog=false) {
// todo отправка в диалог


let dialogOnePromise = Dialogs
  .findOrCreate({where: {owned_id: id, to_id:to}, defaults: {lastMessage: text, author_id:id, time:Math.floor(Date.now()/1000)}});

let dialogTwoPromise = Dialogs
  .findOrCreate({where: {owned_id: to, author_id:to}, defaults: {lastMessage: text, to_id:id, time:Math.floor(Date.now()/1000)}});

  let [dialogOne] = await dialogOnePromise;
  let [dialogTwo] = await dialogTwoPromise; // Чтобы распаралерить получение из бд

  let dialogOneObject = dialogOne.get({plain:true});
  let dialogTwoObject = dialogTwo.get({plain:true}); // @todo улучшить код

  let paramsToSender = {id:1, dialogId: dialogOneObject.id};
  let paramsToGetter = {id:1, message:text, attachment, dialogId: dialogTwoObject.id}; // todo, получение аватарки юзера в отдельной функции

  let msgFirstPromise = Messages.create({message:text, author_id:id, to_id:to, owned_id:id, time:Math.floor(Date.now()/1000), dialogId: dialogOneObject.id});
  let msgSecondPromise = Messages.create({message:text, author_id:to, to_id:id, owned_id:id, time:Math.floor(Date.now()/1000), dialogId: dialogTwoObject.id});

  let msgFirst = await msgFirstPromise;
  let msgSecond = await msgSecondPromise;

  paramsToSender.id = msgFirst.dataValues.id;
  paramsToGetter.id = msgSecond.dataValues.id;


  {
  	let userSockets = await _getWebSocketsByUserId(to);
  	console.log(userSockets);
  	userSockets.forEach((socketId) => global.core.io.to(socketId).emit('newMessage', paramsToGetter));
  }

  return new API(global.e.SEND_MESSAGE, paramsToSender, 0);
}

async function getMessages(id, dialogId, count, offset) {

	let messages = await Messages.findAll({
		where: {
			dialogId
		}
	});

	if (!messages) messages = [];

	return new API(0, messages, 1);
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
	return ids.map(({socket_id}) => socket_id);
}

module.exports = {
	sendMessage,
	getDialogs,
	getTokenToMessageConnect,
	_connectToWebSocket,
	_disconnectToWebSockets,
	_getWebSocketsByUserId,
	getMessages
};