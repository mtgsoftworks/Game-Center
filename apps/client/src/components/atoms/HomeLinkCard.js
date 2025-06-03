import React from 'react';
import { Card, CardContent, Button, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HomeLinkCard = ({ title, icon, link }) => (
  <Card className="hover:shadow-lg">
    <CardContent className="flex flex-col items-center">
      <Box className="text-primary-main">{icon}</Box>
      <Typography variant="h6" className="mt-2">{title}</Typography>
      <Button component={Link} to={link} variant="contained" color="primary" className="mt-4">
        Git
      </Button>
    </CardContent>
  </Card>
);

export default HomeLinkCard; 