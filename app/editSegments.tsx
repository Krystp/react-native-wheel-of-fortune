import React, { useEffect } from 'react';
import EditSegments from "../components/EditSegments";
import { useSegments } from './SegmentsContext';
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useSettings } from './SettingsContext';

export default function EditSegmentsScreen() {
  const router = useRouter();
  const { segments, setSegments } = useSegments();
  const { language } = useSettings();
  const [localSegments, setLocalSegments] = React.useState([...segments]);

  useEffect(() => {
    return () => {
      setSegments(localSegments);
    };
  }, [localSegments]);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: language === "pl" ? "Edytuj segmenty" : "Edit Segments" 
        }} 
      />
      <EditSegments
        segments={localSegments}
        onSegmentsChange={setLocalSegments}
      />
    </>
  );
}
