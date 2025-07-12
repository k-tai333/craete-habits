import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api';
import { Habit, HabitRecord } from '../types';

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ habit: Habit; records: HabitRecord[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchHabit();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await apiClient.delete(`/habits/${id}`);
      setDeleteDialogOpen(false);
      navigate('/habits');
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const getAchievementSymbol = (level: number) => {
    switch (level) {
      case 1:
        return (
          <Typography 
            component="span" 
            sx={{ 
              color: '#4caf50', 
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}
          >
            ○
          </Typography>
        );
      case 2:
        return (
          <Typography 
            component="span" 
            sx={{ 
              color: '#ff9800', 
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}
          >
            △
          </Typography>
        );
      case 3:
        return (
          <Typography 
            component="span" 
            sx={{ 
              color: '#f44336', 
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}
          >
            ×
          </Typography>
        );
      default:
        return (
          <Typography 
            component="span" 
            sx={{ 
              color: '#9e9e9e',
              fontSize: '1.2em'
            }}
          >
            -
          </Typography>
        );
    }
  };

  const generateCalendarGrid = () => {
    if (!data) return [];

    const days = [];
    const today = new Date();
    let currentMonth = -1;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const month = date.getMonth();
      
      // 日付をYYYY-MM-DD形式に変換
      const year = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      
      // レコードを検索（日付の先頭部分で比較）
      const record = data.records.find(r => r.date.startsWith(dateStr));

      // 月が変わったら月の行を追加
      if (month !== currentMonth) {
        currentMonth = month;
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                          '7月', '8月', '9月', '10月', '11月', '12月'];
        days.push(
          <Box key={`month-${month}`} sx={{ width: '100%', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {monthNames[month]}
            </Typography>
          </Box>
        );
      }

      days.push(
        <Box key={dateStr} sx={{ width: 'calc(100% / 7)', p: 0.5 }}>
          <Paper
            sx={{
              p: 1,
              textAlign: 'center',
              backgroundColor: record ? '#f5f5f5' : 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
              {date.getDate()}日
            </Typography>
            <Typography>
              {record ? getAchievementSymbol(record.achievement_level) : '-'}
            </Typography>
          </Paper>
        </Box>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/habits')}
          sx={{ mb: 3 }}
        >
          戻る
        </Button>
        <Alert severity="error">
          {error || '習慣が見つかりませんでした。'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/habits')}
        >
          戻る
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => navigate(`/habits/edit/${id}`)}
          >
            編集
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            削除
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {data.habit.title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {data.habit.to_do}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          作成日: {(() => {
            try {
              const date = new Date(data.habit.created_at || data.habit.createdAt);
              if (isNaN(date.getTime())) {
                return '日付不明';
              }
              return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            } catch (error) {
              return '日付不明';
            }
          })()}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          過去30日の記録
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          '& > *': {
            flexBasis: 'calc(14.28% - 8px)',
          }
        }}>
          {generateCalendarGrid()}
        </Box>
      </Paper>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          習慣の削除
        </DialogTitle>
        <DialogContent>
          <Typography>
            「{data.habit.title}」を削除しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            この操作は取り消すことができません。関連する記録もすべて削除されます。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 