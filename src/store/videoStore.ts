import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoItem, VideoStore } from '../types';

const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      videos: [],
      
      addVideo: (video: VideoItem) => {
        set((state) => ({
          videos: [video, ...state.videos],
        }));
      },
      
      updateVideo: (updatedVideo: VideoItem) => {
        set((state) => ({
          videos: state.videos.map((video) => 
            video.id === updatedVideo.id ? updatedVideo : video
          ),
        }));
      },
      
      removeVideo: (id: string) => {
        set((state) => ({
          videos: state.videos.filter((video) => video.id !== id),
        }));
      },
      
      getVideoById: (id: string) => {
        return get().videos.find((video) => video.id === id);
      },
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useVideoStore; 