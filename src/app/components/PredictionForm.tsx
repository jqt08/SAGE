import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

export function PredictionForm() {
  const [formData, setFormData] = useState({
    gameTitle: '',
    genre: '',
    releaseDate: '',
    price: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Predicting game success with:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border border-gray-300 bg-white p-8">
      <h2 className="mb-6">Predict Game Success</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Game Title"
          value={formData.gameTitle}
          onChange={(e) => handleChange('gameTitle', e.target.value)}
          className="border-gray-300"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Genre"
            value={formData.genre}
            onChange={(e) => handleChange('genre', e.target.value)}
            className="border-gray-300"
          />
          <Input
            placeholder="Release Date"
            value={formData.releaseDate}
            onChange={(e) => handleChange('releaseDate', e.target.value)}
            className="border-gray-300"
          />
        </div>
        
        <Input
          placeholder="Price"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="border-gray-300"
        />
        
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            className="bg-gray-400 hover:bg-gray-500 text-white px-8"
          >
            Predict
          </Button>
        </div>
      </form>
    </div>
  );
}
