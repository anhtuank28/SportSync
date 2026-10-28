import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || 'redispassword';

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  lazyConnect: true,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✅ Kết nối Redis 7 thành công (Distributed Lock ready)');
});

redis.on('error', (err) => {
  console.warn('⚠️ Cảnh báo Redis (có thể Redis chưa khởi động qua docker):', err.message);
});

export default redis;
