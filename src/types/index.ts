/**
 * Video item data structure
 */
export interface VideoItem {
  id: string;
  uri: string;
  name: string;
  description: string;
  duration: number;
  createdAt: number;
  thumbnailUri?: string;
}

/**
 * Video store state and actions
 */
export interface VideoStore {
  videos: VideoItem[];
  addVideo: (video: VideoItem) => void;
  updateVideo: (video: VideoItem) => void;
  removeVideo: (id: string) => void;
  getVideoById: (id: string) => VideoItem | undefined;
}

/**
 * Parameters for video cropping operation
 */
export interface CropParams {
  videoUri: string;
  startTime: number;
  endTime: number;
  outputFileName: string;
}

/**
 * Navigation route parameters
 */
export type RootStackParamList = {
  Home: undefined;
  VideoDetails: { videoId: string };
  VideoCreate: undefined;
  VideoEdit: { videoId: string };
}; 