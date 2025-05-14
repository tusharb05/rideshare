import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Modal,
	StyleSheet,
	Dimensions,
	Platform,
	Pressable,
} from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
	visible: boolean;
	onClose: () => void;
	onCreate: (data: any) => void;
}

const CreateRideModal: React.FC<Props> = ({ visible, onClose, onCreate }) => {
	const [pickupCoords, setPickupCoords] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({ latitude: null, longitude: null });
	const [destinationCoords, setDestinationCoords] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({ latitude: null, longitude: null });
	const [mode, setMode] = useState<"pickup" | "destination">("pickup");
	const [totalSeats, setTotalSeats] = useState("");
	const [totalCost, setTotalCost] = useState("");
	const [departureDate, setDepartureDate] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	const initialRegion: Region = {
		latitude: 20.5937,
		longitude: 78.9629,
		latitudeDelta: 5,
		longitudeDelta: 5,
	};

	const handleMapPress = (e: MapPressEvent) => {
		const { latitude, longitude } = e.nativeEvent.coordinate;
		if (mode === "pickup") {
			setPickupCoords({ latitude, longitude });
		} else {
			setDestinationCoords({ latitude, longitude });
		}
	};

	const handleDateChange = (_event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDepartureDate((prevDate) => {
				const updated = new Date(prevDate);
				updated.setFullYear(selectedDate.getFullYear());
				updated.setMonth(selectedDate.getMonth());
				updated.setDate(selectedDate.getDate());
				return updated;
			});
			if (Platform.OS === "android") {
				setTimeout(() => setShowTimePicker(true), 100);
			}
		}
	};

	const handleTimeChange = (_event: any, selectedTime?: Date) => {
		setShowTimePicker(false);
		if (selectedTime) {
			setDepartureDate((prevDate) => {
				const updated = new Date(prevDate);
				updated.setHours(selectedTime.getHours());
				updated.setMinutes(selectedTime.getMinutes());
				return updated;
			});
		}
	};

	const formattedDeparture = `${departureDate.toLocaleDateString()} ${departureDate.toLocaleTimeString(
		[],
		{ hour: "2-digit", minute: "2-digit" }
	)}`;

	const handleSubmit = () => {
		if (
			!pickupCoords.latitude ||
			!destinationCoords.latitude ||
			!departureDate ||
			!totalSeats ||
			!totalCost
		) {
			alert("Please fill all fields");
			return;
		}

		const rideData = {
			pickup_latitude: pickupCoords.latitude,
			pickup_longitude: pickupCoords.longitude,
			destination_latitude: destinationCoords.latitude,
			destination_longitude: destinationCoords.longitude,
			total_seats: parseInt(totalSeats),
			total_cost: parseFloat(totalCost),
			status: "UPCOMING",
			departure_datetime: departureDate.toISOString(), // e.g., "2025-04-13T18:15:00Z"
		};

		onCreate(rideData);
		console.log("Ride Data:", rideData);
	};

	return (
		<Modal visible={visible} animationType="slide">
			<View style={styles.modalContainer}>
				<TouchableOpacity onPress={onClose} style={styles.closeButton}>
					<Ionicons name="close" size={28} color="#333" />
				</TouchableOpacity>

				<Text style={styles.title}>Create Ride</Text>

				<View style={styles.modeButtons}>
					<TouchableOpacity
						style={[
							styles.modeButton,
							mode === "pickup" && styles.selectedButton,
						]}
						onPress={() => setMode("pickup")}>
						<Text style={styles.modeText}>Pickup</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.modeButton,
							mode === "destination" && styles.selectedButton,
						]}
						onPress={() => setMode("destination")}>
						<Text style={styles.modeText}>Destination</Text>
					</TouchableOpacity>
				</View>

				<MapView
					style={styles.map}
					initialRegion={initialRegion}
					onPress={handleMapPress}>
					{pickupCoords.latitude && (
						<Marker
							coordinate={{
								latitude: pickupCoords.latitude!,
								longitude: pickupCoords.longitude!,
							}}
							title="Pickup"
							pinColor="green"
						/>
					)}
					{destinationCoords.latitude && (
						<Marker
							coordinate={{
								latitude: destinationCoords.latitude!,
								longitude: destinationCoords.longitude!,
							}}
							title="Destination"
							pinColor="red"
						/>
					)}
				</MapView>

				<TextInput
					placeholder="Total Seats"
					value={totalSeats}
					onChangeText={setTotalSeats}
					style={styles.input}
					keyboardType="numeric"
				/>
				<TextInput
					placeholder="Total Cost"
					value={totalCost}
					onChangeText={setTotalCost}
					style={styles.input}
					keyboardType="numeric"
				/>

				<Pressable
					style={[styles.input, { justifyContent: "center" }]}
					onPress={() => {
						if (Platform.OS === "ios") {
							setShowDatePicker(true);
							setShowTimePicker(true);
						} else {
							setShowDatePicker(true);
						}
					}}>
					<Text>{formattedDeparture}</Text>
				</Pressable>

				{showDatePicker && (
					<DateTimePicker
						value={departureDate}
						mode="date"
						display={Platform.OS === "ios" ? "spinner" : "default"}
						onChange={handleDateChange}
					/>
				)}

				{showTimePicker && (
					<DateTimePicker
						value={departureDate}
						mode="time"
						display={Platform.OS === "ios" ? "spinner" : "default"}
						onChange={handleTimeChange}
					/>
				)}

				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
					<Text style={styles.submitText}>Create Ride</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f2f2f2",
	},
	closeButton: {
		alignSelf: "flex-end",
		marginBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	map: {
		width: "100%",
		height: Dimensions.get("window").height * 0.4,
		borderRadius: 10,
		marginBottom: 15,
	},
	modeButtons: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 10,
	},
	modeButton: {
		padding: 10,
		backgroundColor: "#ddd",
		borderRadius: 8,
	},
	selectedButton: {
		backgroundColor: "#4b7bec",
	},
	modeText: {
		color: "#fff",
		fontWeight: "bold",
	},
	input: {
		backgroundColor: "#fff",
		padding: 10,
		borderRadius: 8,
		marginBottom: 10,
	},
	submitButton: {
		backgroundColor: "#4b7bec",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	submitText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default CreateRideModal;
