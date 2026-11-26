const Joi = require("joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../utils/constants");

async function validateAddNewPost(data) {
  const isDraft = data.status === "draft";
  const addNewPostSchema = Joi.object({
    status: Joi.string().valid("draft", "published").default("published"),
    title: isDraft
      ? Joi.string().max(100).allow("").optional()
      : Joi.string().trim().min(5).max(100).required(),
    slug: isDraft
      ? Joi.string().allow("").optional()
      : Joi.string().trim().required(),
    category: isDraft
      ? Joi.string().pattern(MongoIDPattern).allow("").optional()
      : Joi.string().pattern(MongoIDPattern).required(),
    text: isDraft ? Joi.string().allow("").optional() : Joi.string().required(),
    briefText: isDraft ? Joi.string().allow("").optional() : Joi.string().required(),
    keyPoint: isDraft
      ? Joi.string().trim().max(60).allow("").optional()
      : Joi.string().trim().min(1).max(60).custom((value, helpers) => {
          if (value.split(/\s+/).length > 4) return helpers.error("any.custom");
          return value;
        }).messages({ "any.custom": "نکتهٔ کلیدی باید حداکثر چهار کلمه باشد." }).required(),
    quote: Joi.string().trim().max(1000).allow("").optional(),
    coverImage: Joi.object({
      light: Joi.string().required(),
      dark: Joi.string().required(),
    }).when("status", {
      is: "draft",
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    readingTime: Joi.number().when("status", {
      is: "draft",
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    type: Joi.string().valid("free", "premium").default("free"),
    related: Joi.array().items(Joi.string().pattern(MongoIDPattern)).default([]),
    tags: Joi.array().items(Joi.string()).default([]),
  });

  try {
    return await addNewPostSchema.validateAsync(data);
  } catch (error) {
    if (!error.isJoi) throw error;
    throw createHttpError.BadRequest(isDraft ? "اطلاعات پیش‌نویس معتبر نیست." : "برای انتشار، عنوان، نشانی، دسته‌بندی، خلاصه، متن و تصویر کاور را کامل کنید.");
  }
}

module.exports = { validateAddNewPost };
