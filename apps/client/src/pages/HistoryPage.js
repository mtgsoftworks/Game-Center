import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Grid, TextField, Chip, Avatar } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data
const sampleHistory = [
  { date: '2025-05-01', event: 'Lobi Oluşturuldu' },
  { date: '2025-05-03', event: 'Oyun Başladı' },
  { date: '2025-05-05', event: 'Lobi Kapandı' },
];
const sampleStats = [
  { name: 'Oluşturulan Lobby', value: 12 },
  { name: 'Katılan Oyuncu', value: 45 },
  { name: 'Tamamlanan Oyun', value: 8 },
];
const sampleAchievements = [
  { label: '5 Lobby Oluştur', icon: '🏆' },
  { label: '10 Oyun Oyna', icon: '🎯' },
  { label: '20 Oyuncu Katılımı', icon: '👥' },
];

export default function HistoryPage() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const filteredHistory = sampleHistory.filter(item => {
    const d = new Date(item.date);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={2}>{t('gameHistoryAndStats')}</Typography>
      <Box mb={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker label={t('startDate')} value={fromDate} onChange={setFromDate} renderInput={params => <TextField {...params} sx={{ mr:2 }} />} />
          <DatePicker label={t('endDate')} value={toDate} onChange={setToDate} renderInput={params => <TextField {...params} />} />
        </LocalizationProvider>
      </Box>
      <Typography variant="h6" gutterBottom>{t('timeline')}</Typography>
      <Timeline position="alternate">
        {filteredHistory.map((item, idx) => (
          <TimelineItem key={idx}>
            <TimelineSeparator>
              <TimelineDot />
              {idx < filteredHistory.length-1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography>{item.date}</Typography>
              <Typography color="text.secondary">{item.event}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>{t('statisticsBoards')}</Typography>
        <Box height={300}>
          <ResponsiveContainer>
            <LineChart data={sampleStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1976d2" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>{t('myAchievements')}</Typography>
        <Grid container spacing={2}>
          {sampleAchievements.map((ach, i) => (
            <Grid item key={i}>
              <Chip icon={<Avatar>{ach.icon}</Avatar>} label={ach.label} color="primary" />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
} 