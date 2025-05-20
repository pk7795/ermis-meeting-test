import { AudioMixerMode, SessionConfig } from "@ermis-media-sdk/rn-core";
import { ErmisMediaProvider, useSession } from "@ermis-media-sdk/rn-react-hooks";
import { Text, TouchableOpacity, View } from "react-native";
import { MediaProvider } from "../providers";
import { Meeting } from "./room/Meeting";
import { useEffect, useState } from "react";
import Setting from "./room/components/Setting";
import { generateToken } from "../utils/ermis";

const HomeScreen = () => {
    const room = "8dtl15ds"
    const peer = "test_peer"
    const gateway = "https://media-dev.ermis.network"

    const [isLoading, setIsLoading] = useState(true);
    const [cfg, setCfg] = useState({
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDc3MzI1NzYsImV4cCI6MTc0NzczOTc3NiwibmJmIjoxNzQ3NzMyNTc2LCJpc3MiOiJ3ZWJydGMiLCJyb29tIjoiOGR0bDE1ZHMiLCJwZWVyIjoidGVzdF9wZWVyIiwicmVjb3JkIjpmYWxzZSwiZXh0cmFfZGF0YSI6bnVsbH0.oT_iltzZoLGLdVU-U5a4o7dGXgVJlBY7mL1gzkGpoKA",
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

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await generateToken(room, peer, gateway, "insecure");
                setCfg(prevCfg => ({
                    ...prevCfg,
                    token: token,
                }));
                console.log("Token fetched:", token);
            } catch (error) {
                console.error("Error fetching token:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchToken();
    }, []);

    // Loading state while waiting for token
    if (isLoading || cfg.token.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }
    // Only render the main content after token is available
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErmisMediaProvider gateway={gateway} cfg={cfg} prepareAudioReceivers={3} prepareVideoReceivers={3}>
                <MediaProvider>
                    {!connected && <Setting onConnect={() => {
                        setConnected(true);
                    }} />}
                    {connected && <Meeting />}
                </MediaProvider>
            </ErmisMediaProvider>
        </View>
    )
}
export default HomeScreen;