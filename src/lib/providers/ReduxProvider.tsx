"use client";

import { mainTheme } from "@/lib/antTheme";
import { setUser, setCategories, setLoading } from "@/redux/features/auth/authSlice";
import { setUserRoleCookie, setUserStatusCookie } from "@/lib/auth/tokenUtils";
import { useGetProfileQuery } from "@/redux/features/users/users.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { AppStore, makeStore } from "@/redux/store";
import { ConfigProvider } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { kycAlert } from "../alerts/kycAlert";
import { setupListeners } from "@reduxjs/toolkit/query";
import { usePathname, useRouter } from "next/navigation";

/**
 * Module-level singleton — survives route changes throughout the browser session.
 * React state resets on component re-mount; this flag does not.
 * The preloader therefore only shows on the very first app load.
 */
let _appHasInitialized = false;

interface ProvidersProps {
    children: ReactNode;
}

/// i will try store dispatch here !!
const ReduxProvider = ({ children }: ProvidersProps) => {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
        setupListeners(storeRef.current.dispatch);
    }

    return (
        <Provider store={storeRef.current}>
            <ConfigProvider theme={mainTheme}>
                <AuthProvider>{children}</AuthProvider>
            </ConfigProvider>
        </Provider>
    );
};

export default ReduxProvider;

const AuthProvider = ({ children }: ProvidersProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);

    // Mirror the module flag into React state so the component can re-render
    // when init completes. Initial value uses the flag — if already initialized
    // (i.e. returning from a route change or hot reload), we start as true and skip the screen.
    const [isInitialized, setIsInitialized] = useState(() => {
        if (typeof window !== "undefined" && (window as any).__appHasInitialized) {
            _appHasInitialized = true;
            return true;
        }
        return _appHasInitialized;
    });

    const markInitialized = () => {
        if (typeof window !== "undefined") {
            (window as any).__appHasInitialized = true;
        }
        if (_appHasInitialized) return; // already done, no-op
        _appHasInitialized = true;
        setIsInitialized(true);
    };
    // console.log("hello")
    // Only fetch profile if token exists
    const { data, isLoading, error, isFetching } = useGetProfileQuery(undefined, {
        skip: !token,
    });

    // Fetch categories only after login
    const { data: categoriesData } = useGetAllCategoriesQuery(
        { limit: 8 },
        { skip: !token }
    );

    // Handle initial auth check
    useEffect(() => {
        if (!token) {
            // No token = not authenticated, mark as initialized immediately
            dispatch(setLoading(false));
            markInitialized();
        }
    }, [token, dispatch]);

    // Handle profile data
    useEffect(() => {
        if (data?.data) {
            dispatch(
                setUser({
                    user: data.data,
                })
            );
            if (data.data.role) {
                setUserRoleCookie(data.data.role);
            }
            if (data.data.status) {
                setUserStatusCookie(data.data.status || "ACTIVE");
            }
            markInitialized();
        }
    }, [data, dispatch]);

    // Show one-time KYC reminder when creator first enters the app
    useEffect(() => {
        const profile = data?.data;
        if (!profile?._id) return;
        if ((profile.role || "").toLowerCase() !== "creator") return;
        if ((profile.kycStatus || "").toUpperCase() !== "NOT_SUBMITTED") return;
        if (pathname?.startsWith("/verification")) return;

        const key = `kyc_alert_seen_${profile._id}`;
        if (typeof window === "undefined") return;
        if (sessionStorage.getItem(key)) return;

        sessionStorage.setItem(key, "1");
        setTimeout(() => {
            kycAlert({
                func: () => router.push("/verification"),
            });
        }, 600);
    }, [data, pathname, router]);

    // Handle profile loading completion (even if skipped)
    useEffect(() => {
        if (token && !isLoading && !isFetching) {
            // Profile fetch completed (success or error)
            markInitialized();
        }
    }, [token, isLoading, isFetching]);

    // Store categories in auth state
    useEffect(() => {
        if (token && categoriesData?.data?.categories) {
            // console.log("CATEGORIES", categoriesData.data.categories);
            dispatch(
                setCategories({
                    response: {
                        categories: categoriesData.data.categories,
                    },
                })
            );
        }
    }, [categoriesData, dispatch]);

    // Handle authentication errors
    useEffect(() => {
        if (error && 'status' in error && error.status === 401) {
            // Token is invalid, logout
            dispatch({ type: 'auth/logout' });
            markInitialized();
        }
    }, [error, dispatch]);

    // Safety timeout: force initialization after 5 s to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!_appHasInitialized) {
                console.warn('Auth initialization timeout - forcing initialization');
                dispatch(setLoading(false));
                markInitialized();
            }
        }, 2000);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only once on first mount

    const showLoading = !isInitialized;

    return (
        <>
            <LoadingScreen isVisible={showLoading} message="Welcome back!" />
            {isInitialized && children}
        </>
    );
};
