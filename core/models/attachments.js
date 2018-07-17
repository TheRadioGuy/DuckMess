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
    hashKey: {
      type: DataType.STRING(64)
    },
    time: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    imageSmallInfo: {
      type: DataType.STRING,
      allowNull: true
    },
    imageMediumInfo: {
      type: DataType.STRING,
      allowNull: true
    },
    imageCompressedInfo: {
      type: DataType.STRING,
      allowNull: true
    },
    fileInfo: {
      type: DataType.STRING,
      allowNull: false
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