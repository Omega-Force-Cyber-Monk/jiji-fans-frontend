import SitePolicyPage from "@/components/site-policy/SitePolicyPage";
import { getSitePolicy, SITE_POLICY_META } from "@/lib/helpers/sitePolicy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const policy = await getSitePolicy("about");
  return {
    title: policy?.title || SITE_POLICY_META.about.title,
    description: policy?.description || SITE_POLICY_META.about.description,
  };
}

const Page = async () => {
  const policy = await getSitePolicy("about");
  return <SitePolicyPage type="about" policy={policy} />;
};

export default Page;
