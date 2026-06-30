"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AtSymbolIcon, KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setLogin } from "@/redux/features/auth/authSlice";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { errorAlert, TResError, getApiErrorDetails } from "@/lib/alerts";
import { ApiSuccessResponse, LoginResponseData } from "@/types/api.types";
import { useAppContext } from "@/lib/providers/ContextProvider";
import Cookies from "js-cookie";

type FieldType = {
  email: string;
  password: string;
  remember?: boolean;
};

const SignIn = ({ redirect }: { redirect?: string }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { messageApi } = useAppContext();
  const [mutation, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState<FieldType>({
    email: "",
    password: "",
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    const savedEmail = Cookies.get("remember_email");
    const savedPassword = Cookies.get("remember_password");
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword,
        remember: true,
      });
    }
  }, []);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const devAccounts = [
    // { email: "sample.user@yopmail.com", role: "User", password: "Password123!" },
    { email: "admin@mycompany.com", role: "Admin", password: "SecurePass123!" },
  ];

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "Email is required!";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Input a valid email!";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required!";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long!";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response: ApiSuccessResponse<LoginResponseData> = await mutation({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Handle Remember Me Cookie
      if (formData.remember) {
        Cookies.set("remember_email", formData.email, { expires: 30 });
        Cookies.set("remember_password", formData.password, { expires: 30 });
      } else {
        Cookies.remove("remember_email");
        Cookies.remove("remember_password");
      }

      // Check if email needs verification
      if (response.data?.needsVerification) {
        messageApi.open({
          key: "signin",
          type: "warning",
          content: response.message || "OTP sent to your email. Please verify to login",
          duration: 3,
        });
        router.push(`/verify-email?query=${formData.email}&type=verify`);
        return;
      }

      // Show success message
      messageApi.open({
        key: "signin",
        type: "success",
        content: response.message || "Login successful!",
        duration: 1,
      });

      const { accessToken, refreshToken, user } = response.data;

      dispatch(
        setLogin({
          accessToken,
          refreshToken,
          user: user,
        })
      );

      // Handle redirect based on role (as per user's previous preference)
      if (user?.role.toLowerCase() === "admin") {
        router.replace("/admin/home");
      } else if (user?.role.toLowerCase() === "creator") {
        router.replace("/overview");
      } else {
        router.replace("/overview");
      }
    } catch (error) {
      const { errorSources } = getApiErrorDetails(error);
      const newErrors = { email: "", password: "" };

      errorSources.forEach((err) => {
        const path = err.path?.replace(/^body\./, "").toLowerCase();
        if (path === "email") newErrors.email = err.message;
        if (path === "password") newErrors.password = err.message;
      });

      setErrors(newErrors);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto">
      <h3 className="text-2xl mb-8 text-center font-semibold text-primary-text">
        Sign In
      </h3>

      {/* {process.env.NODE_ENV === "development" && ( */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {devAccounts.map((account) => (
          <button
            key={account.role}
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                email: account.email,
                password: account.password,
              });
              setErrors({ email: "", password: "" });
            }}
            className="px-3 py-1 text-sm rounded-md bg-secondary-bg text-primary-text hover:bg-brand-primary hover:text-white transition-colors border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {account.role}
          </button>
        ))}
      </div>
      {/* )} */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-text">User Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSymbolIcon className="w-5 h-5 text-muted-text" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 bg-primary-bg border ${errors.email ? "border-red-500" : "border-border-primary"
                } rounded-md text-primary-text placeholder:text-muted-text focus:outline-none focus:border-brand-primary transition-colors disabled:bg-disabled-bg disabled:text-muted-text`}
              placeholder="Enter Your Email"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-text">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="w-5 h-5 text-muted-text" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-12 py-2.5 bg-primary-bg border ${errors.password ? "border-red-500" : "border-border-primary"
                } rounded-md text-primary-text placeholder:text-muted-text focus:outline-none focus:border-brand-primary transition-colors disabled:bg-disabled-bg disabled:text-muted-text`}
              placeholder="**********"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text hover:text-primary-text transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forget Password */}
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              className="w-4 h-4 rounded-sm border-border-primary text-brand-primary focus:ring-brand-primary bg-primary-bg disabled:opacity-50"
              disabled={isLoading}
            />
            <span className="text-sm text-primary-text">Remember me</span>
          </label>
          <Link
            href={"/forget-pass"}
            className="text-sm hover:text-brand-primary text-primary-text transition-all underline underline-offset-2"
          >
            Forget password
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-muted-text mt-10 text-center text-sm">
        Don’t have an account?{" "}
        <Link
          href={"/sign-up"}
          className="font-medium hover:text-brand-primary text-primary-text transition-all underline underline-offset-2"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
