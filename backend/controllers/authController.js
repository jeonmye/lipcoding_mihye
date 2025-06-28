const db = require("../models/initDb");
const bcrypt = require("bcrypt");
const { generateJwt } = require("../utils/jwt");

exports.signup = async (req, res) => {
  try {
    const { email, password, name, role, bio, skills } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "모든 필수 항목을 입력하세요." });
    }
    const hashed = await bcrypt.hash(password, 10);
    // 이미지 처리
    let imageBuffer = null;
    let imageType = null;
    if (req.file) {
      imageBuffer = req.file.buffer;
      imageType = req.file.mimetype;
    }
    db.run(
      `INSERT INTO users (email, password, name, role, bio, skills, image, imageType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashed,
        name,
        role,
        bio || "",
        skills ? JSON.stringify(skills) : null,
        imageBuffer,
        imageType,
      ],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res
              .status(400)
              .json({ error: "이미 존재하는 이메일입니다." });
          }
          return res
            .status(500)
            .json({ error: "DB 오류", details: err.message });
        }
        return res.status(201).json({ id: this.lastID, email, name, role });
      }
    );
  } catch (e) {
    res.status(500).json({ error: "서버 오류", details: e.message });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "이메일과 비밀번호를 입력하세요." });
  }
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err)
      return res.status(500).json({ error: "DB 오류", details: err.message });
    if (!user)
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    const token = generateJwt(user);
    res.json({ token });
  });
};

exports.me = (req, res) => {
  const userId = req.user && req.user.sub;
  if (!userId) return res.status(401).json({ error: "인증 정보 없음" });
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err)
      return res.status(500).json({ error: "DB 오류", details: err.message });
    if (!user)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    // 프로필 구조 생성
    const profile = {
      name: user.name,
      bio: user.bio || "",
      imageUrl: `/api/images/${user.role}/${user.id}`,
    };
    if (user.role === "mentor") {
      profile.skills = user.skills ? JSON.parse(user.skills) : [];
    }
    const result = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
    };
    res.json(result);
  });
};
