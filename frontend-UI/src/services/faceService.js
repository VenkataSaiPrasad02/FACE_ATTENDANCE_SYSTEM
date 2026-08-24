import api from './api';

const faceService = {
  /*
   * Registration runs face detection + embedding on the Python service and
   * can legitimately take longer than the global 30 s axios timeout on
   * slower machines or on the first (cold) model inference. Override the
   * timeout for this request only — every other API keeps the default.
   */
  registerFace: (studentId, imageBase64) =>
    api
      .post('/api/face/register', { studentId, imageBase64 }, { timeout: 120000 })
      .then((r) => r.data),
};

export default faceService;
