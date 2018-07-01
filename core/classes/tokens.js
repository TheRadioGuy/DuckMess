const sha256 = require('sha256').x2;
const Tokens = global.db.models.tokens;
const DAY_TIME = 86400;

function _generateToken(login) {
	return sha256(login + Date.now() + (Math.random()) * 99999999999) + sha256(login + Date.now() + (Math.random()) * 99999999999 + 'Orexus');
}

async function addToken(login) {
	var token = _generateToken(login);
	let user = await global.db.models.users.findOne({
		where: {
			login
		},
		raw: true,
		attributes: ['id']
	});
	console.log(user);
	let user_id = user.id;
	let time = Math.floor(Date.now() / 1000),
		expires = time + DAY_TIME;

	Tokens.create({
		user_id,
		token,
		time,
		expires
	});
	return token;
}

async function getTokenInfo(token) {
	if(!token) return {empty:true};

	let info = await Tokens.findOne({
		where: {
			token
		},
		raw:true
	});
	if(!info) return {empty:true};
	else info.empty = false;

	return info;

}

module.exports = {
	addToken,
	getTokenInfo
};