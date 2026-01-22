# Gestor de Entregas Automatizado

Este script de Node.js permite automatizar el proceso de despliegue, versionado y subida a GitHub de múltiples proyectos. Centraliza la gestión de versiones mediante etiquetas (tags) y asegura que los archivos sensibles o innecesarios no se incluyan en la entrega.

## Características

   - Menú Interactivo: Selección amigable de proyectos mediante consola.

   - Gestión de Múltiples Proyectos: Configuración centralizada en un único archivo JSON.

   - Validación de Acceso: Comprueba la validez del token de GitHub antes de iniciar el proceso.

   - Limpieza de Archivos: Filtra automáticamente archivos ignorados por Git y archivos de configuración sensibles.

   - Automatización de Git: Realiza init, add, commit, pull (rebase), push y creación de tags automáticamente.

## Requisitos Previos

   - Node.js instalado en el sistema.

   - Git configurado globalmente.

   - Dependencias del proyecto instaladas:
    Bash

   - npm install readline-sync

## Configuración (environment.json)

Para que el script funcione, debes crear un archivo llamado environment.json en la raíz del script. Este archivo contiene credenciales sensibles y debe estar incluido en tu .gitignore.
Estructura del archivo JSON:
```
{
  "projects": [
    {
      "name": "Nombre Visual del Proyecto",
      "src": "C:/ruta/al/codigo/fuente",
      "token": "ghp_tu_token_personal_de_github",
      "repoBaseURL": "https://github.com/usuario/repositorio.git",
      "deployFolder": "nombre-carpeta-despliegue"
    }
  ]
}
```
### Campos detallados:

    name: El nombre que aparecerá en el menú de selección.

    src: Ruta absoluta donde se encuentra el código que quieres entregar.

    token: Personal Access Token (PAT) de GitHub con permisos de escritura.

    repoBaseURL: URL del repositorio de destino.

    deployFolder: Nombre de la carpeta (se creará al mismo nivel que src) donde se preparará la subida limpia.

## Funcionamiento del Script

   - Carga de Configuración: Lee los proyectos definidos en environment.json.

   - Selección: El usuario elige qué proyecto desea procesar desde una lista.

   - Versionado: Se solicita una versión (ej: v1.2.0). Esta se usará para el mensaje del commit y la etiqueta (tag) de Git.

   ### Sincronización Inteligente:

      -  Crea una carpeta de "despliegue" independiente para no ensuciar tu entorno de desarrollo.

      -  Copia solo los archivos rastreados por Git (evitando node_modules, environment.json y scripts .js).

      -  Gestiona conflictos haciendo rebase si hay cambios nuevos en el repositorio remoto.

      - Finalización: Sube los cambios a la rama main y crea un tag con la versión indicada.

## Notas de Seguridad

    [!IMPORTANT] Seguridad de Datos: El script genera automáticamente un archivo .gitignore dentro de la carpeta de despliegue para evitar que el archivo environment.json o carpetas pesadas como node_modules se suban accidentalmente a GitHub. Asegúrate de que tu token tenga los permisos mínimos necesarios.

## Posibles Errores

   - "Acceso denegado": El token en el JSON es incorrecto o no tiene permisos para ese repositorio.

   - "La versión ya existe": No puedes subir un tag que ya existe en GitHub. Debes incrementar el número de versión (ej: de v1.0 a v1.0.1).

   - "No se encontró el array": Verifica que el formato del archivo environment.json sea exactamente igual al ejemplo proporcionado.

## Generación del Token de GitHub

Para que el script pueda subir archivos en tu nombre, necesitas un Personal Access Token (Classic). Sigue estos pasos:

   1- Entra en tu cuenta de GitHub y ve a Settings (Configuración).

   2- En el menú de la izquierda, baja hasta Developer settings.

   3- Selecciona Personal access tokens > Tokens (classic).

   4- Haz clic en Generate new token > Generate new token (classic).

   5- Configura el token:

       - Note: Dale un nombre (ej: "Script de Entregas").

       - Expiration: Elige la duración que prefieras.

       - Select scopes: Marca la casilla repo (esto permite control total sobre repositorios privados y públicos).

   6- Haz clic en Generate token.

   7- Copia el token inmediatamente. No podrás volver a verlo. Pégalo en el campo "token" de tu archivo environment.json.

## Ejecución del Script

Una vez tengas configurado el archivo environment.json y las dependencias instaladas, sigue estos pasos para realizar una entrega:

1. Instalación de dependencias

Si es la primera vez que usas el gestor, instala los módulos necesarios:
Bash

npm install

2. Lanzar el gestor

Ejecuta el script con Node.js:
Bash

node nombre_de_tu_archivo.js

3. Flujo de trabajo en consola

    Selección: Usa las flechas o los números para elegir el proyecto de la lista.

    Versión: Escribe la etiqueta de versión (ej: v2.0.4).

    Procesado: El script validará el token, creará la carpeta de despliegue, filtrará los archivos y subirá todo a GitHub automáticamente.

## 📁 Estructura de Archivos Recomendada

Para que el script funcione sin problemas de seguridad, tu estructura de carpetas debería verse así:
Plaintext
```
/mi-gestor-entregas
├── node_modules/
├── environment.json      <-- (Ignorado en .gitignore)
├── gestor.js             <-- (Tu script principal)
├── package.json
└── .gitignore            <-- (Debe contener "environment.json")
```
    [!TIP] ¿Qué pasa si me equivoco de versión? Si el script falla porque la versión ya existe en GitHub, simplemente vuelve a ejecutarlo y asigna un número superior (ej: de v1.1 a v1.1.1).

## Licencia y Uso

Este script es para uso interno y privado.

    Privacidad: Asegúrate de no compartir nunca el archivo environment.json ni subirlo a repositorios públicos, ya que contiene tokens de acceso que podrían comprometer la seguridad de tu cuenta de GitHub.

    Uso: El script ha sido diseñado para facilitar las entregas a clientes, asegurando que solo los archivos necesarios sean publicados.

## Autoría y Mantenimiento

Desarrollado para la automatización de flujos de trabajo en [NOVA-AFTERSALES].

    Versión del script: 1.0.0

    Última actualización: Enero 2026