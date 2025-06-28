const Joi = require("joi");
// 요청 데이터 검증용 scaffold (예: Joi, express-validator 등으로 확장 가능)
module.exports = (schema) => (req, res, next) => {
  // XSS 방지: 모든 문자열 입력 escape (간단 예시)
  function escape(str) {
    return typeof str === "string"
      ? str.replace(
          /[&<>"]/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
            }[c] || c)
        )
      : str;
  }
  if (req.body && typeof req.body === "object") {
    for (const k in req.body) {
      if (typeof req.body[k] === "string") req.body[k] = escape(req.body[k]);
    }
  }
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
