export type Image = {
  seqId: number;
  filePath: string;
  fileName: string;
  fileSize: string;
  resolution: string;
  thumbnailPath: string;
  createdAt: number;
  isProcessed: boolean;
};

export type AppState = "INIT" | "PREVIEW" | "SCANNING" | "RESULTS";

export type ImportSummary = {
  total: number;
  scanned: number;
  imported: number;
  skipped: number;
  failed: number;
};
