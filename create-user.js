const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar ou atualizar usuário Matrix
    const user = await prisma.user.upsert({
      where: { id: 'matrix-user-1' },
      update: {
        name: 'Matrix User',
        email: 'matrix@bitcoinobservatory.com',
      },
      create: {
        id: 'matrix-user-1',
        name: 'Matrix User',
        email: 'matrix@bitcoinobservatory.com',
      },
    });

    console.log('✅ Usuário criado/atualizado:', user);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
