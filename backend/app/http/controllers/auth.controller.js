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
const { CommentModel } = require("../../models/comment");
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
  async getDashboard(req, res) {
    const user = req.user;
    const role = user.role || "READER";
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
      data: { role, stats },
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
