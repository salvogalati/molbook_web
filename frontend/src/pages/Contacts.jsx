import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Divider } from 'primereact/divider';
import { FloatLabel } from 'primereact/floatlabel';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import "./styles/Contacts.css"

export default function Contacts() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Gestione form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Finto submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setForm({ name: "", email: "", message: "" });
      setDialogVisible(true)
    }, 1000);
  };

  return (
    <div id="GridContacts" style={{ background: "#f6f7fb" }}>
      <div id="item1-contacts">
        <Card style={{ boxShadow: "0 4px 24px #9992" }}>
          <div>
            <h5 style={{
              margin: 0,
              fontWeight: "bold",
              color: "orange",
              letterSpacing: "1px",
              textAlign: "left",
              fontSize: "1.15rem",
              paddingBottom: "0.5rem"
            }}>
              Get in touch
            </h5>
            <h2 style={{
              margin: 0,
              fontWeight: "bold",
              color: "#193858",
              letterSpacing: "1px",
              textAlign: "left",
              fontSize: "2.5rem",
            }}>
              Let's Chat, Reach Out to Us
            </h2>
            <p className="m-0" style={{ textAlign: "left" }}>
              Have questions or feedbacks? We are you to help.
              Send us a message and we'll responde in 24h hours

            </p>
          </div>
          <Divider />
          <div className="contact-names-row">
              <FloatLabel className="name-field">
                <InputText  className="w-full"/>
                <label >First Name</label>
              </FloatLabel>
            

              <FloatLabel className="name-field">
                <InputText className="w-full"/>
                <label >Last Name</label>
              </FloatLabel>
          </div>
          <div className="flex justify-content-center pb- w-full">
              <FloatLabel className="w-full">
                <InputText className="w-full" />
                <label >Email</label>
              </FloatLabel>
            </div>
          <div className="field mb-4">
            <label htmlFor="message" className="block mb-2 mt-5 text-left">Message</label>
            <InputTextarea
              id="message"
              name="message"
              rows={5}
              style={{height: "6rem", width: "100%"}}
            />
          </div>
          <Button
            type="submit"
            label={loading ? "Sending..." : "Submit"}
            icon="pi pi-send"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
          />
        </Card>
      </div>
      <div id="item2-contacts" >
        <Card id="ImageContacts" style={{ padding: "0" }}>
          <img src="https://www.shutterstock.com/image-photo/using-laptop-show-icon-address-600nw-2521386695.jpg" 
          style={{borderRadius: "20px"}} alt="" />
        </Card>
      </div>
      <div>
        <Card id="Contacts" style={{boxShadow: "0 4px 24px #9992"}}>
          <div style={{display:"flex" ,gap:"4rem", flexDirection: "column"}}>
            <div style={{display: "flex", alignItems: "center"}}>
              <Avatar icon="pi pi-envelope" size="large" shape="circle" />
              <div class="social-contacts" >
                <h3 style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>Email</h3>
                <p style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>molbook@farm.unipi.it</p>
              </div>
              
            </div>
            <div style={{display: "flex", alignItems: "center",}}>
              <Avatar icon="pi pi-phone" size="large" shape="circle" />
              <div class="social-contacts">
                <h3 style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>Phone</h3>
                <p style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>800 900 313</p>
              </div>
              
            </div>
          </div>
                    <div style={{display:"flex" ,gap:"4rem", flexDirection: "column"}}>
            <div style={{display: "flex", alignItems: "center",}}>
              <Avatar icon="pi pi-facebook" size="large" shape="circle" />
              <div class="social-contacts">
                <h3 style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>Facebook</h3>
                <p style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>MolBook Pro</p>
              </div>
              
            </div>
            <div style={{display: "flex", alignItems: "center",}}>
              <Avatar icon="pi pi-linkedin" size="large" shape="circle" />
              <div class="social-contacts">
                <h3 style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>Linkedin</h3>
                <p style={{textAlign: "left", margin:"0px 0px 0px 2rem"}}>MolBook Pro s.r.l</p>
              </div>
              
            </div>
          </div>
        </Card>
      </div>
            {/* Confirmation Dialog */}
      <Dialog
        header={`Thank you, ${form.firstName || "there"}!`}
        visible={dialogVisible}
        style={{ width: "400px", textAlign: "center" }}
        onHide={() => setDialogVisible(false)}
        breakpoints={{ "640px": "90vw" }}
      >
        {/* Success icon */}
        <Avatar
          icon="pi pi-check-circle"
          size="xlarge"
          style={{ color: "#4caf50",backgroundColor: "transparent", marginBottom: ".5rem" }}
        />

        {/* Fancy message */}
        <p style={{ margin: ".5rem 0", lineHeight: "1.5" }}>
          Your message has been <strong>successfully</strong> sent!  
          We’ve received it and will get back to you within{" "}
          <strong>24 hours</strong>.
        </p>
        <p style={{ fontSize: ".9rem", color: "#666" }}>
          In the meantime, feel free to explore our <a href="/faq">FAQ</a> page
          or follow us on social media.
        </p>
      </Dialog>
    </div>
  );
}

