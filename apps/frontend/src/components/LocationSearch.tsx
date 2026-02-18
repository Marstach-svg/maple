'use client';

import { useState } from 'react';

interface SearchResult {
  place_name: string;
  longitude: number;
  latitude: number;
  prefecture: string;
  address: string;
}

interface LocationSearchProps {
  onLocationSelect: (coordinates: [number, number], prefecture: string, address: string) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL&language=ja&country=JP&limit=5`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const searchResults: SearchResult[] = data.features.map((feature: any) => {
          const context = feature.context || [];
          let prefecture = '';
          
          // Extract prefecture from context
          for (const item of context) {
            if (item.id && item.id.includes('region')) {
              prefecture = item.text;
              break;
            }
          }
          
          // If no prefecture found in context, try to extract from place_name
          if (!prefecture) {
            const addressParts = feature.place_name.split(',').map((part: string) => part.trim());
            for (const part of addressParts) {
              if (part.match(/(県|府|都|道)$/)) {
                prefecture = part;
                break;
              }
            }
          }

          return {
            place_name: feature.place_name,
            longitude: feature.center[0],
            latitude: feature.center[1],
            prefecture: prefecture || '不明',
            address: feature.place_name,
          };
        });

        setResults(searchResults);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocation(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultClick = (result: SearchResult) => {
    onLocationSelect([result.longitude, result.latitude], result.prefecture, result.address);
    setQuery(result.place_name);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="🔍 場所を検索（例：東京駅、渋谷区、沖縄県）"
          className="w-full px-4 py-3 pl-12 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium placeholder-warm-500"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-honey-500"></div>
          ) : (
            <svg className="w-5 h-5 text-honey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-honey-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result)}
              className="px-4 py-3 hover:bg-gradient-to-r hover:from-honey-50 hover:to-primary-50 cursor-pointer border-b border-honey-100 last:border-b-0 transition-all duration-150"
            >
              <div className="text-sm font-semibold text-warm-800 truncate flex items-center">
                📍 {result.place_name}
              </div>
              <div className="text-xs text-warm-600 flex items-center mt-1">
                🗾 {result.prefecture}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-honey-200 rounded-xl shadow-xl">
          <div className="px-4 py-3 text-sm text-warm-600 flex items-center">
            😔 検索結果が見つかりませんでした
          </div>
        </div>
      )}
    </div>
  );
}