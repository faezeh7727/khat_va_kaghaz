/** @format */

export default async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/category/list`,
      { cache: "no-store" },
    );

    if (!res.ok) return [];

    const result = await res.json();
    const categories =
      Array.isArray(result?.data?.categories) ? result.data.categories : [];

    return categories;
  } catch {
    return [];
  }
}
