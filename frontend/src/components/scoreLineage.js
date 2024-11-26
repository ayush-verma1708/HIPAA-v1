import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import {
  Box,
  TextField,
  Chip,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { debounce } from 'lodash';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ScoreboardLineage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          'http://localhost:8021/api/v1/completion-status/all/'
        );
        const data = response.data;

        const filteredData = data.filter(
          (action) =>
            action.isTask === true &&
            action.familyId?.fixed_id !== 4 &&
            action.familyId?.fixed_id !== 6
        );

        // Group actions by status
        const groupedData = filteredData.reduce((acc, item) => {
          const status = item.status || 'Unknown';
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push(item);
          return acc;
        }, {});

        // Map nodes with dynamic size and risk-based color
        const nodes = Object.keys(groupedData).map((status, index) => {
          const statusColor = getStatusColor(status);
          const actions = groupedData[status];
          const isHighRisk = status === 'Open';

          return {
            id: `group-${status}`,
            data: {
              label: (
                <Tooltip title={`Status: ${status}`} arrow>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                      {status}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      {actions.length} actions
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={calculateProgress(actions)}
                      sx={{ marginTop: 1 }}
                    />
                  </Box>
                </Tooltip>
              ),
              status,
              actions,
            },
            position: { x: (index % 5) * 300, y: Math.floor(index / 5) * 120 },
            style: {
              border: `3px solid ${statusColor}`,
              background: isHighRisk ? '#ffe5e5' : '#fff',
              borderRadius: '8px',
              padding: '10px',
              fontSize: isHighRisk ? '1rem' : '0.9rem',
              boxShadow: isHighRisk ? '0px 0px 15px rgba(255, 0, 0, 0.6)' : '',
            },
          };
        });

        // Map edges
        const edges = filteredData.map((item) => ({
          id: `edge-${item._id}`,
          source: item.assetId?._id || `asset-${item._id}`,
          target: item.familyId?._id || `family-${item._id}`,
          label: item.status || 'Status',
          type: 'smoothstep',
          animated: true,
          style: { stroke: getStatusColor(item.status) },
        }));

        setNodes(nodes);
        setEdges(edges);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch lineage data.');
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#f44336'; // Red
      case 'Completed':
        return '#4caf50'; // Green
      case 'Delegated to IT Team':
        return '#2196f3'; // Blue
      case 'Not Applicable':
        return '#9e9e9e'; // Gray
      default:
        return '#ff9800'; // Orange
    }
  };

  const calculateProgress = (actions) => {
    const completedActions = actions.filter(
      (action) => action.status === 'Completed'
    ).length;
    return (completedActions / actions.length) * 100;
  };

  const filteredNodes = nodes.filter(
    (node) =>
      (!searchQuery ||
        node.data.status.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!statusFilter.length || statusFilter.includes(node.data.status))
  );

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleClose = () => {
    setSelectedNode(null);
  };

  const handleExport = () => {
    const input = document.getElementById('react-flow-wrapper');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('lineage.pdf');
    });
  };

  const handleSearchChange = debounce((e) => {
    setSearchQuery(e.target.value);
  }, 300);

  const handleThemeChange = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Filter Section */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          padding: 2,
          background: '#f9f9f9',
          borderBottom: '1px solid #ddd',
        }}
      >
        <TextField
          label='Search by Status'
          variant='outlined'
          size='small'
          onChange={handleSearchChange}
        />
        <FormControl variant='outlined' size='small'>
          <InputLabel>Status Filter</InputLabel>
          <Select
            multiple
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label='Status Filter'
          >
            <MenuItem value='Open'>Open</MenuItem>
            <MenuItem value='Completed'>Completed</MenuItem>
            <MenuItem value='Delegated to IT Team'>
              Delegated to IT Team
            </MenuItem>
            <MenuItem value='Not Applicable'>Not Applicable</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label='Clear Filters'
          onClick={() => {
            setSearchQuery('');
            setStatusFilter([]);
          }}
          clickable
          sx={{ background: '#e0e0e0' }}
        />
        <Button onClick={handleExport}>Export as PDF</Button>
        <FormControlLabel
          control={
            <Switch checked={theme === 'dark'} onChange={handleThemeChange} />
          }
          label='Dark Mode'
        />
      </Box>

      {/* Graph Section */}
      <Box
        id='react-flow-wrapper'
        sx={{ flex: 1, borderTop: '1px solid #ddd' }}
      >
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant={theme} />
        </ReactFlow>
      </Box>

      {/* Dialog for Node Details */}
      <Dialog
        open={!!selectedNode}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>{selectedNode?.data?.status} Actions</DialogTitle>
        <DialogContent>
          {selectedNode?.data?.actions.map((action) => (
            <Box key={action._id} sx={{ marginBottom: 2 }}>
              <Typography variant='body1'>
                <strong>Asset:</strong>{' '}
                {action.assetId?.name || 'Unknown Asset'}
              </Typography>
              <Typography variant='body2'>
                <strong>Family:</strong>{' '}
                {action.familyId?.hipaa_Classification || 'Unknown Family'}
              </Typography>
              <Typography variant='body2'>
                <strong>Status:</strong> {action.status}
              </Typography>
              <Typography variant='body2'>
                <strong>Selected Software:</strong> {action.software || 'N/A'}
              </Typography>
              <Typography variant='body2'>
                <strong>Historical Changes:</strong>
              </Typography>
              {Array.isArray(action.history) ? (
                action.history.map((change) => (
                  <Box key={change._id} sx={{ marginLeft: 2, marginBottom: 1 }}>
                    <Typography variant='body2'>
                      <strong>Modified At:</strong>{' '}
                      {new Date(change.modifiedAt).toLocaleString()}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Modified By:</strong> {change.modifiedBy.username}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Changes:</strong>
                      <Box sx={{ marginLeft: 2 }}>
                        {Object.entries(change.changes).map(([key, value]) => (
                          <Typography key={key} variant='body2'>
                            {key}: {value.toString()}
                          </Typography>
                        ))}
                      </Box>
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant='body2'>No historical changes</Typography>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScoreboardLineage;
