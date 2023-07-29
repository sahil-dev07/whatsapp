import React, { createContext, useContext, useReducer } from 'react';

// Create the context
const StateContext = createContext();

// Create the StateProvider component
const StateProvider = ({ initialState, reducer, children }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
        {children}
    </StateContext.Provider>
);

// Custom hook to use the state within components
const useStateValue = () => useContext(StateContext);

export { StateProvider, useStateValue };