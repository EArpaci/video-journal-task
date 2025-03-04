import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { AVPlaybackStatus, Video, ResizeMode } from 'expo-av';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VideoTrimmerProps {
  videoUri: string;
  onTimeRangeSelected: (startTime: number, endTime: number) => void;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSlider = styled(Slider);

/**
 * VideoTrimmer component allows users to trim a video by selecting start and end times
 */
const VideoTrimmer: React.FC<VideoTrimmerProps> = ({ 
  videoUri, 
  onTimeRangeSelected,
  onLoadStart,
  onLoad,
  onNext = () => {},
  onBack
}) => {
  // State
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs
  const videoRef = useRef<Video>(null);
  
  // Handlers
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (videoDuration === 0 && status.durationMillis) {
        const durationInSeconds = status.durationMillis / 1000;
        setVideoDuration(durationInSeconds);
        setEndTime(Math.min(5, durationInSeconds));
        setIsVideoLoaded(true);
        if (onLoad) {
          onLoad();
        }
      }
      
      if (status.positionMillis) {
        const currentPos = status.positionMillis / 1000;
        setCurrentPosition(currentPos);
        
        if (isPlaying && currentPos >= endTime) {
          videoRef.current?.pauseAsync();
          setIsPlaying(false);
          // Reset to start time when playback ends
          videoRef.current?.setPositionAsync(startTime * 1000);
        }
      }
    }
  };
  
  // Effects
  useEffect(() => {
    onTimeRangeSelected(startTime, endTime);
  }, [startTime, endTime, onTimeRangeSelected]);
  
  useEffect(() => {
    setIsVideoLoaded(false);
    if (onLoadStart) {
      onLoadStart();
    }
  }, [videoUri, onLoadStart]);
  
  // Reset video position when start time changes
  useEffect(() => {
    if (videoRef.current && isVideoLoaded && !isPlaying) {
      videoRef.current.setPositionAsync(startTime * 1000);
    }
  }, [startTime, isVideoLoaded, isPlaying]);
  
  // Helper functions
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (value: number) => {
    const newStartTime = Math.floor(value);
    const duration = endTime - newStartTime;
    
    if (duration < 1) {
      Alert.alert('Warning', 'Trim duration must be at least 1 second.');
      return;
    }
    
    if (duration > 5) {
      const newEndTime = newStartTime + 5;
      setEndTime(newEndTime);
    }
    
    setStartTime(newStartTime);
    
    // Update video position to reflect new start time
    if (videoRef.current && !isPlaying) {
      videoRef.current.setPositionAsync(newStartTime * 1000);
    }
  };

  const handleEndTimeChange = (value: number) => {
    const newEndTime = Math.floor(value);
    const duration = newEndTime - startTime;
    
    if (duration < 1) {
      Alert.alert('Warning', 'Trim duration must be at least 1 second.');
      return;
    }
    
    if (duration > 5) {
      const newStartTime = newEndTime - 5;
      setStartTime(newStartTime);
      
      // Update video position to reflect new start time
      if (videoRef.current && !isPlaying) {
        videoRef.current.setPositionAsync(newStartTime * 1000);
      }
    }
    
    setEndTime(newEndTime);
  };
  
  const handlePlayPreview = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        // Set position to start time before playing
        await videoRef.current.setPositionAsync(startTime * 1000);
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      Alert.alert('Playback Error', 'Could not play the video. Please try again.');
    }
  };
  
  return (
    <StyledScrollView className="w-full">
      {/* Video Player */}
      <StyledView className="mb-4">
        <Video 
          ref={videoRef}
          source={{ uri: videoUri }}
          style={{ width: '100%', height: 200 }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />
        
        {/* Video Controls Overlay */}
        <StyledView className="absolute inset-0 items-center justify-center">
          {!isVideoLoaded ? (
            <StyledView className="bg-black/50 p-3 rounded-full">
              <MaterialCommunityIcons name="loading" size={30} color="white" />
            </StyledView>
          ) : (
            <StyledTouchableOpacity 
              className="bg-black/30 p-4 rounded-full"
              onPress={handlePlayPreview}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={isPlaying ? "pause" : "play"} 
                size={30} 
                color="white" 
              />
            </StyledTouchableOpacity>
          )}
        </StyledView>
        
        {/* Playback Position Indicator */}
        <StyledView className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/30">
          <StyledView 
            className="h-1 bg-primary-600" 
            style={{ 
              width: `${(currentPosition / videoDuration) * 100}%` 
            }} 
          />
        </StyledView>
      </StyledView>
      
      {/* Trimming Controls */}
      <StyledView className="px-2 py-4 bg-white rounded-xl shadow-md">
        <StyledView className="mb-4">
          {/* Duration Info */}
          <StyledView className="flex-row justify-between items-center mb-2">
            <StyledView className="flex-row items-center">
              <MaterialCommunityIcons name="clock-outline" size={18} color="#6200ee" />
              <StyledText className="ml-1 text-sm font-medium text-gray-600">
                Total: {formatTime(videoDuration)}
              </StyledText>
            </StyledView>
            
            <StyledView className="bg-purple-100 px-3 py-1 rounded-full">
              <StyledText className="text-xs font-bold text-primary-600">
                {formatTime(startTime)} - {formatTime(endTime)}
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Trimming UI */}
          <StyledView className="bg-purple-50 p-3 rounded-lg mb-3">
            <StyledText className="text-center text-gray-600 text-xs mb-3">
              Use the sliders to trim your video (between 1-5 seconds)
            </StyledText>
            
            <StyledView className="flex-row items-center justify-center mb-3">
              <StyledView className="bg-primary-100 px-3 py-1 rounded-full">
                <StyledText className="text-sm font-bold text-primary-600">
                  <MaterialCommunityIcons name="content-cut" size={14} color="#6200ee" /> {Math.round((endTime - startTime) * 10) / 10} seconds
                </StyledText>
              </StyledView>
            </StyledView>
            
            {/* Trim Range Visualization */}
            <StyledView className="mb-4">
              <StyledView className="flex-row justify-between items-center mb-2">
                <StyledView className="bg-gray-100 px-2 py-1 rounded-md">
                  <StyledText className="text-xs text-gray-700">{formatTime(startTime)}</StyledText>
                </StyledView>
                
                <StyledView className="flex-1 mx-2 h-1 bg-primary-200 rounded-full">
                  <StyledView 
                    className="absolute h-1 bg-primary-600 rounded-full" 
                    style={{ 
                      left: `${(startTime / videoDuration) * 100}%`, 
                      right: `${100 - (endTime / videoDuration) * 100}%` 
                    }}
                  />
                </StyledView>
                
                <StyledView className="bg-gray-100 px-2 py-1 rounded-md">
                  <StyledText className="text-xs text-gray-700">{formatTime(endTime)}</StyledText>
                </StyledView>
              </StyledView>
              
              {/* Start Time Slider */}
              <StyledText className="text-xs text-gray-600 mb-1">Start time</StyledText>
              <StyledSlider
                minimumValue={0}
                maximumValue={videoDuration - 1}
                value={startTime}
                onValueChange={handleStartTimeChange}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#6200ee"
                step={1}
              />
            </StyledView>
            
            {/* End Time Slider */}
            <StyledText className="text-xs text-gray-600 mb-1">End time</StyledText>
            <StyledSlider
              minimumValue={1}
              maximumValue={videoDuration}
              value={endTime}
              onValueChange={handleEndTimeChange}
              minimumTrackTintColor="#6200ee"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#6200ee"
              step={1}
            />
          </StyledView>
        </StyledView>
        
        {/* Navigation Buttons */}
        <StyledView className="flex-row justify-between mt-2">
          {onBack && (
            <StyledTouchableOpacity
              className="flex-1 mr-2 border-2 border-primary-600 rounded-xl py-3 px-2 flex-row items-center justify-center"
              onPress={onBack}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color="#6200ee" />
              <StyledText className="ml-1 font-bold text-primary-600">
                Back
              </StyledText>
            </StyledTouchableOpacity>
          )}
          
          <StyledTouchableOpacity
            className="flex-1 bg-green-600 rounded-xl py-3 px-2 flex-row items-center justify-center shadow-md"
            onPress={onNext}
            activeOpacity={0.7}
          >
            <StyledText className="font-bold text-white mr-1">
              Next
            </StyledText>
            <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
};

export default VideoTrimmer;