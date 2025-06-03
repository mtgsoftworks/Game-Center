import React from 'react';
import { Card, Skeleton, Box, CardContent, CardActions } from '@mui/material';

/**
 * Skeleton placeholder for GameCard while loading.
 */
function GameCardSkeleton() {
  return (
    <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton width="60%" height={24} />
        <Skeleton width="80%" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton width={30} />
          <Skeleton variant="circular" width={16} height={16} sx={{ ml: 2 }} />
          <Skeleton width={30} />
          <Skeleton variant="circular" width={16} height={16} sx={{ ml: 2 }} />
          <Skeleton width={30} />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 1 }}>
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ ml: 1 }} />
        <Skeleton variant="circular" width={32} height={32} sx={{ ml: 'auto' }} />
        <Skeleton variant="circular" width={32} height={32} />
      </CardActions>
    </Card>
  );
}

export default GameCardSkeleton; 