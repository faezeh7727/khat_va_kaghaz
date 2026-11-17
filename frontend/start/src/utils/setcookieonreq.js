import { cookies } from "next/headers";

export default async function setCookieOnReq(requestOptions = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const headers = new Headers(requestOptions.headers);

  if (cookieHeader) headers.set("cookie", cookieHeader);

  return { ...requestOptions, headers };
}
