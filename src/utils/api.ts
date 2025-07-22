// src/utils/api.ts
import type { User, Quest, UserStats, LoginResponse } from '../types/api';

const BASE_URL = 'http://localhost:3000/api';

export const apiCall = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
    }

    return response;
};

// Auth-Funktionen
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login fehlgeschlagen');
    }

    return data;
};

export const register = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen');
    }

    return data;
};

// Weitere API-Funktionen...
export const fetchUserProfile = async (): Promise<User | null> => {
    try {
        const response = await apiCall(`${BASE_URL}/profile`);
        if (!response) return null;

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error("Fehler beim Abrufen des Profils:", error);
        return null;
    }
};


