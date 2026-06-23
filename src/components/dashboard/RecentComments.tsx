"use client";

import React, { useState } from "react";
import { Avatar, Button, Input } from "antd";
import { FiMessageSquare, FiCornerDownRight } from "react-icons/fi";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  replies: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    user: { name: "Alice Johnson" },
    content: "Absolutely loved this recent video! The editing style is so crisp.",
    timestamp: "2 hours ago",
    replies: [],
  },
  {
    id: "2",
    user: { name: "Mark Smith" },
    content: "Can you do a tutorial on how you set up the lighting for this? It looks so cinematic.",
    timestamp: "5 hours ago",
    replies: [
      {
        id: "2-1",
        user: { name: "You" },
        content: "Yes! Planning to release a behind-the-scenes lighting breakdown next week.",
        timestamp: "1 hour ago",
        replies: [],
      }
    ],
  },
  {
    id: "3",
    user: { name: "Sarah Connor" },
    content: "This deserves way more views. Keep up the great work!",
    timestamp: "1 day ago",
    replies: [],
  },
  {
    id: "4",
    user: { name: "Jason Derulo" },
    content: "What camera are you using? The dynamic range is incredible.",
    timestamp: "2 days ago",
    replies: [],
  }
];

const RecentComments = () => {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (parentId: string) => {
    if (!replyContent.trim()) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [
              ...c.replies,
              {
                id: Math.random().toString(),
                user: { name: "You" },
                content: replyContent,
                timestamp: "Just now",
                replies: [],
              },
            ],
          };
        }
        return c;
      })
    );

    setReplyingTo(null);
    setReplyContent("");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
          <FiMessageSquare className="w-5 h-5 text-brand-primary" />
          Recent Comments
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Main Comment */}
            <div className="flex gap-4">
              <Avatar className="bg-brand-primary/20 text-brand-primary font-bold flex-shrink-0 shrink-0">
                {comment.user.name.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-primary-text truncate">{comment.user.name}</span>
                    <span className="text-sm text-muted-text whitespace-nowrap">{comment.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-secondary-text mt-1 break-words">{comment.content}</p>
                
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm font-semibold text-brand-primary mt-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0"
                >
                  {replyingTo === comment.id ? "Cancel Reply" : "Reply"}
                </button>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      autoFocus
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onPressEnter={() => handleReplySubmit(comment.id)}
                      className="bg-primary-bg border-border-primary text-primary-text h-10 rounded-md placeholder:text-muted-text hover:border-brand-primary focus:border-brand-primary"
                    />
                    <Button 
                      type="primary" 
                      onClick={() => handleReplySubmit(comment.id)}
                      className="h-10 px-4 bg-brand-primary text-black font-semibold rounded-md border-none hover:opacity-90 transition-all shrink-0 cursor-pointer"
                    >
                      Send
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-10 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <FiCornerDownRight className="w-4 h-4 text-muted-text mt-1.5 flex-shrink-0" />
                    <Avatar size="small" className="bg-primary-bg border border-brand-primary text-brand-primary font-semibold flex-shrink-0 mt-0.5">
                      {reply.user.name.charAt(0)}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary-text truncate">{reply.user.name}</span>
                        <span className="text-sm text-muted-text whitespace-nowrap">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm text-secondary-text mt-1 break-words">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentComments;
