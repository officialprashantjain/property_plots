import axiosInstance from '../utils/axiosConfig';

const BASE = '/properties';

const propertyService = {
  /** Admin — fetch all (incl. drafts) with pagination */
  async getAll({ page = 1, limit = 20 } = {}) {
    const res = await axiosInstance.get(`${BASE}/admin/all`, {
      params: { page, limit },
    });
    return res.data; // { total, page, pages, properties }
  },

  /** Admin — fetch single property (incl. inactive) */
  async getById(id) {
    const res = await axiosInstance.get(`${BASE}/admin/${id}`);
    return res.data;
  },

  /** Admin — create property (supports multipart/form-data) */
  async create(formData) {
    const res = await axiosInstance.post(`${BASE}/admin`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin — update property (supports multipart/form-data) */
  async update(id, formData) {
    const res = await axiosInstance.put(`${BASE}/admin/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin — hard delete property (backend also cleans up files) */
  async remove(id) {
    const res = await axiosInstance.delete(`${BASE}/admin/${id}`);
    return res.data;
  },

  /** Admin — bulk upload via Excel (.xlsx) */
  async bulkUpload(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await axiosInstance.post(`${BASE}/admin/bulk-upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { message, count }
  },
};

export default propertyService;
