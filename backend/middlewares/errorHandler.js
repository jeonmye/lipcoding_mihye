// 공통 에러 핸들러 scaffold
module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    details: err.details || undefined,
  });
};
