const db = require("../models/initDb");

// 매칭 요청 생성 (멘티만)
exports.createMatchRequest = (req, res) => {
  const user = req.user;
  if (!user || user.role !== "mentee")
    return res.status(401).json({ error: "멘티만 요청 가능" });
  const { mentorId, message } = req.body;
  if (!mentorId || !message)
    return res.status(400).json({ error: "필수 항목 누락" });
  // mentor 존재 확인
  db.get(
    'SELECT * FROM users WHERE id = ? AND role = "mentor"',
    [mentorId],
    (err, mentor) => {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      if (!mentor)
        return res.status(400).json({ error: "멘토가 존재하지 않습니다." });
      // 중복 요청 방지
      db.get(
        'SELECT * FROM match_requests WHERE mentorId = ? AND menteeId = ? AND status = "pending"',
        [mentorId, user.sub],
        (err, exist) => {
          if (exist)
            return res.status(400).json({ error: "이미 요청이 존재합니다." });
          db.run(
            "INSERT INTO match_requests (mentorId, menteeId, message, status) VALUES (?, ?, ?, ?)",
            [mentorId, user.sub, message, "pending"],
            function (err) {
              if (err)
                return res
                  .status(500)
                  .json({ error: "DB 오류", details: err.message });
              res.json({
                id: this.lastID,
                mentorId,
                menteeId: user.sub,
                message,
                status: "pending",
              });
            }
          );
        }
      );
    }
  );
};

// 받은 요청(멘토)
exports.getIncomingMatchRequests = (req, res) => {
  const user = req.user;
  if (!user || user.role !== "mentor")
    return res.status(401).json({ error: "멘토만 조회 가능" });
  db.all(
    "SELECT * FROM match_requests WHERE mentorId = ?",
    [user.sub],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      res.json(rows);
    }
  );
};

// 보낸 요청(멘티)
exports.getOutgoingMatchRequests = (req, res) => {
  const user = req.user;
  if (!user || user.role !== "mentee")
    return res.status(401).json({ error: "멘티만 조회 가능" });
  db.all(
    "SELECT id, mentorId, menteeId, status FROM match_requests WHERE menteeId = ?",
    [user.sub],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      res.json(rows);
    }
  );
};

// 요청 수락 (멘토만)
exports.acceptMatchRequest = (req, res) => {
  const user = req.user;
  const id = req.params.id;
  if (!user || user.role !== "mentor")
    return res.status(401).json({ error: "멘토만 수락 가능" });
  // 한 명만 수락 가능
  db.get(
    'SELECT * FROM match_requests WHERE mentorId = ? AND status = "accepted"',
    [user.sub],
    (err, exist) => {
      if (exist)
        return res.status(400).json({ error: "이미 수락한 요청이 있습니다." });
      db.run(
        'UPDATE match_requests SET status = "accepted" WHERE id = ? AND mentorId = ?',
        [id, user.sub],
        function (err) {
          if (err)
            return res
              .status(500)
              .json({ error: "DB 오류", details: err.message });
          if (this.changes === 0)
            return res.status(404).json({ error: "요청을 찾을 수 없음" });
          db.get(
            "SELECT * FROM match_requests WHERE id = ?",
            [id],
            (err, row) => {
              if (err || !row)
                return res
                  .status(500)
                  .json({ error: "DB 오류", details: err && err.message });
              res.json(row);
            }
          );
        }
      );
    }
  );
};

// 요청 거절 (멘토만)
exports.rejectMatchRequest = (req, res) => {
  const user = req.user;
  const id = req.params.id;
  if (!user || user.role !== "mentor")
    return res.status(401).json({ error: "멘토만 거절 가능" });
  db.run(
    'UPDATE match_requests SET status = "rejected" WHERE id = ? AND mentorId = ?',
    [id, user.sub],
    function (err) {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "요청을 찾을 수 없음" });
      db.get("SELECT * FROM match_requests WHERE id = ?", [id], (err, row) => {
        if (err || !row)
          return res
            .status(500)
            .json({ error: "DB 오류", details: err && err.message });
        res.json(row);
      });
    }
  );
};

// 요청 취소/삭제 (멘티만)
exports.cancelMatchRequest = (req, res) => {
  const user = req.user;
  const id = req.params.id;
  if (!user || user.role !== "mentee")
    return res.status(401).json({ error: "멘티만 취소 가능" });
  db.run(
    'UPDATE match_requests SET status = "cancelled" WHERE id = ? AND menteeId = ?',
    [id, user.sub],
    function (err) {
      if (err)
        return res.status(500).json({ error: "DB 오류", details: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "요청을 찾을 수 없음" });
      db.get("SELECT * FROM match_requests WHERE id = ?", [id], (err, row) => {
        if (err || !row)
          return res
            .status(500)
            .json({ error: "DB 오류", details: err && err.message });
        res.json(row);
      });
    }
  );
};
