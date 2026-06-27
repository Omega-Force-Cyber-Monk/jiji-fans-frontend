import Container from "@/components/Container";
import Image from "@/components/ui/CImage";
import {
  SITE_POLICY_META,
  TSitePolicy,
  TSitePolicyType,
} from "@/lib/helpers/sitePolicy";

type SitePolicyPageProps = {
  type: TSitePolicyType;
  policy: TSitePolicy | null;
};

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
  terms: `
    <div class="space-y-6 text-primary-text">
      <section class="space-y-3">
        <h2 class="text-xl font-bold">1. Agreement to Terms</h2>
        <p class="text-secondary-text leading-relaxed">
          By accessing or using Jiji Fans, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before using our services.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">2. User Eligibility</h2>
        <p class="text-secondary-text leading-relaxed">
          You must be at least 18 years of age or the age of majority in your jurisdiction to create an account, subscribe to channels, or upload content. All creators undergo KYC checks.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">3. Creator Guidelines & Earnings</h2>
        <p class="text-secondary-text leading-relaxed">
          Creators are responsible for the content they publish. Content must not infringe copyrights or violate community standards. Earnings are subject to platform fees and can be withdrawn to registered wallets or bank accounts.
        </p>
      </section>
      <section class="space-y-3">
        <h2 class="text-xl font-bold">4. Subscriptions, Payments & Refunds</h2>
        <p class="text-secondary-text leading-relaxed">
          Subscribers pay fees through integrated checkout sessions (Stripe, PawaPay, PayNow). Subscriptions renew automatically until cancelled. Cancellations take effect at the end of the current billing cycle.
        </p>
      </section>
    </div>
  `,
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
  const meta = SITE_POLICY_META[type];
  const title = policy?.title?.trim() || meta.title;
  const intro = meta.description;
  const description = policy?.description?.trim() || DEFAULT_POLICIES[type];

  return (
    <>
      <Container
        className="bg-gradient-to-b from-brand-primary/10 via-secondary-bg/30 to-primary-bg pt-28 pb-14 border-b border-border-primary text-center"
        mClassName="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4"
      >
        <h1 className="text-3xl lg:text-4xl font-semibold text-primary-text">
          {title}
        </h1>
        <p className="text-secondary-text max-w-2xl mx-auto text-sm sm:text-base">{intro}</p>
      </Container>
      <Container mClassName="max-w-4xl mx-auto py-10 md:py-14">
        {description ? (
          <div
            className="space-y-6 text-base leading-8 text-secondary-text"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border-primary bg-secondary-bg px-6 py-10 text-center text-secondary-text">
            This page has not been published yet.
          </div>
        )}
      </Container>
    </>
  );
};

export default SitePolicyPage;

