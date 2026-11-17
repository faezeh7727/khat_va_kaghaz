/** @format */

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeftIcon,
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import RHFTextField from "@/ui/RHFtextfield";
import Logo from "@/ui/Logo";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import SpinnerMini from "@/ui/SpinnerMini";

export default function AuthForm({ mode = "signin" }) {
  const isSignUp = mode === "signup";
  const router = useRouter();
  const { signup, signin } = useAuth();
  const { theme, isReady } = useTheme();
  const activeTheme = isReady && theme === "dark" ? "dark" : "light";
  const [showPassword, setShowPassword] = useState(false);
  const schema = useMemo(() => yup.object({
    name: isSignUp
      ? yup.string().trim().required("وارد کردن نام الزامی است")
      : yup.string().notRequired(),
    email: yup.string().trim().email("ایمیل واردشده معتبر نیست").required("وارد کردن ایمیل الزامی است"),
    password: isSignUp
      ? yup.string().min(8, "گذرواژه باید حداقل ۸ نویسه باشد").required("وارد کردن گذرواژه الزامی است")
      : yup.string().required("وارد کردن گذرواژه الزامی است"),
  }), [isSignUp]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(values) {
    try {
      const result = isSignUp
        ? await signup({ name: values.name, email: values.email, password: values.password })
        : await signin({ email: values.email, password: values.password });
      toast.success(result.message || "Login successful");
      router.replace("/profile");
    } catch (error) {
      toast.error(error.message || "The request failed. Please try again.");
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <aside className="auth-story" dir="rtl">
        <div className="auth-story-topline">
          <Logo variant="stacked" />
          <span className="auth-story-badge">جایی برای اندیشه و نوشتن</span>
        </div>

        <figure className="auth-story-photo">
          <Image
            src={activeTheme === "dark" ? "/auth-writing-desk.png" : "/auth-writing-desk-light.png"}
            alt="میز نویسندگی کنار پنجره، با دفتر، قلم و فنجان فیروزه‌ای"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 520px"
          />
        </figure>

        <div className="auth-story-quote" aria-hidden="true">
          <span className="auth-quote-glyph">«</span>
          <p>هر نوشته، دریچه‌ای‌ست به جهانی تازه.</p>
          <span className="auth-quote-rule" />
          <span className="auth-quote-caption">از دفتر اهل قلم</span>
        </div>

        <div className="auth-story-features">
          <div className="auth-feature-item">
            <span className="auth-feature-icon" aria-hidden="true">✳</span>
            <span><strong>کارگاه‌های نوشتن</strong><small>برای رشد و کشف صدای نوشتاری شما</small></span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon" aria-hidden="true">❧</span>
            <span><strong>آرشیو یادداشت‌ها</strong><small>همراهی برای ثبت ایده‌های روزانه</small></span>
          </div>
        </div>
        <span className="auth-story-ornament auth-story-ornament-one" aria-hidden="true" />
        <span className="auth-story-ornament auth-story-ornament-two" aria-hidden="true" />
      </aside>

      <div className="auth-form-panel" dir="rtl">
        <div className="auth-form-heading">
          <div className="auth-form-kicker-row">
            <span className="auth-form-kicker">
              <span className="auth-form-status" aria-hidden="true" />
              <span className="auth-form-welcome">{isSignUp ? "آغاز یک همراهی تازه" : "خوش آمدید"}</span>
              <span className="auth-form-sparkle" aria-hidden="true">✨︎</span>
            </span>
          </div>
          <h1 id="auth-title">{isSignUp ? "ساخت حساب کاربری" : "ورود به حساب کاربری"}</h1>
          <p>
            {isSignUp
              ? "برای پیوستن به جمع اهل قلم، مشخصات خود را وارد کنید."
              : <>برای ادامهٔ خواندن و نوشتن، وارد حساب خود در <span className="auth-form-brand">خط و کاغذ</span> شوید.</>}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {isSignUp && (
            <RHFTextField
              type="text"
              label="نام و نام خانوادگی"
              name="name"
              dir="auto"
              register={register}
              errors={errors}
              placeholder="نام خود را بنویسید"
              autoComplete="name"
              startAdornment={<UserIcon />}
            />
          )}
          <RHFTextField
            type="text"
            inputMode="email"
            label="رایانامه | نام کاربری"
            name="email"
            dir="auto"
            register={register}
            errors={errors}
            placeholder="name@example.com"
            autoComplete="email"
            startAdornment={<AtSymbolIcon />}
          />
          <RHFTextField
            type={showPassword ? "text" : "password"}
            label="گذرواژه"
            name="password"
            dir="auto"
            register={register}
            errors={errors}
            placeholder="گذرواژهٔ حساب کاربری"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            startAdornment={<LockClosedIcon />}
            endAdornment={
              <button
                className="auth-password-toggle"
                type="button"
                aria-label={showPassword ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            }
          />

          <button className="auth-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <SpinnerMini />}
            <span>{isSubmitting ? (isSignUp ? "در حال ساخت حساب..." : "در حال ورود...") : (isSignUp ? "ساخت حساب کاربری" : "ورود به خط و کاغذ")}</span>
            {!isSubmitting && <ArrowLeftIcon aria-hidden="true" />}
          </button>
        </form>

        <div className="auth-form-footer">
          <p>
            {isSignUp ? "پیش‌تر حساب ساخته‌اید؟" : "هنوز به جمع اهل قلم نپیوسته‌اید؟"}{" "}
            <Link href={isSignUp ? "/signin" : "/signup"}>
              {isSignUp ? "وارد شوید" : "ثبت‌نام کنید"}
            </Link>
          </p>
          <span className="auth-security-note">
            <ShieldCheckIcon className="auth-security-icon" aria-hidden="true" />
            <span>نوشته‌ها و اطلاعات شما نزد ما محفوظ می‌ماند.</span>
          </span>
        </div>
      </div>
    </section>
  );
}
