const db = require("../models/initDb");
const { validateProfileImage } = require("../utils/imageValidate");

exports.getProfile = (req, res) => {
  // ...기존 scaffold...
  res.status(501).json({ message: "Not implemented" });
};

exports.updateProfile = async (req, res) => {
  const userId = req.user && req.user.sub;
  if (!userId) return res.status(401).json({ error: "인증 정보 없음" });
  const { id, name, role, bio, image, skills } = req.body;
  if (!id || !name || !role)
    return res.status(400).json({ error: "필수 항목 누락" });
  if (parseInt(userId) !== parseInt(id))
    return res.status(401).json({ error: "본인만 수정 가능" });
  // 이미지(base64) 저장 및 명세 검증
  let imageBuffer = null;
  let imageType = null;
  if (image) {
    try {
      const result = await validateProfileImage(image);
      if (!result.ok) return res.status(400).json({ error: result.error });
      imageBuffer = result.buffer;
      imageType = result.type;
    } catch (e) {
      return res.status(400).json({ error: "이미지 인코딩/검증 오류" });
    }
  }
  const updateSql = `UPDATE users SET name=?, bio=?, image=?, imageType=?, skills=? WHERE id=?`;
  db.run(
    updateSql,
    [
      name,
      bio || "",
      imageBuffer,
      imageType,
      role === "mentor" ? JSON.stringify(skills || []) : null,
      id,
    ],
    function (err) {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err || !user)
          return res
            .status(500)
            .json({ error: "DB 오류", details: err && err.message });
        const profile = {
          name: user.name,
          bio: user.bio || "",
          imageUrl: `/api/images/${user.role}/${user.id}`,
        };
        if (user.role === "mentor") {
          profile.skills = user.skills ? JSON.parse(user.skills) : [];
        }
        res.json({
          id: user.id,
          email: user.email,
          role: user.role,
          profile,
        });
      });
    }
  );
};
