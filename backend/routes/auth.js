const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    getUser,
    updateUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

const { verifyToken, isStaff, isCustomer } = require('../middleware/authMiddleware');

const {
    getAllProducts,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
} = require('../controllers/productController');

const {
    getAllOrders,
    updateOrderStatus,
    createOrder,
    getCustomerOrders,
    getOrderDetails,
} = require('../controllers/orderController');

const {
    getAllCustomers,
    getCustomerDetails,
} = require('../controllers/customerController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Public route to view products (for catalogue page - accessible to everyone)
router.get('/products', getAllProducts);

// Protected routes (any authenticated user)
router.get('/user', verifyToken, getUser);
router.put('/user', verifyToken, updateUser);

// Staff-only routes for product management
router.get('/staff/products', verifyToken, isStaff, getAllProducts);
router.post('/staff/products', verifyToken, isStaff, addProduct);
router.put('/staff/products/:id', verifyToken, isStaff, updateProduct);
router.patch('/staff/products/:id/stock', verifyToken, isStaff, updateProductStock);
router.delete('/staff/products/:id', verifyToken, isStaff, deleteProduct);

// Staff-only routes for order management
router.get('/staff/orders', verifyToken, isStaff, getAllOrders);
router.put('/staff/orders/:id/status', verifyToken, isStaff, updateOrderStatus);

// Staff-only routes for customer management
router.get('/staff/customers', verifyToken, isStaff, getAllCustomers);
router.get('/staff/customers/:id', verifyToken, isStaff, getCustomerDetails);

// Customer-only routes
router.post('/customer/orders', verifyToken, isCustomer, createOrder);
router.get('/customer/orders', verifyToken, isCustomer, getCustomerOrders);
router.get('/customer/orders/:id', verifyToken, isCustomer, getOrderDetails);

module.exports = router;