import SitePolicyPage from "@/components/site-policy/SitePolicyPage";
import {
  getSitePolicy,
  SITE_POLICY_META,
} from "@/lib/helpers/sitePolicy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const policy = await getSitePolicy("privacy");
  return {
    title: policy?.title || SITE_POLICY_META.privacy.title,
    description:
      policy?.description || SITE_POLICY_META.privacy.description,
  };
}

const Page = async () => {
  const policy = await getSitePolicy("privacy");
  return <SitePolicyPage type="privacy" policy={policy} />;
};

export default Page;
