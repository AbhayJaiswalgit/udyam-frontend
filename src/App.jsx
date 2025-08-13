import React, { useState, useEffect } from "react";
import "./App.css";
import ministryLogo from "./assets/MINISTRY_NAME.png";

function App() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formSchema, setFormSchema] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [panConsent, setPanConsent] = useState(false);

  // Fetch the form schema from the public folder
  useEffect(() => {
    fetch("/formSchema.json")
      .then((response) => response.json())
      .then((data) => setFormSchema(data))
      .catch((error) => console.error("Error fetching schema:", error));
  }, []);

  const validateField = (id, value) => {
    const field = formSchema.find((f) => f.id === id);
    if (!field) return "";

    if (field.validation.required && (!value || !value.trim())) {
      return field.validation.message;
    }

    if (
      field.validation.regex &&
      value &&
      !new RegExp(field.validation.regex).test(value)
    ) {
      return field.validation.message;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleNextStep = () => {
    const stepFields = formSchema.filter((f) => f.step === currentStep);
    let hasError = false;
    const newErrors = { ...errors };

    stepFields.forEach((field) => {
      const error = validateField(field.id, formData[field.id] || "");
      if (error) {
        newErrors[field.id] = error;
        hasError = true;
      } else {
        delete newErrors[field.id];
      }
    });

    if (currentStep === 1 && !aadhaarConsent) {
      alert("Please provide consent to proceed.");
      return;
    }
    if (currentStep === 2 && !panConsent) {
      alert("Please provide consent to proceed.");
      return;
    }

    setErrors(newErrors);

    if (!hasError) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://udyam-backend-production-ed5d.up.railway.app/api/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Form submitted successfully!");
        console.log("Success:", result);
      } else {
        alert(`Submission failed: ${result.message || "Unknown error"}`);
        console.error("Error:", result);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDisclaimer = (step) => {
    if (step === 1) {
      return (
        <div className="disclaimer-box">
          <ul className="disclaimer-list">
            <li>Aadhaar number shall be required for Udyam registration.</li>
            <li>
              The Aadhaar number shall be of the proprietor in the case of a
              proprietorship firm, of the managing partner in the case of a
              partnership firm and of a karta in the case of a Hindu Undivided
              Family (HUF).
            </li>
            <li>
              In case of a Company or a Limited Liability Partnership or a
              Cooperative Society or a Society or a Trust, the organisation or
              its authorised signatory shall provide its GSTIN(s) as per
              applicability of CGST Act 2017 and as notified by the ministry of
              MSME vide S.O. 1056(E) dated 05th March 2021) and PAN along with
              its Aadhaar number.
            </li>
          </ul>
          <div className="consent-checkbox">
            <input
              type="checkbox"
              checked={aadhaarConsent}
              onChange={() => setAadhaarConsent(!aadhaarConsent)}
            />
            <label>
              I, the holder of the above Aadhaar, hereby give my consent to
              Ministry of MSME, Government of India, for using my Aadhaar number
              as aliased by UIDAI for Udyam Registration. NIC / Ministry of
              MSME, Government of India, have informed me that my Aadhaar data
              will not be stored/shared, I, मैं, आधार धारक, इस प्रकारः उद्यम
              पंजीकरण के लिए यूआईडीएआई के साथ अपने आधार संख्या का उपयोग करने के
              लिए सूक्ष्म,लघु,उद्योग मंत्रालय, भारत सरकार को अपनी सहमति देता
              हूं। एनआईसीई / सूक्ष्म,लघु,उद्योग मंत्रालय, भारत सरकार ने मुझे
              सूचित किया है कि मेरा आधार डेटा संगृहीत/साझा-नहींकिया जाएगा।
            </label>
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="disclaimer-box">
          <p>
            I, the holder of the above PAN, hereby give my consent to Ministry
            of MSME, Government of India, for using my data/ information
            available in the Income Tax Returns filed by me...
          </p>
          <div className="consent-checkbox">
            <input
              type="checkbox"
              checked={panConsent}
              onChange={() => setPanConsent(!panConsent)}
            />
            <label>
              I, the holder of the above PAN, hereby give my consent...
            </label>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderFormFields = () => {
    const fields = formSchema.filter((f) => f.step === currentStep);
    // Split fields into two columns for steps 1 and 2
    const column1Fields = fields.filter((_, index) => index % 2 === 0);
    const column2Fields = fields.filter((_, index) => index % 2 !== 0);

    return (
      <div className="form-fields-grid">
        <div className="form-column">
          {column1Fields.map((field, index) => (
            <div key={field.id} className="form-field">
              <label htmlFor={field.id}>
                {currentStep === 1 && (
                  <span className="field-number">{index * 2 + 1}. </span>
                )}
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ""}
                  onChange={handleChange}
                  className={errors[field.id] ? "input-error" : ""}
                >
                  <option value="">
                    {field.placeholder || "Select an option"}
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={errors[field.id] ? "input-error" : ""}
                />
              )}
              {errors[field.id] && (
                <p className="error-message">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
        <div className="form-column">
          {column2Fields.map((field, index) => (
            <div key={field.id} className="form-field">
              <label htmlFor={field.id}>
                {currentStep === 1 && (
                  <span className="field-number">{index * 2 + 2}. </span>
                )}
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ""}
                  onChange={handleChange}
                  className={errors[field.id] ? "input-error" : ""}
                >
                  <option value="">
                    {field.placeholder || "Select an option"}
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={errors[field.id] ? "input-error" : ""}
                />
              )}
              {errors[field.id] && (
                <p className="error-message">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="udyam-container">
      <div className="header-top">
        <div className="header-logo">
          <img src={ministryLogo} alt="Ashok Stambh" />
        </div>
        <div className="header-title">
          <p>सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय</p>
          <p>Ministry of Micro, Small & Medium Enterprises</p>
        </div>
        <nav className="header-nav">
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">NIC Code</a>
            </li>
            <li>
              <a href="#">Useful Documents</a>
            </li>
            <li>
              <a href="#">Print / Verify</a>
            </li>
            <li>
              <a href="#">Update Details</a>
            </li>
            <li>
              <a href="#">Login</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="form-wrapper">
          <h1 className="main-form-title">
            UDYAM REGISTRATION FORM - For New Enterprise who are not Registered
            yet as MSME
          </h1>

          <div className="form-section">
            <div className="step-header">
              <p>
                {currentStep === 1
                  ? "Aadhaar Verification With OTP"
                  : currentStep === 2
                  ? "PAN Verification"
                  : "Address Details"}
              </p>
            </div>

            {renderFormFields()}

            {renderDisclaimer(currentStep)}

            <div className="form-actions">
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="validate-button"
                  disabled={isSubmitting}
                >
                  {currentStep === 1
                    ? "Validate & Generate OTP"
                    : "PAN Validate"}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
