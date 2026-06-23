import { errorAlert, TResError } from "@/lib/alerts";

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        errorAlert({ error: error as TResError });
    }
};