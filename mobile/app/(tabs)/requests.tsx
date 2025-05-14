"use client";

import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { GET_CREATED_JOIN_REQUESTS_URL } from "@/lib/urls";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// Status colors for different request statuses
const statusColors: Record<string, { bg: string; text: string; icon: string }> =
	{
		PENDING: { bg: "#fff8e6", text: "#f1c40f", icon: "time-outline" },
		ACCEPTED: {
			bg: "#e6fff0",
			text: "#2ecc71",
			icon: "checkmark-circle-outline",
		},
		REJECTED: { bg: "#ffe6e6", text: "#e74c3c", icon: "close-circle-outline" },
	};

const RequestsScreen = () => {
	const [requests, setRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { isAuthenticated } = useAuth();

	// This function would typically fetch data from your API
	// For now, we'll use the sample data you provided
	const fetchRequests = async () => {
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

			const response = await api.get(GET_CREATED_JOIN_REQUESTS_URL, {
				headers,
			});
			setRequests(response.data); // Assuming the response is an array of requests
		} catch (error) {
			console.error("Failed to fetch ride requests:", error);
			// Optionally show an error toast or UI message
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRequests();
	}, []);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderRequestItem = ({ item }: { item: any }) => {
		const { status, requested_at, ride } = item;
		const statusConfig = statusColors[status] || {
			bg: "#f0f0f0",
			text: "#666",
			icon: "help-circle-outline",
		};

		// Format the departure date
		const departureDate = new Date(ride.departure_datetime);
		const formattedDepartureDate = departureDate.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
		const formattedDepartureTime = departureDate.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});

		return (
			<TouchableOpacity
				style={styles.requestCard}
				onPress={() => router.push(`/ride/${ride.id}`)}>
				{/* Request Header */}
				<View style={styles.cardHeader}>
					<View
						style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
						<Ionicons
							name={statusConfig.icon}
							size={14}
							color={statusConfig.text}
						/>
						<Text style={[styles.statusText, { color: statusConfig.text }]}>
							{status}
						</Text>
					</View>
					<Text style={styles.requestDate}>
						Requested on {formatDate(requested_at)}
					</Text>
				</View>

				<View style={styles.divider} />

				{/* Ride Owner Info */}
				<View style={styles.ownerSection}>
					<View style={styles.ownerAvatar}>
						<Text style={styles.ownerAvatarText}>
							{ride.owner.full_name.charAt(0).toUpperCase()}
						</Text>
					</View>
					<View style={styles.ownerInfo}>
						<Text style={styles.ownerName}>{ride.owner.full_name}'s Ride</Text>
						<View style={styles.rideStatus}>
							<View
								style={[
									styles.rideBadge,
									{ backgroundColor: statusColors.UPCOMING?.bg || "#f0f0f0" },
								]}>
								<Text
									style={[
										styles.rideBadgeText,
										{ color: statusColors.UPCOMING?.text || "#666" },
									]}>
									{ride.status}
								</Text>
							</View>
							<Text style={styles.rideDate}>
								{formattedDepartureDate} • {formattedDepartureTime}
							</Text>
						</View>
					</View>
				</View>

				{/* Route Information */}
				<View style={styles.routeContainer}>
					<View style={styles.locationRow}>
						<View style={styles.iconContainer}>
							<Ionicons name="location" size={16} color="#4b7bec" />
						</View>
						<View style={styles.locationTextContainer}>
							<Text style={styles.locationLabel}>Pickup</Text>
							<Text style={styles.locationText}>
								{ride.pickup_latitude.toFixed(4)},{" "}
								{ride.pickup_longitude.toFixed(4)}
							</Text>
						</View>
					</View>

					<View style={styles.locationConnector}>
						<View style={styles.connectorLine} />
					</View>

					<View style={styles.locationRow}>
						<View style={styles.iconContainer}>
							<Ionicons name="flag" size={16} color="#e74c3c" />
						</View>
						<View style={styles.locationTextContainer}>
							<Text style={styles.locationLabel}>Destination</Text>
							<Text style={styles.locationText}>
								{ride.destination_latitude.toFixed(4)},{" "}
								{ride.destination_longitude.toFixed(4)}
							</Text>
						</View>
					</View>
				</View>

				{/* Ride Details */}
				<View style={styles.detailsContainer}>
					<View style={styles.detailItem}>
						<Ionicons name="people-outline" size={16} color="#666" />
						<Text style={styles.detailText}>
							{ride.seats_available}/{ride.total_seats} seats
						</Text>
					</View>

					<View style={styles.detailItem}>
						<Ionicons name="cash-outline" size={16} color="#666" />
						<Text style={styles.detailText}>₹{ride.cost_per_seat}/seat</Text>
					</View>
				</View>

				{/* Action Button */}
				<View style={styles.actionContainer}>
					<TouchableOpacity
						style={styles.viewButton}
						onPress={() => router.push(`/ride/${ride.id}`)}>
						<Text style={styles.viewButtonText}>View Ride Details</Text>
						<Ionicons name="chevron-forward" size={16} color="#4b7bec" />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#4b7bec" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>My Ride Requests</Text>

			{requests.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Ionicons name="document-outline" size={60} color="#ccc" />
					<Text style={styles.emptyText}>No ride requests</Text>
					<Text style={styles.emptySubtext}>
						You haven't requested any rides yet
					</Text>
				</View>
			) : (
				<FlatList
					data={requests}
					keyExtractor={(item) => item.id.toString()}
					renderItem={renderRequestItem}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
				/>
			)}
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
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
	requestCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		marginBottom: 16,
		overflow: "hidden",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontWeight: "600",
		fontSize: 12,
		marginLeft: 4,
	},
	requestDate: {
		fontSize: 12,
		color: "#888",
	},
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
		marginHorizontal: 16,
	},
	ownerSection: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	ownerAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#4b7bec",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	ownerAvatarText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	ownerInfo: {
		flex: 1,
	},
	ownerName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	rideStatus: {
		flexDirection: "row",
		alignItems: "center",
	},
	rideBadge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 8,
		marginRight: 8,
	},
	rideBadgeText: {
		fontSize: 10,
		fontWeight: "600",
	},
	rideDate: {
		fontSize: 12,
		color: "#666",
	},
	routeContainer: {
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	iconContainer: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#f5f7fa",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	locationTextContainer: {
		flex: 1,
	},
	locationLabel: {
		fontSize: 12,
		color: "#888",
		marginBottom: 2,
	},
	locationText: {
		fontSize: 14,
		color: "#333",
		fontWeight: "500",
	},
	locationConnector: {
		paddingLeft: 14,
		height: 16,
		justifyContent: "center",
	},
	connectorLine: {
		width: 1,
		height: "100%",
		backgroundColor: "#ddd",
	},
	detailsContainer: {
		flexDirection: "row",
		padding: 12,
		paddingHorizontal: 16,
		backgroundColor: "#f9fafc",
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 16,
	},
	detailText: {
		marginLeft: 6,
		fontSize: 14,
		color: "#666",
	},
	actionContainer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	viewButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	viewButtonText: {
		color: "#4b7bec",
		fontSize: 14,
		fontWeight: "600",
		marginRight: 4,
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

export default RequestsScreen;
