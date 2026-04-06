import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Puzzle, Achievement, View } from '../lib/types';
import * as Auth from '../lib/auth';
import * as PuzzleService from '../lib/puzzleService';
import { achievements as achievementData } from '../data/achievements';

type AdminView = 'main' | 'puzzle_management' | 'category_management' | 'player_management' | 'leaderboard_overview';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' };

interface AppState {
    user: User | null;
    view: View;
    adminView: AdminView;
    selectedCategory: string | null;
    currentPuzzle: Puzzle | null;
    puzzles: Record<string, Puzzle[]>;
    achievements: Achievement[];
    players: User[];
    toasts: ToastMessage[];
}

type Action =
    | { type: 'INITIALIZE_DATA'; payload: { puzzles: Record<string, Puzzle[]>, players: User[] } }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'SET_ADMIN_VIEW', payload: AdminView }
    | { type: 'SELECT_CATEGORY'; payload: string | null }
    | { type: 'START_PUZZLE'; payload: Puzzle }
    | { type: 'COMPLETE_PUZZLE'; payload: { puzzleId: string; points: number } }
    | { type: 'ADD_PUZZLE'; payload: Puzzle }
    | { type: 'EDIT_PUZZLE'; payload: Puzzle }
    | { type: 'DELETE_PUZZLE'; payload: string }
    | { type: 'ADD_CATEGORY', payload: string }
    | { type: 'EDIT_CATEGORY', payload: { oldName: string; newName: string } }
    | { type: 'DELETE_CATEGORY', payload: string }
    | { type: 'DELETE_PLAYER', payload: number }
    | { type: 'RESET_PLAYER_PROGRESS', payload: number }
    | { type: 'ADD_TOAST'; payload: { message: string; type: 'success' | 'error' } }
    | { type: 'REMOVE_TOAST'; payload: number };

