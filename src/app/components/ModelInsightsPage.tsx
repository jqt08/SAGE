import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Info } from 'lucide-react';
import { useState } from 'react';

const featureImportanceData = [
  { feature: 'Review Sentiment', importance: 0.35 },
  { feature: 'Player Count', importance: 0.28 },
  { feature: 'Price Point', importance: 0.18 },
  { feature: 'Genre Popularity', importance: 0.12 },
  { feature: 'Developer Rep.', importance: 0.07 },
];

const performanceMetrics = [
  { metric: 'Accuracy', value: 0.87, benchmark: 0.75 },
  { metric: 'Precision', value: 0.84, benchmark: 0.72 },
  { metric: 'Recall', value: 0.89, benchmark: 0.78 },
  { metric: 'F1 Score', value: 0.86, benchmark: 0.75 },
  { metric: 'ROC-AUC', value: 0.92, benchmark: 0.80 },
];

const ensembleModels = [
  {
    name: 'Random Forest',
    role: 'Feature Selection & Importance',
    description: 'Uses multiple decision trees to identify which features matter most. Handles non-linear relationships and prevents overfitting through bootstrapping.',
    usage: 'Determines feature importance weights; handles categorical variables like game genre and tags.',
    weight: '25%',
  },
  {
    name: 'Gradient Boosting',
    role: 'Sequential Learning',
    description: 'Builds trees sequentially, each correcting errors from the previous one. Captures complex patterns and interactions between features.',
    usage: 'Learns relationships between player engagement, review sentiment, and success patterns; improves accuracy iteratively.',
    weight: '35%',
  },
  {
    name: 'XGBoost (Extreme Gradient Boosting)',
    role: 'Optimized Predictions',
    description: 'Highly optimized gradient boosting with regularization to prevent overfitting. Fast and effective for structured data.',
    usage: 'Primary predictor for success scores; handles sparse data and missing values; reduces bias-variance tradeoff.',
    weight: '30%',
  },
  {
    name: 'Stacked Ensemble',
    role: 'Meta-Learning Aggregation',
    description: 'Combines predictions from all three base models using a meta-learner that learns optimal weights for each model\'s output.',
    usage: 'Blends Random Forest, Gradient Boosting, and XGBoost predictions into final calibrated score; achieves highest accuracy.',
    weight: '10%',
  },
];

const biasVarianceData = [
  { complexity: 1, training: 0.65, validation: 0.63 },
  { complexity: 2, training: 0.72, validation: 0.70 },
  { complexity: 3, training: 0.79, validation: 0.77 },
  { complexity: 4, training: 0.85, validation: 0.84 },
  { complexity: 5, training: 0.87, validation: 0.86 },
  { complexity: 6, training: 0.90, validation: 0.86 },
  { complexity: 7, training: 0.93, validation: 0.85 },
  { complexity: 8, training: 0.96, validation: 0.83 },
];

const confusionMatrixData = [
  { actual: 'High', predicted: 'High', count: 340 },
  { actual: 'High', predicted: 'Medium', count: 45 },
  { actual: 'High', predicted: 'Low', count: 15 },
  { actual: 'Medium', predicted: 'High', count: 38 },
  { actual: 'Medium', predicted: 'Medium', count: 280 },
  { actual: 'Medium', predicted: 'Low', count: 32 },
  { actual: 'Low', predicted: 'High', count: 12 },
  { actual: 'Low', predicted: 'Medium', count: 48 },
  { actual: 'Low', predicted: 'Low', count: 290 },
];

