const expressAsyncHandler = require("express-async-handler");
const {
  verifyAccessToken,
  decideAuthMiddleware,
} = require("../http/middlewares/auth.middleware");
const { PostController } = require("../http/controllers/post.controller");
const { uploadFile } = require("../utils/multer");
const { requireRole } = require("../http/middlewares/authorization.middleware");
const router = require("express").Router();

router.post(
  "/create",
  verifyAccessToken,
  requireRole("AUTHOR", "ADMIN"),
  uploadFile.single("coverImage"),
  expressAsyncHandler(PostController.addNewPost)
);
router.patch(
  "/update/:id",
  verifyAccessToken,
  requireRole("AUTHOR", "ADMIN"),
  uploadFile.single("coverImage"),
  expressAsyncHandler(PostController.updatePost)
);
router.get(
  "/list",
  decideAuthMiddleware,
  expressAsyncHandler(PostController.getAllPosts)
);
router.delete(
  "/remove/:id",
  verifyAccessToken,
  requireRole("AUTHOR", "ADMIN"),
  expressAsyncHandler(PostController.removePost)
);

router.get(
  "/slug/:slug",
  decideAuthMiddleware,
  expressAsyncHandler(PostController.getPostBySlug)
);

router.post(
  "/read/:id",
  verifyAccessToken,
  expressAsyncHandler(PostController.recordPostRead)
);

router.post(
  "/like/:id",
  verifyAccessToken,
  expressAsyncHandler(PostController.likePost)
);

router.post(
  "/bookmark/:id",
  verifyAccessToken,
  expressAsyncHandler(PostController.bookmarkPost)
);

router.get(
  "/bookmarks",
  verifyAccessToken,
  expressAsyncHandler(PostController.getBookmarkedPosts)
);

router.get(
  "/:id",
  decideAuthMiddleware,
  expressAsyncHandler(PostController.getPostById)
);

module.exports = {
  postRoutes: router,
};
