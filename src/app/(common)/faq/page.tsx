"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
};

const FAQ_DATA: FAQCategory[] = [
  {
    id: "general",
    name: "General",
    icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
    items: [
      {
        question: "What is Jiji Fans?",
        answer: "Jiji Fans (+2Fans) is a premium subscription-based content creator and fan platform. It bridges the gap between local creators and global audiences by offering global card processing alongside local mobile money payment methods tailored to various African countries.",
      },
      {
        question: "Is it secure to use?",
        answer: "Absolutely. We secure all operations using industry-standard cryptography, utilize Sumsub Web SDK for verifying creator profiles, and integrate directly with top-tier financial aggregators (Stripe, PawaPay, and PayNow) to process transactions safely.",
      },
      {
        question: "How do I toggle between light and dark modes?",
        answer: "The platform dynamically adjusts styling based on your operating system or client preferences. All premium components use utility tokens to blend seamlessly with our high-end glassmorphic theme.",
      },
    ],
  },
  {
    id: "creators",
    name: "For Creators",
    icon: <SparklesIcon className="w-5 h-5" />,
    items: [
      {
        question: "How do I start monetizing my content?",
        answer: "To start earning, register an account, complete your profile, and apply for verification via our 'Verification' tab. You will be prompted to supply basic verification info using our automated Sumsub SDK container. Once approved, you can build subscription plans and charge for premium video uploads.",
      },
      {
        question: "What payment systems are supported for creator withdrawals?",
        answer: "You can set up your payout configuration inside the Wallet panel. We support withdrawals directly to local Mobile Money wallets (e.g. MTN, Airtel, Telecash, EcoCash) or direct bank transfers depending on your residency.",
      },
      {
        question: "Can I manage multiple membership tiers?",
        answer: "Yes, you can configure multiple subscription tiers, naming each plan, setting different pricing points, and creating specific content unlocked exclusively for higher-paying tiers.",
      },
    ],
  },
  {
    id: "subscribers",
    name: "For Subscribers",
    icon: <UserIcon className="w-5 h-5" />,
    items: [
      {
        question: "How do I subscribe to a creator?",
        answer: "Search for a creator or click their vanity channel URL (e.g. jijifans.com/creator-slug). Navigate to the 'Membership' tab, choose the desired subscription plan tier, select your local payment gateway, and verify the checkout process on your browser or mobile phone.",
      },
      {
        question: "What is tipping, and how does it work?",
        answer: "Tipping allows you to send direct, one-time cash support to creators without committing to a monthly subscription. You can click 'Tip Creator' next to any video player, enter the custom amount, and checkout using your preferred payment method.",
      },
      {
        question: "How do vanity URLs work?",
        answer: "We support clean vanity paths for all creators (e.g. jijifans.com/username). Typing this in your browser automatically finds their channel ID and routes you to their public profile.",
      },
    ],
  },
  {
    id: "payments",
    name: "Payments & Verification",
    icon: <CreditCardIcon className="w-5 h-5" />,
    items: [
      {
        question: "Why do some payment methods show/hide depending on my country?",
        answer: "We use Geo-Location routing based on your profile's configured country. Supported mobile money countries (such as Kenya, Ghana, or Nigeria) will render PawaPay options. Zimbabwean users will see PayNow overrides, while cards (Stripe) are available globally.",
      },
      {
        question: "I completed my payment, but the content is still locked. What should I do?",
        answer: "Mobile telecom networks occasionally delay transaction webhooks. To resolve this instantly, our application redirects you to a post-payment verification page (`/payment/verify`) that contacts the gateway provider directly to credit your account without waiting.",
      },
      {
        question: "Can I cancel an active subscription?",
        answer: "Yes, subscriptions can be cancelled at any time through the 'Memberships' menu inside your dashboard. You will continue to have access to the creator's premium tier content until the end of your billing cycle.",
      },
    ],
  },
];

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredCategories = FAQ_DATA.map((category) => {
    const items = category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, items };
  }).filter((category) => category.items.length > 0);

  const activeCategoryData = filteredCategories.find(
    (cat) => cat.id === activeCategory
  ) || filteredCategories[0];

  return (
    <div className="bg-primary-bg min-h-screen text-primary-text pt-24 pb-16">
      {/* Hero Header Section */}
      <Container
        className="bg-gradient-to-t lg:bg-gradient-to-r from-brand-primary/20 via-primary-bg to-primary-bg pt-20 md:pt-16 pb-12"
        mClassName="max-w-6xl mx-auto text-center space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          How can we <span className="text-brand-primary">help you</span>?
        </h1>
        <p className="text-secondary-text max-w-2xl mx-auto text-base sm:text-lg">
          Browse through our frequently asked questions or use the search bar below to find immediate answers.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-muted-text" />
          </div>
          <input
            type="text"
            placeholder="Search questions, payments, creator setup..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedIndex(null);
            }}
            className="w-full pl-11 pr-4 py-3 bg-secondary-bg border border-border-primary rounded-xl text-primary-text placeholder:text-muted-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          />
        </div>
      </Container>

      {/* Main Content Layout */}
      <Container mClassName="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
        {/* Left Sidebar Category Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-text px-3 mb-3">
            Categories
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-3 lg:pb-0">
            {FAQ_DATA.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedIndex(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                      : "bg-secondary-bg hover:bg-secondary-bg/80 text-secondary-text border-border-primary"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="lg:col-span-3 space-y-4">
          {searchQuery ? (
            filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div key={cat.id} className="space-y-4">
                  <h2 className="text-lg font-semibold text-brand-primary border-b border-border-primary pb-2 mb-4">
                    {cat.name}
                  </h2>
                  <div className="space-y-3">
                    {cat.items.map((item, idx) => {
                      const isExpanded = expandedIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-secondary-bg border border-border-primary rounded-xl overflow-hidden transition-all shadow-2xs"
                        >
                          <button
                            onClick={() => handleToggle(idx)}
                            className="w-full flex items-center justify-between p-5 text-left font-medium text-primary-text hover:text-brand-primary transition-colors focus:outline-none"
                          >
                            <span className="pr-4">{item.question}</span>
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-brand-primary shrink-0" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-muted-text shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-5 pb-5 text-secondary-text leading-relaxed border-t border-border-primary/50 pt-4 text-sm sm:text-base">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-secondary-bg border border-border-primary rounded-2xl">
                <p className="text-muted-text">No answers found matching "{searchQuery}"</p>
              </div>
            )
          ) : activeCategoryData ? (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-primary-text mb-4">
                {activeCategoryData.name}
              </h2>
              {activeCategoryData.items.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-secondary-bg border border-border-primary rounded-xl overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => handleToggle(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-medium text-primary-text hover:text-brand-primary transition-colors focus:outline-none"
                    >
                      <span className="pr-4">{item.question}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-brand-primary shrink-0" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-muted-text shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 text-secondary-text leading-relaxed border-t border-border-primary/50 pt-4 text-sm sm:text-base">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </Container>

      {/* Support Section */}
      <Container mClassName="max-w-4xl mx-auto text-center mt-12 bg-secondary-bg border border-border-primary p-8 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold">Still have questions?</h3>
        <p className="text-secondary-text text-sm sm:text-base max-w-lg mx-auto">
          If you cannot find the answer in our documentation or FAQs, you can reach out directly to support.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a
            href="mailto:support@plus2fans.com"
            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/95 transition-all text-sm shadow-sm"
          >
            Email Support
          </a>
          <a
            href="https://wa.me/14692346399"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-transparent border border-border-primary text-primary-text font-medium hover:bg-secondary-bg/55 transition-all text-sm"
          >
            Chat via WhatsApp
          </a>
        </div>
      </Container>
    </div>
  );
};

export default FAQPage;
