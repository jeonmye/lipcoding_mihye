const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

function generateJwt(user) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: "lipcoding-mentormatch",
      sub: String(user.id),
      aud: "lipcoding-mentormatch-client",
      exp: now + 60 * 60, // 1시간
      nbf: now,
      iat: now,
      jti: uuidv4(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );
}

module.exports = { generateJwt };
