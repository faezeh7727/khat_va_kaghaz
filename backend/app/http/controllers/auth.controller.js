const {
  VerifyRefreshToken,
  setAccessToken,
  setRefreshToken,
} = require("../../utils/functions");
const Controller = require("./controller");
const createError = require("http-errors");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const {
  validateSignupSchema,
  validateSigninSchema,
  validateUpdateProfileSchema,
} = require("../validators/user/auth.schema");
const path = require("path");
const fs = require("fs");
const { UserModel } = require("../../models/user");
const bcrypt = require("bcryptjs");
const { PostModel } = require("../../models/post");
const { CategoryModel } = require("../../models/category");
const { CommentModel } = require("../../models/comment");
const { ReadingActivityModel } = require("../../models/readingActivity");
const { WritingActivityModel } = require("../../models/writingActivity");
const { ReadingHistoryModel } = require("../../models/readingHistory");

function normalizeRecommendationText(value) {
  return String(value || "")
    .toLocaleLowerCase("fa")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function findRecommendedPost(user) {
  const interests = [...new Set((user.interests || []).map(normalizeRecommendationText).filter(Boolean))];
  if (!interests.length) return null;

  const categories = await CategoryModel.find({}, { title: 1 }).lean();
  const matchingCategoryIds = categories
    .filter(({ title }) => interests.some((interest) => normalizeRecommendationText(title).includes(interest)))
    .map(({ _id }) => _id);
  const clauses = interests.flatMap((interest) => {
    const regex = new RegExp(interest.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return [{ title: regex }, { slug: regex }, { briefText: regex }, { tags: regex }];
  });
  if (matchingCategoryIds.length) clauses.push({ category: { $in: matchingCategoryIds } });

  const posts = await PostModel.find({ status: { $ne: "draft" }, $or: clauses }, {
    title: 1,
    slug: 1,
    briefText: 1,
    category: 1,
    tags: 1,
    readingTime: 1,
    author: 1,
    createdAt: 1,
  })
    .populate({ path: "category", select: "title slug" })
    .populate({ path: "author", select: "name username" })
    .sort({ createdAt: -1 })
    .lean();

  const rankedPosts = posts.map((post) => {
    const fields = [
      { value: post.title, weight: 4 },
      { value: post.slug, weight: 3 },
      { value: post.briefText, weight: 2 },
      { value: post.category?.title, weight: 5 },
      ...(post.tags || []).map((value) => ({ value, weight: 5 })),
    ].map(({ value, weight }) => ({ value: normalizeRecommendationText(value), weight }));
    const matchedInterests = interests.filter((interest) => fields.some((field) => field.value.includes(interest)));
    const score = matchedInterests.reduce(
      (total, interest) => total + fields.reduce((fieldTotal, field) => fieldTotal + (field.value.includes(interest) ? field.weight : 0), 0),
      0
    );
    return { post, score, matchedInterests };
  }).filter(({ score }) => score > 0);

  rankedPosts.sort((left, right) => right.score - left.score || new Date(right.post.createdAt) - new Date(left.post.createdAt));
  const recommended = rankedPosts[0]?.post;
  if (!recommended) return null;
  return {
    _id: recommended._id,
    title: recommended.title,
    slug: recommended.slug,
    briefText: recommended.briefText,
    category: recommended.category,
    tags: recommended.tags || [],
    readingTime: recommended.readingTime,
    author: recommended.author,
    matchedInterests: rankedPosts[0].matchedInterests,
  };
}

class UserAuthController extends Controller {
  constructor() {
    super();
  }
  async signup(req, res) {
    await validateSignupSchema(req.body);
    const { name, email, password } = req.body;

    // checking if the user is already in the data base :
    const existedUser = await this.checkUserExist(email);
    if (existedUser)
      throw createError.BadRequest("کاربری با این ایمیل وجود دارد");

    // HASH PASSWORD :
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    const user = await UserModel.create({
      name: name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await setAccessToken(res, user);
    await setRefreshToken(res, user);

    let WELLCOME_MESSAGE = `ثبت نام با موفقیت انجام شد`;

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: WELLCOME_MESSAGE,
        user,
      },
    });
  }
  async signin(req, res) {
    await validateSigninSchema(req.body);
    const { email, password } = req.body;

    // checking if the user is already in the data base :
    const user = await this.checkUserExist(email.toLowerCase());
    if (!user)
      // throw createError.BadRequest("ایمیل یا رمز عبور اشتباه است");
      throw createError.BadRequest("کاربری با این ایمیل وجود ندارد");

    // PASSWORD IS CORRECT :
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      throw createError.BadRequest("ایمیل یا رمز عبور اشتباه است");

    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    let WELLCOME_MESSAGE = `ورود با موفقیت انجام شد`;

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: WELLCOME_MESSAGE,
        user,
      },
    });
  }
  async updateProfile(req, res) {
    const { _id: userId } = req.user;
    await validateUpdateProfileSchema(req.body);
    const { name, email, biography = "", interests = [], username } = req.body;
    const normalizedInterests = [...new Set(interests.map((item) => item.trim()).filter(Boolean))].slice(0, 8);

    const profileUpdates = {
      $set: { name, email, biography, interests: normalizedInterests },
    };
    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername) {
        const existingUsername = await UserModel.exists({
          username: normalizedUsername,
          _id: { $ne: userId },
        });
        if (existingUsername) throw createError.Conflict("این نام کاربری قبلاً انتخاب شده است.");
        profileUpdates.$set.username = normalizedUsername;
      } else {
        profileUpdates.$unset = { username: 1 };
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      profileUpdates,
      { new: true, runValidators: true }
    );
    if (!user)
      throw createError.BadRequest("اطلاعات ویرایش نشد");

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات با موفقیت آپدیت شد",
        user,
      },
    });
  }
  async updateAvatar(req, res) {
    const { _id: userId } = req.user;
    const { fileUploadPath, filename } = req.body;
    if (!req.file || !fileUploadPath || !filename) {
      throw createError.BadRequest("لطفاً یک تصویر معتبر انتخاب کنید.");
    }
    const avatarAddress = path.join(fileUploadPath, filename).replace(/\\/g, "/");
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarAddress } },
      { new: true, runValidators: true }
    );
    if (!user) throw createError.BadRequest("حساب کاربری پیدا نشد.");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "تصویر پروفایل با موفقیت به‌روزرسانی شد.",
        user,
      },
    });
  }
  async deleteAvatar(req, res) {
    const { _id: userId } = req.user;
    const user = await UserModel.findById(userId);
    if (!user) throw createError.NotFound("حساب کاربری پیدا نشد.");

    const currentAvatar = user.avatar;
    user.avatar = null;
    await user.save();

    if (currentAvatar) {
      const uploadsRoot = path.resolve(__dirname, "..", "..", "..", "uploads", "avatar");
      const avatarPath = path.resolve(__dirname, "..", "..", "..", currentAvatar);
      if (avatarPath.startsWith(uploadsRoot + path.sep)) {
        await fs.promises.unlink(avatarPath).catch((error) => {
          if (error.code !== "ENOENT") throw error;
        });
      }
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "تصویر پروفایل حذف شد.",
        user,
      },
    });
  }
  async getUserProfile(req, res) {
    const { _id: userId } = req.user;
    const user = await UserModel.findById(userId, { otp: 0 });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  async getMyComments(req, res) {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 3));
    const filter = { user: req.user._id };
    const [comments, total] = await Promise.all([
      CommentModel.find(filter, { post: 1, content: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "post", select: "title slug" })
        .lean(),
      CommentModel.countDocuments(filter),
    ]);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        comments: comments
          .filter(({ post }) => post)
          .map(({ _id, post, content, createdAt }) => ({
            _id,
            title: post.title,
            slug: post.slug,
            text: content?.text || "",
            createdAt,
          })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  }
  async getDashboard(req, res) {
    const user = req.user;
    const role = user.role || "READER";
    const weekAgo = new Date();
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 8);
    const fromDay = weekAgo.toISOString().slice(0, 10);
    const [readingActivity, writingActivity, recentReads, recommendedPost] = await Promise.all([
      ReadingActivityModel.find(
        { user: user._id, day: { $gte: fromDay } },
        { _id: 0, day: 1, seconds: 1 }
      ).lean(),
      WritingActivityModel.find(
        { user: user._id, day: { $gte: fromDay } },
        { _id: 0, day: 1, seconds: 1 }
      ).lean(),
      ReadingHistoryModel.find({ user: user._id })
        .sort({ lastReadAt: -1 })
        .limit(3)
        .populate({ path: "post", select: "title slug" })
        .lean(),
      findRecommendedPost(user),
    ]);
    let recentReadItems = recentReads
      .filter(({ post }) => post)
      .map(({ post, lastReadAt }) => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        lastReadAt,
      }));

    // Older readPosts entries predate timestamped history. Keep them visible without inventing dates.
    if (!recentReadItems.length && user.readPosts?.length) {
      const legacyIds = user.readPosts.slice(-3).reverse();
      const legacyPosts = await PostModel.find(
        { _id: { $in: legacyIds } },
        { title: 1, slug: 1 }
      ).lean();
      const legacyById = new Map(legacyPosts.map((post) => [String(post._id), post]));
      recentReadItems = legacyIds
        .map((id) => legacyById.get(String(id)))
        .filter(Boolean)
        .map((post) => ({ ...post, lastReadAt: null }));
    }

    let stats = {
      bookmarks: user.bookmarkedPosts?.length || 0,
      readPosts: user.readPosts?.length || 0,
    };

    if (role === "ADMIN") {
      const [posts, users, comments] = await Promise.all([
        PostModel.countDocuments(),
        UserModel.countDocuments(),
        CommentModel.countDocuments(),
      ]);
      stats = { ...stats, posts, users, comments };
    } else if (role === "AUTHOR") {
      const [posts, likes] = await Promise.all([
        PostModel.countDocuments({ author: user._id }),
        PostModel.aggregate([
          { $match: { author: user._id } },
          { $project: { count: { $size: { $ifNull: ["$likes", []] } } } },
          { $group: { _id: null, total: { $sum: "$count" } } },
        ]),
      ]);
      stats = { ...stats, posts, likes: likes[0]?.total || 0 };
    } else {
      const comments = await CommentModel.countDocuments({ user: user._id });
      stats = {
        ...stats,
        likes: user.likedPosts?.length || 0,
        comments,
      };
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        role,
        stats,
        readingActivity,
        writingActivity,
        recentReads: recentReadItems,
        recommendedPost,
      },
    });
  }
  async recordWritingTime(req, res) {
    const seconds = Number(req.body?.seconds);
    const day = String(req.body?.day || "");
    const parsedDay = new Date(`${day}T00:00:00.000Z`);
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 30) {
      throw createError.BadRequest("مدت هر بازه باید بین ۱ تا ۳۰ ثانیه باشد.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(parsedDay.getTime()) || parsedDay.toISOString().slice(0, 10) !== day) {
      throw createError.BadRequest("تاریخ فعالیت معتبر نیست.");
    }

    try {
      await WritingActivityModel.findOneAndUpdate(
        { user: req.user._id, day },
        { $inc: { seconds } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      await WritingActivityModel.updateOne({ user: req.user._id, day }, { $inc: { seconds } });
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: { message: "زمان نوشتن ثبت شد." },
    });
  }
  async updateUserRole(req, res) {
    const { role } = req.body;
    const allowedRoles = ["READER", "AUTHOR", "ADMIN"];
    if (!allowedRoles.includes(role)) throw createError.BadRequest("نقش انتخاب‌شده معتبر نیست.");
    if (String(req.params.id) === String(req.user._id)) {
      throw createError.Forbidden("برای حفظ دسترسی مدیر، نقش حساب فعلی را از این بخش تغییر ندهید.");
    }
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true, projection: { password: 0, resetLink: 0 } }
    );
    if (!user) throw createError.NotFound("کاربر یافت نشد.");
    return res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, data: { user } });
  }
  async getAllUsers(req, res) {
    const users = await UserModel.find();

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        users,
      },
    });
  }
  async refreshToken(req, res) {
    const userId = await VerifyRefreshToken(req);
    const user = await UserModel.findById(userId);
    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    return res.status(HttpStatus.OK).json({
      StatusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  async checkUserExist(email) {
    const user = await UserModel.findOne({ email });
    return user;
  }
  logout(req, res) {
    const cookieOptions = {
      maxAge: 1,
      expires: Date.now(),
      httpOnly: true,
      signed: true,
      sameSite: "Lax",
      secure: true,
      path: "/",
      domain: process.env.DOMAIN,
    };
    res.cookie("accessToken", null, cookieOptions);
    res.cookie("refreshToken", null, cookieOptions);

    return res.status(HttpStatus.OK).json({
      StatusCode: HttpStatus.OK,
      auth: false,
    });
  }
}

module.exports = {
  UserAuthController: new UserAuthController(),
};
