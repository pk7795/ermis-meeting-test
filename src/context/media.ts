import { EventEmitter } from '@ermis-media-sdk/rn-core'
import { createContext } from 'react'
import {
  MediaStream,
  mediaDevices,
  ScreenCapturePickerView
} from 'react-native-webrtc'
import { Constraints } from 'react-native-webrtc/lib/typescript/getUserMedia'

export enum ContextEvent {
  DeviceChanged = 'device.changed.',
}

export class Context extends EventEmitter {
  streams: Map<string, MediaStream> = new Map()
  streams_history: Map<string, string> = new Map()

  async requestDevice(source_name: string, kind: 'audio' | 'video' | 'screen', deviceId?: string): Promise<MediaStream> {
    const old_stream = this.streams.get(source_name)
    if (old_stream) {
      old_stream.getTracks().map((t) => t.stop())
      this.streams.delete(source_name)
      this.emit(ContextEvent.DeviceChanged + source_name, null)
    }

    const deviceId2 = deviceId || this.streams_history.get(source_name)
    console.warn('request device', source_name, kind, deviceId, deviceId2)

    switch (kind) {
      case 'audio': {
        const constraints: Constraints = {
          audio: deviceId2 ? { deviceId: deviceId2 } : true,
          video: false
        }
        const stream = await mediaDevices.getUserMedia(constraints)
        this.streams.set(source_name, stream)
        break
      }
      case 'video': {
        const constraints: Constraints = {
          video: deviceId2 ? { deviceId: deviceId2 } : true,
          audio: false
        }
        const stream = await mediaDevices.getUserMedia(constraints)
        this.streams.set(source_name, stream)
        break
      }
      case 'screen': {
        try {
          // Screen sharing in React Native requires special handling
          // This is platform-specific, may need additional setup depending on iOS/Android
          const stream = await mediaDevices.getDisplayMedia()
          this.streams.set(source_name, stream)
        } catch (error) {
          console.error('Screen capture error:', error)
          throw new Error('Screen sharing is not supported or permission denied')
        }
        break
      }
    }

    if (deviceId2) {
      this.streams_history.set(source_name, deviceId2)
    }

    const stream = this.streams.get(source_name)!
    this.emit(ContextEvent.DeviceChanged + source_name, stream)
    return stream
  }

  turnOffDevice(source_name: string) {
    const old_stream = this.streams.get(source_name)
    if (old_stream) {
      old_stream.getTracks().map((t) => t.stop())
      this.streams.delete(source_name)
      this.emit(ContextEvent.DeviceChanged + source_name, null)
    }
  }
}

export const MediaContext = createContext<Context>({} as any)