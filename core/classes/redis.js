var redis = require("redis"),
	client = redis.createClient();

client.on("error", function(err) {
	console.log("Redis ERROR  " + err);
});


/**
 * Get auth\reg code
 * @param  {string} type authcode\regcode
 * @param  {string} login Login
 * @return {integer}     Code
 */
const getCode = (type = 'authcode', login) => {
	return new Promise((resolve, reject) => {
		client.get(`${type}.${login}`, (err, repl) => err ? reject(err) : resolve(repl))
	});
};
const setCode = (type = 'authcode', login, code, time = 360) => {
	return new Promise((resolve, reject) => {
		client.set(`${type}.${login}`, code, 'EX', time);
		resolve(true);
	});
}

const addUploadToken = (token, userid) => {
	return new Promise((resolve, reject) => {
		client.set(`messenger.token.${token}`, userid, 10, () => resolve(true)); // todo найти нормальное время удаления
	});
}

module.exports = {getCode, setCode, addUploadToken};