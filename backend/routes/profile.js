const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const Joi = require("joi");
const validate = require("../middlewares/validate");

// 프로필 조회
router.get("/", profileController.getProfile);

// 프로필 수정
const profileSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().min(2).max(30).required(),
  role: Joi.string().valid("mentor", "mentee").required(),
  bio: Joi.string().max(200).allow(""),
  image: Joi.string()
    .base64()
    .max(1024 * 1024)
    .allow(null, ""), // 1MB 제한
  skills: Joi.when("role", {
    is: "mentor",
    then: Joi.array().items(Joi.string().max(20)).max(10),
    otherwise: Joi.forbidden(),
  }),
});
router.put("/", validate(profileSchema), profileController.updateProfile);

module.exports = router;
