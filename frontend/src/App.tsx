import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';
import Login from './components/Login';
import UserRegistration from './components/UserRegistration';
import HabitList from './components/HabitList';
import HabitRegistration from './components/HabitRegistration';
import HabitDetail from './components/HabitDetail';
import HabitEdit from './components/HabitEdit';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#2196f3',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <Router>
          <Container sx={{ py: 4 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<UserRegistration />} />
              <Route path="/habits" element={<HabitList />} />
              <Route path="/habits/detail/:id" element={<HabitDetail />} />
              <Route path="/habits/new" element={<HabitRegistration />} />
              <Route path="/habits/edit/:id" element={<HabitEdit />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </Container>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
