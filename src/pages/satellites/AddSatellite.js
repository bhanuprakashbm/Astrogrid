import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/apiClient';

const AddSatellite = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Earth Observation',
        status: 'Operational',
        launch_date: '',
        orbit: 'LEO',
        description: '',
        mass: '',
        operator: '',
        mission_life: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await API.satellites.create(formData);
            navigate('/satellites');
        } catch (err) {
            console.error('Error creating satellite:', err);
            setError('Failed to create satellite. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Satellite</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Satellite Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                            Type *
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="Earth Observation">Earth Observation</option>
                            <option value="Communication">Communication</option>
                            <option value="Navigation">Navigation</option>
                            <option value="Scientific">Scientific</option>
                            <option value="Experimental">Experimental</option>
                            <option value="Small">Small</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Status *
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="Operational">Operational</option>
                            <option value="Non-operational">Non-operational</option>
                            <option value="In Development">In Development</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="launch_date">
                            Launch Date *
                        </label>
                        <input
                            type="date"
                            id="launch_date"
                            name="launch_date"
                            value={formData.launch_date}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orbit">
                            Orbit *
                        </label>
                        <select
                            id="orbit"
                            name="orbit"
                            value={formData.orbit}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="LEO">Low Earth Orbit (LEO)</option>
                            <option value="MEO">Medium Earth Orbit (MEO)</option>
                            <option value="GEO">Geostationary Orbit (GEO)</option>
                            <option value="HEO">Highly Elliptical Orbit (HEO)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mass">
                            Mass (kg)
                        </label>
                        <input
                            type="number"
                            id="mass"
                            name="mass"
                            value={formData.mass}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="0"
                            step="0.1"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operator">
                            Operator
                        </label>
                        <input
                            type="text"
                            id="operator"
                            name="operator"
                            value={formData.operator}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mission_life">
                            Mission Life
                        </label>
                        <input
                            type="text"
                            id="mission_life"
                            name="mission_life"
                            value={formData.mission_life}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., 5 years"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"
                    ></textarea>
                </div>

                <div className="flex items-center justify-end mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/satellites')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-space-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Satellite'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSatellite; 