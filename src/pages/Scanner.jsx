import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, LogIn, LogOut } from 'lucide-react';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [mode, setMode] = useState('check-in'); // 'check-in' or 'check-out'
  const [isProcessing, setIsProcessing] = useState(false); // Add processing state
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const currentModeRef = useRef(mode);  // Add a ref to track current mode
  const lastScanTimeRef = useRef(0); // Add ref for tracking last scan time

  // Update ref whenever mode changes
  useEffect(() => {
    currentModeRef.current = mode;
  }, [mode]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (memberId) => {
      try {
        console.log('Making check-in request for memberId:', memberId);
        const response = await axios.post('http://localhost:5000/api/members/check-in', {
          memberId
        });
        console.log('Check-in response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Check-in request failed:', error.response?.data || error.message);
        // Handle specific error cases
        if (error.response?.status === 400) {
          throw new Error('Member is already checked in');
        } else if (error.response?.status === 404) {
          throw new Error('Member not found');
        }
        throw error;
      }
    },
    onMutate: () => {
      setIsProcessing(true); // Set processing state when mutation starts
      stopScanner(); // Stop scanner while processing
    },
    onSettled: () => {
      setIsProcessing(false); // Clear processing state when mutation completes
      startScanner(); // Restart scanner after processing
    },
    onSuccess: (data) => {
      setError(null);
      stopScanner(); // Stop scanning after successful check-in
    },
    onError: (error) => {
      setError(error.message || 'Check-in failed');
      // If it's not one of our handled errors, log it
      if (!error.message.includes('already checked in') && !error.message.includes('not found')) {
        console.error('Check-in error:', error);
      }
    }
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (memberId) => {
      try {
        console.log('Making check-out request for memberId:', memberId);
        const response = await axios.post('http://localhost:5000/api/members/check-out', {
          memberId
        });
        console.log('Check-out response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Check-out request failed:', error.response?.data || error.message);
        // Handle specific error cases
        if (error.response?.status === 400) {
          throw new Error('Member is not checked in');
        } else if (error.response?.status === 404) {
          throw new Error('Member not found or no active attendance record');
        }
        throw error;
      }
    },
    onMutate: () => {
      setIsProcessing(true); // Set processing state when mutation starts
      stopScanner(); // Stop scanner while processing
    },
    onSettled: () => {
      setIsProcessing(false); // Clear processing state when mutation completes
      startScanner(); // Restart scanner after processing
    },
    onSuccess: (data) => {
      setError(null);
      handleReset(); // Reset scanner after successful check-out
    },
    onError: (error) => {
      setError(error.message || 'Check-out failed');
      // If it's not one of our handled errors, log it
      if (!error.message.includes('not checked in') && !error.message.includes('not found')) {
        console.error('Check-out error:', error);
      }
    }
  });

  const initializeScanner = () => {
    if (scannerInstanceRef.current) {
      return; // Scanner already initialized
    }

    const qrScanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    scannerInstanceRef.current = qrScanner;
    qrScanner.render(onScanSuccess, onScanError);
    setIsScanning(true);
  };

  const stopScanner = async () => {
    try {
      if (scannerInstanceRef.current) {
        await scannerInstanceRef.current.pause(true);
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  const startScanner = async () => {
    try {
      if (scannerInstanceRef.current) {
        await scannerInstanceRef.current.resume();
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
    }
  };

  const cleanupScanner = async () => {
    try {
      if (scannerInstanceRef.current) {
        await stopScanner();
        await scannerInstanceRef.current.clear();
        scannerInstanceRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up scanner:', error);
    }
  };

  useEffect(() => {
    initializeScanner();
    return () => {
      cleanupScanner();
    };
  }, []); // Empty dependency array since we only want to initialize once

  const onScanSuccess = (decodedText) => {
    // Prevent scanning if already processing or scanner is paused
    if (isProcessing || !isScanning) return;

    // Implement cooldown period (1 second between scans)
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1000) {
      console.log('Scan too soon, ignoring');
      return;
    }
    lastScanTimeRef.current = now;

    // Use the ref value instead of the state directly
    const currentMode = currentModeRef.current;
    console.log('Scan successful. Current mode:', currentMode);
    setScanResult(decodedText);
    
    if (currentMode === 'check-in') {
      console.log('Initiating check-in mutation');
      checkInMutation.mutate(decodedText);
    } else {
      console.log('Initiating check-out mutation');
      checkOutMutation.mutate(decodedText);
    }
  };

  const onScanError = (errorMessage) => {
    // Only log fatal errors
    if (errorMessage.includes('NotFoundError') || errorMessage.includes('NotAllowedError')) {
      console.error('Scanner error:', errorMessage);
    }
  };

  const handleReset = async () => {
    setScanResult(null);
    setError(null);
    await cleanupScanner();
    initializeScanner();
  };

  const toggleMode = async () => {
    // First stop the scanner
    await stopScanner();
    
    // Update the mode
    const newMode = mode === 'check-in' ? 'check-out' : 'check-in';
    console.log('Toggling mode from', mode, 'to', newMode);
    setMode(newMode);
    currentModeRef.current = newMode; // Update ref immediately
    
    // Wait for a moment to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then reset and reinitialize
    setScanResult(null);
    setError(null);
    await cleanupScanner();
    
    // Add a check to verify mode before initializing
    console.log('Initializing scanner with mode:', newMode);
    initializeScanner();
  };

  // Helper function to format the success message
  const getSuccessMessage = (data) => {
    // Use ref value here too for consistency
    if (currentModeRef.current === 'check-in') {
      return `Check-in successful at ${new Date(data.data.attendance.checkIn).toLocaleTimeString()}`;
    } else {
      const duration = data.data.attendance.duration;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationText = hours > 0 
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;
      return `Check-out successful. Duration: ${durationText}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
          <p className="mt-1 text-sm text-gray-600">
            Scan member QR codes for check-in and check-out
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Mode:</span>
          <button
            onClick={toggleMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'check-in'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {mode === 'check-in' ? (
              <>
                <LogIn size={18} />
                <span>Check In</span>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span>Check Out</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scanner</h3>
          <div id="reader" className="w-full"></div>
        </motion.div>

        {/* Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan Status</h3>
          
          {(checkInMutation.isPending || checkOutMutation.isPending) ? (
            <div className="flex items-center justify-center space-x-2 text-indigo-600">
              <Loader2 className="animate-spin" size={24} />
              <span>Processing...</span>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle size={24} />
                <span>{error}</span>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          ) : scanResult && (checkInMutation.isSuccess || checkOutMutation.isSuccess) ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={24} />
                <span>
                  {getSuccessMessage(mode === 'check-in' ? checkInMutation.data : checkOutMutation.data)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Member ID: {scanResult}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Waiting for QR code scan...</p>
              <p className="text-sm mt-2">
                Current mode: <span className="font-medium">{mode === 'check-in' ? 'Check In' : 'Check Out'}</span>
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Select the desired mode (Check In/Check Out) using the toggle above</li>
          <li>Position the QR code within the scanner frame</li>
          <li>Hold steady until the code is recognized</li>
          <li>The scan will be processed automatically based on the selected mode</li>
          <li>Use "Scan Another" to scan the next code</li>
        </ul>
      </motion.div>
    </div>
  );
} 