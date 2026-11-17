/** @format */

import AuthForm from "../_components/AuthForm";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({
  title: "ساخت حساب کاربری",
  description: "در خط و کاغذ حساب کاربری بسازید و نوشته‌ها و ایده‌های خود را دنبال کنید.",
  robots: { index: false, follow: false },
});

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
