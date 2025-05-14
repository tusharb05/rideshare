import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
	createContext,
	useState,
	useContext,
	ReactNode,
	useEffect,
} from "react";
import { getUser, storeUser, clearUser } from "@/lib/storage";
import axios from "axios";
import { REFRESH_TOKEN_URL } from "@/lib/urls";
import api from "@/lib/axios";

interface AuthContextType {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const fetchUserData = async () => {
		const userData = await getUser();

		if (!userData?.access || !userData?.refresh) {
			setIsAuthenticated(false);
			return;
		}

		const accessToken = userData.access;

		// Decode token to get expiry
		const tokenParts = accessToken.split(".");
		if (tokenParts.length !== 3) {
			setIsAuthenticated(false);
			return;
		}

		try {
			const decodedPayload = JSON.parse(atob(tokenParts[1]));
			const exp = decodedPayload.exp;
			const currentTime = Math.floor(Date.now() / 1000);

			if (exp < currentTime) {
				// Token expired, try to refresh
				console.log("Access token expired. Refreshing...");

				try {
					console.log("Sending refresh token:", userData.refresh);

					const response = await api.post(REFRESH_TOKEN_URL, {
						refresh: userData.refresh,
					});
					console.log("RESPONSE: ");
					console.log(response.data);
					const newData = {
						...userData,
						access: response.data.access,
					};

					await storeUser(newData);
					console.log("Access token refreshed.");
					setIsAuthenticated(true);
				} catch (refreshError) {
					console.log("Refresh token failed:", refreshError);
					setIsAuthenticated(false);
				}
			} else {
				// Token still valid
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.log("Error decoding access token:", error);
			setIsAuthenticated(false);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, [isAuthenticated]);

	const login = () => setIsAuthenticated(true);
	const logout = async () => {
		await clearUser(); // Now clearing storage here too
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the AuthContext
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
