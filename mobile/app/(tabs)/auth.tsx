import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { LOGIN_URL, REGISTER_URL } from "@/lib/urls";
import api from "@/lib/axios";
import { useRouter } from "expo-router";
import { storeUser } from "@/lib/storage";

// Main AuthScreen component
const AuthScreen = () => {
	const [isLogin, setIsLogin] = useState(true);
	const toggleAuthMode = () => setIsLogin(!isLogin);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}>
			{isLogin ? <Login /> : <Signup />}
			<TouchableOpacity onPress={toggleAuthMode} style={styles.switchContainer}>
				<Text style={styles.switchText}>
					{isLogin
						? "Don't have an account? Sign Up"
						: "Already have an account? Log In"}
				</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
};

// Login component
const Login = () => {
	const { login } = useAuth();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async () => {
		setLoading(true);
		try {
			const response = await api.post(LOGIN_URL, {
				phone_number: phone,
				password,
			});
			// console.log(response.data);
			console.log(response);
			await storeUser(response.data);
			login(); // Set authenticated state
			router.replace("/");
		} catch (error: any) {
			console.log(error);
			Alert.alert(
				"Login Failed",
				error?.response?.data?.message || "Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.authContainer}>
			<Text style={styles.title}>Log In</Text>
			<TextInput
				placeholder="Phone Number"
				value={phone}
				onChangeText={setPhone}
				style={styles.input}
				keyboardType="phone-pad"
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				style={styles.input}
				secureTextEntry
			/>
			<TouchableOpacity
				onPress={handleLogin}
				style={styles.button}
				disabled={loading}>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>Log In</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

// Signup component
const Signup = () => {
	const { login } = useAuth();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignup = async () => {
		setLoading(true);
		try {
			const response = await api.post(REGISTER_URL, {
				full_name: fullName,
				phone_number: phone,
				password,
			});
			console.log(response);
			login(); // Set authenticated state
		} catch (error: any) {
			Alert.alert(
				"Signup Failed",
				error?.response?.data?.message || "Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.authContainer}>
			<Text style={styles.title}>Sign Up</Text>
			<TextInput
				placeholder="Full Name"
				value={fullName}
				onChangeText={setFullName}
				style={styles.input}
				autoCapitalize="none"
			/>
			<TextInput
				placeholder="Phone Number"
				value={phone}
				onChangeText={setPhone}
				style={styles.input}
				keyboardType="phone-pad"
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				style={styles.input}
				secureTextEntry
			/>
			<TouchableOpacity
				onPress={handleSignup}
				style={styles.button}
				disabled={loading}>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>Sign Up</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 20,
		backgroundColor: "#f9fafd",
	},
	authContainer: {
		marginBottom: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#fff",
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 8,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	button: {
		backgroundColor: "#4b7bec",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	switchContainer: {
		alignItems: "center",
		marginTop: 20,
	},
	switchText: {
		color: "#4b7bec",
		fontSize: 16,
	},
});

export default AuthScreen;
