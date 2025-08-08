import Input from "./Static/Input";




export default function PostCreate(){
    return(
         <div className="flex flex-col border border-secondary-200 rounded-xl">
            <div className="flex m-2 items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-inner" />
                <p className="text-center text-sm">Yeni gönderi oluştur</p>
            </div>
            <div>
                <Input/>
            </div>
        </div>
    );
}