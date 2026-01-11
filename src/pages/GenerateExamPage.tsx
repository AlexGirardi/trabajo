import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExamGenerator } from '../components/Exam/ExamGenerator';

const GenerateExamPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Generar Examen
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Crea exámenes personalizados usando inteligencia artificial
        </Typography>
      </Box>
      
      <ExamGenerator />
    </Box>
  );
};

export default GenerateExamPage;
