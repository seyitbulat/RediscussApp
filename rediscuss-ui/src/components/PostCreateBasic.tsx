'use client';
import { ChevronDown, SendIcon } from "lucide-react";
import Input from "./Static/Input";
import { useState } from "react";



interface PostCreateBasicProps {
    subredisId?: string;
}

export default function PostCreateBasic({subredisId}: PostCreateBasicProps) {
    const [expanded, setExpanded] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleExpand = () => {
        setExpanded(v => !v);
    }


    const handleSubmit = async () =>{
        const response = await fetch('/api/post/create', {
            method: 'POST',
            body: JSON.stringify({
                title,
                content,
                subredisId})
    });
}

    return (
        <div className="flex flex-col border border-secondary-200 rounded-xl gap-2">
            <div className="flex justify-between items-center">
                <div className="flex m-2 items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-inner" />
                    <p className="text-center text-sm">Yeni gönderi oluştur</p>
                </div>

                <div className="mr-2 flex">
                    <button
                        className="border-secondary-100 shadow
                        rounded-full
                transition-colors
                hover:bg-background-600
                focus:bg-background-700
                    "
                    onClick={handleExpand}
                    >
                        <ChevronDown className={
                            `w-6 h-6 text-accent-400 transition-all duration-300
                            ${expanded ? "rotate-0" : "rotate-180"}`
                        } />
                    </button>
                </div>
            </div>
            <div className={`flex flex-col gap-2 m-2 max-h-0 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-96" : "max-h-0"}`}>

                <div className="">
                    <Input label="Başlık" onChange={(e) => setContent(e.currentTarget.value)}/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-semibold">Gönderi İçeriği</label>
                    <textarea className="border border-secondary-200 bg-background-600 rounded-lg outline-0
                hover:border-primary-300
                focus:border-primary-400" placeholder="Gönderi içeriğini buraya yazın..."
                onChange={(e) => setTitle(e.currentTarget.value)}
                ></textarea>
                </div>
            </div>

            <div className={`flex m-2 max-h-0 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-12" : "max-h-0"}`}>
                <button className="inline-flex gap-2 right-4 border border-secondary-200 rounded-xl min-w-25 h-8 items-center p-2 bg-primary-400 text-secondary-50 shadow-lg"
                    onClick={handleSubmit}
                >
                    <SendIcon className="w-5 h-5" />
                    Gönderi Oluştur
                </button>
            </div>
        </div>
    );
}