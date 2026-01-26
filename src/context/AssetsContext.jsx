import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiClient';

// Default fallback values (used while loading or on error)
const DEFAULT_CHAR_LIMITS = {
   ANONYMOUS: 500,
   EXPLORER: 750,
   CHALLENGER: 1000,
   DOMINATOR: 1500,
   UNDEFINED: 500
};

const DEFAULT_FILE_SIZE_LIMITS = {
   ANONYMOUS: 1 * 1024 * 1024,
   EXPLORER: 1.5 * 1024 * 1024,
   CHALLENGER: 2 * 1024 * 1024,
   DOMINATOR: 5 * 1024 * 1024,
   UNDEFINED: 1 * 1024 * 1024
};

const DEFAULT_DAILY_SECRET_LIMITS = {
   ANONYMOUS: 2,
   EXPLORER: 3,
   CHALLENGER: 5,
   DOMINATOR: 10,
   UNDEFINED: 2
};

const AssetsContext = createContext(null);

export function AssetsProvider({ children }) {
   const [subscriptionPlans, setSubscriptionPlans] = useState([]);
   const [charLimits, setCharLimits] = useState(DEFAULT_CHAR_LIMITS);
   const [fileSizeLimits, setFileSizeLimits] = useState(DEFAULT_FILE_SIZE_LIMITS);
   const [dailySecretLimits, setDailySecretLimits] = useState(DEFAULT_DAILY_SECRET_LIMITS);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchAssets();
   }, []);

   const fetchAssets = async () => {
      setLoading(true);
      setError(null);

      try {
         // Fetch all four in parallel
         const [subsResponse, charResponse, fileResponse, dailyResponse] = await Promise.all([
            apiRequest({
               url: '/api/assets/subscriptions',
               method: 'GET',
               requestId: 'FETCH_SUBSCRIPTIONS'
            }),
            apiRequest({
               url: '/api/assets/subscriptions/char-limits',
               method: 'GET',
               requestId: 'FETCH_CHAR_LIMITS'
            }),
            apiRequest({
               url: '/api/assets/subscriptions/file-size-limits',
               method: 'GET',
               requestId: 'FETCH_FILE_SIZE_LIMITS'
            }),
            apiRequest({
               url: '/api/assets/subscriptions/daily-secret-limits',
               method: 'GET',
               requestId: 'FETCH_DAILY_SECRET_LIMITS'
            })
         ]);

         // Helper to normalize keys to uppercase
         const normalizeKeys = obj => {
            if (!obj || typeof obj !== 'object') return {};
            return Object.keys(obj).reduce((acc, key) => {
               acc[key.toUpperCase()] = obj[key];
               return acc;
            }, {});
         };

         // Set subscription plans
         if (subsResponse) {
            // If it's a map/object, extract values or keys as needed.
            // Based on user info: {"ANONYMOUS": "anonymous", ...}
            setSubscriptionPlans(Object.values(subsResponse));
         }

         // Set character limits
         if (charResponse) {
            const normalized = normalizeKeys(charResponse.charLimits || charResponse);
            setCharLimits(prev => ({ ...prev, ...normalized }));
         }

         // Set file size limits
         if (fileResponse) {
            const normalized = normalizeKeys(fileResponse.fileLimit || fileResponse);
            setFileSizeLimits(prev => ({ ...prev, ...normalized }));
         }

         // Set daily secret limits
         if (dailyResponse) {
            const normalized = normalizeKeys(dailyResponse.dailySecretLimit || dailyResponse);
            setDailySecretLimits(prev => ({ ...prev, ...normalized }));
         }
      } catch (err) {
         console.error('Failed to fetch assets:', err);
         setError('Failed to load subscription limits');
         // Keep default values on error
      } finally {
         setLoading(false);
      }
   };

   const value = {
      subscriptionPlans,
      charLimits,
      fileSizeLimits,
      dailySecretLimits,
      loading,
      error,
      refetch: fetchAssets
   };

   return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export function useAssets() {
   const context = useContext(AssetsContext);
   if (!context) {
      throw new Error('useAssets must be used within an AssetsProvider');
   }
   return context;
}

// Helper function to get char limit for a plan
export function getCharLimit(charLimits, plan) {
   if (!plan) return charLimits.UNDEFINED || 500;
   const upperPlan = plan.toUpperCase();
   return charLimits[upperPlan] || charLimits.UNDEFINED || 500;
}

// Helper function to get file size limit for a plan
export function getFileSizeLimit(fileSizeLimits, plan) {
   if (!plan) return fileSizeLimits.UNDEFINED || 1 * 1024 * 1024;
   const upperPlan = plan.toUpperCase();
   return fileSizeLimits[upperPlan] || fileSizeLimits.UNDEFINED || 1 * 1024 * 1024;
}

// Helper function to get daily secret limit for a plan
export function getDailySecretLimit(dailySecretLimits, plan) {
   if (!plan) return dailySecretLimits.UNDEFINED || 5;
   const upperPlan = plan.toUpperCase();
   return dailySecretLimits[upperPlan] || dailySecretLimits.UNDEFINED || 5;
}
