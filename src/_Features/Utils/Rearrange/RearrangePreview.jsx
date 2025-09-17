import React, { useState } from 'react';
import { X, Clock, Award, BookOpen, Info, GripVertical, RotateCcw } from 'lucide-react';

const RearrangePreview = ({ rearrange, isOpen, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  React.useEffect(() => {
    if (rearrange && isOpen) {
      // Initialize with shuffled order (not the correct order)
      setCurrentOrder([...rearrange.items]);
      setShowExplanation(false);
    }
  }, [rearrange, isOpen]);

  if (!isOpen || !rearrange) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.item_id === targetItem.item_id) return;

    const newOrder = [...currentOrder];
    const draggedIndex = newOrder.findIndex(item => item.item_id === draggedItem.item_id);
    const targetIndex = newOrder.findIndex(item => item.item_id === targetItem.item_id);

    // Remove dragged item and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setCurrentOrder(newOrder);
    setDraggedItem(null);
  };

  const getCorrectOrder = () => {
    return rearrange.correct_order.map(correctId => 
      rearrange.items.find(item => item.item_id === correctId)
    );
  };

  const isCorrectOrder = () => {
    const correctOrder = rearrange.correct_order;
    const currentOrderIds = currentOrder.map(item => item.item_id);
    return JSON.stringify(correctOrder) === JSON.stringify(currentOrderIds);
  };

  const resetOrder = () => {
    setCurrentOrder([...rearrange.items]);
    setShowExplanation(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {rearrange.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {rearrange.topic} • {rearrange.subtopic}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {rearrange.time_limit}s
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {rearrange.marks} pts
                </span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(rearrange.difficulty_level)}`}>
                {rearrange.difficulty_level}
              </span>
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
          {/* Question Images */}
          {rearrange.question_images && rearrange.question_images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Question Images:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rearrange.question_images.map((image, index) => (
                  <div key={image.image_id} className="bg-gray-50 rounded-lg p-4">
                    <img 
                      src={image.url} 
                      alt={image.alt_text} 
                      className="w-full h-auto rounded-lg"
                    />
                    {image.label && (
                      <p className="text-sm text-gray-600 mt-2">{image.label}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {rearrange.prompt}
              </p>
            </div>
          </div>

          {/* Rearrangeable Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Arrange the items: {rearrange.is_drag_and_drop ? '(Drag & Drop)' : '(Click to reorder)'}
            </h3>
            <div className="space-y-3">
              {currentOrder.map((item, index) => {
                const isCorrectPosition = showExplanation && 
                  rearrange.correct_order[index] === item.item_id;
                
                let itemClasses = "border-2 rounded-lg p-4 transition-all duration-200 ";
                
                if (rearrange.is_drag_and_drop) {
                  itemClasses += "cursor-move ";
                }
                
                if (showExplanation) {
                  if (isCorrectPosition) {
                    itemClasses += "border-green-500 bg-green-50 ";
                  } else {
                    itemClasses += "border-red-500 bg-red-50 ";
                  }
                } else {
                  itemClasses += "border-gray-200 hover:border-gray-300 bg-white ";
                }

                return (
                  <div
                    key={item.item_id}
                    draggable={rearrange.is_drag_and_drop && !showExplanation}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item)}
                    className={itemClasses}
                  >
                    <div className="flex items-center gap-4">
                      {rearrange.is_drag_and_drop && !showExplanation && (
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        {item.images && item.images.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.images[0].url} 
                              alt={item.images[0].alt_text} 
                              className="w-12 h-12 object-cover rounded"
                            />
                            <p className="text-gray-700">{item.value}</p>
                          </div>
                        ) : (
                          <p className="text-gray-700">{item.value}</p>
                        )}
                      </div>
                      {showExplanation && (
                        <div className="text-sm">
                          {isCorrectPosition ? (
                            <span className="text-green-600 font-medium">✓ Correct</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Wrong position</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Info className="w-4 h-4" />
              {showExplanation ? 'Hide' : 'Show'} Correct Order
            </button>
            <button
              onClick={resetOrder}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Result */}
          {showExplanation && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg border ${isCorrectOrder() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-medium ${isCorrectOrder() ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrectOrder() ? '🎉 Perfect! You got the correct order!' : '❌ Not quite right. Check the correct order below.'}
                </p>
              </div>
            </div>
          )}

          {/* Correct Order Display */}
          {showExplanation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Correct Order:</h3>
              <div className="space-y-2">
                {getCorrectOrder().map((item, index) => (
                  <div key={item.item_id} className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-800">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {item.images && item.images.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.images[0].url} 
                            alt={item.images[0].alt_text} 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <p className="text-gray-700">{item.value}</p>
                        </div>
                      ) : (
                        <p className="text-gray-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Explanation
              </h3>
              <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                {rearrange.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RearrangePreview;