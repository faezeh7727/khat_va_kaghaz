const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // page link in front-end : jsx-in-react.js
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    type: {
      type: String,
      default: "free",
      required: true,
      enum: ["free", "premium"],
    },
    briefText: { type: String, required: true },
    text: { type: String, required: true },
    coverImage: {
      light: { type: String, required: true },
      dark: { type: String, required: true },
    },
    likes: [{ type: ObjectId, ref: "User" }],
    bookmarks: [{ type: ObjectId, ref: "User" }],
    readingTime: { type: Number, required: true },
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
