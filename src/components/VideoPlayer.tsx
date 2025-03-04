import React, { useRef, useState, useEffect } from 'react';
import { View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ActivityIndicator } from 'react-native-paper';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VideoPlayerProps {
  uri: string;
  shouldPlay?: boolean;
  isLooping?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

const { width } = Dimensions.get('window');

const StyledView = styled(View);
const StyledVideo = styled(Video);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

/**
 * VideoPlayer component for playing video content with loading states
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  shouldPlay = false,
  isLooping = false,
  onPlaybackStatusUpdate,
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Refs
  const videoRef = useRef<Video>(null);

  // Effects
  useEffect(() => {
    // Clean up video when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  // Reset loading state when URI changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setHasPlayedOnce(false);
    setIsPlaying(shouldPlay);
  }, [uri, shouldPlay]);
  
  // Update playing state when shouldPlay prop changes
  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay && !isPlaying) {
        videoRef.current.playAsync();
        setIsPlaying(true);
      } else if (!shouldPlay && isPlaying) {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    }
  }, [shouldPlay]);

  // Handlers
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Update duration if available
      if (status.durationMillis && duration === 0) {
        setDuration(status.durationMillis / 1000);
      }
      
      // Update current position
      if (status.positionMillis) {
        setCurrentPosition(status.positionMillis / 1000);
      }
      
      // Update playing state
      setIsPlaying(status.isPlaying);
      
      // Video loaded and at least one frame played
      if (status.positionMillis > 0 || status.isPlaying) {
        setHasPlayedOnce(true);
        setIsLoading(false);
      }
      
      // Video loaded but not played yet
      if (status.isBuffering === false && !hasPlayedOnce) {
        // Loading complete
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Add a short delay to ensure UI updates
      }
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status);
    }
  };

  const handleError = (error: string) => {
    console.error('Video playback error:', error);
    setError('Could not play video');
    setIsLoading(false);
    Alert.alert('Playback Error', 'Could not play the video. Please try again.');
  };
  
  // Toggle play/pause
  const togglePlayPause = async () => {
    try {
      if (!videoRef.current) return;
      
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      Alert.alert('Playback Error', 'Could not control video playback. Please try again.');
    }
  };
  
  // Format time for display
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <StyledView className="w-full h-[56vw] bg-black rounded-lg overflow-hidden justify-center items-center">
      {/* Video Component */}
      <StyledVideo
        ref={videoRef}
        className="w-full h-full"
        source={{ uri }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={shouldPlay}
        isLooping={isLooping}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={handleError}
        useNativeControls={false}
      />
      
      {/* Custom Controls Overlay */}
      {!isLoading && !error && (
        <StyledTouchableOpacity 
          className="absolute inset-0 items-center justify-center"
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          {!isPlaying && (
            <StyledView className="bg-black/40 p-4 rounded-full">
              <MaterialCommunityIcons name="play" size={32} color="white" />
            </StyledView>
          )}
        </StyledTouchableOpacity>
      )}
      
      {/* Progress Bar */}
      {!isLoading && !error && duration > 0 && (
        <StyledView className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/30">
          <StyledView 
            className="h-1 bg-primary-600" 
            style={{ 
              width: `${(currentPosition / duration) * 100}%` 
            }} 
          />
        </StyledView>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <StyledView className="absolute inset-0 justify-center items-center bg-black/70">
          <ActivityIndicator size="large" color="#ffffff" />
          <StyledView className="mt-4 px-4 py-2 bg-black/50 rounded-lg">
            <StyledText className="text-white text-base">Loading video...</StyledText>
          </StyledView>
        </StyledView>
      )}
      
      {/* Error Message */}
      {error && (
        <StyledView className="absolute inset-0 justify-center items-center bg-black/70">
          <StyledView className="p-4 bg-red-500/80 rounded-lg">
            <StyledText className="text-white text-base text-center">{error}</StyledText>
            <StyledTouchableOpacity 
              className="mt-4 bg-white/20 py-2 px-4 rounded-full"
              onPress={() => {
                setError(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.loadAsync({ uri }, {}, false);
                }
              }}
            >
              <StyledText className="text-white text-sm text-center">Try Again</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
};

export default VideoPlayer; 