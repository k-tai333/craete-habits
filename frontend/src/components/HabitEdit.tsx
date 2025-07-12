import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../api';

export default function HabitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [toDo, setToDo] = useState('');

  useEffect(() => {
    const fetchHabit = async () => {
      if (!id) {
        setError('習慣IDが指定されていません');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.get(`/habits/detail/${id}`);
        setTitle(response.data.habit.title || '');
        setToDo(response.data.habit.to_do || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchHabit();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.put(`/habits/${id}`, {
        title,
        to_do: toDo,
      });
      navigate(`/habits/detail/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || '予期せぬエラーが発生しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/habits/detail/${id}`)}
          sx={{ mr: 2 }}
        >
          戻る
        </Button>
        <Typography variant="h5" component="h1">
          習慣を編集
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="習慣のタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        />
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/habits/detail/${id}`)}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
          >
            更新
          </Button>
        </Box>
      </Box>
    </Paper>
  );
} 