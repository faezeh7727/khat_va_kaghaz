const createHttpError = require("http-errors");

function requireRole(...allowedRoles) {
  return function authorizeRole(req, res, next) {
    if (!req.user) return next(createHttpError.Unauthorized("لطفا وارد حساب کاربری خود شوید."));
    if (!allowedRoles.includes(req.user.role || "READER")) {
      return next(createHttpError.Forbidden("شما اجازه انجام این عملیات را ندارید."));
    }
    return next();
  };
}

module.exports = { requireRole };
