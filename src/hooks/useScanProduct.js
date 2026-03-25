import { useState, useCallback } from 'react';
import { scanProduct } from '../services/scanPipeline';

export const useScanProduct = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runScan = useCallback(async (imageFile, profile) => {
    setLoading(true);
    setResult(null); // Clear any previous results when starting a new scan

    try {
      const scanData = await scanProduct(imageFile, profile);
      setResult(scanData);
      return scanData;
    } catch (error) {
      console.error('Scan failed:', error);
      // Optional: you can store error in a state if UI needs it
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    runScan,
    loading,
    result
  };
};
