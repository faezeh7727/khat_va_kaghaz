"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import Modal from "@/ui/Modal";
import SubmitButtun from "@/ui/SubmitButtun";
import numberFormatter from "@/utils/numberformater";
import { submitCommentAction } from "../_actions/commentactions";

const initialFormState = { success: false, message: "" };

function CommentDialog({ postId, slug, parentComment, onClose, onSuccess }) {
  const [state, formAction, pending] = useActionState(submitCommentAction, initialFormState);
  const isReply = Boolean(parentComment);

  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [onSuccess, state.message, state.success]);

  return (
    <Modal
      title={isReply ? "پاسخ به دیدگاه" : "ثبت دیدگاه جدید"}
      eyebrow="گفت‌وگو دربارهٔ نوشته"
      description={isReply ? `در پاسخ به ${parentComment.user?.name || "کاربر"}` : "نظر و تجربه‌تان را دربارهٔ این نوشته بنویسید."}
      onClose={onClose}
      closeDisabled={pending}
      size="sm"
      className="comment-dialog"
    >
      <form action={formAction} className="reading-comment-form comment-modal-form">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        {parentComment && <input type="hidden" name="parentId" value={parentComment._id} />}
        <label className="reading-comment-label" htmlFor="comment-modal-text">
          {isReply ? "متن پاسخ" : "متن دیدگاه"}
        </label>
        <textarea
          id="comment-modal-text"
          className="reading-comment-input"
          name="text"
          placeholder={isReply ? "پاسخ خود را بنویسید…" : "دیدگاه خود را بنویسید…"}
          minLength={10}
          maxLength={2000}
          rows={5}
          required
          autoFocus
        />
        <div className="reading-comment-form-footer">
          <span className="reading-comment-note">
            <ChatBubbleLeftEllipsisIcon aria-hidden="true" />
            حداقل ۱۰ و حداکثر ۲۰۰۰ نویسه
          </span>
          <SubmitButtun className="reading-comment-submit" pending={pending}>
            {pending ? "در حال ثبت…" : isReply ? "ثبت پاسخ" : "ثبت دیدگاه"}
          </SubmitButtun>
        </div>
        {state.message && !state.success && <p className="comment-form-error" role="alert">{state.message}</p>}
      </form>
    </Modal>
  );
}

export default function PostComments({ postId, slug, comments = [], commentsCount = 0, postTitle }) {
  const router = useRouter();
  const [dialog, setDialog] = useState(null);

  const handleSuccess = useCallback((message) => {
    setDialog(null);
    router.refresh();
    if (message) toast.success(message);
  }, [router]);

  return (
    <section id="comments" className="post-comments reading-article-comments" aria-labelledby="post-comments-title">
      <div className="post-comments-heading">
        <h2 id="post-comments-title">دیدگاه‌ها <span>({numberFormatter(commentsCount)})</span></h2>
        <button type="button" className="post-comment-new-button" onClick={() => setDialog({ parentComment: null })}>
          ثبت دیدگاه جدید
        </button>
      </div>

      {comments.length ? (
        <ol className="post-comments-list">
          {comments.map((comment) => (
            <li key={comment._id} className="post-comment">
              <div className="post-comment-meta">
                <strong>{comment.user?.name || "کاربر"}</strong>
                {comment.createdAt && <time>{comment.createdAt}</time>}
              </div>
              <p>{comment.content?.text}</p>
              {comment.openToComment !== false && (
                <button type="button" className="post-comment-reply-button" onClick={() => setDialog({ parentComment: comment })}>
                  پاسخ به دیدگاه
                </button>
              )}
              {comment.answers?.length > 0 && (
                <ol className="post-comment-answers">
                  {comment.answers.map((answer) => (
                    <li key={answer._id} className="post-comment-answer">
                      <div className="post-comment-meta">
                        <strong>{answer.user?.name || "کاربر"}</strong>
                        {answer.createdAt && <time>{answer.createdAt}</time>}
                      </div>
                      <p>{answer.content?.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="post-comments-empty">
          <span className="post-comments-empty-icon" aria-hidden="true">
            <ChatBubbleLeftEllipsisIcon />
          </span>
          <strong>هنوز دیدگاهی برای این نوشته ثبت نشده است.</strong>
          <span>شما اولین نفری باشید که تجربه یا نظر خود دربارهٔ خوانش «{postTitle}» را به اشتراک می‌گذارد.</span>
        </div>
      )}

      {dialog && (
        <CommentDialog
          key={dialog.parentComment?._id || "new-comment"}
          postId={postId}
          slug={slug}
          parentComment={dialog.parentComment}
          onClose={() => setDialog(null)}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  );
}
