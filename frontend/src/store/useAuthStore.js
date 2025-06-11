import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });

            get().connectSocket(); // Connect socket after checking auth
        } catch (error) {
            console.error("Error checking auth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");

            get().connectSocket(); // Connect socket after signup
        } catch (error) {
            toast.error("Error creating account");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket(); // Connect socket after login
        } catch (error) {
            toast.error("Invalid email or password");   
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket(); // Disconnect socket on logout
    } catch (error) {
      toast.error("Error logging out");
    }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error updating profile:", error);
            toast.error("Error updating profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser) {
            console.warn("Cannot connect socket, no user authenticated");
            return;
        }

        if(get().socket?.connected) {
            console.warn("Socket is already connected");
            return;
        }

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        })
        socket.connect();

        set({ socket: socket });
        console.log("Socket connected");

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
            console.log("Online users updated:", userIds);
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
            console.log("Socket disconnected");
        }
    },
})); 
