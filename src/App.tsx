import { useEffect } from "react";
import { toast } from "sonner";

import { selectDir } from "./tauri/tauri-api";
import { ScannerHeader } from "./features/scanner/components/scanner-header";
import { InitView } from "./features/scanner/components/init";
import { LoadingFile } from "./features/scanner/components/loading";
import { ScanResult } from "./features/scanner/components/scan-result";
import { ScanPreview } from "./features/scanner/components/scan-preview";
import { useGetFolderStore } from "./features/gallery/hooks/use-folder-store";
import { useGetScannerStore } from "./features/scanner/hooks/use-scanner-store";
import {
  getLoadedFiles,
  loadDir,
  loadImagesFromDir,
  scanForGroups,
} from "./tauri/tauri-commands";
import { cn } from "./lib/utils";

/**
 * Main Application Component
 * Manages the high-level routing between different views (INIT, PREVIEW, SCANNING, RESULTS).
 * Utilizes Zustand stores for global state management.
 */
export default function App() {
  // Global State (Zustand)
  const { currentFolderPath, isFolderSelected, setCurrentFolder } =
    useGetFolderStore();
  const {
    appState,
    images,
    threshold,
    loadingText,
    setAppState,
    setImages,
    setGroups,
    setLoadingText,
    reset: resetScanner,
  } = useGetScannerStore();

  /**
   * Opens a directory selection dialog and updates the folder store.
   */
  const handleOpenClick = async () => {
    try {
      const folderPath = await selectDir();
      if (folderPath) {
        setCurrentFolder(folderPath);
        toast.success("Folder selected successfully");
      }
    } catch (error) {
      console.error("Failed to open folder:", error);
      toast.error("Failed to open folder");
    }
  };

  /**
   * Loads images whenever a new valid folder is selected.
   */
  // useEffect(() => {
  //   if (isFolderSelected && currentFolderPath) {
  //     loadImagesFromDir(currentFolderPath)
  //       .then((loadedImages) => {
  //         setImages(loadedImages);
  //         setAppState("PREVIEW");
  //       })
  //       .catch((error) => {
  //         console.error("Failed to load images:", error);
  //         toast.error("Failed to load images from directory");
  //       });
  //   } else {
  //     setImages([]);
  //   }
  // }, [isFolderSelected, currentFolderPath, setImages, setAppState]);

  useEffect(() => {
    if (currentFolderPath && isFolderSelected) {
      getLoadedFiles()
        .then((loadedFiles) => {
          return loadedFiles.map((file) => {
            return {
              path: file,
              filename: file.split("/").pop(),
              size: file.split("/").pop(),
              resolution: file.split("/").pop(),
            };
          });
        })
        .then((loadedFiles) => {
          setImages(loadedFiles);
          setAppState("PREVIEW");
        });
    }
  }, [currentFolderPath]);

  /**
   * Starts the duplicate scanning process.
   */
  const handleRunScan = async () => {
    setAppState("SCANNING");
    setLoadingText("Analyzing images for similarities...");
    try {
      const resultGroups = await scanForGroups(currentFolderPath, threshold);
      setGroups(resultGroups);
      setAppState("RESULTS");
      toast.success("Scan completed successfully");
    } catch (error) {
      console.error("Failed to scan:", error);
      toast.error("An error occurred during scanning");
      setAppState("PREVIEW");
    }
  };

  /**
   * Resets the application state to the initial view.
   */
  const handleReset = () => {
    resetScanner();
    setCurrentFolder("");
  };

  // View Routing Logic
  let view = null;
  switch (appState) {
    case "INIT":
      view = <InitView handleOpenFolder={handleOpenClick} />;
      break;
    case "PREVIEW":
      view = <ScanPreview handleRunScan={handleRunScan} images={images} />;
      break;
    case "SCANNING":
      view = <LoadingFile loadingText={loadingText} />;
      break;
    case "RESULTS":
      view = <ScanResult />;
      break;
  }

  return (
    <div
      className={cn(
        "h-screen w-full flex flex-col bg-background text-foreground p-8 font-sans antialiased selection:bg-primary/30",
        "transition-colors duration-300",
      )}
    >
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(120,50,255,0.05),transparent_50%)]" />

      <ScannerHeader
        appState={appState}
        currentPath={currentFolderPath}
        handleOpenFolder={handleOpenClick}
        handleReset={handleReset}
      />

      <main className="flex-1 min-h-0 relative animate-in fade-in duration-700">
        {view}
      </main>
    </div>
  );
}
