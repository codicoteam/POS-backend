const bcrypt = require('bcryptjs');

const password = 'Admin@1234';

bcrypt.hash(password, 10).then(hash => {
  console.log('Correct hash for "Admin@1234":');
  console.log(hash);
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
