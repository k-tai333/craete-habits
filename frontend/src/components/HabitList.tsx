import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  ButtonGroup,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { Habit, HabitRecord } from '../types';
import apiClient from '../api';

export default function HabitList() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<{ [key: number]: HabitRecord | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [lastFetchDate, setLastFetchDate] = useState<string>('');

  // 日本時間での現在の日付を取得する関数
  const getJapanDate = () => {
    const now = new Date();
    const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    return japanTime.toISOString().split('T')[0];
  };

  // 日付が変わったかどうかをチェックする関数
  const hasDateChanged = () => {
    const japanToday = getJapanDate();
    return japanToday !== lastFetchDate;
  };

  // データを取得する関数
  const fetchData = async () => {
    try {
      setLoading(true);

      const authResponse = await apiClient.get('/auth/me');
      const user = authResponse.data.user;

      if (!user) {
        navigate('/login');
        return;
      }

      // 習慣一覧を取得
      const habitsResponse = await apiClient.get(`/habits/${user.id}`);
      const habits = habitsResponse.data;
      setHabits(habits);

      const today = getJapanDate();

      const recordsPromises = habits.map((habit: Habit) =>
        apiClient.get(`/habits/${habit.id}/records?date=${today}`)
      );
      
      const recordsResponses = await Promise.allSettled(recordsPromises);

      const recordsMap = recordsResponses.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value.data) {
            const habitId = result.value.config.url?.split('/')[2];
            if (habitId && Object.keys(result.value.data).length > 0) {
                 acc[parseInt(habitId, 10)] = result.value.data;
            }
        }
        return acc;
      }, {} as { [key: number]: HabitRecord | null });
      
      setRecords(recordsMap);
      setLastFetchDate(today);
    } catch (err) {
      console.error('Error fetching data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // 初回マウント時とタブがアクティブになった時にデータを取得
  useEffect(() => {
    fetchData();

    // タブの表示状態が変更された時のイベントリスナー
    const handleVisibilityChange = () => {
      if (!document.hidden && hasDateChanged()) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  const handleStatusUpdate = async (habitId: number, achievementLevel: number) => {
    try {
      const today = getJapanDate();
      
      // 既に記録が存在する場合は更新をスキップ
      if (records[habitId]) {
        setSnackbarMessage('この日付の記録は既に登録されています');
        return;
      }

      const response = await apiClient.post(`/habits/${habitId}/records`, {
        date: today,
        achievement_level: achievementLevel
      });

      if (!response.data) {
        throw new Error('ステータスの更新に失敗しました');
      }

      setRecords(prev => ({
        ...prev,
        [habitId]: response.data
      }));
      setSnackbarMessage('記録を保存しました');
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
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
              fontSize: '1.1em'
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
              fontSize: '1.1em'
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
              fontSize: '1.1em'
            }}
          >
            ×
          </Typography>
        );
      default:
        return '';
    }
  };

  const renderStatusButtons = (habitId: number) => {
    const record = records[habitId];
    const isRecorded = !!record;

    const buttonColors = {
      1: '#4caf50', // 緑色
      2: '#ff9800', // オレンジ色
      3: '#f44336', // 赤色
    };

    return (
      <ButtonGroup size="small">
        {[1, 2, 3].map((level) => (
          <Tooltip
            key={level}
            title={isRecorded ? "今日の記録は既に登録されています" : ""}
          >
            <span>
              <Button
                variant={record?.achievement_level === level ? 'contained' : 'outlined'}
                onClick={() => handleStatusUpdate(habitId, level)}
                disabled={isRecorded}
                sx={{
                  minWidth: '40px',
                  px: 1,
                  color: record?.achievement_level === level ? 'white' : buttonColors[level as keyof typeof buttonColors],
                  borderColor: buttonColors[level as keyof typeof buttonColors],
                  backgroundColor: record?.achievement_level === level ? buttonColors[level as keyof typeof buttonColors] : 'transparent',
                  '&:hover': {
                    backgroundColor: record?.achievement_level === level ? buttonColors[level as keyof typeof buttonColors] : `${buttonColors[level as keyof typeof buttonColors]}20`,
                    borderColor: buttonColors[level as keyof typeof buttonColors],
                  },
                  '&:disabled': {
                    color: buttonColors[level as keyof typeof buttonColors],
                    borderColor: buttonColors[level as keyof typeof buttonColors],
                    opacity: 0.6,
                  }
                }}
              >
                {getAchievementSymbol(level)}
              </Button>
            </span>
          </Tooltip>
        ))}
      </ButtonGroup>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 日本時間でのフォーマット
  const formatJapaneseDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Tokyo'
    };
    return date.toLocaleDateString('ja-JP', options);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            習慣一覧
            <Typography variant="caption" sx={{ ml: 2 }}>
              (Total: {habits.length})
            </Typography>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {formatJapaneseDate(new Date())}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/habits/new')}
            color="primary"
          >
            習慣を登録
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="secondary"
          >
            ログアウト
          </Button>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <List sx={{ width: '100%' }}>
        {habits.map((habit) => {
          const record = records[habit.id];
          const isActive = !record;
          
          return (
            <Paper 
              key={habit.id} 
              sx={{ 
                mb: 2, 
                opacity: isActive ? 1 : 0.5,
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.02)' 
                } 
              }}
            >
              <ListItem
                sx={{ display: 'flex', justifyContent: 'space-between' }}
                secondaryAction={renderStatusButtons(habit.id)}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/habits/detail/${habit.id}`)}
                    >
                      {habit.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {habit.to_do || '説明なし'}
                    </Typography>
                  }
                />
              </ListItem>
            </Paper>
          );
        })}
      </List>
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  );
} 