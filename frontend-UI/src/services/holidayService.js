import api from './api';

const holidayService = {
  getHolidays: async (startDate, endDate) => {
    const response = await api.get('/api/holidays', {
      params: {
        startDate,
        endDate
      }
    });

    return response.data;
  },

  createHoliday: async (holidayDate, reason) => {
    const response = await api.post('/api/holidays', {
      holidayDate,
      reason
    });

    return response.data;
  },

  deleteHoliday: async (id) => {
    const response = await api.delete(
      `/api/holidays/${id}`
    );

    return response.data;
  }
};

export default holidayService;