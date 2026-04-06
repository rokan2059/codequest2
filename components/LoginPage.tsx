import React, { useState } from 'react';
import LogoIcon from './icons/LogoIcon';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
    const { login, signup, addToast, dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    
    // New state for admin registration
    const [isAdminSignup, setIsAdminSignup] = useState(false);
    const [adminSecret, setAdminSecret] = useState('');

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !password) {
            addToast('Please enter both email and password.', 'error');
            return;
        }
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success && result.user) {
            addToast(result.message);
            dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        } else {
            addToast(result.message, 'error');
        }
    };
    
    const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !password || !confirmPassword) {
            addToast('Please fill in all fields.', 'error');
            return;
        }
        if (!validateEmail(email)) {
            addToast('Please enter a valid email address.', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            addToast('Passwords do not match.', 'error');
            return;
        }
        if (isAdminSignup && !adminSecret) {
            addToast('Admin Secret Key is required for admin registration.', 'error');
            return;
        }

        setIsLoading(true);
        // Pass the admin secret if the toggle is checked
        const result = await signup(email, password, isAdminSignup ? adminSecret : undefined);
        setIsLoading(false);

        if (result.success) {
            addToast(result.message);
            setIsSigningUp(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setIsAdminSignup(false);
            setAdminSecret('');
        } else {
            addToast(result.message, 'error');
        }
    };

    const toggleFormMode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsSigningUp(!isSigningUp);
        // Reset form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsAdminSignup(false);
        setAdminSecret('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4">
            <div className="w-full max-w-md bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
                <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h1 className="text-3xl font-bold text-gray-100">
                        {isSigningUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-400 text-center">
                        {isSigningUp ? 'Join the CodeQuest Arena and start solving puzzles.' : 'Sign in to access your dashboard'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={isSigningUp ? handleSignUpSubmit : handleSignInSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isSigningUp ? "new-password" : "current-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="••••••••"
                        />
                        {isSigningUp && (
                            <p className="mt-1 text-xs text-gray-500">Min. 6 characters</p>
                        )}
                    </div>
                    
                    {isSigningUp && (
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 bg-gray-900 border ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
                                placeholder="••••••••"
                            />
                            {password && confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                            )}
                            
                            {/* Admin Registration Toggle */}
                            <div className="mt-6 flex items-center">
                                <input 
                                    id="admin-signup" 
                                    type="checkbox" 
                                    checked={isAdminSignup} 
                                    onChange={(e) => setIsAdminSignup(e.target.checked)}
                                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800"
                                />
                                <label htmlFor="admin-signup" className="ml-2 text-sm text-gray-400 select-none cursor-pointer">Register as Administrator</label>
                            </div>
                            
                            {/* Admin Secret Key Input (Only visible when checkbox is checked) */}
                            {isAdminSignup && (
                                <div className="mt-4 slide-up-fade-in">
                                    <label htmlFor="admin-secret" className="block text-sm font-medium text-purple-400 mb-2">
                                        Admin Secret Key
                                    </label>
                                    <input
                                        id="admin-secret"
                                        name="admin-secret"
                                        type="password"
                                        autoComplete="off"
                                        required={isAdminSignup}
                                        value={adminSecret}
                                        onChange={(e) => setAdminSecret(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900 border border-purple-500/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                        placeholder="Enter the secret key"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!isSigningUp && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); addToast('Password reset feature coming soon!', 'success'); }} className="font-medium text-blue-500 hover:text-blue-400 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${isAdminSignup ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isSigningUp ? (isAdminSignup ? 'Create Admin Account' : 'Sign Up') : 'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                 <p className="text-center text-sm text-gray-500 !mt-8">
                     {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={toggleFormMode} className="font-medium text-blue-500 hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer focus:outline-none">
                        {isSigningUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>

                <div className="relative !mt-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                     <p className="text-xs text-gray-500">Secure Admin Portal Access Required for Advanced Features</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;