const express = require("express");
const router = express.Router();

const { getAllUsers, deleteUser } = require("../controllers/userController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", protect, isAdmin, getAllUsers);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
