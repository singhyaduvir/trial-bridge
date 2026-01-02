import React, { useState, ChangeEvent } from 'react';

// Type definitions
interface DocumentMetadata {
  title?: string;
  date?: string;
  author?: string;
  [key: string]: any;
}

interface ParsedResult {
  document_type: string;
  metadata: DocumentMetadata;
  key_parameters: Record<string, any>;
  summary: string;
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }> | string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// SVG Icon Components
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Loader2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PDFParser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const convertPDFToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parsePDF = async (): Promise<void> => {
    if (!file || !apiKey) {
      setError('Please provide both a PDF file and API key');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Convert PDF to base64
      const base64Data = await convertPDFToBase64(file);

      // Call GPT-4o API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this medical records document and extract all relevant information. Return a JSON object with the following structure:
{
  "document_type": "type of document (e.g., oncology report, biopsy results, blood test results, doctor's diagnosis report, etc.)",
  "metadata": {
    "title": "document title if available",
    "date": "date of information",
    "author": "author if available"
  },
  "key_parameters": {
    // All relevant parameters extracted from the document
    // Structure this based on what makes sense for the document type. For example:
      //If it's a biopsy report, extract the tumor information, any comments
  },
  "summary": "brief summary of the document content"
}

Be intelligent about what parameters are relevant based on the document type. For example:
- Invoices: extract amounts, dates, vendor info, line items
- Resumes: extract name, contact, experience, education, skills
- Contracts: extract parties, terms, dates, obligations
- Reports: extract key findings, data points, conclusions

Return ONLY the JSON object, no additional text.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64Data}`
                  }
                }
              ]
            }
          ] as OpenAIMessage[],
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData: OpenAIResponse = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult: ParsedResult = JSON.parse(jsonMatch[0]);
        setResult(parsedResult);
      } else {
        setResult(JSON.parse(content) as ParsedResult);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (): void => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileTextIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              PDF Parser with GPT-4o
            </h1>
          </div>

          <div className="space-y-6">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload PDF'}
                  </p>
                </label>
              </div>
            </div>

            {/* Parse Button */}
            <button
              onClick={parsePDF}
              disabled={!file || !apiKey || loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  Parsing PDF...
                </>
              ) : (
                <>
                  <FileTextIcon className="w-5 h-5" />
                  Parse PDF
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Parsed Result
                  </h2>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Copy JSON
                </button>
              </div>
            )}
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How it works:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Upload your PDF document</li>
              <li>The PDF is converted to base64 format</li>
              <li>GPT-4o analyzes the document intelligently</li>
              <li>The AI determines relevant parameters based on document type</li>
              <li>Returns structured JSON with all extracted data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFParser;