const db = require("./models/initDb");

// 멘토 계정 전체 삭제
function deleteMentors() {
  db.run("DELETE FROM users WHERE role = 'mentor'", function (err) {
    if (err) {
      console.error("멘토 삭제 실패:", err.message);
    } else {
      console.log("멘토 계정 전체 삭제 완료");
    }
    process.exit();
  });
}

deleteMentors();
