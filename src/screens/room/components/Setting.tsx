import { useSession } from "@ermis-media-sdk/rn-react-hooks";
import { Text, TouchableOpacity } from "react-native"
type Props = {
    onConnect: () => void;
};
const Setting: React.FC<Props> = ({ onConnect }) => {
    const session = useSession();
    const onConnectSession = () => {
        session.connect().then(() => {
            console.log("Connected to the session");
            onConnect();
        }).catch((error) => {
            console.error("Error connecting to the session:", error);
        })
    }
    return (
        <TouchableOpacity onPress={onConnectSession} style={{ padding: 20, backgroundColor: 'blue', borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Connect</Text>
        </TouchableOpacity>
    )
}
export default Setting;