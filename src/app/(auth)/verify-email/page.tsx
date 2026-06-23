import React from "react";
import { TPageProps } from "@/types";
import VerifyEmail from "@/components/auth/VerifyEmail";

const page = async (props: TPageProps) => {
  const searchParams = await props.searchParams;
  const query = searchParams.query as string;
  const type = searchParams.type as string;
  return <VerifyEmail email={query} opType={type} />;
};

export default page;
