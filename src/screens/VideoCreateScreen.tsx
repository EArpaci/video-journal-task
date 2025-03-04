import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import { Button, TextInput, ActivityIndicator, Appbar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useVideoOperations } from '../hooks/useVideoOperations';
import VideoTrimmer from '../components/VideoTrimmer';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { z } from 'zod';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoCreate'>;
type StepIconName = 'movie-open-outline' | 'content-cut' | 'pencil-box-outline';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const AnimatableView = Animatable.createAnimatableComponent(StyledView);
const AnimatableText = Animatable.createAnimatableComponent(StyledText);

const { width, height } = Dimensions.get('window');

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

const VideoCreateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [step, setStep] = useState<'select' | 'trim' | 'metadata'>('select');
  
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  
  const { pickVideo, cropVideo, isLoading, error } = useVideoOperations();
  
  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }]
    };
  });
  
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
  
  const handleSelectVideo = useCallback(async () => {
    setIsVideoLoading(true);
    try {
      const videoUri = await pickVideo();
      if (videoUri) {
        setSelectedVideoUri(videoUri);
        setStep('trim');
      }
    } catch (error) {
      console.error('Video selection error:', error);
    } finally {
      setTimeout(() => {
        setIsVideoLoading(false);
      }, 500);
    }
  }, [pickVideo]);
  
  const handleTimeRangeSelected = useCallback((start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  }, []);
  
  const handleCropVideo = useCallback(() => {
    if (!selectedVideoUri) return;
    
    cropVideo({
      videoUri: selectedVideoUri,
      startTime,
      endTime,
      name,
      description,
    });
    
    navigation.navigate('Home');
  }, [selectedVideoUri, startTime, endTime, name, description, cropVideo, navigation]);
  
  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };
  
  const handleVideoLoad = () => {
    setTimeout(() => {
      setIsVideoLoading(false);
    }, 500);
  };
  
  const renderProgressBar = () => {
    const steps = ['select', 'trim', 'metadata'];
    const currentIndex = steps.indexOf(step);
    const stepIcons: StepIconName[] = ['movie-open-outline', 'content-cut', 'pencil-box-outline'];
    const stepTitles = ['Select', 'Trim', 'Details'];
    
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
              width: currentIndex === 0 ? 0 : 
                    currentIndex === 1 ? '50%' : '100%' 
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
                      {index === 0 ? "Choose a video" : 
                       index === 1 ? "Set start & end" : 
                       "Add information"}
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
    switch (step) {
      case 'select':
        return (
          <AnimatableView animation="fadeIn" className="flex-1 items-center justify-center p-5">
            <StyledView className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <AnimatableView animation="bounceIn" className="items-center mb-6">
                <LinearGradient
                  colors={['#6200ee', '#9c4dff']}
                  style={{ padding: 16, borderRadius: 50 }}
                >
                  <MaterialCommunityIcons name="video-plus-outline" size={64} color="white" />
                </LinearGradient>
              </AnimatableView>
              
              <AnimatableText animation="fadeInUp" delay={300} className="text-xl font-bold mb-2 text-center text-gray-800">
                Create New Video
              </AnimatableText>
              <AnimatableText animation="fadeInUp" delay={400} className="text-sm text-center text-gray-500 mb-6">
                Select, trim, and add details to your video
              </AnimatableText>
              
              {isVideoLoading ? (
                <AnimatableView animation="fadeIn" className="items-center justify-center py-6">
                  <ActivityIndicator size="large" color="#6200ee" />
                  <StyledText className="mt-4 text-sm text-center text-gray-600">
                    Loading...
                  </StyledText>
                </AnimatableView>
              ) : (
                <AnimatableView animation="fadeInUp" delay={500}>
                  <StyledTouchableOpacity
                    className="bg-primary-600 py-4 rounded-xl flex-row items-center justify-center shadow-md mb-4"
                    onPress={handleSelectVideo}
                  >
                    <MaterialCommunityIcons name="image-multiple" size={20} color="white" />
                    <StyledText className="text-white font-bold text-sm ml-2">
                      SELECT FROM GALLERY
                    </StyledText>
                  </StyledTouchableOpacity>
                  
                  <StyledTouchableOpacity
                    className="bg-green-600 py-4 rounded-xl flex-row items-center justify-center shadow-md"
                    onPress={handleSelectVideo}
                  >
                    <MaterialCommunityIcons name="video" size={20} color="white" />
                    <StyledText className="text-white font-bold text-sm ml-2">
                      SELECT VIDEO
                    </StyledText>
                  </StyledTouchableOpacity>
                </AnimatableView>
              )}
            </StyledView>
          </AnimatableView>
        );
        
      case 'trim':
        return (
          <AnimatableView animation="fadeIn" className="flex-1 p-2">
            <StyledView className="bg-white rounded-xl shadow-lg p-4 mb-4 overflow-hidden">
              {selectedVideoUri && (
                <VideoTrimmer
                  videoUri={selectedVideoUri}
                  onTimeRangeSelected={handleTimeRangeSelected}
                  onLoadStart={handleVideoLoadStart}
                  onLoad={handleVideoLoad}
                  onNext={() => setStep('metadata')}
                  onBack={() => setStep('select')}
                />
              )}
            </StyledView>
          </AnimatableView>
        );
        
      case 'metadata':
        return (
          <StyledKeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 p-4"
          >
            <Animated.ScrollView style={formAnimatedStyle}>
              <StyledView className="bg-white rounded-xl shadow-lg p-5 mb-4">
                <StyledText className="text-lg font-bold text-gray-800 mb-6">
                  Add Video Details
                </StyledText>
                
                <Animated.View>
                  <TextInput
                    label="Video Title"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    className="mb-2"
                    placeholder="E.g.: Weekend Trip"
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
                    label="Video Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    className="mb-2"
                    placeholder="Add a description for your video..."
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
                    onPress={handleCropVideo}
                    className="flex-1 ml-2"
                    icon="check"
                    contentStyle={{ height: 40 }}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Save Video
                  </Button>
                </StyledView>
              </StyledView>
            </Animated.ScrollView>
          </StyledKeyboardAvoidingView>
        );
    }
  };
  
  useEffect(() => {
    if (step === 'metadata') {
      // Animate form elements when switching to metadata step
      formOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
      formTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [step]);
  
  const handleSaveVideo = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }
    
    // Use existing handleCropVideo function
    handleCropVideo();
  };
  
  return (
    <StyledView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={{ 
        paddingTop: 48, 
        paddingBottom: 8, 
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5
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
            borderBottomLeftRadius: 20, 
            borderBottomRightRadius: 20
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
          
          <AnimatableText 
            animation="fadeIn" 
            className="text-white font-bold text-lg ml-2"
          >
            {step === 'select' ? 'Create Video' : 
             step === 'trim' ? 'Trim Video' : 
             'Add Details'}
          </AnimatableText>
        </StyledView>
        
        {renderProgressBar()}
      </View>
      
      {isLoading ? (
        <AnimatableView animation="fadeIn" className="flex-1 items-center justify-center p-5">
          <ActivityIndicator size="large" color="#6200ee" />
          <AnimatableText animation="fadeIn" delay={300} className="text-base font-bold mt-4 text-gray-800">
            Processing Video...
          </AnimatableText>
          <AnimatableText animation="fadeIn" delay={500} className="text-xs text-gray-500 mt-2 text-center max-w-xs">
            Please wait while we process your video...
          </AnimatableText>
        </AnimatableView>
      ) : (
        renderContent()
      )}
    </StyledView>
  );
};

export default VideoCreateScreen; 