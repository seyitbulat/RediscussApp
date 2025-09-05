'use client';

import LoadingOverlay from "@/components/Static/LoadingOverlay";
import { login, LoginFormState } from "@/lib/actions/auth";
import { AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

function LoginStatus() {
    const { pending } = useFormStatus();
    return pending ? <LoadingOverlay /> : null;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full"
            disabled={pending}
        >
            {pending ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>
    );
}

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const initialState: LoginFormState = { error: null, success: false };
    const [state, formAction] = useActionState(login, initialState);

    return (
        <div className="min-h-screen flex justify-center items-center bg-background">
            <div className="inset-0 overflow-hidden absolute -z-10">
                <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 opacity-10 animate-pulse bg-primary/30"></div>
                <div className="absolute w-60 h-60 rounded-full -bottom-10 -left-10 opacity-10 animate-pulse bg-primary/40"></div>
                <div className="absolute w-20 h-20 rounded-full top-1/2 left-1/4 opacity-10 animate-bounce bg-primary/20"></div>
            </div>

            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex justify-center items-center shadow-lg">
                        <span className="font-bold text-primary-foreground text-2xl select-none">R</span>
                    </div>
                    <CardTitle className="text-2xl font-semibold select-none pt-4">Rediscuss</CardTitle>
                </CardHeader>
                <CardContent>
                    {state.error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2 text-destructive text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{state.error}</span>
                        </div>
                    )}
                    <form action={formAction} className="space-y-4">
                        <LoginStatus />
                        <div className="grid gap-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                required
                                name="username"
                                type="text"
                                placeholder="kullanici_adi"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Şifre</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    required
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="rememberMe" name="rememberMe" />
                                <Label htmlFor="rememberMe" className="font-normal cursor-pointer select-none">
                                    Beni Hatırla
                                </Label>
                            </div>
                            <Link href="#" className="text-sm text-primary hover:underline">
                                Şifremi Unuttum
                            </Link>
                        </div>
                        
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
