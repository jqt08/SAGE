export function FeatureImportance() {
  const features = [
    { feature: 'Genre', importance: 0.35 },
    { feature: 'Price', importance: 0.25 },
    { feature: 'Release Date', importance: 0.20 },
    { feature: 'Platform', importance: 0.15 },
    { feature: 'Developer', importance: 0.05 },
  ];

  return (
    <div className="border border-gray-300 bg-white p-6">
      <h3 className="mb-4">Feature Importance</h3>
      
      <div className="border border-gray-300">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="px-4 py-2.5 border-r border-gray-300 text-gray-600">
            Feature
          </div>
          <div className="px-4 py-2.5 text-gray-600">
            Importance
          </div>
        </div>
        
        {features.map((item, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-2 ${
              index !== features.length - 1 ? 'border-b border-gray-300' : ''
            }`}
          >
            <div className="px-4 py-2.5 border-r border-gray-300 text-gray-600">
              {item.feature}
            </div>
            <div className="px-4 py-2.5 text-gray-600">
              {item.importance.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
