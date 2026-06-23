import { TRole } from "@/types";
import { DashboardItem, IconType, TLinkItem } from "@/types/sidebar.type";


export const generateLink = (
  items: DashboardItem[],
  role: TRole
): TLinkItem[] => {
  const links = items.reduce((acc: TLinkItem[], item) => {
    // console.log({ acc, item, role })
    if (
      item.children &&
      item.icon &&
      item.name &&
      item.role?.includes(role)
    ) {
      acc.push({
        name: item.name,
        icon: item.icon,
        rootPath: item.path,
        children: item.children
          .filter(
            (child) =>
              child.name &&
              child.path &&
              child.role?.includes(role)
          )
          .map((child) => ({
            name: child.name as string,
            path: child.path as string,
            icon: child.icon as IconType,
          })),
      });
    } else if (
      item.path &&
      item.name &&
      item.icon && item.role?.includes(role)
    ) {
      acc.push({
        name: item.name,
        path: item.path,
        icon: item.icon,
      });
    }
    return acc;
  }, []);
  return links;
};
