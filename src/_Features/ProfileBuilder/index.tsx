import { useState,useEffect } from 'react';
// import { FormRenderer } from './components/FormRenderer';
import { FormCreator } from './components/FormCreator';
import { privateAxios } from '../../utils/axios';
import { showError,showSuccess } from '../../utils/toast';
interface Form {
  id: string;
  title: string;
  description?: string;
  sections: any[];
  settings?: any;
}

function FormBuilder() {
  const [generatedForm, setGeneratedForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

//   const handleFormGenerated = (form: Form) => {
//     setGeneratedForm(form);
//     console.log(form)
//     // setShowPreview(true);
//   };
const fetchform = async () => {
    try{
        const response = await privateAxios.get("/faculty/student/profile/form/forms");
        console.log(response.data)
        setFormData(response.data.data)


    }catch (error: any) {
    if (error.response) {
      console.error("Error Fetching form:", error.response.data);
      showError(`Error Fetching form: ${error.response.data.message || "Unknown error"}`);
    } else {
      console.error("Network or CORS error:", error);
      showError("Network error while fetching form.");
    }
  }
}

  useEffect(() => {
  fetchform()
  }, []);
const handleFormGenerated = async (form: Form) => {
  setGeneratedForm(form);

  try {
    const response = await privateAxios.post(
      "/faculty/student/profile/form/forms",
      form
    );

     showSuccess("Form Updated successfully:");
    // showSuccess(`Form created with ID: ${response.data?.data?.id}`);
    // setShowPreview(true);
  } catch (error: any) {
    if (error.response) {
      console.error("Error creating form:", error.response.data);
      showError(`Failed to create form: ${error.response.data.message || "Unknown error"}`);
    } else {
      console.error("Network or CORS error:", error);
      showError("Network error while creating form.");
    }
  }
};

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    setFormData(data);
    showSuccess('Form submitted successfully! Check the console for details.');
  };

  const handleChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed:`, value);
  };

  const handleBackToCreator = () => {
    setShowPreview(false);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-white">
      {!showPreview ? (
        <FormCreator onFormGenerated={handleFormGenerated} formData = {formData} />
      ) : (
        <>
          <div className="bg-[#F5F5F5] border-b border-[#DDDDDD] py-4 px-6">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleBackToCreator}
                className="text-[#4CA466] hover:text-[#3d8a52] font-medium transition-colors"
              >
                ← Back to Form Creator
              </button>
            </div>
          </div>

          {/* {generatedForm && (
            <FormRenderer
              form={generatedForm}
              onSubmit={handleSubmit}
              onChange={handleChange}
            />
          )} */}

          {Object.keys(formData).length > 0 && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="bg-[#F5F5F5] border border-[#DDDDDD] rounded-lg p-6">
                <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Submitted Data:</h3>
                <pre className="text-sm text-[#666666] overflow-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FormBuilder;