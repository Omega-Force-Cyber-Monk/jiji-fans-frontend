"use client";

import React, { useRef, useState } from "react";
import { Button, Popover } from "antd";
import TextArea from "antd/es/input/TextArea";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
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
  //   onSend?: (payload: SendPayload) => void;
  //   conversationId: string;
  className?: string;
  receiver?: string | null;
  conversationId?: string | null;
  onLocalMessage?: (message: any) => void;
  onMessageAck?: (localId: string, serverMessage?: any) => void;
};

// const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
const ChatInput: React.FC<ChatInputProps> = ({
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

      <div className="flex gap-2 items-end bg-secondary-bg p-1.5 rounded-3xl border border-border-primary focus-within:border-emerald-500/30 focus-within:ring-1 focus-within:ring-emerald-500/10 transition-all">
        <Popover
          content={
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) =>
                setText((t) => t + emojiData.emoji)
              }
              lazyLoadEmojis
            />
          }
          trigger="click"
          placement="topLeft"
        >
          <button className="p-2 rounded-full hover:bg-primary-bg text-muted-text transition-colors shrink-0" aria-label="Add emoji">
            <FaceSmileIcon className="size-6" />
          </button>
        </Popover>
        
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <TextArea
          ref={inputRef}
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          autoSize={{ minRows: 1, maxRows: 5 }}
          className="flex-1 bg-transparent border-none! shadow-none! focus:ring-0! py-2 px-1 text-sm lg:text-base text-primary-text outline-none resize-none"
        />

        <Button
          loading={isSending}
          onClick={send}
          disabled={!text.trim() && files.length === 0}
          aria-label="Send message"
          className={cn(
            "size-10 rounded-full border-none! flex items-center justify-center p-0 transition-all shrink-0",
            text.trim() || files.length > 0 
              ? "bg-emerald-500 text-white hover:bg-emerald-600! shadow-sm" 
              : "bg-primary-bg dark:bg-primary-bg/50 text-muted-text"
          )}
        >
          <PaperAirplaneIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
