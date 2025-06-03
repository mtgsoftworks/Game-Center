import React from 'react';
import { Tabs, Tab } from '@mui/material';

/**
 * LobbyTabs component
 * Props:
 *  - value: 'all' | 'event' | 'locked'
 *  - onChange: (newValue) => void
 */
const LobbyTabs = ({ value, onChange }) => (
  <Tabs
    value={value}
    onChange={(e, newValue) => onChange(newValue)}
    textColor="primary"
    indicatorColor="primary"
  >
    <Tab label="Tümü" value="all" />
    <Tab label="Etkinlik" value="event" />
    <Tab label="Şifreli" value="locked" />
  </Tabs>
);

export default LobbyTabs; 