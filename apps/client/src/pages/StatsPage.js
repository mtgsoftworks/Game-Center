import React, { useState, useEffect, useContext } from 'react';
import { Typography, Box, Tabs, Tab, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getTombalaStats } from '../services/tombalaService';
import { subscribeLeaderboard } from '../services/leaderboardService';
import { fetchAggregateStats } from '../services/statsService';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Firestore'dan çekilecek veriler için state
const StatsPage = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [tombalaStats, setTombalaStats] = useState([]);
  const [game2048Stats, setGame2048Stats] = useState([]);
  const [tombalaLeaderboard, setTombalaLeaderboard] = useState([]);
  const [loadingTombala, setLoadingTombala] = useState(false);
  const [loading2048, setLoading2048] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tombalaAgg, setTombalaAgg] = useState(null);
  const [game2048Agg, setGame2048Agg] = useState(null);
  const [loadingAgg, setLoadingAgg] = useState(false);

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Oyunlar
      const gamesSnap = await getDocs(collection(db, 'games'));
      const gamesData = gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
      // Kullanıcılar
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      // Profil (achievements için)
      if (user?.uid) {
        const profSnap = await getDoc(doc(db, 'users', user.uid));
        if (profSnap.exists()) setProfile(profSnap.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Kullanıcıya ait Tombala ve 2048 istatistiklerini çek
  useEffect(() => {
    if (user?.uid) {
      setLoadingTombala(true);
      getTombalaStats(user.uid)
        .then(data => setTombalaStats(data))
        .catch(err => console.error('Tombala istatistik yüklemede hata:', err))
        .finally(() => setLoadingTombala(false));
      setLoading2048(true);
      getDocs(query(collection(db, 'game2048Stats'), where('userId', '==', user.uid)))
        .then(snap => setGame2048Stats(snap.docs.map(d => d.data())))
        .catch(err => console.error('2048 istatistik yüklemede hata:', err))
        .finally(() => setLoading2048(false));
    }
  }, [user]);

  // Aggregate stats fetch
  useEffect(() => {
    if (user?.uid && fromDate && toDate) {
      setLoadingAgg(true);
      const fromISO = fromDate.toISOString();
      const toISO = toDate.toISOString();
      Promise.all([
        fetchAggregateStats('tombala', fromISO, toISO),
        fetchAggregateStats('2048', fromISO, toISO),
      ])
        .then(([a1, a2]) => {
          setTombalaAgg(a1);
          setGame2048Agg(a2);
        })
        .catch(err => console.error('Aggregate çekme hatası:', err))
        .finally(() => setLoadingAgg(false));
    }
  }, [user, fromDate, toDate]);

  // Gerçek zamanlı Tombala liderlik tablosuna abonelik
  useEffect(() => {
    setLoadingLeaderboard(true);
    const unsubscribe = subscribeLeaderboard('tombala', data => {
      setTombalaLeaderboard(data);
      setLoadingLeaderboard(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  // Overview hesaplamaları
  const totalGames = games.length;
  const totalUsers = users.length;
  const avgXP = Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / (totalUsers || 1));
  const avgLevel = Math.round(users.reduce((s, u) => s + (u.level || 0), 0) / (totalUsers || 1));

  // En çok oynanan oyun: stats.totalPlays değerine göre
  const favoriteGame = games.length > 0
    ? games.reduce((best, g) => {
        const bestPlays = best.stats?.totalPlays ?? 0;
        const currPlays = g.stats?.totalPlays ?? 0;
        return currPlays > bestPlays ? g : best;
      }, games[0])
    : null;

  // ByGame: kategori (genre) bazlı sayım
  const genreCounts = {};
  games.forEach(g => (g.genre || []).forEach(gn => genreCounts[gn] = (genreCounts[gn] || 0) + 1));
  const genreData = Object.entries(genreCounts).map(([genre, count]) => ({ genre, count }));

  // Achievements: basit kullanıcı başarıları
  const achievements = [];
  if (profile) {
    if (profile.createdAt) achievements.push({ id: 'registered', title: t('statsPage.achievements.registered', 'Kayıt Oldu') });
    if ((profile.gamesPlayed || 0) >= 1) achievements.push({ id: 'firstGame', title: t('statsPage.achievements.firstGame', 'İlk Oyunu Oynadı') });
    if ((profile.gamesPlayed || 0) >= 10) achievements.push({ id: 'tenGames', title: t('statsPage.achievements.tenGames', '10 Oyun Oynadı') });
    if ((profile.level || 0) >= 5) achievements.push({ id: 'level5', title: t('statsPage.achievements.level5', 'Seviye 5 Goturdu') });
  }

  // Çeviri anahtarları (daha sonra i18n dosyalarına eklenecek)
  const tabLabels = {
    overview: t('statsPage.tabs.overview', 'Genel Bakış'),
    byGame: t('statsPage.tabs.byGame', 'Oyun Bazlı İstatistikler'),
    leaderboards: t('statsPage.tabs.leaderboards', 'Liderlik Tabloları'),
    achievements: t('statsPage.tabs.achievements', 'Başarımlar'),
  };

  // Sekme paneli için yardımcı bileşen
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`stats-tabpanel-${index}`}
        aria-labelledby={`stats-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  // Erişilebilirlik için a11yProps fonksiyonu
  function a11yProps(index) {
    return {
      id: `stats-tab-${index}`,
      'aria-controls': `stats-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
      {/* Date picker aralığı */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker label="Başlangıç" value={fromDate} onChange={setFromDate} renderInput={(params) => <TextField {...params} size="small" />} />
          <DatePicker label="Bitiş" value={toDate} onChange={setToDate} renderInput={(params) => <TextField {...params} size="small" />} />
        </LocalizationProvider>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 4 }, textAlign: { xs: 'center', md: 'left' } }}>
        {t('statisticsPage', 'İstatistikler')}
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="İstatistikler sekmeleri"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={tabLabels.overview} {...a11yProps(0)} />
            <Tab label={tabLabels.byGame} {...a11yProps(1)} />
            <Tab label={tabLabels.leaderboards} {...a11yProps(2)} />
            <Tab label={tabLabels.achievements} {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6">{tabLabels.overview}</Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{totalGames}</Typography>
                  <Typography>{t('statsPage.overview.totalGames', 'Toplam Oyun')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{avgXP}</Typography>
                  <Typography>{t('statsPage.overview.avgXP', 'Ortalama XP')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{avgLevel}</Typography>
                  <Typography>{t('statsPage.overview.avgLevel', 'Ortalama Seviye')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{favoriteGame?.name || '-'}</Typography>
                  <Typography>{t('statsPage.overview.favoriteGame', 'En Çok Oynanan Oyun')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Oyun Bazlı İstatistikler: Oyun Sayısı ve Oynama Süresi */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">{t('statsPage.overview.gameSpecific', 'Oyun Bazlı Oynama Süreleri')}</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{tombalaStats.length}</Typography>
                    <Typography>{t('statsPage.overview.tombalaGames', 'Tombala Oyun Sayısı')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{Math.floor(tombalaStats.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600)}h {Math.floor((tombalaStats.reduce((sum, s) => sum + (s.duration || 0), 0) % 3600) / 60)}m</Typography>
                    <Typography>{t('statsPage.overview.tombalaDuration', 'Tombala Oynama Süresi')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{game2048Stats.length}</Typography>
                    <Typography>{t('statsPage.overview.game2048Games', '2048 Oyun Sayısı')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{Math.floor(game2048Stats.reduce((sum, s) => sum + ((s.duration || 0) / 1000), 0) / 3600)}h {Math.floor((game2048Stats.reduce((sum, s) => sum + ((s.duration || 0) / 1000), 0) % 3600) / 60)}m</Typography>
                    <Typography>{t('statsPage.overview.game2048Duration', '2048 Oynama Süresi')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          {/* Aggregate Metrik Kartları */}
          {loadingAgg ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (fromDate && toDate && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} md={2}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography>{tombalaAgg?.avgScore?.toFixed(1) || '-'}</Typography>
                  <Typography>Ort. Tombala Skoru</Typography>
                </CardContent></Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography>{tombalaAgg?.minScore || '-'}</Typography>
                  <Typography>Min Tombala Skoru</Typography>
                </CardContent></Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography>{tombalaAgg?.maxScore || '-'}</Typography>
                  <Typography>Max Tombala Skoru</Typography>
                </CardContent></Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography>{(tombalaAgg?.avgDuration/60)?.toFixed(1) || '-'}m</Typography>
                  <Typography>Ort. Tombala Süresi</Typography>
                </CardContent></Card>
              </Grid>
              {/* 2048 metrikleri */}
              <Grid item xs={6} md={2}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography>{game2048Agg?.avgScore?.toFixed(1) || '-'}</Typography>
                  <Typography>Ort. 2048 Skoru</Typography>
                </CardContent></Card>
              </Grid>
            </Grid>
          ))}
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6">{tabLabels.byGame}</Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={genreData}>
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3f51b5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6">{tabLabels.leaderboards}</Typography>
          {loadingLeaderboard ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('statsPage.leaderboards.rank', 'Sıra')}</TableCell>
                    <TableCell>{t('statsPage.leaderboards.user', 'Kullanıcı')}</TableCell>
                    <TableCell>{t('statsPage.leaderboards.score', 'Skor')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tombalaLeaderboard.map((u, index) => (
                    <TableRow key={u.userId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6">{tabLabels.achievements}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {achievements.map(ach => (
              <Chip key={ach.id} label={ach.title} />
            ))}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default StatsPage; 