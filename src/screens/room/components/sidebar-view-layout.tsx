import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { isEmpty, map, size } from 'lodash';
import { ChevronDown, ChevronUp, UsersRound } from 'lucide-react-native';
type Props = {
  renderItem?: (item: React.ReactNode) => React.ReactNode;
  remotePeerScreens: React.ReactNode[];
  mainPeerScreen?: React.ReactNode;
  showButtonExpand?: boolean;
}

export const SidebarViewLayout: React.FC<Props> = ({
  renderItem,
  remotePeerScreens,
  mainPeerScreen,
  showButtonExpand
}) => {
  const [isExpand, setIsExpand] = useState(true);
  const animatedHeight = useState(new Animated.Value(140))[0];

  React.useEffect(() => {
    Animated.timing(
      animatedHeight,
      {
        toValue: isExpand ? 140 : 0,
        duration: 300,
        useNativeDriver: false
      }
    ).start();
  }, [isExpand]);

  if (isEmpty(remotePeerScreens)) {
    return (
      <View style={styles.mainContainer}>
        {renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main video container */}
      <View style={styles.mainVideoContainer}>
        {renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}
      </View>

      {/* Bottom row with video thumbnails */}
      <Animated.View style={[styles.thumbnailsContainer, { height: animatedHeight }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {map(remotePeerScreens, (peer, index) => (
            <View key={index} style={styles.peerContainer}>
              {renderItem?.(peer || <></>) || peer}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Expand/collapse button */}
      {showButtonExpand && size(remotePeerScreens) >= 1 && (
        <TouchableOpacity
          style={[
            styles.expandButton,
            isExpand ? styles.expandButtonBottom : styles.expandButtonTop
          ]}
          onPress={() => setIsExpand((prev) => !prev)}
        >
          {isExpand ? <ChevronDown /> : <ChevronUp />}
          <UsersRound />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    maxHeight: '100%',
  },
  mainVideoContainer: {
    flex: 1,
    width: '100%',
  },
  thumbnailsContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollViewContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 16,
  },
  peerContainer: {
    height: 140,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    aspectRatio: 16 / 9,
  },
  expandButton: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  expandButtonBottom: {
    bottom: 150,
  },
  expandButtonTop: {
    bottom: 0,
  },
  usersIcon: {
    marginLeft: 4,
  }
});