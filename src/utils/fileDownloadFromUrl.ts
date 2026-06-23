import { imageUrl } from "@/config";
import { errorAlert } from "@/lib/alerts";

export const handleDownload = (path?: string) => {
    if (!path) {
        return errorAlert({ error: { message: "CV is unavailable!" } })
    }
    const link = document.createElement("a");
    link.href = imageUrl + path;
    link.download = ""; // use this to force download
    link.target = "_blank"; // optional: open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};