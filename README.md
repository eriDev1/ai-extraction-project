

A lightweight Next.js app that extracts pricing info from hotel contracts and compares year-over-year rates automatically using AI.

## Overview

This tool helps users quickly analyze hotel contract prices by extracting structured data from PDFs and Excel files, then highlighting changes between contracts. It works with different file formats and outputs clear, actionable results.

## Features

* **File Support:** PDF and Excel (.xls, .xlsx)
* **AI Extraction:** Uses Google Gemini AI for parsing contract content
* **Automated Matching:** Aligns items by hotel, room type, and date range
* **Price Comparison:** Shows differences and summary statistics
* **JSON Output:** Structured data ready for further processing

## Quick Start

**Requirements:**

* Node.js 20+
* Google AI Studio API key

**Installation:**

```bash
npm install
```

Set your API key in a `.env` file:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3200](http://localhost:3200) in your browser.

## Usage

**Web:**

1. Upload Contract A and Contract B
2. Click "Run Extraction"
3. Review results: matched items, unique items in each contract, and price differences

```

**Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Google Gemini AI

