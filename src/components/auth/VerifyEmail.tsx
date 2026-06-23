"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { Button, ConfigProvider, Form, FormProps, message } from "antd";
import { useRouter } from "next/navigation";
import OTPInput from "react-otp-input";
import ClientButton from "../ui/ClientButtton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
	useForgotPasswordMutation,
	useResendOtpMutation,
	useVerifyOtpMutation,
	useLoginMutation,
} from "@/redux/features/auth/authApi";
import { errorAlert, TResError } from "@/lib/alerts";
import SuccessAnimation from "../ui/SuccessAnimation";
import { useAppDispatch } from "@/redux/hook";
import { setLogin } from "@/redux/features/auth/authSlice";

type FieldType = {
	otp: string;
};

const VerifyEmail = ({ email, opType }: { email: string; opType: string }) => {
	const [form] = Form.useForm();
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const [mutation, { isLoading }] = useVerifyOtpMutation();
	const [loginMutation] = useLoginMutation();
	const dispatch = useAppDispatch();
	const [resendMutation, { isLoading: resendLoading }] =
		useResendOtpMutation();
	const [otp, setOtp] = useState("");
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [token, setToken] = useState("");
	const [successAction, setSuccessAction] = useState<
		"verify" | "reset" | "resend"
	>("verify");

	const onFinish: FormProps<FieldType>["onFinish"] = async () => {
		try {
			if (!otp || otp.length < 6)
				throw new Error("Correct OTP is required!");
			const response = await mutation({ otp, email }).unwrap();
			if (response.success) {
				setToken(response.data.accessToken);
				setSuccessAction(opType === "verify" ? "verify" : "reset");
				setSuccessMessage(response.message);
				setShowSuccessAnimation(true);
			}
		} catch (error) {
			errorAlert({ error: error as TResError, messageApi });
		}
	};

	const handleResend = async () => {
		try {
			const response = await resendMutation({ email }).unwrap();
			if (response.success) {
				setSuccessAction("resend");
				setSuccessMessage(response.message);
				setShowSuccessAnimation(true);
			}
		} catch (error) {
			errorAlert({ error: error as TResError, messageApi });
		}
	};

	const handleAnimationComplete = async () => {
		if (successAction === "resend") {
			setShowSuccessAnimation(false);
			return;
		}
		if (successAction === "verify") {
			const pendingEmail = sessionStorage.getItem("pending_email");
			const pendingPassword = sessionStorage.getItem("pending_password");
			if (pendingEmail && pendingPassword) {
				try {
					messageApi.open({
						key: "autologin",
						type: "loading",
						content: "Logging in...",
						duration: 0,
					});
					const loginResponse = await loginMutation({
						email: pendingEmail,
						password: pendingPassword,
					}).unwrap();

					sessionStorage.removeItem("pending_email");
					sessionStorage.removeItem("pending_password");

					messageApi.open({
						key: "autologin",
						type: "success",
						content: "Login successful!",
						duration: 1.5,
					});

					const { accessToken, refreshToken, user } = loginResponse.data;
					dispatch(
						setLogin({
							accessToken,
							refreshToken,
							user: user,
						})
					);

					if (user?.role.toLowerCase() === "admin") {
						router.replace("/admin/home");
					} else {
						router.replace("/overview");
					}
					return;
				} catch (err) {
					console.error("Auto login failed:", err);
					messageApi.open({
						key: "autologin",
						type: "error",
						content: "Auto-login failed. Please sign in manually.",
						duration: 2,
					});
				}
			}
			router.replace(`/sign-in`);
		} else {
			router.replace(`/reset-pass?token=${token}`);
		}
	};

	return (
		<ConfigProvider
			theme={{
				token: {
					colorBgElevated: "var(--primary-bg)",
					colorText: "var(--primary-text)",
				},
				components: {
					Button: {
						borderRadiusLG: 8,
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

				<div className="text-center space-y-6 pb-8">
					<div className="flex items-center justify-center gap-4 relative">
						<div className="absolute left-0">
							<ClientButton>
								<div className="p-2 rounded-md hover:bg-secondary-bg transition-colors duration-200">
									<ArrowLeftIcon className="w-6 h-6 text-primary-text" />
								</div>
							</ClientButton>
						</div>
						<h3 className="text-2xl font-semibold text-primary-text m-0">
							Verify Email
						</h3>
					</div>
					<p className="text-base font-normal text-muted-text px-4 lg:px-8 max-w-md mx-auto leading-relaxed">
						We sent a verification code to{" "}
						<span className="text-brand-primary font-medium">{email}</span>.
						Please enter the code below to verify your account.
					</p>
				</div>

				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					requiredMark={false}
					className="w-full text-center"
				>
					<Form.Item>
						<div className="py-4 font-medium flex justify-center">
							<OTPInput
								value={otp}
								onChange={setOtp}
								numInputs={6}
								renderSeparator={<span></span>}
								renderInput={(props) => {
									const { style, ...restProps } = props;
									return (
										<input
											{...restProps}
											className="border-2 border-muted-text/30 hover:border-brand-primary focus:border-brand-primary bg-transparent outline-none rounded-full !w-[38px] !h-[38px] sm:!w-[44px] sm:!h-[44px] md:!w-[50px] md:!h-[50px] lg:!w-[56px] lg:!h-[56px] xl:!w-[62px] xl:!h-[62px] mx-[2px] sm:mx-[3px] md:mx-[4px] lg:mx-[6px] text-base sm:text-lg xl:text-xl text-center focus:ring-4 ring-brand-primary/10 text-primary-text transition-all duration-300 font-semibold shadow-sm"
										/>
									);
								}}
							/>
						</div>
					</Form.Item>

					<div className="w-full flex justify-center pt-4">
						<Button
							loading={isLoading}
							type="primary"
							size="large"
							htmlType="submit"
							className="w-full h-12 text-base font-medium shadow-sm transition-transform hover:scale-[1.01]"
						>
							Verify Account
						</Button>
					</div>
				</Form>

				<div className="text-center mt-8">
					<p className="text-base font-normal text-muted-text flex items-center justify-center gap-2">
						Didn’t receive the code?
						<Button
							onClick={handleResend}
							loading={resendLoading}
							type="text"
							size="small"
							className="text-brand-primary hover:text-brand-secondary font-medium px-2 m-0 h-auto"
						>
							Resend
						</Button>
					</p>
				</div>
			</div>
		</ConfigProvider>
	);
};

export default VerifyEmail;
