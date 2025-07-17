'use client';
import api from "@/lib/api";
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";


interface LoginData{
    username?: string,
    password?: string
}

export default function LoginPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginMutation = useMutation({
        mutationFn: (loginData: LoginData) => {
            return api.post("/gateway/auth/login", loginData);
        },
        onSuccess: (response) => {
            const {token} = response.data;

            if(token){
                localStorage.setItem("token", token);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        loginMutation.mutate({username, password});
    }

    return (
        <Container component='main' maxWidth='xs'>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                <Typography>
                    Giriş Yap
                </Typography>
                <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
                    <TextField 
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Kullanıcı Adı"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled = {loginMutation.isPending}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Şifre"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled = {loginMutation.isPending}
                    />

                    {loginMutation.isError && (
                        <Alert severity="error" >
                            {loginMutation.error?.message || 'Kullanıcı adı veya şifre hatalı.'}
                        </Alert>
                    )}
                    <Button 
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt:3, mb: 2}}
                    >
                        {loginMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Giriş Yap"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}