import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 1000 }, // Ramp up to 1000 users
    { duration: '3m', target: 5000 }, // Spike to 5000 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  const payload = JSON.stringify({
    email: 'admin@oakridge.edu',
    password: 'password123',
    subdomain: 'oakridge'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Host': 'oakridge.localhost:5173'
    },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(res, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('data.token') !== undefined,
  });

  sleep(1);
}
