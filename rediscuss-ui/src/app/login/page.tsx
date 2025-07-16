'use client';
import api from "@/lib/api";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
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
            
        }
    });

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
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField 
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Kullanıcı Adı"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Şifre"
                        name="password"
                        type="password"
                    />

                    <Button 
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt:3, mb: 2}}
                    >
                        Giriş Yap
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}