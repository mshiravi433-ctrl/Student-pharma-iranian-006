import { useState, useEffect } from 'react';
import { ActiveView } from './types';
import { initTelegramWebApp, triggerHaptic } from './utils/telegram';
import { BackgroundGlow } from './components/BackgroundGlow';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeMenu } from './components/HomeMenu';
import { DrugSearchView } from './components/views/DrugSearchView';
import { CalculatorsView } from './components/views/CalculatorsView';
import { ArticleWritingView } from './components/views/ArticleWritingView';
import { EducationView } from './components/views/EducationView';
import { JobsView } from './components/views/JobsView';
import { StudyAbroadView } from './components/views/StudyAbroadView';
import { ShopView } from './components/views/ShopView';
import { SupportView } from './components/views/SupportView';
import { AboutView } from './components/views/AboutView';
import { DailyFeedView } from './components/views/DailyFeedView';
import { ArrowRight } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('home');

  useEffect(() => {
    // Initialize Telegram WebApp SDK on launch
    initTelegramWebApp();

    // Scroll to top on view change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleNavigate = (view: ActiveView) => {
    triggerHaptic('light');
    setCurrentView(view);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between font-sans text-slate-100 bg-slate-950 overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* 1. Animated RGB Purple & Pink Glowing Spheres & Medical Snake Logo */}
      <BackgroundGlow />

      {/* 2. Glassmorphic Header */}
      <Header />

      {/* 3. Main Dynamic Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pb-8">
        {currentView !== 'home' && (
          <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 pt-3 pb-1 animate-fadeIn">
            <button
              onClick={() => handleNavigate('home')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm border border-white/15 hover:border-transparent shadow-lg transition-all transform active:scale-95 group cursor-pointer select-none"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 text-purple-300 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </div>
              <span>بازگشت به منوی اصلی (مرحله قبل)</span>
            </button>
          </div>
        )}
        {currentView === 'home' && <HomeMenu onSelectMenu={handleNavigate} />}
        {currentView === 'drug-search' && <DrugSearchView />}
        {currentView === 'calculators' && <CalculatorsView />}
        {currentView === 'article-writing' && <ArticleWritingView />}
        {currentView === 'education' && <EducationView />}
        {currentView === 'jobs' && <JobsView />}
        {currentView === 'study-abroad' && <StudyAbroadView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'support' && <SupportView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'daily-feed' && <DailyFeedView onNavigate={handleNavigate} />}
      </main>

      {/* 4. Footer with Developer Credits (محمد شیروی) & Shortcuts */}
      <Footer currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
