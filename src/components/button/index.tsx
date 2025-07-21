import React, { useState } from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';

const tabs = ['CLUBS', 'Football Jerseys', 'Adicolor'];

const TabButtons: React.FC = () => {
  const [selected, setSelected] = useState<string>('CLUBS');

  return (
    <ButtonGroup variant="outlined" sx={{ gap: 1 }}>
      {tabs.map(tab => {
        const isSelected = tab === selected;
        return (
          <Button
            key={tab}
            onClick={() => setSelected(tab)}
            variant={isSelected ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: isSelected ? '#000' : 'transparent',
              color: isSelected ? '#fff' : '#000',
              borderColor: '#000',
              '&:hover': {
                backgroundColor: isSelected ? '#333' : 'rgba(0,0,0,0.04)',
                borderColor: '#000',
              },
              fontWeight: isSelected ? '600' : '400',
            }}
          >
            {tab}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

const App: React.FC = () => {
  return (
    <Box sx={{ p: 2.5 }}>
      <TabButtons />
    </Box>
  );
};

export default App;
