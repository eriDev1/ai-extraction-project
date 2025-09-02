import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import * as XLSX from "xlsx";

export interface ContractItem {
  hotel_name: string;
  room_type: string;
  period_start: string;
  period_end: string; 
  price: number;
  currency: string;
}

export interface ExtractionResult {
  contract_a_data: ContractItem[];
  contract_b_data: ContractItem[];
}


export async function extractFileData(
  fileA: File,
  fileB: File
): Promise<ExtractionResult> {
  console.log(`Starting extraction for files: ${fileA.name}, ${fileB.name}`);

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Google Gemini API key not found. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY environment variable."
    );
  }

  try {
    const [fileAData, fileBData] = await Promise.all([
      extractFromSingleFile(fileA),
      extractFromSingleFile(fileB),
    ]);

    return {
      contract_a_data: fileAData,
      contract_b_data: fileBData,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      ) {
        throw new Error(
          "Gemini API quota exceeded. Please check your API limits or try again later."
        );
      }

      if (
        error.message.includes("401") ||
        error.message.includes("API_KEY_INVALID")
      ) {
        throw new Error(
          "Invalid Gemini API key. Please check your GOOGLE_GENERATIVE_AI_API_KEY in .env.local"
        );
      }

      if (error.message.includes("403")) {
        throw new Error(
          "Gemini API access forbidden. Please ensure your API key has the correct permissions."
        );
      }
    }

    throw new Error(
      `Failed to extract file data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function extractFromExcelFile(fileBuffer: ArrayBuffer): Promise<ContractItem[]> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    
    console.log(`Converted Excel to CSV format (${csvData.length} characters)`);
    
    const model = google("gemini-2.5-flash-lite");
    
    const prompt = `You are a data extraction specialist. Extract all hotel pricing information from this Excel/CSV data.

IMPORTANT INSTRUCTIONS:
1. Find all pricing data for hotels/accommodations
2. Normalize hotel names (remove extra spaces, standardize capitalization)
3. Extract room types/categories
4. Parse date ranges carefully - convert to YYYY-MM-DD format
5. Extract prices as numbers only (no currency symbols)
6. Identify currency (EUR, USD, etc.)
7. Only include actual pricing data, ignore other contract terms
8. If dates span multiple periods, create separate entries for each period
9. Ensure all dates are valid and in YYYY-MM-DD format
10. Return ONLY a valid JSON array, no explanations or prose
11. NEVER return null values - if a field cannot be extracted, omit the entire item
12. Only include items where ALL fields can be successfully extracted
13. If you're unsure about any field, skip that item entirely

REQUIRED OUTPUT FORMAT:
Return a JSON array where each item follows this exact structure:
[
  {
    "hotel_name": "Hotel Name",
    "room_type": "Room Type", 
    "period_start": "YYYY-MM-DD",
    "period_end": "YYYY-MM-DD",
    "price": 123.45,
    "currency": "EUR"
  }
]

CRITICAL: Each item MUST have all fields populated. If any field is missing or unclear, do not include that item in the results.

CSV/Excel Data to process:
${csvData}

RESPOND ONLY WITH THE JSON ARRAY, NO OTHER TEXT.`;

    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    console.log(`AI response received for Excel file`);

    let parsedData;
    try {
      let jsonText = result.text.trim();

      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(
        `Failed to parse JSON response: ${
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error"
        }`
      );
    }

    if (!Array.isArray(parsedData)) {
      throw new Error("AI response is not a valid array of pricing data");
    }

    console.log(`Parsed ${parsedData.length} items from Excel file`);

    const extractedData = parsedData
      .map((item, index) => {
        if (
          !item.hotel_name ||
          !item.room_type ||
          !item.period_start ||
          !item.period_end ||
          item.price === undefined ||
          item.price === null ||
          !item.currency
        ) {
          return null; 
        }

        const normalizedItem = {
          hotel_name: normalizeHotelName(String(item.hotel_name)),
          room_type: String(item.room_type),
          period_start: String(item.period_start),
          period_end: String(item.period_end),
          price: Number(item.price),
          currency: String(item.currency).toUpperCase(),
        };

        return normalizedItem;
      })
      .filter((item): item is ContractItem => item !== null);

    console.log(`Successfully extracted ${extractedData.length} items from Excel file`);
    return extractedData;
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractFromSingleFile(file: File): Promise<ContractItem[]> {
  console.log(`Processing file: ${file.name} (${file.size} bytes)`);

  const fileBuffer = await file.arrayBuffer();
  const mimeType = file.type || "application/octet-stream";

  const isExcelFile = mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                      mimeType === "application/vnd.ms-excel" ||
                      file.name.toLowerCase().endsWith('.xlsx') ||
                      file.name.toLowerCase().endsWith('.xls');

  if (isExcelFile) {
    console.log(`Converting Excel file to JSON: ${file.name}`);
    return await extractFromExcelFile(fileBuffer);
  }

  const base64Data = Buffer.from(fileBuffer).toString("base64");
  const model = google("gemini-2.5-flash-lite");

  const prompt = `You are a data extraction specialist. Extract all hotel pricing information from this contract document.

IMPORTANT INSTRUCTIONS:
1. Find all pricing data for hotels/accommodations
2. Normalize hotel names (remove extra spaces, standardize capitalization)
3. Extract room types/categories
4. Parse date ranges carefully - convert to YYYY-MM-DD format
5. Extract prices as numbers only (no currency symbols)
6. Identify currency (EUR, USD, etc.)
7. Only include actual pricing data, ignore other contract terms
8. If dates span multiple periods, create separate entries for each period
9. Ensure all dates are valid and in YYYY-MM-DD format
10. Return ONLY a valid JSON array, no explanations or prose
11. NEVER return null values - if a field cannot be extracted, omit the entire item
12. Only include items where ALL fields can be successfully extracted
13. If you're unsure about any field, skip that item entirely

REQUIRED OUTPUT FORMAT:
Return a JSON array where each item follows this exact structure:
[
  {
    "hotel_name": "Hotel Name",
    "room_type": "Room Type", 
    "period_start": "YYYY-MM-DD",
    "period_end": "YYYY-MM-DD",
    "price": 123.45,
    "currency": "EUR"
  }
]

CRITICAL: Each item MUST have all fields populated. If any field is missing or unclear, do not include that item in the results.

Look for tables, price lists, rate sheets, or any structured pricing information in the document.
RESPOND ONLY WITH THE JSON ARRAY, NO OTHER TEXT.`;

  console.log(`Sending request to Gemini AI for ${file.name}...`);

  try {
    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "file",
              data: base64Data,
              mediaType: mimeType,
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    console.log(`AI response received for ${file.name}`);

    let parsedData;
    try {
      let jsonText = result.text.trim();

      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(
        `Failed to parse JSON response: ${
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error"
        }`
      );
    }

    if (!Array.isArray(parsedData)) {
      throw new Error("AI response is not a valid array of pricing data");
    }

    console.log(`Parsed ${parsedData.length} items from ${file.name}`);

    const extractedData = parsedData
      .map((item, index) => {
        if (
          !item.hotel_name ||
          !item.room_type ||
          !item.period_start ||
          !item.period_end ||
          item.price === undefined ||
          item.price === null ||
          !item.currency
        ) {
          return null; 
        }

        const normalizedItem = {
          hotel_name: normalizeHotelName(String(item.hotel_name)),
          room_type: String(item.room_type),
          period_start: String(item.period_start),
          period_end: String(item.period_end),
          price: Number(item.price),
          currency: String(item.currency).toUpperCase(),
        };

        return normalizedItem;
      })
      .filter((item): item is ContractItem => item !== null); // Filter out null items

    console.log(`Parsed ${extractedData.length} items from ${file.name}`);

    return extractedData;
  } catch (error) {
    throw error;
  }
}


export async function parseFileContent(
  file: File
): Promise<string | ArrayBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return arrayBuffer;
}


export function normalizeHotelName(hotelName: string): string {
  const normalized = hotelName.trim().toLowerCase();
  return normalized;
}


export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    console.log(`Invalid date format: "${dateString}"`);
    return false;
  }

  const date = new Date(dateString);
  const isValid = !isNaN(date.getTime());
  return isValid;
}
