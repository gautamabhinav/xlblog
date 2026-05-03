// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import { OpenAI } from "openai/client.js";
// import AppError from "../utils/AppError.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });


// export const getsummary = asyncHandler(async(req, res, next) => {
//     try {
//     const { data } = req.body; // parsed Excel data (JSON)

//     console.log(data);

//     // Prepare prompt
//     const prompt = `
//       Analyze this dataset and provide key insights:
//       ${JSON.stringify(data.slice(0, 200))} 
//       (only sample of 200 rows shown to avoid overload)
//     `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4.1", // or gpt-4.1 for deeper analysis
//       messages: [
//         { role: "system", content: "You are an analytics assistant." },
//         { role: "user", content: prompt },
//       ],
//     });

//     res.json({ summary: response.choices[0].message.content });
//   }
//   catch (error) {
//       return next(
//         new AppError(error || 'some error is found not getting summarized')
//       );
//     }
// })


import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import AppError from "../utils/AppError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getsummary = asyncHandler(async (req, res, next) => {
  try {
    const { data } = req.body; // parsed Excel data (JSON)

    console.log("Received dataset:", data?.length);

    // Prepare prompt
    const prompt = `
      Analyze this dataset and provide key insights:
      ${JSON.stringify(data?.slice(0, 200))} 
      (only sample of 200 rows shown to avoid overload)
    `;

    // Use Gemini 1.5 (latest models: gemini-1.5-pro / gemini-1.5-flash)
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // ✅ FIX 1: Use the recommended production model name for 1.5 Pro

    // gemini-3-pro

    const model = genAI.getGenerativeModel({ model: " gemini-3-pro" });
    
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent(prompt);

    // Gemini returns in .response.text()
    const summary = result.response.text();

    const models = await genAI.listModels();
    console.log(models);


    res.json({ summary });
  } catch (error) {
    console.error("Gemini error:", error);
    return next(
      new AppError(
        error.message || "Some error occurred while generating summary",
        500
      )
    );
  }
});

// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import AppError from "../utils/AppError.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export const getsummary = asyncHandler(async (req, res, next) => {
//   try {
//     const { data } = req.body; // parsed Excel data (JSON)

//     console.log("Received dataset:", data?.length);

//     // Prepare prompt
//     const prompt = `
//       Analyze this dataset and provide key insights:
//       ${JSON.stringify(data?.slice(0, 200))} 
//       (only sample of 200 rows shown to avoid overload)
//     `;

//     // 🚀 FIX: Use the model name supported by the v1beta API endpoint
//     // It is often "gemini-1.5-pro-latest" or "gemini-1.5-flash"
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
//     // Fallback: If "gemini-1.5-pro-latest" doesn't work, try "gemini-1.5-flash"

//     const result = await model.generateContent(prompt);

//     // Gemini returns in .response.text()
//     const summary = result.response.text();

//     // const models = await genAI.listModels();
//     // console.log("Available Models:", models); // Check this output for the correct name

//     res.json({ summary });
//   } catch (error) {
//     console.error("Gemini error:", error);
//     return next(
//       new AppError(
//         error.message || "Some error occurred while generating summary",
//         500
//       )
//     );
//   }
// });

// Summarize arbitrary text (used by frontend for blog post summaries)
export const getsummaryText = asyncHandler(async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return next(new AppError('No text provided for summary', 400));
    }

    // Prepare a concise summarization prompt
    const prompt = `Summarize the following article in 3 concise bullet points and a one-line TL;DR. Keep language simple and clear:\n\n${String(text).slice(0, 10000)}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (error) {
    console.error('Gemini text summary error:', error);
    return next(
      new AppError(error.message || 'Some error occurred while generating summary', 500)
    );
  }
});