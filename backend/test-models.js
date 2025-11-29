require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('Fetching available models...\n');
    
    // This is a workaround - try common models
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp'
    ];

    console.log('Testing which models work:\n');

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = result.response.text();
        console.log(`✅ ${modelName} - WORKS`);
        console.log(`   Response: ${response.substring(0, 50)}...\n`);
      } catch (error) {
        console.log(`❌ ${modelName} - FAILED`);
        console.log(`   Error: ${error.message.substring(0, 100)}...\n`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();