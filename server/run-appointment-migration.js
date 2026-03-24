import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔄 Running Appointments migration...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'add-appointments.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`✅ Success\n`);
      } catch (error) {
        // If table already exists, that's okay
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Already exists, skipping\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify table was created
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'Appointment'
    `;

    if (result.length > 0) {
      console.log('✅ Appointment table verified!\n');
      
      // Check if there are any appointments
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Appointment"`;
      console.log(`📊 Current appointments in database: ${count[0].count}\n`);
    } else {
      console.log('⚠️  Warning: Could not verify Appointment table\n');
    }

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
