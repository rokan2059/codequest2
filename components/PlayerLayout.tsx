
import React from 'react';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import Navbar from './Navbar';
import PlayerDashboard from './PlayerDashboard';
import PuzzleList from './PuzzleList';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import PuzzleView from './PuzzleView';
import { useAppContext } from '../context/AppContext';
import { View } from '../lib/types';

const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.98 },
};

const pageTransition: Transition = {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.3,
};

interface PlayerLayoutProps {
    isPublic?: boolean;
}

const PlayerLayout: React.FC<PlayerLayoutProps> = ({ isPublic }) => {
    const { state, logout, dispatch, selectCategory } = useAppContext();
    const { view, currentPuzzle, user } = state;

    // In public mode, always show puzzles view
    const effectiveView = isPublic ? 'puzzles' : view;
    const effectiveUser = isPublic ? null : user;

    const setView = (v: View) => dispatch({ type: 'SET_VIEW', payload: v });

    const renderView = () => {
        switch(effectiveView) {
            case 'player_dashboard': return <PlayerDashboard />;
            case 'puzzles': return <PuzzleList isPublic={isPublic} />;
            case 'leaderboard': return <Leaderboard />;
            case 'profile': return <Profile />;
            case 'puzzle_view': return currentPuzzle && !isPublic ? <PuzzleView puzzle={currentPuzzle} /> : <PuzzleList isPublic={isPublic} />;
            default: return <PlayerDashboard />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            {/* Hide navbar in public mode */}
            {!isPublic && (
                <Navbar 
                    userEmail={user?.email || ''} 
                    onLogout={logout} 
                    setView={setView} 
                    selectCategory={selectCategory}
                    activeView={view} 
                />
            )}
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={effectiveView}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PlayerLayout;
