module.exports = (sequelize, DataType) => {
  const Token = sequelize.define("message_tokens", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    token: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    socket_id: {
      type: DataType.STRING,
      allowNull: true
    },
    is_active: {
      type: DataType.INTEGER,
      defaultValue:0
    }
  }, {
    classMethods: {
      associate: (models) => {

      }
    }
  });

  return Token;
};