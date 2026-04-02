const Product = require("../models/Product");

// GET /api/products
// Filtros opcionais: ?category=cafe&available=true
const getAllProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = { $regex: req.query.category, $options: "i" };
    }

    if (req.query.available !== undefined) {
      filter.available = req.query.available === "true";
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produto", error: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Campos obrigatórios ausentes: name, description, price, category",
      });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "O preço deve ser um número não negativo" });
    }

    const product = await Product.create({ name, description, price, category, available });

    res.status(201).json(product);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Erro ao criar produto", error: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { price } = req.body;

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({ message: "O preço deve ser um número não negativo" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Erro ao atualizar produto", error: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover produto", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
