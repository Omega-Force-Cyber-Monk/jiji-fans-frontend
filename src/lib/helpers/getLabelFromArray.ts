import { TUniObject } from "@/types";

export const getSpecificLabel = (arr: TUniObject[], val: string, split?: string) => {
    if (split) {
        return arr.find(i => i.value === val)?.label?.split(split)[1];
    }
    return arr.find(i => i.value === val)?.label;
}