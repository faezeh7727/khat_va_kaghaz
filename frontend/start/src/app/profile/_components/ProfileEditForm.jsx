"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CameraIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import Modal from "@/ui/Modal";

const MAX_AVATAR_SIZE = 2 * 1000 * 1000;
const MAX_INTERESTS = 8;
const PROFILE_ROLE_LABELS = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };

export default function ProfileEditForm({ user, onClose }) {
  const { dispatch } = useAuth();
  const fileInputRef = useRef(null);
  const [values, setValues] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    biography: user.biography || "",
    interests: Array.isArray(user.interests) ? user.interests : [],
  });
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [interestInput, setInterestInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadError, setUploadError] = useState("");

  useEffect(() => () => {
    if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
  }, [avatarUrl]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function addInterest(rawValue = interestInput) {
    const interest = rawValue.trim().replace(/[،,]$/u, "").trim();
    if (!interest) return;
    if (interest.length > 40) {
      setError("هر علاقه‌مندی باید حداکثر ۴۰ نویسه باشد.");
      return;
    }
    if (values.interests.some((item) => item.toLocaleLowerCase() === interest.toLocaleLowerCase())) {
      setInterestInput("");
      return;
    }
    if (values.interests.length >= MAX_INTERESTS) {
      setError("حداکثر می‌توانید ۸ علاقه‌مندی وارد کنید.");
      return;
    }
    setError("");
    setValues((current) => ({ ...current, interests: [...current.interests, interest] }));
    setInterestInput("");
  }

  function handleInterestKeyDown(event) {
    if (event.key === "Enter" || event.key === "," || event.key === "،") {
      event.preventDefault();
      addInterest();
    }
  }

  function removeInterest(interestToRemove) {
    setError("");
    setValues((current) => ({
      ...current,
      interests: current.interests.filter((interest) => interest !== interestToRemove),
    }));
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const supportedExtension = /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    const supportedMimeType = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
    if (!supportedExtension || (file.type && !supportedMimeType)) {
      setUploadError("لطفاً یک فایل تصویری انتخاب کنید.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setUploadError("حجم تصویر باید کمتر از ۲ مگابایت باشد.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setIsUploading(true);
    setUploadError("");
    try {
      const result = await Authservice.updateAvatar(file);
      if (!result.user) throw new Error("اطلاعات تصویر دریافت نشد. دوباره تلاش کنید.");
      dispatch({ type: "AUTH_PROFILE_UPDATED", payload: result.user });
      setAvatarUrl(result.user.avatarUrl || previewUrl);
      toast.success(result.message || "تصویر پروفایل به‌روز شد.");
    } catch (uploadFailure) {
      setAvatarUrl(user.avatarUrl || "");
      setUploadError(uploadFailure.message || "بارگذاری تصویر انجام نشد.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAvatarDelete() {
    setIsUploading(true);
    setUploadError("");
    try {
      const result = await Authservice.deleteAvatar();
      if (!result.user) throw new Error("اطلاعات حساب دریافت نشد. دوباره تلاش کنید.");
      dispatch({ type: "AUTH_PROFILE_UPDATED", payload: result.user });
      setAvatarUrl("");
      toast.success(result.message || "تصویر پروفایل حذف شد.");
    } catch (deleteFailure) {
      setUploadError(deleteFailure.message || "حذف تصویر انجام نشد.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const normalized = { ...values, name: values.name.trim(), username: values.username.trim(), email: values.email.trim() };
    const nextFieldErrors = {};
    if (!normalized.name) nextFieldErrors.name = "وارد کردن نام الزامی است";
    else if (normalized.name.length < 5 || normalized.name.length > 50) nextFieldErrors.name = "نام باید بین ۵ تا ۵۰ نویسه باشد";
    if (normalized.username && !/^[a-z0-9_]{3,30}$/i.test(normalized.username)) nextFieldErrors.username = "نام کاربری باید ۳ تا ۳۰ حرف انگلیسی، عدد یا زیرخط باشد";
    if (!normalized.email) nextFieldErrors.email = "وارد کردن ایمیل الزامی است";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) nextFieldErrors.email = "ایمیل واردشده معتبر نیست";
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length) return;
    setIsSaving(true);

    const pendingInterest = interestInput.trim().replace(/[،,]$/u, "").trim();
    const interests = [...values.interests];
    if (pendingInterest && !interests.some((item) => item.toLocaleLowerCase() === pendingInterest.toLocaleLowerCase())) {
      interests.push(pendingInterest);
    }
    if (interests.length > MAX_INTERESTS || interests.some((interest) => interest.length > 40)) {
      setError("حداکثر ۸ علاقه‌مندی با طول هرکدام تا ۴۰ نویسه وارد کنید.");
      setIsSaving(false);
      return;
    }

    try {
      const result = await Authservice.updateProfile({ ...normalized, interests });
      if (!result.user) throw new Error("اطلاعات به‌روز نشد. دوباره تلاش کنید.");
      dispatch({ type: "AUTH_PROFILE_UPDATED", payload: result.user });
      toast.success(result.message || "اطلاعات حساب به‌روز شد.");
      onClose();
    } catch (saveError) {
      setError(saveError.message || "ذخیرهٔ تغییرات انجام نشد.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      eyebrow={<><PencilSquareIcon aria-hidden="true" />ویرایش اطلاعات کاربری</>}
      title="ویرایش اطلاعات کاربری"
      onClose={onClose}
      closeDisabled={isSaving || isUploading}
      className="profile-edit-dialog"
    >
      <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
        <section className={`profile-avatar-upload-panel ${avatarUrl ? "has-avatar" : "is-empty"}`} aria-label="تصویر پروفایل">
          <div className="profile-avatar-upload-preview">
            {avatarUrl
              ? <Image src={avatarUrl} alt="تصویر پروفایل" width={72} height={72} unoptimized />
              : <span>{(values.name || "ک").trim().charAt(0)}</span>}
            <button
              className="profile-avatar-camera"
              type="button"
              aria-label="انتخاب تصویر پروفایل"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            ><CameraIcon aria-hidden="true" /></button>
          </div>
          <div className="profile-avatar-upload-copy">
            <strong>{values.name || "کاربر"}</strong>
            <span>نقش: {PROFILE_ROLE_LABELS[user.role] || "کاربر"} · تصویر تا ۲ مگابایت</span>
            <div className="profile-avatar-upload-actions">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "در حال بارگذاری تصویر…" : "بارگذاری تصویر جدید"}
              </button>
              <span aria-hidden="true">·</span>
              <button className="profile-avatar-delete" type="button" onClick={handleAvatarDelete} disabled={isUploading || !avatarUrl}>
                {isUploading ? "در حال حذف…" : "حذف"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              className="profile-avatar-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </section>
        {uploadError && <p className="profile-edit-error" role="alert">{uploadError}</p>}

        <div className="profile-edit-field profile-floating-field">
          <div className="profile-input-wrapper">
            <input autoFocus dir="auto" id="profile-edit-name" name="name" type="text" autoComplete="name" minLength={5} maxLength={50} required placeholder="نام و نام خانوادگی" value={values.name} onChange={updateField} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "profile-edit-name-error" : undefined} />
            <label className="profile-input-label" htmlFor="profile-edit-name">نام و نام خانوادگی</label>
          </div>
          {fieldErrors.name && <span className="profile-field-error" id="profile-edit-name-error" role="alert">{fieldErrors.name}</span>}
        </div>

        <div className="profile-edit-field profile-floating-field">
          <div className="profile-edit-label-row">
            <span className="profile-edit-count">۳ تا ۳۰ حرف انگلیسی یا عدد</span>
          </div>
          <div className="profile-input-wrapper">
            <input dir="auto" id="profile-edit-username" name="username" type="text" autoComplete="username" maxLength={30} pattern="([A-Za-z0-9_]{3,30})?" placeholder="نام کاربری" value={values.username} onChange={updateField} aria-invalid={Boolean(fieldErrors.username)} aria-describedby={fieldErrors.username ? "profile-edit-username-error" : undefined} />
            <label className="profile-input-label" htmlFor="profile-edit-username">نام کاربری</label>
          </div>
          {fieldErrors.username && <span className="profile-field-error" id="profile-edit-username-error" role="alert">{fieldErrors.username}</span>}
        </div>

        <div className="profile-edit-field profile-floating-field">
          <div className="profile-input-wrapper">
            <input dir="auto" id="profile-edit-email" name="email" type="email" autoComplete="email" required placeholder="ایمیل" value={values.email} onChange={updateField} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "profile-edit-email-error" : undefined} />
            <label className="profile-input-label" htmlFor="profile-edit-email">ایمیل</label>
          </div>
          {fieldErrors.email && <span className="profile-field-error" id="profile-edit-email-error" role="alert">{fieldErrors.email}</span>}
        </div>

        <div className="profile-edit-field">
          <div className="profile-edit-label-row">
            <label htmlFor="profile-edit-biography">معرفی کوتاه</label>
            <span className="profile-edit-count" id="profile-edit-biography-count">{values.biography.length} از ۲۸۰ نویسه</span>
          </div>
          <textarea
            dir="auto"
            id="profile-edit-biography"
            name="biography"
            rows={4}
            maxLength={280}
            placeholder="کمی دربارهٔ خودت، علایق یا چیزهایی که می‌خوانی بنویس…"
            value={values.biography}
            onChange={updateField}
            aria-describedby="profile-edit-biography-count"
          />
        </div>

        <div className="profile-edit-field profile-interests-field">
          <label htmlFor="profile-interest-input">موضوعات مورد علاقه</label>
          <div className="profile-interest-entry" dir="rtl">
            <div className="profile-input-wrapper">
              <input
                dir="auto"
                id="profile-interest-input"
                type="text"
                maxLength={40}
                value={interestInput}
                onChange={(event) => setInterestInput(event.target.value)}
                onKeyDown={handleInterestKeyDown}
                placeholder="مثلاً ادبیات، نویسندگی…"
                disabled={values.interests.length >= MAX_INTERESTS}
                aria-describedby="profile-interest-help"
              />
            </div>
            <button type="button" onClick={() => addInterest()} disabled={!interestInput.trim() || values.interests.length >= MAX_INTERESTS}>افزودن</button>
          </div>
          <span className="profile-edit-count" id="profile-interest-help">برای ثبت هر مورد Enter بزنید؛ حداکثر ۸ مورد.</span>
          {values.interests.length > 0 && (
            <div className="profile-edit-interest-tags" aria-label="علاقه‌مندی‌های انتخاب‌شده">
              {values.interests.map((interest) => (
                <button key={interest} type="button" onClick={() => removeInterest(interest)} aria-label={`حذف علاقه‌مندی ${interest}`}>
                  {interest}<XMarkIcon aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="profile-edit-error" role="alert">{error}</p>}

        <footer className="profile-edit-actions">
          <button className="profile-edit-cancel" type="button" onClick={onClose} disabled={isSaving || isUploading}>انصراف</button>
          <button className="profile-edit-save" type="submit" disabled={isSaving || isUploading}>
            {isUploading ? "در حال بارگذاری تصویر…" : isSaving ? "در حال ذخیره…" : "ذخیرهٔ تغییرات"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
