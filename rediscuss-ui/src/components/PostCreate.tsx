import { SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";




export default function PostCreate() {
    return (
        <Card className="flex flex-col gap-2">
            <div className="flex m-2 items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-inner" />
                <p className="text-center text-sm">Yeni gönderi oluştur</p>
            </div>
            <div className="flex flex-col gap-2 m-2">
                <div className="flex flex-row gap-2">
                    <Input label="Topluluk" />
                </div>
                <div className="">
                    <Input label="Başlık" />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold">Gönderi İçeriği</label>
                    <textarea className="border border-input bg-background-600 rounded-lg outline-0
                hover:border-primary-300
                focus:border-primary-400" placeholder="Gönderi içeriğini buraya yazın..."></textarea>
                </div>
            </div>

            <div className="flex m-2">
                <Button className="inline-flex gap-2 right-4 min-w-25 h-8 p-2 shadow-lg">
                    <SendIcon className="w-5 h-5" />
                    Gönderi Oluştur
                </Button>
            </div>
        </Card>
    );
}

