const fs = require('fs');
const html = fs.readFileSync('ngo-dashboard.html', 'utf8');
const start = html.indexOf('function normalizeRequest(');
const end = html.indexOf('\n}', start) + 2;
if (start < 0 || end < 0) {
  console.error('function not found');
  process.exit(1);
}
const src = html.slice(start, end);
const fn = new Function('return ' + src)();
const sample = { id: 'x', status: 'accepted', donations: { address: 'Test Address', latitude: 12.34, longitude: 56.78, contact_phone: '12345' } };
console.log(JSON.stringify(fn(sample), null, 2));
