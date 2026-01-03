# LectureLens - AI Notes Digitizer

## Overview
LectureLens is a React application that leverages Google's **Gemini 3 Flash** model to transform physical lecture notes, handwritten pages, and PDF slides into digital, structured content.

Unlike standard OCR which just returns unstructured text, LectureLens returns structured data (JSON) and formatted Markdown, preserving the hierarchy (headers, lists, bold text) of your original notes.

## Key Features
- **Intelligent Parsing**: Extracts Title, Date, and Content from raw images.
- **Format Preservation**: Keeps bullet points, bold text, and headers intact using Markdown.
- **Summary Generation**: Optional concise summary of the lecture material.
- **Dual View**: 
  - **Reader View**: Clean, readable typography for studying.
  - **Raw Data View**: JSON output for developers or data integrations.
- **File Support**: Works with Images (JPG, PNG) and PDFs.

## Setup Instructions

### 1. Environment Setup
You need a Google GenAI API Key to run this application.

1.  Clone the repository.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and paste your actual API Key:
    ```env
    API_KEY=AIzaSy...
    ```
    *(Note: The .env file is git-ignored to keep your key safe)*

### 2. Installation
Install the required dependencies:

```bash
npm install
```

### 3. Running the App
Start the development server:

```bash
npm start
```

## How to Use

1.  **Upload File**: Drag & drop an image (JPG/PNG) or a PDF file into the upload area on the left.
2.  **Configure**: Check the **"Generate Summary"** toggle if you want the AI to write a summary of the notes.
3.  **Digitize**: Click the **Digitize Notes** button. The app will process the image with Gemini 3 Flash.
4.  **View Results**:
    - Use the **Read Notes** tab to read the formatted content.
    - Use the **Raw Data** tab to see the underlying JSON structure.
5.  **Export**: Click the **Download** icon to save the result as a JSON file, or the **Copy** icon to copy the text to your clipboard.

## Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **PDF Processing**: PDF.js
