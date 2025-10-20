const fs = require("fs").promises;
const path = require("path");

const ORDERS_FILE = path.join(__dirname, "../data/orders.json");
const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

// Helper: Read orders from file
const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper: Write orders to file
const writeOrders = async (orders) => {
  const dir = path.dirname(ORDERS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

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
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

// Get all orders (Staff only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await readOrders();
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update order status (Staff only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const orders = await readOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    orders[orderIndex].updatedBy = req.userEmail;

    await writeOrders(orders);

    res.json({
      message: "Order status updated successfully",
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create order (Customer only)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const products = await readProducts();
    let totalAmount = 0;
    const orderItems = [];

    // Validate items and calculate total
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal,
      });

      // Reduce stock
      product.stock -= item.quantity;
    }

    // Update product stocks
    await writeProducts(products);

    // Create order
    const orders = await readOrders();
    const newOrder = {
      id: Date.now().toString(),
      customerId: req.userId,
      customerEmail: req.userEmail,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || "Not provided",
      paymentMethod: paymentMethod || "Cash on delivery",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await writeOrders(orders);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get customer's orders (Customer only)
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await readOrders();
    const customerOrders = orders.filter((o) => o.customerId === req.userId);

    res.json(customerOrders);
  } catch (error) {
    console.error("Get customer orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get order details (Customer only - their own orders)
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await readOrders();
    const order = orders.find((o) => o.id === id && o.customerId === req.userId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
