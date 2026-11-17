/** @format */

import AuthForm from "../_components/AuthForm";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({
  title: "ورود به حساب کاربری",
  description: "برای ورود به حساب کاربری خط و کاغذ، ایمیل و گذرواژهٔ خود را وارد کنید.",
  robots: { index: false, follow: false },
});

export default function SignInPage() {
  return <AuthForm mode="signin" />;
}
