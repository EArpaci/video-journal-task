# Video Journal App

A React Native application that allows users to trim, annotate, and save their videos as a personal video journal.

## Features

- Select videos from device gallery
- Trim videos to create short clips
- Add title and description to videos
- Save processed videos locally
- View list of saved videos
- View video details and playback

## Technologies

- React Native & Expo
- TypeScript
- NativeWind (Tailwind CSS for React Native)
- Zustand (State Management)
- React Query (Async Operations)
- FFmpeg (Video Processing)
- React Navigation (Screen Management)
- React Native Paper (UI Components)
- Zod (Form Validation)
- React Native Reanimated (Animations)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/EArpaci/video-journal-task.git
cd video-journal-task
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npx expo start
```

## Development

This application is developed with Expo. You can use the following commands for development:

- `npx expo start` - Starts the development server
- `npx expo start --android` - Starts on Android emulator
- `npx expo start --ios` - Starts on iOS simulator
- `npx expo start --web` - Starts on web browser

## Project Structure

```
src/
  ├── components/       # Reusable UI components
  │   ├── VideoItem.tsx       # Video list item component
  │   ├── VideoPlayer.tsx     # Video playback component
  │   └── VideoTrimmer.tsx    # Video trimming component
  │
  ├── hooks/            # Custom React hooks
  │   └── useVideoOperations.ts  # Video processing operations
  │
  ├── navigation/       # Navigation configuration
  │   └── AppNavigator.tsx    # Main navigation setup
  │
  ├── screens/          # Screen components
  │   ├── HomeScreen.tsx         # Main video list screen
  │   ├── VideoCreateScreen.tsx  # Create new video screen
  │   ├── VideoDetailsScreen.tsx # Video details and playback
  │   └── VideoEditScreen.tsx    # Edit existing video
  │
  ├── services/         # External services
  │   └── videoService.ts    # FFmpeg video processing
  │
  ├── store/            # Zustand state management
  │   └── videoStore.ts      # Video data store
  │
  └── types/            # TypeScript type definitions
      └── index.ts           # Common type definitions
```

## Usage

1. **Home Screen**: View all your saved videos
2. **Create Video**: Select a video from your gallery, trim it, and add details
3. **Video Details**: View video information and play the video
4. **Edit Video**: Modify an existing video's trim points or details