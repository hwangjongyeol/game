import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffcd73' },
    secondary: { main: '#d78839' },
    background: { default: '#0d0906', paper: '#1e140d' },
    text: { primary: '#f8ead4', secondary: '#c9ae88' }
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Segoe UI", "Pretendard", sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: 0.2
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(190, 135, 80, 0.3)',
          backgroundImage: 'linear-gradient(180deg, rgba(45, 30, 18, 0.9), rgba(25, 17, 11, 0.9))',
          backdropFilter: 'blur(7px)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(184, 127, 68, 0.32)',
          boxShadow: 'inset 0 1px 0 rgba(255, 223, 168, 0.07), 0 14px 32px rgba(0, 0, 0, 0.24)',
          transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
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