export function ModelInsightsPage() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  return (
    <div className="max-w-7xl">
      <h1 className="mb-8">
        Model Insights & Performance
      </h1>
      
      <div className="space-y-6">
        {/* Ensemble Architecture */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2>Ensemble Architecture</h2>
            <div className="group relative cursor-help">
              <Info size={18} className="text-gray-400" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-64 rounded bg-gray-900 p-2 text-xs text-white group-hover:block">
                Four machine learning algorithms work together to predict game success with 92% accuracy
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ensembleModels.map((model) => (
              <div
                key={model.name}
                className="border border-gray-200 hover:border-blue-400 cursor-pointer transition-all p-4"
                onClick={() => setExpandedModel(expandedModel === model.name ? null : model.name)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{model.name}</h3>
                    <p className="text-xs text-blue-600 mt-1">{model.role}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {model.weight}
                  </div>
                </div>

                {expandedModel === model.name && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-2">{model.description}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">Usage: </span>
                      {model.usage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">How It Works: </span>
              All four models process game features independently. The three base models (Random Forest, Gradient Boosting, XGBoost) generate predictions, which are then combined by the Stacked Ensemble meta-learner that has learned optimal weights for each model's strengths.
            </p>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2>Feature Importance Visualization</h2>
            <div className="group relative cursor-help">
              <Info size={18} className="text-gray-400" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-80 rounded bg-gray-900 p-2 text-xs text-white group-hover:block">
                <span className="font-semibold">Random Forest Algorithm:</span> Identifies which game attributes matter most by measuring how much each feature reduces prediction error across 100+ decision trees.
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportanceData} layout="vertical">
              <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" horizontal={false} />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                domain={[0, 0.4]}
              />
              <YAxis 
                type="category" 
                dataKey="feature" 
                axisLine={{ stroke: '#9ca3af' }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                width={150}
              />
              <Bar dataKey="importance" fill="#9ca3af" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-5 gap-4">
            {featureImportanceData.map((item, index) => (
              <div key={index} className="border border-gray-300 p-4 text-center">
                <div className="text-2xl text-gray-700 mb-1">{(item.importance * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-600">{item.feature}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance Metrics */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2>Model Performance Metrics</h2>
            <div className="group relative cursor-help">
              <Info size={18} className="text-gray-400" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-96 rounded bg-gray-900 p-2 text-xs text-white group-hover:block">
                <span className="font-semibold">Gradient Boosting & XGBoost:</span> These sequential learning algorithms iteratively correct prediction errors, achieving 87% accuracy. XGBoost's regularization prevents overfitting.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-6 mb-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-600 mb-2">{metric.metric}</div>
                <div className="text-4xl mb-2 text-gray-700">{(metric.value * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Benchmark: {(metric.benchmark * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>

          <div className="border border-gray-300 p-6">
            <h3 className="mb-4">Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="metric" 
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  domain={[0, 1]}
                />
                <Bar dataKey="value" fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" fill="#d1d5db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600" />
                <span className="text-gray-600">Current Model</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300" />
                <span className="text-gray-600">Benchmark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bias-Variance Analysis */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2>Bias–Variance Analysis</h2>
            <div className="group relative cursor-help">
              <Info size={18} className="text-gray-400" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-96 rounded bg-gray-900 p-2 text-xs text-white group-hover:block">
                <span className="font-semibold">Stacked Ensemble:</span> Combines Random Forest (low bias, high variance) with Gradient Boosting/XGBoost (balanced) to achieve optimal complexity (~Level 5) where neither bias nor variance dominates.
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={biasVarianceData}>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="complexity" 
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Model Complexity', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Error Rate', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  domain={[0.6, 1.0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="training" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  dot={{ fill: '#6b7280', r: 4 }}
                  name="Training Error"
                />
                <Line 
                  type="monotone" 
                  dataKey="validation" 
                  stroke="#d1d5db" 
                  strokeWidth={2}
                  dot={{ fill: '#d1d5db', r: 4 }}
                  name="Validation Error"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600" />
                <span className="text-gray-600">Training Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300" />
                <span className="text-gray-600">Validation Error</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Optimal Complexity</div>
              <div className="text-2xl text-gray-700">Level 5</div>
              <div className="text-xs text-gray-500 mt-1">Lowest validation error</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Bias Level</div>
              <div className="text-2xl text-gray-700">Low</div>
              <div className="text-xs text-gray-500 mt-1">Good training fit</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Variance Level</div>
              <div className="text-2xl text-gray-700">Balanced</div>
              <div className="text-xs text-gray-500 mt-1">Minimal overfitting</div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="border border-gray-300 bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2>Confusion Matrix</h2>
            <div className="group relative cursor-help">
              <Info size={18} className="text-gray-400" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-96 rounded bg-gray-900 p-2 text-xs text-white group-hover:block">
                <span className="font-semibold">Ensemble Results:</span> All four algorithms vote on predictions. The high diagonal (340, 280, 290) shows correct classifications where majority vote was confident.
              </div>
            </div>
          </div>
          
          <div className="inline-block border border-gray-300">
            <div className="grid grid-cols-4">
              <div className="p-4 border-r border-b border-gray-300 bg-gray-50"></div>
              <div className="p-4 border-r border-b border-gray-300 bg-gray-50 text-center text-sm text-gray-600 font-medium">
                Predicted High
              </div>
              <div className="p-4 border-r border-b border-gray-300 bg-gray-50 text-center text-sm text-gray-600 font-medium">
                Predicted Medium
              </div>
              <div className="p-4 border-b border-gray-300 bg-gray-50 text-center text-sm text-gray-600 font-medium">
                Predicted Low
              </div>

              <div className="p-4 border-r border-b border-gray-300 bg-gray-50 text-sm text-gray-600 font-medium">
                Actual High
              </div>
              <div className="p-4 border-r border-b border-gray-300 text-center bg-green-50">
                <div className="text-2xl text-gray-700">340</div>
              </div>
              <div className="p-4 border-r border-b border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">45</div>
              </div>
              <div className="p-4 border-b border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">15</div>
              </div>

              <div className="p-4 border-r border-b border-gray-300 bg-gray-50 text-sm text-gray-600 font-medium">
                Actual Medium
              </div>
              <div className="p-4 border-r border-b border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">38</div>
              </div>
              <div className="p-4 border-r border-b border-gray-300 text-center bg-green-50">
                <div className="text-2xl text-gray-700">280</div>
              </div>
              <div className="p-4 border-b border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">32</div>
              </div>

              <div className="p-4 border-r border-gray-300 bg-gray-50 text-sm text-gray-600 font-medium">
                Actual Low
              </div>
              <div className="p-4 border-r border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">12</div>
              </div>
              <div className="p-4 border-r border-gray-300 text-center bg-red-50">
                <div className="text-2xl text-gray-700">48</div>
              </div>
              <div className="p-4 text-center bg-green-50">
                <div className="text-2xl text-gray-700">290</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">True Positives</div>
              <div className="text-2xl text-green-700">910</div>
              <div className="text-xs text-gray-500 mt-1">Correctly predicted</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">False Positives</div>
              <div className="text-2xl text-red-700">190</div>
              <div className="text-xs text-gray-500 mt-1">Incorrectly predicted</div>
            </div>
            <div className="border border-gray-300 p-4">
              <div className="text-sm text-gray-600 mb-1">Overall Accuracy</div>
              <div className="text-2xl text-gray-700">82.7%</div>
              <div className="text-xs text-gray-500 mt-1">910 / 1100 samples</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
