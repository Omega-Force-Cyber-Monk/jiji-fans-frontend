"use client";
import { cn } from "@/utils/cn";
import {
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  ConfigProvider,
  Grid,
  Dropdown,
  Avatar,
  message,
} from "antd";
import type { MenuProps } from "antd";
import Image from "@/components/ui/CImage";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/redux/features/auth/authSelectors";
import { logout } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useUpdateProfileMutation } from "@/redux/features/users/users.api";
import { getImageUrl } from "@/lib/helpers/getImageUrl";
import { errorAlert } from "@/lib/alerts";

const HomeNav = ({ className }: { className?: string }) => {
  const screens = Grid.useBreakpoint();
  const [scrolling, setScrolling] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSnapshot, setLogoutSnapshot] = useState<any | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [updateProfile] = useUpdateProfileMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

  // Load theme from localStorage or document
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = document.documentElement.classList.contains("dark");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  // Sync with user profile language preference
  useEffect(() => {
    if (isAuthenticated && user?.languagePreference) {
      const profileLang = user.languagePreference;
      const currentTrans = Cookies.get("googtrans");
      const currentLang = currentTrans ? currentTrans.split("/").pop() : "en";

      if (profileLang !== currentLang) {
        Cookies.set("googtrans", `/en/${profileLang}`, { path: "/" });
        Cookies.set("googtrans", `/en/${profileLang}`, {
          path: "/",
          domain: window.location.hostname,
        });
        window.location.reload();
      }
    }
  }, [isAuthenticated, user?.languagePreference]);

  // Load saved language from cookies
  useEffect(() => {
    const savedLang = Cookies.get("googtrans");
    if (savedLang) {
      const lang = savedLang.split("/").pop();
      if (lang) setCurrentLanguage(lang);
    }
  }, []);

  const handleLanguageChange = async (value: string) => {
    setCurrentLanguage(value);

    // Set cookie for Google Translate
    Cookies.set("googtrans", `/en/${value}`, { path: "/" });
    Cookies.set("googtrans", `/en/${value}`, {
      path: "/",
      domain: window.location.hostname,
    });

    // Save to profile if authenticated
    if (isAuthenticated) {
      try {
        await updateProfile({ languagePreference: value }).unwrap();
      } catch (error) {
        errorAlert({ error: error as any, messageApi });
      }
    }

    // Refresh page to apply translation
    window.location.reload();
  };

  // Handle avatar URL
  const userAvatarUrl = useMemo(() => {
    return getImageUrl((isLoggingOut ? logoutSnapshot : user)?.avatar);
  }, [isLoggingOut, logoutSnapshot?.avatar, user?.avatar]);

  const handleLogout = () => {
    setLogoutSnapshot(user);
    setIsLoggingOut(true);
    dispatch(logout());
    window.location.href = "/";
  };

  const visibleUser = isLoggingOut ? logoutSnapshot : user;
  const showUserMenu = Boolean(visibleUser);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserCircleIcon className="w-4 h-4" />,
      onClick: () =>
        router.push(
          visibleUser?.role === "Admin" ? "/admin/settings" : "/profile"
        ),
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <UserCircleIcon className="w-4 h-4" />,
      onClick: () =>
        router.push(
          visibleUser?.role === "Creator"
            ? "/dashboard"
            : visibleUser?.role === "Admin"
              ? "/admin/home"
              : "/overview",
        ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <ArrowRightStartOnRectangleIcon className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Detect scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const languages = [
    { code: "en", label: "English", flag: "gb" },
    { code: "sw", label: "Swahili", flag: "tz" },
    { code: "sn", label: "Shona", flag: "zw" },
    { code: "zu", label: "Zulu", flag: "za" },
    { code: "tn", label: "Tswana", flag: "bw" },
    { code: "yo", label: "Yoruba", flag: "ng" },
    { code: "af", label: "Afrikaans", flag: "za" },
    { code: "am", label: "Amharic", flag: "et" },
    { code: "sq", label: "Albanian", flag: "al" },
    { code: "nr", label: "Ndebele (South)", flag: "za" },
    { code: "ar", label: "Arabic", flag: "sa" },
    { code: "hy", label: "Armenian", flag: "am" },
    { code: "az", label: "Azerbaijani", flag: "az" },
    { code: "eu", label: "Basque", flag: "es" },
    { code: "be", label: "Belarusian", flag: "by" },
    { code: "bn", label: "Bengali", flag: "bd" },
    { code: "bs", label: "Bosnian", flag: "ba" },
    { code: "bg", label: "Bulgarian", flag: "bg" },
    { code: "ca", label: "Catalan", flag: "es" },
    { code: "ceb", label: "Cebuano", flag: "ph" },
    { code: "ny", label: "Chichewa", flag: "mw" },
    { code: "zh-CN", label: "Chinese (Simplified)", flag: "cn" },
    { code: "zh-TW", label: "Chinese (Traditional)", flag: "tw" },
    { code: "co", label: "Corsican", flag: "fr" },
    { code: "hr", label: "Croatian", flag: "hr" },
    { code: "cs", label: "Czech", flag: "cz" },
    { code: "da", label: "Danish", flag: "dk" },
    { code: "nl", label: "Dutch", flag: "nl" },
    { code: "eo", label: "Esperanto", flag: "eu" },
    { code: "et", label: "Estonian", flag: "ee" },
    { code: "tl", label: "Filipino", flag: "ph" },
    { code: "fi", label: "Finnish", flag: "fi" },
    { code: "fr", label: "French", flag: "fr" },
    { code: "fy", label: "Frisian", flag: "nl" },
    { code: "gl", label: "Galician", flag: "es" },
    { code: "ka", label: "Georgian", flag: "ge" },
    { code: "de", label: "German", flag: "de" },
    { code: "el", label: "Greek", flag: "gr" },
    { code: "gu", label: "Gujarati", flag: "in" },
    { code: "ht", label: "Haitian Creole", flag: "ht" },
    { code: "ha", label: "Hausa", flag: "ng" },
    { code: "haw", label: "Hawaiian", flag: "us" },
    { code: "he", label: "Hebrew", flag: "il" },
    { code: "hi", label: "Hindi", flag: "in" },
    { code: "hmn", label: "Hmong", flag: "cn" },
    { code: "hu", label: "Hungarian", flag: "hu" },
    { code: "is", label: "Icelandic", flag: "is" },
    { code: "ig", label: "Igbo", flag: "ng" },
    { code: "id", label: "Indonesian", flag: "id" },
    { code: "ga", label: "Irish", flag: "ie" },
    { code: "it", label: "Italian", flag: "it" },
    { code: "ja", label: "Japanese", flag: "jp" },
    { code: "jw", label: "Javanese", flag: "id" },
    { code: "kn", label: "Kannada", flag: "in" },
    { code: "kk", label: "Kazakh", flag: "kz" },
    { code: "km", label: "Khmer", flag: "kh" },
    { code: "rw", label: "Kinyarwanda", flag: "rw" },
    { code: "ko", label: "Korean", flag: "kr" },
    { code: "ku", label: "Kurdish (Kurmanji)", flag: "iq" },
    { code: "ky", label: "Kyrgyz", flag: "kg" },
    { code: "lo", label: "Lao", flag: "la" },
    { code: "la", label: "Latin", flag: "va" },
    { code: "lv", label: "Latvian", flag: "lv" },
    { code: "lt", label: "Lithuanian", flag: "lt" },
    { code: "lb", label: "Luxembourgish", flag: "lu" },
    { code: "mk", label: "Macedonian", flag: "mk" },
    { code: "mg", label: "Malagasy", flag: "mg" },
    { code: "ms", label: "Malay", flag: "my" },
    { code: "ml", label: "Malayalam", flag: "in" },
    { code: "mt", label: "Maltese", flag: "mt" },
    { code: "mi", label: "Maori", flag: "nz" },
    { code: "mr", label: "Marathi", flag: "in" },
    { code: "mn", label: "Mongolian", flag: "mn" },
    { code: "my", label: "Myanmar (Burmese)", flag: "mm" },
    { code: "ne", label: "Nepali", flag: "np" },
    { code: "no", label: "Norwegian", flag: "no" },
    { code: "or", label: "Odia (Oriya)", flag: "in" },
    { code: "ps", label: "Pashto", flag: "af" },
    { code: "fa", label: "Persian", flag: "ir" },
    { code: "pl", label: "Polish", flag: "pl" },
    { code: "pt", label: "Portuguese", flag: "pt" },
    { code: "pa", label: "Punjabi", flag: "in" },
    { code: "ro", label: "Romanian", flag: "ro" },
    { code: "ru", label: "Russian", flag: "ru" },
    { code: "sm", label: "Samoan", flag: "ws" },
    { code: "gd", label: "Scots Gaelic", flag: "gb" },
    { code: "sr", label: "Serbian", flag: "rs" },
    { code: "st", label: "Sesotho", flag: "ls" },
    { code: "sd", label: "Sindhi", flag: "pk" },
    { code: "si", label: "Sinhala", flag: "lk" },
    { code: "sk", label: "Slovak", flag: "sk" },
    { code: "sl", label: "Slovenian", flag: "si" },
    { code: "so", label: "Somali", flag: "so" },
    { code: "es", label: "Spanish", flag: "es" },
    { code: "su", label: "Sundanese", flag: "id" },
    { code: "sv", label: "Swedish", flag: "se" },
    { code: "tg", label: "Tajik", flag: "tj" },
    { code: "ta", label: "Tamil", flag: "in" },
    { code: "tt", label: "Tatar", flag: "ru" },
    { code: "te", label: "Telugu", flag: "in" },
    { code: "th", label: "Thai", flag: "th" },
    { code: "tr", label: "Turkish", flag: "tr" },
    { code: "tk", label: "Turkmen", flag: "tm" },
    { code: "uk", label: "Ukrainian", flag: "ua" },
    { code: "ur", label: "Urdu", flag: "pk" },
    { code: "ug", label: "Uyghur", flag: "cn" },
    { code: "uz", label: "Uzbek", flag: "uz" },
    { code: "vi", label: "Vietnamese", flag: "vn" },
    { code: "cy", label: "Welsh", flag: "gb" },
    { code: "xh", label: "Xhosa", flag: "za" },
  ];


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
            controlPaddingHorizontal: 20,
          },
          Button: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--brand-primary)",
            colorText: "#fff",
          },
          Select: {
            borderRadiusLG: 30,
            borderRadius: 30,
            colorTextPlaceholder: "var(--muted-text)",
            colorBgContainer: "var(--primary-bg)",
            colorText: "var(--primary-text)",
          },
        },
      }}
    >
      {contextHolder}
      <nav
        className={cn(
          "absolute top-0 left-0 w-full z-[999] transition-all duration-300 bg-transparent",
          {
            "from-[#05101b] via-[#0b1926] to-[#08241a] backdrop-blur-xl shadow-[0_10px_30px_rgba(5,16,27,0.35)]":
              scrolling,
          },
          className,
        )}
        aria-label="Main Navigation"
      >
        <div className="container mx-auto w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-none w-[92px] sm:w-[112px] xl:w-[132px] h-10 sm:h-12 xl:h-14">
              <Link href="/" aria-label="+2Fans Home">
                <Image
                  src="/static/2Fans-01.svg"
                  alt="Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="100vw"
                />
              </Link>
            </div>

            <div
              className="flex items-center justify-end gap-2 sm:gap-3 min-w-0"
              id="navitem"
            >
              <div
                id="google_translate_element"
                style={{ display: "none" }}
              ></div>
              <div className="flex items-center min-w-0">
                <Dropdown
                  menu={{
                    items: languages.map((lang) => ({
                      key: lang.code,
                      label: (
                        <div className="flex items-center gap-2 text-sm py-0.5">
                          <img
                            src={`https://flagcdn.com/w20/${lang.flag}.png`}
                            width={16}
                            height={12}
                            alt={lang.label}
                            className="rounded-sm shrink-0"
                          />
                          <span className="font-normal">{lang.label}</span>
                        </div>
                      ),
                      onClick: () => handleLanguageChange(lang.code),
                    })),
                    selectable: true,
                    selectedKeys: [currentLanguage],
                    style: { maxHeight: "240px", overflowY: "auto" }
                  }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <button
                    className={cn(
                      "cursor-pointer flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-full transition-all outline-none focus:ring-2 focus:ring-emerald-400 min-w-[90px] sm:min-w-[150px] text-sm font-medium",
                      scrolling || theme === "dark"
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-secondary-bg hover:bg-primary-bg border border-border-primary text-primary-text"
                    )}
                  >
                    {(() => {
                      const selected = languages.find((l) => l.code === currentLanguage);
                      return (
                        <>
                          {selected && (
                            <img
                              src={`https://flagcdn.com/w20/${selected.flag}.png`}
                              width={16}
                              height={12}
                              alt={selected.label}
                              className="rounded-sm shrink-0"
                            />
                          )}
                          <span className="truncate max-w-full">
                            {selected?.label || "Language"}
                          </span>
                        </>
                      );
                    })()}
                  </button>
                </Dropdown>
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="w-5 h-5 text-white" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-white" />
                )}
              </button>

              {showUserMenu ? (
                <Dropdown
                  open={isLoggingOut ? false : undefined}
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <button
                    disabled={isLoggingOut}
                    className="cursor-pointer flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all outline-none focus:ring-2 focus:ring-emerald-400"
                    aria-label="User menu"
                  >
                    <Avatar
                      size={screens.xs ? 32 : 40}
                      src={userAvatarUrl}
                      icon={!userAvatarUrl && <UserCircleIcon />}
                      className="shrink-0"
                    />
                    <span className="text-white text-sm font-medium hidden md:block truncate max-w-24">
                      {isLoggingOut
                        ? "Signing out..."
                        : visibleUser?.username?.split(" ")[0] || "User"}
                    </span>
                  </button>
                </Dropdown>
              ) : (
                <Link
                  href={"/sign-in"}
                  className="w-[88px] sm:w-[112px] flex-none"
                >
                  <Button
                    type="primary"
                    shape="round"
                    size={!!screens.xs ? "middle" : "large"}
                    className="w-full"
                  >
                    <span className="pb-0.5">Login</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </ConfigProvider>
  );
};

export default HomeNav;
