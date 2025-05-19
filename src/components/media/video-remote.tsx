import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import { RemoteTrack, useConsumer } from '@ermis-media-sdk/rn-react-hooks'

type Props = {
  track: RemoteTrack
  mirror?: boolean
}

export const VideoRemote: React.FC<Props> = ({ track, mirror = true }) => {
  const consumer = useConsumer(track)

  useEffect(() => {
    // Attach consumer with settings
    consumer.attach({
      priority: 10,
      maxSpatial: 2,
      maxTemporal: 2,
    })

    // Cleanup when component unmounts
    return () => {
      consumer.detach()
    }
  }, [consumer])

  // If there's no stream yet, show empty view
  if (!consumer.stream) {
    return <View style={styles.emptyContainer} />
  }

  return (
    <RTCView
      streamURL={(consumer.stream as any).toURL()}
      style={[
        styles.videoStream,
        mirror && styles.mirroredVideo
      ]}
      objectFit="cover"
    />
  )
}

const styles = StyleSheet.create({
  videoStream: {
    flex: 1,
    width: '100%',
    height: '100%',
    aspectRatio: 16 / 9,
  },
  mirroredVideo: {
    transform: [{ scaleX: -1 }] // This mirrors the video horizontally
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  }
})