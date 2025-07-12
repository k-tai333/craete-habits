import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import apiClient from '../api';

export default function HabitRegistration() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [toDo, setToDo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/habits', {
        title,
        to_do: toDo,
      });

      navigate('/habits');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '習慣の登録に失敗しました';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        新しい習慣を登録
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="習慣のタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="詳細"
          multiline
          rows={4}
          value={toDo}
          onChange={(e) => setToDo(e.target.value)}
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={() => navigate('/habits')}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録'}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 