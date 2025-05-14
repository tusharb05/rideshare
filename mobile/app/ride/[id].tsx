"use client";

import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Platform,
	Dimensions,
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { GET_RIDE_DETAILS_URL, REQUEST_RIDE_URL } from "@/lib/urls";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_RIDE_URL } from "@/lib/urls";

const { width } = Dimensions.get("window");

const statusColors: Record<string, { bg: string; text: string }> = {
	UPCOMING: { bg: "#e6efff", text: "#4b7bec" },
	ONGOING: { bg: "#fff8e6", text: "#f1c40f" },
	COMPLETED: { bg: "#e6fff0", text: "#2ecc71" },
	ABORTED: { bg: "#ffe6e6", text: "#e74c3c" },
};

const requestStatusColors: Record<
	string,
	{ bg: string; text: string; icon: string }
> = {
	PENDING: { bg: "#fff8e6", text: "#f1c40f", icon: "time-outline" },
	APPROVED: {
		bg: "#e6fff0",
		text: "#2ecc71",
		icon: "checkmark-circle-outline",
	},
	REJECTED: { bg: "#ffe6e6", text: "#e74c3c", icon: "close-circle-outline" },
};

export default function RideDetail() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const [ride, setRide] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [requestLoading, setRequestLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
		{}
	);

	const { isAuthenticated } = useAuth();

	const fetchRideDetails = async () => {
		try {
			const user: any = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const headers = user ? { Authorization: `Bearer ${user.access}` } : {};
			const response = await api.get(`${GET_RIDE_DETAILS_URL}${id}`, {
				headers,
			});
			setRide(response.data);
		} catch (err) {
			console.error("Error fetching ride details:", err);
			setError("Failed to load ride details.");
		} finally {
			setLoading(false);
		}
	};

	const requestRide = async () => {
		if (!isAuthenticated) {
			Alert.alert("Login Required", "Please login to request this ride", [
				{ text: "Cancel", style: "cancel" },
				{ text: "Login", onPress: () => router.push("/auth") },
			]);
			return;
		}

		setRequestLoading(true);
		try {
			const user: any = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const headers = user ? { Authorization: `Bearer ${user.access}` } : {};

			await api.post(`${REQUEST_RIDE_URL}/${id}/request/`, {}, { headers });

			// Refresh ride details to show updated status
			await fetchRideDetails();
			Alert.alert("Success", "Your request has been submitted");
		} catch (error: any) {
			console.error("Error requesting ride:", error);
			Alert.alert("Error", "Failed to request ride. Please try again.");
		} finally {
			setRequestLoading(false);
		}
	};

	const handleRequestAction = async (
		requestId: number,
		action: "accept" | "reject" // "accept" not "approve"
	) => {
		setActionLoading((prev) => ({ ...prev, [requestId]: true }));

		try {
			const user: any = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const headers = user ? { Authorization: `Bearer ${user.access}` } : {};

			// Adjust the URL to match Django's endpoint
			await api.put(
				`${BASE_RIDE_URL}/${id}/requests/${requestId}/${action}/`,
				{}, // body can be empty
				{ headers }
			);

			// Success toast or optional UI feedback here
			Alert.alert("Success", `Request ${action}ed successfully.`);

			// Refresh ride details after action
			await fetchRideDetails();
		} catch (error: any) {
			console.error(`Error ${action}ing request:`, error?.response || error);
			Alert.alert("Error", `Failed to ${action} request. Please try again.`);
		} finally {
			setActionLoading((prev) => ({ ...prev, [requestId]: false }));
		}
	};

	useEffect(() => {
		if (id) {
			fetchRideDetails();
		}
	}, [id]);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#4b7bec" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}>
					<Text style={styles.backButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	// Format the departure date
	const departureDate = new Date(ride.departure_datetime);
	const formattedDate = departureDate.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
	const formattedTime = departureDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Filter requests by status if user is owner and join_requests exists
	const pendingRequests =
		ride.is_user_owner && ride.join_requests
			? ride.join_requests.filter((req: any) => req.status === "PENDING")
			: [];

	const approvedRequests =
		ride.is_user_owner && ride.join_requests
			? ride.join_requests.filter((req: any) => req.status === "APPROVED")
			: [];

	const rejectedRequests =
		ride.is_user_owner && ride.join_requests
			? ride.join_requests.filter((req: any) => req.status === "REJECTED")
			: [];

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Ride Details</Text>
				<View style={{ width: 24 }} />
			</View>

			{/* Status Card */}
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<View
						style={[
							styles.badge,
							{ backgroundColor: statusColors[ride.status]?.bg || "#f0f0f0" },
						]}>
						<Text
							style={[
								styles.badgeText,
								{ color: statusColors[ride.status]?.text || "#666" },
							]}>
							{ride.status}
						</Text>
					</View>
					<Text style={styles.rideId}>Ride #{ride.id}</Text>
				</View>

				<View style={styles.divider} />

				{/* Badge Container - For owner and request status badges */}
				<View style={styles.badgesContainer}>
					{/* Owner Badge - Only shown if the user is the owner */}
					{ride.is_user_owner && (
						<View style={styles.ownerBadge}>
							<Ionicons name="person-circle" size={14} color="#fff" />
							<Text style={styles.ownerBadgeText}>Created By You</Text>
						</View>
					)}

					{/* Request Status Badge - Only shown if the user has requested this ride */}
					{isAuthenticated && ride.requested && ride.requested_status && (
						<View
							style={[
								styles.requestBadge,
								{
									backgroundColor:
										requestStatusColors[ride.requested_status]?.bg || "#f0f0f0",
								},
							]}>
							<Ionicons
								name={
									requestStatusColors[ride.requested_status]?.icon ||
									"help-circle-outline"
								}
								size={14}
								color={
									requestStatusColors[ride.requested_status]?.text || "#666"
								}
							/>
							<Text
								style={[
									styles.requestBadgeText,
									{
										color:
											requestStatusColors[ride.requested_status]?.text ||
											"#666",
									},
								]}>
								Request {ride.requested_status}
							</Text>
						</View>
					)}
				</View>

				<View style={styles.divider} />

				<View style={styles.dateTimeContainer}>
					<View style={styles.iconContainer}>
						<Ionicons name="calendar-outline" size={20} color="#4b7bec" />
					</View>
					<View>
						<Text style={styles.dateLabel}>Departure</Text>
						<Text style={styles.dateValue}>
							{formattedDate} • {formattedTime}
						</Text>
					</View>
				</View>
			</View>

			{/* Route Card */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Route Information</Text>

				<View style={styles.locationContainer}>
					<View style={styles.locationRow}>
						<View style={styles.iconContainer}>
							<Ionicons name="location" size={18} color="#4b7bec" />
						</View>
						<View style={styles.locationTextContainer}>
							<Text style={styles.locationLabel}>Pickup Location</Text>
							<Text style={styles.locationText}>
								{ride.pickup_latitude.toFixed(6)},{" "}
								{ride.pickup_longitude.toFixed(6)}
							</Text>
						</View>
					</View>

					<View style={styles.locationConnector}>
						<View style={styles.connectorLine} />
					</View>

					<View style={styles.locationRow}>
						<View style={styles.iconContainer}>
							<Ionicons name="flag" size={18} color="#e74c3c" />
						</View>
						<View style={styles.locationTextContainer}>
							<Text style={styles.locationLabel}>Destination</Text>
							<Text style={styles.locationText}>
								{ride.destination_latitude.toFixed(6)},{" "}
								{ride.destination_longitude.toFixed(6)}
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Ride Details Card */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Ride Details</Text>

				<View style={styles.detailsGrid}>
					<View style={styles.detailItem}>
						<View style={styles.detailIconContainer}>
							<Ionicons name="people" size={18} color="#4b7bec" />
						</View>
						<Text style={styles.detailLabel}>Total Seats</Text>
						<Text style={styles.detailValue}>{ride.total_seats}</Text>
					</View>

					<View style={styles.detailItem}>
						<View style={styles.detailIconContainer}>
							<Ionicons name="person-add" size={18} color="#4b7bec" />
						</View>
						<Text style={styles.detailLabel}>Available</Text>
						<Text style={styles.detailValue}>{ride.seats_available}</Text>
					</View>

					<View style={styles.detailItem}>
						<View style={styles.detailIconContainer}>
							<Ionicons name="cash" size={18} color="#4b7bec" />
						</View>
						<Text style={styles.detailLabel}>Total Cost</Text>
						<Text style={styles.detailValue}>
							₹{Number.parseFloat(ride.total_cost).toFixed(2)}
						</Text>
					</View>

					<View style={styles.detailItem}>
						<View style={styles.detailIconContainer}>
							<Ionicons name="pricetag" size={18} color="#4b7bec" />
						</View>
						<Text style={styles.detailLabel}>Per Seat</Text>
						<Text style={styles.detailValue}>
							₹{Number.parseFloat(ride.cost_per_seat).toFixed(2)}
						</Text>
					</View>
				</View>
			</View>

			{/* Owner Card */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Ride Owner</Text>

				<View style={styles.userContainer}>
					<View style={styles.userAvatar}>
						<Text style={styles.userAvatarText}>
							{ride.owner.full_name.charAt(0).toUpperCase()}
						</Text>
					</View>
					<View style={styles.userInfo}>
						<Text style={styles.userName}>{ride.owner.full_name}</Text>
						<View style={styles.phoneContainer}>
							<Ionicons name="call-outline" size={14} color="#666" />
							<Text style={styles.userPhone}>{ride.owner.phone_number}</Text>
						</View>
					</View>
					<TouchableOpacity style={styles.callButton}>
						<Ionicons name="call" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Participants Card */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>
					Participants ({ride.participants.length})
				</Text>

				{ride.participants.length === 0 ? (
					<View style={styles.emptyParticipants}>
						<Ionicons name="people-outline" size={40} color="#ccc" />
						<Text style={styles.emptyText}>No participants yet</Text>
					</View>
				) : (
					ride.participants.map((p: any) => (
						<View key={p.id} style={styles.participantItem}>
							<View style={styles.userAvatar}>
								<Text style={styles.userAvatarText}>
									{p.full_name.charAt(0).toUpperCase()}
								</Text>
							</View>
							<View style={styles.userInfo}>
								<Text style={styles.userName}>{p.full_name}</Text>
								<View style={styles.phoneContainer}>
									<Ionicons name="call-outline" size={14} color="#666" />
									<Text style={styles.userPhone}>{p.phone_number}</Text>
								</View>
							</View>
						</View>
					))
				)}
			</View>

			{/* Pending Requests Card - Only shown to ride owner */}
			{ride.is_user_owner &&
				ride.join_requests &&
				pendingRequests.length > 0 && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>
							Pending Requests ({pendingRequests.length})
						</Text>

						{pendingRequests.map((request: any) => (
							<View key={request.id} style={styles.requestItem}>
								<View style={styles.userContainer}>
									<View style={styles.userAvatar}>
										<Text style={styles.userAvatarText}>
											{request.user_full_name.charAt(0).toUpperCase()}
										</Text>
									</View>
									<View style={styles.userInfo}>
										<Text style={styles.userName}>
											{request.user_full_name}
										</Text>
										<View style={styles.phoneContainer}>
											<Ionicons name="call-outline" size={14} color="#666" />
											<Text style={styles.userPhone}>
												{request.user_phone_number}
											</Text>
										</View>
									</View>
								</View>

								<View style={styles.requestActions}>
									<TouchableOpacity
										style={styles.rejectButton}
										onPress={() => handleRequestAction(request.id, "reject")}
										disabled={actionLoading[request.id]}>
										{actionLoading[request.id] ? (
											<ActivityIndicator size="small" color="#fff" />
										) : (
											<>
												<Ionicons name="close" size={16} color="#fff" />
												<Text style={styles.actionButtonText}>Reject</Text>
											</>
										)}
									</TouchableOpacity>

									<TouchableOpacity
										style={styles.approveButton}
										onPress={() => handleRequestAction(request.id, "accept")}
										disabled={actionLoading[request.id]}>
										{actionLoading[request.id] ? (
											<ActivityIndicator size="small" color="#fff" />
										) : (
											<>
												<Ionicons name="checkmark" size={16} color="#fff" />
												<Text style={styles.actionButtonText}>Approve</Text>
											</>
										)}
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				)}

			{/* Approved Requests Card - Only shown to ride owner */}
			{ride.is_user_owner &&
				ride.join_requests &&
				approvedRequests.length > 0 && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>
							Approved Requests ({approvedRequests.length})
						</Text>

						{approvedRequests.map((request: any) => (
							<View key={request.id} style={styles.requestItem}>
								<View style={styles.userContainer}>
									<View style={styles.userAvatar}>
										<Text style={styles.userAvatarText}>
											{request.user_full_name.charAt(0).toUpperCase()}
										</Text>
									</View>
									<View style={styles.userInfo}>
										<Text style={styles.userName}>
											{request.user_full_name}
										</Text>
										<View style={styles.phoneContainer}>
											<Ionicons name="call-outline" size={14} color="#666" />
											<Text style={styles.userPhone}>
												{request.user_phone_number}
											</Text>
										</View>
									</View>
								</View>

								<View style={styles.statusBadge}>
									<Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
									<Text style={[styles.statusBadgeText, { color: "#2ecc71" }]}>
										Approved
									</Text>
								</View>
							</View>
						))}
					</View>
				)}

			{/* Rejected Requests Card - Only shown to ride owner */}
			{ride.is_user_owner &&
				ride.join_requests &&
				rejectedRequests.length > 0 && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>
							Rejected Requests ({rejectedRequests.length})
						</Text>

						{rejectedRequests.map((request: any) => (
							<View key={request.id} style={styles.requestItem}>
								<View style={styles.userContainer}>
									<View style={styles.userAvatar}>
										<Text style={styles.userAvatarText}>
											{request.user_full_name.charAt(0).toUpperCase()}
										</Text>
									</View>
									<View style={styles.userInfo}>
										<Text style={styles.userName}>
											{request.user_full_name}
										</Text>
										<View style={styles.phoneContainer}>
											<Ionicons name="call-outline" size={14} color="#666" />
											<Text style={styles.userPhone}>
												{request.user_phone_number}
											</Text>
										</View>
									</View>
								</View>

								<View style={styles.statusBadge}>
									<Ionicons name="close-circle" size={14} color="#e74c3c" />
									<Text style={[styles.statusBadgeText, { color: "#e74c3c" }]}>
										Rejected
									</Text>
								</View>
							</View>
						))}
					</View>
				)}

			{/* Action Buttons */}
			<View style={styles.actionContainer}>
				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={styles.secondaryButton}
						onPress={() => router.back()}>
						<Text style={styles.secondaryButtonText}>Go Back</Text>
					</TouchableOpacity>

					{/* Show Request Ride button if:
              1. User is not the owner AND
              2. Either user is not logged in OR user is logged in but hasn't requested yet OR user has requested but was rejected
          */}
					{!ride.is_user_owner &&
						(!isAuthenticated ||
							(isAuthenticated && !ride.requested) ||
							(isAuthenticated &&
								ride.requested &&
								ride.requested_status === "REJECTED")) && (
							<TouchableOpacity
								style={[
									styles.primaryButton,
									requestLoading && styles.disabledButton,
								]}
								onPress={requestRide}
								disabled={requestLoading}>
								{requestLoading ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<Text style={styles.primaryButtonText}>
										Request this ride
									</Text>
								)}
							</TouchableOpacity>
						)}
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: Platform.OS === "android" ? 40 : 60,
		paddingBottom: 10,
	},
	backIcon: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		marginHorizontal: 16,
		marginTop: 16,
		padding: 16,
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
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 16,
	},
	badge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	badgeText: {
		fontWeight: "600",
		fontSize: 12,
	},
	badgesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 8,
	},
	ownerBadge: {
		backgroundColor: "#2ecc71",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	ownerBadgeText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
		marginLeft: 4,
	},
	requestBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	requestBadgeText: {
		fontWeight: "600",
		fontSize: 12,
		marginLeft: 4,
	},
	rideId: {
		fontSize: 14,
		color: "#666",
	},
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
		marginVertical: 16,
	},
	dateTimeContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	dateLabel: {
		fontSize: 12,
		color: "#888",
	},
	dateValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	locationContainer: {
		marginTop: 8,
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#f0f5ff",
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
		paddingLeft: 18,
		height: 20,
		justifyContent: "center",
	},
	connectorLine: {
		width: 1,
		height: "100%",
		backgroundColor: "#ddd",
	},
	detailsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginHorizontal: -8,
	},
	detailItem: {
		width: "50%",
		paddingHorizontal: 8,
		marginBottom: 16,
	},
	detailIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#f0f5ff",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	detailLabel: {
		fontSize: 12,
		color: "#888",
		marginBottom: 2,
	},
	detailValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	userContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	userAvatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#4b7bec",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	userAvatarText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	phoneContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	userPhone: {
		fontSize: 14,
		color: "#666",
		marginLeft: 4,
	},
	callButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#4b7bec",
		alignItems: "center",
		justifyContent: "center",
	},
	participantItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f5f5f5",
	},
	emptyParticipants: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 30,
	},
	emptyText: {
		fontSize: 16,
		color: "#888",
		marginTop: 10,
	},
	actionContainer: {
		marginHorizontal: 16,
		marginBottom: 30,
		marginTop: 10,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: "#4b7bec",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		...Platform.select({
			ios: {
				shadowColor: "#4b7bec",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.2,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	disabledButton: {
		backgroundColor: "#a0b4e0",
	},
	primaryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	secondaryButtonText: {
		color: "#666",
		fontSize: 16,
		fontWeight: "600",
	},
	backButton: {
		backgroundColor: "#4b7bec",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
		marginTop: 16,
	},
	backButtonText: {
		color: "#fff",
		fontWeight: "600",
	},
	errorText: {
		color: "#e74c3c",
		fontSize: 16,
		marginBottom: 16,
	},
	requestItem: {
		borderBottomWidth: 1,
		borderBottomColor: "#f5f5f5",
		paddingVertical: 12,
	},
	requestActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 12,
		gap: 8,
	},
	approveButton: {
		backgroundColor: "#2ecc71",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	rejectButton: {
		backgroundColor: "#e74c3c",
		paddingHorizontal: 16,
		paddingVertical: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
		marginLeft: 4,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
		alignSelf: "flex-end",
	},
	statusBadgeText: {
		fontSize: 14,
		fontWeight: "600",
		marginLeft: 4,
	},
});
