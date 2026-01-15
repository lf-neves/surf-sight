'use client';

import { useState } from 'react';
import { Search, MapPin, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpotSuggestion {
  name: string;
  location: string;
  score: number;
  distance?: string;
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const popularSpots: SpotSuggestion[] = [
    { name: 'Arpoador', location: 'Rio de Janeiro, RJ', score: 8.5 },
    { name: 'Praia do Rosa', location: 'Imbituba, SC', score: 7.8 },
    { name: 'Fernando de Noronha', location: 'Pernambuco, PE', score: 9.2 },
    { name: 'Itamambuca', location: 'Ubatuba, SP', score: 8.1 },
    { name: 'Praia Mole', location: 'Florianópolis, SC', score: 7.5 },
    { name: 'Joaquina', location: 'Florianópolis, SC', score: 8.3 },
  ];

  const filteredSpots = searchQuery
    ? popularSpots.filter(
        (spot) =>
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularSpots.slice(0, 4);

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
                <div className="text-xs text-gray-500 px-3 py-2">
                  {searchQuery ? 'Resultados' : 'Picos Populares'}
                </div>
                {filteredSpots.map((spot, index) => (
                  <motion.button
                    key={spot.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setSearchQuery(spot.name);
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-gray-900">{spot.name}</div>
                        <div className="text-xs text-gray-500">
                          {spot.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm">
                        {spot.score}
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
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
