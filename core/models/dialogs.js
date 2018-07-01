module.exports = (sequelize, DataType) => {
  const Dialog = sequelize.define("dialogs", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lastMessage: {
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
    time: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    classMethods: {
      associate: (models) => {

      }
    }
  });

  return Dialog;
};
