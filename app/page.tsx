import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "./components/SearchBar";
import { HeroSection } from "./components/HeroSection";
import { WaveVisualization } from "./components/WaveVisualization";
import { RecommendationsCard } from "./components/RecommendationsCard";
import { SwellCard } from "./components/SwellCard";
import { WindCard } from "./components/WindCard";
import { TideCard } from "./components/TideCard";
import { WaterTempCard } from "./components/WaterTempCard";
import { MetricsCharts } from "./components/MetricsCharts";
import { LiveCameraFeed } from "./components/LiveCameraFeed";
import { RealtimeComments } from "./components/RealtimeComments";
import { EducationPanel } from "./components/EducationPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Search Bar */}
        <SearchBar />

        {/* Hero Section */}
        <HeroSection />

        {/* Live Feed Section - Video + Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveCameraFeed />
          </div>
          <div className="lg:col-span-1">
            <RealtimeComments />
          </div>
        </div>

        {/* Wave Visualization */}
        <WaveVisualization />

        {/* Recommendations - Direct & Actionable */}
        <RecommendationsCard />

        {/* Conditions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SwellCard />
          <WindCard />
          <TideCard />
          <WaterTempCard />
        </div>

        {/* Metrics Charts */}
        <MetricsCharts />

        {/* Education Panel */}
        <EducationPanel />
      </main>

      <Footer />
    </div>
  );
}
