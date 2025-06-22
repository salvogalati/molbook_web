import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";

export default function SignUpSteps({ activeIndex, formData, onChange }) {
  const { first_name, last_name, birth_date, gender } = formData;
  const STEP_CONTENTS = [(
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
        <div className="py-1 w-12">
          <div className="flex flex-column gap-2">
            <label htmlFor="firstname" style={{ fontWeight: "bold" }}>
              First Name
            </label>
            <InputText
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
            <InputText id="lastname" style={{ width: "100%" }} onChange={(e) => onChange("last_name", e.target.value)} />
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

        <div className=" w-12 py-1">
          <div className="flex flex-column gap-2 ">
            <label htmlFor="date" style={{ fontWeight: "bold" }}>
              Date of Birth
            </label>
            <Calendar
            value={formData.birth_date}                    
            onChange={e => onChange('birth_date', e.value)} 
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
      </div>
    </>),
    (
<>
          <label style={{ fontWeight: "bold" }}>
            STEP 2
          </label>
</>
    )
  ];

  return STEP_CONTENTS[activeIndex] || null;
}
