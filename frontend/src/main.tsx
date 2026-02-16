import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4bc3ff' },
    secondary: { main: '#7dff9b' },
    background: { default: '#0a0f1a', paper: '#0f1726' }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Trebuchet MS", sans-serif',
    button: {
      fontWeight: 700
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
