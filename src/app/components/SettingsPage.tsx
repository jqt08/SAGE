import { useState, useRef } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Upload, RefreshCw, Download, Save, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  const [thresholds, setThresholds] = useState({
    highSuccess: [0.75],
    mediumSuccess: [0.50],
  });

  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'complete'>('idle');
  const [exportOptions, setExportOptions] = useState({
    includeConfidence: true,
    includeImportance: true,
    includeMetrics: false,
    includeRawData: false,
  });

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['text/csv', 'application/json'].includes(file.type)) {
      toast.error('Invalid file type. Please upload CSV or JSON.');
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 100MB.');
      return;
    }

    setUploadedFile(file);
    setUploadStatus('uploading');

    // Simulate upload
    setTimeout(() => {
      setUploadStatus('success');
      toast.success(`Dataset "${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadStatus('idle'), 2000);
    }, 1500);
  };

  const handleUploadDataset = () => {
    fileInputRef.current?.click();
  };

  const handleRetrainModel = () => {
    if (!uploadedFile) {
      toast.error('Please upload a dataset first');
      return;
    }

    setTrainingStatus('training');
    toast.info('Starting model training...');

    setTimeout(() => {
      setTrainingStatus('complete');
      toast.success('Model training complete! Accuracy: 89%');
      setTimeout(() => setTrainingStatus('idle'), 2000);
    }, 3000);
  };

  const handleExportResults = (format: 'csv' | 'json' | 'pdf') => {
    const sampleData = {
      games: [
        {
          appid: 570,
          name: 'Dota 2',
          genre: 'MOBA',
          price: 0,
          players: 750000,
          sentiment: 8.5,
          predictedSuccess: 0.92,
          confidence: 0.87,
          featureImportance: { playerCount: 0.25, price: 0.15, sentiment: 0.20 },
        },
        {
          appid: 730,
          name: 'Counter-Strike 2',
          genre: 'FPS',
          price: 0,
          players: 1200000,
          sentiment: 8.8,
          predictedSuccess: 0.95,
          confidence: 0.91,
          featureImportance: { playerCount: 0.30, price: 0.10, sentiment: 0.22 },
        },
      ],
      metadata: {
        exportDate: new Date().toISOString(),
        modelVersion: 'v2.4.1',
        highSuccessThreshold: thresholds.highSuccess[0],
        mediumSuccessThreshold: thresholds.mediumSuccess[0],
      },
    };

    if (format === 'csv') {
      // Generate CSV
      const headers = ['App ID', 'Name', 'Genre', 'Price', 'Players', 'Sentiment', 'Predicted Success', 'Confidence'];
      const rows = sampleData.games.map(g => [
        g.appid,
        g.name,
        g.genre,
        `$${g.price}`,
        g.players,
        g.sentiment.toFixed(1),
        (g.predictedSuccess * 100).toFixed(0) + '%',
        (g.confidence * 100).toFixed(0) + '%',
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      downloadFile(csv, 'game-predictions.csv', 'text/csv');
      toast.success('CSV exported successfully');
    } else if (format === 'json') {
      const json = JSON.stringify(sampleData, null, 2);
      downloadFile(json, 'game-predictions.json', 'application/json');
      toast.success('JSON exported successfully');
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text version that can be printed to PDF
      const text = generatePDFText(sampleData);
      downloadFile(text, 'game-predictions.txt', 'text/plain');
      toast.success('Report generated (printable as PDF)');
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFText = (data: any) => {
    return `
GAME SUCCESS PREDICTION REPORT
Generated: ${new Date().toLocaleDateString()}
Model Version: ${data.metadata.modelVersion}

CLASSIFICATION THRESHOLDS:
- High Success: ≥ ${(data.metadata.highSuccessThreshold * 100).toFixed(0)}%
- Medium Success: ${(data.metadata.mediumSuccessThreshold * 100).toFixed(0)}% - ${(data.metadata.highSuccessThreshold * 100).toFixed(0)}%
- Low Success: < ${(data.metadata.mediumSuccessThreshold * 100).toFixed(0)}%

PREDICTIONS:
${data.games.map((g: any) => `
Title: ${g.name}
Genre: ${g.genre}
Price: $${g.price}
Players: ${g.players.toLocaleString()}
Sentiment: ${g.sentiment.toFixed(1)}/10
Predicted Success: ${(g.predictedSuccess * 100).toFixed(0)}%
Confidence: ${(g.confidence * 100).toFixed(0)}%
---`).join('\n')}
    `.trim();
  };

  return (
    <div className="max-w-6xl">
      <h1 className="mb-8">
        Settings & Configuration
      </h1>
      
      <div className="space-y-6">
        {/* Upload Dataset */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <h2>Upload Dataset</h2>
            <div className="group relative inline-block cursor-help">
              <Info className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded shadow-lg left-0 top-full mt-2">
                Upload a new dataset to retrain the success prediction model with fresh data from your games collection.
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div 
            onClick={handleUploadDataset}
            className="border-2 border-dashed border-gray-300 p-12 text-center mb-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
            <p className="text-gray-600 mb-2">Drag and drop your CSV or JSON file here</p>
            <p className="text-sm text-gray-500 mb-4">Maximum file size: 100MB</p>
            <Button 
              onClick={(e) => { e.stopPropagation(); handleUploadDataset(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Files
            </Button>
          </div>

          {uploadedFile && (
            <div className={`p-4 rounded mb-4 flex items-center gap-3 ${
              uploadStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <Upload className="w-5 h-5 text-blue-600 flex-shrink-0 animate-pulse" />
              )}
              <div className="flex-1">
                <p className={uploadStatus === 'success' ? 'text-green-700 font-medium' : 'text-blue-700 font-medium'}>
                  {uploadedFile.name}
                </p>
                <p className={`text-sm ${uploadStatus === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                  {uploadStatus === 'uploading' ? 'Uploading...' : `Uploaded (${(uploadedFile.size / 1024).toFixed(0)} KB)`}
                </p>
              </div>
            </div>
          )}

          <div className="border border-gray-300 p-4 bg-gray-50">
            <h3 className="mb-3 text-sm font-medium">Dataset Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>File format: CSV or JSON</li>
              <li>Required columns: title, genre, price, release_date</li>
              <li>Optional columns: developer, publisher, tags, player_count, review_sentiment</li>
              <li>Minimum 1,000 records recommended for training</li>
            </ul>
          </div>
        </div>

        {/* Retrain Model */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <h2>Retrain Model</h2>
            <div className="group relative inline-block cursor-help">
              <Info className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              <div className="hidden group-hover:block absolute z-10 w-72 p-3 bg-gray-900 text-white text-sm rounded shadow-lg left-0 top-full mt-2">
                Retraining improves the model's accuracy by learning from your uploaded dataset. The process uses epochs and batch size to optimize learning.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Current Model Version</div>
              <div className="text-2xl text-gray-700">v2.4.1</div>
              <div className="text-xs text-gray-500 mt-1">Last trained: Jan 20, 2026</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Training Data Size</div>
              <div className="text-2xl text-gray-700">{uploadedFile ? '15,420+' : '15,420'}</div>
              <div className="text-xs text-gray-500 mt-1">Total game records</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Model Accuracy</div>
              <div className="text-2xl text-gray-700">87%</div>
              <div className="text-xs text-gray-500 mt-1">On validation set</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-gray-700 block">Training Options</Label>
              <div className="group relative inline-block cursor-help">
                <Info className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                <div className="hidden group-hover:block absolute z-10 w-60 p-2 bg-gray-900 text-white text-xs rounded shadow-lg left-0 top-full mt-2">
                  Epochs: number of complete passes through the training data. More epochs = better learning but slower training.
                  Batch size: number of games processed at once. Larger batches process faster but use more memory.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="epochs" className="text-sm text-gray-600">Epochs (1-500)</Label>
                <Input
                  id="epochs"
                  placeholder="100"
                  defaultValue="100"
                  type="number"
                  min="1"
                  max="500"
                  className="border-gray-300 mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="batch-size" className="text-sm text-gray-600">Batch Size (8-256)</Label>
                <Input
                  id="batch-size"
                  placeholder="32"
                  defaultValue="32"
                  type="number"
                  min="8"
                  max="256"
                  className="border-gray-300 mt-1.5"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleRetrainModel}
            disabled={trainingStatus === 'training' || !uploadedFile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${trainingStatus === 'training' ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            {trainingStatus === 'idle' && (uploadedFile ? 'Retrain Model' : 'Upload Dataset First')}
            {trainingStatus === 'training' && 'Training in Progress...'}
            {trainingStatus === 'complete' && 'Training Complete!'}
          </Button>

          {trainingStatus === 'training' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: '45%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Adjust Classification Thresholds */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <h2>Adjust Classification Thresholds</h2>
            <div className="group relative inline-block cursor-help">
              <Info className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              <div className="hidden group-hover:block absolute z-10 w-80 p-3 bg-gray-900 text-white text-sm rounded shadow-lg left-0 top-full mt-2">
                Classification thresholds determine how model predictions are categorized. Adjust these to balance sensitivity (catch more successes) vs. precision (avoid false positives).
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-gray-700 mb-3 block flex items-center gap-2">
                High Success Threshold: <span className="font-mono font-bold text-green-600">{thresholds.highSuccess[0].toFixed(2)}</span>
              </Label>
              <Slider
                min={0.6}
                max={0.9}
                step={0.05}
                value={thresholds.highSuccess}
                onValueChange={(value) => setThresholds(prev => ({ ...prev, highSuccess: value }))}
              />
              <p className="text-sm text-gray-500 mt-3">
                <strong>What it does:</strong> Games predicted as successful with confidence ≥ {(thresholds.highSuccess[0] * 100).toFixed(0)}% qualify as "High Success" potential.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>Example:</strong> A strategy game scoring {(thresholds.highSuccess[0] * 100).toFixed(0)}% or higher would be marked as high chance of success.
              </p>
            </div>

            <div>
              <Label className="text-gray-700 mb-3 block flex items-center gap-2">
                Medium Success Threshold: <span className="font-mono font-bold text-yellow-600">{thresholds.mediumSuccess[0].toFixed(2)}</span>
              </Label>
              <Slider
                min={0.3}
                max={0.7}
                step={0.05}
                value={thresholds.mediumSuccess}
                onValueChange={(value) => setThresholds(prev => ({ ...prev, mediumSuccess: value }))}
              />
              <p className="text-sm text-gray-500 mt-3">
                <strong>What it does:</strong> Games scoring between {(thresholds.mediumSuccess[0] * 100).toFixed(0)}% and {(thresholds.highSuccess[0] * 100).toFixed(0)}% are classified as "Medium Success".
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>Example:</strong> A niche indie game scoring {(thresholds.mediumSuccess[0] * 100).toFixed(0)}% would show moderate success potential.
              </p>
            </div>

            <div className="border border-gray-300 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Current Classification Ranges:
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <span className="text-gray-700">🟢 High Success Potential:</span>
                  <span className="font-mono font-bold text-green-700">≥ {(thresholds.highSuccess[0] * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-gray-700">🟡 Medium Success Potential:</span>
                  <span className="font-mono font-bold text-yellow-700">
                    {(thresholds.mediumSuccess[0] * 100).toFixed(0)}% - {(thresholds.highSuccess[0] * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <span className="text-gray-700">🔴 Low Success Potential:</span>
                  <span className="font-mono font-bold text-red-700">&lt; {(thresholds.mediumSuccess[0] * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Results */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <h2>Export Results</h2>
            <div className="group relative inline-block cursor-help">
              <Info className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              <div className="hidden group-hover:block absolute z-10 w-72 p-3 bg-gray-900 text-white text-sm rounded shadow-lg left-0 top-full mt-2">
                Download your game predictions and analysis in various formats for sharing, further analysis, or integration with other tools.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button 
              onClick={() => handleExportResults('csv')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Export as CSV
            </Button>
            <Button 
              onClick={() => handleExportResults('json')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Export as JSON
            </Button>
            <Button 
              onClick={() => handleExportResults('pdf')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Export as Text
            </Button>
          </div>

          <div className="border border-gray-300 p-4 bg-blue-50">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Export Options:
            </h3>
            <div className="space-y-2 ml-6">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeConfidence}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeConfidence: e.target.checked }))}
                  className="rounded" 
                />
                Include prediction confidence scores
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeImportance}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeImportance: e.target.checked }))}
                  className="rounded" 
                />
                Include feature importance data
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeMetrics}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetrics: e.target.checked }))}
                  className="rounded" 
                />
                Include model performance metrics
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeRawData}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeRawData: e.target.checked }))}
                  className="rounded" 
                />
                Include raw input data
              </label>
            </div>
          </div>
        </div>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              toast.success('Settings saved successfully!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
