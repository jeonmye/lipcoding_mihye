const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");
const Joi = require("joi");
const validate = require("../middlewares/validate");
const multer = require("multer");
const upload = multer(); // 메모리 저장

// 회원가입
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(32).required(),
  name: Joi.string().min(2).max(30).required(),
  role: Joi.string().valid("mentor", "mentee").required(),
  bio: Joi.string().allow("").optional(), // bio 허용
  skills: Joi.array().items(Joi.string()).optional(), // skills 허용
});
// 이미지 필드명 'image'만 허용
router.post(
  "/signup",
  upload.fields([{ name: "image", maxCount: 1 }]),
  (req, res, next) => {
    // multipart/form-data일 때 req.body.data에 JSON이 들어옴
    if (req.body.data) {
      try {
        const json = JSON.parse(req.body.data);
        req.body = { ...json };
      } catch (e) {
        return res.status(400).json({ error: "잘못된 데이터 형식" });
      }
    }
    // req.file -> req.files.image[0] 으로 변경
    if (req.files && req.files.image && req.files.image[0]) {
      req.file = req.files.image[0];
    }
    next();
  },
  validate(signupSchema),
  authController.signup
);
// 로그인
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(32).required(),
});
router.post("/login", validate(loginSchema), authController.login);
// 내 정보(JWT 필요)
router.get("/me", auth, authController.me);

module.exports = router;
