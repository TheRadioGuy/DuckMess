module.exports = (sequelize, DataType) => {
  const Attachment = sequelize.define("attachments", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ownerId: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    original: {
      type: DataType.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    size_680: {
      type: DataType.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    size_86: {
      type: DataType.TEXT,
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

  return Attachment;
};