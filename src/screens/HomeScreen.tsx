import { AudioMixerMode, SessionConfig } from "@ermis-media-sdk/rn-core";
import { ErmisMediaProvider, useSession } from "@ermis-media-sdk/rn-react-hooks";
import { Text, TouchableOpacity, View } from "react-native";
import { MediaProvider } from "../providers";
import { Meeting } from "./room/Meeting";
import { useEffect, useState } from "react";
import Setting from "./room/components/Setting";
import { generateToken } from "../utils/ermis";
import { env } from "process";

const HomeScreen = () => {
    const room = "8dtl15vs"
    const peer = "test_peer_2"
    const gateway = "https://media-dev.ermis.network"
    // const token = await generateToken(room, peer, gateway, "insecure");
    const [token, setToken] = useState("");
    useEffect(() => {
        const fetchToken = async () => {
            const token = await generateToken(room, peer, gateway, "insecure");
            setToken(token);
            setCfg((prev) => ({
                ...prev,
                token: token,
            }));
            console.log("Token fetched:", token);
        };
        fetchToken();
    }
        , []);
    const [cfg, setCfg] = useState({
        token: "",
        join: {
            room: room,
            peer: peer,
            publish: { peer: true, tracks: true },
            subscribe: { peers: true, tracks: true },
            features: {
                mixer: {
                    mode: AudioMixerMode.AUTO,
                    outputs: 3,
                },
            },
        },
    } as SessionConfig);
    const [connected, setConnected] = useState(false);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {token != "" && <ErmisMediaProvider gateway={gateway} cfg={cfg} prepareAudioReceivers={3} prepareVideoReceivers={3}>
                <MediaProvider>
                    {!connected && <Setting onConnect={() => {
                        setConnected(() => true);
                    }} />}
                    {connected && <Meeting />}
                </MediaProvider>
            </ErmisMediaProvider>}
        </View>
    )
}
export default HomeScreen;