import API from './apiClient';

// Local storage keys
const TOKEN_KEY = 'astrogrid_token';
const USER_KEY = 'astrogrid_user';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
class AuthService {
    /**
     * Login user with email and password
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise<Object>} User data
     */
    async login(email, password) {
        try {
            const userData = await API.auth.login({ email, password });

            // Store user data and token
            this.setUser(userData);

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {Object} userData User registration data
     * @returns {Promise<Object>} Created user data
     */
    async register(userData) {
        try {
            const newUser = await API.auth.register(userData);

            // Auto-login after registration if response includes user data
            if (newUser) {
                this.setUser(newUser);
            }

            return newUser;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Logout the current user
     */
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        // Reload the page to reset application state
        window.location.href = '/';
    }

    /**
     * Get the current user
     * @returns {Object|null} Current user or null if not logged in
     */
    getCurrentUser() {
        const userJson = localStorage.getItem(USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /**
     * Get authentication token
     * @returns {string|null} Auth token
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Store user data in local storage
     * @param {Object} userData User data from API
     * @private
     */
    setUser(userData) {
        if (userData.token) {
            localStorage.setItem(TOKEN_KEY, userData.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    /**
     * Update current user data
     * @param {Object} userData Updated user data
     */
    updateUserData(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.setUser({ ...currentUser, ...userData });
        }
    }
}

// Create a singleton instance
const authService = new AuthService();

export default authService; 