module.exports = (sequelize, DataType) => {
  const Message = sequelize.define("messages", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message: {
      type: DataType.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author_id: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    to_id: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    owned_id: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    dialogId:{
      type:DataType.INTEGER,
      allowNull: false
    },
    time: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    attachment: {
      type: DataType.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: (models) => {

      }
    }
  });

  return Message;
};
