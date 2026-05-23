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

        <div className={`flex flex-col min-h-screen w-full transition-all duration-500 ${!isMobile ? 'lg:pl-[200px]' : ''}`}>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[1320px]">
              <Header />
              <ActivityTicker />

              <Banner
                id="welcome-v1"
                type="info"
                message="Welcome to VaultNG. Start your premium investment journey today."
              />

              <main className="flex-1 px-4 py-6 md:px-6 lg:px-0 lg:py-8 mb-20 lg:mb-0">
                <Outlet />
              </main>
            </div>
          </div>

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
