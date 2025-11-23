import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API call
import { useNavigate } from 'react-router-dom';
import { useContact } from './store/store';
 
// Simple SVG for the ChatMe logo (Can be replaced with an actual image if needed)
const ChatMeLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="10" r="1" fill="currentColor"/>
        <circle cx="12" cy="10" r="1" fill="currentColor"/>
        <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
);


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // State to hold login error messages
    const { setContact } = useContact();
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Clear previous errors
        console.log('Attempting login with:', { email, password });

        // --- Integrate your API call to '/api/auth/login' here ---
        try {
            const response = await axios.post('http://localhost:3002/api/auth/login', { email, password });
            console.log('Login successful:', response.data);
            
            // Handle successful login:
            // 1. Store the token (e.g., in localStorage or Zustand store)
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userId', response.data.UserId);
            setContact(response.data.contact)
            // 2. Redirect to the chat page or dashboard
            // Example using window.location (replace with Next.js router if needed)

            navigate('/loading')

        } catch (err) {
            console.error('Login failed:', err.response?.data?.msg || err.message);
            // Display error message to the user
            setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-gray-800 rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-700">
                    
                    {/* Header with Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <ChatMeLogo />
                        <h1 className="ml-3 text-3xl font-bold text-white tracking-tight">
                            CHATME
                        </h1>
                    </div>
                    
                    <h2 className="text-center text-xl font-semibold text-gray-400 mb-6">
                        Log in to your account
                    </h2>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Display Login Error Message */}
                        {error && (
                            <div className="p-3 bg-red-900 border border-red-700 rounded-md text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-400 mb-1"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-400 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white 
                                          ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500'} 
                                          transition duration-150 ease-in-out`}
                            >
                                {isLoading ? 'Logging in...' : 'Log In'}
                            </button>
                        </div>
                    </form>

                    {/* Link to Sign Up */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium text-blue-500 hover:text-blue-400">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;