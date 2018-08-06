const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

const {unlink:unlinkFile} = require('fs-extra');
const {uploadsPath} = global.config.uploads;

	const Op = global.db.Sequelize.Op;
	const Attachments = global.db.models.attachments;
	const uuidv4 = require('uuid/v4');

	/**
	 * Загружает аттачмент
	 * @param {intenger} id   Айди аттачмента
	 * @param {mixed} file Объект фотографии: {name, mimetype}
	 */
	async function _addAttachment(id, file) {
		var response;

		const types = {image:'image'};

		let fileMimeType = file.mimetype.split('/')[0];
		let filetype = types[fileMimeType];
		if(!filetype) filetype = 'document';
		file.type = filetype;
		console.log(filetype);

		if(filetype == 'image'){
			response = await _writeAsPhoto(id, file);
		}
		else{
			return {is_error:1, msg:'unsuppoerted'};
		}



		return response;

		async function _writeAsDocument(id, file){
			let name = uuidv4();
		}

		async function _writeAsPhoto(id, file){
			try {
				let name = uuidv4();
				let filename = file.name;
				let photos = await _processPhoto(filename, name);

			let attachment = await Attachments.create({
				ownerId: id,
				hashKey: file.md5,
				time: Math.floor(Date.now() / 1000),
				imageSmallInfo: `${photos.size_68.width}, ${photos.size_68.height}, ${photos.size_68.path}`,
				imageMediumInfo: `${photos.size_525.width}, ${photos.size_525.height}, ${photos.size_525.path}`,
				imageCompressedInfo: `${photos.compressed.width}, ${photos.compressed.height}, ${photos.compressed.path}`,
				fileInfo:`${filename}, ${photos.compressed.path}`,
				type:file.type
			});

			console.log(attachment.getImageInfo('imageSmallInfo'));
			let photoId = attachment.get({plain:true}).id;

			photos.info = {id:photoId};

			return photos;
			}
			catch(e){
				console.log(e);
				return false;
			}

		}

		// Attachments.create({ownerId:id, hashKey:'test', time:Math.floor(Date.now()/1000)});
	}

	async function generateToken(id){
		if(!id) return;
		let token = uuidv4();

		await global.core.redis.addUploadToken(token, id);

		return new API(0, token, 0);
	}

	module.exports = {_addAttachment, generateToken};
	// _addAttachment(0, 'default.jpg').then(r=>console.log(r));


async function _processPhoto(file, name) {
	// @todo, убогий говнокод
	var sharp = require('sharp');
	var {
		join,
		basename,
		extname
	} = require('path');


	let filePath = join(uploadsPath, file);

	let photos = {};


	let compressedImagePath = join(uploadsPath, `${name}_compress.jpg`);

	let compressedImage = await sharp(filePath).jpeg({
		quality: 70,
		chromaSubsampling: '4:4:4'
	}).toFile(compressedImagePath); // берем как оригинальное изображение, так как ширина одинаковая

	let promiseSmallSize = sharp(compressedImagePath).resize(68, 68).toFile(join(uploadsPath, `${name}_compress_68.jpg`));
	let promiseMediumSize = sharp(compressedImagePath).resize(525, 525).toFile(join(uploadsPath, `${name}_compress_525.jpg`));


	let size_68 = await promiseSmallSize;
	let size_525 = await promiseMediumSize;
	let compressed = await compressedImage;

	photos.size_68 = Object.assign(size_68, {path:`${name}_compress_68.jpg`});
	photos.size_525 = Object.assign(size_525, {path:`${name}_compress_525.jpg`});
	photos.compressed = Object.assign(compressed, {path:`${name}_compress.jpg`});

	unlinkFile(filePath, err=>{
		if(err) throw new err;
	});

	return photos;
}
