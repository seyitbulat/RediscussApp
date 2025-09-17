import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { setDiscuit } from "@/lib/discuit"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"


export default function CreateDiscuit() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleAddDiscuit = async () => {
        const response = await setDiscuit(name, description)
        if (response !== null) {
            setName("")
            setDescription("")
            setOpen(false)
            router.push(`/d/${response.name}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group w-full justify-start gap-3 rounded-lg border border-dashed border-primary/40 bg-muted/40 px-4 py-4 text-left text-sm font-medium shadow-sm transition-all hover:border-primary hover:bg-primary/10"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <PlusCircle className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="flex flex-col items-start leading-tight">
                        <span>Discuit Oluştur</span>
                        <span className="text-xs text-muted-foreground">Yeni bir topluluk başlat</span>
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discuit Oluştur</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="Discuit adı..."
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />
                    <Textarea
                        placeholder="Açıklama (opsiyonel)"
                        value={description}
                        onChange={(e) => setDescription(e.currentTarget.value)}
                        rows={3}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleAddDiscuit}>Oluştur</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}