const db = require("../models/initDb");

// 멘토 리스트 조회
exports.getMentors = (req, res) => {
  const { skill, order_by } = req.query;
  let sql = `SELECT * FROM users WHERE role = 'mentor'`;
  const params = [];
  if (skill) {
    sql += ` AND skills LIKE ?`;
    params.push(`%${skill}%`);
  }
  if (order_by === "skill") {
    sql += ` ORDER BY skills ASC`;
  } else if (order_by === "name") {
    sql += ` ORDER BY name ASC`;
  } else {
    sql += ` ORDER BY id ASC`;
  }
  db.all(sql, params, (err, rows) => {
    if (err)
      return res.status(500).json({ error: "DB 오류", details: err.message });
    const result = rows.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        name: user.name,
        bio: user.bio || "",
        imageUrl: `/api/images/mentor/${user.id}`,
        skills: user.skills ? JSON.parse(user.skills) : [],
      },
    }));
    res.json(result);
  });
};
