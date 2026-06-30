"use client";

import React, { useState } from "react";
import { Button, Input, Skeleton } from "antd";
import {
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiCornerDownRight,
  FiSend,
} from "react-icons/fi";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useGetCreatorRecentCommentsQuery, useAddReplyMutation } from "@/redux/features/content/content.api";
import Image from "@/components/ui/CImage";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/utils/cn";

dayjs.extend(relativeTime);

const LIMIT = 5;

interface CommentItem {
  _id: string;
  body: string;
  createdAt: string;
  parentCommentId: string | null;
  contentId?: { _id: string; title: string };
  userId?: { _id: string; username: string; avatar?: string };
}

interface CommentGroup {
  parent: CommentItem;
  replies: CommentItem[];
}

function groupComments(flat: CommentItem[]): CommentGroup[] {
  const parentMap = new Map<string, CommentGroup>();
  const orphans: CommentItem[] = [];

  flat.forEach((c) => {
    if (!c.parentCommentId) parentMap.set(c._id, { parent: c, replies: [] });
  });

  flat.forEach((c) => {
    if (c.parentCommentId) {
      if (parentMap.has(c.parentCommentId)) {
        parentMap.get(c.parentCommentId)!.replies.push(c);
      } else {
        orphans.push(c);
      }
    }
  });

  const groups = Array.from(parentMap.values());
  orphans.forEach((c) => groups.push({ parent: c, replies: [] }));
  return groups;
}

const Avatar = ({
  avatar,
  username,
  size = "md",
}: {
  avatar?: string;
  username: string;
  size?: "md" | "sm";
}) => {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const font = size === "sm" ? "text-xs" : "text-sm";
  const initial = (username || "U").charAt(0).toUpperCase();
  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 bg-secondary-bg border border-border-primary/50", dim)}>
      {avatar ? (
        <div className={cn("relative", dim)}>
          <Image src={avatar} alt={username} fill sizes={size === "sm" ? "28px" : "36px"} quality={90} className="object-cover" />
        </div>
      ) : (
        <div className={cn("flex items-center justify-center h-full w-full bg-secondary-bg", font)}>
          <span className="font-semibold text-muted-text">{initial}</span>
        </div>
      )}
    </div>
  );
};

const RecentComments = () => {
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data, isLoading, isFetching } = useGetCreatorRecentCommentsQuery({ page, limit: LIMIT });
  const [addReply, { isLoading: isReplying }] = useAddReplyMutation();

  const flat: CommentItem[] = data?.data?.results || [];
  const groups = groupComments(flat);
  const totalPages = data?.data?.totalPages || 1;
  const totalResults = data?.data?.totalResults || 0;

  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent.trim()) return;
    try {
      await addReply({ commentId, body: replyContent }).unwrap();
      setReplyingTo(null);
      setReplyContent("");
    } catch { /* silently fail */ }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
            <FiMessageSquare className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-primary-text leading-tight">Recent Comments</h2>
            {totalResults > 0 && (
              <p className="text-[11px] text-muted-text leading-none mt-0.5">{totalResults} total</p>
            )}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border-primary text-muted-text hover:text-primary-text hover:border-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <FiChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-muted-text min-w-[36px] text-center">{page}/{totalPages}</span>
            <button disabled={page >= totalPages || isFetching} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border-primary text-muted-text hover:text-primary-text hover:border-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-primary/30">

        {/* Loading */}
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-4 flex gap-3">
            <Skeleton.Avatar active size={36} />
            <div className="flex-1"><Skeleton active paragraph={{ rows: 1 }} title={{ width: "45%" }} /></div>
          </div>
        ))}

        {/* Empty */}
        {!isLoading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary-bg border border-border-primary flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-muted-text/40" />
            </div>
            <p className="text-sm font-medium text-primary-text">No comments yet</p>
          </div>
        )}

        {/* Comment groups */}
        {!isLoading && groups.map(({ parent, replies }) => {
          const isActive = replyingTo === parent._id;
          const username = parent.userId?.username || "Unknown";

          return (
            <div key={parent._id} className="py-4 space-y-4">

              {/* Content badge */}
              {parent.contentId?.title && (
                <div className="flex items-center gap-1.5 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 shrink-0 text-muted-text/50">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                  </svg>
                  <span className="text-[10px] text-muted-text truncate">{parent.contentId.title}</span>
                </div>
              )}

              {/* Parent comment row */}
              <div className="flex gap-3">
                <Avatar avatar={parent.userId?.avatar} username={username} size="md" />
                <div className="flex-1 min-w-0">
                  {/* Name + time */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-primary-text">{username}</span>
                    <span className="text-xs text-muted-text">{dayjs(parent.createdAt).fromNow()}</span>
                  </div>
                  {/* Body */}
                  <p className="text-sm text-secondary-text mt-1 leading-relaxed break-words">{parent.body}</p>
                  {/* Reply toggle */}
                  <button
                    onClick={() => { setReplyingTo(isActive ? null : parent._id); setReplyContent(""); }}
                    className="mt-2 text-xs font-semibold text-brand-primary hover:opacity-75 transition-opacity"
                  >
                    {isActive ? "Cancel" : "Reply"}
                  </button>
                  {/* Inline reply input */}
                  {isActive && (
                    <div className="flex gap-2 mt-2.5">
                      <Input
                        autoFocus
                        placeholder={`Reply to ${username}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onPressEnter={() => handleReplySubmit(parent._id)}
                        className="bg-primary-bg! border-border-primary! text-primary-text! placeholder:text-muted-text! hover:border-brand-primary! focus:border-brand-primary! text-sm! rounded-lg! h-8!"
                      />
                      <Button
                        type="primary"
                        loading={isReplying}
                        disabled={!replyContent.trim()}
                        onClick={() => handleReplySubmit(parent._id)}
                        className="h-8 w-8 p-0! flex items-center justify-center bg-brand-primary! border-transparent! text-black! rounded-lg! shrink-0 disabled:opacity-40! hover:opacity-90! cursor-pointer"
                        icon={<FiSend className="w-3.5 h-3.5" />}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Replies — indented thread style */}
              {replies.map((reply) => {
                const replyUser = reply.userId?.username || "Unknown";
                return (
                  <div key={reply._id} className="flex gap-2 items-start pl-2">
                    {/* ↳ arrow */}
                    <FiCornerDownRight className="w-3.5 h-3.5 text-muted-text/50 mt-1.5 shrink-0" />
                    {/* Smaller avatar */}
                    <Avatar avatar={reply.userId?.avatar} username={replyUser} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-primary-text">{replyUser}</span>
                        <span className="text-xs text-muted-text">{dayjs(reply.createdAt).fromNow()}</span>
                      </div>
                      <p className="text-sm text-secondary-text mt-0.5 leading-relaxed break-words">{reply.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentComments;
