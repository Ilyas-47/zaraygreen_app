const { GoogleGenerativeAI } = require('@google/generative-ai');
const ai = new GoogleGenerativeAI('AQ.Ab8RN6J_Kgl5Q3YX2a4RC2TUqs45zfO8DDi0HjdqSGnICAaOxg');

async function test() {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent("Bonjour");
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
