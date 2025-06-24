import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log('AuthProvider initialized');

    // Check for existing session on load
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check if there's a user in local storage
                const storedUser = localStorage.getItem('astrogrid_user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setCurrentUser(user);
                    setUserRole(user.role);
                    setUserData(user);
                }
            } catch (error) {
                console.error('Session check error:', error);
                // Clear any invalid session data
                localStorage.removeItem('astrogrid_user');
                setCurrentUser(null);
                setUserRole(null);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    async function signup(email, password, name, role = 'Observer') {
        console.log('Signup function called');

        try {
            const user = await authService.register({
                name,
                email,
                password,
                role
            });

            setCurrentUser(user);
            setUserRole(user.role);
            setUserData(user);

            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async function login(email, password) {
        console.log('Login function called');

        try {
            const user = await authService.login(email, password);

            setCurrentUser(user);
            setUserRole(user.role);
            setUserData(user);

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    function logout() {
        console.log('Logout function called');

        authService.logout();

        // Clear user from state
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);

        return Promise.resolve();
    }

    async function resetPassword(email) {
        console.log('Reset password function called for:', email);

        try {
            // Not implemented in the current API, can be added later
            throw new Error('Password reset not implemented');
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    async function updateUserEmail(email) {
        console.log('Update user email function called');

        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const updatedUser = await authService.updateUserData({ email });

            setCurrentUser({ ...currentUser, ...updatedUser });
            setUserData({ ...userData, ...updatedUser });

            return true;
        } catch (error) {
            console.error('Update email error:', error);
            throw error;
        }
    }

    async function updateUserPassword(newPassword) {
        console.log('Update user password function called');

        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            // Not implemented in the current API, can be added later
            throw new Error('Password update not implemented');
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    async function updateUserProfile(data) {
        console.log('Update user profile function called');

        try {
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const updatedUser = await authService.updateUserData(data);

            setCurrentUser({ ...currentUser, ...updatedUser });
            setUserData({ ...userData, ...updatedUser });

            return updatedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    const value = {
        currentUser,
        userRole,
        userData,
        login,
        signup,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 