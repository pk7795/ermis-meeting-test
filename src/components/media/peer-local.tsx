import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { slice } from 'lodash';
import { useAtom } from 'jotai';
import { useRoom } from '@ermis-media-sdk/rn-react-hooks';
import { Pin, PinOff } from 'lucide-react-native'
// Import local dependencies
import { useDeviceStream } from '../../hooks';
import { peerPinnedAtom } from '../../jotai/peer'; // Update this path if needed


type Props = {
  // No props needed as per original component
}

export const PeerLocal: React.FC<Props> = ({ }) => {
  const streamVideoMain = useDeviceStream('video_main');
  const streamVideoScreen = useDeviceStream('video_screen');
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
  }
  const room = useRoom();
  const [peerPinned, setPeerPinned] = useAtom(peerPinnedAtom);
  const isPinned = peerPinned?.peer === room?.peer;

  // Get stream to display (prioritize screen share)
  const activeStream = streamVideoScreen || streamVideoMain;

  // Get user initials for avatar
  const firstNameInitials = slice(user?.firstName, 0, 1).join('');
  const lastNameInitials = slice(user?.lastName, 0, 1).join('');
  const initials = firstNameInitials + lastNameInitials || 'You';

  const onPin = () => {
    setPeerPinned(isPinned ? null : room);
  };

  return (
    <View style={styles.container}>
      {/* User name badge */}
      <View style={styles.nameBadge}>
        <Text style={styles.nameText}>
          {user?.fullName || 'You'} {streamVideoScreen && '(You, presenting)'}
        </Text>
      </View>

      {/* Pin button */}
      <TouchableOpacity
        onPress={onPin}
        style={[styles.pinButton, isPinned && styles.pinnedButton]}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </TouchableOpacity>

      {/* Video or avatar */}
      {activeStream ? (
        <RTCView
          streamURL={activeStream.toURL()}
          style={[
            styles.videoStream,
            !streamVideoScreen && styles.mirroredVideo
          ]}
          objectFit="cover"
        />
      ) : (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#27272a', // zinc-800
  },
  videoStream: {
    aspectRatio: 16 / 9,
    height: '100%',
    width: '100%',
  },
  mirroredVideo: {
    transform: [{ scaleX: -1 }], // Mirror the video
  },
  nameBadge: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)', // slate-950 with opacity
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nameText: {
    fontSize: 14,
    color: '#fff',
  },
  pinButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pinnedButton: {
    backgroundColor: '#3B82F6', // blue-500
  },
  avatarContainer: {
    aspectRatio: 1,
    width: '33%',
    maxWidth: 160,
    maxHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#71717a', // zinc-500
  },
  avatarText: {
    fontSize: 48,
    color: '#fff',
    textTransform: 'uppercase',
  },
});