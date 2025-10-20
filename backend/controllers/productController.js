const fs = require("fs").promises;
const path = require("path");

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

// Helper: Read products from file
const readProducts = async () => {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper: Write products to file
const writeProducts = async (products) => {
  const dir = path.dirname(PRODUCTS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

// Get all products (Staff view with full details)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    // Validation
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: "Name, price, and stock are required" });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ error: "Price and stock must be non-negative" });
    }

    const products = await readProducts();

    // Create new product
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || "",
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category || "General",
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.userEmail,
    };

    products.push(newProduct);
    await writeProducts(products);

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl } = req.body;

    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Validate if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: "Price must be non-negative" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: "Stock must be non-negative" });
    }

    // Update product
    products[productIndex] = {
      ...products[productIndex],
      name: name !== undefined ? name : products[productIndex].name,
      description: description !== undefined ? description : products[productIndex].description,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
      category: category !== undefined ? category : products[productIndex].category,
      imageUrl: imageUrl !== undefined ? imageUrl : products[productIndex].imageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: req.userEmail,
    };

    await writeProducts(products);

    res.json({
      message: "Product updated successfully",
      product: products[productIndex],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update product stock only
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    let newStock;
    const currentStock = products[productIndex].stock;

    switch (operation) {
      case 'add':
        newStock = currentStock + parseInt(stock);
        break;
      case 'subtract':
        newStock = currentStock - parseInt(stock);
        break;
      case 'set':
      default:
        newStock = parseInt(stock);
    }

    if (newStock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    products[productIndex].stock = newStock;
    products[productIndex].updatedAt = new Date().toISOString();
    products[productIndex].updatedBy = req.userEmail;

    await writeProducts(products);

    res.json({
      message: "Stock updated successfully",
      product: products[productIndex],
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await readProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    await writeProducts(products);

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
