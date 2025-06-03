import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Grid, CircularProgress } from '@mui/material';
import FilterBar from './FilterBar';
import GameCard from '../molecules/GameCard';
import GameCardSkeleton from '../molecules/GameCardSkeleton';
import { getGames } from '../../services/gameService';
import useDebounce from '../../hooks/useDebounce';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const PAGE_SIZE = 9;

const GameList = () => {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sort, setSort] = useState('popularity');
  const [category, setCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await getGames();
      setGames(data);
    } catch (e) {
      console.error('Oyun verisi alınamadı:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = games;
    if (debouncedSearch) {
      result = result.filter(g => g.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (category) {
      result = result.filter(g => g.category === category);
    }
    switch (sort) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'alphabetical':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return result;
  }, [games, debouncedSearch, category, sort]);

  const visibleGames = filtered.slice(0, visibleCount);
  const loadMore = () => {
    if (visibleCount < filtered.length) {
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  };
  useInfiniteScroll(loaderRef, loadMore);

  return (
    <Box>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        category={category}
        onCategoryChange={setCategory}
      />
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <GameCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {visibleGames.map(game => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <GameCard
                game={game}
                onPlay={() => {}}
                onDetails={() => {}}
                onCreateLobby={() => {}}
              />
            </Grid>
          ))}
          {visibleCount < filtered.length && (
            <div ref={loaderRef} style={{ height: 20, width: '100%' }} />
          )}
        </Grid>
      )}
    </Box>
  );
};

export default GameList; 