# React Native Video App 🎥

A modern React Native video application built with Expo, featuring YouTube API integration, video playback, and persistent caching.

## ✨ Features

-   **🔐 Authentication**: Login screen with Redux state management
-   **📱 Navigation**: Bottom tab navigation with Expo Router
-   **🎬 Video Discovery**: YouTube Data API integration for video search
-   **💾 Persistent Caching**: React Query with AsyncStorage persistence
-   **🎥 Video Playback**: React Native Video integration (requires development build)
-   **🔄 Pull-to-Refresh**: Refresh video content with haptic feedback
-   **📱 Responsive Design**: Adaptive layouts for different screen sizes
-   **🎨 Modern UI**: Custom SVG icons and smooth animations

## 🚀 Quick Start

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Expo CLI (`npm install -g @expo/cli`)
-   iOS Simulator (for iOS development) or Android Studio (for Android development)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rn-video-app
npm install
```

### 2. YouTube API Setup

1. **Get YouTube Data API Key**:

    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing one
    - Enable the YouTube Data API v3
    - Create credentials (API Key)
    - Restrict the API key to YouTube Data API v3

2. **Configure Environment Variables**:

    ```bash
    # Create .env file in project root
    echo "EXPO_PUBLIC_YOUTUBE_API_KEY=your_api_key_here" > .env
    ```

    **Important**: Replace `your_api_key_here` with your actual YouTube Data API key.

### 3. Development Setup

#### For Standard Expo Development (without video playback):

```bash
npx expo start
```

#### For Full Features (including video playback):

Since this app uses `react-native-video`, you need a development build:

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## 📱 App Structure

```
app/
├── (tabs)/           # Tab navigation screens
│   ├── index.tsx     # Home screen with video discovery
│   ├── search.tsx    # Search functionality
│   └── _layout.tsx   # Tab layout configuration
├── login.tsx         # Authentication screen
├── index.tsx         # App entry point
└── _layout.tsx       # Root layout with providers

components/           # Reusable UI components
hooks/               # Custom React hooks
services/            # API services
store/               # Redux store and slices
utils/               # Utility functions
assets/              # Images, icons, and media files
```

## 🛠 Tech Stack

-   **Framework**: React Native with Expo SDK 54
-   **Navigation**: Expo Router (file-based routing)
-   **State Management**: Redux Toolkit with Redux Persist
-   **Data Fetching**: TanStack Query (React Query) with persistence
-   **Video Playback**: react-native-video
-   **Styling**: StyleSheet with responsive utilities
-   **Icons**: Custom SVG icons
-   **TypeScript**: Full TypeScript support

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_data_api_key_here
```

### App Configuration

The app is configured in `app.json` with:

-   Expo Router for navigation
-   Development client for custom native modules
-   React Native Video plugin
-   Custom splash screen

## 📦 Key Dependencies

-   `@tanstack/react-query` - Data fetching and caching
-   `@tanstack/react-query-persist-client` - Query persistence
-   `@reduxjs/toolkit` - State management
-   `react-native-video` - Video playback
-   `expo-dev-client` - Development builds
-   `@react-native-async-storage/async-storage` - Local storage

## 🎯 Features in Detail

### Video Discovery

-   Fetches videos from YouTube Data API
-   Displays videos in horizontal scrollable lists
-   Categorizes by programming topics (React Native, React, TypeScript, JavaScript)
-   Pull-to-refresh functionality

### Caching Strategy

-   **Stale Time**: 24 hours (data stays fresh)
-   **Garbage Collection**: 7 days (keeps in cache)
-   **Persistence**: Survives app restarts via AsyncStorage
-   **Throttled Writes**: Prevents excessive storage writes

### Video Playback

-   Full-featured video player with native controls
-   Background playback support
-   Error handling and loading states
-   Responsive 16:9 aspect ratio

## 🚨 Important Notes

### Development Build Required

This app uses `react-native-video` which requires native code. You **cannot** use Expo Go for full functionality. You must create a development build:

```bash
# Build and run on iOS
npx expo run:ios

# Build and run on Android
npx expo run:android
```

### API Quotas

-   YouTube Data API has daily quotas
-   The app is configured with reduced retries to save quota
-   Consider implementing proper error handling for quota exceeded scenarios

## 🐛 Troubleshooting

### Video Not Playing

-   Ensure you're using a development build, not Expo Go
-   Check that `react-native-video` is properly configured in `app.json`
-   Verify video file paths and formats

### API Errors

-   Verify your YouTube Data API key is correct
-   Check API quotas in Google Cloud Console
-   Ensure the API key has YouTube Data API v3 enabled

### Build Issues

-   Clear Metro cache: `npx expo start --clear`
-   Reset project: `npm run reset-project`
-   Check Expo CLI version: `npx expo --version`

## 📄 Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
npm run reset-project  # Reset to clean project
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Resources

-   [Expo Documentation](https://docs.expo.dev/)
-   [React Native Video](https://github.com/react-native-video/react-native-video)
-   [YouTube Data API](https://developers.google.com/youtube/v3)
-   [TanStack Query](https://tanstack.com/query/latest)
-   [Redux Toolkit](https://redux-toolkit.js.org/)

---

**Note**: This app requires a development build for full functionality. Standard Expo Go will not support video playback features.
