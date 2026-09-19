
import { NextResponse } from "next/server";
import { questions } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > questions.length) {
    return NextResponse.json({ error:"Вопрос не найден" }, { status:404 });
  }
  const q = questions[n-1];
  return NextResponse.json({
    id:q.id, block:q.block, text:q.text,
    options:q.options.map(o=>({id:o.id,text:o.text}))
  }, { headers: { "Cache-Control":"no-store" } });
}
