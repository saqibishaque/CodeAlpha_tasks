const jwt = require("jsonwebtoken");
const { User, Order, Product } = require("../models");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new Collector
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your full name, email, and a secure password.",
      });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "collector",
      favorites: "[]",
    });

    const token = createToken(user.id);

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.status(201).json({
      success: true,
      message: "Collector account created successfully. Welcome to FISO Gallery.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favorites: user.getFavoritesList(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Sign In Collector
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both your email address and password.",
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. No collector profile found with this email.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password provided.",
      });
    }

    const token = createToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}.`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favorites: user.getFavoritesList(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Sign Out Collector
// @route POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    message: "You have signed out of FISO Gallery.",
  });
};

// @desc Get Collector Profile & Order History & Saved Favorites
// @route GET /api/auth/me
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });

    const favoritesList = user.getFavoritesList();
    let favoriteProducts = [];
    if (favoritesList.length > 0) {
      favoriteProducts = await Product.findAll({
        where: { id: favoritesList },
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favorites: favoritesList,
      },
      orders: orders.map((o) => ({
        ...o.toJSON(),
        items: JSON.parse(o.items || "[]"),
        shippingAddress: JSON.parse(o.shippingAddress || "{}"),
      })),
      favoriteProducts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Toggle Art Favorite / Wishlist
// @route POST /api/auth/favorites/:productId
const toggleFavorite = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const user = await User.findByPk(req.user.id);
    let favs = user.getFavoritesList();

    const existsIndex = favs.indexOf(productId);
    let isFavorited = false;

    if (existsIndex > -1) {
      favs.splice(existsIndex, 1);
      isFavorited = false;
    } else {
      favs.push(productId);
      isFavorited = true;
    }

    user.favorites = JSON.stringify(favs);
    await user.save();

    return res.json({
      success: true,
      isFavorited,
      favorites: favs,
      message: isFavorited
        ? "Artwork added to your private Collector Shortlist."
        : "Artwork removed from your Collector Shortlist.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  toggleFavorite,
};
