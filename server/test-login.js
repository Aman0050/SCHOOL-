const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', {
  email: 'student@greenwood.edu',
  password: 'password123'
}, {
  headers: { 'X-Tenant-Subdomain': 'greenwood' }
}).then(res => {
  console.log("SUCCESS:", res.data);
}).catch(err => {
  console.error("ERROR:", err.response ? err.response.data : err.message);
});
