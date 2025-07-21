import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${theme === THEME.LIGHT ? 'dark' : 'light'} theme`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {theme === THEME.LIGHT ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
