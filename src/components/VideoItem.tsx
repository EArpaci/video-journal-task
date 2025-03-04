import React from 'react';
import { View, TouchableOpacity, Image, Dimensions, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { VideoItem as VideoItemType } from '../types';
import { styled } from 'nativewind';

interface VideoItemProps {
  item: VideoItemType;
  onPress: (id: string) => void;
}

const { width } = Dimensions.get('window');

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledText = styled(Text);
const StyledCard = styled(Card);
const StyledCardContent = styled(Card.Content);

/**
 * VideoItem component displays a video card in the list
 */
const VideoItemComponent: React.FC<VideoItemProps> = ({ item, onPress }) => {
  // Format date
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

  // Format duration helper function
  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <StyledTouchableOpacity
      className="w-full mb-4"
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <StyledCard className="rounded-lg overflow-hidden">
        {/* Thumbnail */}
        <StyledView className="relative w-full h-[40vw]">
          {item.thumbnailUri ? (
            <StyledImage
              source={{ uri: item.thumbnailUri }}
              className="w-full h-full bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <StyledView className="w-full h-full bg-gray-200" />
          )}
          {/* Duration Badge */}
          <StyledView className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
            <StyledText className="text-white text-xs">
              {formatDuration(item.duration)}
            </StyledText>
          </StyledView>
        </StyledView>
        
        {/* Video Info */}
        <StyledCardContent className="py-3">
          <StyledText className="text-base font-bold mb-1 line-clamp-1">
            {item.name}
          </StyledText>
          <StyledText className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </StyledText>
          <StyledText className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </StyledText>
        </StyledCardContent>
      </StyledCard>
    </StyledTouchableOpacity>
  );
};

export default VideoItemComponent; 