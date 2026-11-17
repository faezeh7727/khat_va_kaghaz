/** @format */
import localFont from "next/font/local";
import SiteHeader from "@/components/SiteHeader";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata = {
  title: {
    template: "%s | خط و کاغذ",
    default: "خط و کاغذ",
  },
  description: "وب اپلیکیشن اندیشه و ادبیات",
};

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/vazir/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
});

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.className}>
      <body className="min-h-screen">
        <div className="site-background-rings" aria-hidden="true" />
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            <div>{children}</div>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
