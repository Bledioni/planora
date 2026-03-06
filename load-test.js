import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 100 },   // ramp up to 100
        { duration: '1m',  target: 500 },   // ramp up to 500
        { duration: '1m',  target: 1000 },  // ramp up to 1000
        { duration: '2m',  target: 1000 },  // hold 1000 users for 2 min
        { duration: '30s', target: 0 },     // ramp down
    ],
};

export default function () {
    // Test booking endpoint
    const payload = JSON.stringify({
    business_id: 3,
    employee_id: 8,
    service_ids: [4],
    start_time: '2026-03-05 12:30',
    client_name: 'Test User',
    client_phone: '123456789',
    client_email: 'test@test.com',
});

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(
        'https://api.planorabook.com/api/public/appointments/create',
        payload,
        params
    );

    check(res, {
        'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
        'response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}