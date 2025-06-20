
import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import { useNavigate } from 'react-router-dom';
import { Image } from 'primereact/image';
        

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const msgs = useRef(null);
    const navigate = useNavigate();
    const isFormValid = username.trim() !== '' && password.trim() !== '';

    const checkCredentials = () => {
        if (username === 'demo' && password === '123456') {
            navigate('/home');
        } else {
            if (msgs.current) {
                msgs.current.clear();
                msgs.current.show(
                    { severity: 'error', summary: 'Error', detail: 'Credential not correct', sticky: true, closable: false }
                );
            }
        }
    };


    return (
        <div className="card">
            <Image src="https://molbookpro.farm.unipi.it/wp-content/uploads/2024/09/MB02.png" alt="Image" width="200"/>
            <Card title="Login" style={{ width: "55%", margin: "auto", "boxShadow": "5px 5px 5px 2px lightblue", backgroundColor: "azure" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ "display": "flex", "flexDirection": "column", gap: '1rem', "width": "45%", margin: "0 auto" }}>
                        <label>Username</label>
                        <InputText value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", gap: '1rem', "width": "45%", margin: "0 auto" }}>
                        <label>Password</label>
                        <Password value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask
                            style={{ width: '100%', display: 'inline' }} inputStyle={{ width: '100%', }} />
                    </div>
                    <div style={{ "padding-top": "5%" }}>
                        <Button label="Sign-in" style={{ width: '30%', margin: "0 auto" }} onClick={checkCredentials} disabled={!isFormValid} />
                    </div>
                </div>
                <Messages ref={msgs} />
            </Card>
        </div>
        
    )
}

export default Login;