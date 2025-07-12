import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // クッキーの送受信を許可
});

// CSRFトークンを取得する関数
export const getCsrfToken = async () => {
  try {
    await axios.get('/sanctum/csrf-cookie', {
      baseURL: 'http://localhost:8000', // LaravelサーバーのURL
      withCredentials: true, 
    });
  } catch (error) {
    console.error('CSRF token fetch error:', error);
  }
};

export default apiClient; 