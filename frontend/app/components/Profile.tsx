"use client";

interface ProfileProps {
  navigateTo: (page: string) => void;
}

export default function Profile({ navigateTo }: ProfileProps) {
  return (
    <div className="page-container">
      <div className="profile-content">
        <div className="chat-area-gradient">
          <div className="chat-area solid-effect">
            <div className="chat-header">
              <h2 className="settings-title">Profile</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}