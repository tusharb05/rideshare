import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
	const { isAuthenticated } = useAuth();

	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Upcoming Rides",
					tabBarIcon: ({ color, size }: any) => (
						<Ionicons name="car" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="my-rides"
				options={{
					title: "My Rides",
					tabBarIcon: ({ color, size }: any) => (
						<Ionicons name="clipboard" color={color} size={size} />
					),
					href: isAuthenticated ? "/my-rides" : null,
				}}
			/>
			<Tabs.Screen
				name="requests"
				options={{
					title: "Requests",
					tabBarIcon: ({ color, size }: any) => (
						<Ionicons name="list" color={color} size={size} />
					),
					href: isAuthenticated ? "/requests" : null,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }: any) => (
						<Ionicons name="person" color={color} size={size} />
					),
					href: isAuthenticated ? "/profile" : null,
				}}
			/>
			<Tabs.Screen
				name="auth"
				options={{
					title: "Sign In",
					tabBarIcon: ({ color, size }: any) => (
						<Ionicons name="log-in" color={color} size={size} />
					),
					href: !isAuthenticated ? "/auth" : null,
				}}
			/>
		</Tabs>
	);
}
