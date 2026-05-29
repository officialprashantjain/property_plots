import axiosInstance from '../utils/axiosConfig';

const searchOptionService = {
  // Get all search options (grouped by category)
  getAll: async () => {
    const response = await axiosInstance.get('/search-options');
    return response.data;
  },

  // Create a new option
  create: async (data) => {
    const response = await axiosInstance.post('/search-options', data);
    return response.data;
  },

  // Update an option
  update: async (id, data) => {
    const response = await axiosInstance.put(`/search-options/${id}`, data);
    return response.data;
  },

  // Delete an option
  delete: async (id) => {
    const response = await axiosInstance.delete(`/search-options/${id}`);
    return response.data;
  }
};

export default searchOptionService;
