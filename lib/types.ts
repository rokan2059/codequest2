
export type View = 'login' | 'admin_dashboard' | 'player_dashboard' | 'puzzles' | 'leaderboard' | 'profile' | 'puzzle_view';

export interface Puzzle {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    description: string;
    code: string;
    answer: string;
    category: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface User {
    id: number;
    email: string;
    password: string; // Hashed in a real app
    role: 'player' | 'admin';
    points: number;
    xp: number;
    level: number;
    xpToNextLevel: number;
    solvedPuzzleIds: string[];
    achievements: string[]; // Array of achievement IDs
}
