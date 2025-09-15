import React, { useState } from 'react';
import { X, Clock, Award, GripVertical, Image, RotateCcw } from 'lucide-react';

interface RearrangeItem {
  id: string;
  value_preview: string;
  has_images: boolean;
}

interface RearrangeQuestion {
  id: string;
  title: string;
  prompt: string;
  difficulty_level: string;
  marks: number;
  time_limit: number;
  items: RearrangeItem[];
  topic: string;
  subtopic: string;
  tags: string[];
  is_drag_and_drop: boolean;
}

interface RearrangePreviewModalProps {
  question: RearrangeQuestion | null;
  isOpen: boolean;
  onClose: () => void;
}

const RearrangePreviewModal: React.FC<RearrangePreviewModalProps> = ({ question, isOpen, onClose }) => {
  const [draggedItems, setDraggedItems] = useState<RearrangeItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showCorrectOrder, setShowCorrectOrder] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  React.useEffect(() => {
    if (question) {
      setDraggedItems([...question.items]);
      setShowCorrectOrder(false);
      setSelectedOptions([]);
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...draggedItems];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the dragged item
    newItems.splice(draggedIndex, 1);
    
    // Insert at new position
    newItems.splice(dropIndex, 0, draggedItem);
    
    setDraggedItems(newItems);
    setDraggedIndex(null);
  };

  const resetOrder = () => {
    setDraggedItems([...question.items]);
    setShowCorrectOrder(false);
    setSelectedOptions([]);
  };

  const showCorrectOrderHandler = () => {
    setShowCorrectOrder(true);
    // For demo purposes, we'll assume the original order is correct
    // In a real app, this would come from the API
    setDraggedItems([...question.items]);
  };

  const handleOptionSelect = (itemId: string, position: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[position] = itemId;
    setSelectedOptions(newSelectedOptions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                  {question.difficulty_level}
                </span>
                <span className="text-sm text-gray-500">{question.topic} • {question.subtopic}</span>
                {question.is_drag_and_drop && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center gap-1">
                    <GripVertical className="w-3 h-3" />
                    Drag & Drop
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{question.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{question.marks} marks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{question.time_limit} seconds</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions:</h3>
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-[#4CA466]">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {question.prompt}
              </p>
            </div>
          </div>

          {/* Interactive Rearrange Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {question.is_drag_and_drop ? 'Rearrange the items:' : 'Select the correct order:'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={showCorrectOrderHandler}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#4CA466] hover:text-[#3d8a54] hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Show Correct Order
                </button>
                <button
                  onClick={resetOrder}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            {question.is_drag_and_drop ? (
              // Drag and Drop Mode
              <div className="space-y-3">
                {draggedItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-move hover:border-[#4CA466] hover:shadow-md ${
                      draggedIndex === index
                        ? 'border-[#4CA466] bg-green-50 shadow-lg'
                        : showCorrectOrder
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          showCorrectOrder ? 'bg-green-500 text-white' : 'bg-[#4CA466] text-white'
                        }`}>
                          {index + 1}
                        </span>
                        {item.has_images && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            <Image className="w-3 h-3" />
                            Image
                          </div>
                        )}
                        <span className="text-gray-800 font-medium">
                          {item.value_preview}
                        </span>
                        {showCorrectOrder && (
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Correct Position
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Options Mode (when drag and drop is disabled)
              <div className="space-y-4">
                {Array.from({ length: question.items.length }, (_, position) => (
                  <div key={position} className="p-4 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-[#4CA466] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {position + 1}
                      </span>
                      <span className="text-gray-700 font-medium">Position {position + 1}:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {question.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleOptionSelect(item.id, position)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            selectedOptions[position] === item.id
                              ? 'border-[#4CA466] bg-green-50 text-[#4CA466]'
                              : showCorrectOrder && position === question.items.findIndex(i => i.id === item.id)
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.has_images && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                <Image className="w-3 h-3" />
                                Image
                              </div>
                            )}
                            <span className="font-medium">{item.value_preview}</span>
                            {showCorrectOrder && position === question.items.findIndex(i => i.id === item.id) && (
                              <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Correct
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!showCorrectOrder && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> {question.is_drag_and_drop 
                    ? 'Drag and drop the items above to rearrange them in the correct order.'
                    : 'Select the correct item for each position from the options provided.'
                  }
                </p>
              </div>
            )}
            
            {showCorrectOrder && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ <strong>Correct Order:</strong> The items are now displayed in their correct sequence.
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RearrangePreviewModal;