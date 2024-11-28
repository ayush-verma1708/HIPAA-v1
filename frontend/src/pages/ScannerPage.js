import React, { useState, useEffect, error } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from '../components/msalInstance'; // Assuming you have a separate file for msalInstance
import { callMsGraph } from '../components/graph'; // Assuming you have a separate file for graph API calls

import {
  fetchAccessLogs,
  fetchDataGovernance,
  fetchDataInventory,
  fetchAuditLogs,
} from '../api/azureFetchApi.js';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Container,
  Paper,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Business,
  Storage,
  Timeline,
  Security,
  Assessment,
  AccountBox,
  ExpandMore,
  CheckCircle,
  Cancel,
  Domain,
  Cloud,
  Router,
  Refresh,
  Dashboard,
} from '@mui/icons-material';

import NetworkScanner from '../components/NetworkScanner';
import CloudScanner from '../components/CloudScanner';
import { DBScanner } from '../components/DBScanner';
import { SAASScanner } from '../components/SAASScanner';
import { LOBApplication } from '../components/LOBApplication';

const AzureLogin = () => {
  const [account, setAccount] = useState(null); // To store user account info
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Handle UI popup state
  const [userDetails, setUserDetails] = useState(null); // To store additional user details
  const [companyDetails, setCompanyDetails] = useState(null); // To store company details
  const [dataInventory, setDataInventory] = useState(null);
  const [dataLineage, setDataLineage] = useState(null);
  const [accessLogs, setAccessLogs] = useState(null);
  const [sensitiveData, setSensitiveData] = useState(null);
  const [dataGovernance, setDataGovernance] = useState(null);
  const [dataResidency, setDataResidency] = useState(null);
  const [auditLogs, setAuditLogs] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [devices, setDevices] = useState([]); // State to hold the devices
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const [isAzureLoggedIn, setIsAzureLoggedIn] = useState(false);
  const [azureUserData, setAzureUserData] = useState(null);

  // Decode JWT to extract user details
  function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // Initialize MSAL and attempt silent login
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize(); // Ensure MSAL instance is initialized

        const sessionId = localStorage.getItem('sessionId');
        const authId = localStorage.getItem('authId');

        if (sessionId && authId) {
          const decodedToken = decodeJwt(authId);
          setAccount({
            username:
              decodedToken.preferred_username ||
              decodedToken.name ||
              'Unknown User',
            email: decodedToken.email,
          });
        } else {
          // Attempt silent login
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeMsal();
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant='h4' gutterBottom>
          Enterprise Scanner
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Container maxWidth={false} sx={{ py: 4 }}>
          <Box>
            <Tabs
              value={mainTab}
              onChange={(e, v) => setMainTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab
                icon={<Router />}
                label='Network Scanner'
                iconPosition='start'
              />
              <Tab
                icon={<Cloud />}
                label='Cloud Provider'
                iconPosition='start'
              />
              <Tab icon={<Storage />} label='DB Scanner' iconPosition='start' />
              <Tab
                icon={<Business />}
                label='SAAS Scanner'
                iconPosition='start'
              />
              <Tab
                icon={<Dashboard />}
                label='LOB Application'
                iconPosition='start'
              />
            </Tabs>

            {mainTab === 0 && <NetworkScanner />}
            {mainTab === 1 && <CloudScanner />}
            {mainTab === 2 && <DBScanner />}
            {mainTab === 3 && <SAASScanner />}
            {mainTab === 4 && <LOBApplication />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AzureLogin;
