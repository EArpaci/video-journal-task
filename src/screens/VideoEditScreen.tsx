import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Button, TextInput, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useVideoOperations } from '../hooks/useVideoOperations';
import VideoTrimmer from '../components/VideoTrimmer';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { z } from 'zod';
import useVideoStore from '../store/videoStore';
import * as Animatable from 'react-native-animatable';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoEdit'>;
type RouteProps = RouteProp<RootStackParamList, 'VideoEdit'>;
type StepIconName = 'content-cut' | 'pencil-box-outline';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const AnimatableView = Animatable.createAnimatableComponent(StyledView);
const AnimatableText = Animatable.createAnimatableComponent(StyledText);

// Form validation schema using Zod
const videoFormSchema = z.object({
  name: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

type VideoFormData = z.infer<typeof videoFormSchema>;

// Step colors configuration
const stepColors = {
  completed: {
    bg: '#4CAF50',
    text: '#fff',
    icon: 'white',
    shadow: 'rgba(76, 175, 80, 0.4)'
  },
  active: {
    bg: '#6200EE',
    text: '#fff',
    icon: 'white',
    shadow: 'rgba(98, 0, 238, 0.4)'
  },
  upcoming: {
    bg: '#E0E0E0',
    text: '#fff',
    icon: '#757575',
    shadow: 'rgba(0, 0, 0, 0.1)'
  }
};

const VideoEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { videoId } = route.params;
  
  const { getVideoById } = useVideoStore();
  const videoData = getVideoById(videoId);
  
  const [step, setStep] = useState<'trim' | 'metadata'>('trim');
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  
  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }]
    };
  });
  
  const { editVideo, isLoading, error } = useVideoOperations();
  
  useEffect(() => {
    if (videoData) {
      setName(videoData.name);
      setDescription(videoData.description);
    }
  }, [videoData]);
  
  useEffect(() => {
    if (step === 'metadata') {
      // Animate form elements when switching to metadata step
      formOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
      formTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [step]);
  
  // Form validation function
  const validateForm = (): boolean => {
    try {
      videoFormSchema.parse({ name, description });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: {
          name?: string;
          description?: string;
        } = {};
        
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          errors[path as keyof typeof errors] = err.message;
        });
        
        setFormErrors(errors);
      }
      return false;
    }
  };
  
  const handleTimeRangeSelected = useCallback((start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  }, []);
  
  const handleUpdateVideo = useCallback(() => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }
    
    if (!videoData) {
      return;
    }
    
    editVideo({
      videoId,
      videoUri: videoData.uri,
      startTime,
      endTime,
      name,
      description,
    });
    
    navigation.navigate('Home');
  }, [videoId, videoData, startTime, endTime, name, description, editVideo, navigation]);
  
  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };
  
  const handleVideoLoad = () => {
    setTimeout(() => {
      setIsVideoLoading(false);
    }, 500);
  };
  
  const renderProgressBar = () => {
    const steps = ['trim', 'metadata'];
    const currentIndex = steps.indexOf(step);
    const stepIcons: StepIconName[] = ['content-cut', 'pencil-box-outline'];
    const stepTitles = ['Trim', 'Details'];
    
    return (
      <StyledView className="px-4 py-6">
        {/* Steps Container */}
        <StyledView className="flex-row items-center justify-between relative">
          {/* Progress Line Background */}
          <StyledView 
            className="absolute top-[28px] left-[40px] right-[40px] h-[4px] rounded-full bg-gray-200 -z-10" 
          />
          
          {/* Active Progress Line */}
          <LinearGradient
            colors={['#6200EE', '#9c4dff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute top-[28px] left-[40px] h-[4px] rounded-full -z-5"
            style={{ 
              width: currentIndex === 0 ? 0 : '100%' 
            }}
          />
          
          {/* Step Circles */}
          {steps.map((s, index) => {
            // Determine step state
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isUpcoming = index > currentIndex;
            
            // Get appropriate colors based on state
            const colorSet = isCompleted ? stepColors.completed : 
                            isActive ? stepColors.active : 
                            stepColors.upcoming;
            
            return (
              <AnimatableView 
                key={s} 
                animation={isActive ? "pulse" : undefined}
                iterationCount={isActive ? "infinite" : undefined}
                duration={2000}
                className="items-center z-10"
              >
                {/* Step Circle */}
                <StyledView 
                  className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: colorSet.bg,
                    shadowColor: colorSet.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: isActive ? 8 : 4
                  }}
                >
                  {isCompleted ? (
                    <MaterialCommunityIcons name="check-bold" size={24} color="white" />
                  ) : (
                    <MaterialCommunityIcons name={stepIcons[index]} size={24} color={colorSet.icon} />
                  )}
                </StyledView>
                
                {/* Step Number Badge */}
                {!isCompleted && (
                  <StyledView 
                    className="absolute top-0 right-0 w-6 h-6 rounded-full items-center justify-center border-2 border-white"
                    style={{ 
                      backgroundColor: isActive ? '#FF4081' : '#BDBDBD',
                      transform: [{ translateX: 5 }, { translateY: -2 }]
                    }}
                  >
                    <StyledText className="text-xs font-bold text-white">
                      {index + 1}
                    </StyledText>
                  </StyledView>
                )}
                
                {/* Step Title */}
                <AnimatableText 
                  animation={isActive ? "fadeIn" : undefined}
                  className="text-sm mt-3 font-bold"
                  style={{ 
                    color: colorSet.text,
                    opacity: isActive ? 1 : isCompleted ? 0.9 : 0.7
                  }}
                >
                  {stepTitles[index]}
                </AnimatableText>
                
                {/* Step Description - Only show for active step */}
                {isActive && (
                  <AnimatableView 
                    animation="fadeIn" 
                    delay={300}
                    className="mt-1 px-2 py-1 rounded-full bg-purple-100"
                  >
                    <StyledText className="text-xs text-primary-700">
                      {index === 0 ? "Set start & end" : "Add information"}
                    </StyledText>
                  </AnimatableView>
                )}
              </AnimatableView>
            );
          })}
        </StyledView>
      </StyledView>
    );
  };
  
  const renderContent = () => {
    if (!videoData) {
      return (
        <StyledView className="flex-1 items-center justify-center p-5">
          <StyledText className="text-base font-medium text-gray-800">
            Video Not Found
          </StyledText>
        </StyledView>
      );
    }
    
    switch (step) {
      case 'trim':
        return (
          <StyledView className="flex-1 p-4">
            <StyledView className="bg-white rounded-xl shadow-sm p-4 mb-4">
            
              <VideoTrimmer
                videoUri={videoData.uri}
                onTimeRangeSelected={handleTimeRangeSelected}
                onLoadStart={handleVideoLoadStart}
                onLoad={handleVideoLoad}
                onNext={() => setStep('metadata')}
                onBack={() => navigation.goBack()}
              />
            </StyledView>
          </StyledView>
        );
        
      case 'metadata':
        return (
          <StyledKeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 p-4"
          >
            <Animated.ScrollView style={formAnimatedStyle}>
              <StyledView className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <StyledText className="text-sm font-medium text-gray-800 mb-2">
                  Video Information
                </StyledText>
                <Divider className="mb-4" />
                
                <Animated.View>
                  <TextInput
                    label="Video Title"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    className="mb-2"
                    placeholder="E.g.: My Walk Today"
                    outlineColor={formErrors.name ? "#ff3b30" : "#e0e0e0"}
                    activeOutlineColor={formErrors.name ? "#ff3b30" : "#6200ee"}
                    style={{ fontSize: 14, backgroundColor: 'white' }}
                    error={!!formErrors.name}
                  />
                  {formErrors.name && (
                    <StyledText className="text-red-500 text-xs mb-3 ml-2">
                      {formErrors.name}
                    </StyledText>
                  )}
                </Animated.View>
                
                <Animated.View>
                  <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    className="mb-2"
                    placeholder="A short description about your video..."
                    outlineColor={formErrors.description ? "#ff3b30" : "#e0e0e0"}
                    activeOutlineColor={formErrors.description ? "#ff3b30" : "#6200ee"}
                    style={{ fontSize: 14, backgroundColor: 'white' }}
                    error={!!formErrors.description}
                  />
                  {formErrors.description && (
                    <StyledText className="text-red-500 text-xs mb-3 ml-2">
                      {formErrors.description}
                    </StyledText>
                  )}
                </Animated.View>
                
                <StyledView className="flex-row justify-between mt-4">
                  <Button
                    mode="outlined"
                    onPress={() => setStep('trim')}
                    className="flex-1 mr-2"
                    icon="arrow-left"
                    contentStyle={{ height: 40 }}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Back
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={handleUpdateVideo}
                    className="flex-1"
                    disabled={!name || isLoading}
                    icon="content-save"
                    contentStyle={{ height: 40 }}
                    labelStyle={{ fontSize: 12 }}
                    loading={isLoading}
                  >
                    Update
                  </Button>
                </StyledView>
              </StyledView>
            </Animated.ScrollView>
          </StyledKeyboardAvoidingView>
        );
    }
  };
  
  return (
    <StyledView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={{ 
        paddingTop: 48, 
        paddingBottom: 8, 
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
        
        <StyledView className="flex-row items-center px-4">
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ margin: 0 }}
          />
          
          <StyledText className="text-white font-medium text-lg ml-2">
            {step === 'trim' ? 'Edit Video' : 'Video Details'}
          </StyledText>
        </StyledView>
        
        {renderProgressBar()}
      </View>
      
      {isLoading ? (
        <StyledView className="flex-1 items-center justify-center p-5">
          <ActivityIndicator size="large" color="#6200ee" />
          <StyledText className="text-base font-medium mt-4 text-gray-800">
            Processing Video...
          </StyledText>
          <StyledText className="text-xs text-gray-500 mt-2 text-center max-w-xs">
            This may take a few seconds, please wait...
          </StyledText>
        </StyledView>
      ) : (
        renderContent()
      )}
    </StyledView>
  );
};

export default VideoEditScreen; 