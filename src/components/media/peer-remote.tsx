import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import { find, isEmpty } from 'lodash';
import { RemotePeer, RemoteTrack, useRemoteVideoTracks } from '@ermis-media-sdk/rn-react-hooks';
import { Pin, PinOff } from 'lucide-react-native'
// Import local components and hooks
import { VideoRemote } from './video-remote'; // Update path as needed
import { useAudioMixerSpeaking } from '../../hooks/use-audio-mixer-speaking'; // Update path as needed
import { peerPinnedAtom } from '../../jotai/peer'; // Update path as needed

type Props = {
  peer: RemotePeer
}

export const PeerRemote: React.FC<Props> = ({ peer }) => {
  const remote_videos = useRemoteVideoTracks(peer.peer);
  const { speaking } = useAudioMixerSpeaking(peer.peer);
  const video_main = find(remote_videos, (t) => t.track === 'video_main');
  const video_screen = find(remote_videos, (t) => t.track === 'video_screen');
  const [peerPinned, setPeerPinned] = useAtom(peerPinnedAtom);
  const isPinned = peerPinned?.peer === peer?.peer;

  const onPin = () => {
    setPeerPinned(isPinned ? null : peer);
  };

  return (
    <View style={[
      styles.container,
      speaking && styles.speakingContainer
    ]}>
      {/* Pin button */}
      <TouchableOpacity
        onPress={onPin}
        style={[
          styles.pinButton,
          isPinned && styles.pinnedButton
        ]}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </TouchableOpacity>

      {/* Peer name */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
          {peer.peer}
        </Text>
      </View>

      {/* Video or avatar */}
      {!isEmpty(remote_videos) ? (
        <>
          {video_screen ? (
            <VideoRemote
              key={video_screen?.track}
              track={video_screen as RemoteTrack}
              mirror={false}
            />
          ) : (
            <VideoRemote
              key={video_main?.track}
              track={video_main as RemoteTrack}
              mirror={true}
            />
          )}
        </>
      ) : (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {peer.peer?.[0]?.toUpperCase()}
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
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#27272a', // zinc-800
  },
  speakingContainer: {
    borderWidth: 4,
    borderColor: 'rgba(34, 197, 94, 0.7)', // green-500 with opacity
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
  nameContainer: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)', // slate-950 with opacity
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nameText: {
    fontSize: 14,
    color: '#fff',
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
  }
});