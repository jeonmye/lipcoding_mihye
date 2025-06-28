const express = require("express");
const router = express.Router();
const mentorsController = require("../controllers/mentorsController");
const Joi = require("joi");
const validate = require("../middlewares/validate");

// 멘토 리스트 조회
router.get("/", mentorsController.getMentors);

// 멘토 리스트 조회는 쿼리 파라미터 검증 필요시 추가 가능

module.exports = router;
