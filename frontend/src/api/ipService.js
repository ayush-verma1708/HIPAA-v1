import axios from 'axios';

// Function to fetch the IP address from the backend API
export const getIpAddress = async () => {
  try {
    const response = await axios.get('http://localhost:8021/api/get-ip');
    return response.data.ip; // Return the IP address from the response
  } catch (error) {
    throw new Error('Error fetching IP address: ' + error.message);
  }
};

// ipService.js

export const fetchNetworkScan = async () => {
  try {
    const response = await fetch('http://localhost:8021/api/scan-network'); // Adjust the URL to match your backend
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    return await response.json(); // Return the JSON response with device data
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error; // Propagate the error
  }
};

// Function to analyze packets for selected devices
export const analyzePackets = async (selectedDevices) => {
  console.log(selectedDevices);
  try {
    const response = await axios.post(
      'http://localhost:8021/api/analyze-packets',
      {
        devices: selectedDevices, // Send the list of selected devices
      }
    );
    return response.data.results; // Return the analysis results from the response
  } catch (error) {
    console.error('Error analyzing packets:', error);
    throw new Error('Error analyzing packets: ' + error.message); // Propagate the error
  }
};
