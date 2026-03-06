import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInputField = ({ value, onChange }) => {
  // Logic to validate Kosovo prefixes if the country is +383
  const validateKosovoNumber = (number) => {
    if (number.startsWith('383')) {
      const mainPart = number.slice(3); // Remove 383
      // Kosovo valid prefixes: 43, 44, 45, 48, 49
      const validPrefixes = ['043', '044', '045', '048', '049', '43' , '44' , '45' , '48' , '49'];
      const hasValidPrefix = validPrefixes.some(prefix => mainPart.startsWith(prefix));
      
      if (mainPart.length > 0 && !hasValidPrefix) {
        return false; // Invalid prefix for Kosovo
      }
    }
    return true;
  };

  return (
    <div className="phone-input-container">
      <PhoneInput
        country={'xk'} // 'xk' is the code for Kosovo
        preferredCountries={['xk', 'al', 'de', 'ch', 'gb']} // Your top markets
        value={value}
        onChange={(phone) => {
          const isValid = validateKosovoNumber(phone);
          onChange(phone, isValid);
        }}
        inputProps={{
          required: true,
          name: 'phone',
        }}
        containerClass="booking-phone-container"
        inputClass="booking-input phone-field-fix"
        buttonClass="flag-dropdown-fix"
      />
      {!validateKosovoNumber(value) && value.startsWith('383') && (
        <span className="error-text">Prefixi i Kosovës duhet të jetë 044, 045, 043, 048, ose 049</span>
      )}
    </div>
  );
};

export default PhoneInputField;