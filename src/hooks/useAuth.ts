// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { User } from '../types/api';
import { login as apiLogin, register as apiRegister } from '../utils/api';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const data = await apiLogin(username, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            const data = await apiRegister(username, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    return {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };
};
