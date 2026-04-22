import React, { createContext, useState, useContext, useEffect } from 'react';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        companyName: 'Loading...',
        companyEmail: 'Loading...',
        companyPhone: 'Loading...',
        companyAddress: 'Loading...',
        companyLogo: '',
        taxRate: 0,
        currency: 'Rs',
        invoiceFooter: 'Thank you for your business!'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await fetch('http://localhost:8080/settings');
            const result = await response.json();

            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            handleError('Failed to load company settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const response = await fetch('http://localhost:8080/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSettings)
            });

            const result = await response.json();

            if (result.success) {
                setSettings(result.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating settings:', error);
            handleError('Failed to update settings');
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
            {children}
            <ToastContainer />
        </SettingsContext.Provider>
    );
};