import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Banner from './Banner';
import { useWindowSize } from '../../hooks/useWindowSize';
import ToastContainer from '../ui/Toast';
import ParticleBackground from '../ui/ParticleBackground';
import ActivityTicker from '../ui/ActivityTicker';
import FloatingSupportButton from '../ui/FloatingSupportButton';
import WelcomeModal from '../ui/WelcomeModal';

const AppLayout: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-purple-primary/30 overflow-x-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen w-full flex flex-col">
        {!isMobile && <Sidebar />}

        {/* Main Content Area */}
        <main className="flex-1 transition-all duration-300 ease-in-out relative z-0 min-h-screen lg:pl-[200px] flex flex-col">
          {/* Shell Layer: Spans from Sidebar to Right Edge */}
          <div className="w-full flex flex-col">
            <Header />
            <ActivityTicker />
            <Banner
              id="welcome-v1"
              type="info"
              message="Welcome to VaultNG. Start your premium investment journey today."
            />
          </div>

          {/* Workspace Layer: Centered relative to VIEWPORT where possible */}
          <div
            className="flex-1 transition-all duration-300"
            style={{
              paddingLeft: isMobile ? '0' : `max(40px, (100vw - 1320px) / 2 - 200px)`,
              paddingRight: isMobile ? '0' : `max(20px, (100vw - 1320px) / 2)`
            }}
          >
            {/* Centered Content Container */}
            <div className="max-w-[1320px] mx-auto min-h-full flex flex-col pb-24 lg:pb-8 px-4 lg:px-0 pt-6">
              <Outlet />
            </div>
          </div>

          {isMobile && <BottomNav />}
        </main>
      </div>

      <FloatingSupportButton />
      <WelcomeModal />
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
