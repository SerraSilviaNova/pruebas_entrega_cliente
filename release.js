import { execSync } from 'child_process';
import readline from 'readline-sync';
import fs from 'fs';
import path from 'path';

// --- CONFIGURACIÓN ---
// const deployFolderName = "release-pruebas/cliente";
// const repoBaseURL = "github.com/dsegurap-nova/test_release.git";
const proyectos = [
    {
        nombre: "Kitsune Cars (Test)",
        rutaLocal: "C:/proyectos/Kitsune-cars/pruebas_entrega_cliente",
        repoBaseURL: "github.com/dsegurap-nova/test_release.git",
        deployFolder: "release-pruebas/cliente"
    },
    {
        nombre: "Proyecto Oficial Cliente",
        rutaLocal: "C:/proyectos/Kitsune-cars/proyecto_principal",
        repoBaseURL: "github.com/nova-aftersales/pruebas_entrega_cliente.git",
        deployFolder: "entregas/oficial"
    }
];

try {
    // 2. MENÚ DE SELECCIÓN
    console.log("\x1b[35m%s\x1b[0m", "=== GESTOR DE ENTREGAS ===");
    const opciones = proyectos.map(p => p.nombre);
    const index = readline.keyInSelect(opciones, 'Selecciona el proyecto a entregar:');

    if (index === -1) {
        console.log("Operación cancelada.");
        process.exit(0);
    }

    const proyectoSlected = proyectos[index];

    // 3. ENTRADA DE DATOS RESTANTES
    const version = readline.question(`Introduce la version para ${proyectoSlected.nombre} (ej: v1.1): `);
    const token = readline.question('Introduce tu GitHub Access Token: ', {
        hideEchoBack: true,
        mask: '*'
    });

    if (!token || !version) throw new Error("Datos incompletos.");

    const repoURL = `https://${token}@${proyectoSlected.repoBaseURL}`;

    // 4. VALIDACIÓN DE TOKEN
    console.log("\x1b[90m%s\x1b[0m", "Validando acceso...");
    try {
        execSync(`git ls-remote ${repoURL} -h HEAD`, { stdio: 'ignore' });
    } catch (e) {
        throw new Error("Acceso denegado. Revisa tu token.");
    }

    // 5. DEFINICIÓN DE RUTAS
    // Usamos la ruta local definida en el array
    const root = proyectoSlected.rutaLocal;
    const parentDir = path.dirname(root);
    const deployPath = path.join(parentDir, proyectoSlected.deployFolder);

    console.log(`\x1b[36m--- Ejecutando: ${proyectoSlected.nombre} (${version}) ---\x1b[0m`);

    // --- EL RESTO DE LA LÓGICA (LIMPIEZA, COPIA Y GIT) SIGUE IGUAL ---
    // (Asegúrate de que 'process.chdir(root)' antes de listar archivos)
    
    process.chdir(root); 

    // Preparar carpeta destino
    if (!fs.existsSync(deployPath)) {
        fs.mkdirSync(deployPath, { recursive: true });
    } else {
        fs.readdirSync(deployPath).forEach(item => {
            if (item !== '.git') fs.rmSync(path.join(deployPath, item), { recursive: true, force: true });
        });
    }

    // Copiar archivos
    const files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
                    .split('\n').filter(f => f.trim());

    files.forEach(file => {
        const src = path.join(root, file);
        const dest = path.join(deployPath, file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    });

    // Git en destino
    process.chdir(deployPath);
    if (!fs.existsSync('.git')) {
        execSync('git init');
        execSync(`git remote add origin ${repoURL}`);
        execSync('git branch -M main');
    } else {
        execSync(`git remote set-url origin ${repoURL}`);
    }

    execSync('git add -A');
    execSync(`git commit -m "Entrega ${version}"`);
    execSync(`git tag -a ${version} -m "Tag ${version}"`);
    execSync('git push origin main');
    execSync(`git push origin ${version} --force`);

    console.log("\x1b[32m%s\x1b[0m", `✅ ¡Logrado! Proyecto ${proyectoSlected.nombre} subido.`);

} catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `❌ Error: ${error.message}`);
}