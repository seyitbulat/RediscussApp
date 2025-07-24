'use client';

import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";


const open = true;
const handleOnClick = () => {

};

const handleMenuClick = () =>{

}

export default function Home(){
  return (
    <AuthGuard>
      <AppHeader open={open} onMenuClick={handleOnClick} />
      <AppSidebar open={open} onClose={handleMenuClick}/>
    </AuthGuard>
  );
}