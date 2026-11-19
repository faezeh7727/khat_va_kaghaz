"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import AuthorOnly from "../_components/AuthorOnly";
import PostEditorService from "@/services/PostEditorService";
import useActiveTimeTracking from "@/hooks/useActiveTimeTracking";

const emptyPost = { title: "", slug: "", category: "", briefText: "", text: "", type: "free", tags: [] };

function makeSlug(value) {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function EditorContent({ postId }) {
  const router = useRouter();
  const isEdit = Boolean(postId);
  const [form, setForm] = useState(emptyPost);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postLoaded, setPostLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
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
          slug: post.slug || "",
          category: post.category?._id || post.category || "",
          briefText: post.briefText || "",
          text: post.text || "",
          type: post.type || "free",
          tags: post.tags || [],
        });
        setTags((post.tags || []).join(", "));
        setExistingImage(post.coverImageUrl?.light || post.coverImage?.light || "");
        setSlugEdited(true);
      }
    }).catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [isEdit, postId]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const readingMinutes = useMemo(() => {
    const words = form.text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [form.text]);
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

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || form.title.trim().length < 5) return setError("عنوان باید دست‌کم ۵ نویسه باشد.");
    if (!form.slug.trim()) return setError("نشانی نوشته را وارد کن.");
    if (!form.category) return setError("یک دسته‌بندی انتخاب کن.");
    if (!form.briefText.trim() || !form.text.trim()) return setError("خلاصه و متن نوشته را کامل کن.");
    if (!isEdit && !image) return setError("برای نوشته تصویر کاور انتخاب کن.");

    const data = new FormData();
    data.set("title", form.title.trim());
    data.set("slug", form.slug.trim());
    data.set("category", form.category);
    data.set("briefText", form.briefText.trim());
    data.set("text", form.text);
    data.set("type", form.type);
    data.set("readingTime", String(readingMinutes));
    data.set("tags", JSON.stringify(tags.split(",").map((tag) => tag.trim()).filter(Boolean)));
    if (image) data.set("coverImage", image);

    setSaving(true);
    try {
      await PostEditorService.save(data, postId);
      router.push("/dashboard/posts");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="profile-loading" role="status">در حال بارگذاری فرم…</p>;
  if (isEdit && !postLoaded) return <main className="profile-page dashboard-page" dir="rtl"><p className="author-posts-message is-error" role="alert">{error || "این نوشته در دسترس نیست."}</p><Link className="author-back-link" href="/dashboard/posts">بازگشت به نوشته‌های من</Link></main>;

  return (
    <main className="profile-page dashboard-page author-editor-page" dir="rtl">
      <header className="author-page-heading">
        <div><span className="dashboard-kicker">پنل نویسنده</span><h1>{isEdit ? "ویرایش نوشته" : "نوشتن مطلب"}</h1><p>اطلاعات نوشته را وارد و ذخیره کن.</p></div>
        <Link className="author-back-link" href="/dashboard/posts"><ArrowRightIcon aria-hidden="true" /> نوشته‌های من</Link>
      </header>

      {error && <p className="author-posts-message is-error" role="alert">{error}</p>}
      <form className="author-post-form" onSubmit={submit}>
        <label>عنوان نوشته<input name="title" value={form.title} onChange={updateField} maxLength={100} required /></label>
        <label>نشانی نوشته<input name="slug" value={form.slug} onChange={(event) => { setSlugEdited(true); updateField(event); }} required dir="auto" /></label>
        <label>دسته‌بندی<select name="category" value={form.category} onChange={updateField} required><option value="">انتخاب دسته‌بندی</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.title}</option>)}</select></label>
        <label>نوع نوشته<select name="type" value={form.type} onChange={updateField}><option value="free">رایگان</option><option value="premium">ویژه</option></select></label>
        <label className="author-form-wide">خلاصه<textarea name="briefText" value={form.briefText} onChange={updateField} rows={3} required /></label>
        <label className="author-form-wide">متن نوشته<textarea name="text" value={form.text} onChange={updateField} rows={14} required /></label>
        <label className="author-form-wide">برچسب‌ها <span className="author-field-hint">با ویرگول جدا کن</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="ادبیات، داستان، نقد" /></label>
        <label className="author-form-wide">تصویر کاور <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => {
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
          const selected = event.target.files?.[0] || null;
          const selectedPreview = selected ? URL.createObjectURL(selected) : "";
          previewUrlRef.current = selectedPreview || null;
          setPreview(selectedPreview);
          setImage(selected);
        }} required={!isEdit} />{(preview || existingImage) && <Image className="author-cover-preview" src={preview || existingImage} alt="پیش‌نمایش کاور نوشته" width={768} height={432} unoptimized />}</label>
        <p className="author-reading-estimate">زمان مطالعه‌ی برآوردی: {readingMinutes} دقیقه</p>
        <div className="author-form-actions">
          <button className="author-action-button" type="submit" disabled={saving}>{saving ? "در حال ذخیره…" : <><CheckIcon aria-hidden="true" /> {isEdit ? "ذخیره‌ی تغییرات" : "انتشار نوشته"}</>}</button>
          <Link className="author-back-link" href="/dashboard/posts">انصراف</Link>
        </div>
      </form>
    </main>
  );
}

export default function PostEditorClient({ postId }) {
  return <AuthorOnly><EditorContent postId={postId} /></AuthorOnly>;
}
