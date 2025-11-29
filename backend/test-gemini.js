require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔍 Testing Gemini API...\n');

if (!process.env.GEMINI_API_KEY) {
  console.log('❌ GEMINI_API_KEY not found in .env file!');
  process.exit(1);
}

console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testEmbedding() {
  console.log('\n📊 Testing Embedding Model...');
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent("Hello, world!");
    const embedding = result.embedding;
    console.log('✅ Embedding generated successfully!');
    console.log('   Dimensions:', embedding.values.length);
    console.log('   First 5 values:', embedding.values.slice(0, 5));
  } catch (error) {
    console.log('❌ Embedding failed:', error.message);
  }
}

async function testChat() {
  console.log('\n💬 Testing Chat Model...');
  try {
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Changed
    const result = await chatModel.generateContent("Say hello in one sentence.");
    const response = result.response.text();
    console.log('✅ Chat response received!');
    console.log('   Response:', response);
  } catch (error) {
    console.log('❌ Chat failed:', error.message);
  }
}

(async () => {
  await testEmbedding();
  await testChat();
  console.log('\n🎉 Gemini API tests complete!');
})();