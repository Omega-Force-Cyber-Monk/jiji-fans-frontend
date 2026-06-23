
import { ForwardRefExoticComponent, ReactNode, SVGProps } from "react";
import { TRole } from ".";
export type IconType = ForwardRefExoticComponent<SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;

// for link items
export type TLinkItem = {
  name: string;
  path?: string;
  rootPath?: string;
  icon: IconType;
  children?: TLinkItem[];
};

export type DashboardItem = {
  name?: string;
  path: string;
  element?: ReactNode;
  icon?: IconType;
  role?: TRole[];
  children?: DashboardItem[];
};

export type TRouteElement = {
  path: string;
  element: ReactNode;
};
