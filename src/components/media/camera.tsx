import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { mediaDevices } from 'react-native-webrtc';
import { RTCView } from 'react-native-webrtc';
import { filter, map } from 'lodash';
import { BitrateControlMode, Kind } from '@ermis-media-sdk/rn-core';
import { usePublisher } from '@ermis-media-sdk/rn-react-hooks';
// Import context and hooks
import { MediaContext } from '../../context/media';
import { useDeviceStream } from '../../hooks';


import { Dropdown } from 'react-native-element-dropdown';
import { ChevronUp, ChevronDown, VideoIcon, VideoOffIcon } from 'lucide-react-native';

type CameraPreviewProps = {
  sourceName: string;
};

export const CameraPreview: React.FC<CameraPreviewProps> = ({ sourceName }) => {
  const stream = useDeviceStream(sourceName);

  return (
    <View style={styles.previewContainer}>
      {stream ? (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.rtcView}
          objectFit="cover"
          mirror={true}
        />
      ) : (
        <View style={styles.emptyPreview} />
      )}
    </View>
  );
};

type CameraSelectionProps = {
  sourceName: string;
  isFirstPage?: boolean;
};

const PUBLISHER_CONFIG = {
  simulcast: true,
  priority: 1,
  bitrate: BitrateControlMode.DYNAMIC_CONSUMERS,
};

export const CameraSelection: React.FC<CameraSelectionProps> = ({ sourceName }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const ctx = useContext(MediaContext);

  useEffect(() => {
    const init = async () => {
      try {
        const devices = await mediaDevices.enumerateDevices();
        const videoDevices = map(
          filter(devices as any, (d) => d.kind === 'videoinput').map((d) => ({
            id: d.deviceId,
            label: d.label || `Camera ${d.deviceId.substring(0, 5)}...`,
          })));

        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].id);
        }
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
      }
    };

    init();
  }, [ctx, sourceName]);

  const onChange = useCallback(
    (value: string) => {
      ctx
        .requestDevice(sourceName, 'video', value)
        .then(() => {
          setSelectedDevice(value);
        })
        .catch(console.error);
    },
    [ctx, sourceName]
  );

  return (
    <Dropdown
      style={{ width: 300 }}
      data={devices}
      labelField="label"
      valueField="id"
      value={selectedDevice}
      onChange={onChange}
      renderLeftIcon={() => <VideoIcon size={16} />}
      renderRightIcon={() => <ChevronDown size={16} />}
      placeholder="Select Camera"
      placeholderStyle={{ color: '#999' }}
      selectedTextStyle={{ color: '#000' }}
      containerStyle={{ backgroundColor: '#fff', borderRadius: 8 }}
      itemTextStyle={{ color: '#000' }}
      showsVerticalScrollIndicator={false}
      maxHeight={200}
    />
  );
};

export const CameraToggle: React.FC<CameraSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.VIDEO, PUBLISHER_CONFIG);
  const ctx = useContext(MediaContext);
  const stream = useDeviceStream(sourceName);

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'video');
      }
    };

    init();
  }, [ctx, sourceName, isFirstPage]);

  useEffect(() => {
    const videoTracks = stream?.getVideoTracks() || [];
    const track = videoTracks[0];

    if (track && !publisher.attached) {
      publisher.attach(track);
    } else if (!track && publisher.attached) {
      publisher.detach();
    }
  }, [publisher, stream]);

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(sourceName);
    } else {
      ctx.requestDevice(sourceName, 'video')
        .then(() => console.log('Camera enabled'))
        .catch(err => console.error('Failed to enable camera:', err));
    }
  }, [ctx, sourceName, stream]);

  return (
    <TouchableOpacity
      style={[styles.iconButton, stream ? styles.activeButton : styles.inactiveButton]}
      onPress={onToggle}
    >
      {stream ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
    </TouchableOpacity>
  );
};

export const CameraToggleV2: React.FC<CameraSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.VIDEO, PUBLISHER_CONFIG);
  const ctx = useContext(MediaContext);
  const stream = useDeviceStream(sourceName);
  const [isOpenSetting, setIsOpenSetting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'video');
      }
    };

    init();
  }, [ctx, sourceName, isFirstPage]);

  useEffect(() => {
    const videoTracks = stream?.getVideoTracks() || [];
    const track = videoTracks[0];

    if (track && !publisher.attached) {
      publisher.attach(track);
    } else if (!track && publisher.attached) {
      publisher.detach();
    }
  }, [publisher, stream]);

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(sourceName);
    } else {
      ctx.requestDevice(sourceName, 'video')
        .then(() => console.log('Camera enabled'))
        .catch(err => console.error('Failed to enable camera:', err));
    }
  }, [ctx, sourceName, stream]);

  return (
    <View style={styles.controlContainer}>
      <TouchableOpacity
        style={styles.settingButton}
        onPress={() => setIsOpenSetting(!isOpenSetting)}
      >
        {!isOpenSetting ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </TouchableOpacity>

      {isOpenSetting && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Camera Settings</Text>
          <CameraSelection sourceName="video_main" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.iconButton, stream ? styles.activeButton : styles.inactiveButton]}
        onPress={onToggle}
      >
        {stream ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  rtcView: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyPreview: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    height: 250,
    width: '100%',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4B5563',
  },
  inactiveButton: {
    backgroundColor: '#EF4444',
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 231, 235, 0.9)',
    borderRadius: 8,
  },
  settingButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsPanel: {
    position: 'absolute',
    top: -140,
    left: 0,
    width: 300,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  }
});