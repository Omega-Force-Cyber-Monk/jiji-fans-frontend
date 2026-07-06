"use client";

import React, { useRef, useState } from "react";
import { Popover } from "antd";
import dynamic from "next/dynamic";
import { EmojiClickData } from "emoji-picker-react";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { cn } from "@/utils/cn";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { useAppSelector } from "@/redux/hook";

// type SendPayload = {
//   text: string;
//   files: File[];
// };

type ChatInputProps = {
  disabled?: boolean;
  className?: string;
  receiver?: string | null;
  conversationId?: string | null;
  onLocalMessage?: (message: any) => void;
  onMessageAck?: (localId: string, serverMessage?: any) => void;
};

const ChatInput: React.FC<ChatInputProps> = ({
  disabled,
  className,
  conversationId,
  onLocalMessage,
  onMessageAck,
}) => {
  const { socket, messageApi } = useAppContext();
  const { user } = useAppSelector((state) => state.auth);
  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const addFiles = (fileList: FileList | File[] | null | undefined) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    setFiles((prev) => [...prev, ...arr]);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const pastedFiles: File[] = [];
    for (const it of items) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) pastedFiles.push(f);
      }
    }

    if (pastedFiles.length) addFiles(pastedFiles);
  };

  const send = async () => {
    const msg = text.trim();
    if (!msg && files.length === 0) return;

    if (!conversationId) {
      messageApi.error("No conversation selected.");
      return;
    }
    if (!socket) {
      messageApi.error("Chat is not connected yet.");
      return;
    }
    if (!socket.connected) {
      socket.connect();
      messageApi.warning("Reconnecting to chat...");
      return;
    }

    const payload = {
      conversationId,
      text: msg,
      attachments: [],
    };

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onLocalMessage?.({
      _id: localId,
      localId,
      sender: user?._id,
      conversationId,
      text: msg,
      attachments: [],
      createdAt: new Date().toISOString(),
      status: "sending",
    });

    setIsSending(true);
    socket.emit("send-new-message", payload, (ack: any) => {
      setIsSending(false);
      if (ack?.success) {
        const serverMessage =
          ack?.data || ack?.messageData || ack?.message || ack?.payload;
        onMessageAck?.(localId, serverMessage);
        setText("");
        setFiles([]);
        inputRef.current?.focus();
        return;
      }
      messageApi.error(ack?.message || "Failed to send message.");
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className={cn("px-3 lg:px-4", className)}>
      {/* attachments preview */}
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap pb-2 absolute bottom-[100%] left-0 w-full px-3 bg-primary-bg/85 backdrop-blur-sm">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary-bg rounded-full border border-border-primary text-sm text-primary-text shadow-xs"
            >
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                className="text-muted-text hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end bg-secondary-bg/85 p-2 rounded-2xl border border-border-primary/80 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/5 transition-all duration-300 shadow-inner">
        <Popover
          content={
            !disabled && (
              <EmojiPicker
                onEmojiClick={(emojiData: EmojiClickData) =>
                  setText((t) => t + emojiData.emoji)
                }
                lazyLoadEmojis
              />
            )
          }
          trigger={disabled ? undefined : "click"}
          placement="topLeft"
        >
          <button
            disabled={disabled}
            className="p-2 rounded-xl hover:bg-primary-bg text-muted-text transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add emoji"
          >
            <FaceSmileIcon className="size-5" />
          </button>
        </Popover>

        <input
          ref={fileRef}
          type="file"
          multiple
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <textarea
          ref={inputRef}
          value={text}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          placeholder={disabled ? "Connecting to chat..." : "Type a message..."}
          rows={1}
          className="flex-1 bg-transparent border-none shadow-none focus:ring-0 py-2 px-1 text-sm lg:text-base text-primary-text outline-none resize-none placeholder:text-muted-text/80 max-h-32 min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          onClick={send}
          disabled={disabled || isSending || (!text.trim() && files.length === 0)}
          aria-label="Send message"
          className={cn(
            "size-10 rounded-full flex items-center justify-center p-0 transition-all duration-300 shrink-0 border-none outline-none",
            (text.trim() || files.length > 0) && !disabled
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:opacity-95 shadow-sm hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
              : "bg-primary-bg dark:bg-primary-bg/50 text-muted-text/40 cursor-not-allowed"
          )}
        >
          {isSending ? (
            <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
