// @/lib/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeUser = async (userData: any) => {
	try {
		await AsyncStorage.setItem("user", JSON.stringify(userData));
	} catch (error) {
		console.error("Error storing user data:", error);
	}
};

export const getUser = async () => {
	try {
		const userData = await AsyncStorage.getItem("user");
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error("Error retrieving user data:", error);
		return null;
	}
};

export const clearUser = async () => {
	try {
		await AsyncStorage.removeItem("user");
	} catch (error) {
		console.error("Error clearing user data:", error);
	}
};
