"use client";

import { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
	FlatList,
	ActivityIndicator,
	Dimensions,
	Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CreateRideModal from "@/components/custom/CreateRideModal";
import api from "@/lib/axios";
import { CREATE_RIDE_URL, GET_USER_RIDES_URL } from "@/lib/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RideCard from "@/components/custom/RideCard";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const MyRidesScreen = () => {
	const [modalVisible, setModalVisible] = useState(false);
	const [createdRides, setCreatedRides] = useState<any[]>([]);
	const [acceptedRides, setAcceptedRides] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState(0); // 0 for Created Rides, 1 for Accepted Rides
	const router = useRouter();

	// Animation for tab indicator
	const tabIndicatorPosition = useState(new Animated.Value(0))[0];

	const fetchUserRides = async () => {
		setLoading(true);
		try {
			const user: any = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const response = await api.get(GET_USER_RIDES_URL, {
				headers: {
					Authorization: `Bearer ${user.access}`,
				},
			});
			setCreatedRides(response.data.created_rides);
			setAcceptedRides(response.data.accepted_rides);
		} catch (error) {
			console.error("Error fetching rides:", error);
		}
		setLoading(false);
	};

	const handleCreateRide = async (rideData: any) => {
		try {
			const user: any = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const response = await api.post(CREATE_RIDE_URL, rideData, {
				headers: {
					Authorization: `Bearer ${user.access}`,
				},
			});
			console.log("Ride created successfully:", response.data);
			fetchUserRides(); // Refresh the list
		} catch (error: any) {
			console.error("Error creating ride:", error);
			if (error.response) {
				console.error("Response data:", error.response.data);
			}
		}
	};

	useEffect(() => {
		fetchUserRides();
	}, []);

	// Animate tab indicator when tab changes
	useEffect(() => {
		Animated.spring(tabIndicatorPosition, {
			toValue: activeTab * (width / 2 - 32),
			useNativeDriver: true,
			friction: 8,
		}).start();
	}, [activeTab]);

	const renderCreatedRidesTab = () => {
		if (createdRides.length === 0) {
			return (
				<View style={styles.emptyContainer}>
					<Ionicons name="car-outline" size={60} color="#ccc" />
					<Text style={styles.emptyText}>No created rides</Text>
					<Text style={styles.emptySubtext}>
						Create a new ride to get started
					</Text>
				</View>
			);
		}

		return (
			<FlatList
				data={createdRides}
				keyExtractor={(item) => `created-${item.id}`}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => router.push(`/ride/${item.id}`)}>
						<RideCard item={item} />
					</TouchableOpacity>
				)}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
			/>
		);
	};

	const renderAcceptedRidesTab = () => {
		if (acceptedRides.length === 0) {
			return (
				<View style={styles.emptyContainer}>
					<Ionicons name="checkmark-circle-outline" size={60} color="#ccc" />
					<Text style={styles.emptyText}>No accepted rides</Text>
					<Text style={styles.emptySubtext}>Join rides to see them here</Text>
				</View>
			);
		}

		return (
			<FlatList
				data={acceptedRides}
				keyExtractor={(item) => `accepted-${item.id}`}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => router.push(`/ride/${item.id}`)}>
						<RideCard item={item} />
					</TouchableOpacity>
				)}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
			/>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>My Rides</Text>

			{/* Tab Navigation */}
			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tabButton, activeTab === 0 && styles.activeTabButton]}
					onPress={() => setActiveTab(0)}>
					<Text
						style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
						Created Rides
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
					onPress={() => setActiveTab(1)}>
					<Text
						style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
						Accepted Rides
					</Text>
				</TouchableOpacity>
				<Animated.View
					style={[
						styles.tabIndicator,
						{
							transform: [{ translateX: tabIndicatorPosition }],
						},
					]}
				/>
			</View>

			{loading ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color="#4b7bec" />
				</View>
			) : (
				<View style={styles.tabContent}>
					{activeTab === 0 ? renderCreatedRidesTab() : renderAcceptedRidesTab()}
				</View>
			)}

			<CreateRideModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onCreate={handleCreateRide}
			/>

			<TouchableOpacity
				onPress={() => setModalVisible(true)}
				style={styles.fab}
				activeOpacity={0.8}>
				<Ionicons name="add" size={30} color="#fff" />
			</TouchableOpacity>
		</View>
	);
};

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
	tabContainer: {
		flexDirection: "row",
		marginBottom: 16,
		position: "relative",
		borderRadius: 12,
		backgroundColor: "#e6efff",
		padding: 4,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderRadius: 8,
	},
	activeTabButton: {
		backgroundColor: "transparent",
	},
	tabText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
	},
	activeTabText: {
		color: "#4b7bec",
	},
	tabIndicator: {
		position: "absolute",
		width: width / 2 - 32,
		height: "100%",
		backgroundColor: "#fff",
		borderRadius: 8,
		top: 4,
		left: 4,
		zIndex: -1,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	tabContent: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 100,
	},
	fab: {
		position: "absolute",
		bottom: 30,
		right: 20,
		backgroundColor: "#4b7bec",
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		...Platform.select({
			ios: {
				shadowColor: "#4b7bec",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.3,
				shadowRadius: 8,
			},
			android: {
				elevation: 8,
			},
		}),
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

export default MyRidesScreen;
