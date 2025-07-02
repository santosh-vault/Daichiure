import React from 'react';
import { gameThumbnails } from '../constants/gameThumbnails';

interface GameThumbnailProps {
  slug: string;
  alt?: string;
  className?: string;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({ slug, alt, className }) => {
  const src = gameThumbnails[slug];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || slug}
      className={className || 'w-full h-48 object-cover'}
      loading="lazy"
    />
  );
}; 