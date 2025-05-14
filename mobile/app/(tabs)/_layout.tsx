import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import TabsLayout from "../../layout/TabsLayout"; // Moved tabs logic to a separate file

// export default function RootLayout() {
// 	return (
// 		<AuthProvider>
// 			<SafeAreaProvider>
// 				<TabsLayout />
// 			</SafeAreaProvider>
// 		</AuthProvider>
// 	);
// }
export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<TabsLayout />
		</SafeAreaProvider>
	);
}
