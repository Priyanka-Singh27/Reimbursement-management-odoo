const express = require("express");
const { scanReceipt } = require("../controllers/ocr.controller");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/scan", protect, upload.single("receipt"), scanReceipt);

module.exports = router;
