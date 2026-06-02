import axiosInstance from '../utils/axiosConfig';

const BASE = '/dashboard';

const dashboardService = {
  async getStats() {
    const res = await axiosInstance.get(`${BASE}/stats`);
    return res.data;
  }
};

export default dashboardService;
