const { Order, Product, User } = require("../models");

// @desc Create a new gallery acquisition order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      courier,
      paymentMethod,
      items,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required order information. Please complete all required fields.",
      });
    }

    // Verify items and compute subtotal
    let subtotalPkr = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId || item.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Artwork ID ${item.productId || item.id} is no longer available in the catalog.`,
        });
      }

      const qty = parseInt(item.quantity || 1, 10);
      subtotalPkr += product.pricePkr * qty;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        artist: product.artist,
        medium: product.medium,
        pricePkr: product.pricePkr,
        priceUsd: product.priceUsd,
        quantity: qty,
        imageUrl: product.imageUrl,
      });
    }

    // Shipping logic: Free white-glove courier for orders >= PKR 100,000, else PKR 2,500
    const shippingFeePkr = subtotalPkr >= 100000 ? 0 : 2500;
    const totalPkr = subtotalPkr + shippingFeePkr;

    // Generate unique Gallery acquisition order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FISO-${new Date().getFullYear()}-${randomSuffix}`;
    const trackingCode = `TCS-FINEART-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const order = await Order.create({
      orderNumber,
      userId: req.user ? req.user.id : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      courier: courier || "TCS Art Express (Insured Fine Art Logistics)",
      paymentMethod: paymentMethod || "Credit / Debit Card (Simulated 3D Secure)",
      items: JSON.stringify(validatedItems),
      subtotalPkr,
      shippingFeePkr,
      totalPkr,
      status: "Confirmed",
      trackingCode,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully. Thank you for acquiring fine contemporary Pakistani art.",
      order: {
        ...order.toJSON(),
        items: validatedItems,
        shippingAddress: typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get Order details by orderNumber or id
// @route GET /api/orders/:identifier
const getOrderById = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);
    const where = isNumeric ? { id: identifier } : { orderNumber: identifier };

    const order = await Order.findOne({ where });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      order: {
        ...order.toJSON(),
        items: JSON.parse(order.items || "[]"),
        shippingAddress: JSON.parse(order.shippingAddress || "{}"),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current user orders
// @route GET /api/orders/user/my-orders
const getUserOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      orders: orders.map((o) => ({
        ...o.toJSON(),
        items: JSON.parse(o.items || "[]"),
        shippingAddress: JSON.parse(o.shippingAddress || "{}"),
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
};
