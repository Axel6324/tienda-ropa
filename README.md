# Imperio de Lobos · Tienda de ropa


## Logo y modo oscuro

La página utiliza el logo original del lobo, con **Imperio de Lobos** debajo, tanto en el ingreso como en el panel. También se adapta al encabezado del celular.

Para cambiar el tema, pulsa el botón **Modo oscuro / Modo claro** de la esquina superior derecha. En pantallas pequeñas aparece como un icono de luna o sol. La elección se guarda en ese navegador y se conserva al recargar o cerrar sesión. La primera vez utiliza la preferencia del dispositivo. Los recibos se imprimen con fondo blanco y texto negro.

Para cambiar la imagen más adelante:

1. Guarda la nueva imagen con el nombre **logo-imperio-lobos.jpg**. Se aceptan imágenes JPG, PNG o WebP; el contenido se detecta automáticamente.
2. En GitHub abre **Add file → Upload files**, sube ese archivo a la raíz y confirma con **Commit changes**.
3. Cloudflare reconstruye y publica automáticamente. El script `preparar-marca.mjs` incorpora la imagen en la página para que el logo se cargue desde la propia tienda.
4. Espera que la implementación aparezca correcta y recarga la tienda. Si conservas la vista anterior, usa **Ctrl+F5** en Windows.

Para actualizar otros archivos de la página, guarda los cambios en la rama `main` del repositorio. La configuración de publicación sigue siendo **Build: `npm run build`**, **Deploy: `npm run deploy`** y el Worker `tienda-ropa`. Los cambios de apariencia no requieren volver a crear las tablas ni generar otra contraseña.


Esta es una versión compacta de la tienda para publicar en Cloudflare Workers. Los archivos necesarios están en la raíz. El paso de compilación incorpora el logo y verifica la sintaxis de la aplicación. `index.js` contiene la aplicación completa, la pantalla de acceso, la API y la autenticación.

La base D1 `atelier-ventas-db` que ya creaste está declarada en `wrangler.json`. Su Database ID es `0e3c3263-7192-4d40-8490-ed55b83e9564`. Ese identificador no es una contraseña. No se ha ejecutado ninguna operación sobre esa base al preparar este ZIP. La tienda original de ChatGPT sigue intacta.

## 1. Crear el repositorio nuevo

En GitHub crea un repositorio privado llamado **tienda-ropa**, sin añadir README, .gitignore ni licencia desde GitHub. Extrae este ZIP por completo y sube todos sus archivos. No subas el ZIP ni una carpeta contenedora adicional.

Estos archivos deben aparecer directamente en la página principal del repositorio:

```text
index.js
logo-imperio-lobos.jpg
preparar-marca.mjs
package.json
wrangler.json
database.sql
generar-acceso.mjs
verificar.mjs
README.md
.gitignore
```

## 2. Publicar el Worker

En Cloudflare entra en **Cómputo → Workers & Pages → Crear aplicación → GitHub**. Selecciona el repositorio nuevo `tienda-ropa` y usa:

| Campo | Valor |
| --- | --- |
| Nombre del Worker | `tienda-ropa` |
| Rama | `main` |
| Comando de compilación | `npm run build` |
| Comando de despliegue | `npm run deploy` |
| Directorio raíz | vacío o `/` |
| Variable de compilación | `NODE_VERSION` = `24` |

El nombre debe coincidir con `name` en `wrangler.json`. `npm run build` incorpora la imagen mediante `preparar-marca.mjs` y comprueba `index.js`; no utiliza `scripts/build.mjs`. El comando de despliegue publica el Worker y no ejecuta cambios SQL, por lo que no necesita permiso D1 Edit en el token de compilación para ejecutar migraciones.

Cloudflare generará un enlace HTTPS terminado en `workers.dev`. La pantalla de acceso puede aparecer antes de terminar la configuración, pero el inicio de sesión no funcionará hasta completar los dos pasos siguientes.

## 3. Crear las tablas en D1

Abre **Almacenamiento y bases de datos → D1 → atelier-ventas-db → Consola**. El archivo `database.sql` contiene las sentencias que crean las cinco tablas necesarias y sus índices.

Abre `database.sql` como texto. Ejecuta sus sentencias en la consola; cada sentencia termina en `;`. Si el panel solo admite una consulta por ejecución, ejecútalas una por una. Las instrucciones `IF NOT EXISTS` conservan las tablas y registros que ya existan. Este archivo no modifica la estructura de una tabla existente ni contiene datos de demostración.

También puedes inicializarla con Wrangler desde la carpeta del proyecto, después de instalar Node.js 24 y autorizar tu cuenta:

```sh
npx --yes wrangler@4.92.0 login
npm run db:init
```

Este segundo método requiere permiso de escritura sobre D1 en tu cuenta. La base de Cloudflare es independiente de la base de la tienda alojada en ChatGPT.

## 4. Configurar el usuario y la contraseña

Instala Node.js 24 desde https://nodejs.org/ si no lo tienes. Abre una terminal en la carpeta del proyecto y ejecuta:

```sh
npm run access:generate
```

Mostrará el usuario `tienda.admin`, una contraseña nueva aleatoria y una línea JSON. Guarda el usuario y la contraseña. El JSON contiene el hash y la configuración de acceso; no contiene la contraseña en texto claro.

En Cloudflare abre **Workers & Pages → tienda-ropa → Configuración → Variables y secretos**. Añade:

- Tipo: **Secret / Secreto**.
- Nombre: **SHOP_AUTH**.
- Valor: solo la línea JSON generada, completa, sin los textos anteriores ni posteriores.

Guarda y aplica/publica el cambio cuando el panel lo solicite. Es un secreto del Worker en ejecución, no una variable de compilación. No guardes el JSON ni la contraseña en GitHub. El script no crea archivos con esas credenciales.

Si generas y aplicas otro acceso más adelante, cambiará la contraseña y se invalidarán las sesiones anteriores, conservando los registros de la tienda.

## 5. Comprobar la tienda

Abre el enlace `workers.dev` desde una ventana privada. Inicia sesión, registra un cliente sin correo y una venta de tenis con talla y color. Cierra sesión y vuelve a entrar para confirmar que los registros se conservan. Prueba también desde otro dispositivo. La publicación estará lista cuando estas comprobaciones funcionen en tu cuenta.

Puedes ejecutar la prueba automatizada local con Node.js 24:

```sh
npm test
```

Usa SQLite en memoria: comprueba el acceso, la protección de la API, la persistencia de compras y el cierre de sesión sin tocar la base de Cloudflare.

## Disponibilidad

La tienda publicada no requiere tu computadora encendida ni una suscripción de ChatGPT. Su disponibilidad depende de Cloudflare y de los límites del plan elegido; el plan gratuito no implica disponibilidad ilimitada. Hay que verificar el acceso real en el plan seleccionado antes de usarla con datos importantes.

Este ZIP no incluye contraseñas reales, datos de clientes ni credenciales de las cuentas de GitHub o Cloudflare. Para conservar una copia editable con el frontend y backend separados, guarda también el ZIP completo del proyecto que recibiste anteriormente.

