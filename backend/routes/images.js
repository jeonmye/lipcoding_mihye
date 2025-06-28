const express = require("express");
const router = express.Router();
const imagesController = require("../controllers/imagesController");

// 프로필 이미지 조회
router.get("/:role/:id", imagesController.getProfileImage);

module.exports = router;
