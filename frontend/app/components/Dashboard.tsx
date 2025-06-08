"use client";

import { useState } from 'react';

interface ProfileProps {
  navigateTo: (page: string) => void;
}

// Constants for the dashboard
const STATS_CARDS = [
  { title: 'Total Matches', value: '157', icon: '🎮' },
  { title: 'Win Rate', value: '68%', icon: '📈' },
  { title: 'Total Points', value: '1,234', icon: '⭐' },
  { title: 'Rank', value: 'Diamond', icon: '💎' }
];

const RECENT_MATCHES = [
  { opponent: 'Player1', result: 'Win', score: '11-5', date: '2024-03-20' },
  { opponent: 'Player2', result: 'Loss', score: '9-11', date: '2024-03-19' },
  { opponent: 'Player3', result: 'Win', score: '11-7', date: '2024-03-18' }
];

const ACHIEVEMENTS = [
  { title: 'First Victory', description: 'Win your first match', icon: '🏆', achieved: true },
  { title: 'Perfect Game', description: 'Win a match 11-0', icon: '🎯', achieved: true },
  { title: 'Win Streak', description: 'Win 5 matches in a row', icon: '🔥', achieved: false }
];

export default function Profile({ navigateTo }: ProfileProps) {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="page-container">
      <div className="profile-content">
        <div className="chat-area-gradient">
          <div className="chat-area solid-effect">
            <div className="chat-header">
              <h2 className="settings-title">Dashboard</h2>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-grid">
              {STATS_CARDS.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Matches */}
            <div className="section-container">
              <h3 className="section-title">Recent Matches</h3>
              <div className="matches-list">
                {RECENT_MATCHES.map((match, index) => (
                  <div key={index} className={`match-card ${match.result.toLowerCase()}`}>
                    <div className="match-info">
                      <span className="opponent-name">{match.opponent}</span>
                      <span className="match-score">{match.score}</span>
                    </div>
                    <div className="match-details">
                      <span className={`match-result ${match.result.toLowerCase()}`}>
                        {match.result}
                      </span>
                      <span className="match-date">{match.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="section-container">
              <h3 className="section-title">Achievements</h3>
              <div className="achievements-grid">
                {ACHIEVEMENTS.map((achievement, index) => (
                  <div key={index} className={`achievement-card ${achievement.achieved ? 'achieved' : ''}`}>
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">{achievement.title}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="button-gradient">
                <button onClick={() => navigateTo('play')} className="btn btn-primary">
                  Play Now
                </button>
              </div>
              <div className="button-gradient">
                <button onClick={() => navigateTo('tournament')} className="btn btn-secondary">
                  Join Tournament
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}