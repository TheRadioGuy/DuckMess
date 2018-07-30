module.exports = (sequelize, DataType) => {
  const Attachment = sequelize.define("attachments_news", {
    Id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    OwnerId: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    HashKey: {
      type: DataType.STRING(64)
    },
    Time: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    FileInfo: {
      type: DataType.STRING,
      allowNull: true
    },
    Filepath: {
      type: DataType.STRING,
      allowNull: true
    },
    Doctypes: {
      type: DataType.STRING,
      allowNull: true
    }
  }, {
    getterMethods: {
      imageSmall() {
        let response;

        let [width, height, url] = this.imageSmallInfo.split(',');
        let smallSize = {
          width,
          height,
          url
        };

        return smallSize;
      }
    }
  });

  Attachment.prototype.getImageInfo = function(type) {
    let [width, height, url] = this[type].split(',');
    let smallSize = {
      width,
      height,
      url
    };
  };

  return Attachment;
};
