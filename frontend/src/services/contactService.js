import axiosInstance from '../utils/axiosConfig';

const BASE = '/contacts';

const contactService = {
  /** Admin — fetch all inquiries with pagination */
  async getAll({ page = 1, limit = 20, isRead, status, keyword } = {}) {
    const res = await axiosInstance.get(`${BASE}/admin/all`, {
      params: { page, limit, isRead, status, keyword },
    });
    return res.data; // { total, page, pages, contacts }
  },

  /** Admin — fetch single inquiry (automatically marks as read) */
  async getById(id) {
    const res = await axiosInstance.get(`${BASE}/admin/${id}`);
    return res.data;
  },

  /** Admin — update inquiry status */
  async updateStatus(id, status) {
    const res = await axiosInstance.put(`${BASE}/admin/${id}/status`, { status });
    return res.data;
  },

  /** Admin — delete inquiry */
  async remove(id) {
    const res = await axiosInstance.delete(`${BASE}/admin/${id}`);
    return res.data;
  },

  /** Admin — get unread inquiries count */
  async getUnreadCount() {
    const res = await axiosInstance.get(`${BASE}/admin/unread-count`);
    return res.data; // { count }
  },

  /** Admin — mark all as read */
  async markAllRead() {
    const res = await axiosInstance.put(`${BASE}/admin/mark-all-read`);
    return res.data;
  },

  /** Public & Admin — get contact page config */
  async getConfig() {
    const res = await axiosInstance.get(`${BASE}/config`);
    return res.data;
  },

  /** Admin — update contact page config (supports multipart/form-data for image) */
  async updateConfig(formData) {
    const res = await axiosInstance.put(`${BASE}/admin/config`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default contactService;
