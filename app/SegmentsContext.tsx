import React, { createContext, useState, useContext, ReactNode } from "react";

type SegmentsContextType = {
  segments: string[];
  setSegments: (newSegments: string[]) => void;
};

const SegmentsContext = createContext<SegmentsContextType | undefined>(undefined);

export const SegmentsProvider = ({ children }: { children: ReactNode }) => {
  const [segments, setSegments] = useState<string[]>(["1", "2", "3", "4"]);

  return (
    <SegmentsContext.Provider value={{ segments, setSegments }}>
      {children}
    </SegmentsContext.Provider>
  );
};

export const useSegments = () => {
  const context = useContext(SegmentsContext);
  if (!context) {
    throw new Error("useSegments must be used within a SegmentsProvider");
  }
  return context;
};