const fs = require('fs');
const axios = require('axios');

// Read JSON file
const data = JSON.parse(fs.readFileSync('network_data.json', 'utf-8'));

// Send POST request
axios.post('http://localhost:3000/api/usage', data)
  .then(response => {
    console.log(response.status, response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
