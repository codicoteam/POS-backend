const bcrypt = require('bcryptjs');

const testHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihC';
const testPassword = 'Admin@1234';

bcrypt.compare(testPassword, testHash).then(result => {
  console.log('Password match:', result);
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
