const fs = require("fs").promises;
const path = require("path");

const USERS_FILE = path.join(__dirname, "../data/users.json");
const ORDERS_FILE = path.join(__dirname, "../data/orders.json");

// Helper: Read users from file
const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper: Read orders from file
const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Get all customers (Staff only)
exports.getAllCustomers = async (req, res) => {
  try {
    const users = await readUsers();
    const customers = users
      .filter((u) => u.role === "customer")
      .map(({ password, ...customer }) => customer);

    res.json(customers);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get customer details with order history (Staff only)
exports.getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await readUsers();
    const user = users.find((u) => u.id === id && u.role === "customer");

    if (!user) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = await readOrders();
    const customerOrders = orders.filter((o) => o.customerId === id);

    const { password, ...customerData } = user;

    res.json({
      ...customerData,
      orders: customerOrders,
      totalOrders: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
