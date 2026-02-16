import { defineStore } from 'pinia';
import { courseService } from '@/services/api';

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [],
    currentCourse: null,
    loading: false,
    error: null
  }),

  getters: {
    allCourses: (state) => state.courses,
    getCourseById: (state) => (id) => {
      return state.courses.find(course => course._id === id);
    }
  },

  actions: {
    async fetchCourses() {
      this.loading = true;
      try {
        const response = await courseService.getAll();
        this.courses = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCourseById(id) {
      this.loading = true;
      try {
        const response = await courseService.getById(id);
        this.currentCourse = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
