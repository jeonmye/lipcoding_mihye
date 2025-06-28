// 이미지 업로드 시 정사각형, 500~1000px, jpg/png, 1MB 제한을 검증하는 유틸
const sharp = require("sharp");

/**
 * base64 이미지를 디코딩하여 명세에 맞는지 검증
 * @param {string} base64Str
 * @returns {Promise<{ok: boolean, error?: string, buffer?: Buffer, type?: string}>}
 */
async function validateProfileImage(base64Str) {
  if (!base64Str) return { ok: true };
  let buffer;
  try {
    buffer = Buffer.from(base64Str, "base64");
  } catch (e) {
    return { ok: false, error: "base64 디코딩 오류" };
  }
  if (buffer.length > 1024 * 1024) {
    return { ok: false, error: "이미지 크기는 1MB 이하만 허용" };
  }
  let meta;
  try {
    meta = await sharp(buffer).metadata();
  } catch (e) {
    return { ok: false, error: "이미지 파일이 아님" };
  }
  if (!["jpeg", "png"].includes(meta.format)) {
    return { ok: false, error: "jpg, png만 허용" };
  }
  if (meta.width !== meta.height) {
    return { ok: false, error: "정사각형 이미지만 허용" };
  }
  if (meta.width < 500 || meta.width > 1000) {
    return { ok: false, error: "이미지 크기는 500~1000px만 허용" };
  }
  return {
    ok: true,
    buffer,
    type: meta.format === "jpeg" ? "image/jpeg" : "image/png",
  };
}

module.exports = { validateProfileImage };
