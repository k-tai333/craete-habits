import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import apiClient, { getCsrfToken } from '../api';

export default function UserRegistration() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await getCsrfToken();
      
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });

      // 登録成功後は自動でログイン状態になるので、習慣一覧へ
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // apiClientのデフォルトヘッダーを更新して、今後のリクエストでトークンを使用する
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate('/habits');
      } else {
        setError('登録に成功しましたが、ログインできませんでした。');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.response?.data?.message || 'ユーザー登録に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        ユーザー登録
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          helperText="8文字以上で入力してください"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? '登録中...' : '登録'}
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            既にアカウントをお持ちの方は{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              ログイン
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
} 