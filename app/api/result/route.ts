
import { NextResponse } from "next/server";
import { calculateResult } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answers = body?.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({error:"Неверный формат ответов."},{status:400});
    }
    if (Object.keys(answers).length !== 56) {
      return NextResponse.json({error:"Нужно ответить на все 56 вопросов."},{status:400});
    }
    return NextResponse.json(calculateResult(answers), {headers:{"Cache-Control":"no-store"}});
  } catch (e:any) {
    return NextResponse.json({error:e?.message || "Не удалось рассчитать результат."},{status:400});
  }
}
