import React, {useState} from 'react';
import apiClient from '../apiConfig';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await apiClient.post('/auth/login', {username, password});
        localStorage.setItem('jwt_token', response.data.token);


    };


    return (
        <form onSubmit={handleLogin}>
            <h2>Giriş Yap</h2>
            <input type="text" placeholder='Kullanıcı Adı' value={username} onChange={e => setUsername(e.target.value)}/>
            <input type="password" placeholder='Şifre' value={password} onChange={e => setPassword(e.target.value)}/>
            <button type="submit">Giriş</button>
        </form>
    );
}

export default Login;