import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Chip, CardActions, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import { motion } from 'framer-motion';
import Button from '../atoms/Button';

/**
 * GameCard component to display game information.
 * Props:
 *  - game: { thumbnail, name, description, players, duration, difficulty, isNew, isFeatured }
 *  - onPlay, onDetails, onCreateLobby: callback functions
 */
function GameCard({ game, onPlay, onDetails, onCreateLobby }) {
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: '0px 8px 20px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.4 }}
      sx={{ borderRadius: '12px', overflow: 'hidden', elevation: 4 }}
    >
      <CardActionArea onClick={onPlay}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={game.thumbnail}
            alt={game.name}
            loading="lazy"
          />
          {game.isNew && <Chip label="New" color="secondary" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />}
          {game.isFeatured && <Chip label="Featured" color="primary" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />}
        </Box>
        <CardContent>
          <Typography variant="h6" noWrap>{game.name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{game.description}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <PeopleIcon fontSize="small" />
            <Typography variant="caption">{game.players}</Typography>
            <AccessTimeIcon fontSize="small" sx={{ ml: 2 }} />
            <Typography variant="caption">{game.duration}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {Array.from({ length: game.difficulty }).map((_, i) => (
                <StarIcon key={`${game.name}-star-${i}`} fontSize="small" sx={{ color: '#FFD700' }} />
              ))}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button variant="primary" onClick={onPlay}>Play Now</Button>
        <Button variant="secondary" onClick={onDetails}>View Details</Button>
        <IconButton onClick={onCreateLobby}><BookmarkBorderIcon /></IconButton>
        <IconButton><ShareIcon /></IconButton>
      </CardActions>
    </Card>
  );
}

export default GameCard; 