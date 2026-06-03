import axiosInstance from '../utils/axiosConfig';

const BASE = '/agents';

const agentService = {
  /** Admin — fetch all with pagination */
  async getAll({ page = 1, limit = 20, keyword = '' } = {}) {
    const res = await axiosInstance.get(`${BASE}/admin/all`, {
      params: { page, limit, keyword },
    });
    return res.data; // { total, page, pages, agents }
  },

  /** Admin — fetch single agent */
  async getById(id) {
    const res = await axiosInstance.get(`${BASE}/admin/${id}`);
    return res.data;
  },

  /** Admin — create agent (supports multipart/form-data) */
  async create(formData) {
    const res = await axiosInstance.post(`${BASE}/admin`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin — update agent (supports multipart/form-data) */
  async update(id, formData) {
    const res = await axiosInstance.put(`${BASE}/admin/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin — delete agent */
  async remove(id) {
    const res = await axiosInstance.delete(`${BASE}/admin/${id}`);
    return res.data;
  },
};

export default agentService;
