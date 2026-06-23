import { useAppSelector } from "@/redux/hook";
import { TCategory } from "@/redux/features/auth/authSlice";

export const useCategories = () => {
  const categories = useAppSelector((state) => state.auth.categories);

  const getCategoryById = (id: string): TCategory | undefined => {
    return categories.find((cat) => cat._id === id);
  };

  const getCategoryByName = (name: string): TCategory | undefined => {
    return categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
  };

  const getCategoryNames = (): string[] => {
    return categories.map((cat) => cat.name);
  };

  return {
    categories,
    getCategoryById,
    getCategoryByName,
    getCategoryNames,
  };
};
