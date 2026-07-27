const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 'caa0e0ec-0170-47cb-ae53-07303a08dbfd', role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
console.log(token);
