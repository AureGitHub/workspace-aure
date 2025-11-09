// Test script para verificar las nuevas rutas con prefijo
const BASE_URL = 'http://localhost:3001/app-alquiler';

async function testRoutes() {
  console.log('🧪 Testeando rutas con prefijo /app-alquiler/...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: API Info
  try {
    console.log('\n2️⃣ Testing API info...');
    const infoResponse = await fetch(`${BASE_URL}/api/info`);
    const infoData = await infoResponse.json();
    console.log('✅ API Info:', infoData.name, infoData.version);
    console.log('📋 Endpoints disponibles:');
    console.log('   - Health:', infoData.endpoints.health);
    console.log('   - DB Health:', infoData.endpoints.database_health);
    console.log('   - Login:', infoData.endpoints.auth.login);
  } catch (error) {
    console.log('❌ API info failed:', error.message);
  }

  // Test 3: Database Health
  try {
    console.log('\n3️⃣ Testing database health...');
    const dbResponse = await fetch(`${BASE_URL}/health/db`);
    const dbData = await dbResponse.json();
    console.log('✅ Database:', dbData.status);
  } catch (error) {
    console.log('❌ Database health failed:', error.message);
  }

  // Test 4: Auth Login (with test credentials)
  try {
    console.log('\n4️⃣ Testing auth login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.success ? 'YES' : 'NO');
      if (loginData.data?.user) {
        console.log('👤 User:', loginData.data.user.email, '-', loginData.data.user.user_type);
      }
    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
    }
  } catch (error) {
    console.log('❌ Auth login failed:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Ejecutar tests
if (import.meta.main) {
  testRoutes();
}