import request from 'supertest';
import app from '../server';

describe('ISO/IEC 25010 - API Gateway Integration Tests', () => {
  test('GET /api/v1/health trả về 200 OK và định dạng RESTful chuẩn', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.message).toContain('SportSync (CourtSync OS) API Gateway');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('version');
  });

  test('Validation Middleware bắt lỗi khi query param không hợp lệ', async () => {
    // Ngày không đúng format YYYY-MM-DD
    const response = await request(app).get(
      '/api/v1/owner/venues/cum-san-cau-long-cau-giay/dashboard?date=invalid-date'
    );

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('Validation Error');
  });
});
