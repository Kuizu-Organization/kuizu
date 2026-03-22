import api from './auth';

/**
 * Get paginated user statistics.
 * @param {number} page - Page number (0-indexed).
 * @param {number} size - Number of items per page.
 * @returns {Promise<Object>} - Contains an array of user statistics and pagination info.
 */
export const getUserStatistics = async (page = 0, size = 10) => {
    const response = await api.get('/admin/statistics/users', {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get paginated flashcard set statistics.
 * @param {number} page - Page number (0-indexed).
 * @param {number} size - Number of items per page.
 * @returns {Promise<Object>} - Contains an array of flashcard set statistics and pagination info.
 */
export const getFlashcardSetStatistics = async (page = 0, size = 10) => {
    const response = await api.get('/admin/statistics/flashcards', {
        params: { page, size }
    });
    return response.data;
};

export const getClassStatistics = async (page = 0, size = 10) => {
    const response = await api.get('/admin/statistics/classes', {
        params: { page, size }
    });
    return response.data;
};

/**
 * Get dashboard summary metrics and chart data.
 * @param {number} days - Number of days for the chart data
 */
export const getDashboardSummary = async (days = 7) => {
    const response = await api.get('/admin/statistics/summary', { params: { days } });
    return response.data;
};

export const getFlashcardSummary = async (days = 7) => {
    const response = await api.get('/admin/statistics/flashcards/summary', { params: { days } });
    return response.data;
};

export const getClassSummary = async (days = 7) => {
    const response = await api.get('/admin/statistics/classes/summary', { params: { days } });
    return response.data;
};

/**
 * Seed mock data.
 */
export const seedMockData = async () => {
    const response = await api.post('/admin/dev/seed-data');
    return response.data;
};
