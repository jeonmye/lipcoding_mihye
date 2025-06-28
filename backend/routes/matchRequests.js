const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const Joi = require("joi");
const validate = require("../middlewares/validate");

// 매칭 요청 생성
const matchRequestSchema = Joi.object({
  mentorId: Joi.number().required(),
  message: Joi.string().min(1).max(200).required(),
});
router.post(
  "/",
  validate(matchRequestSchema),
  matchController.createMatchRequest
);
// 받은 요청(멘토)
router.get("/incoming", matchController.getIncomingMatchRequests);
// 보낸 요청(멘티)
router.get("/outgoing", matchController.getOutgoingMatchRequests);
// 요청 수락/거절/취소
router.put("/:id/accept", matchController.acceptMatchRequest);
router.put("/:id/reject", matchController.rejectMatchRequest);
router.delete("/:id", matchController.cancelMatchRequest);

module.exports = router;
