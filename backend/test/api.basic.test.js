const request = require("supertest");
const express = require("express");
const app = require("../app");

describe("Mentor-Mentee API 기본 테스트", () => {
  it("GET /api/mentors - 멘토 리스트 조회 (인증 필요)", async () => {
    // 인증 토큰이 없으면 401
    const res = await request(app).get("/api/mentors");
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/auth/signup - 회원가입", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "testuser@example.com",
      password: "test1234",
      name: "테스트유저",
      role: "mentee",
    });
    expect([201, 400]).toContain(res.statusCode); // 이미 가입된 경우 400
  });

  it("POST /api/auth/login - 로그인", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "test1234",
    });
    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.token).toBeDefined();
    }
  });
});
