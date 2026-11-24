const createHttpError = require("http-errors");
const path = require("path");
const { CategoryModel } = require("../../models/category");
const { PostModel } = require("../../models/post");
const { CommentModel } = require("../../models/comment");
const {
  copyObject,
  deleteInvalidPropertyInObject,
} = require("../../utils/functions");
const { validateAddNewPost } = require("../validators/post/post.schema");
const { CommentController } = require("./comment.controller");
const Controller = require("./controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { UserModel } = require("../../models/user");
const { ReadingActivityModel } = require("../../models/readingActivity");
const { ReadingHistoryModel } = require("../../models/readingHistory");
const { transformPost } = require("../../utils/transformPost");
const { default: mongoose } = require("mongoose");

class PostController extends Controller {
  constructor() {
    super();
  }
  async getAllPosts(req, res) {
    let dbQuery = { status: { $ne: "draft" } };
    const user = req.user;
    let { search, categorySlug, sort, page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 6;
    const skip = (page - 1) * limit;

    if (search) {
      const safeSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchTerm = new RegExp(safeSearch, "i");
      dbQuery["$or"] = [
        { title: searchTerm },
        { slug: searchTerm },
        { briefText: searchTerm },
        { text: searchTerm },
      ];
    }

    // if (search) dbQuery["$text"] = { $search: search }; // -> OLD METHOD TO SEARCH BASED ON INDEX

    if (categorySlug) {
      const categories = [categorySlug].flat(2);
      const categoryIds = [];
      for (const item of categories) {
        const { _id } = await CategoryModel.findOne({ slug: item });
        categoryIds.push(_id);
      }
      dbQuery["category"] = {
        $in: categoryIds,
      };
    }

    const sortQuery = {};
    if (!sort) sortQuery["createdAt"] = -1;
    if (sort) {
      if (sort === "latest") sortQuery["createdAt"] = -1;
      if (sort === "earliest") sortQuery["createdAt"] = 1;
      if (sort === "popular") sortQuery["likes"] = -1;
      if (sort === "time_desc") sortQuery["readingTime"] = -1;
      if (sort === "time_asc") sortQuery["readingTime"] = 1;
    }
    const posts = await PostModel.find(dbQuery, {
      comments: 0,
    })
      .populate([
        { path: "category", select: { title: 1, slug: 1 } },
        { path: "author", select: { name: 1, biography: 1, avatar: 1 } },
        {
          path: "related",
          model: "Post",
          match: { status: { $ne: "draft" } },
          select: {
            title: 1,
            slug: 1,
            bfireText: 1,
            coverImage: 1,
            author: 1,
          },
          populate: [
            {
              path: "author",
              model: "User",
              select: { name: 1, biography: 1, avatar: 1 },
            },
            {
              path: "category",
              model: "Category",
              select: { title: 1, slug: 1 },
            },
          ],
        },
      ])
      .limit(limit)
      .skip(skip)
      .sort(sortQuery);

    const totalCount = await PostModel.countDocuments(dbQuery);
    const totalPages = Math.ceil(totalCount / limit);

    const transformedPosts = copyObject(posts);

    for (const post of transformedPosts) {
      await transformPost(post, user);
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "پست های مدنظر شما",
        posts: transformedPosts,
        totalPages,
        totalCount,
      },
    });
  }
  async getMyPosts(req, res) {
    const posts = await PostModel.find(
      { author: req.user._id },
      { title: 1, slug: 1, briefText: 1, category: 1, status: 1, updatedAt: 1, likes: 1 }
    )
      .populate("category", "title slug")
      .sort({ updatedAt: -1 });

    const commentStats = posts.length
      ? await CommentModel.aggregate([
        { $match: { post: { $in: posts.map(({ _id }) => _id) }, status: 2 } },
        {
          $project: {
            post: 1,
            acceptedAnswers: {
              $filter: {
                input: { $ifNull: ["$answers", []] },
                as: "answer",
                cond: { $eq: ["$$answer.status", 2] },
              },
            },
          },
        },
        {
          $group: {
            _id: "$post",
            comments: { $sum: 1 },
            answers: { $sum: { $size: "$acceptedAnswers" } },
          },
        },
      ])
      : [];
    const commentsByPost = new Map(
      commentStats.map(({ _id, comments, answers }) => [String(_id), comments + answers])
    );
    const responsePosts = posts.map((post) => {
      const data = post.toObject();
      data.likesCount = post.likes?.length || 0;
      data.commentsCount = commentsByPost.get(String(post._id)) || 0;
      delete data.likes;
      return data;
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { posts: responsePosts },
    });
  }
  async getMyPost(req, res) {
    const post = await PostModel.findById(req.params.id).populate("category", "title slug");
    if (!post) throw createHttpError.NotFound("نوشته پیدا نشد.");
    this.assertPostManager(req.user, post);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { post },
    });
  }
  async getBookmarkedPosts(req, res) {
    const user = await UserModel.findById(req.user._id).populate({
      path: "bookmarkedPosts",
      populate: [
        { path: "category", select: { title: 1, slug: 1 } },
        { path: "author", select: { name: 1, biography: 1, avatar: 1 } },
        {
          path: "related",
          model: "Post",
          match: { status: { $ne: "draft" } },
          select: { title: 1, slug: 1, briefText: 1, coverImage: 1, author: 1 },
          populate: [
            {
              path: "author",
              model: "User",
              select: { name: 1, biography: 1, avatar: 1 },
            },
            {
              path: "category",
              model: "Category",
              select: { title: 1, slug: 1 },
            },
          ],
        },
      ],
    });

    const posts = copyObject((user?.bookmarkedPosts || []).filter((post) => post && post.status !== "draft").reverse());
    for (const post of posts) {
      await transformPost(post, req.user);
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { posts },
    });
  }
  async getPostBySlug(req, res) {
    const { slug } = req.params;
    const user = req.user;
    const post = await PostModel.findOne({ slug }).populate([
      {
        path: "author",
        model: "User",
        select: { name: 1, biography: 1, avatar: 1 },
      },
      { path: "category", model: "Category", select: { title: 1, slug: 1 } },
      {
        path: "related",
        model: "Post",
        match: { status: { $ne: "draft" } },
        select: {
          title: 1,
          slug: 1,
          bfireText: 1,
          coverImage: 1,
          author: 1,
        },
        populate: [
          {
            path: "author",
            model: "User",
            select: { name: 1, biography: 1, avatar: 1 },
          },
          {
            path: "category",
            model: "Category",
            select: { title: 1, slug: 1 },
          },
        ],
      },
    ]);

    if (!post) throw createHttpError.NotFound("پستی با این مشخصات یافت نشد");
    const postAuthorId = post.author?._id || post.author;
    const canViewDraft = user && (user.role === "ADMIN" || String(postAuthorId) === String(user._id));
    if (post.status === "draft" && !canViewDraft) {
      throw createHttpError.NotFound("Post not found.");
    }
    const { id: postId } = post;
    const acceptedCommnets = await CommentController.findAcceptedComments(
      postId
    );

    const transformedPost = copyObject(post);

    transformedPost.comments = acceptedCommnets;
    transformedPost.commentsCount =
      acceptedCommnets.length +
      acceptedCommnets.reduce((a, c) => a + c.answers.length, 0);

    await transformPost(transformedPost, user);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        post: transformedPost,
      },
    });
  }
  async addNewPost(req, res) {
    const { filename, fileUploadPath, coverImage: coverImageInput, ...rest } =
      req.body;
    const submittedCoverImage =
      typeof coverImageInput === "string"
        ? JSON.parse(coverImageInput)
        : coverImageInput;
    const uploadedCoverPath =
      fileUploadPath && filename
        ? path.join(fileUploadPath, filename).replace(/\\/g, "/")
        : null;
    const coverImage = submittedCoverImage ||
      (uploadedCoverPath
        ? { light: uploadedCoverPath, dark: uploadedCoverPath }
        : undefined);

    const parseArray = (value) => {
      if (typeof value !== "string") return value;
      try { return JSON.parse(value); } catch { return value; }
    };
    rest.tags = parseArray(rest.tags);
    rest.related = parseArray(rest.related);
    const status = rest.status || "published";
    if (!["draft", "published"].includes(status)) {
      throw createHttpError.BadRequest("وضعیت نوشته معتبر نیست.");
    }
    await validateAddNewPost({ ...rest, status, coverImage });
    const {
      title,
      briefText,
      type = "free",
      category,
      tags = [],
      text,
      readingTime,
      related = [],
    } = rest;
    const slug = rest.slug || (status === "draft" ? `draft-${new mongoose.Types.ObjectId()}` : "");

    const author = req.user._id;
    // const { fileUploadPath, filename } = req.body;

    const post = await PostModel.create({
      title,
      briefText,
      slug,
      status,
      type,
      category,
      tags,
      text,
      readingTime,
      related,
      author,
      coverImage,
    });

    if (!post?._id) throw createHttpError.InternalServerError("پست ثبت نشد");

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "پست با موفقیت ایجاد شد",
        post,
      },
    });
  }
  async updatePost(req, res) {
    const { id } = req.params;
    const {
      filename,
      fileUploadPath,
      coverImage: coverImageInput,
      ...rest
    } = req.body;

    const post = await this.findPostById(id);
    this.assertPostManager(req.user, post);
    const data = copyObject(rest);
    for (const key of ["tags", "related"]) {
      if (typeof data[key] === "string") {
        try { data[key] = JSON.parse(data[key]); } catch { /* Keep invalid input for the update to reject. */ }
      }
    }
    let coverImage =
      typeof coverImageInput === "string"
        ? JSON.parse(coverImageInput)
        : coverImageInput || post.coverImage;

    if (!coverImageInput && fileUploadPath && filename) {
      const uploadedCoverPath = path
        .join(fileUploadPath, filename)
        .replace(/\\/g, "/");
      coverImage = { light: uploadedCoverPath, dark: uploadedCoverPath };
    }

    const status = data.status || post.status || "published";
    if (!["draft", "published"].includes(status)) {
      throw createHttpError.BadRequest("وضعیت نوشته معتبر نیست.");
    }
    data.status = status;
    if (status === "draft" && !data.slug) {
      data.slug = post.slug || `draft-${new mongoose.Types.ObjectId()}`;
    }
    await validateAddNewPost({
      title: data.title ?? post.title,
      slug: data.slug ?? post.slug,
      category: String(data.category ?? post.category?._id ?? post.category ?? ""),
      briefText: data.briefText ?? post.briefText,
      text: data.text ?? post.text,
      coverImage,
      readingTime: data.readingTime ?? post.readingTime,
      type: data.type ?? post.type ?? "free",
      tags: Array.isArray(data.tags ?? post.tags) ? (data.tags ?? post.tags).map(String) : data.tags,
      related: Array.isArray(data.related ?? post.related) ? (data.related ?? post.related).map(String) : data.related,
      status,
    });

    const updatePostResult = await PostModel.updateOne(
      { _id: id },
      {
        $set: { ...data, coverImage },
      }
    );

    if (!updatePostResult.matchedCount)
      throw new createHttpError.InternalServerError(
        "به روزرسانی پست انجام نشد"
      );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "به روزرسانی پست با موفقیت انجام شد",
      },
    });
  }
  async removePost(req, res) {
    const { id } = req.params;
    const existingPost = await this.findPostById(id);
    this.assertPostManager(req.user, existingPost);
    const post = await PostModel.findByIdAndDelete(id);
    if (!post._id) throw createHttpError.InternalServerError(" پست حذف نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "پست با موفقیت حذف شد",
      },
    });
  }
  assertPostManager(user, post) {
    if (user.role === "ADMIN") return;
    if (user.role !== "AUTHOR" || String(post.author) !== String(user._id)) {
      throw createHttpError.Forbidden("نویسنده فقط اجازه مدیریت نوشته‌های خودش را دارد.");
    }
  }
  async getPostById(req, res) {
    const { id } = req.params;
    const post = await this.findPostById(id);
    req.params.slug = post.slug;
    await this.getPostBySlug(req, res);
  }
  async findPostById(id) {
    if (!mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest("شناسه پست نامعتبر است");

    const post = await PostModel.findById(id);
    if (!post) throw createHttpError.BadRequest("پست با این مشخصات یافت نشد");
    return copyObject(post);
  }
  async recordPostRead(req, res) {
    const post = await this.findPostById(req.params.id);
    await Promise.all([
      UserModel.updateOne(
        { _id: req.user._id },
        { $addToSet: { readPosts: post._id } }
      ),
      ReadingHistoryModel.findOneAndUpdate(
        { user: req.user._id, post: post._id },
        { $set: { lastReadAt: new Date() }, $inc: { readCount: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ),
    ]);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { message: "خواندن نوشته ثبت شد." },
    });
  }
  async recordReadingTime(req, res) {
    const post = await this.findPostById(req.params.id);
    const seconds = Number(req.body?.seconds);
    const day = String(req.body?.day || "");
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 30) {
      throw createHttpError.BadRequest("مدت هر بازه باید بین ۱ تا ۳۰ ثانیه باشد.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw createHttpError.BadRequest("تاریخ مطالعه معتبر نیست.");
    }
    const parsedDay = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(parsedDay.getTime()) || parsedDay.toISOString().slice(0, 10) !== day) {
      throw createHttpError.BadRequest("تاریخ مطالعه معتبر نیست.");
    }

    try {
      await ReadingActivityModel.findOneAndUpdate(
        { user: req.user._id, day },
        { $inc: { seconds } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      await ReadingActivityModel.updateOne({ user: req.user._id, day }, { $inc: { seconds } });
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { message: "زمان مطالعه ثبت شد." },
    });
  }
  async likePost(req, res) {
    const { id: postId } = req.params;
    const user = req.user;
    const post = await this.findPostById(postId);
    const likedPost = await PostModel.findOne({
      _id: postId,
      likes: user._id,
    });
    const updatePostQuery = likedPost
      ? { $pull: { likes: user._id } }
      : { $push: { likes: user._id } };

    const updateUserQuery = likedPost
      ? { $pull: { likedPosts: post._id } }
      : { $push: { likedPosts: post._id } };

    const postUpdate = await PostModel.updateOne(
      { _id: postId },
      updatePostQuery
    );
    const userUpdate = await UserModel.updateOne(
      { _id: user._id },
      updateUserQuery
    );

    if (postUpdate.modifiedCount === 0 || userUpdate.modifiedCount === 0)
      throw createHttpError.BadRequest("عملیات ناموفق بود.");

    let message;
    if (!likedPost) {
      message = "مرسی بابت لایک تون";
    } else message = "لایک شما برداشته شد";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
  async bookmarkPost(req, res) {
    const { id: postId } = req.params;
    const user = req.user;
    const post = await this.findPostById(postId);
    const likedPost = await PostModel.findOne({
      _id: postId,
      bookmarks: user._id,
    });
    const updatePostQuery = likedPost
      ? { $pull: { bookmarks: user._id } }
      : { $push: { bookmarks: user._id } };

    const updateUserQuery = likedPost
      ? { $pull: { bookmarkedPosts: post._id } }
      : { $push: { bookmarkedPosts: post._id } };

    const postUpdate = await PostModel.updateOne(
      { _id: postId },
      updatePostQuery
    );
    const userUpdate = await UserModel.updateOne(
      { _id: user._id },
      updateUserQuery
    );

    if (postUpdate.modifiedCount === 0 || userUpdate.modifiedCount === 0)
      throw createHttpError.BadRequest("عملیات ناموفق بود.");

    let message;
    if (!likedPost) {
      message = "پست بوکمارک شد";
    } else message = "پست از بوکمارک برداشته شد";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
}

module.exports = {
  PostController: new PostController(),
};
