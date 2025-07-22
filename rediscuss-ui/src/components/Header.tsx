'use client';

import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";


export default function Header(){
    const router = useRouter();

    const handleLogout = () =>{
        localStorage.removeItem("token");

        router.replace('/');
    };
    return(
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    Rediscuss
                </Typography>

                <Button color="inherit">
                    Çıkış Yap
                </Button>
            </Toolbar>
        </AppBar>
    );
}