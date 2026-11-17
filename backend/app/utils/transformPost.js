const { CommentController } = require("../http/controllers/comment.controller");

function getCoverImageUrl(coverImage) {
  const toUrl = (imagePath) => {
    if (!imagePath) return null;
    if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("/")) {
      return imagePath;
    }
    return `${process.env.SERVER_URL}/${imagePath}`;
  };

  if (!coverImage) return null;
  if (typeof coverImage === "string") {
    const legacyUrl = toUrl(coverImage);
    return { light: legacyUrl, dark: legacyUrl };
  }

  return {
    light: toUrl(coverImage.light),
    dark: toUrl(coverImage.dark),
  };
}

async function transformPost(post, user) {
  post.coverImageUrl = getCoverImageUrl(post.coverImage);
  post.likesCount = post.likes.length;
  post.isLiked = false;
  post.isBookmarked = false;

  const acceptedCommnets = await CommentController.findAcceptedComments(
    post._id
  );
  if (post.author?.avatar) {
    post.author.avatarUrl = `${process.env.SERVER_URL}/${post.author.avatar}`;
  }

  if (post.related.length) {
    post.related = post.related.map((item) => {
      return {
        ...item,
        coverImageUrl: getCoverImageUrl(item.coverImage),
        author: {
          ...item.author,
          avatarUrl: `${process.env.SERVER_URL}/${item.author.avatar}`,
        },
      };
    });
  }
  post.comments = acceptedCommnets;
  post.commentsCount =
    acceptedCommnets.length +
    acceptedCommnets.reduce((a, c) => a + c.answers.length, 0);

  if (!user) {
    post.isLiked = false;
    post.isBookmarked = false;

    delete post.likes;
    delete post.bookmarks;
    return post;
  }
  if (post.likes.includes(user._id.toString())) {
    post.isLiked = true;
  }
  if (post.bookmarks.includes(user._id.toString())) {
    post.isBookmarked = true;
  }

  delete post.bookmarks;
  delete post.likes;
  return post;
}

module.exports = {
  transformPost,
};
