"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { CSSObject, Divider, Drawer, IconButton, styled, Theme, useTheme } from "@mui/material";


const drawerWidth = 240;

const openedMixin = (theme: Theme) : CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden'
});


const closedMixin = (theme: Theme) : CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    }),
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
     width: `calc(${theme.spacing(8)} + 1px)`,
   },
});


const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    ...theme.mixins.toolbar
}))


const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'open'
})(
    ({theme, open}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
            ...openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme)
        })
    })
)


interface AppSidebarProps{
    open: boolean;
    onClose: () => void;
};

export default function AppSidebar({open, onClose} : AppSidebarProps){
    const theme = useTheme();

    return (
        <StyledDrawer variant="permanent" open={open} sx={{ backgroundColor: "#610f7f"}}>
            <DrawerHeader>
                <IconButton onClick={onClose}>
                    {theme.direction === 'rtl' ? <ChevronRight/> : <ChevronLeft/>}
                </IconButton>
            </DrawerHeader>
            <Divider/>
        </StyledDrawer>
    );
}
