import { useMixer } from '@ermis-media-sdk/rn-react-hooks';
import { useEffect } from 'react';
import { View } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';

export const AudioMixerPlayer = () => {
    const mixer = useMixer();

    useEffect(() => {
        if (mixer) {
            // Get streams from mixer
            const streams = mixer.streams();

            // Process each stream
            streams.forEach((stream, index) => {
                if (stream) {
                    // Configure audio stream 
                    configureAudioStream(stream, index);
                }
            });

            // Cleanup function
            return () => {
                streams.forEach((stream) => {
                    if (stream) {
                        releaseAudioStream(stream);
                    }
                });
            };
        }
    }, [mixer]);

    const configureAudioStream = (stream: MediaStream, index: number) => {
        // Enable audio play without requiring user interaction
        const audioTracks = stream.getAudioTracks();

        if (audioTracks.length > 0) {
            // Configure audio track for playback through device speakers
            console.log(`Configuring audio track ${index}:`, audioTracks[0].id);

            // In a real implementation, you might use the RTCAudioSession to configure
            // audio routing and playback settings
        }
    };

    const releaseAudioStream = (stream: MediaStream) => {
        const audioTracks = stream.getAudioTracks();

        audioTracks.forEach(track => {
            track.stop();
        });
    };

    // In React Native, audio streams don't need visual components for playback
    // The audio will be routed through the device's audio system
    return <View />;
};