const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Interpretation = sequelize.define("Interpretation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  artworkId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  promptTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: "Lahore",
  },
  interpretationText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

module.exports = Interpretation;
