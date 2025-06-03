import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH as SIDEBAR_DRAWER_WIDTH } from './Sidebar';
import { Outlet } from 'react-router-dom';
import usePresence from '../hooks/usePresence';

function Layout() {
  usePresence();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Bu hala kullanılabilir, örn. farklı drawer genişlikleri için
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobileOpen -> sidebarOpen olarak yeniden adlandırıldı

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen); // sidebarOpen'ı yönetir
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <Navbar onDrawerToggle={handleDrawerToggle} sx={{ flexShrink: 0 }} />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          <Outlet />
        </Box>

        <Sidebar
          open={sidebarOpen} // Her zaman sidebarOpen state'ine bağlı
          onClose={handleDrawerToggle} // Kapatma işlevi de aynı toggle'ı kullanır
          variant="temporary" // Her zaman temporary
          sx={{ flexShrink: 0, width: SIDEBAR_DRAWER_WIDTH }}
        />
      </Box>
    </Box>
  );
}

export default Layout;