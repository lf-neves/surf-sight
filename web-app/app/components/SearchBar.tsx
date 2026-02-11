'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpotListQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { useAppDispatch } from '@/lib/store/hooks';
import { setSelectedSpot } from '@/lib/store/spotSlice';

function formatLocation(meta: { city?: string; region?: string; country?: string } | null | undefined): string {
  if (!meta) return '';
  const parts = [meta.city, meta.region, meta.country].filter(Boolean);
  return parts.join(', ') || '';
}

interface SpotOption {
  id: string;
  name: string;
  slug: string;
  location: string;
}

export function SearchBar() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { data, loading, error } = useSpotListQuery();

  const spotsWithLocation = useMemo((): SpotOption[] => {
    const spots = data?.spots ?? [];
    return spots
      .filter((s): s is typeof s & { id: string; name: string; slug: string } => Boolean(s?.id && s?.name && s?.slug))
      .map((spot) => {
        const meta = (spot as { meta?: { city?: string; region?: string; country?: string } | null }).meta;
        return {
          id: spot.id,
          name: spot.name,
          slug: spot.slug,
          location: formatLocation(meta ?? undefined),
        };
      });
  }, [data?.spots]);

  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return spotsWithLocation.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return spotsWithLocation.filter(
      (spot) =>
        spot.name.toLowerCase().includes(q) ||
        spot.slug.toLowerCase().includes(q) ||
        spot.location.toLowerCase().includes(q)
    );
  }, [searchQuery, spotsWithLocation]);

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
            isFocused ? 'scale-105' : 'scale-100'
          }`}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pico de surf..."
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
              onClick={() => setSearchQuery('')}
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
                {loading && (
                  <div className="text-sm text-gray-500 px-3 py-4 text-center">
                    Carregando picos...
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-500 px-3 py-4 text-center">
                    Não foi possível carregar os picos. Tente novamente.
                  </div>
                )}
                {!loading && !error && (
                  <>
                    <div className="text-xs text-gray-500 px-3 py-2">
                      {searchQuery ? 'Resultados' : 'Picos disponíveis'}
                    </div>
                    {filteredSpots.length === 0 ? (
                      <div className="text-sm text-gray-500 px-3 py-4 text-center">
                        Nenhum pico encontrado.
                      </div>
                    ) : (
                      filteredSpots.map((spot, index) => (
                        <motion.button
                          key={spot.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                          onClick={() => {
                            dispatch(setSelectedSpot({ id: spot.id, name: spot.name, slug: spot.slug }));
                            setSearchQuery(spot.name);
                            setIsFocused(false);
                          }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-gray-900 truncate">{spot.name}</div>
                            {spot.location && (
                              <div className="text-xs text-gray-500 truncate">{spot.location}</div>
                            )}
                          </div>
                        </motion.button>
                      ))
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
