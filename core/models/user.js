module.exports = (sequelize, DataType) => {
  const User = sequelize.define("users", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    image: {
      type: DataType.STRING,
      defaultValue: 'default'
    },
    login: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    rights: {
      type: DataType.STRING,
      defaultValue: 1
    }
  }, {
    classMethods: {
      associate: (models) => {

      }
    }
  });

  return User;
};
