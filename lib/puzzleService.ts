import { Puzzle } from './types';
import { puzzles as seedPuzzles } from '../data/puzzles';

const PUZZLES_KEY = 'coding_game_puzzles';

const savePuzzles = (puzzles: Record<string, Puzzle[]>) => {
    try {
        localStorage.setItem(PUZZLES_KEY, JSON.stringify(puzzles));
    } catch (error) {
        console.error("Could not save puzzles to localStorage", error);
    }
};

// Function to get puzzles from localStorage or seed it if empty
export const getPuzzles = (): Record<string, Puzzle[]> => {
    try {
        const storedPuzzles = localStorage.getItem(PUZZLES_KEY);
        if (storedPuzzles) {
            return JSON.parse(storedPuzzles);
        } else {
            // If no puzzles in storage, seed with initial data
            savePuzzles(seedPuzzles);
            return seedPuzzles;
        }
    } catch (error) {
        console.error("Could not read or seed puzzles from localStorage", error);
        return seedPuzzles; // Fallback to seed data
    }
};

// Function to add a new puzzle and save to localStorage
export const addPuzzle = (newPuzzle: Puzzle): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    const { category } = newPuzzle;

    if (currentPuzzles[category]) {
        currentPuzzles[category].push(newPuzzle);
    } else {
        currentPuzzles[category] = [newPuzzle];
    }

    savePuzzles(currentPuzzles);
    return currentPuzzles;
};

export const editPuzzle = (updatedPuzzle: Puzzle): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    let oldCategory: string | null = null;

    // Find the original category of the puzzle
    for (const category in currentPuzzles) {
        if (currentPuzzles[category].some(p => p.id === updatedPuzzle.id)) {
            oldCategory = category;
            break;
        }
    }

    if (oldCategory) {
        const puzzleIndex = currentPuzzles[oldCategory].findIndex(p => p.id === updatedPuzzle.id);
        
        // If category has changed, move the puzzle
        if (oldCategory !== updatedPuzzle.category) {
            currentPuzzles[oldCategory].splice(puzzleIndex, 1);
            if (currentPuzzles[oldCategory].length === 0) {
                delete currentPuzzles[oldCategory];
            }
            if (!currentPuzzles[updatedPuzzle.category]) {
                currentPuzzles[updatedPuzzle.category] = [];
            }
            currentPuzzles[updatedPuzzle.category].push(updatedPuzzle);
        } else {
            // Otherwise, just update in place
            currentPuzzles[oldCategory][puzzleIndex] = updatedPuzzle;
        }
        savePuzzles(currentPuzzles);
    }

    return currentPuzzles;
};

export const deletePuzzle = (puzzleId: string): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    
    for (const category in currentPuzzles) {
        const puzzleIndex = currentPuzzles[category].findIndex(p => p.id === puzzleId);
        if (puzzleIndex !== -1) {
            currentPuzzles[category].splice(puzzleIndex, 1);
            if (currentPuzzles[category].length === 0) {
                delete currentPuzzles[category];
            }
            break;
        }
    }

    savePuzzles(currentPuzzles);
    return currentPuzzles;
};


export const addCategory = (categoryName: string): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    if (!currentPuzzles[categoryName]) {
        currentPuzzles[categoryName] = [];
        savePuzzles(currentPuzzles);
    }
    return currentPuzzles;
};

export const editCategory = (oldName: string, newName: string): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    if (oldName === newName || !currentPuzzles[oldName] || currentPuzzles[newName]) {
        return currentPuzzles; // No change needed or new name is invalid
    }

    // Update the category property on each puzzle object within the category
    const updatedPuzzlesInCategory = currentPuzzles[oldName].map(puzzle => ({
        ...puzzle,
        category: newName,
    }));

    // Move the array to the new key and delete the old key
    currentPuzzles[newName] = updatedPuzzlesInCategory;
    delete currentPuzzles[oldName];

    savePuzzles(currentPuzzles);
    return currentPuzzles;
};

export const deleteCategory = (categoryName: string): Record<string, Puzzle[]> => {
    const currentPuzzles = getPuzzles();
    if (currentPuzzles[categoryName]) {
        delete currentPuzzles[categoryName];
        savePuzzles(currentPuzzles);
    }
    return currentPuzzles;
};