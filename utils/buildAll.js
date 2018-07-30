/*
Build all modules
 */

const fs = require('fs');
const {
	join
} = require('path');
const sourcesDir = join(__dirname, '..', 'sources', 'go');
const dirs = fs.readdirSync(sourcesDir);

dirs.forEach(async (projectName) => {
	try {
		console.log('\x1b[36m%s\x1b[0m', `==> Build ${projectName}..`);
		await require(join(sourcesDir, projectName, 'build.js')).build(join(sourcesDir, projectName));
		console.log('\x1b[32m%s\x1b[0m', `==> Builded ${projectName}!`);
	} catch (e) {
		console.log('\x1b[31m%s\x1b[0m', `Errors : `, e);
	}
});