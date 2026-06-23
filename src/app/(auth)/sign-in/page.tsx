import SignIn from "@/components/auth/SignIn";
import { TPageProps } from "@/types";

const page = async (props: TPageProps) => {
  const { redirect } = await props.searchParams;
  return (
    <div className="relative ">
      <SignIn redirect={redirect as string} />
    </div>
  );
};

export default page;
