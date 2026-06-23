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

const SitePolicyPage = ({ type, policy }: SitePolicyPageProps) => {
  const meta = SITE_POLICY_META[type];
  const title = policy?.title?.trim() || meta.title;
  const intro = meta.description;
  const description = policy?.description?.trim();

  return (
    <>
      <Container
        className="bg-gradient-to-t lg:bg-gradient-to-r from-[#6B6B6B] to-[#FFFFFF] pt-20 md:pt-12"
        mClassName="min-h-[50vh] grid grid-cols-5 items-center gap-5"
      >
        <div className="col-span-5 lg:col-span-3 space-y-4">
          <h1 className="text-3xl lg:text-4xl font-semibold md:pb-4 text-white">
            {title}
          </h1>
          <p className="text-white max-w-3xl">{intro}</p>
        </div>
        <div className="col-span-5 lg:col-span-2 order-first lg:order-last">
          <Image
            src={meta.imageSrc}
            alt={title}
            className="object-cover max-w-[50%] mx-auto"
            width={1000}
            height={1000}
          />
        </div>
      </Container>
      <Container>
        <div className="py-10 md:py-14">
          {description ? (
            <div
              className="space-y-4 text-base leading-8 text-slate-700"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              This page has not been published yet.
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default SitePolicyPage;
