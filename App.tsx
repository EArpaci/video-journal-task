import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import './global.css'; // Required for NativeWind

// Create React Query client
const queryClient = new QueryClient();

// FFmpeg configuration
FFmpegKitConfig.enableLogCallback(log => {
  const message = log.getMessage();
  console.log(`FFmpeg: ${message}`);
});

FFmpegKitConfig.enableStatisticsCallback(statistics => {
  console.log(`FFmpeg progress: ${statistics.getTime() / 1000} seconds`);
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
