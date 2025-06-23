import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Password } from 'primereact/password';
import { useState } from "react";
import { Checkbox } from 'primereact/checkbox';

export function EmailField({ value, onChange }) {
  const [touched, setTouched] = useState(false);
  const isValid = /^\S+@\S+\.\S+$/.test(value);

  return (
    <div className="w-12 py-1">
      <label htmlFor="email" style={{ fontWeight: "bold" }}>
        Email
      </label>
      <InputText
        id="email"
        type="email"   
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={touched && value !== "" && !isValid ? "p-invalid" : ""}
        style={{ width: "100%" }}
        required
      />
      {touched && value !== "" && !isValid && (
        <small className="p-error">
          Please enter a valid email address.
        </small>
      )}
    </div>
  );
}

export function CalendarField({ value, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eighteenYearsAgo = new Date(today);
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const isAdult = (() => {
    if (!(value instanceof Date)) return false;
    const bd = new Date(value);
    bd.setHours(0, 0, 0, 0);
    return bd <= eighteenYearsAgo;
  })();
  return (
    <div className=" w-12 py-1">
      <div className="flex flex-column gap-2 ">
        <label htmlFor="date" style={{ fontWeight: "bold" }}>
          Date of Birth
        </label>
        <Calendar
          value={value}
          onChange={e => onChange(e.target.value)}
          dateFormat="dd/mm/yy"
          showIcon
        />
        {value && !isAdult && (
          <small className="p-error">
            You must be at least 18 years old.
          </small>
        )}
      </div>
    </div>
  )
}

export function PasswordSignUp({ value, onChange }) {

  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const passwordsMatch = value.length > 0 && value === confirm;
  const handleBlur = () => {
    // segna come “toccato” al primo blur di uno dei due
    if (!touched) {
      setTouched(true);
    }
  };


  return (
    <div className="py-1 w-12">
      <div className="flex flex-column gap-2">
        <label style={{ fontWeight: "bold" }}>
          Password
        </label>
        <Password
          onChange={e => onChange(e.target.value)}
          value={value}
          toggleMask
          onBlur={handleBlur}
          feedback={false}
          className={touched && !passwordsMatch ? "p-invalid" : ""}
          style={{ width: "100%", display: "inline" }}
          inputStyle={{ width: "100%" }} />
        <label style={{ fontWeight: "bold" }}>
          Confirm Password
        </label>
        <Password
          onChange={e => setConfirm(e.target.value)}
          value={confirm}
          toggleMask
          onBlur={handleBlur}
          feedback={false}
          className={touched && !passwordsMatch ? "p-invalid" : ""}
          style={{ width: "100%", display: "inline" }}
          inputStyle={{ width: "100%" }} />
        {touched && confirm !== "" && !passwordsMatch && (
          <small className="p-error">
            Le password non corrispondono.
          </small>
        )}
      </div>
    </div>
  )
}

export default function SignUpSteps({ activeIndex, formData, onChange }) {
  const { first_name, last_name, birth_date, gender, email, password, consentPrivacy, consentTerms } = formData;

  const STEP_CONTENTS = [(
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <div className="py-1 w-12">
          <div className="flex flex-column gap-2">
            <label htmlFor="firstname" style={{ fontWeight: "bold" }}>
              First Name
            </label>
            <InputText
              value={formData.first_name}
              id="firstname"
              style={{ width: "100%" }}
              onChange={(e) => onChange("first_name", e.target.value)}
            />
          </div>
        </div>

        <div className="py-1 w-12">
          <div className="flex flex-column gap-2">
            <label htmlFor="lastname" style={{ fontWeight: "bold" }}>
              Last Name
            </label>
            <InputText id="lastname" value={formData.last_name} style={{ width: "100%" }} onChange={(e) => onChange("last_name", e.target.value)} />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "0.5rem 0",
            width: "50%",
          }}
        >
          <label htmlFor="gender" style={{ fontWeight: "bold" }}>
            Gender
          </label>
          <div className="flex flex-wrap gap-4 justify-content-evenly align-items-center pt-3">
            <div className="flex flex-row align-items-center justify-content-center">
              <RadioButton
                inputId="sexM"
                name="Male"
                value="Male"
                onChange={e => onChange('gender', e.value)}
                checked={formData.gender === 'Male'}
              />
              <label htmlFor="sex" className="ml-2">
                Male
              </label>
            </div>
            <div className="flex align-items-center justify-content-center">
              <RadioButton
                inputId="sefF"
                name="Female"
                value="Female"
                onChange={e => onChange('gender', e.value)}
                checked={formData.gender === 'Female'}
              />
              <label htmlFor="sex" className="ml-2">
                Female
              </label>
            </div>
          </div>
        </div>
        <CalendarField
          value={formData.birth_date}
          onChange={val => onChange('birth_date', val)}
        />

      </div>
    </>),
  (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          justifyContent: "space-evenly", // distribuisce i due campi al centro
          alignItems: "center",
        }}
      >
        <EmailField
          value={formData.email}
          onChange={val => onChange('email', val)}
        />


        <PasswordSignUp
          value={formData.password}
          onChange={val => onChange('password', val)}
        />
      </div>
    </>),
  (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          justifyContent: "space-evenly", // distribuisce i due campi al centro
          alignItems: "center",
        }}
      >
        <div className="flex align-items-center">
          <Checkbox inputId="terms" checked={formData.consentPrivacy} onChange={val => onChange('consentPrivacy', val.checked)} aria-required="true"/>
          <label htmlFor="privacy" className="ml-2">
            I consent to the processing of my personal data in accordance with the{' '}
            <a
              href="https://www.tuosito.it/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              Privacy Policy
            </a>
            .*
          </label>
        </div>
        <div className="flex align-items-center">
          <Checkbox inputId="terms" checked={formData.consentTerms} onChange={val => onChange('consentTerms', val.checked)} />
          <label htmlFor="terms" className="ml-2">
            I have read and agree to the{' '}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              Terms &amp; Conditions of Service
            </a>
            .*
          </label>
        </div>
                  {formData.consentTerms || !formData.consentTerms && (
  <small className="p-error">You must accept the Privacy Polixy and Terms & Conditions.</small>
)}
      </div>
    </>),
    (
      <>
           <div
        className="flex flex-column align-items-center p-4"
        style={{ gap: '1rem' }}
      >
        <i
          className="pi pi-check-circle"
          style={{ fontSize: '4rem', color: 'green' }}
        />
        <h3>Registration Successful!</h3>
        <p>
          Thank you for signing up. We’ve sent a confirmation email with a
          validation link to <strong>{formData.email}</strong>. Please check
          your inbox and click the link to activate your account.
        </p>
      </div> 
      </>
    )
  ];

  return STEP_CONTENTS[activeIndex] || null;
}
