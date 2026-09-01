import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#090a0c] px-4 text-white flex items-center justify-center">
      <Card className="w-full max-w-lg border-white/[0.1] bg-[#15171b] text-white shadow-2xl shadow-black/30">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="mb-6 flex justify-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#c7f36a]/10 text-[#c7f36a]"><AlertCircle className="h-9 w-9" /></div></div>
          <div className="mb-2 text-5xl font-black tracking-tight text-[#c7f36a]">404</div>
          <h1 className="mb-3 text-xl font-semibold">هذه الصفحة غير موجودة</h1>
          <p className="mb-8 text-sm leading-7 text-white/45">يبدو أن الرابط غير صحيح أو أن الصفحة نُقلت. يمكنك العودة إلى مساحة TEXT.AI والبدء من جديد.</p>
          <Button onClick={() => setLocation("/")} className="rounded-xl bg-[#c7f36a] px-6 text-[#10120e] hover:bg-[#d7ff84]"><Home className="ml-2 h-4 w-4" />العودة إلى TEXT.AI</Button>
        </CardContent>
      </Card>
    </div>
  );
}
