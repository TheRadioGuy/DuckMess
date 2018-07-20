require('dotenv').config();

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
global.fs = require('fs-extra');
global.config = require('./core/config.js');
global.core = require('./core/core.js');
global.core.io = io;
global.e = require('./core/errors.js');
const port = process.env.PORT || 8080;
const compression = require('compression');
const sanitizer = require('sanitizer');
const bodyParser = require('body-parser'); // include module
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const async = require('async');
const NODE_ENV = 'test';
const path = require('path');
// Routing
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
app.use(compression());
app.use(cookieParser())
// app.use(express.static(__dirname + '/public'));
app.use(fileUpload({
  limits: {
    fileSize: 50 * 1024 * 1024
  },
}));

app.use('/images', express.static(__dirname + '/public/uploads' ));
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');


app.post('/uploadFile/:token', async function(req, res) {

  let {uploadsPath=0} = global.config.uploads;
  let {token=0} = req.params;

  console.log(uploadsPath);

  const {attachment} = req.files;
  const {join} = require('path');
  console.log(attachment); // the uploaded file object

  let uploaded = await attachment.mv(join(uploadsPath, attachment.name));
  
  let response = await global.core.attachments._addAttachment(0, attachment);
  if(!response) return res.send({is_error:1, msg:'Error'});
  else res.send(response);
});


app.get('/', (req, res)=>{
res.render('index', {});
});


app.post('/api/:method', async (req,res)=>{
  var method = req.params.method;
  var params = {};
  for(let param in req.body){
    params[param] = sanitizer.escape(req.body[param]);
  }
  console.log(params);

  switch(method){
    case 'account.exists':
    res.send((await global.core.users.isAccountExists(params.id)).r);
    break;
    case 'account.register':
    res.send((await global.core.users.registerAccount(params.login, params.firstName, params.email)).r);
    break;
    case 'account.authUser':
    res.send((await global.core.users.authUser(params.login)).r);
    break;
    case 'account.authCode':
    res.send((await global.core.users.checkAuthCode(params.login, params.code)).r);
    break;

    case 'messages.getDialogs':
    var userInfo = await global.core.tokens.getTokenInfo(params.token);
    if(userInfo.empty) return res.send(new API(666, 'Auth failed', 1));

    res.send((await global.core.messages.getDialogs(userInfo.id)).r);
    break;

    case 'messages.getTokenToMessageConnect':
    var userInfo = await global.core.tokens.getTokenInfo(params.token);
    if(userInfo.empty) return res.send(new API(666, 'Auth failed', 1));

    res.send((await global.core.messages.getTokenToMessageConnect(userInfo.id)).r);
    break;

    case 'messages.send':
    var userInfo = await global.core.tokens.getTokenInfo(params.token);
    if(userInfo.empty) return res.send(new API(666, 'Auth failed', 1));

    res.send((await global.core.messages.sendMessage(userInfo.id, params.to, params.text, params.attachment, params.toDialog)).r);
    break;

    case 'messages.get':
    var userInfo = await global.core.tokens.getTokenInfo(params.token);
    if(userInfo.empty) return res.send(new API(666, 'Auth failed', 1));

    res.send((await global.core.messages.getMessages(userInfo.id, params.dialogId, params.count, params.offset)).r);
    break;

    case 'users.get':
    res.send((await global.core.users.getUserInfo(params.userId, true)).r);
    break;



    case 'test.getModels':
    if(NODE_ENV != 'test') res.send('Method not found');
    res.send((await global.db.models[params.model].findAll({raw:true})));
    break;

    case 'test.evalCode':
    if(NODE_ENV != 'test') res.send('Method not found');
    res.send(eval(params.code));
    break;

    case 'utils.getPing':
    res.send('pong');
    break;
    case 'utils.getErrors':
    res.send(global.e);
    break;

  }
});


/* Not found handler */


app.use(function(req, res, next) {
  res.status(404).send('Page is not found');
});

io.use(async function(socket, next) {
  var handshakeData = socket.request;
  var token = handshakeData._query['token'];
  if(!token){
    socket.disconnect();
    next(new Error('not authorized'));
    return false;
  }
  const {id} = socket;
  console.log('token : ', token, ' id : ', id);
  let response = await global.core.messages._connectToWebSocket(token, id);

  if(!response){
    socket.disconnect();
    next(new Error('not authorized'));
    return false;
  }

  socket.token = token;
  console.log('Successful connect to msgs');
  next();
});

io.on('connection', async (socket)=>{
  const {id, token} = socket;
  socket.on('disconnect', ()=>{
    global.core.messages._disconnectToWebSockets(token);
  })

  console.log('connect');
});

function strstr(haystack, needle, bool) { // Find first occurrence of a string
  //
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

  var pos = 0;

  pos = haystack.indexOf(needle);
  if (pos == -1) {
    return false;
  } else {
    if (bool) {
      return haystack.substr(0, pos);
    } else {
      return haystack.slice(pos);
    }
  }
}


function forEach(data, callback) {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      callback(key, data[key]);
    }
  }
}



function isEmpty(obj) {

  // null and undefined are "empty"
  if (obj == null || obj == '') return true;


  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== "object") return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

server.listen(port, _ => console.log(`Server listening at port ${port}`));
