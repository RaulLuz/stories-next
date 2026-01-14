import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Story } from "@/types/story";

if (!process.env.POSTGRES_URL) {
  console.warn("POSTGRES_URL não encontrada. Usando modo de fallback.");
}

const sql = neon(process.env.POSTGRES_URL || "");

// GET - Buscar todos os stories (excluindo expirados)
export async function GET() {
  try {
    const now = Date.now();
    
    const result = await sql`
      SELECT * FROM stories 
      WHERE expires_at > ${now}
      ORDER BY created_at DESC
    `;

    const stories: Story[] = result.map((row: any) => ({
      id: row.id,
      mediaBase64: row.media_base64,
      mediaType: row.media_type,
      textOverlay: row.text_overlay || undefined,
      comments: row.comments || [],
      createdAt: Number(row.created_at),
      expiresAt: Number(row.expires_at),
    }));

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Erro ao buscar stories:", error);
    return NextResponse.json(
      { error: "Erro ao buscar stories" },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo story
export async function POST(request: NextRequest) {
  try {
    const story: Story = await request.json();

    await sql`
      INSERT INTO stories (
        id, media_base64, media_type, text_overlay, 
        comments, created_at, expires_at
      ) VALUES (
        ${story.id},
        ${story.mediaBase64},
        ${story.mediaType},
        ${story.textOverlay ? JSON.stringify(story.textOverlay) : null},
        ${story.comments ? JSON.stringify(story.comments) : JSON.stringify([])},
        ${story.createdAt},
        ${story.expiresAt}
      )
    `;

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Erro ao adicionar story:", error);
    
    // Verificar se é erro de espaço
    if (error.message?.includes("out of space") || error.code === "53400") {
      return NextResponse.json(
        { error: "STORAGE_FULL" },
        { status: 507 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao adicionar story" },
      { status: 500 }
    );
  }
}

// DELETE - Remover story por ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do story é obrigatório" },
        { status: 400 }
      );
    }

    await sql`DELETE FROM stories WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar story:", error);
    return NextResponse.json(
      { error: "Erro ao deletar story" },
      { status: 500 }
    );
  }
}
