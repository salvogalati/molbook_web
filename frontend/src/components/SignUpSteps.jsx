import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";

import "./styles/SignUpSteps.css";

/**
 * Email input with validation feedback
 */
export function EmailField({ value, onChange }) {
  const isValid = useMemo(() => /^\S+@\S+\.\S+$/.test(value), [value]);
  return (
    <div className="field-container">
      <label htmlFor="email" className="field-label">
        Email
      </label>
      <InputText
        id="email"
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={value && !isValid ? "p-invalid" : ""}
        required
      />
      {value && !isValid && (
        <small className="p-error">Please enter a valid email address.</small>
      )}
    </div>
  );
}

EmailField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * Date picker for birth date, ensuring 18+ validation
 */
export function CalendarField({ value, onChange }) {
  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const isAdult = useMemo(() => {
    if (!(value instanceof Date)) return false;
    const dob = new Date(value);
    dob.setHours(0, 0, 0, 0);
    return dob <= eighteenYearsAgo;
  }, [value, eighteenYearsAgo]);

  return (
    <div className="field-container">
      <label htmlFor="date" className="field-label">
        Date of Birth
      </label>
      <Calendar
        id="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        dateFormat="dd/mm/yy"
        touchUI
        showIcon
      />
      {value && !isAdult && (
        <small className="p-error">You must be at least 18 years old.</small>
      )}
    </div>
  );
}

CalendarField.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
};

/**
 * Password and confirmation fields with matching validation
 */
export function PasswordSignUp({ password, confirm, onPassword, onConfirm }) {
  const passwordsMatch = useMemo(
    () => password && password === confirm,
    [password, confirm]
  );

  return (
    <div className="field-container">
      <label className="field-label">Password</label>
      <Password
        value={password}
        onChange={e => onPassword(e.target.value)}
        toggleMask
        feedback={true}
        className={password && confirm && !passwordsMatch ? "p-invalid" : ""}
      />
      <label className="field-label" style={{ marginTop: '1rem' }}>
        Confirm Password
      </label>
      <Password
        value={confirm}
        onChange={e => onConfirm(e.target.value)}
        toggleMask
        feedback={false}
        className={password && confirm && !passwordsMatch ? "p-invalid" : ""}
      />
      {password && confirm && !passwordsMatch && (
        <small className="p-error">Passwords do not match.</small>
      )}
    </div>
  );
}

PasswordSignUp.propTypes = {
  password: PropTypes.string.isRequired,
  confirm: PropTypes.string.isRequired,
  onPassword: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

/**
 * Renders the content for each registration step
 */
export default function SignUpSteps({ activeIndex, formData, onChange }) {
  const steps = useMemo(
    () => [
      /* 0 - Personal Info */
      <>
        <div className="step-row">
          <div className="field-container small">
            <label htmlFor="firstname" className="field-label">First Name</label>
            <InputText
              id="firstname"
              value={formData.first_name}
              onChange={e => onChange("first_name", e.target.value)}
            />
          </div>
          <div className="field-container small">
            <label htmlFor="lastname" className="field-label">Last Name</label>
            <InputText
              id="lastname"
              value={formData.last_name}
              onChange={e => onChange("last_name", e.target.value)}
            />
          </div>
        </div>
        <div className="step-row">
          <div className="field-container small">
            <label className="field-label">Gender</label>
            <div className="gender-options">
              <div>
                <RadioButton
                  inputId="male"
                  name="gender"
                  value="Male"
                  onChange={e => onChange("gender", e.value)}
                  checked={formData.gender === "Male"}
                />
                <label htmlFor="male" className="option-label">Male</label>
              </div>
              <div>
                <RadioButton
                  inputId="female"
                  name="gender"
                  value="Female"
                  onChange={e => onChange("gender", e.value)}
                  checked={formData.gender === "Female"}
                />
                <label htmlFor="female" className="option-label">Female</label>
              </div>
            </div>
          </div>
          <CalendarField
            value={formData.date_of_birth}
            onChange={val => onChange("date_of_birth", val)}
          />
        </div>
      </>,

      /* 1 - Account Details */
      <div className="step-column">
        <EmailField
          value={formData.email}
          onChange={val => onChange("email", val)}
        />
        <PasswordSignUp
          password={formData.password}
          confirm={formData.confirmPassword}
          onPassword={val => onChange("password", val)}
          onConfirm={val => onChange("confirmPassword", val)}
        />
      </div>,

      /* 2 - Agreements */
      <div className="step-column">
        <div className="agreement">
          <Checkbox
            inputId="privacy"
            checked={formData.consentPrivacy}
            onChange={e => onChange("consentPrivacy", e.checked)}
          />
          <label htmlFor="privacy" className="agreement-label">
            I consent to the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.*
          </label>
        </div>
        <div className="agreement">
          <Checkbox
            inputId="terms"
            checked={formData.consentTerms}
            onChange={e => onChange("consentTerms", e.checked)}
          />
          <label htmlFor="terms" className="agreement-label">
            I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>.*
          </label>
        </div>
        {(!formData.consentPrivacy || !formData.consentTerms) && (
          <small className="p-error">
            You must accept both Privacy Policy and Terms & Conditions.
          </small>
        )}
      </div>,

      /* 3 - Confirmation */
      <div className="step-success">
        <i className="pi pi-check-circle success-icon" />
        <h3>Registration Successful!</h3>
        <p>
          A confirmation link has been sent to <strong>{formData.email}</strong>. Please check your email to activate your account.
        </p>
      </div>
    ],
    [formData, onChange]
  );

  return steps[activeIndex] || null;
}

SignUpSteps.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
