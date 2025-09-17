'use client';

import LoadingOverlay from "@/components/Static/LoadingOverlay";
import { register, RegisterFormState } from "@/lib/actions/auth";
import { AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function RegisterStatus() {
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
            {pending ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
        </Button>
    );
}

export default function Register() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const initialState: RegisterFormState = { error: null, success: false };
    const [state, formAction] = useActionState(register, initialState);

    useEffect(() => {
        if (state.success) {
            router.push('/login?registered=1');
        }
    }, [router, state.success]);

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
                        <RegisterStatus />
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
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                required
                                name="email"
                                type="email"
                                placeholder="ornek@mail.com"
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

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    required
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="********"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 text-sm">
                            <Checkbox id="terms" name="terms" />
                            <Label htmlFor="terms" className="font-normal cursor-pointer select-none text-left">
                                Kayıt olarak kullanım koşullarını ve gizlilik politikasını kabul ediyorum.
                            </Label>
                        </div>

                        <SubmitButton />
                    </form>
                    <p className="text-sm text-center text-muted-foreground mt-4">
                        Zaten hesabın var mı? <Link href="/login" className="text-primary hover:underline">Giriş yap</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
