import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, useTheme, useMediaQuery, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../atoms/NavBar';
import Footer from '../atoms/Footer';
import RightSidebar from './RightSidebar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};
const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.6 };

function PageLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(location.pathname);
  useEffect(() => { setNavValue(location.pathname); }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        >
          <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </Container>
        </motion.div>
        <RightSidebar />
      </Box>
      <Footer />
      {isMobile && (
        <Box position="fixed" bottom={0} left={0} right={0} zIndex={1200} sx={{boxShadow: 3}}>
          <BottomNavigation value={navValue} onChange={(e, newValue) => { setNavValue(newValue); navigate(newValue); }} showLabels>
            <BottomNavigationAction label="Ana Sayfa" value="/home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Sohbet" value="/chat" icon={<ChatIcon />} />
            <BottomNavigationAction label="Profil" value="/profile" icon={<PersonIcon />} />
            <BottomNavigationAction label="Ayarlar" value="/settings" icon={<SettingsIcon />} />
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}

export default PageLayout; 