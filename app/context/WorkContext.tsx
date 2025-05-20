import React, { createContext, useContext, useState, useEffect } from "react";
import { WorkData } from "../types";

type WorkContextType = {
  workData: WorkData[];
  setWorkData: React.Dispatch<React.SetStateAction<WorkData[]>>;
  refreshWorkData: () => void;
};

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workData, setWorkData] = useState<WorkData[]>([]);

  // ローカルストレージからデータを読み込む
  const refreshWorkData = () => {
    const savedWorkData = localStorage.getItem("workData");
    const parsedWorkData = savedWorkData ? JSON.parse(savedWorkData) : [];
    setWorkData(parsedWorkData);
  };

  useEffect(() => {
    refreshWorkData();
  }, []);

  return (
    <WorkContext.Provider value={{ workData, setWorkData, refreshWorkData }}>
      {children}
    </WorkContext.Provider>
  );
};

export const useWorkContext = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error("useWorkContext must be used within a WorkProvider");
  }
  return context;
};
