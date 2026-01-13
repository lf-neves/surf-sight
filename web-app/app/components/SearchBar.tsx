"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setSelectedSpot } from "@/lib/store/spotSlice";
import { useSearchSpotsLazyQuery } from "@/lib/graphql/generated/apollo-graphql-hooks";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dispatch = useAppDispatch();

  const [searchSpots, { data, loading }] = useSearchSpotsLazyQuery();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      searchSpots({
        variables: { query: debouncedQuery },
      });
    }
  }, [debouncedQuery, searchSpots]);

  const handleSpotSelect = useCallback((spot: { id: string; name: string; slug: string }) => {
    dispatch(setSelectedSpot({
      id: spot.id,
      name: spot.name,
      slug: spot.slug,
    }));
    setSearchQuery(spot.name);
    setIsFocused(false);
  }, [dispatch]);

  const spots = data?.searchSpots || [];

  return (
    <div className="relative max-w-3xl mx-auto">
      <motion.div
        className="relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`relative transition-all duration-300 ${
            isFocused ? "scale-105" : "scale-100"
          }`}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pico de surf... (ex: Arpoador, Praia do Rosa)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border-2 border-transparent focus:border-cyan-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </motion.button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              <div className="p-2">
                <div className="text-xs text-gray-500 px-3 py-2">
                  {searchQuery ? "Resultados" : "Digite para buscar picos..."}
                </div>
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                  </div>
                )}
                {!loading && searchQuery && spots.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    Nenhum pico encontrado
                  </div>
                )}
                {!loading && spots.map((spot, index) => (
                  <motion.button
                    key={spot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    onClick={() => handleSpotSelect(spot)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium truncate">{spot.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {spot.type}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
