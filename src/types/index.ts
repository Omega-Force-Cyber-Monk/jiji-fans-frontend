import { HTMLAttributes, ReactNode } from "react";

export const ROLE = {
  ADMIN: "Admin",
  CREATOR: "Creator",
  USER: "User"
} as const;

export type TLayoutProps = {
  children: ReactNode;
};
export type TContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  mClassName?: string;
};

export type TComponentProps = {
  children?: React.ReactNode;
  className?: string;
  title?: string;
};

export type TArgs = { name: string; value: string }[] | undefined;

export type TRole = (typeof ROLE)[keyof typeof ROLE];

export type TUniObject<T = object> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} & T;

// page props type
export type Params = Promise<{ slug: string }>;
export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type TPageProps = {
  params: Params;
  searchParams: SearchParams;
};

// query type
export type TQuery<T = object> = {
  page: number;
  search?: string;
  limit: number;
} & T;
export type TSetQuery<T = object> = React.Dispatch<
  React.SetStateAction<TQuery<T>>
>;


export type TPagination = {
  totalPage: number;
  currentPage: number;
  prevPage: number;
  nextPage: number;
  totalData: number;
};
