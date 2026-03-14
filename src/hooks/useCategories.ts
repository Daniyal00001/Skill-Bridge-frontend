// hooks/useCategories.ts
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  subCategories: SubCategory[];
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}