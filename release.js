import { execSync } from "child_process";
import readline from "readline-sync";
import fs from "fs";
import path from "path";
// importamos los proyectos desde un archivo JSON
import projectsConfig from "./environment.json" assert { type: "json" };

// 1. CONFIGURACIÓN DE PROYECTOS

// Mapeamos los proyectos para facilitar su uso
const projects = projectsConfig.map((project) => ({
  name: project.name,
  src: project.src,
  token: project.token,
  repoBaseURL: project.repoBaseURL,
  deployFolder: project.deployFolder,
}));

try {
  // 2. MENÚ DE SELECCIÓN
  console.log("\x1b[35m%s\x1b[0m", "=== GESTOR DE ENTREGAS ===");
  const options = projects.map((p) => p.name);
  const index = readline.keyInSelect(
    options,
    "Selecciona el proyecto a entregar:",
  );

  if (index === -1) {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  const selected = projects[index];

  // 3. INPUT DE DATOS
  const version = readline.question(
    `Introduce la version para ${selected.name} (ej: v1.1): `,
  );
  const token = selected.token;

  if (!token || !version)
    throw new Error(
      "Datos incompletos. Revisa que el JSON tenga el token y hayas escrito la versión.",
    );

  // Limpiamos la URL por si trae el https:// repetido
  const cleanRepoURL = selected.repoBaseURL.replace("https://", "");
  const repoURL = `https://${token}@${cleanRepoURL}`;

  // 4. VALIDACIÓN DE TOKEN
  console.log("\x1b[90m%s\x1b[0m", "Validando acceso a GitHub...");
  try {
    execSync(`git ls-remote ${repoURL} -h HEAD`, { stdio: "ignore" });
  } catch (e) {
    throw new Error("Acceso denegado. Revisa tu token en el archivo JSON.");
  }

  // 5. DEFINICIÓN DE RUTAS
  // Usamos la ruta local definida en el array
  const root = selected.src;
  const parentDir = path.dirname(root);
  const deployPath = path.join(parentDir, selected.deployFolder);

  console.log(
    `\x1b[36m--- Ejecutando: ${selected.name} (${version}) ---\x1b[0m`,
  );

  // 6. CAMBIO A CARPETA RAÍZ
  // Verificamos que la ruta exista
  if (!fs.existsSync(root))
    throw new Error(`La ruta de origen no existe: ${root}`);
  process.chdir(root);

  // Preparamos la carpeta de destino
  console.log("Preparando carpeta de despliegue...");
  if (!fs.existsSync(deployPath)) {
    fs.mkdirSync(deployPath, { recursive: true });
  }

  // CREAR .GITIGNORE en la carpeta de destino para mayor seguridad
    const gitignoreContent = "environment.json\nnode_modules\n.DS_Store\n";
    fs.writeFileSync(path.join(deployPath, '.gitignore'), gitignoreContent);

  // Copiar archivos (excluyendo lo ignorado por git)
  console.log("Copiando archivos (excluyendo datos sensibles)...");
  process.chdir(root);
 const files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
                    .split('\n')
                    .filter(f => {
                        const name = f.trim();
                        // NO COPIAR: el json de configuración ni el propio script .js
                        return name && name !== 'environment.json' && !name.endsWith('.js');
                    });

  files.forEach((file) => {
    const srcFile = path.join(root, file);
    const destFile = path.join(deployPath, file);

   if (fs.existsSync(srcFile) && !fs.lstatSync(srcFile).isDirectory()) {
            fs.mkdirSync(path.dirname(destFile), { recursive: true });
            fs.copyFileSync(srcFile, destFile);
        }
    });

  // 7. GIT EN DESTINO
  process.chdir(deployPath);
  console.log("Sincronizando con el repositorio remoto...");
  if (!fs.existsSync(".git")) {
    execSync("git init");
    execSync(`git remote add origin ${repoURL}`);
    execSync("git branch -M main");
  } else {
    // Si ya existe, nos aseguramos de tener lo último de GitHub antes de añadir lo nuevo
    execSync(`git remote set-url origin ${repoURL}`);
    execSync('git fetch origin');
    // Esto asegura que tu commit se ponga encima del anterior
    try { execSync('git checkout main'); execSync('git pull origin main'); } catch(e) {}
  }

  // 8. PUSH Y TAG
  console.log("Realizando commit y push...");
  execSync("git add -A");
  // Usamos try-catch en el commit por si no hay cambios
  try {
    execSync(`git commit -m "Entrega ${version}"`);
  } catch (e) {
    console.log("No hay cambios para committear.");
  }

  console.log(`Subiendo versión ${version}...`);
  // Intentamos subir la rama main de forma segura
  try {
    execSync("git push origin main");
  } catch (e) {
    console.log(
      "Detectados cambios en remoto. Sincronizando antes de subir...",
    );
    execSync('git pull origin main --rebase'); // Fusiona lo de GitHub con tu nueva entrega
    execSync("git push origin main");
  }
  // Crear y subir el tag
  execSync(`git tag ${version}`);
  try {
    execSync(`git push origin ${version}`);
  } catch (e) {
    throw new Error(
      `La versión ${version} ya existe en GitHub. Usa un nombre de versión nuevo (ej: ${version}.1) para no perder la anterior.`,
    );
  }
  console.log(
    "\x1b[32m%s\x1b[0m",
    `El proyecto ${selected.name} se ha subido correctamente.`,
  );
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", `Error: ${error.message}`);
}
