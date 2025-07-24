'use client';

import { AppBar, AppBarOwnProps, IconButton, styled, Toolbar, Typography } from "@mui/material";
import {Menu, MenuOpen} from "@mui/icons-material"

const drawerWidth = 200;

interface AppBarProps extends AppBarOwnProps{
    open?: boolean;
}

const StyledAppBar = styled(AppBar,{
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) =>({
        zIndex: theme.zIndex.drawer += 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth})`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
            })
        }),
        backgroundColor: 'white'
}));

interface AppHeaderProps {
    open: boolean,
    onMenuClick: () => void
}


export default function AppHeader({open, onMenuClick}: AppHeaderProps){
    return (
        <StyledAppBar position="fixed" open={open}>
            <Toolbar sx={{color: '#2f0147'}}>
                <IconButton 
                    color="inherit"
                    aria-label="open drawer"
                    onClick={onMenuClick}
                    edge = "start"
                    sx = {{
                        marginRight: 5,
                        ...(open && {display: 'none'})
                    }}
                >
                    <MenuOpen />
                </IconButton>

                <Typography variant="h6">
                    Rediscuss
                </Typography>
            </Toolbar>
        </StyledAppBar>
    );
}