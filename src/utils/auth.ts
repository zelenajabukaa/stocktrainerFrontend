// src/utils/auth.ts
import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
    userId: number;
    exp: number;
    iat: number;
}

// Token-Validierung
export function isTokenValid(token: string | null): boolean {
    if (!token) return false;

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;

        return decoded.exp > currentTime;
    } catch (error) {
        return false;
    }
}

// Token sicher aus localStorage holen
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Token sicher speichern
export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

// Token entfernen
export const removeToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Token-Ablaufzeit prüfen
export const getTokenExpiry = (token: string): number | null => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.exp * 1000; // In Millisekunden umwandeln
    } catch (error) {
        return null;
    }
};

// Prüfen ob Token bald abläuft (5 Minuten vor Ablauf)
export const isTokenExpiringSoon = (token: string): boolean => {
    const expiryTime = getTokenExpiry(token);
    if (!expiryTime) return true;

    const fiveMinutesInMs = 5 * 60 * 1000;
    return (expiryTime - Date.now()) <= fiveMinutesInMs;
};

// User-ID aus Token extrahieren
export const getUserIdFromToken = (token: string): number | null => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};

// Automatische Token-Erneuerung (falls Backend unterstützt)
export function shouldRefreshToken(token: string): boolean {
    return isTokenValid(token) && isTokenExpiringSoon(token);
}
