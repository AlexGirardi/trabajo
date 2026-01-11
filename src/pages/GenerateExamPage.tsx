import React from 'react';
import { Box, Typography } from '@mui/material';
import { ExamGenerator } from '../components/Exam/ExamGenerator';
import { useI18n } from '../i18n';

const GenerateExamPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {t('exam.generate.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('exam.generate.subtitle')}
        </Typography>
      </Box>
      <ExamGenerator />
    </Box>
  );
};

export default GenerateExamPage;
