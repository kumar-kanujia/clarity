import { useState } from "react";

import { loadImage, scanForGroups } from "./lib/tauri-api";

import { AppState, Image } from "./types";

import { InitView } from "./features/scanner/components/init";
import { Header } from "./features/scanner/components/header";
import { LoadingFile } from "./features/scanner/components/loading";
import { ScanResult } from "./features/scanner/components/scan-result";
import { ScanPreview } from "./features/scanner/components/scan-preview";

export default function App() {
  // State
  const [appState, setAppState] = useState<AppState>("INIT");
  const [images, setImages] = useState<Image[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [groups, setGroups] = useState<Image[][]>([]);
  const [threshold, setThreshold] = useState<number>(5); // Default threshold
  const [loadingText, setLoadingText] = useState("Processing...");

  // Handlers
  const handleOpenFolder = async () => {
    try {
      const { folder, loadedPhotos } = await loadImage();
      if (loadedPhotos.length > 0) {
        setImages(loadedPhotos);
        setCurrentPath(folder);
        setAppState("PREVIEW");
      }
    } catch (error) {
      console.error("Failed to load images", error);
    }
  };

  const handleRunScan = async () => {
    setAppState("SCANNING");
    setLoadingText("Analyzing images for similarities...");
    try {
      const resultGroups = await scanForGroups(currentPath, threshold);
      setGroups(resultGroups);
      setAppState("RESULTS");
    } catch (error) {
      console.error("Failed to scan", error);
      setAppState("PREVIEW"); // Revert on error
    }
  };

  const handleReset = () => {
    setAppState("INIT");
    setImages([]);
    setCurrentPath("");
    setGroups([]);
    setThreshold(5);
  };

  let view = <InitView handleOpenFolder={handleOpenFolder} />;

  switch (appState) {
    case "INIT":
      view = <InitView handleOpenFolder={handleOpenFolder} />;
      break;
    case "PREVIEW":
      view = (
        <ScanPreview
          threshold={threshold}
          setThreshold={setThreshold}
          handleRunScan={handleRunScan}
          images={images}
        />
      );
      break;
    case "SCANNING":
      view = <LoadingFile loadingText={loadingText} />;
      break;
    case "RESULTS":
      view = (
        <ScanResult
          groups={groups}
          setAppState={(state) => setAppState(state)}
        />
      );
      break;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-foreground p-8">
      <Header
        appState={appState}
        currentPath={currentPath}
        handleOpenFolder={handleOpenFolder}
        handleReset={handleReset}
      />
      {view}
    </div>
  );
}
