const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", protect, isAdmin, register);
router.post("/login", login);

module.exports = router;
