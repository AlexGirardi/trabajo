import React from 'react';
import { Box, Typography } from '@mui/material';
import { useI18n } from '../i18n';
import { CourseList } from '../components/Course/CourseList';

const CoursesPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">{t('courses.title')}</Typography>
        <Typography variant="body1" color="text.secondary">{t('courses.subtitle')}</Typography>
      </Box>
      <CourseList />
    </Box>
  );
};

export default CoursesPage;
