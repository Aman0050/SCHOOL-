import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1000 }, // Ramp up to 1000 users
    { duration: '1m', target: 1000 }, // Hold 1000 users
    { duration: '30s', target: 10000 }, // Spike to 10000 users
    { duration: '1m', target: 10000 }, // Hold 10000 users
    { duration: '30s', target: 50000 }, // Enterprise Stress Test
    { duration: '1m', target: 50000 }, // Hold 50000 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  // 1. Simulate Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@school.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).data.token !== undefined,
  });

  const token = JSON.parse(loginRes.body).data?.token;
  if (!token) return;

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // 2. Simulate Fetching Dashboard
  const dashboardRes = http.get(`${BASE_URL}/analytics/dashboard`, authHeaders);
  check(dashboardRes, {
    'dashboard loaded': (r) => r.status === 200,
    'dashboard fast': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // 3. Simulate Fetching Students
  const studentsRes = http.get(`${BASE_URL}/students?cursor=`, authHeaders);
  check(studentsRes, {
    'students loaded': (r) => r.status === 200,
  });

  sleep(2);
}
