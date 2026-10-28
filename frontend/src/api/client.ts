import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor bóc tách data chuẩn RESTful
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage =
      error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
