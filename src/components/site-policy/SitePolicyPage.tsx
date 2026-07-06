"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { cn } from "@/utils/cn";
import {
  SITE_POLICY_META,
  TSitePolicy,
  TSitePolicyType,
} from "@/lib/helpers/sitePolicy";

type SitePolicyPageProps = {
  type: TSitePolicyType;
  policy: TSitePolicy | null;
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ProhibitedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-red-500 shrink-0 mt-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-brand-primary shrink-0 mt-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const TERMS_SECTIONS = [
  {
    id: "eligibility",
    title: "1. Eligibility",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">You must:</p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Be at least 18 years old (or the age of majority in your country, whichever is higher).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Have the legal capacity to enter into a binding agreement.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Provide accurate and complete information when creating your account.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-base mt-3">
          You are responsible for keeping your login credentials secure and for all activity under your account.
        </p>
      </>
    ),
  },
  {
    id: "about-platform",
    title: "2. About +2Fans",
    content: (
      <div className="space-y-2">
        <p className="text-secondary-text leading-relaxed text-base">
          +2Fans is a platform that enables creators to share content, build communities, and earn income from supporters through subscriptions, tips, and other monetization features.
        </p>
        <p className="text-secondary-text leading-relaxed text-base">
          +2Fans is a technology platform and is not responsible for the creation, quality, accuracy, legality, or ownership of user-generated content.
        </p>
      </div>
    ),
  },
  {
    id: "creator-responsibilities",
    title: "3. Creator Responsibilities",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">Creators agree to:</p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Only upload content they own or have permission to use.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Comply with all applicable laws and regulations.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Accurately represent themselves and their content.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Fulfill benefits or rewards offered to subscribers where applicable.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-base mt-3">
          Creators are solely responsible for the content they publish.
        </p>
      </>
    ),
  },
  {
    id: "supporter-responsibilities",
    title: "4. Supporter Responsibilities",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">Supporters agree to:</p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Use the Platform lawfully and respectfully.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Not redistribute, copy, record, download, or resell creator content without permission.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Not engage in harassment, fraud, abuse, or any activity that interferes with the Platform or other users.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-base mt-3">
          Subscriptions and purchases grant access only as described by the creator and do not transfer ownership of content.
        </p>
      </>
    ),
  },
  {
    id: "prohibited-content",
    title: "5. Prohibited Content and Conduct",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">Users may not upload, share, promote, or engage in content or activities that include:</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Illegal content or activities.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Copyright or trademark infringement.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Fraud, scams, or deceptive practices.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Hate speech or content promoting violence or discrimination.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Child sexual abuse material or exploitation.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Terrorism or extremist content.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Malware, phishing, or hacking.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Spam or unsolicited promotions.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Content that violates another person's privacy or rights.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-base mt-3">
          +2Fans reserves the right to remove content or suspend accounts that violate these Terms.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "6. Payments",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">
          Creators may earn revenue through monetization features offered by the Platform. By using paid features:
        </p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>You authorize +2Fans and its payment partners to process payments.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Platform fees, processing fees, taxes, and applicable deductions may apply.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Earnings may be subject to verification, fraud checks, or compliance reviews before payout.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Refunds will be handled in accordance with our Refund Policy and applicable law.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "taxes",
    title: "7. Taxes",
    content: (
      <p className="text-secondary-text leading-relaxed text-base">
        Creators are solely responsible for reporting and paying any taxes related to income earned through the Platform.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    content: (
      <div className="space-y-2">
        <p className="text-secondary-text leading-relaxed text-base font-semibold text-primary-text">
          Users retain ownership of the content they create.
        </p>
        <p className="text-secondary-text leading-relaxed text-base">
          By uploading content, you grant +2Fans a worldwide, non-exclusive, royalty-free license to host, store, process, display, reproduce, and distribute your content solely for the purpose of operating, improving, promoting, and providing the Platform.
        </p>
        <p className="text-secondary-text leading-relaxed text-base">
          You represent that you own or have the necessary rights to grant this license.
        </p>
      </div>
    ),
  },
  {
    id: "privacy-policy",
    title: "9. Privacy",
    content: (
      <p className="text-secondary-text leading-relaxed text-base">
        Your use of the Platform is also governed by our Privacy Policy. By using +2Fans, you consent to the collection and processing of your information as described in that policy.
      </p>
    ),
  },
  {
    id: "termination",
    title: "10. Account Suspension or Termination",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">We may suspend or terminate accounts that:</p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Violate these Terms.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Engage in fraudulent activity.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Pose security risks.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Repeatedly infringe intellectual property rights.</span>
          </li>
          <li className="flex items-start gap-2">
            <ProhibitedIcon />
            <span>Violate applicable laws.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-base mt-3">
          You may stop using the Platform and close your account at any time.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "11. Disclaimers",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">
          The Platform is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest extent permitted by law, +2Fans makes no guarantees regarding:
        </p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Continuous availability.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Earnings or financial success.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Uninterrupted access.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Error-free operation.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "12. Limitation of Liability",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">
          To the maximum extent permitted by law, +2Fans, its affiliates, directors, employees, and partners shall not be liable for indirect, incidental, consequential, special, punitive, or exemplary damages arising from your use of the Platform.
        </p>
        <p className="text-secondary-text leading-relaxed text-base font-semibold mt-2">
          Our total liability arising out of or relating to the Platform will not exceed the greater of:
        </p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>The fees paid by you to +2Fans during the twelve (12) months preceding the claim; or</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>US$350.</span>
          </li>
        </ul>
        <p className="text-secondary-text leading-relaxed text-xs mt-2 italic">
          Nothing in these Terms limits liability where such limitation is prohibited by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "13. Indemnification",
    content: (
      <>
        <p className="text-secondary-text leading-relaxed text-base">
          You agree to indemnify and hold harmless +2Fans, its affiliates, officers, employees, and partners from any claims, damages, liabilities, losses, costs, or expenses arising from:
        </p>
        <ul className="space-y-2 text-secondary-text text-base mt-2">
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Your use of the Platform.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Your content.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Your violation of these Terms.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRightIcon />
            <span>Your violation of any law or third-party rights.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "changes-to-terms",
    title: "14. Changes to the Terms",
    content: (
      <p className="text-secondary-text leading-relaxed text-base">
        We may update these Terms from time to time. Material changes will become effective when posted on the Platform or otherwise communicated to users. Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "15. Governing Law",
    content: (
      <p className="text-secondary-text leading-relaxed text-base">
        These Terms shall be governed by and construed in accordance with the laws specified in the +2Fans Legal Information page or, if none is specified, the laws of the jurisdiction where the operating company is incorporated, without regard to conflict of law principles.
      </p>
    ),
  },
  {
    id: "contact",
    title: "16. Contact",
    content: (
      <div className="space-y-3">
        <p className="text-secondary-text leading-relaxed text-base">
          If you have questions regarding these Terms, please contact us at:
        </p>
        <div className="bg-secondary-bg rounded-2xl p-4 space-y-1.5 text-base border border-border-primary max-w-md">
          <p className="text-secondary-text"><strong>Email:</strong> <a href="mailto:support@plus2fans.com" className="text-brand-primary hover:underline">support@plus2fans.com</a></p>
          <p className="text-secondary-text"><strong>Website:</strong> <a href="https://www.plus2fans.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">https://www.plus2fans.com</a></p>
        </div>
      </div>
    ),
  },
];

const DEFAULT_POLICIES: Record<TSitePolicyType, string> = {
  about: `
    <div class="space-y-6 text-primary-text">
      <section class="space-y-3">
        <h2 class="text-2xl font-bold">Who We Are</h2>
        <p class="text-secondary-text leading-relaxed">
          Jiji Fans (+2Fans) is a premium, next-generation creator monetization platform. We empower content creators to build direct connections with their fanbase, offering subscription-based channels, paywalled content, and interactive real-time messaging.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-bold">Our Mission</h2>
        <p class="text-secondary-text leading-relaxed">
          Our mission is to break down financial and technological borders for creators globally. While international platforms restrict monetization to traditional credit card processors, we integrate localized Mobile Money systems (such as PawaPay and PayNow) to allow creators in Africa and emerging markets to seamlessly connect with local and international fans alike.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-2xl font-bold">Why Choose Jiji Fans?</h2>
        <ul class="list-disc pl-6 space-y-2 text-secondary-text">
          <li><strong>Diverse Payments:</strong> Support for global cards (Stripe) alongside regional Mobile Money options.</li>
          <li><strong>Premium Experience:</strong> Ultra-fast video streaming, glassmorphism layouts, and interactive chat tools.</li>
          <li><strong>Trusted Verification:</strong> State-of-the-art KYC and KYB verification containers powered by Sumsub.</li>
        </ul>
      </section>
    </div>
  `,
  terms: ``,
  privacy: `
    <div class="space-y-6 text-primary-text">
      <section class="space-y-3">
        <h2 class="text-xl font-bold">1. Information We Collect</h2>
        <p class="text-secondary-text leading-relaxed">
          We collect account information (email, username, password), payment reference details, and location data to route checkout options. For creators, we collect verification documents through Sumsub Web SDK.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">2. How We Use Information</h2>
        <p class="text-secondary-text leading-relaxed">
          We use your data to configure secure sessions, process mobile money and card transactions, verify creator authenticity, maintain web-socket connections, and personalize the user experience.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">3. Data Sharing & Security</h2>
        <p class="text-secondary-text leading-relaxed">
          We do not sell personal data. Data is shared only with certified third-party processors (Stripe, PawaPay, PayNow, and Sumsub) to perform payment checkouts and identity compliance.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">4. Cookies and Session Tokens</h2>
        <p class="text-secondary-text leading-relaxed">
          Strictly necessary authentication tokens are stored in secure cookies (<code>accessToken</code>, <code>refreshToken</code>, <code>userRole</code>, <code>userStatus</code>) to safeguard profile access and prevent cross-site request forgery (CSRF).
        </p>
      </section>
    </div>
  `,
};

const SitePolicyPage = ({ type, policy }: SitePolicyPageProps) => {
  const router = useRouter();
  const meta = SITE_POLICY_META[type];
  const title = policy?.title?.trim() || meta.title;
  const intro = meta.description;
  const description = policy?.description?.trim() || DEFAULT_POLICIES[type];

  const [isFromSignUp, setIsFromSignUp] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsFromSignUp(params.get("from") === "signup");
    }
  }, []);

  useEffect(() => {
    if (type !== "terms") return;

    const handleScroll = () => {
      // If close to the top of the page, automatically highlight the first section
      if (window.scrollY < 100) {
        setActiveSection(TERMS_SECTIONS[0].id);
        return;
      }

      const scrollPosition = window.scrollY + 120;
      for (const section of TERMS_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [type]);

  const handleAccept = () => {
    sessionStorage.setItem("signup_terms_accepted", "true");
    router.push("/sign-up");
  };

  const handleDecline = () => {
    router.push("/sign-up");
  };

  const scrollTo = (id: string) => {
    setActiveSection(id); // Instantly highlight the clicked section
    const element = document.getElementById(id);
    if (element) {
      // Calculate layout offset correctly
      const offset = 110;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full">
      <Container
        className="bg-gradient-to-b from-brand-primary/10 via-secondary-bg/30 to-primary-bg pt-5 border-b border-border-primary text-center"
        mClassName="mx-auto flex flex-col items-center justify-center space-y-2"
      >
        <h1 className="text-3xl lg:text-4xl font-semibold text-primary-text">
          {title}
        </h1>
        <p className="text-secondary-text max-w-2xl mx-auto text-sm sm:text-base">{intro}</p>
      </Container>

      <Container mClassName="py-8">
        {type === "terms" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Sticky Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-3 sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto space-y-1 border-r border-border-primary px-4">
              <h3 className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-3 px-3">Sections</h3>
              <div className="space-y-1">
                {TERMS_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-base font-medium rounded-lg transition-all duration-200 truncate",
                      activeSection === sec.id
                        ? "text-brand-primary bg-brand-primary/5 font-semibold"
                        : "text-secondary-text hover:text-primary-text hover:bg-secondary-bg/50"
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms Content */}
            <div className="lg:col-span-9 space-y-8">
              <div className="bg-secondary-bg/30 border border-border-primary rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Effective Date: 06/2026</p>
                <p className="text-secondary-text leading-relaxed text-base">
                  Welcome to <strong>+2Fans</strong>. By creating an account, accessing, or using the +2Fans platform (&quot;Platform&quot;), you agree to these Terms of Use (&quot;Terms&quot;). If you do not agree, please do not use the Platform.
                </p>
              </div>

              <div className="space-y-6">
                {TERMS_SECTIONS.map((sec) => (
                  <div key={sec.id} id={sec.id} className="pt-4 border-t border-border-primary/60 first:border-0 first:pt-0">
                    <h2 className="text-lg font-semibold text-primary-text mb-2">{sec.title}</h2>
                    <div className="text-secondary-text">{sec.content}</div>
                  </div>
                ))}
              </div>

              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 space-y-2 text-center">
                <h3 className="text-base font-semibold text-primary-text font-semibold">Acceptance</h3>
                <p className="text-secondary-text text-sm leading-relaxed max-w-xl mx-auto">
                  By creating an account, checking the &quot;I agree&quot; box, or using +2Fans, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Standard HTML Fallback for other policy types */
          description ? (
            <div
              className="space-y-6 text-base leading-8 text-secondary-text max-w-4xl mx-auto"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="max-w-4xl mx-auto rounded-2xl border border-dashed border-border-primary bg-secondary-bg px-6 py-10 text-center text-secondary-text">
              This page has not been published yet.
            </div>
          )
        )}
      </Container>

      {/* Floating Action Banner for Sign-Up redirect */}
      {isFromSignUp && (
        <div className="sticky bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-secondary-bg/95 py-3 px-6 shadow-2xl backdrop-blur-md w-full">
          <div className="container px-8 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-base font-semibold text-primary-text">Reviewing Terms for Sign Up</h4>
              <p className="text-sm text-muted-text">Please read and accept the terms of use to complete registration.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-border-primary text-secondary-text text-sm font-medium hover:bg-primary-bg transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/95 transition-all shadow-md hover:shadow-lg"
              >
                I Agree & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitePolicyPage;
