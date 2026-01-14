import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Comment } from "@/types/story";

if (!process.env.POSTGRES_URL) {
  console.warn("POSTGRES_URL não encontrada. Usando modo de fallback.");
}

const sql = neon(process.env.POSTGRES_URL || "");

// GET - Buscar comentários de um story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT comments FROM stories WHERE id = ${params.id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    const comments: Comment[] = result[0].comments || [];
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    );
  }
}

// POST - Adicionar comentário a um story
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comment: Comment = await request.json();

    // Buscar story atual
    const result = await sql`
      SELECT comments FROM stories WHERE id = ${params.id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Story não encontrado" },
        { status: 404 }
      );
    }

    // Adicionar novo comentário
    const currentComments: Comment[] = result[0].comments || [];
    const updatedComments = [...currentComments, comment];

    // Atualizar story
    await sql`
      UPDATE stories 
      SET comments = ${JSON.stringify(updatedComments)}
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar comentário" },
      { status: 500 }
    );
  }
}
