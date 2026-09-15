const { Op } = require("sequelize");
const { Product, Interpretation } = require("../models");

// @desc Get all products with filters, search, and sorting
// @route GET /api/products
const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, medium, region, minPrice, maxPrice, sort } = req.query;

    const whereConditions = {};

    // Keyword search across title, artist, medium, region
    if (search && search.trim() !== "") {
      const q = `%${search.trim().toLowerCase()}%`;
      whereConditions[Op.or] = [
        { title: { [Op.like]: q } },
        { artist: { [Op.like]: q } },
        { medium: { [Op.like]: q } },
        { region: { [Op.like]: q } },
        { category: { [Op.like]: q } },
        { tags: { [Op.like]: q } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      whereConditions.category = category;
    }

    // Medium filter
    if (medium && medium !== "All") {
      whereConditions.medium = { [Op.like]: `%${medium}%` };
    }

    // Region filter
    if (region && region !== "All") {
      whereConditions.region = region;
    }

    // Price range filters (in PKR)
    if (minPrice || maxPrice) {
      whereConditions.pricePkr = {};
      if (minPrice) whereConditions.pricePkr[Op.gte] = parseInt(minPrice, 10);
      if (maxPrice) whereConditions.pricePkr[Op.lte] = parseInt(maxPrice, 10);
    }

    // Sorting
    let order = [["id", "ASC"]];
    if (sort === "priceAsc") {
      order = [["pricePkr", "ASC"]];
    } else if (sort === "priceDesc") {
      order = [["pricePkr", "DESC"]];
    } else if (sort === "yearDesc") {
      order = [["year", "DESC"]];
    } else if (sort === "titleAsc") {
      order = [["title", "ASC"]];
    }

    const products = await Product.findAll({
      where: whereConditions,
      order,
    });

    const parsedProducts = products.map((p) => ({
      ...p.toJSON(),
      tags: JSON.parse(p.tags || "[]"),
    }));

    return res.json({
      success: true,
      count: parsedProducts.length,
      products: parsedProducts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get featured artworks
// @route GET /api/products/featured
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { featured: true },
      limit: 6,
    });

    return res.json({
      success: true,
      count: products.length,
      products: products.map((p) => ({
        ...p.toJSON(),
        tags: JSON.parse(p.tags || "[]"),
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single product details + related pieces
// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Interpretation,
          as: "interpretations",
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found in the FISO collection.",
      });
    }

    // Find related artworks
    const related = await Product.findAll({
      where: {
        id: { [Op.ne]: product.id },
        [Op.or]: [
          { category: product.category },
          { region: product.region },
        ],
      },
      limit: 3,
    });

    return res.json({
      success: true,
      product: {
        ...product.toJSON(),
        tags: JSON.parse(product.tags || "[]"),
      },
      related: related.map((r) => ({
        ...r.toJSON(),
        tags: JSON.parse(r.tags || "[]"),
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get distinct metadata filter options
// @route GET /api/products/meta/filters
const getFilterOptions = async (req, res, next) => {
  try {
    const allProducts = await Product.findAll({
      attributes: ["category", "medium", "region", "pricePkr"],
    });

    const categories = [...new Set(allProducts.map((p) => p.category))];
    const regions = [...new Set(allProducts.map((p) => p.region))];
    const mediums = [
      "Wasli & Gouache",
      "Automotive Enamel & Metal",
      "Oil & Mixed Media",
      "Terracotta & Ceramic",
      "Textile & Embroidery",
      "Charcoal & Graphite",
    ];

    const maxPrice = Math.max(...allProducts.map((p) => p.pricePkr), 500000);
    const minPrice = Math.min(...allProducts.map((p) => p.pricePkr), 25000);

    return res.json({
      success: true,
      filters: {
        categories,
        regions,
        mediums,
        priceRange: { min: minPrice, max: maxPrice },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getFilterOptions,
};
