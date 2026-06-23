import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import Providers from "./providers";
// import Providers from "./StoreProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "+2Fans | Content Creator Platform",
  description:
    "+2Fans is a premium platform designed for content creators to share exclusive content, build closer connections with fans, and earn through memberships and tips. Join +2Fans to create, connect, and grow your creator career.",
  icons: {
    icon: "/static/2Fans-02.svg?v=2",
    shortcut: "/static/2Fans-02.svg?v=2",
    apple: "/static/2Fans-02.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (theme === 'dark' || (!theme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${plusJakartaSans.className} antialiased`}
      >
        <AntdRegistry>
          {/* <GoogleTranslate /> */}
          <Providers>{children}</Providers>
        </AntdRegistry>
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <script
          type="text/javascript"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          async
        ></script>
      </body>
    </html>
  );
}

