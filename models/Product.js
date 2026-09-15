const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artistBio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    defaultValue: 2024,
  },
  medium: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Gouache & Gold Leaf on Wasli", "Automotive Enamel on Repoussed Metal", "Oil & Calligraphic Mixed Media"
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false, // "Modern Miniature", "Truck Art Evolution", "Calligraphic Abstraction", "Indus Heritage", "Contemporary Expressionism", "Textile & Fiber"
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false, // "Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta", "Swat", "Cholistan"
  },
  dimensions: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "24 x 36 in (61 x 91.4 cm)"
  },
  pricePkr: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceUsd: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // Artworks are typically 1-of-1 originals or limited editions
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  aboutPiece: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  criticalStatement: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  provenance: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  framingStatus: {
    type: DataTypes.STRING,
    defaultValue: "Museum Glass & Teak Wood Frame Included",
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  wallMockupUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.TEXT, // JSON array string e.g. '["Miniature", "Neo-Wasli", "Gold Leaf"]'
    defaultValue: "[]",
  }
});

module.exports = Product;
