const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI('AQ.Ab8RN6J_Kgl5Q3YX2a4RC2TUqs45zfO8DDi0HjdqSGnICAaOxg');

async function test() {
  try {
    const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6J_Kgl5Q3YX2a4RC2TUqs45zfO8DDi0HjdqSGnICAaOxg`);
    const json = await models.json();
    console.log(json.models.map(m => m.name));
  } catch (err) {
    console.error(err);
  }
}
test();
