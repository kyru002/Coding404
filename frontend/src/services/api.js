import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData)
};

// Servicios de cursos
export const courseService = {
  getAll: () => apiClient.get('/courses'),
  getById: (id) => apiClient.get(`/courses/${id}`),
  getLessons: (courseId) => apiClient.get(`/courses/${courseId}/lessons`)
};

// Servicios de lecciones
export const lessonService = {
  getById: (id) => apiClient.get(`/lessons/${id}`),
  getExercises: (lessonId) => apiClient.get(`/lessons/${lessonId}/exercises`)
};

// Servicios de ejercicios
export const exerciseService = {
  getById: (id) => apiClient.get(`/exercises/${id}`),
  checkAnswer: (exerciseId, answer) => apiClient.post(`/exercises/${exerciseId}/check`, { answer })
};

// Servicios de progreso
export const progressService = {
  getUserProgress: (userId) => apiClient.get(`/progress/user/${userId}`),
  getCourseProgress: (userId, courseId) => apiClient.get(`/progress/user/${userId}/course/${courseId}`),
  saveProgress: (progressData) => apiClient.post('/progress', progressData)
};

export default apiClient;
