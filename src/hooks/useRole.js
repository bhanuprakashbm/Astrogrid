import { useAuth } from '../context/AuthContext';

// Role access levels
const ROLE_LEVELS = {
    'Admin': 3,
    'Engineer': 2,
    'Observer': 1
};

export function useRole() {
    const { userRole } = useAuth();

    const isAdmin = userRole === 'Admin';
    const isEngineer = userRole === 'Engineer' || isAdmin;
    const isObserver = userRole === 'Observer' || isEngineer || isAdmin;

    const hasRequiredRole = (requiredRole) => {
        if (!userRole) return false;

        const userLevel = ROLE_LEVELS[userRole] || 0;
        const requiredLevel = ROLE_LEVELS[requiredRole] || 0;

        return userLevel >= requiredLevel;
    };

    return {
        userRole,
        isAdmin,
        isEngineer,
        isObserver,
        hasRequiredRole
    };
}

export default useRole; 