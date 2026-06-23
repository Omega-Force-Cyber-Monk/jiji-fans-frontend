"use client";
import React, { useEffect, useRef } from "react";
import PageHeading from "@/components/ui/PageHeading";
import { TUniObject } from "@/types";
import { cn } from "@/utils/cn";
import { Button, ConfigProvider, Form, FormProps, Input, Select, message } from "antd";

import { RoleGuard } from "@/components/guards";
import { useRouter } from "next/navigation";
import { useUploadContentMutation } from "@/redux/features/content/content.api";
import { applyApiErrorToForm, errorAlert, successAlert, TResError } from "@/lib/alerts";
import { useGetAllSubscriptionPlansQuery } from "@/redux/features/subscription/subscription.api";
import SectionContainer from "@/components/ui/SectionContainer";
import { Breadcrumb } from "antd";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("primereact/editor").then((mod) => mod.Editor), {
	ssr: false,
	loading: () => <div className="h-[320px] bg-secondary-bg animate-pulse rounded-md"></div>
});
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

const getYouTubeEmbedUrl = (url: string) => {
	if (!url) return "";
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	const videoId = (match && match[2].length === 11) ? match[2] : null;
	return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

const Page = () => {
	const [form] = Form.useForm();
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const videoUrl = Form.useWatch("url", form);
	const title = Form.useWatch("title", form);
	const subscriptionTier = Form.useWatch("subscriptionTier", form);
	const description = Form.useWatch("description", form);
	const [isFetchingMetadata, setIsFetchingMetadata] = React.useState(false);

	const [mutation, { isLoading }] = useUploadContentMutation();
	const {
		data: subscriptionPlans,
		isLoading: isLoadingPlans,
		error,
	} = useGetAllSubscriptionPlansQuery(undefined);

	// Automatically fetch YouTube Metadata when url changes
	useEffect(() => {
		if (!videoUrl) return;

		// Clean/validate YouTube URL
		const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=[\w-]+|v\/[\w-]+|shorts\/[\w-]+|live\/[\w-]+)|youtu\.be\/[\w-]+)/;
		if (!youtubePattern.test(videoUrl)) return;

		const fetchMetadata = async () => {
			setIsFetchingMetadata(true);
			try {
				const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
				const response = await fetch(oembedUrl);
				if (response.ok) {
					const data = await response.json();
					if (data.title) {
						// Auto-populate title if not manually filled yet
						const currentTitle = form.getFieldValue("title");
						if (!currentTitle) {
							form.setFieldsValue({ title: data.title });
						}
						// Auto-populate description editor with a paragraph if empty
						const currentDesc = form.getFieldValue("description");
						if (!currentDesc) {
							form.setFieldsValue({ description: `<p>${data.title}</p>` });
						}
					}
				}
			} catch (err) {
				console.error("Error fetching YouTube oEmbed details:", err);
			} finally {
				setIsFetchingMetadata(false);
			}
		};

		const delayDebounce = setTimeout(fetchMetadata, 600);
		return () => clearTimeout(delayDebounce);
	}, [videoUrl, form]);

	// Debug: Log the subscription plans data
	useEffect(() => {
		console.log("Subscription Plans Full Response:", subscriptionPlans);
		console.log("Subscription Plans Data:", subscriptionPlans?.data);
		console.log(
			"Subscription Plans Attributes:",
			subscriptionPlans?.data?.attributes
		);
		console.log("Loading:", isLoadingPlans);
		console.log("Error:", error);
	}, [subscriptionPlans, isLoadingPlans, error]);

	const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
		try {
			await mutation(values).unwrap();
			successAlert({ text: "Content uploaded successfully!" });
			form.resetFields();
			setTimeout(() => {
				router.push("/mychannel");
			}, 2000);
		} catch (error) {
			applyApiErrorToForm(error, form, [
				"url",
				"title",
				"subscriptionTier",
				"description",
			]);
			errorAlert({ error: error as TResError, messageApi });
		}
	};
	return (
		<RoleGuard allowedRoles={["Creator"]} redirectTo="/overview">
			<SectionContainer className="mt-6">
				{contextHolder}
				<Breadcrumb
					items={[
						{ title: "Home", href: "/overview" },
						{ title: "Upload Content" },
					]}
					className="mb-4"
				/>
				{/* <PageHeading title="Upload Content" backPath="/overview" /> */}
				<div className={cn("w-full mt-6 bg-secondary-bg p-8 rounded-lg border border-border-primary")}>
					<ConfigProvider
						theme={{
							token: {
								colorBgElevated: "var(--secondary-bg)",
								colorText: "var(--primary-text)",
								colorTextPlaceholder: "var(--muted-text)",
								colorBorder: "var(--border-primary)",
							},
							components: {
								Input: {
									colorBgContainer: "var(--secondary-bg)",
									colorText: "var(--primary-text)",
									colorTextPlaceholder: "var(--muted-text)",
								},
								Select: {
									colorBgContainer: "var(--secondary-bg)",
									colorText: "var(--primary-text)",
									colorTextPlaceholder: "var(--muted-text)",
								},
							},
						}}
					>
						<Form
							form={form}
							layout="vertical"
							initialValues={{
								language: "en",
							}}
							onFinish={onFinish}
							requiredMark={false}
							className="w-full"
						>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Left Column: Form Fields */}
								<div className="space-y-6">
									<Form.Item
										label="Upload Video URL"
										name="url"
										rules={[
											{
												required: true,
												message: "Video URL is required!",
											},
											{
												validator: (_: unknown, value: string) => {
													if (!value) {
														return Promise.resolve();
													}
													const youtubePattern =
														/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=[\w-]+|v\/[\w-]+)|youtu\.be\/[\w-]+)$/;
													if (!youtubePattern.test(value)) {
														return Promise.reject(
															new Error(
																"Please enter a valid YouTube video URL"
															)
														);
													}
													return Promise.resolve();
												},
											},
										]}
									>
										<Input size="large" placeholder="Enter video URL" />
									</Form.Item>

									<Form.Item
										label="Title of the video"
										name="title"
										rules={[
											{
												required: true,
												message: "Title is required!",
											},
										]}
										help={isFetchingMetadata ? "Fetching video details from YouTube..." : undefined}
										validateStatus={isFetchingMetadata ? "validating" : undefined}
									>
										<Input size="large" placeholder="Title here" disabled={isFetchingMetadata} />
									</Form.Item>

									<Form.Item
										label="Select Subscription Tier"
										name="subscriptionTier"
										rules={[
											{
												required: true,
												message: "Subscription tier is required!",
											},
										]}
										help={
											error
												? "Failed to load subscription plans. Please refresh the page."
												: undefined
										}
										validateStatus={error ? "error" : undefined}
									>
										<Select
											size="large"
											placeholder={
												isLoadingPlans
													? "Loading plans..."
													: "Select..."
											}
											loading={isLoadingPlans}
											disabled={isLoadingPlans}
											filterOption={(input, option) =>
												String(option?.label ?? "")
													.toLowerCase()
													.includes(input.toLowerCase())
											}
											options={(subscriptionPlans?.data || [])?.map(
												(plan: any) => ({
													label: `${plan.name} - $${plan.price}`,
													value: plan._id,
												})
											)}
											notFoundContent={
												isLoadingPlans
													? "Loading..."
													: "No subscription plans available"
											}
										/>
									</Form.Item>

									<Form.Item
										label={"Write a description about your video"}
										name="description"
										rules={[
											{
												required: true,
												message: "Description is required!",
											},
											{
												validator: (_: unknown, value: string) => {
													if (!value) {
														return Promise.resolve();
													}
													// Strip HTML tags to check if there is actual text or media
													const text = value.replace(/<[^>]*>/g, "").trim();
													const hasImage = value.includes("<img");
													const hasIframe = value.includes("<iframe");

													if (!text && !hasImage && !hasIframe) {
														return Promise.reject(
															new Error(
																"Description cannot be empty!"
															)
														);
													}
													return Promise.resolve();
												},
											},
										]}
									>
										<div className="w-full max-w-full overflow-hidden">
											<Editor
												value={description}
												onTextChange={(e) => form.setFieldsValue({ description: e.htmlValue })}
												style={{ height: "320px" }}
											/>
										</div>
									</Form.Item>

									<div className="w-full flex justify-center pt-4">
										<Button
											loading={isLoading}
											type="primary"
											size="large"
											htmlType="submit"
											className="px-2 w-full"
										>
											Submit
										</Button>
									</div>
								</div>

								{/* Right Column: Video Preview */}
								<div className="lg:border-l lg:border-border-primary lg:pl-8">
									{videoUrl && getYouTubeEmbedUrl(videoUrl) ? (
										<div className="space-y-6">
											<div>
												<h4 className="text-xl font-medium text-primary-text mb-4">Video Preview</h4>
												<div className="video-wrapper rounded-lg overflow-hidden border border-border-primary">
													<iframe
														src={getYouTubeEmbedUrl(videoUrl)}
														title="YouTube video player"
														frameBorder="0"
														allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
														allowFullScreen
													/>
												</div>
											</div>

											{/* Video Metadata Preview */}
											<div className="space-y-3">
												<h3 className="text-2xl font-semibold text-primary-text break-words">
													{title || "Untitled Video"}
												</h3>

												{subscriptionTier && (
													<div className="flex">
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
															{subscriptionPlans?.data?.find((p: any) => p._id === subscriptionTier)?.name || "Premium Plan"}
														</span>
													</div>
												)}

												<div
													className="no-tailwind text-base font-normal text-secondary-text break-words"
													dangerouslySetInnerHTML={{
														__html: description || "No description provided yet.",
													}}
												/>
											</div>
										</div>
									) : (
										<div className="h-full flex flex-col items-center justify-center border border-dashed border-border-primary rounded-lg p-8 bg-primary-bg/50 min-h-[300px]">
											<p className="text-muted-text text-center">Enter a valid YouTube URL to see the preview</p>
										</div>
									)}
								</div>
							</div>
						</Form>
					</ConfigProvider>
				</div>
			</SectionContainer>
		</RoleGuard>
	);
};

export default Page;
