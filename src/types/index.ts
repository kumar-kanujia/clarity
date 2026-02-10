export type Image = {
  path: string;
  filename: string;
  size: string;
  resolution: string;
};

export type AppState = "INIT" | "PREVIEW" | "SCANNING" | "RESULTS";

export type ImportSummary = {
  total: number;
  scanned: number;
  imported: number;
  skipped: number;
  failed: number;
};
