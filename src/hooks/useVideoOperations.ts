import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { cropVideo, generateThumbnail } from '../services/videoService';
import useVideoStore from '../store/videoStore';
import { VideoItem } from '../types';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export const useVideoOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addVideo, updateVideo, getVideoById } = useVideoStore();
  const queryClient = useQueryClient();

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Permission to access videos was denied');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (err) {
      console.error('Error picking video:', err);
      setError('An error occurred while selecting video');
      return null;
    }
  };

  const cropVideoMutation = useMutation({
    mutationFn: async ({ 
      videoUri, 
      startTime, 
      endTime, 
      name, 
      description 
    }: { 
      videoUri: string; 
      startTime: number; 
      endTime: number; 
      name: string; 
      description: string; 
    }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const outputFileName = `video_${Date.now()}`;
        
        const croppedVideoUri = await cropVideo({
          videoUri,
          startTime,
          endTime,
          outputFileName,
        });
        
        const thumbnailUri = await generateThumbnail(croppedVideoUri);
        
        const newVideo: VideoItem = {
          id: Date.now().toString(),
          uri: croppedVideoUri,
          name,
          description,
          duration: endTime - startTime,
          createdAt: Date.now(),
          thumbnailUri,
        };
        
        addVideo(newVideo);
        
        return newVideo;
      } catch (err) {
        console.error('Error cropping video:', err);
        setError('An error occurred during video processing');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  const editVideoMutation = useMutation({
    mutationFn: async ({ 
      videoId,
      videoUri, 
      startTime, 
      endTime, 
      name, 
      description 
    }: { 
      videoId: string;
      videoUri: string; 
      startTime: number; 
      endTime: number; 
      name: string; 
      description: string; 
    }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const existingVideo = getVideoById(videoId);
        
        if (!existingVideo) {
          throw new Error('Video not found');
        }
        
        const outputFileName = `video_edit_${Date.now()}`;
        
        const croppedVideoUri = await cropVideo({
          videoUri,
          startTime,
          endTime,
          outputFileName,
        });
        
        const thumbnailUri = await generateThumbnail(croppedVideoUri);
        
        const updatedVideo: VideoItem = {
          ...existingVideo,
          uri: croppedVideoUri,
          name,
          description,
          duration: endTime - startTime,
          thumbnailUri,
        };
        
        updateVideo(updatedVideo);
        
        return updatedVideo;
      } catch (err) {
        console.error('Error editing video:', err);
        setError('An error occurred during video editing');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  return {
    pickVideo,
    cropVideo: cropVideoMutation.mutate,
    editVideo: editVideoMutation.mutate,
    isLoading: isLoading || cropVideoMutation.isPending || editVideoMutation.isPending,
    error: error || cropVideoMutation.error?.message || editVideoMutation.error?.message,
  };
}; 