import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

const PROMPTS = [
  {
    id: 1,
    prompt: `
      Extract essential information in this transaction picture and format into following json format:
      - Extract the vendor name from the receipt and use it as the 'vendor' field. If not found, use the most prominent text or leave as 'Unknown Vendor'.
      - Response only in JSON format, remember the format json that they send to make api request, in some case where you're unsure about the item just leave the name as "UNKNOWN".

      {
        "vendor": example: "Starbucks Coffee", if not found use the most prominent text or "Unknown Vendor",
        "type": EXPENSE OR INCOME,
        "description": example : "I bought cake",  mostly in remark option, if not found just null.
        "date": example format like this "YYYY-MM-DD",
        "total_amount": example (100) put only number and if use see KHR currency please convert to USD format, by multiply by 4000,
        "items": [
          {
            "id": can be in order 1 to ...,
            "name": should just be the name of the item (must support Khmer or any other languages), if couldn't identify the name just leave the name as "UNKNOWN",
            "amount": basically the cost of the product, example (100) put only number,
            "currency": basically follow the currency shows in the receipts,
          },
        ]
      }
    `,
  },
  {
    id: 2,
    prompt: `
      extract essential information in this transaction picture and format into following json format: 
      response only json format, remember the format json that they send to make api request,
      {
        "amount": example (100) put only number and if use see KHR currency please convert to USD format, by multiply by 4000 ,
        "type": EXPENSE OR INCOME,
        "description": example : "I bought cake",  mostly in remark option,
        "date": example format like this "2025-12-31",
      }
    `,
  },
  {
    id: 3,
    prompt: `
      Extract essential information from this transaction picture and format it into the following JSON structure.
      
      Additional task:
      - For each item, determine its accounting category based on the accounting equation components: 
      - **Asset**: items the business owns (e.g., equipment, cash, inventory).
      - **Liability**: items the business owes (e.g., loans, credit payable).
      - **Owner's Equity**: owner's investment or retained earnings.
      - If unsure about the item's nature, set "category" to "UNKNOWN"
    
      Currency Conversion:
      - If the receipt shows KHR, convert all amounts to USD using a rate of 1 USD = 4000 KHR.
      
      Response Rules:
      - Respond in **JSON format only**.
      - Keep item name in its original language (Khmer or others).
      - If the item name is unclear, use "UNKNOWN".

      { 
        "type": EXPENSE OR INCOME, 
        "description": example : "I bought cake",  mostly in remark option, if not found just null. 
        "date": example format like this "YYYY-MM-DD", 
        "total_amount": example (100) put only number and if use see KHR currency please convert to USD format, by multiply by 4000, 
        "items": [ 
          { 
            "id": can be in order 1 to ..., 
            "name": should just be the name of the item (must support Khmer or any other languages), if couldn't identify the name just leave the name as "UNKNOWN",
            "amount": basically the cost of the product, example (100) put only number, 
            "currency": basically follow the currency shows in the receipts, 
            "category": "Asset" or "Liability" or "Owner's Equity" or "UNKNOWN"
          }, 
        ] 
      }
    `,
  },
];

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: "GOOGLE_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const imageBytes = await imageFile.arrayBuffer();
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imagePart = {
      inlineData: {
        data: Buffer.from(imageBytes).toString("base64"),
        mimeType: imageFile.type,
      },
    };
    const result = await model.generateContent([
      PROMPTS[0].prompt,
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    return new Response(JSON.stringify({ description: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 