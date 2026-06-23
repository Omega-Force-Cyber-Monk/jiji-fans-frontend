"use client";
import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { Avatar } from "antd";
import {
	PaperAirplaneIcon,
	CheckCircleIcon,
	ChatBubbleOvalLeftEllipsisIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface UnansweredMessage {
	id: string;
	username: string;
	avatar?: string;
	tier: string;
	duration: string;
	text: string;
	time: string;
	price: number;
}

interface CreatorMiniInboxProps {
	className?: string;
	showViewAll?: boolean;
}

const CreatorMiniInbox = ({ className, showViewAll = false }: CreatorMiniInboxProps) => {
	const [messages, setMessages] = useState<UnansweredMessage[]>([
		{
			id: "msg-1",
			username: "Sarah Jenkins",
			avatar: undefined,
			tier: "Elite Backstage",
			duration: "14 mo",
			text: "Loved the VIP behind-the-scenes video! When is the next exclusive track coming out?",
			time: "20m ago",
			price: 24.99,
		},
		{
			id: "msg-2",
			username: "Marcus Vance",
			avatar: undefined,
			tier: "VIP Fan Club",
			duration: "8 mo",
			text: "Hey! Can you check your DMs? Sent a collaboration proposal last week. Would love to chat!",
			time: "2h ago",
			price: 9.99,
		},
		{
			id: "msg-3",
			username: "Clara Alvarez",
			avatar: undefined,
			tier: "VIP Fan Club",
			duration: "5 mo",
			text: "The exclusive soundtrack is amazing! Is there any chance we can get a FLAC version?",
			time: "4h ago",
			price: 9.99,
		},
	]);

	const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
	const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
	const [sendingIds, setSendingIds] = useState<Record<string, boolean>>({});
	const [repliedIds, setRepliedIds] = useState<Record<string, boolean>>({});

	const handleReplySubmit = (msgId: string) => {
		const text = replyTexts[msgId]?.trim();
		if (!text) return;

		setSendingIds((prev) => ({ ...prev, [msgId]: true }));

		setTimeout(() => {
			setSendingIds((prev) => ({ ...prev, [msgId]: false }));
			setRepliedIds((prev) => ({ ...prev, [msgId]: true }));

			setTimeout(() => {
				setMessages((prev) => prev.filter((m) => m.id !== msgId));
				setActiveReplyId(null);
			}, 1000);
		}, 800);
	};

	return (
		<div className={cn("h-full flex flex-col justify-between overflow-hidden", className)}>
			{/* Header info */}
			<div className="flex flex-col shrink-0" style={{ marginBottom: "12px" }}>
				<h4 className="text-lg font-semibold text-primary-text" style={{ marginBottom: "6px" }}>Priority Inbox</h4>
				<p className="text-sm text-muted-text">
					Unanswered messages from your top subscribers
				</p>
			</div>

			{/* Message list container - Safely scrolls inside if items expand */}
			<div className="flex-1 overflow-y-auto no-scrollbar min-h-0 flex flex-col" style={{ gap: "8px" }}>
				{messages.length === 0 ? (
					<div 
						className="flex flex-col items-center justify-center h-full text-center bg-primary-bg/10 rounded-md border border-border-primary/40 border-dashed"
						style={{ padding: "16px", gap: "12px" }}
					>
						<CheckCircleIcon className="w-6 h-6 text-success" />
						<p className="text-xs text-primary-text font-medium">All caught up!</p>
					</div>
				) : (
					messages.map((msg) => {
						const isReplying = activeReplyId === msg.id;
						const isSending = sendingIds[msg.id];
						const isReplied = repliedIds[msg.id];
						const replyText = replyTexts[msg.id] || "";

						return (
							<div
								key={msg.id}
								className={cn(
									"border border-border-primary rounded-md transition-all duration-300 bg-primary-bg/10 flex flex-col justify-between overflow-hidden shrink-0",
									isReplying ? "border-brand-primary/60 bg-brand-primary/[0.01]" : "hover:border-brand-primary/20"
								)}
								style={{ padding: "12px", gap: "12px" }}
							>
								{/* Message Context Layer (Stays Visible) */}
								<div className="flex flex-col" style={{ gap: "8px" }}>
									<div className="flex items-start justify-between" style={{ gap: "8px" }}>
										<div className="flex items-center min-w-0" style={{ gap: "8px" }}>
											<Avatar size={30} className="bg-brand-primary/10 text-brand-primary font-semibold shrink-0">
												{msg.username.charAt(0)}
											</Avatar>
											<div className="flex flex-col min-w-0">
												{/* Responsive Wrap Grid for User Info & Badges */}
												<div className="flex items-center flex-wrap" style={{ gap: "6px" }}>
													<span className="text-sm text-primary-text font-semibold truncate">{msg.username}</span>
													<span 
														className="text-[10px] bg-brand-primary/15 text-brand-primary rounded font-medium truncate shrink-0"
														style={{ padding: "2px 6px" }}
													>
														{msg.tier}
													</span>
													<span 
														className="text-[10px] bg-indigo-500/10 text-indigo-400 rounded font-medium shrink-0"
														style={{ padding: "2px 6px" }}
													>
														{msg.duration}
													</span>
												</div>
											</div>
										</div>
										<span className="text-xs text-muted-text shrink-0" style={{ marginTop: "2px" }}>{msg.time}</span>
									</div>

									<p className="text-sm text-primary-text/80 leading-normal break-words">
										{msg.text}
									</p>
								</div>

								{/* Dynamic Action Footers or Fields */}
								<div className="transition-all duration-200">
									{isReplied ? (
										<div 
											className="flex items-center text-sm text-success bg-success/5 border border-success/15 rounded animate-fade-in"
											style={{ padding: "4px 8px", gap: "6px" }}
										>
											<CheckCircleIcon className="w-4 h-4 shrink-0" />
											<span>Reply sent! Marked resolved.</span>
										</div>
									) : isReplying ? (
										/* Expands cleanly under the message text */
										<div className="flex flex-col border-t border-border-primary/20 animate-fade-in" style={{ gap: "8px", paddingTop: "8px" }}>
											<textarea
												rows={2}
												value={replyText}
												onChange={(e) => setReplyTexts({ ...replyTexts, [msg.id]: e.target.value })}
												placeholder={`Reply to ${msg.username}...`}
												disabled={isSending}
												className="w-full text-sm rounded-md bg-primary-bg border border-border-primary focus:outline-none focus:border-brand-primary resize-none text-primary-text placeholder:text-muted-text"
												style={{ padding: "8px" }}
											/>
											<div className="flex justify-end" style={{ gap: "8px" }}>
												<button
													onClick={() => setActiveReplyId(null)}
													disabled={isSending}
													className="h-8 px-6 text-sm rounded-md border border-border-primary text-muted-text hover:text-primary-text transition-colors cursor-pointer"
												>
													Cancel
												</button>
												<button
													onClick={() => handleReplySubmit(msg.id)}
													disabled={isSending || !replyText.trim()}
													className={cn(
														"inline-flex items-center justify-center h-8 px-6 text-sm rounded-md bg-brand-primary text-white transition-colors font-semibold shadow-sm cursor-pointer",
														(!replyText.trim() || isSending) ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-primary/90"
													)}
													style={{ gap: "6px" }}
												>
													{isSending ? (
														<span className="w-4 h-4 border border-semibold text-white border-t-transparent rounded-md animate-spin" />
													) : (
														<PaperAirplaneIcon className="w-4 h-4 text-white" />
													)}
													<span className="text-white">Send</span>
												</button>
											</div>
										</div>
									) : (
										<div className="flex justify-between items-center border-t border-border-primary/10" style={{ paddingTop: "8px" }}>
											<span className="text-sm text-amber-500/80 font-medium">Unanswered</span>
											<button
												onClick={() => setActiveReplyId(msg.id)}
												className="inline-flex items-center text-sm text-brand-primary hover:text-brand-primary/80 transition-colors font-medium cursor-pointer"
												style={{ gap: "6px" }}
											>
												<ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
												<span>Reply</span>
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Sleek bottom footer with View All */}
			{showViewAll && messages.length > 0 && (
				<Link href="/admin/conversations" className="border-t border-border-primary/30 text-center shrink-0 block no-underline" style={{ marginTop: "12px", paddingTop: "8px" }}>
					<span className="text-sm text-brand-primary hover:text-brand-primary/80 transition-colors font-medium cursor-pointer">
						View All Priority Messages ({messages.length})
					</span>
				</Link>
			)}
		</div>
	);
};

export default CreatorMiniInbox;