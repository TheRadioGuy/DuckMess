var redis = require("redis"),
	publishClient = redis.createClient(),
	client = redis.createClient();


publishClient.on("error", function(err) {
	console.log("PUSLISH Redis ERROR  " + err);
});

console.log('Init');

client.set('token_TOKEN', '1');

client.set('token_test', '2');


publishClient.publish("events_1", JSON.stringify({type:'message'}));

publishClient.publish("events_2", JSON.stringify({type:'new'}));