"use client";

import { startTransition, useOptimistic, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon as HeartOutlineIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import ButtonIcon from "@/ui/buttonicon";
import numberFormatter from "@/utils/numberformater";
import { useAuth } from "@/context/AuthContext";
import { bookmarkPostAction, likePostAction } from "../_actions/postactions";

function actionErrorMessage(result) {
  if (result.status === 401 || result.status === 403) {
    return "برای انجام این کار، ابتدا وارد حساب کاربری شوید.";
  }
  return result.message || "ثبت تغییر انجام نشد. دوباره تلاش کنید.";
}

export default function PostInteraction({
  postId,
  slug,
  isLiked = false,
  likesCount = 0,
  commentsCount = 0,
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [likeState, setLikeState] = useOptimistic(
    { liked: isLiked, likes: Number(likesCount) || 0 },
    (_current, next) => next,
  );
  const [pending, setPending] = useState(false);
  const { liked, likes } = likeState;

  async function likeHandler() {
    if (!postId || pending) return;
    if (!user) {
      toast.error("برای لایک کردن نوشته، ابتدا وارد حساب کاربری شوید.");
      return;
    }

    const previous = likeState;
    const next = {
      liked: !previous.liked,
      likes: Math.max(0, previous.likes + (previous.liked ? -1 : 1)),
    };
    setPending(true);

    startTransition(async () => {
      setLikeState(next);
      try {
        const result = await likePostAction(postId);
        if (!result.success) throw result;
        toast.success(result.message);
        router.refresh();
      } catch (error) {
        setLikeState(previous);
        toast.error(actionErrorMessage(error));
      } finally {
        setPending(false);
      }
    });
  }

  function openComments() {
    const targetPath = `/blogs/${slug}`;
    if (pathname === targetPath) {
      document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(`${targetPath}#comments`);
  }

  return (
    <div className={`post-interactions ${className}`.trim()}>
      <ButtonIcon
        aria-label={liked ? "برداشتن پسند" : "پسندیدن نوشته"}
        aria-pressed={liked}
        title={liked ? "برداشتن پسند" : "پسندیدن نوشته"}
        variant={liked ? "danger" : "outline"}
        className="post-interaction-button post-interaction-like"
        onClick={likeHandler}
        disabled={pending}
      >
        {liked ? <HeartSolidIcon aria-hidden="true" /> : <HeartOutlineIcon aria-hidden="true" />}
        <span>{numberFormatter(likes)}</span>
      </ButtonIcon>
      <ButtonIcon
        aria-label={`رفتن به دیدگاه‌ها، ${numberFormatter(commentsCount)} دیدگاه`}
        title="دیدگاه‌ها"
        variant="outline"
        className="post-interaction-button post-interaction-comments"
        onClick={openComments}
      >
        <ChatBubbleOvalLeftEllipsisIcon aria-hidden="true" />
        <span>{numberFormatter(commentsCount)}</span>
      </ButtonIcon>
    </div>
  );
}

export function BookmarkAction({ postId, isBookmarked = false, className = "" }) {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useOptimistic(isBookmarked, (_current, next) => next);
  const [pending, setPending] = useState(false);

  async function bookmarkHandler() {
    if (!postId || pending) return;
    if (!user) {
      toast.error("برای ذخیره نوشته، ابتدا وارد حساب کاربری شوید.");
      return;
    }

    const previous = bookmarked;
    setPending(true);

    startTransition(async () => {
      setBookmarked(!previous);
      try {
        const result = await bookmarkPostAction(postId);
        if (!result.success) throw result;
        toast.success(result.message);
        router.refresh();
      } catch (error) {
        setBookmarked(previous);
        toast.error(actionErrorMessage(error));
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <span className="post-bookmark-control">
      <ButtonIcon
        aria-label={bookmarked ? "حذف از ذخیره‌ها" : "ذخیره نوشته"}
        aria-pressed={bookmarked}
        title={bookmarked ? "حذف از ذخیره‌ها" : "ذخیره نوشته"}
        variant={bookmarked ? "primary" : "outline"}
        className={`post-card-bookmark ${className}`.trim()}
        onClick={bookmarkHandler}
        disabled={pending}
      >
        {bookmarked ? <BookmarkSlashIcon aria-hidden="true" /> : <BookmarkIcon aria-hidden="true" />}
      </ButtonIcon>
    </span>
  );
}
