import { useCallback, useContext, useEffect } from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Kind } from '@ermis-media-sdk/rn-core'
import { usePublisher } from '@ermis-media-sdk/rn-react-hooks'
import { ScreenShareIcon, ScreenShareOffIcon } from 'lucide-react-native'
// Fix imports to use relative paths
import { MediaContext } from '../../context/media'
import { useDeviceStream } from '../../hooks'

type ScreenToggleProps = {
  sourceName: string
}

export const ScreenToggle: React.FC<ScreenToggleProps> = ({ sourceName }) => {
  const publisher = usePublisher(sourceName, Kind.VIDEO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream(sourceName)

  useEffect(() => {
    const track = stream?.getVideoTracks()[0]
    if (track && !publisher.attached) {
      publisher.attach(track)
    } else if (!track && publisher.attached) {
      publisher.detach()
    }
  }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(sourceName)
    } else {
      ctx.requestDevice(sourceName, 'screen')
        .then(() => console.log('Screen sharing enabled'))
        .catch(err => console.error('Screen sharing error:', err))
    }
  }, [ctx, sourceName, stream])

  return (
    <TouchableOpacity
      style={[
        styles.button,
        stream ? styles.activeButton : styles.inactiveButton
      ]}
      onPress={onToggle}
    >
      {!stream ? <ScreenShareIcon size={16} /> : <ScreenShareOffIcon size={16} />}
    </TouchableOpacity>
  )
}

export const ScreenToggleV2: React.FC<ScreenToggleProps> = ({ }) => {
  const publisher = usePublisher('video_screen', Kind.VIDEO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream('video_screen')

  // Handle track ended event
  useEffect(() => {
    if (stream) {
      const track = stream.getVideoTracks()[0]
      if (track) {
        // Need to handle the 'ended' event differently in React Native
        // This is platform-specific and may require additional implementation
        const listener = () => {
          ctx.turnOffDevice('video_screen')
        }

        // Add event listener if supported
        if ((track as any).addEventListener) {
          (track as any).addEventListener('ended', listener)
          return () => {
            (track as any).removeEventListener('ended', listener)
          }
        }
      }
    }
  }, [ctx, stream])

  useEffect(() => {
    const track = stream?.getVideoTracks()?.[0]
    if (track && !publisher.attached) {
      publisher.attach(track)
    } else if (!track && publisher.attached) {
      publisher.detach()
    }
  }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice('video_screen')
    } else {
      ctx.requestDevice('video_screen', 'screen')
        .then(() => console.log('Screen sharing enabled'))
        .catch(err => console.error('Screen sharing error:', err))
    }
  }, [ctx, stream])

  return (
    <TouchableOpacity
      style={[styles.fullButton, stream ? styles.activeFullButton : styles.inactiveFullButton]}
      onPress={onToggle}
    >
      <View style={styles.buttonContent}>
        {!stream ? <ScreenShareIcon size={16} /> : <ScreenShareOffIcon size={16} />}
        <Text style={stream ? styles.activeText : styles.inactiveText}>
          {stream ? "Stop Sharing" : "Share Screen"}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#3B82F6', // blue
  },
  inactiveButton: {
    backgroundColor: '#E5E7EB', // gray-200
  },
  fullButton: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  activeFullButton: {
    backgroundColor: '#3B82F6', // blue
  },
  inactiveFullButton: {
    backgroundColor: '#F3F4F6', // gray-100
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inactiveText: {
    marginLeft: 8,
    color: '#4B5563', // gray-600
    fontWeight: '500',
  }
})