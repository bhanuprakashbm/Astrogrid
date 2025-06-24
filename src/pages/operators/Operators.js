import React, { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { collection, doc, getDocs, updateDoc, query, orderBy, deleteDoc } from '../../services/api';
import useRole from '../../hooks/useRole';

const Operators = () => {
    const [operators, setOperators] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const { isAdmin } = useRole();

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'Observer'
    });

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const q = query(collection(null, 'users'), orderBy('name'));
                const operatorsSnapshot = await getDocs(q);
                const operatorsList = operatorsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setOperators(operatorsList);

                if (operatorsList.length > 0 && !selectedOperator) {
                    setSelectedOperator(operatorsList[0]);
                    setEditForm({
                        name: operatorsList[0].name,
                        email: operatorsList[0].email,
                        role: operatorsList[0].role || 'Observer'
                    });
                }
            } catch (error) {
                console.error("Error fetching operators:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOperators();
    }, [selectedOperator]);

    const handleSelectOperator = (operator) => {
        setSelectedOperator(operator);
        setEditForm({
            name: operator.name,
            email: operator.email,
            role: operator.role || 'Observer'
        });
        setEditMode(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    const handleUpdateOperator = async (e) => {
        e.preventDefault();

        if (!selectedOperator) {
            console.error('No operator selected');
            return;
        }

        try {
            console.log('Updating operator:', selectedOperator.id, 'with data:', {
                name: editForm.name,
                role: editForm.role
            });

            const operatorRef = doc(null, 'users', selectedOperator.id);

            // Try to update the document
            try {
                await updateDoc(operatorRef, {
                    name: editForm.name,
                    role: editForm.role
                });
                
                console.log('Operator updated successfully');
                
                // Update operator in state
                const updatedOperator = {
                    ...selectedOperator,
                    name: editForm.name,
                    role: editForm.role
                };

                setSelectedOperator(updatedOperator);

                // Update operators list
                setOperators(operators.map(op =>
                    op.id === selectedOperator.id ? updatedOperator : op
                ));

                setEditMode(false);
                
                // Show success message
                alert('Operator updated successfully!');
                
            } catch (updateError) {
                console.error('Error in updateDoc:', updateError);
                alert('Failed to update operator. You may not have sufficient permissions.');
            }
            
        } catch (error) {
            console.error("Error in handleUpdateOperator:", error);
            alert('An error occurred while updating the operator.');
        }
    };

    const handleDeleteOperator = async () => {
        if (!selectedOperator || !isAdmin) return;

        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete operator ${selectedOperator.name}?`)) {
            return;
        }

        try {
            await deleteDoc(doc(null, 'users', selectedOperator.id));

            // Remove operator from state
            setOperators(operators.filter(op => op.id !== selectedOperator.id));
            setSelectedOperator(operators.length > 1 ? operators[0] : null);
        } catch (error) {
            console.error("Error deleting operator:", error);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800';
            case 'Engineer':
                return 'bg-blue-100 text-blue-800';
            case 'Observer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    // Show edit/delete buttons to all users
    // But actual operations will still require admin privileges

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Operator Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-lg overflow-auto max-h-[calc(100vh-200px)]">
                    <div className="p-4 bg-gray-700 sticky top-0">
                        <h2 className="text-xl font-bold text-white">Operators</h2>
                    </div>
                    <div className="p-4">
                        {operators.length > 0 ? (
                            <ul className="space-y-4">
                                {operators.map((operator) => (
                                    <li
                                        key={operator.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedOperator?.id === operator.id ? 'bg-space-blue bg-opacity-50' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        onClick={() => handleSelectOperator(operator)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium text-white">{operator.name}</h3>
                                                <p className="text-sm text-gray-300">{operator.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getRoleBadgeColor(operator.role)}`}>
                                                {operator.role || 'Observer'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No operators found.</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedOperator ? (
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-4 bg-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Operator Details</h2>
                                <div className="flex space-x-2">
                                    {!editMode && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDeleteOperator}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {editMode ? (
                                <div className="p-6">
                                    <form onSubmit={handleUpdateOperator}>
                                        <div className="mb-4">
                                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={editForm.name}
                                                onChange={handleInputChange}
                                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={editForm.email}
                                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none cursor-not-allowed opacity-70"
                                                disabled
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="role">
                                                Role
                                            </label>
                                            <select
                                                id="role"
                                                name="role"
                                                value={editForm.role}
                                                onChange={handleInputChange}
                                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                            >
                                                <option value="Observer">Observer</option>
                                                <option value="Engineer">Engineer</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(false)}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">Name</p>
                                                    <p className="text-white font-medium">{selectedOperator.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Email</p>
                                                    <p className="text-white">{selectedOperator.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Role</p>
                                                    <p>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(selectedOperator.role)}`}>
                                                            {selectedOperator.role || 'Observer'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">Account Created</p>
                                                    <p className="text-white">
                                                        {selectedOperator.createdAt
                                                            ? new Date(selectedOperator.createdAt).toLocaleDateString()
                                                            : 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Last Login</p>
                                                    <p className="text-white">
                                                        {selectedOperator.lastLogin
                                                            ? new Date(selectedOperator.lastLogin).toLocaleString()
                                                            : 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Role Permissions</h3>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-white mb-2">Observer</h4>
                                                    <ul className="text-sm text-gray-300 space-y-1">
                                                        <li>• View satellites</li>
                                                        <li>• View ground stations</li>
                                                        <li>• View telemetry data</li>
                                                        <li>• View anomalies</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white mb-2">Engineer</h4>
                                                    <ul className="text-sm text-gray-300 space-y-1">
                                                        <li>• All Observer permissions</li>
                                                        <li>• Send commands</li>
                                                        <li>• Manage anomalies</li>
                                                        <li>• Add satellites</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white mb-2">Admin</h4>
                                                    <ul className="text-sm text-gray-300 space-y-1">
                                                        <li>• All Engineer permissions</li>
                                                        <li>• Manage operators</li>
                                                        <li>• Full system access</li>
                                                        <li>• Delete records</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                            <p className="text-gray-400">Select an operator to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Operators; 