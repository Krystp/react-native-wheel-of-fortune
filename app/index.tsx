import React from 'react';
import Wheel from '../components/WheelOfFortune';
import { useSegments } from './SegmentsContext'; 
import { useSettings } from './SettingsContext';

export default function App() {
  const { segments } = useSegments(); 
  const { darkMode } = useSettings();
  const { language } = useSettings();

  return <Wheel segments={segments} darkMode={darkMode} language={language}/>;
}
