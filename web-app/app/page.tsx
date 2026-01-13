'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setSelectedSpot } from '@/lib/store/spotSlice';
import { useSpotListQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { SearchBar } from "./components/SearchBar";
import { HeroSection } from "./components/HeroSection";
import { WaveVisualization } from "./components/WaveVisualization";
import { RecommendationsCard } from "./components/RecommendationsCard";
import { SwellCard } from "./components/SwellCard";
import { WindCard } from "./components/WindCard";
import { TideCard } from "./components/TideCard";
import { WaterTempCard } from "./components/WaterTempCard";
import { MetricsCharts } from "./components/MetricsCharts";
import { EducationPanel } from "./components/EducationPanel";
import { ForecastTimeline } from "./components/ForecastTimeline";

export default function Home() {
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  const dispatch = useAppDispatch();
  const { data: spotsData } = useSpotListQuery();

  // Set default spot to first spot from database
  useEffect(() => {
    if (!selectedSpot && spotsData?.spots && spotsData.spots.length > 0) {
      const firstSpot = spotsData.spots[0];
      if (firstSpot?.id && firstSpot?.name) {
        dispatch(setSelectedSpot({
          id: firstSpot.id,
          name: firstSpot.name,
          slug: firstSpot.slug ?? '',
        }));
      }
    }
  }, [selectedSpot, spotsData, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Search Bar */}
      <SearchBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Forecast Timeline */}
      {selectedSpot && <ForecastTimeline spotId={selectedSpot.id} />}

      {/* Wave Visualization */}
      <WaveVisualization />

      {/* Recommendations - Direct & Actionable */}
      <RecommendationsCard />

      {/* Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectedSpot && (
          <>
            <SwellCard spotId={selectedSpot.id} />
            <WindCard spotId={selectedSpot.id} />
            <TideCard spotId={selectedSpot.id} />
            <WaterTempCard spotId={selectedSpot.id} />
          </>
        )}
      </div>

      {/* Metrics Charts */}
      {selectedSpot && <MetricsCharts spotId={selectedSpot.id} />}

      {/* Education Panel */}
      <EducationPanel />
    </div>
  );
}
