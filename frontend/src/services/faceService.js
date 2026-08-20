import api from './api';

const faceService = {
  registerFace: (studentId, imageBase64) =>
    api
      .post('/api/face/register', { studentId, imageBase64 })
      .then((r) => r.data),
};

export default faceService;
