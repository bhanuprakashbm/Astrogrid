import { query } from '../../utils/db';

// Register a new user
export const registerUser = async (name, email, password, role = 'Observer') => {
    try {
        // Check if user already exists
        const existingUsers = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            throw new Error('Email already in use');
        }

        // Insert new user
        const result = await query(
            'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, new Date().toISOString()]
        );

        // Get the newly created user
        const newUsers = await query(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );

        if (newUsers.length === 0) {
            throw new Error('User creation failed');
        }

        const user = {
            uid: newUsers[0].id,
            displayName: newUsers[0].name,
            email: newUsers[0].email,
            role: newUsers[0].role
        };

        // Store user in session
        sessionStorage.setItem('user', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Login with email and password
export const loginUser = async (email, password) => {
    try {
        const users = await query(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (users.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = {
            uid: users[0].id,
            displayName: users[0].name,
            email: users[0].email,
            role: users[0].role
        };

        // Store user in session
        sessionStorage.setItem('user', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout current user
export const logoutUser = () => {
    // Clear user from session storage
    sessionStorage.removeItem('user');
    return Promise.resolve();
};

// Get current user
export const getCurrentUser = () => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        return JSON.parse(savedUser);
    }
    return null;
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
    try {
        // Build the SET clause and parameters dynamically based on provided data
        const setValues = [];
        const values = [];

        if (updates.name) {
            setValues.push('name = ?');
            values.push(updates.name);
        }

        if (updates.email) {
            setValues.push('email = ?');
            values.push(updates.email);
        }

        if (updates.role) {
            setValues.push('role = ?');
            values.push(updates.role);
        }

        // Add updated_at timestamp
        setValues.push('updated_at = ?');
        values.push(new Date().toISOString());

        // Add ID for WHERE clause
        values.push(userId);

        const sql = `UPDATE users SET ${setValues.join(', ')} WHERE id = ?`;
        await query(sql, values);

        // Get the updated user
        const updatedUsers = await query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (updatedUsers.length === 0) {
            throw new Error('User update failed');
        }

        const updatedUser = {
            uid: updatedUsers[0].id,
            displayName: updatedUsers[0].name,
            email: updatedUsers[0].email,
            role: updatedUsers[0].role
        };

        // Update the user in session storage
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        return updatedUser;
    } catch (error) {
        console.error('Update user profile error:', error);
        throw error;
    }
};

// Update password
export const updatePassword = async (userId, newPassword) => {
    try {
        await query(
            'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
            [newPassword, new Date().toISOString(), userId]
        );
        return true;
    } catch (error) {
        console.error('Update password error:', error);
        throw error;
    }
};

// Request password reset (simulated)
export const requestPasswordReset = async (email) => {
    try {
        // Check if user exists
        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        // In a real app, this would send an email with a reset link
        console.log(`Password reset email would be sent to ${email}`);

        return true;
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
};

// Get all users
export const getAllUsers = async () => {
    try {
        const users = await query('SELECT * FROM users ORDER BY name');
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        }));
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
}; 