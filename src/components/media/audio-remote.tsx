import { RemoteTrack, useConsumer } from '@ermis-media-sdk/rn-react-hooks'
import { useEffect } from 'react'
import { View } from 'react-native'

type Props = {
  track: RemoteTrack
}

export const AudioRemote: React.FC<Props> = ({ track }) => {
  const consumer = useConsumer(track)

  useEffect(() => {
    // Attach consumer with priority settings
    consumer.attach({
      priority: 10,
      maxSpatial: 2,
      maxTemporal: 2,
    })

    // Clean up when component unmounts
    return () => {
      consumer.detach()
    }
  }, [consumer])

  // No visible UI needed for audio playback in React Native
  return <View />
}