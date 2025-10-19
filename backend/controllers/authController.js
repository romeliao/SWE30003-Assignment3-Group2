const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const USERS_FILE = path.join(__dirname, "../data/users.json");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Helper: Read users from file
const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

// Helper: Write users to file
const writeUsers = async (users) => {
  const dir = path.dirname(USERS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Read existing users
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await readUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
exports.getUser = async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      phone: phone || users[userIndex].phone,
      address: address || users[userIndex].address,
      updatedAt: new Date().toISOString(),
    };

    await writeUsers(users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};