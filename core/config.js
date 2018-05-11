module.exports = {
	db:{
		database:'DuckMess',
		username:'postgres',
		password:'',
		sequelize:{
		  host: 'localhost',
		  dialect: 'postgres',

		  pool: {
		    max: 5,
		    min: 0,
		    acquire: 30000,
		    idle: 10000
		  }
		}
	}
};
