const Op = global.db.Sequelize.Op;
const Attachments = global.db.models.attachments;

const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

async function addAttachment(id, photo){

}

async function _doWorker(){

}
module.exports = {addAttachment};