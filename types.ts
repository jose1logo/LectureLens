export interface LectureData {
  title: string;
  date: string;
  summary?: string;
  content: string; // Markdown content
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}