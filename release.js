import { execSync } from 'child_process';
import readline from 'readline-sync';
import fs from 'fs';
import path from 'path';

// --- CONFIGURACIÓN ---
const deployFolderName = "release-pruebas/cliente";
const repoBaseURL = "github.com/dsegurap-nova/test_release.git";

try {
    // 1. Entrada de datos
    const version = readline.question('Introduce la version (ej: v1.1): ');
    
    // El token se oculta con asteriscos gracias a hideEchoBack
    const token = readline.question('Introduce tu GitHub Access Token: ', {
        hideEchoBack: true,
        mask: '*'
    });

    if (!token || !version) {
        throw new Error("La versión y el token son obligatorios.");
    }

    const repoURL = `https://${token}@${repoBaseURL}`;

    // 2. Validación del token
    console.log("\x1b[90m%s\x1b[0m", "Validando token y acceso al repositorio...");
    try {
        execSync(`git ls-remote ${repoURL} -h HEAD`, { stdio: 'ignore' });
    } catch (e) {
        throw new Error("El token no es válido o no tienes acceso al repositorio. Revisa los permisos (scopes).");
    }

    // 3. Definir rutas
    const root = process.cwd();
    const parentDir = path.dirname(root);
    const deployPath = path.join(parentDir, deployFolderName);

    console.log(`\x1b[36m--- Preparando entrega de la version ${version} ---\x1b[0m`);

    // 4. Preparar carpeta de destino (Manteniendo .git)
    if (!fs.existsSync(deployPath)) {
        fs.mkdirSync(deployPath, { recursive: true });
        console.log("Carpeta de entrega creada por primera vez.");
    } else {
        console.log("Limpiando version anterior (manteniendo historial Git)...");
        const items = fs.readdirSync(deployPath);
        for (const item of items) {
            if (item !== '.git') {
                const fullPath = path.join(deployPath, item);
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        }
    }

    // 5. Copiar archivos respetando .gitignore
    console.log("Copiando archivos nuevos...");
    const filesRaw = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' });
    const files = filesRaw.split('\n').filter(f => f.trim() !== '');

    files.forEach(file => {
        const src = path.join(root, file);
        const dest = path.join(deployPath, file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    });

    // 6. Operaciones de Git
    process.chdir(deployPath);

    if (!fs.existsSync('.git')) {
        console.log("\x1b[33m%s\x1b[0m", "Inicializando repositorio por primera vez...");
        execSync('git init');
        execSync(`git remote add origin ${repoURL}`);
        execSync('git branch -M main');
    } else {
        // Actualizamos la URL con el nuevo token
        execSync(`git remote set-url origin ${repoURL}`);
        console.log("Sincronizando historial con GitHub...");
        execSync('git fetch origin');
        execSync('git reset --soft origin/main');
    }

    // 7. Commit y Push
    execSync('git add -A');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });

    if (status.trim() !== '') {
        execSync(`git commit -m "Entrega version ${version}"`);

        // Manejo de Tags
        try {
            const tags = execSync('git tag -l', { encoding: 'utf8' });
            if (tags.includes(version)) {
                console.log("\x1b[33m%s\x1b[0m", `⚠️ El tag ${version} ya existe. Actualizando...`);
                execSync(`git tag -d ${version}`);
            }
        } catch (e) { /* No hay tags */ }

        execSync(`git tag -a ${version} -m "Tag para la version ${version}"`);

        console.log("\x1b[36m%s\x1b[0m", "Subiendo cambios al repositorio del cliente...");
        execSync('git push origin main');
        execSync(`git push origin ${version} --force`);

        console.log("\x1b[32m%s\x1b[0m", `✅ Entrega exitosa. Historial conservado.`);
    } else {
        console.log("\x1b[33m%s\x1b[0m", "⚠️ No hay cambios detectados respecto a la entrega anterior.");
    }

} catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `❌ Error: ${error.message}`);
    process.exit(1);
}