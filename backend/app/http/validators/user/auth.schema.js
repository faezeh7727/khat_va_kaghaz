const Joi = require("joi");
const createHttpError = require("http-errors");

async function validateSignupSchema(data) {
  const signupSchema = Joi.object({
    name: Joi.string()
      .required()
      .min(5)
      .max(50)
      .error(createHttpError.BadRequest("نام کاربری وارد شده صحیح نمی باشد")),
    email: Joi.string()
      .required()
      .email()
      .error(createHttpError.BadRequest("ایمیل وارد شده صحیح نمی باشد")),
    password: Joi.string()
      .min(8)
      .required()
      .error(createHttpError.BadRequest("رمز عبور باید حداقل 8 کاراکتر باشد")),
    role: Joi.string().valid("READER", "AUTHOR").default("READER"),
  });
  return await signupSchema.validateAsync(data);
}
async function validateSigninSchema(data) {
  const signupSchema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .error(createHttpError.BadRequest("ایمیل وارد شده صحیح نمی باشد")),
    password: Joi.string()
      .min(8)
      .required()
      .error(createHttpError.BadRequest("رمز عبور باید حداقل 8 کاراکتر باشد")),
  });
  return await signupSchema.validateAsync(data);
}

async function validateUpdateProfileSchema(data) {
  const updateProfileSchema = Joi.object({
    name: Joi.string()
      .min(5)
      .max(50)
      .required()
      .error(createHttpError.BadRequest("نام کاربری وارد شده صحیح نمی باشد")),
    email: Joi.string()
      .required()
      .email()
      .error(createHttpError.BadRequest("ایمیل وارد شده صحیح نمی باشد")),
    biography: Joi.string()
      .max(280)
      .allow("")
      .error(createHttpError.BadRequest("حوزه تخصصی صحیح نمی باشد.")),
    interests: Joi.array().items(Joi.string().trim().min(1).max(40)).max(8),
    username: Joi.string().trim().lowercase().min(3).max(30).pattern(/^[a-z0-9_]+$/).allow(""),
  });
  return updateProfileSchema.validateAsync(data);
}

module.exports = {
  validateUpdateProfileSchema,
  validateSignupSchema,
  validateSigninSchema,
};
