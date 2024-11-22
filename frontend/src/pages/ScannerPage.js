import React, { useState, useEffect } from 'react';
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
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
  Avatar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
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
  Language,
  NotificationsActive,
  Settings,
  Refresh,
  Dashboard,
} from '@mui/icons-material';
import DeviceList from '../components/DeviceList.js';
import DeviceStats from '../components/DeviceStats';

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
  const [scannerStats, setScannerStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    vulnerabilities: 0,
    lastScan: null,
  });

  // Decode JWT to extract user details
  const decodeJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  // Add new function to fetch all data
  const fetchAllData = async () => {
    try {
      // Fetch additional user details
      const userDetails = await fetchUserDetails();
      setUserDetails(userDetails);

      // Fetch company details
      const companyDetails = await fetchCompanyDetails();
      setCompanyDetails(companyDetails);

      // Fetch other data
      try {
        const dataInventoryResult = await fetchDataInventory();
        setDataInventory(dataInventoryResult);

        const accessLogsResult = await fetchAccessLogs();
        setAccessLogs(accessLogsResult);

        const dataGovernanceResult = await fetchDataGovernance();
        setDataGovernance(dataGovernanceResult);

        const auditLogsResult = await fetchAuditLogs();
        setAuditLogs(auditLogsResult);
      } catch (dataError) {
        console.error('Error fetching data:', dataError);
      }
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

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

          // Fetch all data when session exists
          await fetchAllData();
        } else {
          // Attempt silent login
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await fetchAllData(); // Also fetch data for silent login
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeMsal();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const account = msalInstance.getAllAccounts()[0];
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: account,
      });
      const userDetails = await callMsGraph(response.accessToken, '/me');
      return userDetails;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await msalInstance.acquireTokenPopup({
          scopes: ['User.Read'],
        });
        const userDetails = await callMsGraph(response.accessToken, '/me');
        return userDetails;
      } else {
        console.error('Error fetching user details:', error);
      }
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const account = msalInstance.getAllAccounts()[0];
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['Directory.Read.All'],
        account: account,
      });
      const companyDetails = await callMsGraph(
        response.accessToken,
        '/organization'
      );
      console.log('Fetched Company Details:', companyDetails); // Add logging
      return companyDetails;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await msalInstance.acquireTokenPopup({
          scopes: ['Directory.Read.All'],
        });
        const companyDetails = await callMsGraph(
          response.accessToken,
          '/organization'
        );
        console.log('Fetched Company Details:', companyDetails); // Add logging
        return companyDetails;
      } else {
        console.error('Error fetching company details:', error);
      }
    }
  };

  // Login function with corrected scopes
  const login = async () => {
    try {
      setIsPopupOpen(true);
      const response = await msalInstance.loginPopup({
        scopes: [
          'openid',
          'profile',
          'email',
          'User.Read',
          'Directory.Read.All',
          'AuditLog.Read.All',
          'Reports.Read.All',
        ],
      });

      // Decode ID token for user details
      const decodedToken = decodeJwt(response.idToken);

      setAccount({
        username:
          decodedToken.preferred_username ||
          decodedToken.name ||
          'Unknown User',
        email: decodedToken.email,
      });

      // Use the new fetchAllData function
      await fetchAllData();

      // Store session info
      localStorage.setItem('sessionId', response.account.homeAccountId);
      localStorage.setItem('authId', response.idToken);
    } catch (error) {
      console.error('Login error:', error);
      if (error.errorCode === 'invalid_scope') {
        console.error(
          'Invalid scope requested. Please check application permissions.'
        );
      }
    } finally {
      setIsPopupOpen(false);
    }
  };

  // Remove or update functions that use invalid scopes
  // Remove: fetchDataLineage, fetchSensitiveData, fetchDataResidency
  // Update remaining fetch functions to use valid Graph API endpoints

  // Logout function
  const logout = async () => {
    try {
      await msalInstance.initialize(); // Ensure MSAL instance is initialized
      await msalInstance.logoutPopup();
      localStorage.removeItem('sessionId');
      localStorage.removeItem('authId');
      setAccount(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update the formatValue function to better handle complex objects
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {value.map((item, i) => (
            <li key={i}>{formatValue(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      // Handle Date objects
      if (value instanceof Date) {
        return value.toLocaleString();
      }

      // Handle special cases for known object structures
      if (value.used !== undefined && value.total !== undefined) {
        return `${value.used} / ${value.total}`;
      }

      // For other objects, create a nested structure
      return (
        <Box sx={{ pl: 2 }}>
          {Object.entries(value).map(([k, v]) => {
            // Skip internal properties and null/undefined values
            if (k.startsWith('@') || v === null || v === undefined) return null;

            return (
              <Box key={k} sx={{ mb: 1 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </Typography>
                <Typography component='div'>{formatValue(v)}</Typography>
              </Box>
            );
          })}
        </Box>
      );
    }
    return String(value);
  };

  // Update how we render values in the Grid items for user and company details
  const renderDetailItem = (key, value) => (
    <Grid item xs={12} key={key}>
      <Typography variant='subtitle2' color='textSecondary'>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </Typography>
      <Typography component='div'>{formatValue(value)}</Typography>
    </Grid>
  );

  // Update the DataCard component to use component="div" for Typography
  const DataCard = ({ title, icon, children, data }) => (
    <Card sx={{ height: '100%', mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant='h6' sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {data ? (
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Typography component='div'>{formatValue(data)}</Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );

  // Add helper functions for company details organization
  const organizeCompanyData = (companyDetails) => {
    if (!companyDetails?.value?.[0]) return null;
    const data = companyDetails.value[0];

    return {
      basicInfo: {
        displayName: data.displayName,
        businessPhones: data.businessPhones,
        technicalNotificationMails: data.technicalNotificationMails,
        createdDateTime: new Date(data.createdDateTime).toLocaleString(),
        preferredLanguage: data.preferredLanguage,
      },
      location: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        countryLetterCode: data.countryLetterCode,
      },
      quotaAndUsage: {
        directorySizeQuota: data.directorySizeQuota,
        tenantType: data.tenantType,
      },
      domains:
        data.verifiedDomains?.map((domain) => ({
          name: domain.name,
          type: domain.type,
          isDefault: domain.isDefault,
          // Convert capabilities to array if it's a string, or handle if it's an object
          capabilities:
            typeof domain.capabilities === 'string'
              ? [domain.capabilities]
              : Array.isArray(domain.capabilities)
              ? domain.capabilities
              : typeof domain.capabilities === 'object'
              ? Object.keys(domain.capabilities)
              : [],
        })) || [],
      plans: {
        assigned:
          data.assignedPlans?.filter(
            (plan) => plan.capabilityStatus === 'Enabled'
          ) || [],
        provisioned: data.provisionedPlans || [],
      },
    };
  };

  const renderStatusChip = (status) => (
    <Chip
      size='small'
      icon={status === 'Enabled' ? <CheckCircle /> : <Cancel />}
      color={status === 'Enabled' ? 'success' : 'error'}
      label={status}
    />
  );

  // Update the company details card rendering
  const CompanyDetailsCard = ({ data }) => {
    const organized = organizeCompanyData(data);
    if (!organized) return null;

    return (
      <DataCard title='Company Details' icon={<Business color='primary' />}>
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label='Basic Info' />
          <Tab label='Location' />
          <Tab label='Services' />
          <Tab label='Domains' />
        </Tabs>

        {selectedTab === 0 && (
          <Stack spacing={2}>
            {Object.entries(organized.basicInfo).map(([key, value]) => (
              <Box key={key}>
                <Typography variant='subtitle2' color='textSecondary'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Typography>
                  {Array.isArray(value) ? value.join(', ') : value || 'N/A'}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {selectedTab === 1 && (
          <Stack spacing={2}>
            {Object.entries(organized.location).map(([key, value]) => (
              <Box key={key}>
                <Typography variant='subtitle2' color='textSecondary'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Typography>{value || 'N/A'}</Typography>
              </Box>
            ))}
          </Stack>
        )}

        {selectedTab === 2 && (
          <Stack spacing={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  Assigned Plans ({organized.plans.assigned.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {organized.plans.assigned.map((plan, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper variant='outlined' sx={{ p: 1 }}>
                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Typography variant='subtitle2'>
                            {plan.service}
                          </Typography>
                          {renderStatusChip(plan.capabilityStatus)}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}

        {selectedTab === 3 && (
          <Stack spacing={2}>
            {organized.domains.map((domain, idx) => (
              <Paper key={idx} variant='outlined' sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Typography variant='subtitle1'>{domain.name}</Typography>
                    {domain.isDefault && (
                      <Chip
                        size='small'
                        icon={<Domain />}
                        label='Default'
                        color='primary'
                      />
                    )}
                  </Stack>
                  <Typography variant='body2' color='textSecondary'>
                    Type: {domain.type}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Capabilities:{' '}
                    {Array.isArray(domain.capabilities)
                      ? domain.capabilities.join(', ')
                      : 'None'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DataCard>
    );
  };

  // Add stats update handler
  const handleStatsUpdate = (newStats) => {
    try {
      setScannerStats(newStats);
    } catch (error) {
      console.error('Error handling stats update:', error);
    }
  };

  // Add section components
  const NetworkScanner = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h6'>Network Scanner</Typography>
          <Stack direction='row' spacing={2} alignItems='center'>
            <DeviceStats stats={scannerStats} />
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label='Auto Refresh'
            />
            <Tooltip title={`Last refreshed: ${lastRefresh || 'Never'}`}>
              <IconButton
                onClick={() => setLastRefresh(new Date().toLocaleString())}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <DeviceList onStatsUpdate={handleStatsUpdate} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {dataInventory && (
              <DataCard
                title='Data Inventory'
                icon={<Storage color='primary' />}
                data={dataInventory}
              />
            )}
            {accessLogs && (
              <DataCard
                title='Access Logs'
                icon={<Security color='primary' />}
                data={accessLogs}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const CloudScanner = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h6'>Cloud Provider</Typography>
          <Stack direction='row' spacing={2}>
            <Tooltip
              title={
                <Box>
                  <Typography>Connected to Azure AD</Typography>
                  <Button
                    variant='contained'
                    color='secondary'
                    size='small'
                    onClick={logout}
                    sx={{ mt: 1 }}
                  >
                    Logout
                  </Button>
                </Box>
              }
            >
              <Chip
                icon={<Cloud />}
                label='Azure AD'
                color='primary'
                variant='outlined'
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>
      <Grid container spacing={3}>
        {userDetails && (
          <Grid item xs={12} md={6}>
            <DataCard title='User Details' icon={<Person color='primary' />}>
              <Grid container spacing={2}>
                {Object.entries(userDetails)
                  .filter(([key]) => !['@odata.context', 'id'].includes(key))
                  .map(([key, value]) => renderDetailItem(key, value))}
              </Grid>
            </DataCard>
          </Grid>
        )}
        {companyDetails && (
          <Grid item xs={12} md={6}>
            <CompanyDetailsCard data={companyDetails} />
          </Grid>
        )}
        {dataGovernance && (
          <Grid item xs={12} md={6}>
            <DataCard
              title='Data Governance'
              icon={<Assessment color='primary' />}
              data={dataGovernance}
            />
          </Grid>
        )}
        {auditLogs && (
          <Grid item xs={12} md={6}>
            <DataCard
              title='Audit Logs'
              icon={<Timeline color='primary' />}
              data={auditLogs}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const DBScanner = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6'>DB Scanner</Typography>
        {/* Add DB Scanner related components here */}
      </Paper>
    </Box>
  );

  const SAASScanner = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6'>SAAS Scanner</Typography>
        {/* Add SAAS Scanner related components here */}
      </Paper>
    </Box>
  );

  const LOBApplication = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6'>LOB Application</Typography>
        {/* Add LOB Application related components here */}
      </Paper>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant='h4' gutterBottom>
          Enterprise Scanner
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Container maxWidth={false} sx={{ py: 4 }}>
          {!account ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='h5' gutterBottom>
                Welcome to DPDPA Scanner
              </Typography>
              <Typography color='textSecondary' paragraph>
                Please login to access the scanner dashboard
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={login}
                startIcon={<AccountBox />}
                sx={{ py: 1, px: 3 }}
              >
                Login with Azure AD
              </Button>
            </Paper>
          ) : (
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
                <Tab
                  icon={<Storage />}
                  label='DB Scanner'
                  iconPosition='start'
                />
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
          )}
        </Container>
      </Box>
    </>
  );
};

export default AzureLogin;

// import React, { useState } from 'react';
// import { fetchNetworkScan, analyzePackets } from '../api/ipService'; // API for packet analysis
// import DeviceList from '../components/DeviceList'; // Import the device list component
// import DeviceStats from '../components/DeviceStats'; // Import the device stats component
// import AzureLogin from '../components/AzureLogin'; // Import the device stats component
// import AzureDetails from '../components/AzureDetails';
// import './ScannerPage.css';

// // Function to detect if the device is a TV
// const isTV = (device) => {
//   return device.Hostnames.some((hostname) =>
//     hostname.toLowerCase().includes('tv')
//   );
// };

// // Function to detect if the device is a Router
// const isRouter = (device) => {
//   return (
//     device.OS.toLowerCase().includes('router') ||
//     device.Hostnames.some((hostname) =>
//       hostname.toLowerCase().includes('router')
//     )
//   );
// };

// // Function to detect if the device is a Mobile
// const isMobile = (device) => {
//   return (
//     device.OS.toLowerCase().includes('android') ||
//     device.OS.toLowerCase().includes('ios')
//   );
// };

// // Function to detect if the device is a Laptop
// const isLaptop = (device) => {
//   return (
//     device.OS.toLowerCase().includes('windows') ||
//     device.OS.toLowerCase().includes('mac') ||
//     device.OS.toLowerCase().includes('linux')
//   );
// };

// const ScannerPage = () => {
//   const [devices, setDevices] = useState([]); // State to hold the devices
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(null); // Error state
//   const [deviceStats, setDeviceStats] = useState({
//     tv: 0,
//     router: 0,
//     mobile: 0,
//     laptop: 0,
//     other: 0,
//   }); // State to hold the device statistics
//   const [selectedDevices, setSelectedDevices] = useState([]); // State to track selected devices

//   const [isAzureLoggedIn, setIsAzureLoggedIn] = useState(false);
//   const [azureUserData, setAzureUserData] = useState(null);

//   // Function to fetch devices
//   const fetchDevices = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchNetworkScan();
//       setDevices(data.devices || []);
//       updateDeviceStats(data.devices || []);
//     } catch (err) {
//       setError('Error fetching devices');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to update device stats
//   const updateDeviceStats = (devices) => {
//     const stats = devices.reduce(
//       (acc, device) => {
//         if (isTV(device)) acc.tv++;
//         else if (isRouter(device)) acc.router++;
//         else if (isMobile(device)) acc.mobile++;
//         else if (isLaptop(device)) acc.laptop++;
//         else acc.other++;
//         return acc;
//       },
//       { tv: 0, router: 0, mobile: 0, laptop: 0, other: 0 }
//     );
//     setDeviceStats(stats);
//   };

//   // Handle device selection
//   const handleDeviceSelection = (deviceIP) => {
//     setSelectedDevices((prev) =>
//       prev.includes(deviceIP)
//         ? prev.filter((ip) => ip !== deviceIP)
//         : [...prev, deviceIP]
//     );
//   };

//   // Analyze packets of selected devices
//   const analyzeSelectedDevices = async () => {
//     if (selectedDevices.length === 0) {
//       alert('Please select at least one device for analysis.');
//       return;
//     }

//     try {
//       const analysisResults = await analyzePackets(selectedDevices);
//       console.log('Packet Analysis Results:', analysisResults);
//       // You can display these results in a new section or modal.
//     } catch (err) {
//       console.error('Error analyzing packets:', err);
//       alert('Error analyzing packets');
//     }
//   };

//   return (
//     <div className='scanner-page'>
//       <header className='scanner-header'>
//         <h1>Network Scanner</h1>
//         <AzureLogin
//           setIsLoggedIn={setIsAzureLoggedIn}
//           setUserData={setAzureUserData}
//           setError={setError}
//         />
//         {isAzureLoggedIn && azureUserData && (
//           <div className='user-info'>
//             <p>Welcome, {azureUserData.username}</p>
//           </div>
//         )}
//       </header>

//       <main className='scanner-content'>
//         {error && <p className='error-message'>{error}</p>}

//         <div className='actions'>
//           <button
//             className='btn-primary'
//             onClick={fetchDevices}
//             disabled={loading}
//           >
//             {loading ? 'Fetching Devices...' : 'Get Devices List'}
//           </button>

//           {devices.length > 0 && (
//             <button
//               className='btn-secondary'
//               onClick={analyzeSelectedDevices}
//               disabled={selectedDevices.length === 0}
//             >
//               Analyze Selected Devices
//             </button>
//           )}
//         </div>

//         {loading && <p className='loading-message'>Loading devices...</p>}

//         {!loading && devices.length === 0 && (
//           <p className='no-devices-message'>
//             No devices found. Please scan the network.
//           </p>
//         )}

//         {devices.length > 0 && (
//           <>
//             <DeviceStats deviceStats={deviceStats} />
//             <DeviceList
//               devices={devices}
//               selectedDevices={selectedDevices}
//               handleDeviceSelection={handleDeviceSelection}
//             />
//           </>
//         )}
//       </main>

//       {/* <AzureDetails /> */}
//     </div>
//   );
// };

// export default ScannerPage;
