/** @format */
import { Suspense } from "react";
import getCategories from "./getcategores";
import CategoryListView from "./categorylistview";
import CategoryItem from "./categoryitem";
import Spinner from "@/uiSpinner";


async function CategoryListData() {
  const categories = await getCategories();
  return (
    <ul className="category-capsule-list flex w-max gap-2 lg:w-full lg:flex-col lg:gap-1.5">
      <CategoryItem
        category={{ _id: "all", title: "\u0647\u0645\u0647", slug: "__all__" }}
      />
      {categories.map((category) => (
        <CategoryItem key={category._id} category={category} />
      ))}
    </ul>
  );
}

export default function CategoryList() {
  return (
    <CategoryListView>
      <Suspense
        fallback={
          <div className="category-data-loading">
            <Spinner label="در حال دریافت دسته‌بندی‌ها" />
          </div>
        }
      >
        <CategoryListData />
      </Suspense>
    </CategoryListView>
  );
}
