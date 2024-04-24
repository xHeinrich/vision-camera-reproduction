/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission, useMicrophonePermission,
  VideoFile
} from "react-native-vision-camera";
import VideoPlayer, {VideoRef} from 'react-native-video';
import { useIsForeground } from "./useIsForeground.ts";


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const permissionState = useCameraPermission()
  const micPermissionState = useMicrophonePermission()
  const isActive = useIsForeground()

  if (!permissionState.hasPermission) {
    permissionState.requestPermission()
  }
  if (!micPermissionState.hasPermission) {
    micPermissionState.requestPermission()
  }

  const camera = useRef<Camera>(null)

  let device = useCameraDevice('back', {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera'
    ]
  })


  const [targetFps, setTargetFps] = useState(30)

  const [status, setState] = useState('idle')
  const [video, setVideo] = useState<string | null>(null)

  let filters = [
    {fps: targetFps},
    {videoStabilizationMode: 'auto'},
    {
      videoResolution: {
        width: 1280,
        height: 720
      },
    },
    {
      photoResolution: {
        width: 1280,
        height: 720
      },
    }
  ];

  const format = useCameraFormat(device, filters)
  const [torchOn, setTorchOn] = useState('off')
  const onError = useCallback((error: any) => {
      console.error(error)
    }, [])



  const startRecording = () => {

    setState('recording')
    camera.current.startRecording({
      flash: 'on',
      fileType: "mp4",
      videoCodec: "h264",
      videoBitRate: 5, // 5mbps as target, affected by target fps
      onRecordingFinished: (video: VideoFile) => {
        setState('finished')
        setVideo(video.path)
      },
      onRecordingError: (error) => console.error(error)
    })

    setTimeout(() => {
      setState('paused')
      camera.current.pauseRecording()
    }, 3000);

    setTimeout(() => {
      setState('resumed')
      camera.current.resumeRecording()
    }, 6000);

    setTimeout(() => {
      camera.current.stopRecording()
    }, 9000)
  }



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <TouchableOpacity
        onPress={() => startRecording()}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1,
          flex: 1,
          backgroundColor: 'red',
          minWidth: 50,
          minHeight: 50
      }}>
        <Text>Record: {status}</Text>
      </TouchableOpacity>

      {
        isActive && status === 'finished' && video && (
          <VideoPlayer
            style={[StyleSheet.absoluteFill]}
            source={{
              uri: video
            }}
          />
        )
      }
      {
        isActive && status !== 'finished' && (
          <Camera device={device}
                  zoom={device.neutralZoom}
                  ref={camera}
                  format={format}
                  enableZoomGesture={true}
                  exposure={0}
                  style={[StyleSheet.absoluteFill]}
                  isActive={isActive}
                  torch={torchOn}
                  orientation={'portrait'}
                  audio={micPermissionState.hasPermission}
                  photo={permissionState.hasPermission}
                  video={permissionState.hasPermission}
                  onError={onError}
          />
        )
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
