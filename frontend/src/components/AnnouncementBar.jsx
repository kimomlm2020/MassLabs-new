import React from 'react';
import '../styles/AnnouncementBar.css';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar" role="banner" aria-label="Announcement bar">
      <div className="announcement-bar__track">
        <span className="announcement-bar__content">
          💪 Push Your Limits • Science-Backed Formulations • Elite Athletes Trust MassLabs • Maximum Purity Guaranteed • Results That Speak • Innovation in Every Dose •
        </span>
        <span className="announcement-bar__content" aria-hidden="true">
          💪 Push Your Limits • Science-Backed Formulations • Elite Athletes Trust MassLabs • Maximum Purity Guaranteed • Results That Speak • Innovation in Every Dose •
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;