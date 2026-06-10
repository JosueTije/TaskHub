#!/usr/bin/env node
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const { hashPassword, validatePasswordStrength } = require("../src/utils/password");

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    if (hidden && process.stdin.isTTY) {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      let input = "";
      const onData = (char) => {
        const c = char.toString();
        if (c === "\n" || c === "\r") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(input);
        } else if (c === "") {
          process.exit();
        } else if (c === "") {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(question + "*".repeat(input.length));
          }
        } else {
          input += c;
          process.stdout.write("*");
        }
      };
      process.stdin.on("data", onData);
    } else {
      rl.question(question, resolve);
    }
  });
}

async function main() {
  console.log("\n=== TaskHub — Crear Usuario ADMIN ===\n");

  const email = (await ask("Email: ")).trim();
  if (!email || !email.includes("@")) {
    console.error("Email inválido.");
    process.exit(1);
  }

  const fullName = (await ask("Nombre completo: ")).trim();
  if (!fullName) {
    console.error("El nombre no puede estar vacío.");
    process.exit(1);
  }

  const password = await ask("Contraseña: ", true);
  if (!validatePasswordStrength(password)) {
    console.error(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
    );
    process.exit(1);
  }

  const confirm = await ask("Confirmar contraseña: ", true);
  if (password !== confirm) {
    console.error("Las contraseñas no coinciden.");
    process.exit(1);
  }

  rl.close();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Ya existe un usuario con el email: ${email}`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  console.log(`\nAdmin creado exitosamente:`);
  console.log(`  ID:     ${user.id}`);
  console.log(`  Email:  ${user.email}`);
  console.log(`  Nombre: ${user.fullName}`);
  console.log(`  Rol:    ${user.role}\n`);
}

main()
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
