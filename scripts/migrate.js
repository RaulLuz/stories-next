/**
 * Script para executar migrations no Neon Database
 * 
 * Uso: node scripts/migrate.js
 * 
 * Requer: POSTGRES_URL nas variáveis de ambiente
 */

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  // Tentar carregar do .env.local se existir
  try {
    const envPath = path.join(__dirname, "../.env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const lines = envContent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key.trim() === "POSTGRES_URL" && valueParts.length > 0) {
            let value = valueParts.join("=").trim();
            // Remover aspas se existirem
            value = value.replace(/^["']|["']$/g, "");
            process.env.POSTGRES_URL = value;
            break;
          }
        }
      }
    }
  } catch (e) {
    // Ignorar erro ao tentar ler .env.local
  }
  
  const postgresUrl = process.env.POSTGRES_URL;
  
  if (!postgresUrl) {
    console.error("❌ Erro: POSTGRES_URL não encontrada");
    console.log("\n📝 Opção 1: Criar arquivo .env.local");
    console.log("   Crie um arquivo .env.local na raiz do projeto com:");
    console.log("   POSTGRES_URL=sua_connection_string_aqui");
    console.log("\n📝 Opção 2: Configurar variável de ambiente");
    console.log("   Windows: set POSTGRES_URL=sua_connection_string");
    console.log("   Linux/Mac: export POSTGRES_URL='sua_connection_string'");
    console.log("\n🔗 Obtenha a connection string em: https://console.neon.tech");
    process.exit(1);
  }

  try {
    const sql = neon(postgresUrl);
    
    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, "../lib/migrations/001_initial.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    console.log("🔄 Executando migration...");
    console.log("📄 Arquivo: 001_initial.sql");
    
    // Dividir o SQL em statements e executar cada um
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        console.log(`   Executando: ${trimmed.substring(0, 50)}...`);
        // Executar usando a função sql com SQL direto
        // Para SQL dinâmico, precisamos usar a função de forma diferente
        const result = await sql(trimmed);
        // Resultado pode ser vazio para CREATE TABLE, isso é normal
      }
    }
    
    console.log("✅ Migration executada com sucesso!");
    console.log("\n📊 Verifique a tabela no Neon Dashboard:");
    console.log("   https://console.neon.tech");
    
  } catch (error) {
    console.error("❌ Erro ao executar migration:", error.message);
    
    if (error.message.includes("already exists")) {
      console.log("\n💡 A tabela já existe. Isso é normal se você já executou a migration antes.");
    } else {
      console.log("\n🔍 Verifique:");
      console.log("1. A connection string está correta?");
      console.log("2. Você tem permissão para criar tabelas?");
      console.log("3. O banco de dados está acessível?");
      process.exit(1);
    }
  }
}

runMigration();
