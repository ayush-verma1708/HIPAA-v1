// src/pages/Scoreboard.js

import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import ScoreboardComponent from '../components/Scoreboard'; // Rename the import to avoid conflict
import ScoreboardLineage from '../components/scoreLineage'; // Import the new component

const ScoreboardPage = () => {
  return (
    <Container maxWidth={false}>
      {/* <Typography variant='h4' gutterBottom>
        Scoreboard
      </Typography> */}
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Box>
          <ScoreboardLineage />
        </Box>
        <Box>
          <ScoreboardComponent />
        </Box>
      </Paper>
    </Container>
  );
};

export default ScoreboardPage;
