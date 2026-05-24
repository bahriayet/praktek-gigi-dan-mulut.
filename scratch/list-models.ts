import { GoogleGenerativeAI } from "@google/generative-ai";

async function list() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return console.error('No API Key');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // List models is not directly on genAI in the same way?
    // Actually, we can try to fetch them.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('List Failed:', error.message);
  }
}

list();
