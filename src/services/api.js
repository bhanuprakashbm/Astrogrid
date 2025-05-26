// API service for AstroGrid project
// This file provides data access functions that will replace Firebase functionality

import * as dbServices from './database';

// Collection reference function
export const collection = (_, collectionName) => ({
    collectionName
});

// Get documents from a collection
export const getDocs = async (queryObj) => {
    let data = [];

    // Extract collection name and constraints from query
    const { collectionName, constraints = [] } = queryObj;

    // Process where constraints
    const whereConstraints = constraints.filter(c => c.type === 'where');
    const orderByConstraints = constraints.filter(c => c.type === 'orderBy');

    // Build filter object from where constraints
    const filters = whereConstraints.reduce((acc, constraint) => {
        acc[constraint.field] = constraint.value;
        return acc;
    }, {});

    // Get order field and direction
    let orderField = 'created_at';
    let orderDirection = 'DESC';

    if (orderByConstraints.length > 0) {
        orderField = orderByConstraints[0].field;
        orderDirection = orderByConstraints[0].direction.toUpperCase();
    }

    // Query the data with filters
    if (Object.keys(filters).length > 0) {
        data = await dbServices.findWhere(collectionName, filters, orderField, orderDirection);
    } else {
        data = await dbServices.getAll(collectionName, orderField, orderDirection);
    }

    // Format response like Firestore
    return {
        docs: data.map(item => ({
            id: item.id,
            data: () => ({ ...item }),
            ref: { id: item.id }
        })),
        empty: data.length === 0
    };
};

// Document reference function
export const doc = (_, collectionName, docId) => ({
    collectionName,
    docId
});

// Get a single document
export const getDoc = async (docRef) => {
    const data = await dbServices.getById(docRef.collectionName, docRef.docId);

    return {
        exists: () => !!data,
        data: () => data || null,
        id: docRef.docId
    };
};

// Update a document
export const updateDoc = async (docRef, data) => {
    return await dbServices.update(docRef.collectionName, docRef.docId, data);
};

// Add a document
export const addDoc = async (collectionRef, data) => {
    const newDoc = await dbServices.create(collectionRef.collectionName, data);
    return {
        id: newDoc.id
    };
};

// Delete a document
export const deleteDoc = async (docRef) => {
    return await dbServices.remove(docRef.collectionName, docRef.docId);
};

// Create a query
export const query = (collectionRef, ...queryConstraints) => {
    return {
        collectionName: collectionRef.collectionName,
        constraints: queryConstraints
    };
};

// Where constraint
export const where = (field, operator, value) => ({
    type: 'where',
    field,
    operator,
    value
});

// OrderBy constraint
export const orderBy = (field, direction = 'asc') => ({
    type: 'orderBy',
    field,
    direction
});

// Limit constraint
export const limit = (n) => ({
    type: 'limit',
    value: n
});

// Server timestamp function
export const serverTimestamp = () => {
    return new Date().toISOString();
};

// Auth (simplified - replace with your actual auth implementation)
export const auth = {
    currentUser: null
};

// Default export for convenience
export default {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    auth
}; 