import { User } from './types';

const USERS_KEY = 'coding_game_users';
const LOGGED_IN_USER_KEY = 'coding_game_logged_in_user';
const ADMIN_SECRET_KEY = 'andrew40';

const calculateLevel = (xp: number) => {
    let level = 1;
    let requiredXp = 100;
    while (xp >= requiredXp) {
        xp -= requiredXp;
        level++;
        requiredXp = Math.floor(requiredXp * 1.5);
    }
    return { level, xpInLevel: xp, xpToNextLevel: requiredXp };
};

const getInitialUsers = (): User[] => {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
    } catch (error) {
        console.error("Could not parse users from localStorage", error);
    }
    
    const testUserLevel = calculateLevel(950);
    const defaultUsers: User[] = [
        { id: 1, email: 'admin@example.com', password: 'admin', role: 'admin', points: 0, xp: 0, level: 1, xpToNextLevel: 100, solvedPuzzleIds: [], achievements: [] },
        { id: 2, email: 'test@example.com', password: 'password', role: 'player', points: 950, xp: testUserLevel.xpInLevel, level: testUserLevel.level, xpToNextLevel: testUserLevel.xpToNextLevel, solvedPuzzleIds: ['js1', 'js2', 'arr1', 'async1'], achievements: ['ach1', 'ach2'] },
    ];
    
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    } catch (error) {
        console.error("Could not save default users to localStorage", error);
    }
    
    return defaultUsers;
};

let users: User[] = getInitialUsers();

const saveUsers = () => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Could not save users to localStorage", error);
    }
};

export const getPlayers = (): User[] => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user && user.password === password) {
                localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
                resolve({ success: true, message: 'Login successful!', user });
            } else {
                resolve({ success: false, message: 'Invalid email or password.' });
            }
        }, 800);
    });
};

export const signup = async (email: string, password: string, adminSecret?: string): Promise<{ success: boolean; message: string }> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                resolve({ success: false, message: 'An account with this email already exists.' });
            } else {
                let role: 'player' | 'admin' = 'player';
                
                if (adminSecret) {
                    if (adminSecret === ADMIN_SECRET_KEY) {
                        role = 'admin';
                    } else {
                        resolve({ success: false, message: 'Invalid Admin Secret Key. Access denied.' });
                        return;
                    }
                }

                const newUser: User = {
                    id: Date.now(),
                    email,
                    password,
                    role: role,
                    points: 0,
                    xp: 0,
                    level: 1,
                    xpToNextLevel: 100,
                    solvedPuzzleIds: [],
                    achievements: [],
                };
                users.push(newUser);
                saveUsers();
                resolve({ success: true, message: `Account created successfully! Role: ${role}` });
            }
        }, 800);
    });
};

export const logout = () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
};

export const getLoggedInUser = (): User | null => {
    const userJson = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
};

export const updateUser = (updatedUser: User) => {
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex > -1) {
        // Recalculate level info before saving
        const levelInfo = calculateLevel(updatedUser.xp);
        const finalUser = {
            ...updatedUser,
            level: levelInfo.level,
            xp: levelInfo.xpInLevel,
            xpToNextLevel: levelInfo.xpToNextLevel,
        };
        
        users[userIndex] = finalUser;
        saveUsers();
        // Also update the logged-in user session
        if (getLoggedInUser()?.id === updatedUser.id) {
            localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(finalUser));
        }
    }
};

export const deleteUser = (userId: number): User[] => {
    users = users.filter(u => u.id !== userId);
    saveUsers();
    return [...users];
};

export const resetUserProgress = (userId: number): User[] => {
    users = users.map(u => {
        if (u.id === userId) {
            return {
                ...u,
                points: 0,
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                solvedPuzzleIds: [],
                achievements: []
            };
        }
        return u;
    });
    saveUsers();
    return [...users];
};