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

      <div className="relative z-10 min-h-screen w-full">
        {!isMobile && <Sidebar />}

        <div className="flex flex-col min-h-screen w-full">
          {/* Shell Infrastructure: Spans from Sidebar edge to Right edge on Desktop */}
          <div className={`w-full transition-all duration-500 ${!isMobile ? 'lg:pl-[200px]' : ''}`}>
            <Header />
            <ActivityTicker />
            <Banner
              id="welcome-v1"
              type="info"
              message="Welcome to VaultNG. Start your premium investment journey today."
            />
          </div>

          {/* Main Workspace: Centered relative to viewport, transitioning to true center as space permits */}
          <main className="flex-1 w-full overflow-x-hidden">
            <div
              className="w-full max-w-[1320px] px-4 md:px-6 py-6 lg:py-8 mb-20 lg:mb-0 transition-all duration-500"
              style={!isMobile ? {
                marginLeft: 'max(240px, (100vw - 1320px) / 2)',
                marginRight: 'max(40px, (100vw - 1320px) / 2)',
              } : {
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <Outlet />
            </div>
          </main>

          {isMobile && <BottomNav />}
        </div>
      </div>

      <FloatingSupportButton />
      <WelcomeModal />
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
