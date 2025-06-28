const db = require("../models/initDb");

// 프로필 이미지 반환 scaffold
exports.getProfileImage = (req, res) => {
  const { role, id } = req.params;
  db.get(
    "SELECT image, imageType FROM users WHERE id = ? AND role = ?",
    [id, role],
    (err, row) => {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      if (!row || !row.image) {
        // 기본 이미지 리다이렉트
        if (role === "mentor") {
          return res.redirect("https://placehold.co/500x500.jpg?text=MENTOR");
        } else {
          return res.redirect("https://placehold.co/500x500.jpg?text=MENTEE");
        }
      }
      res.set("Content-Type", row.imageType || "image/jpeg");
      res.send(row.image);
    }
  );
};
