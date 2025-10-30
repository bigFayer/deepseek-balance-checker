const request = require('supertest');
const { app } = require('../server');

describe('服务器测试', () => {
  describe('健康检查接口', () => {
    test('应该返回健康状态', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String)
      });
    });
  });

  describe('余额查询接口', () => {
    test('缺少API密钥时应返回400错误', async () => {
      const response = await request(app)
        .post('/api/check-balance')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'API密钥是必需的',
        success: false
      });
    });

    test('无效的API密钥格式应返回400错误', async () => {
      const response = await request(app)
        .post('/api/check-balance')
        .send({ apiKey: 'invalid-key' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'API密钥必须以sk-开头',
        success: false
      });
    });

    test('过短的API密钥应返回400错误', async () => {
      const response = await request(app)
        .post('/api/check-balance')
        .send({ apiKey: 'sk-short' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'API密钥长度过短',
        success: false
      });
    });

    test('包含非法字符的API密钥应返回400错误', async () => {
      const response = await request(app)
        .post('/api/check-balance')
        .send({ apiKey: 'sk-invalid@character' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'API密钥包含非法字符',
        success: false
      });
    });
  });

  describe('API密钥验证函数', () => {
    const { validateAndSanitizeApiKey } = require('../server');

    test('应该验证有效的API密钥', () => {
      const result = validateAndSanitizeApiKey('sk-validapikey1234567890');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedKey).toBe('sk-validapikey1234567890');
      expect(result.error).toBeNull();
    });

    test('应该清理API密钥首尾空白', () => {
      const result = validateAndSanitizeApiKey('  sk-validapikey1234567890  ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedKey).toBe('sk-validapikey1234567890');
    });

    test('应该拒绝非字符串类型的输入', () => {
      const result = validateAndSanitizeApiKey(12345);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API密钥必须是字符串类型');
    });
  });

  describe('余额数据标准化函数', () => {
    const { normalizeBalance } = require('../server');

    test('应该标准化余额数据', () => {
      const mockData = {
        total_balance: 100.5,
        currency: 'CNY',
        total_grant: 200,
        total_used: 99.5
      };

      const result = normalizeBalance(mockData);
      expect(result.balance).toBe(100.5);
      expect(result.currency).toBe('CNY');
      expect(result.total_granted).toBe(200);
      expect(result.total_used).toBe(99.5);
    });

    test('应该处理balance_infos数组', () => {
      const mockData = {
        balance_infos: [{
          total_balance: 150,
          currency: 'CNY',
          grant_balance: 300,
          used_balance: 150
        }]
      };

      const result = normalizeBalance(mockData);
      expect(result.balance).toBe(150);
      expect(result.currency).toBe('CNY');
    });
  });
});
