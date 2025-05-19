import { AudioMixerMode, SessionConfig } from "@ermis-media-sdk/rn-core";
import { ErmisMediaProvider, useSession } from "@ermis-media-sdk/rn-react-hooks";
import { Text, TouchableOpacity, View } from "react-native";
import { MediaProvider } from "../providers";
import { Meeting } from "./room/Meeting";
import { useState } from "react";
import Setting from "./room/components/Setting";

const HomeScreen = () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDc2MjM1MjksImV4cCI6MTc0NzYzMDcyOSwibmJmIjoxNzQ3NjIzNTI5LCJpc3MiOiJ3ZWJydGMiLCJyb29tIjoiY21hcTk1a3A0MDA2dmR4c2ZjcWZjcWplNiIsInBlZXIiOiJ0ZXN0X3BlZXIiLCJyZWNvcmQiOnRydWUsImV4dHJhX2RhdGEiOiJzdHJpbmcifQ.XFHee5-RI9SXeYrICZ1iQEGPBL45BU_Z87dFYuW6XgU"
    const room = "cmaq95kp4006vdxsfcqfcqje6"
    const peer = "test_peer"
    const gateway = "https://media.ermis.network"
    const cfg = {
        token,
        join: {
            room,
            peer,
            publish: { peer: true, tracks: true },
            subscribe: { peers: true, tracks: true },
            features: {
                mixer: {
                    mode: AudioMixerMode.AUTO,
                    outputs: 3,
                },
            },
        },
    } as SessionConfig
    const [connected, setConnected] = useState(false);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErmisMediaProvider gateway={gateway} cfg={cfg} prepareAudioReceivers={3} prepareVideoReceivers={3}>
                <MediaProvider>
                    {!connected && <Setting onConnect={() => {
                        setConnected(() => true);
                    }} />}
                    {connected && <Meeting />}
                </MediaProvider>
            </ErmisMediaProvider>
        </View>
    )
}
export default HomeScreen;