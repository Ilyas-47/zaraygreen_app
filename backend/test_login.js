

async function main() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zaraygreen.com', password: 'admin123' })
  });
  const json = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', json);
}

main().catch(console.error);
