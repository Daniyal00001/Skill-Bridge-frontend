// hooks/useMetadata.ts
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Language {
  id: string;
  name: string;
  code: string | null;
}

export interface LocationPreference {
  id: string;
  name: string;
  region: string | null;
}

export function useMetadata() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [locations, setLocations] = useState<LocationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/metadata")
      .then((res) => {
        setLanguages(res.data.languages);
        setLocations(res.data.locations);
      })
      .catch((err) => {
        console.error("Metadata fetch error:", err);
        setError("Failed to load metadata");
      })
      .finally(() => setLoading(false));
  }, []);

  return { languages, locations, loading, error };
}
