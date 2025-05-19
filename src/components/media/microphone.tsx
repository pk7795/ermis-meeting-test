import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { mediaDevices } from 'react-native-webrtc';
import { filter, map } from 'lodash';
import { BitrateControlMode, Kind } from '@ermis-media-sdk/rn-core';
import { usePublisher } from '@ermis-media-sdk/rn-react-hooks';
import { ChevronDown, ChevronUp, MicIcon, MicOffIcon } from 'lucide-react-native'
// Import React Native Vector Icons

// Import context and hooks
import { MediaContext } from '../../context/media';
import { useDeviceStream } from '../../hooks';

// Import dropdown component
import { Dropdown } from 'react-native-element-dropdown';

type MicrophonePreviewProps = {
  sourceName: string;
};

export const MicrophonePreview: React.FC<MicrophonePreviewProps> = ({ sourceName }) => {
  const stream = useDeviceStream(sourceName);

  // In React Native, audio preview is handled differently
  // Audio plays through device speakers by default
  useEffect(() => {
    if (stream) {
      // Configure audio for playback
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        console.log('Audio track connected:', audioTracks[0].id);
        // The track will automatically play through device audio system
      }
    }
  }, [stream]);

  // Return an empty view as there's no visual component needed for audio
  return <View />;
};

type MicrophoneSelectionProps = {
  sourceName: string;
  isFirstPage?: boolean;
};

export const MicrophoneSelection: React.FC<MicrophoneSelectionProps> = ({ sourceName }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const ctx = useContext(MediaContext);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const allDevices = await mediaDevices.enumerateDevices();
        const audioDevices = map(
          filter(allDevices as any, (d: any) => d.kind === 'audioinput').map((d: any) => ({
            id: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.substring(0, 5)}...`,
          })));

        setDevices(audioDevices);
        if (audioDevices.length > 0) {
          setSelectedDevice(audioDevices[0].id);
        }
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
      }
    };

    init();
  }, [ctx, sourceName]);

  const onChange = useCallback(
    (item: any) => {
      ctx
        .requestDevice(sourceName, 'audio', item.value)
        .then(() => {
          setSelectedDevice(item.value);
        })
        .catch(console.error);
    },
    [ctx, sourceName]
  );

  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: '#007AFF' }]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={devices.map(device => ({
        label: device.label,
        value: device.id
      }))}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={!isFocus ? 'Select microphone' : '...'}
      searchPlaceholder="Search..."
      value={selectedDevice}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={onChange}
    />
  );
};

export const MicrophoneToggle: React.FC<MicrophoneSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.AUDIO);
  const ctx = useContext(MediaContext);
  const stream = useDeviceStream(sourceName);

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'audio');
      }
    };

    init();
  }, [ctx, sourceName, isFirstPage]);

  useEffect(() => {
    const audioTracks = stream?.getAudioTracks() || [];
    const track = audioTracks[0];

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
      ctx.requestDevice(sourceName, 'audio')
        .then(() => console.log('Microphone enabled'))
        .catch(err => console.error('Failed to enable microphone:', err));
    }
  }, [ctx, sourceName, stream]);

  return (
    <TouchableOpacity
      style={[styles.iconButton, stream ? styles.activeButton : styles.inactiveButton]}
      onPress={onToggle}
    >
      {stream ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
    </TouchableOpacity>
  );
};

export const MicrophoneToggleV2: React.FC<MicrophoneSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.AUDIO);
  const ctx = useContext(MediaContext);
  const stream = useDeviceStream(sourceName);
  const [isOpenSetting, setIsOpenSetting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'audio');
      }
    };

    init();
  }, [ctx, sourceName, isFirstPage]);

  useEffect(() => {
    const audioTracks = stream?.getAudioTracks() || [];
    const track = audioTracks[0];

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
      ctx.requestDevice(sourceName, 'audio')
        .then(() => console.log('Microphone enabled'))
        .catch(err => console.error('Failed to enable microphone:', err));
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
          <Text style={styles.settingsTitle}>Microphone Settings</Text>
          <MicrophoneSelection sourceName="audio_main" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.iconButton, stream ? styles.activeButton : styles.inactiveButton]}
        onPress={onToggle}
      >
        {stream ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  dropdown: {
    height: 50,
    borderColor: '#c7c7c7',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderRadius: 4,
  },
});