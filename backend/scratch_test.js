const http = require('http');

http.get('http://localhost:5001/api/products?limit=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const products = parsed.data || parsed;
      console.log('Total products:', products.length);
      if (products.length > 0) {
        const p = products[0];
        console.log('Latest product name:', p.name);
        console.log('Images type:', typeof p.images, Array.isArray(p.images) ? 'Array' : 'Not array');
        if (Array.isArray(p.images)) {
           console.log('Images array length:', p.images.length);
           console.log('First image type:', typeof p.images[0]);
           if (typeof p.images[0] === 'string') {
             console.log('First image prefix:', p.images[0].substring(0, 50));
             console.log('First image total length:', p.images[0].length);
           }
        } else {
           console.log('Images value:', p.images);
        }
      }
    } catch (e) {
      console.error('Error parsing:', e);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
}).on('error', err => console.error(err));
