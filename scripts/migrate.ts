import prisma from '../lib/prisma';

async function main() {
    try {
        // Добавляем колонку temp_payment_id
        await prisma.$executeRaw`ALTER TABLE payment ADD COLUMN IF NOT EXISTS temp_payment_id TEXT`;
        
        // Создаем уникальный индекс
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS payment_temp_payment_id_key ON payment(temp_payment_id) WHERE temp_payment_id IS NOT NULL`;
        
        // Создаем индекс для быстрого поиска
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_temp_payment_id ON payment(temp_payment_id)`;
        
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
