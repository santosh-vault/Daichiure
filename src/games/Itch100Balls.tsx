import React from 'react';

const Itch100Balls: React.FC = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <iframe
        frameBorder="0"
        src="https://itch.io/embed/193030"
        width="552"
        height="167"
        title="100 Balls by HTML5 GAMES"
        style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}
        allowFullScreen
      >
        <a href="https://html5games.itch.io/100-balls">100 Balls by HTML5 GAMES</a>
      </iframe>
    </div>
  );
};

export default Itch100Balls; 