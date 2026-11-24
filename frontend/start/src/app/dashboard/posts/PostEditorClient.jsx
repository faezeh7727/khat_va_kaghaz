"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ClockIcon, DocumentTextIcon, PhotoIcon, TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AuthorOnly from "../_components/AuthorOnly";
import PostEditorService from "@/services/PostEditorService";
import useActiveTimeTracking from "@/hooks/useActiveTimeTracking";
import SubmitButtun from "@/ui/SubmitButtun";
import ImageCropDialog from "@/ui/ImageCropDialog";

const emptyPost = { title: "", slug: "", category: "", briefText: "", text: "", type: "free", status: "published", tags: [], readingTime: "" };

function makeSlug(value) {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function getPersianPostError(message, status = "published") {
  const value = String(message || "").toLocaleLowerCase();
  if (/category.*(cast|objectid|bson)|cast to objectid|bson type error/.test(value)) return "دسته‌بندی معتبر نیست. لطفاً دوباره انتخابش کن.";
  if (/e11000|duplicate key|slug.*(unique|duplicate)/.test(value)) return "این نشانی قبلاً استفاده شده است؛ یک نشانی دیگر انتخاب کن.";
  if (/limit_file_size|file too large|file size|larger than/.test(value)) return "حجم تصویر کاور نباید بیشتر از ۲ مگابایت باشد.";
  if (/filetype|file type|file format|فرمت/.test(value)) return "فرمت تصویر معتبر نیست. فایل JPG، PNG، WebP یا GIF انتخاب کن.";
  if (/readingtime|reading time/.test(value)) return "زمان مطالعه باید یک عدد معتبر و دست‌کم ۱ دقیقه باشد.";
  if (/category/.test(value)) return "برای انتشار، یک دسته‌بندی معتبر انتخاب کن.";
  if (/title/.test(value)) return "عنوان باید بین ۵ تا ۱۰۰ نویسه باشد.";
  if (/slug/.test(value)) return "نشانی نوشته را وارد کن.";
  if (/brieftext|text/.test(value)) return "خلاصه و متن نوشته را کامل کن.";
  if (/coverimage|cover image/.test(value)) return "برای انتشار، یک تصویر کاور انتخاب کن.";
  if (/type/.test(value)) return "نوع دسترسی نوشته معتبر نیست.";
  if (/پیش.?نویس/.test(value)) return "اطلاعات پیش‌نویس معتبر نیست. موارد واردشده را بررسی کن.";
  if (/برائے|Ø|Ã|validation failed|validationerror|casterror|bson/.test(value)) return status === "draft"
    ? "ذخیره‌ی پیش‌نویس انجام نشد. اطلاعات واردشده را بررسی کن."
    : "اطلاعات نوشته معتبر نیست. عنوان، نشانی، دسته‌بندی، خلاصه، متن و تصویر کاور را بررسی کن.";
  if (/network|failed to fetch|err_network|timeout/.test(value)) return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کن.";
  return "ذخیره انجام نشد. اطلاعات نوشته را بررسی و دوباره تلاش کن.";
}

function EditorContent({ postId }) {
  const router = useRouter();
  const isEdit = Boolean(postId);
  const [form, setForm] = useState(emptyPost);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(null);
  const [isCoverCropOpen, setIsCoverCropOpen] = useState(false);
  const [existingImage, setExistingImage] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postLoaded, setPostLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const previewUrlRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = isEdit
      ? Promise.all([PostEditorService.getCategories(), PostEditorService.getMyPost(postId)])
      : PostEditorService.getCategories().then((loadedCategories) => [loadedCategories, null]);

    load.then(([loadedCategories, post]) => {
      if (!active) return;
      setCategories(loadedCategories);
      if (post) {
        setPostLoaded(true);
        setForm({
          title: post.title || "",
          slug: post.status === "draft" && /^draft-[a-f0-9]{24}$/i.test(post.slug || "") ? "" : post.slug || "",
          category: post.category?._id || post.category || "",
          briefText: post.briefText || "",
          text: post.text || "",
          type: post.type || "free",
          status: post.status || "published",
          tags: post.tags || [],
          readingTime: post.readingTime ? String(post.readingTime) : "",
        });
        setTags(post.tags || []);
        setExistingImage(post.coverImageUrl?.light || post.coverImage?.light || "");
        setSlugEdited(!(post.status === "draft" && /^draft-[a-f0-9]{24}$/i.test(post.slug || "")));
      }
    }).catch((loadError) => { if (active) setError(getPersianPostError(loadError.message)); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [isEdit, postId]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const wordCount = useMemo(() => form.text.trim().split(/\s+/).filter(Boolean).length, [form.text]);
  const suggestedReadingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const selectedReadingMinutes = Number.parseInt(form.readingTime, 10);
  const readingMinutes = Number.isInteger(selectedReadingMinutes) && selectedReadingMinutes > 0
    ? selectedReadingMinutes
    : suggestedReadingMinutes;
  const recordWritingTime = useCallback(
    (seconds, day) => PostEditorService.recordWritingTime(seconds, day),
    [],
  );
  useActiveTimeTracking(!loading && (!isEdit || postLoaded), recordWritingTime);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "title" && !slugEdited ? { slug: makeSlug(value) } : {}),
    }));
  };

  function addTags(value) {
    const nextTags = value.split(/[،,]/).map((tag) => tag.trim()).filter(Boolean);
    if (nextTags.length) {
      setTags((current) => [...new Set([...current, ...nextTags])]);
    }
    setTagInput("");
  }

  function handleCoverCrop(croppedFile) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    setError("");
    const selectedPreview = URL.createObjectURL(croppedFile);
    previewUrlRef.current = selectedPreview;
    setPreview(selectedPreview);
    setImage(croppedFile);
    setIsCoverCropOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const nextStatus = event.nativeEvent.submitter?.value || form.status || "published";
    if (form.title.length > 100) return setError("عنوان نمی‌تواند بیشتر از ۱۰۰ نویسه باشد.");
    if (form.category && !/^[a-f\d]{24}$/i.test(form.category)) return setError("دسته‌بندی معتبر نیست. لطفاً دوباره انتخابش کن.");
    if (form.type && !["free", "premium"].includes(form.type)) return setError("نوع دسترسی نوشته معتبر نیست.");
    if (nextStatus === "published") {
      if (form.readingTime && (!Number.isInteger(Number(form.readingTime)) || Number(form.readingTime) < 1)) return setError("زمان مطالعه باید یک عدد صحیح و دست‌کم ۱ دقیقه باشد.");
      if (!form.title.trim() || form.title.trim().length < 5) return setError("عنوان نوشته باید دست‌کم ۵ نویسه باشد.");
      if (!form.slug.trim()) return setError("نشانی نوشته را وارد کن.");
      if (!form.category) return setError("برای انتشار، یک دسته‌بندی انتخاب کن.");
      if (!form.briefText.trim() || !form.text.trim()) return setError("خلاصه و متن نوشته را کامل کن.");
      if (!image && !existingImage) return setError("برای انتشار نوشته تصویر کاور انتخاب کن.");
    }

    const data = new FormData();
    data.set("title", form.title.trim());
    data.set("slug", form.slug.trim());
    if (form.category) data.set("category", form.category);
    data.set("briefText", form.briefText.trim());
    data.set("text", form.text);
    data.set("type", form.type);
    data.set("readingTime", String(readingMinutes));
    data.set("tags", JSON.stringify([...new Set([...tags, ...tagInput.split(/[،,]/).map((tag) => tag.trim()).filter(Boolean)])]));
    data.set("status", nextStatus);
    if (image) data.set("coverImage", image);

    setSaving(true);
    setSavingStatus(nextStatus);
    try {
      await PostEditorService.save(data, postId);
      router.push("/dashboard/posts");
      router.refresh();
    } catch (saveError) {
      setError(getPersianPostError(saveError.message, nextStatus));
    } finally {
      setSaving(false);
      setSavingStatus(null);
    }
  }

  if (loading) return <p className="profile-loading" role="status">در حال بارگذاری فرم…</p>;
  if (isEdit && !postLoaded) return <main className="profile-page dashboard-page" dir="rtl"><p className="author-posts-message is-error" role="alert">{error || "این نوشته در دسترس نیست."}</p><Link className="author-back-link" href="/dashboard/posts">بازگشت به نوشته‌های من</Link></main>;

  return (
    <main className="profile-page dashboard-page author-editor-page" dir="rtl">
      <header className="author-page-heading author-editor-heading">
        <div>
          <span className="dashboard-kicker">پنل نویسنده <span className="author-heading-divider">/</span> {isEdit ? "ویرایش نوشته" : "نوشتن مطلب"}</span>
          <span className="author-editor-status"><i aria-hidden="true" />میز تحریر دیجیتال</span>
          <h1>{isEdit ? "ویرایش نوشته" : "نوشتن مطلب"}</h1>
          <p>ایده‌ات را بنویس، جزئیات را تنظیم کن و آماده‌ی انتشارش کن.</p>
        </div>
        <Link className="author-back-link" href="/dashboard/posts"><ArrowRightIcon aria-hidden="true" /> نوشته‌های من</Link>
      </header>

      <section className="author-writing-overview" aria-label="آمار نوشته">
        <div className="author-writing-overview-label"><DocumentTextIcon aria-hidden="true" /><span>وضعیت نگارش</span><strong>{form.status === "draft" ? "پیش‌نویس" : "در حال نگارش"}</strong></div>
        <div className="author-writing-metrics">
          <span><DocumentTextIcon aria-hidden="true" /> {wordCount.toLocaleString("fa-IR")} واژه</span>
          <span><ClockIcon aria-hidden="true" /> {readingMinutes.toLocaleString("fa-IR")} دقیقه خوانش</span>
        </div>
      </section>

      {error && <p className="author-posts-message is-error" role="alert">{error}</p>}

      <form className="author-post-form author-editor-form" onSubmit={submit}>
        <div className="author-editor-main">
          <section className="author-editor-card author-editor-details" aria-label="اطلاعات نوشته">
            <div className="author-editor-card-heading"><DocumentTextIcon aria-hidden="true" /><div><h2>مشخصات نوشته</h2><p>عنوان و معرفی کوتاه مطلبت را وارد کن.</p></div></div>
            <div className="author-editor-fields">
              <label className="author-title-field"><span>عنوان نوشته <b aria-hidden="true">*</b></span><input name="title" value={form.title} onChange={updateField} maxLength={100} placeholder="عنوان جذاب و متناسب برای نوشته…" /></label>
              <label className="author-slug-field"><span>نشانی نوشته <span className="author-field-hint">(Slug)</span></span><div className="author-slug-input" dir="ltr"><span>/blogs/</span><input name="slug" value={form.slug} onChange={(event) => { setSlugEdited(true); updateField(event); }} dir="auto" placeholder="my-creative-story" /></div></label>
              <label className="author-summary-field"><span>خلاصه <span className="author-field-hint">نمایش در کارت‌ها و نتایج جستجو</span></span><textarea name="briefText" value={form.briefText} onChange={updateField} rows={3} placeholder="چکیده‌ای کوتاه و گیرا از این مطلب بنویس…" /></label>
            </div>
          </section>

          <section className="author-editor-card author-editor-canvas" aria-label="متن نوشته">
            <div className="author-editor-card-heading author-canvas-heading"><DocumentTextIcon aria-hidden="true" /><div><h2>متن اصلی نوشته</h2><p>با صدای خودت بنویس؛ هر وقت آماده بودی می‌توانی پیش‌نویس را ذخیره کنی.</p></div><span className="author-word-count">{wordCount.toLocaleString("fa-IR")} واژه</span></div>
            <textarea className="author-writing-canvas" name="text" value={form.text} onChange={updateField} rows={18} placeholder="نوشتن را از این‌جا آغاز کن…" />
            <div className="author-canvas-footer"><span>نگارش فارسی</span><span><ClockIcon aria-hidden="true" /> زمان مطالعه: {readingMinutes.toLocaleString("fa-IR")} دقیقه</span></div>
          </section>
        </div>

        <aside className="author-editor-sidebar">
          <section className="author-editor-card author-cover-card">
            <div className="author-sidebar-heading"><PhotoIcon aria-hidden="true" /><div><h2>تصویر کاور</h2><p>نسبت ۱۶:۹ توصیه می‌شود</p></div></div>
            <div className={`author-cover-dropzone${preview || existingImage ? " has-image" : ""}`}>
              {(preview || existingImage)
                ? <Image className="author-cover-preview" src={preview || existingImage} alt="پیش‌نمایش کاور نوشته" width={768} height={432} unoptimized />
                : <div className="author-cover-empty"><span className="author-cover-background" aria-hidden="true" /><PhotoIcon aria-hidden="true" /><strong>تصویر شاخص را انتخاب کن</strong><span>پشتیبانی از JPG، PNG، WebP یا GIF (حداکثر ۲ مگابایت، نسبت ۱۶:۹)</span></div>}
              <div className="author-cover-actions">
                <button
                  type="button"
                  className="author-cover-action author-cover-change"
                  onClick={() => setIsCoverCropOpen(true)}
                  aria-label={preview || existingImage ? "تغییر تصویر کاور" : "انتخاب تصویر کاور"}
                >
                  {preview || existingImage ? "تغییر تصویر" : "انتخاب تصویر"}
                </button>
              </div>
            </div>
          </section>

          <section className="author-editor-card author-publishing-card">
            <div className="author-sidebar-heading"><TagIcon aria-hidden="true" /><div><h2>ویژگی‌ها و دسته‌بندی</h2><p>موضوع و دسترسی نوشته را مشخص کن.</p></div></div>
            <label><span>دسته‌بندی موضوعی</span><select name="category" value={form.category} onChange={updateField}><option value="">انتخاب دسته‌بندی</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.title}</option>)}</select></label>
            <label><span>نوع دسترسی نوشته</span><select name="type" value={form.type} onChange={updateField}><option value="free">رایگان (عمومی)</option><option value="premium">ویژه</option></select></label>
            <label className="author-reading-time-field"><span>زمان مطالعه <span className="author-field-hint">دقیقه خوانش</span></span><input name="readingTime" type="number" min="1" step="1" inputMode="numeric" value={form.readingTime || suggestedReadingMinutes} onChange={updateField} aria-describedby="reading-time-help" /><span className="author-field-hint" id="reading-time-help">زمان پیشنهادی بر اساس تعداد واژه‌هاست؛ می‌توانی آن را تغییر بدهی.</span></label>
            <div className="author-tags-field">
              <div className="author-tags-label"><label htmlFor="author-tags-input">برچسب‌ها</label><span className="author-field-hint">با ویرگول جدا کن</span></div>
              <div className="author-tags-input-wrap">
                {tags.map((tag) => <span className="author-tag-chip" key={tag}><span># {tag}</span><button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))} aria-label={`حذف برچسب ${tag}`}><XMarkIcon aria-hidden="true" /></button></span>)}
                <input id="author-tags-input" value={tagInput} onChange={(event) => {
                  const parts = event.target.value.split(/[،,]/);
                  if (parts.length > 1) {
                    const completed = parts.slice(0, -1).map((tag) => tag.trim()).filter(Boolean);
                    if (completed.length) setTags((current) => [...new Set([...current, ...completed])]);
                  }
                  setTagInput(parts.at(-1));
                }} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "," || event.key === "،") {
                    event.preventDefault();
                    addTags(tagInput);
                  } else if (event.key === "Backspace" && !tagInput && tags.length) {
                    setTags((current) => current.slice(0, -1));
                  }
                }} onBlur={() => { if (tagInput.trim()) addTags(tagInput); }} placeholder="برچسب جدید اضافه کنید و Enter بزنید…" />
              </div>
            </div>
          </section>

          <aside className="author-writing-tip"><strong>نکته‌ی نگارشی</strong><p>عنوان روشن و شروع گیرا، خواننده را برای ادامه‌ی مطلب همراه می‌کند.</p></aside>
        </aside>

        <footer className="author-editor-actions">
          <div className="author-editor-estimate"><span><ClockIcon aria-hidden="true" /> زمان مطالعه‌ی برآوردی: <strong>{readingMinutes.toLocaleString("fa-IR")} دقیقه</strong></span><span className="author-editor-separator">•</span><span>{wordCount.toLocaleString("fa-IR")} واژه</span></div>
          <div className="author-form-actions">
            <Link className="author-back-link" href="/dashboard/posts">انصراف</Link>
            <SubmitButtun className="author-save-draft-button" name="status" value="draft" pending={saving && savingStatus === "draft"} disabled={saving && savingStatus !== "draft"}>ذخیره‌ی پیش‌نویس</SubmitButtun>
            <SubmitButtun className="author-action-button" name="status" value="published" pending={saving && savingStatus === "published"} disabled={saving && savingStatus !== "published"}>{saving && savingStatus === "published" ? "در حال ذخیره..." : <><CheckIcon aria-hidden="true" /> {isEdit && form.status === "published" ? "ذخیره و انتشار" : "انتشار نوشته"}</>}</SubmitButtun>
          </div>
        </footer>
      </form>
      <ImageCropDialog
        open={isCoverCropOpen}
        onClose={() => setIsCoverCropOpen(false)}
        onConfirm={handleCoverCrop}
        title="تنظیم تصویر کاور"
        aspect={16 / 9}
        helpText="تصویر کاور را جابه‌جا و بزرگ‌نمایی کنید تا در قاب ۱۶:۹ قرار بگیرد."
      />
    </main>
  );
}

export default function PostEditorClient({ postId }) {
  return <AuthorOnly><EditorContent postId={postId} /></AuthorOnly>;
}
