import { TQuery } from "@/types";


const debouncedSetter = debounce(
    (
        setter: React.Dispatch<React.SetStateAction<TQuery>>,
        value: string,
        name: string
    ) => {
        setter((c) => ({ ...c, page: 1, [name || "search"]: value }));
    },
    500
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
) {
    let timeout: NodeJS.Timeout;
    return function (...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const debounceSearch = ({
    setter,
    newValue,
    name,
}: {
    setter: React.Dispatch<React.SetStateAction<TQuery>>;
    newValue: string;
    name: string;
}) => {
    debouncedSetter(setter, newValue, name); // Execute the debounced function
};
