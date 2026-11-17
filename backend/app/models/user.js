const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true, minlength: 3, maxlength: 30 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["READER", "AUTHOR", "ADMIN"],
      default: "READER",
      required: true,
    },
    resetLink: { data: String },
    biography: { type: String },
    interests: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    bookmarkedPosts: [{ type: ObjectId, ref: "Post" }],
    readPosts: [{ type: ObjectId, ref: "Post" }],
    likedPosts: [{ type: ObjectId, ref: "Post" }],
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

UserSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) return `${process.env.SERVER_URL}/${this.avatar}`;
  return null;
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.avatarUrl = this.avatarUrl;
  delete obj.password;
  return obj;
};

module.exports = {
  UserModel: mongoose.model("User", UserSchema),
};
