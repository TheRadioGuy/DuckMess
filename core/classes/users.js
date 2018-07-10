const Op = global.db.Sequelize.Op;
const Users = global.db.models.users;

async function isAccountExists(login) {
	if (!login) return new API(999, false, 0);
	var user = await Users.findOne({
		where: {
			login: login
		},
		attributes: ['login'],
		raw: true
	});

	if (!user) return new API(999, false, 0);
	else return new API(999, true, 0);
}

async function getUserInfo(userId, fromApi=false) {
	let user = await Users.findOne({
		where: {
			id: userId
		},
		attributes:['first_name', 'image', 'login'],
		raw:true
	});

	if(!user) user = {first_name:'Удаленный Аккаунт', image:'default', login:'deleted'};

	if(fromApi) return new API(0, user, 0);
	else return user; 


}
async function registerAccount(login, firstName, email) {
	var isFound = await Users.findOne({
		where: {
			[Op.or]: [{
				login: login
			}, {
				email: email
			}]
		}
	});

	if (isFound) return new API(global.e.ACCOUNT_EXISTS, 'User is exists', 1);

	let user = await Users.create({
		first_name: firstName,
		last_name: 1,
		email: email,
		rights: 1,
		login: login
	});

	console.log(user);

	let token = await global.core.tokens.addToken(login);
	return new API(global.e.SUCCESSFUL_REGISTER, {token}, 0);
}


async function authUser(login) {
	let isUserExists = await Users.findOne({
		where: {
			login: login,
		},
		raw: true
	});

	if (!isUserExists) return new API(global.e.ACCOUNT_ISNT_EXISTS, 'User isnt exists', 1);
	// if(isUserExists.rights <= 0) return new API(global.e.ACCOUNT_ISNT_EXISTS, 'Account is banned', 1);

	var code = _generateCode(login);
	console.log('code : ' + code);
	global.core.redis.setCode('authcode', login, code);
	return new API(global.e.AUTHCODE_NEEDED, 'You need authcode', 0);
}

async function checkAuthCode(login, userCode) {
	var code = await global.core.redis.getCode('authcode', login);
	if (!code) return new API(global.e.BAD_CODE, 'authcode is bad', 0);
	if (parseInt(userCode) != code) {
		var code = _generateCode(login);
		console.log('code : ' + code);
		global.core.redis.setCode('authcode', login, code);
		return new API(global.e.BAD_CODE, 'authcode is bad', 0);

	}
	global.core.redis.setCode('authcode', login, 'pass', 1);

	let token = await global.core.tokens.addToken(login);
	return new API(global.e.SUCCESSFUL_AUTH, {token}, 0);
}

async function testGetAllUsers() {
	var users = await Users.findAll({
		raw: true
	});
	return new API(0, users, 0);
}

function _generateCode(login) {
	let code = Math.round(Math.random() * 99999);
	if (code < 10000) {
		code = code + (10000 - code); // Делаем, чтобы код был 5-ти значный
		code = code + Math.random() * 89999; // Делаем, чтобы код не равнялся 10000
	}
	code = Math.round(code);
	return code;
}

module.exports = {
	checkAuthCode,
	authUser,
	testGetAllUsers,
	isAccountExists,
	registerAccount,
	getUserInfo
};