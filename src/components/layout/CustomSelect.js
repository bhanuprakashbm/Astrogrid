import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select an option', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const selected = options.find(opt => opt.value === value);
        setSelectedOption(selected || null);
    }, [value, options]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        onChange(option.value);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-left text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-lg">
                    <ul className="py-1 max-h-60 overflow-auto">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-800/50 ${
                                    selectedOption?.value === option.value ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
                                }`}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect; 