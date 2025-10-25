const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const USERS_FILE = path.join(__dirname, "../data/users.json");
const RESET_TOKENS_FILE = path.join(__dirname, "../data/resetTokens.json");
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

// Helper: Read reset tokens from file
const readResetTokens = async () => {
  try {
    const data = await fs.readFile(RESET_TOKENS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper: Write reset tokens to file
const writeResetTokens = async (tokens) => {
  const dir = path.dirname(RESET_TOKENS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2));
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, address, password, role } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate role (default to customer if not provided or invalid)
    const userRole = role === "staff" ? "staff" : "customer";

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
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);


    // Generate token with role
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

/// Login
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

    // Generate token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

// Forgot Password - Generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const users = await readUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ success: false, message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store token with expiration (1 hour)
    const tokens = await readResetTokens();
    const filteredTokens = tokens.filter((t) => t.email !== user.email);
    filteredTokens.push({
      email: user.email,
      token: hashedToken,
      expiresAt: Date.now() + 3600000, // 1 hour
      createdAt: new Date().toISOString(),
    });
    await writeResetTokens(filteredTokens);

    console.log("Mock Reset URL:", `http://localhost:3000/reset-password?token=${resetToken}`);

    // Send mock response
    res.json({
      success: true,
      message: "Mock reset link generated",
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Reset Password - Use token to reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const tokens = await readResetTokens();
    const tokenData = tokens.find(
      (t) => t.token === hashedToken && t.expiresAt > Date.now()
    );

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update password
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.email === tokenData.email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsers(users);

    // Remove used token
    const filteredTokens = tokens.filter((t) => t.token !== hashedToken);
    await writeResetTokens(filteredTokens);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};