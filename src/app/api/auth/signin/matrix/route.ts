import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Verificar credenciais Matrix
    if (username === env.NEXT_PUBLIC_LOGIN_USERNAME && password === env.NEXT_PUBLIC_LOGIN_PASSWORD) {
      // Simular criação de usuário no banco (usando credenciais Matrix)
      // Em um sistema real, você criaria ou buscaria o usuário do banco

      // Retornar sucesso - o NextAuth será configurado para aceitar essas credenciais
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro no login Matrix:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
