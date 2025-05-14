"use client";

import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Platform,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/axios";
import { GET_UPCOMING_RIDES_URL } from "@/lib/urls";
import RideCard from "@/components/custom/RideCard";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

export default function UpcomingRides() {
	const [rides, setRides] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { isAuthenticated } = useAuth();

	const fetchUpcomingRides = async () => {
		setLoading(true);
		try {
			let headers = {};

			if (isAuthenticated) {
				const user: any = JSON.parse(
					(await AsyncStorage.getItem("user")) || ""
				);
				if (user && user.access) {
					headers = { Authorization: `Bearer ${user.access}` };
				}
			}

			const response = await api.get(GET_UPCOMING_RIDES_URL, { headers });
			console.log(response.data);
			setRides(response.data);
		} catch (error: any) {
			console.error("Error fetching upcoming rides:", error);
			console.log(error.message);
			console.log(error.config);
			console.log(error.request);
			console.log(error.response);
		}
		setLoading(false);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchUpcomingRides();
		setRefreshing(false);
	};

	useEffect(() => {
		console.log("useeffect ran");
		fetchUpcomingRides();
	}, [isAuthenticated]); // Re-fetch when authentication status changes

	const router = useRouter();

	const handleRidePress = (id: number) => {
		router.push(`/ride/${id}`);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Upcoming Rides</Text>

			{loading && !refreshing ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color="#4b7bec" />
				</View>
			) : rides.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Ionicons name="time-outline" size={60} color="#ccc" />
					<Text style={styles.emptyText}>No upcoming rides</Text>
					<Text style={styles.emptySubtext}>
						{isAuthenticated
							? "You haven't joined or created any upcoming rides yet."
							: "There are no upcoming rides available right now."}
					</Text>
				</View>
			) : (
				<FlatList
					data={rides}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={() => handleRidePress(item.id)}>
							<RideCard item={item} />
						</TouchableOpacity>
					)}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={["#4b7bec"]}
						/>
					}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
		paddingTop: Platform.OS === "android" ? 40 : 0,
		paddingHorizontal: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 20,
		marginTop: 10,
	},
	listContainer: {
		paddingBottom: 100,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 100,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#666",
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#999",
		marginTop: 8,
	},
});
