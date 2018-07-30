module.exports.build = source => {

	return new Promise((resolve,reject)=>{
		const fs = require('fs');
		const {exec} = require('child_process');
		const {join} = require('path');

		const binPath = join(source, '..', '..', '..', 'builds', 'fileUploader');

		
		try{
			fs.unlinkSync(binPath);
		}
		catch(e){

		}
		

		exec(`go build -o ${binPath} ${join(source, 'main.go')} `, (err, stdout, stderr)=>{
			if(err || stderr) reject({err, stderr})
			resolve(true);
				
		});
	
	});
	
}