const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PostSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    title: { type: String, required() { return this.status === "published"; } },
    slug: { type: String, required() { return this.status === "published"; }, unique: true }, // page link in front-end : jsx-in-react.js
    category: {
      type: ObjectId,
      ref: "Category",
      required() { return this.status === "published"; },
    },
    type: {
      type: String,
      default: "free",
      required: true,
      enum: ["free", "premium"],
    },
    briefText: { type: String, required() { return this.status === "published"; } },
    text: { type: String, required() { return this.status === "published"; } },
    coverImage: {
      light: { type: String, required() { return this.status === "published"; } },
      dark: { type: String, required() { return this.status === "published"; } },
    },
    likes: [{ type: ObjectId, ref: "User" }],
    bookmarks: [{ type: ObjectId, ref: "User" }],
    readingTime: { type: Number, required() { return this.status === "published"; } },
    tags: [{ type: String }],
    author: { type: ObjectId, ref: "User" },
    related: [{ type: ObjectId, ref: "Post" }],
    // a Post can have multiple comments, so it should be in a array.
    // all comments info should be kept in this array of this Post.
    // comments: [{ type: ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

PostSchema.virtual("coverImageUrl").get(function () {
  const toUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("/")) {
      return imagePath;
    }
    return `${process.env.SERVER_URL}/${imagePath}`;
  };

  if (!this.coverImage) return null;
  if (typeof this.coverImage === "string") {
    const legacyUrl = toUrl(this.coverImage);
    return { light: legacyUrl, dark: legacyUrl };
  }

  return {
    light: toUrl(this.coverImage.light),
    dark: toUrl(this.coverImage.dark),
  };
});

module.exports = {
  PostModel: mongoose.model("Post", PostSchema),
};
