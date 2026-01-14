import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Comment } from "@/types/story";

const getSql = () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL não encontrada nas variáveis de ambiente");
  }
  return neon(process.env.POSTGRES_URL);
};

// POST - Adicionar resposta a um comentário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const reply: Comment = await request.json();

    // Buscar story atual
    const sql = getSql();
    const result = await sql`
      SELECT comments FROM stories WHERE id = ${params.id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Story não encontrado" },
        { status: 404 }
      );
    }

    const comments: Comment[] = result[0].comments || [];
    
    // Encontrar comentário e adicionar resposta
    const updatedComments = comments.map((comment) => {
      if (comment.id === params.commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }
      return comment;
    });

    // Verificar se o comentário foi encontrado
    const commentFound = comments.some((c) => c.id === params.commentId);
    if (!commentFound) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar story
    const sql2 = getSql();
    await sql2`
      UPDATE stories 
      SET comments = ${JSON.stringify(updatedComments)}
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Erro ao adicionar resposta:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar resposta" },
      { status: 500 }
    );
  }
}
