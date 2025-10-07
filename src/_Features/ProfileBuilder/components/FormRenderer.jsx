import { useState } from 'react';
import { FieldRenderer } from './FieldRenderer';
import { CheckCircle } from 'lucide-react';

export function FormRenderer({ form, onSubmit, onChange }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: '' }));
    onChange?.(fieldId, value);
  };

  const validateField = (field, value) => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (field.validation) {
      for (const rule of field.validation) {
        if (rule.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return rule.message || 'Invalid email address';
          }
        }
        if (rule.type === 'url' && value) {
          try {
            new URL(value);
          } catch {
            return rule.message || 'Invalid URL';
          }
        }
        if (rule.type === 'minLength' && value && value.length < rule.value) {
          return rule.message || `Minimum length is ${rule.value}`;
        }
        if (rule.type === 'maxLength' && value && value.length > rule.value) {
          return rule.message || `Maximum length is ${rule.value}`;
        }
        if (rule.type === 'custom' && rule.validator && value) {
          if (!rule.validator(value)) {
            return rule.message || 'Validation failed';
          }
        }
      }
    }

    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (field.min !== undefined && numValue < field.min) {
        return `Value must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `Value must be at most ${field.max}`;
      }
    }

    return null;
  };

  const validateSection = (sectionIndex) => {
    const section = form.sections[sectionIndex];
    const newErrors = {};
    let isValid = true;

    section.fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((prev) => Math.min(prev + 1, form.sections.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let allValid = true;
    form.sections.forEach((_, index) => {
      if (!validateSection(index)) {
        allValid = false;
      }
    });

    if (allValid) {
      onSubmit(formData);
      setIsSubmitted(true);
    } else {
      setCurrentSection(0);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4CA466] rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">Form Submitted!</h2>
          <p className="text-lg text-[#666666] mb-8">
            {form.settings?.confirmationMessage || 'Thank you for your submission!'}
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({});
              setCurrentSection(0);
            }}
            className="px-6 py-3 bg-[#4CA466] text-white rounded-lg font-medium hover:bg-[#3d8a52] transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const section = form.sections[currentSection];
  const progress = ((currentSection + 1) / form.sections.length) * 100;

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1E1E1E] mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-lg text-[#666666]">{form.description}</p>
          )}
        </div>

        {form.settings?.showProgressBar && form.sections.length > 1 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-[#666666] mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4CA466] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-[#F5F5F5] border border-[#DDDDDD] rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-[#1E1E1E] mb-2">{section.title}</h2>
            {section.description && (
              <p className="text-[#666666] mb-6">{section.description}</p>
            )}

            <div className="space-y-6">
              {section.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  error={errors[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-[#DDDDDD] text-[#666666] rounded-lg font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-[#666666]">
              Section {currentSection + 1} of {form.sections.length}
            </div>

            {currentSection < form.sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#4CA466] text-white rounded-lg font-medium hover:bg-[#3d8a52] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-[#4CA466] text-white rounded-lg font-medium hover:bg-[#3d8a52] transition-colors"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
