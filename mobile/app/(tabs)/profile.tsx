"use client";

import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	Platform,
	Dimensions,
	ImageBackground,
} from "react-native";
import { FETCH_USER_DATA_URL } from "@/lib/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/axios";
import { Ionicons } from "@expo/vector-icons";
import { clearUser } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Profile = () => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { logout } = useAuth(); // ✅ move hook to top-level
	const router = useRouter(); // ✅ move hook to top-level

	const fetchUserData = async () => {
		try {
			const userData = JSON.parse((await AsyncStorage.getItem("user")) || "");
			const res = await api.get(FETCH_USER_DATA_URL, {
				headers: {
					Authorization: `Bearer ${userData.access}`,
				},
			});
			setUser(res.data);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#4b7bec" />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>Failed to load user data.</Text>
			</View>
		);
	}

	// Mock data for the profile stats
	const profileStats = [
		{ icon: "car-outline", label: "Rides Taken", value: "12" },
		{ icon: "star-outline", label: "Rating", value: "4.8" },
		{ icon: "wallet-outline", label: "Saved", value: "₹2,450" },
	];

	const logoutFunction = async () => {
		console.log("logout clicked");
		logout(); // Update auth context
		router.replace("/auth"); // Navigate to auth screen
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header with gradient background */}
			<ImageBackground
				source={{
					uri: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
				}}
				style={styles.headerBackground}>
				<View style={styles.headerOverlay} />
				<View style={styles.header}>
					<TouchableOpacity style={styles.editButton}>
						<Ionicons name="pencil" size={18} color="#fff" />
					</TouchableOpacity>
				</View>
			</ImageBackground>

			{/* Profile Info Card */}
			<View style={styles.profileCard}>
				<View style={styles.avatarContainer}>
					<View style={styles.avatarOutline}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{user.full_name?.charAt(0).toUpperCase() || "?"}
							</Text>
						</View>
					</View>
				</View>

				<Text style={styles.name}>{user.full_name}</Text>
				<View style={styles.phoneContainer}>
					<Ionicons name="call-outline" size={16} color="#666" />
					<Text style={styles.phone}>{user.phone_number}</Text>
				</View>

				<View style={styles.divider} />

				{/* Stats Row */}
				<View style={styles.statsContainer}>
					{profileStats.map((stat, index) => (
						<View key={index} style={styles.statItem}>
							<View style={styles.statIconContainer}>
								<Ionicons name={stat.icon} size={20} color="#4b7bec" />
							</View>
							<Text style={styles.statValue}>{stat.value}</Text>
							<Text style={styles.statLabel}>{stat.label}</Text>
						</View>
					))}
				</View>
			</View>

			{/* Account Settings Section */}
			<View style={styles.sectionCard}>
				<Text style={styles.sectionTitle}>Account Settings</Text>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons name="person-outline" size={20} color="#4b7bec" />
					</View>
					<Text style={styles.menuText}>Edit Profile</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons name="notifications-outline" size={20} color="#4b7bec" />
					</View>
					<Text style={styles.menuText}>Notifications</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons
							name="shield-checkmark-outline"
							size={20}
							color="#4b7bec"
						/>
					</View>
					<Text style={styles.menuText}>Privacy & Security</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>
			</View>

			{/* Payment Section */}
			<View style={styles.sectionCard}>
				<Text style={styles.sectionTitle}>Payment Methods</Text>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons name="card-outline" size={20} color="#4b7bec" />
					</View>
					<Text style={styles.menuText}>Manage Payment Methods</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons name="receipt-outline" size={20} color="#4b7bec" />
					</View>
					<Text style={styles.menuText}>Transaction History</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>
			</View>

			{/* Support Section */}
			<View style={[styles.sectionCard, { marginBottom: 30 }]}>
				<Text style={styles.sectionTitle}>Support</Text>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons name="help-circle-outline" size={20} color="#4b7bec" />
					</View>
					<Text style={styles.menuText}>Help Center</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<View style={styles.menuIconContainer}>
						<Ionicons
							name="chatbubble-ellipses-outline"
							size={20}
							color="#4b7bec"
						/>
					</View>
					<Text style={styles.menuText}>Contact Support</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.menuItem, { borderBottomWidth: 0 }]}
					onPress={logoutFunction}>
					<View
						style={[styles.menuIconContainer, { backgroundColor: "#ffe6e6" }]}>
						<Ionicons name="log-out-outline" size={20} color="#e74c3c" />
					</View>
					<Text style={[styles.menuText, { color: "#e74c3c" }]}>Log Out</Text>
					<Ionicons name="chevron-forward" size={20} color="#ccc" />
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f7fa",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	headerBackground: {
		height: 180,
		width: "100%",
	},
	headerOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(75, 123, 236, 0.85)",
	},
	header: {
		height: 180,
		paddingTop: Platform.OS === "android" ? 40 : 60,
		paddingHorizontal: 20,
		alignItems: "flex-end",
	},
	editButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	profileCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		marginHorizontal: 16,
		marginTop: -50,
		paddingBottom: 20,
		alignItems: "center",
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
	avatarContainer: {
		marginTop: -40,
		marginBottom: 16,
	},
	avatarOutline: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
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
	avatar: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: "#4b7bec",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		color: "#fff",
		fontSize: 36,
		fontWeight: "bold",
	},
	name: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
		marginBottom: 6,
	},
	phoneContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	phone: {
		fontSize: 16,
		color: "#666",
		marginLeft: 6,
	},
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
		width: "90%",
		marginVertical: 20,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "100%",
		paddingHorizontal: 10,
	},
	statItem: {
		alignItems: "center",
		width: width / 4,
	},
	statIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f5ff",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	statValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#333",
	},
	statLabel: {
		fontSize: 12,
		color: "#888",
		marginTop: 2,
	},
	sectionCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		marginHorizontal: 16,
		marginTop: 16,
		padding: 16,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.05,
				shadowRadius: 8,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 16,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f5f5f5",
	},
	menuIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#f0f5ff",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	menuText: {
		flex: 1,
		fontSize: 16,
		color: "#333",
	},
	errorText: {
		color: "#e74c3c",
		fontSize: 16,
		textAlign: "center",
	},
});

export default Profile;
