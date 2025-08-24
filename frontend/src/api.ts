import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // クッキーの送受信を許可
});

// CSRFトークンを取得する関数（セッションベース認証用）
export const getCsrfToken = async () => {
  try {
    // セッションベース認証では、ログイン時に自動的にCSRFトークンが設定される
    // 事前のCSRFトークン取得は不要
    console.log('CSRF token not required for session-based authentication');
  } catch (error) {
    console.error('CSRF token fetch error:', error);
  }
};

export default apiClient; 