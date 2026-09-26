const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.TEXT, // JSON with address, city, province, postalCode, country
    allowNull: false,
  },
  courier: {
    type: DataTypes.STRING,
    defaultValue: "TCS Art Express (Insured Fine Art Courier)",
  },
  paymentMethod: {
    type: DataTypes.STRING, // "Credit / Debit Card (Simulated 3D Secure)", "Cash On Gallery Delivery (COD)", "Bank Wire Transfer"
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT, // JSON array of items: [{ productId, title, artist, pricePkr, priceUsd, quantity, imageUrl }]
    allowNull: false,
  },
  subtotalPkr: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  shippingFeePkr: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPkr: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Confirmed", // "Confirmed", "Curator Packing", "In Transit", "Delivered"
  },
  trackingCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order;
