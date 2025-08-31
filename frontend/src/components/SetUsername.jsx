import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkUsername as checkUsernameApi, updateUsername } from '../api/authService';

// simple debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const SetUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const navigate = useNavigate();
  const { set_profile } = useAuth();

  const debouncedUsername = useDebounce(username, 500);

  // check username only when debounced value changes
  useEffect(() => {
    const check = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setIsAvailable(null);
        return;
      }
      try {
        setIsChecking(true);
        // pass as string so authService wraps it into { username }
        const response = await checkUsernameApi(debouncedUsername);
        setIsAvailable(response.available);
      } catch (err) {
        console.error('Error checking username:', err);
        setError('Error checking username availability');
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };
  
    check();
  }, [debouncedUsername]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters and can only contain letters, numbers, and underscores');
      return;
    }

    if (isAvailable === false) {
      setError('Username is already taken. Please try another one.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await updateUsername(token, username);
      
      if (response.success) {
        // Update the token in localStorage if a new one was returned
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        // Update the user profile in the auth context
        const token = localStorage.getItem('authToken');
        if (set_profile(token)) {
          window.history.replaceState({}, document.title, '/');
          navigate('/');
        } else {
          throw new Error('Failed to update user session');
        }
      } else {
        throw new Error(response.message || 'Failed to update username');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'An error occurred while updating your username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Choose a Username</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-100 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-400 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                {isChecking && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
              
              {username.length > 0 && !isChecking && (
                <p className={`mt-1 text-xs ${isAvailable === true ? 'text-green-400' : 'text-red-400'}`}>
                  {username.length < 3 
                    ? 'Username must be at least 3 characters'
                    : isAvailable === true 
                      ? 'Username is available!'
                      : isAvailable === false
                        ? 'Username is already taken'
                        : ''}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={
                isLoading ||
                isChecking ||
                username.length < 3 ||
                isAvailable === false
              }
              className={`cursor-pointer w-full py-2 px-4 rounded-lg font-medium text-white ${
                (isLoading || isChecking || username.length < 3 || isAvailable === false)
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors`}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetUsername;
