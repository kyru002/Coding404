import { defineStore } from 'pinia';
import { progressService } from '@/services/api';

export const useProgressStore = defineStore('progress', {
  state: () => ({
    userProgress: [],
    courseProgress: null,
    loading: false
  }),

  getters: {
    getLessonProgress: (state) => (lessonId) => {
      return state.userProgress.find(p => p.lesson._id === lessonId);
    },
    
    getCourseCompletion: (state) => {
      if (!state.courseProgress) return 0;
      return state.courseProgress.stats.completionRate;
    }
  },

  actions: {
    async fetchUserProgress(userId) {
      this.loading = true;
      try {
        const response = await progressService.getUserProgress(userId);
        this.userProgress = response.data.data;
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCourseProgress(userId, courseId) {
      this.loading = true;
      try {
        const response = await progressService.getCourseProgress(userId, courseId);
        this.courseProgress = response.data.data;
      } catch (error) {
        console.error('Error fetching course progress:', error);
      } finally {
        this.loading = false;
      }
    },

    async saveProgress(progressData) {
      try {
        const response = await progressService.saveProgress(progressData);
        
        // Actualizar progreso local
        const index = this.userProgress.findIndex(
          p => p.lesson === progressData.lessonId
        );
        
        if (index !== -1) {
          this.userProgress[index] = response.data.data;
        } else {
          this.userProgress.push(response.data.data);
        }
        
        return response.data.data;
      } catch (error) {
        console.error('Error saving progress:', error);
        throw error;
      }
    }
  }
});
