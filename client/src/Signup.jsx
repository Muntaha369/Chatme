import React, { useState } from 'react';
import axios from 'axios';

// Simple SVG for the ChatMe logo (Can be replaced with an actual image if needed)
const ChatMeLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="10" r="1" fill="currentColor"/>
        <circle cx="12" cy="10" r="1" fill="currentColor"/>
        <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
);


function SignupPage() {
    // State for all required sign-up fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const contacts = [];
        const rooms = [];
        const signupData = { username, email, password, contacts, rooms };
        console.log('Attempting signup with:', signupData);
        
        // --- Integrate your API call to '/api/auth/register' here ---
        // Example using axios:
        axios.post('http://localhost:3002/api/auth/register', signupData)
          .then(response => {
            console.log('Signup successful:', response.data);
            // Handle token storage and redirection to login or chat page
          })
          .catch(error => {
            console.error('Signup failed:', error.response?.data?.msg || error.message);
            // Display error message to the user
          })
          .finally(() => setIsLoading(false));

        // Placeholder for demonstration
        setTimeout(() => {
            setIsLoading(false);
            alert(`Signup attempt with Email: ${email}`);
            // Reset form fields after simulated attempt
            setUsername('');
            setEmail('');
            setPassword('');
        }, 1000); // Simulate network delay
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="w-full max-w-md">
                {/* Signup Card */}
                <div className="bg-gray-800 rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-700">
                    
                    {/* Header with Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <ChatMeLogo />
                        <h1 className="ml-3 text-3xl font-bold text-white tracking-tight">
                            CHATME
                        </h1>
                    </div>
                    
                    <h2 className="text-center text-xl font-semibold text-gray-400 mb-6">
                        Create your account
                    </h2>
                    
                    <form onSubmit={handleSignup} className="space-y-4"> {/* Reduced space for more fields */}
                        {/* Username Input */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                placeholder="Choose a username"
                            />
                        </div>
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email address</label>
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password" // Use 'new-password' for signup forms
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {/* Submit Button */}
                        <div className="pt-2"> {/* Added padding top */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white 
                                          ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500'} 
                                          transition duration-150 ease-in-out`}
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    {/* Link to Login */}
                    <p className="mt-6 text-center text-sm text-gray-500"> {/* Reduced margin top */}
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-blue-500 hover:text-blue-400">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;