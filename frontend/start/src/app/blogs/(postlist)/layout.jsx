/** @format */

import CategoryList from "../_components/categoryList";
import Search from "@/ui/search";

export const metadata = {
  title: "بلاگ‌ها",
};

export default function BlogLayout({ children }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pt-4 pb-8 sm:px-6 sm:pt-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
      <CategoryList />
      <main className="min-w-0">
        <Search />
        {children}
      </main>
    </div>
  );
}
