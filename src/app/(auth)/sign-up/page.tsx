import React from "react";
import SignUp from "@/components/auth/SignUp";
const page = async () => {
// const page = async (props: TPageProps) => {
  // const { type } = await props.searchParams;
  return (
    <div className="relative ">
      <SignUp />
    </div>
  );
};

export default page;
