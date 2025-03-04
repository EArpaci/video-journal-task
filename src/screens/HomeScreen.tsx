import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import useVideoStore from '../store/videoStore';
import { VideoItem } from '../types';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VideoItemComponent from '../components/VideoItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledFlatList = styled(FlatList<VideoItem>);
const StyledTouchableOpacity = styled(TouchableOpacity);

/**
 * HomeScreen displays the list of saved videos
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { videos } = useVideoStore();

  // Handlers
  const handleVideoPress = useCallback((videoId: string) => {
    navigation.navigate('VideoDetails', { videoId });
  }, [navigation]);

  const handleAddVideo = useCallback(() => {
    navigation.navigate('VideoCreate');
  }, [navigation]);

  // Render empty state when no videos exist
  const renderEmptyList = () => (
    <StyledView className="flex-1 items-center justify-center p-5">
      <StyledView className="bg-white/80 rounded-3xl p-8 w-full max-w-xs shadow-lg">
        <StyledView className="items-center">
          <MaterialCommunityIcons name="video-plus-outline" size={64} color="#6200ee" />
          <StyledText className="text-lg font-bold text-center text-gray-800 mt-4">
            No Videos Yet
          </StyledText>
          <StyledText className="text-sm text-center text-gray-500 mt-2 mb-6">
            Start recording your moments
          </StyledText>
          <StyledTouchableOpacity
            className="bg-primary-600 py-3 px-6 rounded-full flex-row items-center shadow-md"
            onPress={handleAddVideo}
          >
            <MaterialCommunityIcons name="video-plus" size={20} color="white" />
            <StyledText className="text-white font-bold ml-2">
              Create Video
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render individual video item
  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <VideoItemComponent item={item} onPress={handleVideoPress} />
  );

  return (
    <StyledView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      {/* Header */}
      <StyledView style={{ 
        paddingTop: 48, 
        paddingBottom: 16, 
        borderBottomLeftRadius: 16, 
        borderBottomRightRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <LinearGradient
          colors={['#6200ee', '#9c4dff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            top: 0, 
            bottom: 0,
            borderBottomLeftRadius: 16, 
            borderBottomRightRadius: 16
          }}
        />
        
        <StyledView className="px-4 flex-row justify-between items-center">
          <StyledView>
            <StyledText className="text-white text-2xl font-bold">
              Video Journal
            </StyledText>
            <StyledText className="text-white/80 text-sm mt-1">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'} saved
            </StyledText>
          </StyledView>
          
          {/* Add Video Button */}
          <StyledTouchableOpacity
            className="bg-white/20 h-12 w-12 rounded-full items-center justify-center border-2 border-white/30"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4
            }}
            activeOpacity={0.7}
            onPress={handleAddVideo}
          >
            <MaterialCommunityIcons 
              name="video-plus" 
              size={24} 
              color="white" 
            />
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
      
      {/* Video List */}
      <StyledFlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </StyledView>
  );
};

export default HomeScreen;