const initialState: AppState = {
    user: null,
    view: 'player_dashboard',
    adminView: 'main',
    selectedCategory: null,
    currentPuzzle: null,
    puzzles: {},
    achievements: achievementData,
    players: [],
    toasts: [],
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
    login: typeof Auth.login;
    signup: (email: string, password: string, adminSecret?: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    selectCategory: (category: string | null) => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
    addPuzzle: (puzzle: Puzzle) => void;
    editPuzzle: (puzzle: Puzzle) => void;
    deletePuzzle: (puzzleId: string) => void;
    addCategory: (name: string) => void;
    editCategory: (oldName: string, newName: string) => void;
    deleteCategory: (name: string) => void;
    deletePlayer: (id: number) => void;
    resetPlayerProgress: (id: number) => void;
}>({
    state: initialState,
    dispatch: () => null,
    login: Auth.login,
    signup: Auth.signup,
    logout: () => {},
    selectCategory: () => {},
    addToast: () => {},
    addPuzzle: () => {},
    editPuzzle: () => {},
    deletePuzzle: () => {},
    addCategory: () => {},
    editCategory: () => {},
    deleteCategory: () => {},
    deletePlayer: () => {},
    resetPlayerProgress: () => {},
});

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'INITIALIZE_DATA':
            return {
                ...state,
                puzzles: action.payload.puzzles,
                players: action.payload.players,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                view: action.payload.role === 'admin' ? 'admin_dashboard' : 'player_dashboard',
                adminView: 'main',
                players: Auth.getPlayers(),
            };
        case 'LOGOUT':
            return {
                ...initialState,
                user: null,
                view: 'login',
                puzzles: PuzzleService.getPuzzles(),
                players: Auth.getPlayers(),
            };
        case 'SET_VIEW':
            return {
                ...state,
                view: action.payload,
            };
        case 'SET_ADMIN_VIEW':
             if (state.user?.role !== 'admin') return state;
            return {
                ...state,
                adminView: action.payload,
            };
        case 'SELECT_CATEGORY':
            return {
                ...state,
                selectedCategory: action.payload,
            };
        case 'START_PUZZLE':
            return {
                ...state,
                currentPuzzle: action.payload,
                view: 'puzzle_view',
            };
        case 'COMPLETE_PUZZLE': {
            if (!state.user || state.user.solvedPuzzleIds.includes(action.payload.puzzleId)) {
                return state; // Do not award points if puzzle is already solved
            }
            
            const totalXp = state.user.xp + (state.user.level * state.user.xpToNextLevel) + action.payload.points;

            const updatedUser = {
                ...state.user,
                points: state.user.points + action.payload.points,
                xp: totalXp, // We pass total XP to updateUser which will calculate the new level state
                solvedPuzzleIds: [...state.user.solvedPuzzleIds, action.payload.puzzleId],
            };
            
            Auth.updateUser(updatedUser);
            // After updating, get the fresh user data back
            const freshUser = Auth.getLoggedInUser();
            
            return {
                ...state,
                user: freshUser, // Use the fresh user data with new level info
                players: Auth.getPlayers(),
            };
        }
        case 'ADD_PUZZLE': {
             if (state.user?.role !== 'admin') return state;
             const newPuzzles = PuzzleService.addPuzzle(action.payload);
             return {
                 ...state,
                 puzzles: newPuzzles,
             };
        }
        case 'EDIT_PUZZLE': {
            if (state.user?.role !== 'admin') return state;
            const newPuzzles = PuzzleService.editPuzzle(action.payload);
            return { ...state, puzzles: newPuzzles };
        }
        case 'DELETE_PUZZLE': {
            if (state.user?.role !== 'admin') return state;
            const newPuzzles = PuzzleService.deletePuzzle(action.payload);
            return { ...state, puzzles: newPuzzles };
        }
        case 'ADD_CATEGORY': {
            if (state.user?.role !== 'admin') return state;
            const newPuzzles = PuzzleService.addCategory(action.payload);
            return { ...state, puzzles: newPuzzles };
        }
        case 'EDIT_CATEGORY': {
            if (state.user?.role !== 'admin') return state;
            const newPuzzles = PuzzleService.editCategory(action.payload.oldName, action.payload.newName);
            return { ...state, puzzles: newPuzzles };
        }
        case 'DELETE_CATEGORY': {
            if (state.user?.role !== 'admin') return state;
            const newPuzzles = PuzzleService.deleteCategory(action.payload);
            return { ...state, puzzles: newPuzzles };
        }
        case 'DELETE_PLAYER':
            return {
                ...state,
                players: Auth.deleteUser(action.payload)
            };
        case 'RESET_PLAYER_PROGRESS':
            return {
                ...state,
                players: Auth.resetUserProgress(action.payload)
            };
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [...state.toasts, { ...action.payload, id: Date.now() }],
            };
        case 'REMOVE_TOAST':
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== action.payload),
            };
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        const puzzles = PuzzleService.getPuzzles();
        const players = Auth.getPlayers();
        dispatch({ type: 'INITIALIZE_DATA', payload: { puzzles, players } });

        const loggedInUser = Auth.getLoggedInUser();
        if (loggedInUser) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: loggedInUser });
        }
    }, []);

    const logout = () => {
        Auth.logout();
        dispatch({ type: 'LOGOUT' });
        addToast('You have been logged out.');
    };
    
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        dispatch({ type: 'ADD_TOAST', payload: { message, type } });
    };

    const selectCategory = (category: string | null) => {
        dispatch({ type: 'SELECT_CATEGORY', payload: category });
    };

    const addPuzzle = (puzzle: Puzzle) => dispatch({ type: 'ADD_PUZZLE', payload: puzzle });
    const editPuzzle = (puzzle: Puzzle) => dispatch({ type: 'EDIT_PUZZLE', payload: puzzle });
    const deletePuzzle = (puzzleId: string) => dispatch({ type: 'DELETE_PUZZLE', payload: puzzleId });
    const addCategory = (name: string) => dispatch({ type: 'ADD_CATEGORY', payload: name });
    const editCategory = (oldName: string, newName: string) => dispatch({ type: 'EDIT_CATEGORY', payload: { oldName, newName } });
    const deleteCategory = (name: string) => dispatch({ type: 'DELETE_CATEGORY', payload: name });
    
    const deletePlayer = (id: number) => dispatch({ type: 'DELETE_PLAYER', payload: id });
    const resetPlayerProgress = (id: number) => dispatch({ type: 'RESET_PLAYER_PROGRESS', payload: id });

    return (
        <AppContext.Provider value={{ state, dispatch, login: Auth.login, signup: Auth.signup, logout, selectCategory, addToast, addPuzzle, editPuzzle, deletePuzzle, addCategory, editCategory, deleteCategory, deletePlayer, resetPlayerProgress }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);