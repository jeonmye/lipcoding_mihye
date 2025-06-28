const db = require("./models/initDb");
const bcrypt = require("bcryptjs");

const FRONTEND_SKILLS = [
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Redux",
  "SASS/SCSS",
  "Material-UI",
];
const BACKEND_SKILLS = [
  "Node.js",
  "Express",
  "Spring Boot",
  "Django",
  "FastAPI",
  "Flask",
  "Java",
  "Python",
  "MySQL",
  "PostgreSQL",
];

async function seedMentors() {
  const mentors = [];
  for (let i = 1; i <= 20; i++) {
    const email = `mentor${i}@test.com`;
    const password = await bcrypt.hash(`test1234`, 8);
    const name = `멘토${i}`;
    const role = "mentor";
    const bio = `안녕하세요, ${name}입니다.`;
    // 랜덤 기술스택 3~6개
    const allSkills = [...FRONTEND_SKILLS, ...BACKEND_SKILLS];
    const skills = [];
    while (skills.length < Math.floor(Math.random() * 4) + 3) {
      const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
      if (!skills.includes(skill)) skills.push(skill);
    }
    mentors.push({
      email,
      password,
      name,
      role,
      bio,
      skills: JSON.stringify(skills), // 배열을 JSON 문자열로 저장
    });
  }

  for (const m of mentors) {
    try {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (email, password, name, role, bio, skills) VALUES (?, ?, ?, ?, ?, ?)`,
          [m.email, m.password, m.name, m.role, m.bio, m.skills],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      console.log(`${m.email} 추가 완료`);
    } catch (e) {
      console.log(`${m.email} 추가 실패:`, e.message);
    }
  }
  process.exit();
}

seedMentors();
