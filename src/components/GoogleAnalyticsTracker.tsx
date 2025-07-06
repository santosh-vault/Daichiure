import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

export const GoogleAnalyticsTracker: React.FC = () => {
  // Initialize Google Analytics tracking
  useGoogleAnalytics();
  
  // This component doesn't render anything, it just initializes tracking
  return null;
}; 