// src/types/api.ts
export interface User {
    id: number;
    username: string;
    xp_points: number;
}

export interface Quest {
    id: number;
    name: string;
    description: string;
    xp_points: number;
    needed_amount: number;
    done: boolean;
    progress: number;
}

export interface UserStats {
    id: number;
    user_id: number;
    games_played: number;
    level: number;
    best_evaluation: number | null;
    worst_evaluation: number | null;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiError {
    error: string;
}

export interface Token {
    id: number;
    user_id: number;
    token: string;
    created_at: string;
    expires_at: string;
}

export interface Evaluation {
    id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    start_budget: number;
    end_budget: number;
    profit_margin: number;
}
