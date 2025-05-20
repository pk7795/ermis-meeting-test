import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Clipboard,
  Dimensions,
  StatusBar,
  Platform,
  ToastAndroid,
  Alert
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import { filter, find, map } from 'lodash';
import { useRemotePeers, useRoom } from '@ermis-media-sdk/rn-react-hooks';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import local components
import { AudioMixerPlayer } from '../../components/media/audio-mixer';
import { PeerLocal } from '../../components/media/peer-local';
import { PeerRemote } from '../../components/media/peer-remote';
import { peerPinnedAtom } from '../../jotai/peer';
import { RoomStore } from '../../stores/room';
import { GridViewLayout, SidebarViewLayout } from './components';
import { CameraToggleV2, MicrophoneToggleV2 } from '../../components/media';

type Props = {

};

export const Meeting: React.FC<Props> = ({ }) => {
  const navigation = useNavigation();
  const room = useRoom();
  const remotePeers = useRemotePeers();
  const [isCreateNewRoom, setIsCreateNewRoom] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lastTap, setLastTap] = useState(0);
  const addListUserToRoom = useSetAtom(RoomStore.addListUserToRoom);

  const roomCode = "test_room"; // Replace with actual room code
  const peerPinned = useAtomValue(peerPinnedAtom);

  const checkPeerPinned = useMemo(() => {
    if (peerPinned?.peer === room?.peer) return { check: true, peer: 'local', peerItem: room };
    const findRemotePeer = find(remotePeers, (peer) => peer.peer === peerPinned?.peer);
    return findRemotePeer
      ? { check: true, peer: 'remote', peerItem: findRemotePeer }
      : { check: false, peer: null, peerItem: null };
  }, [peerPinned?.peer, room, remotePeers]);

  const peerLocal = useMemo(() => <PeerLocal />, []);

  const mainPeerScreen = useMemo(() => {
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peer: any = checkPeerPinned.peerItem;
      return <PeerRemote peer={peer} />;
    }
    return peerLocal;
  }, [checkPeerPinned, peerLocal]);

  const filterRemotePeers = useMemo(
    () => filter(remotePeers, (p) => p.peer != room?.peer),
    [remotePeers, room?.peer]
  );

  const peerRemoteMixerAudio = useMemo(() => {
    let mapRemotePeers = [];
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peerRemote: any = filter(filterRemotePeers, (p) => p.peer != checkPeerPinned?.peerItem?.peer);
      const peerRemoteScreen = map(peerRemote, (p) => <PeerRemote key={p.peer} peer={p} />);
      mapRemotePeers = [peerLocal, ...peerRemoteScreen];
    } else {
      mapRemotePeers = map(filterRemotePeers, (p) => <PeerRemote key={p.peer} peer={p} />);
    }
    return mapRemotePeers;
  }, [checkPeerPinned.check, checkPeerPinned.peer, checkPeerPinned?.peerItem?.peer, filterRemotePeers, peerLocal]);

  // Add users to room store
  useEffect(() => {
    addListUserToRoom({
      users: [
        {
          gmail: 'current@example.com',
          name: 'Current User',
          avatar: '',
        },
        ...map(remotePeers, (item) => ({ gmail: item.peer, name: item.peer, avatar: '' })),
      ],
      roomCode: roomCode,
    });

    return () => {
      addListUserToRoom({
        users: [],
        roomCode: roomCode,
      });
    };
  }, [addListUserToRoom, roomCode, remotePeers]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <GridViewLayout items={[mainPeerScreen, ...(peerRemoteMixerAudio || [])]} />
        <AudioMixerPlayer />
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MicrophoneToggleV2 sourceName={'audio_main'} />
          <CameraToggleV2 sourceName={'video_main'} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b', // Dark background
  },
  touchArea: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 60,
  },
  newRoomNotification: {
    position: 'absolute',
    bottom: 90,
    left: 8,
    width: Dimensions.get('window').width - 16,
    maxWidth: 360,
    backgroundColor: '#f4f4f5', // muted background
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  closeButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  notificationText: {
    fontSize: 12,
    color: '#71717a', // muted foreground
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#e4e4e7', // zinc-200
    borderRadius: 4,
    paddingLeft: 12,
    paddingRight: 4,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  copyButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});