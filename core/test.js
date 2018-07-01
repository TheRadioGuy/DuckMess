var redis = require("redis"),
	client = redis.createClient();
client.on("error", function(err) {
	console.log("Redis ERROR  " + err);
});



/*client.hkeys("authcode.DuckerMan", (err, replies) => {
	replies.forEach((reply, i) => {
		console.log(reply);
	});
	client.quit();
});*/


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
const setCode = (type = 'authcode', login, code, time=360) => {
	return new Promise((resolve, reject) => {
		client.set(`${type}.${login}`, code, 'EX', time);
		resolve(true);
	});
}

getCode(undefined, 'DuckerMan',57537).then(r=>console.log(r))