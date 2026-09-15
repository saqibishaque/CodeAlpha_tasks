const sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const Interpretation = require("./Interpretation");

// Relationships
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(Interpretation, { foreignKey: "artworkId", as: "interpretations" });
Interpretation.belongsTo(Product, { foreignKey: "artworkId", as: "artwork" });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  Interpretation,
};
