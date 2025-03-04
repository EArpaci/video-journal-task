import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import { CropParams } from '../types';

export const cropVideo = async (params: CropParams): Promise<string> => {
  const { videoUri, startTime, endTime, outputFileName } = params;
  
  const outputDir = `${FileSystem.documentDirectory}videos/`;
  const outputPath = `${outputDir}${outputFileName}.mp4`;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(outputDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });
    }
    
    const command = `-ss ${startTime} -t ${endTime - startTime} -i ${videoUri} -c:v mpeg4 -c:a aac -b:v 2M -b:a 128k -strict experimental ${outputPath}`;
    
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    
    if (ReturnCode.isSuccess(returnCode)) {
      console.log('Video successfully trimmed:', outputPath);
      return outputPath;
    } else {
      const failStackTrace = await session.getFailStackTrace();
      console.error('Video trimming error:', failStackTrace);
      throw new Error('Video trimming process failed');
    }
  } catch (error) {
    console.error('Video trimming service error:', error);
    throw error;
  }
};

export const generateThumbnail = async (videoUri: string): Promise<string> => {
  const thumbnailDir = `${FileSystem.documentDirectory}thumbnails/`;
  const thumbnailPath = `${thumbnailDir}${Date.now()}.jpg`;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(thumbnailDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(thumbnailDir, { intermediates: true });
    }
    
    const command = `-i ${videoUri} -ss 0 -vframes 1 ${thumbnailPath}`;
    
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    
    if (ReturnCode.isSuccess(returnCode)) {
      console.log('Thumbnail successfully created:', thumbnailPath);
      return thumbnailPath;
    } else {
      const failStackTrace = await session.getFailStackTrace();
      console.error('Thumbnail creation error:', failStackTrace);
      throw new Error('Thumbnail creation process failed');
    }
  } catch (error) {
    console.error('Thumbnail creation service error:', error);
    throw error;
  }
}; 