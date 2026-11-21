const { UserAuthController } = require("../http/controllers/auth.controller");
const expressAsyncHandler = require("express-async-handler");
const { verifyAccessToken } = require("../http/middlewares/auth.middleware");
const { uploadFile } = require("../utils/multer");
const { requireRole } = require("../http/middlewares/authorization.middleware");
const router = require("express").Router();

router.post("/signup", expressAsyncHandler(UserAuthController.signup));
router.post("/signin", expressAsyncHandler(UserAuthController.signin));
router.get(
  "/refresh-token",
  expressAsyncHandler(UserAuthController.refreshToken)
);

router.patch(
  "/update",
  verifyAccessToken,
  expressAsyncHandler(UserAuthController.updateProfile)
);
router.post(
  "/upload-avatar",
  verifyAccessToken,
  uploadFile.single("avatar"),
  expressAsyncHandler(UserAuthController.updateAvatar)
);
router.delete(
  "/avatar",
  verifyAccessToken,
  expressAsyncHandler(UserAuthController.deleteAvatar)
);
router.get(
  "/profile",
  verifyAccessToken,
  expressAsyncHandler(UserAuthController.getUserProfile)
);
router.get("/dashboard", verifyAccessToken, expressAsyncHandler(UserAuthController.getDashboard));
router.get("/recommendations", verifyAccessToken, expressAsyncHandler(UserAuthController.getRecommendations));
router.get("/comments", verifyAccessToken, expressAsyncHandler(UserAuthController.getMyComments));
router.post(
  "/writing-time",
  verifyAccessToken,
  requireRole("AUTHOR"),
  expressAsyncHandler(UserAuthController.recordWritingTime)
);
router.patch("/:id/role", verifyAccessToken, requireRole("ADMIN"), expressAsyncHandler(UserAuthController.updateUserRole));
router.get(
  "/list",
  verifyAccessToken,
  requireRole("ADMIN"),
  expressAsyncHandler(UserAuthController.getAllUsers)
);
router.post("/logout", expressAsyncHandler(UserAuthController.logout));

module.exports = {
  userAuthRoutes: router,
};
