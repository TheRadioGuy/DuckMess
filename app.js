// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
global.core = require('./core/core.js');
global.config = require('./core/config.js');
const port = process.env.PORT || 8080;
const fs = require('fs-extra');

const compression = require('compression');
const fileUpload = require('express-fileupload');
const sanitizer = require('sanitizer');
const bodyParser = require('body-parser'); // include module
const cookieParser = require('cookie-parser');

const async = require('async');


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

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');



app.get('/', (req, res)=>{
res.render('index', {});
})



/* Not found handler */


app.use(function(req, res, next) {
  res.status(404).send('Page is not found');
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