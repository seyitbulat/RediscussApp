'use client';


export default function Login(){



    return(
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white rounded-xl max-w-sm shadow-lg p-8 w-full">
                <h1 className="text-2xl font-semibold mb-6 text-center select-none">Rediscuss Login</h1>
                <form>
                   <div className="relative mt-2">
                        <input 
                        type="text" 
                        placeholder=" "
                        required
                        className="peer w-full border pt-4 pb-1 px-2 border-gray-300 rounded text-sm
                              focus:border-blue-500 focus:outline-none transition-colors"
                        onInput={(e) => e.currentTarget.value ? e.currentTarget.classList.add('has-value') : e.currentTarget.classList.remove('has-value')}
                        />

                        <label className="absolute left-1 top-2.5 pointer-events-none text-transparent select-none transition-all
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-2 peer-placeholder-shown:text-gray-500
                        peer-focus:top-0 peer-focus:text-blue-500
                        peer-[.has-value]:text-blue-500 peer-[.has-value]:top-0 peer-[.has-value]:left-2
                        ">
                            Kullanıcı Adı
                        </label>
                   </div>

                   <div className="relative mt-2">
                        <input 
                        type="password" 
                        placeholder=" "
                        required
                        className="peer w-full border pt-4 pb-1 px-2 border-gray-300 rounded text-sm
                              focus:border-blue-500 focus:outline-none transition-colors"
                        onInput={(e) => e.currentTarget.value ? e.currentTarget.classList.add('has-value') : e.currentTarget.classList.remove('has-value')}
                        />

                        <label className="absolute left-1 top-2.5 pointer-events-none text-transparent select-none transition-all
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-2 peer-placeholder-shown:text-gray-500
                        peer-focus:top-0 peer-focus:text-blue-500
                        peer-[.has-value]:text-blue-500 peer-[.has-value]:top-0 peer-[.has-value]:left-2
                        ">
                            Şifre
                        </label>
                   </div>


                   <div className="relative mt-4 flex justify-center">
                        <button className="w-full bg-red-500 rounded shadow">Giriş Yap</button>
                   </div>
                </form>
            </div>
        </div>
    );
}