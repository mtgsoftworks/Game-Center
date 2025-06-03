import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Stack } from '@mui/material';

const categories = ['Card Games', 'Board Games', 'Word Games'];

/**
 * FilterBar component for game listing
 * Props:
 *  - search: current search term
 *  - onSearchChange: (value) => void
 *  - sort: current sort key
 *  - onSortChange: (value) => void
 *  - category: selected category
 *  - onCategoryChange: (value) => void
 */
const FilterBar = ({ search, onSearchChange, sort, onSortChange, category, onCategoryChange }) => (
  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        label="Ara"
        inputProps={{ 'aria-label': 'Oyun arama' }}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Sırala</InputLabel>
        <Select value={sort} label="Sırala" onChange={e => onSortChange(e.target.value)} inputProps={{ 'aria-label': 'Sırala seçenekleri' }}>
          <MenuItem value="popularity">Popülerlik</MenuItem>
          <MenuItem value="newest">Yeniler</MenuItem>
          <MenuItem value="alphabetical">Alfabetik</MenuItem>
        </Select>
      </FormControl>
    </Box>
    <Stack direction="row" spacing={1}>
      {categories.map(cat => (
        <Chip
          key={cat}
          label={cat}
          clickable
          color={category === cat ? 'primary' : 'default'}
          onClick={() => onCategoryChange(category === cat ? '' : cat)}
          aria-pressed={category === cat}
          role="button"
          tabIndex={0}
          onKeyPress={e => { if (e.key === 'Enter') onCategoryChange(category === cat ? '' : cat); }}
        />
      ))}
    </Stack>
  </Box>
);

export default FilterBar; 