import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Divider, IconButton } from 'react-native-paper';
import { styled } from 'nativewind';
import { RootStackParamList } from '../types';
import useVideoStore from '../store/videoStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VideoPlayer from '../components/VideoPlayer';

type VideoDetailsRouteProp = RouteProp<RootStackParamList, 'VideoDetails'>;
type VideoDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoDetails'>;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

/**
 * VideoDetailsScreen displays the details of a selected video
 */
const VideoDetailsScreen: React.FC = () => {
  // Navigation and route
  const navigation = useNavigation<VideoDetailsNavigationProp>();
  const route = useRoute<VideoDetailsRouteProp>();
  const { videoId } = route.params;
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get video from store
  const { getVideoById, removeVideo } = useVideoStore();
  const video = getVideoById(videoId);
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Format duration for display
  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle video deletion
  const handleDeleteVideo = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            removeVideo(videoId);
            navigation.goBack();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  if (!video) {
    return (
      <StyledView className="flex-1 items-center justify-center">
        <StyledText className="text-lg font-medium text-gray-800">
          Video Not Found
        </StyledText>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          className="mt-4"
        >
          Go Back
        </Button>
      </StyledView>
    );
  }
  
  return (
    <StyledView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Video Player Section */}
      <StyledView className="w-full aspect-video bg-black relative">
        <VideoPlayer
          uri={video.uri}
          shouldPlay={isPlaying}
          isLooping={true}
        />
        
        {/* Gradient overlay for controls */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
        }}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={{ flex: 1 }}
          />
        </View>
        
        {/* Top navigation controls */}
        <StyledView className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', margin: 0 }}
          />
          <IconButton
            icon="delete-outline"
            iconColor="white"
            size={24}
            onPress={handleDeleteVideo}
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', margin: 0 }}
          />
        </StyledView>
        
        {/* Play/Pause button */}
        <StyledTouchableOpacity 
          className="absolute bottom-4 right-4 bg-primary-600 rounded-full p-3"
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <MaterialCommunityIcons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
        </StyledTouchableOpacity>
      </StyledView>
      
      {/* Video Details Section */}
      <StyledScrollView className="flex-1 px-4 pt-4">
        {/* Title and metadata */}
        <StyledView className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <StyledText className="text-lg font-bold text-gray-800">{video.name}</StyledText>
          
          <StyledView className="flex-row items-center mt-2">
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6200ee" />
            <StyledText className="text-xs text-primary-600 ml-1 font-medium">
              {formatDuration(video.duration)}
            </StyledText>
            
            <StyledView className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
            
            <MaterialCommunityIcons name="calendar-outline" size={16} color="#6200ee" />
            <StyledText className="text-xs text-primary-600 ml-1 font-medium">
              {formatDate(video.createdAt)}
            </StyledText>
          </StyledView>
        </StyledView>
        
        {/* Description section (if available) */}
        {video.description ? (
          <StyledView className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <StyledText className="text-sm font-medium text-gray-800 mb-2">Description</StyledText>
            <Divider className="mb-3" />
            <StyledText className="text-sm text-gray-600 leading-5">
              {video.description}
            </StyledText>
          </StyledView>
        ) : null}
        
        {/* Actions section */}
        <StyledView className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <StyledText className="text-sm font-medium text-gray-800 mb-2">Actions</StyledText>
          <Divider className="mb-3" />
          
          <StyledView className="flex-row justify-between">
            <Button 
              mode="outlined" 
              icon="pencil"
              onPress={() => navigation.navigate('VideoEdit', { videoId: video.id })}
              style={{ flex: 1, marginRight: 8 }}
              contentStyle={{ height: 40 }}
              labelStyle={{ fontSize: 12 }}
            >
              Edit
            </Button>
            
            <Button 
              mode="outlined" 
              icon="share-variant"
              onPress={() => {}}
              style={{ flex: 1 }}
              contentStyle={{ height: 40 }}
              labelStyle={{ fontSize: 12 }}
            >
              Share
            </Button>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

export default VideoDetailsScreen; 