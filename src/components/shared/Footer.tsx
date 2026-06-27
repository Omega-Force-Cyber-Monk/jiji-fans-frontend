import Image from "@/components/ui/CImage";
import Link from "next/link";
import React from "react";
import { FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa6";

const Footer = async () => {
  const shareLinks = [
    { icon: <FaTwitter className="w-5 h-5" />, url: "#", label: "Twitter" },
    { icon: <FaLinkedinIn className="w-5 h-5" />, url: "#", label: "LinkedIn" },
    { icon: <FaYoutube className="w-5 h-5" />, url: "#", label: "Youtube" },
    { icon: <FaInstagram className="w-5 h-5" />, url: "#", label: "Instagram" },
  ];

  const footerSections = [
    {
      title: "Jump In",
      links: [
        { label: "Explore Channels", href: "/overview" },
        { label: "Log In", href: "/sign-in" },
        { label: "Create an Account", href: "/sign-up" },
      ],
    },
    {
      title: "The Basics",
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
        { label: "Delete Account", href: "/delete-account" },
      ],
    },
    {
      title: "Need Help?",
      links: [
        { label: "Browse FAQs", href: "/faq" },
        {
          label: "support@plus2fans.com",
          href: "mailto:support@plus2fans.com",
        },
        {
          label: "Chat with us",
          href: "https://wa.me/14692346399",
        },
      ],
    },
  ];

  return (
    <footer className="bg-secondary-bg text-primary-text border-t border-border-primary transition-colors duration-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6 flex flex-col items-start">
            <div className="relative w-70 h-30">
              <Link href="/" aria-label="+2Fans Home">
                <Image
                  src="/static/2Fans-01.svg"
                  alt="Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="dark:brightness-110 object-cover"
                />
              </Link>
            </div>
            <p className="text-base font-normal text-secondary-text leading-relaxed max-w-xs">
              Exclusive content, flexible subscriptions, and real connections —
              all in one place. Watch, chat, and support your favorites anytime,
              anywhere.
            </p>
            <div className="flex items-center gap-4">
              {shareLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  aria-label={link.label}
                  className="text-muted-text hover:text-brand-primary transition-colors duration-200"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h5 className="text-lg font-medium text-primary-text mb-6">
                  {section.title}
                </h5>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-secondary-text hover:text-brand-primary transition-colors duration-200 text-sm inline-block group"
                      >
                        <span>
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border-primary flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-text">
          <p>© 2026 +2Fans – a Vinian Tech company</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-brand-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-brand-primary transition-colors">Privacy</Link>
            <Link href="/faq" className="hover:text-brand-primary transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
