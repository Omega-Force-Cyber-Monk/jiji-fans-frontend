import SitePolicyPage from "@/components/site-policy/SitePolicyPage";
import { getSitePolicy, SITE_POLICY_META } from "@/lib/helpers/sitePolicy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const policy = await getSitePolicy("terms");
  return {
    title: policy?.title || SITE_POLICY_META.terms.title,
    description: policy?.description || SITE_POLICY_META.terms.description,
  };
}

const Page = async () => {
  const policy = await getSitePolicy("terms");
  return <SitePolicyPage type="terms" policy={policy} />;
};

export default Page;
