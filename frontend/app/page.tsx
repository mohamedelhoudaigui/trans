"use client";

import { useNavigation } from './layout';
import ChatComponent from './components/Chat';
import ProfileSettingsComponent from './components/ProfileSettings';
import Profile from './components/Profile';
import Play from './components/Play';
import Tournament from './components/Tournament';
import Dashboard from './components/Dashboard';

export default function App() {
  const { currentPage, navigateTo } = useNavigation();

  const renderHomePage = () => (
    <div className="page-container">
      <div className="home-content">
        <div className="hero-section">
          <div className="hero-gradient">
            <div className="hero-container solid-effect">
              <h1 className="hero-title">Welcome to Pong Transcendence</h1>
              <p className="hero-subtitle">
                Experience the classic game of Pong like never before. 
                Play against friends, join tournaments, and climb the leaderboards!
              </p>
              <div className="hero-actions">
                <div className="button-gradient">
                  <button 
                    onClick={() => navigateTo('play')}
                    className="btn btn-primary"
                  >
                    Start Playing
                  </button>
                </div>
                <div className="button-gradient">
                  <button 
                    onClick={() => navigateTo('tournaments')}
                    className="btn btn-secondary"
                  >
                    Join Tournament
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ... keep all your other render functions the same ...

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home':
        return renderHomePage();
      case 'play':
        return <Play navigateTo={navigateTo} />;
      case 'tournaments':
        return <Tournament navigateTo={navigateTo} />;
      case 'chat':
        return <ChatComponent navigateTo={navigateTo} />;
      case 'profile':
        return <Profile navigateTo={navigateTo} />;
      case 'profile-settings':
        return <ProfileSettingsComponent navigateTo={navigateTo} />;
      case 'dashboard':
        return <Dashboard navigateTo={navigateTo} />;
      default:
        return renderHomePage();
    }
  };

  return renderCurrentPage();
}