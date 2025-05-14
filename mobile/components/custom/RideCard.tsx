import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

interface RideCardProps {
	item: any;
}

const RideCard = ({ item }: RideCardProps) => {
	// Format the departure date
	const departureDate = new Date(item.departure_datetime);
	const formattedDate = departureDate.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
	const formattedTime = departureDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<View style={styles.rideCard}>
			<View style={styles.cardHeader}>
				<View
					style={[
						styles.badge,
						{ backgroundColor: statusColors[item.status]?.bg || "#f0f0f0" },
					]}>
					<Text
						style={[
							styles.badgeText,
							{ color: statusColors[item.status]?.text || "#666" },
						]}>
						{item.status}
					</Text>
				</View>
				<Text style={styles.dateText}>{formattedDate}</Text>
			</View>

			{/* Badge Container - For owner and request status badges */}
			<View style={styles.badgesContainer}>
				{/* Owner Badge - Only shown if the user is the owner */}
				{item.is_user_owner && (
					<View style={styles.ownerBadge}>
						<Ionicons name="person-circle" size={14} color="#fff" />
						<Text style={styles.ownerBadgeText}>Created By You</Text>
					</View>
				)}

				{/* Request Status Badge - Only shown if the user has requested this ride */}
				{item.requested && item.requested_status && (
					<View
						style={[
							styles.requestBadge,
							{
								backgroundColor:
									requestStatusColors[item.requested_status]?.bg || "#f0f0f0",
							},
						]}>
						<Ionicons
							name={
								requestStatusColors[item.requested_status]?.icon ||
								"help-circle-outline"
							}
							size={14}
							color={requestStatusColors[item.requested_status]?.text || "#666"}
						/>
						<Text
							style={[
								styles.requestBadgeText,
								{
									color:
										requestStatusColors[item.requested_status]?.text || "#666",
								},
							]}>
							Request {item.requested_status}
						</Text>
					</View>
				)}
			</View>

			<View style={styles.locationContainer}>
				<View style={styles.locationRow}>
					<View style={styles.iconContainer}>
						<Ionicons name="location" size={16} color="#4b7bec" />
					</View>
					<View style={styles.locationTextContainer}>
						<Text style={styles.locationLabel}>Pickup</Text>
						<Text style={styles.locationText}>
							{item.pickup_latitude.toFixed(4)},{" "}
							{item.pickup_longitude.toFixed(4)}
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
							{item.destination_latitude.toFixed(4)},{" "}
							{item.destination_longitude.toFixed(4)}
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.divider} />

			<View style={styles.detailsContainer}>
				<View style={styles.detailItem}>
					<Ionicons name="time-outline" size={16} color="#666" />
					<Text style={styles.detailText}>{formattedTime}</Text>
				</View>

				<View style={styles.detailItem}>
					<Ionicons name="people-outline" size={16} color="#666" />
					<Text style={styles.detailText}>
						{item.total_seats - item.seats_available}/{item.total_seats} seats
					</Text>
				</View>

				<View style={styles.detailItem}>
					<Ionicons name="cash-outline" size={16} color="#666" />
					<Text style={styles.detailText}>₹{item.cost_per_seat}/seat</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	rideCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		marginBottom: 16,
		overflow: "hidden",
		// ...Platform.select({
		// 	ios: {
		// 		shadowColor: "#000",
		// 		shadowOffset: { width: 0, height: 2 },
		// 		shadowOpacity: 0.1,
		// 		shadowRadius: 8,
		// 	},
		// 	android: {
		// 		elevation: 4,
		// 	},
		// }),
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		paddingBottom: 12,
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
	dateText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	badgesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 16,
		marginTop: -4,
		marginBottom: 8,
		gap: 8,
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
	locationContainer: {
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
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
		marginHorizontal: 16,
	},
	detailsContainer: {
		flexDirection: "row",
		padding: 12,
		paddingHorizontal: 16,
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
});

export default RideCard;
