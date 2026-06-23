"use client";

import { cn } from "@/utils/cn";
import { Button, ConfigProvider, Form, FormProps, Input, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import ClientButton from "../ui/ClientButtton";
import { ArrowLeftIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import SuccessAnimation from "../ui/SuccessAnimation";
import { useState } from "react";

type FieldType = {
	password: string;
	confirmPassword: string;
	//   terms?: boolean;
};

const ResetPass = () => {
	const [form] = Form.useForm();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [messageApi, contextHolder] = message.useMessage();
	const [mutation, { isLoading }] = useResetPasswordMutation();
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	console.log("Token in reset pass", token);
	const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
		try {
			const response = await mutation({
				newPassword: values.password,
				token,
			}).unwrap();
			if (response.success) {
				setSuccessMessage(response.message);
				setShowSuccessAnimation(true);
			}
		} catch (error) {
			applyApiErrorToForm(error, form, [
				"password",
				"confirmPassword",
			]);
			errorAlert({ error: error as TResError, messageApi });
		}
	};

	const handleAnimationComplete = () => {
		router.replace("/sign-in");
	};

	return (
		<ConfigProvider
			theme={{
				token: {
					colorBgElevated: "var(--primary-bg)",
					colorText: "var(--primary-text)",
				},
				components: {
					Input: {
						borderRadiusLG: 30,
						colorBgContainer: "var(--primary-bg)",
						colorText: "var(--primary-text)",
						colorTextPlaceholder: "var(--muted-text)",
					},
					Button: {
						borderRadiusLG: 30,
						colorBgContainer: "var(--brand-primary)",
						colorText: "#fff",
					},
				},
			}}
		>
			{showSuccessAnimation && (
				<SuccessAnimation
					message={successMessage}
					onAnimationComplete={handleAnimationComplete}
				/>
			)}
			<div className={cn("w-full")}>
				{contextHolder}
				<div className="text-center space-y-2.5 sm:space-y-5 pb-2 sm:pb-4">
					<h3 className="text-2xl mb-3 font-medium text-center text-primary-text">
						<ClientButton>
							<ArrowLeftIcon className="w-5 xl:w-6" />
						</ClientButton>{" "}
						Reset Password
					</h3>
					<p className="text-muted-text px-2 lg:px-6">
						Enter your email address below and we&#39;ll send you a
						secure link to create a new password.
					</p>
				</div>

				<Form
					form={form}
					// name={"normal_login"}
					layout="vertical"
					onFinish={onFinish}
					requiredMark={false}
					className="w-full"
				>
					<Form.Item
						label="New Password"
						name="password"
						rules={[
							{
								validator(_, value) {
									if (!value) {
										return Promise.reject(
											"Password is required!"
										);
									}
									const pattern =
										/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
									if (!pattern.test(value)) {
										return Promise.reject(
											"Include uppercase, lowercase, number, special character!"
										);
									}
									if (value.length < 8) {
										return Promise.reject(
											"Must be at least 8 characters!"
										);
									}
									return Promise.resolve();
								},
							},
						]}
						hasFeedback
					>
						<Input.Password
							size="large"
							placeholder="**********"
							prefix={<KeyIcon className="w-5 mr-0.5" />}
						/>
					</Form.Item>
					<Form.Item
						label="Confirm Password"
						name="confirmPassword"
						rules={[
							{
								required: true,
								message: "Re-Enter the password!",
							},
							({ getFieldValue }) => ({
								validator(_, value) {
									if (
										!value ||
										getFieldValue("password") === value
									) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error(
											"The password that you entered do not match!"
										)
									);
								},
							}),
						]}
						hasFeedback
					>
						<Input.Password
							size="large"
							placeholder="**********"
							prefix={<KeyIcon className="w-5 mr-0.5" />}
						/>
					</Form.Item>
					<div className="w-full flex justify-center  pt-2">
						<Button
							loading={isLoading}
							type="primary"
							size="large"
							htmlType="submit"
							className="px-2 w-full"
						>
							Reset Password
						</Button>
					</div>
				</Form>
			</div>
		</ConfigProvider>
	);
};

export default ResetPass;
