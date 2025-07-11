"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SkinCard from "./SkinCard";
import { Skin } from "@/lib/types";

interface SearchResult {
  skin: Skin;
  category: string;
  weapon: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        setError("Failed to search skins");
      }
    } catch (err) {
      setError("An error occurred while searching");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Search Skins</h1>
        <p className="text-muted-foreground">
          Enter a search term to find skins.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Searching...</h1>
        <p className="text-muted-foreground">
          Finding skins matching "{query}"
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Search Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          Found {results.length} skin{results.length !== 1 ? "s" : ""} matching
          "{query}"
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No skins found matching "{query}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((result, index) => (
            <div key={`${result.skin.id}-${index}`} className="space-y-2">
              <SkinCard skin={result.skin} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
