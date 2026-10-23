# Frutas El Hortal - Facturación PWA

Aplicación web instalable para gestionar clientes, productos, IVA y facturas. Permite cantidades en kg o unidades, varias líneas por factura, exportación CSV, copias JSON y generación de PDF mediante la impresión del navegador.

## Publicar en GitHub Pages

1. Crea un repositorio vacío en GitHub, por ejemplo `facturacion-el-hortal`.
2. Sube **el contenido de esta carpeta**, dejando `index.html` en la raíz del repositorio.
3. Abre `Settings > Pages`.
4. En `Build and deployment > Source`, selecciona **GitHub Actions**.
5. Abre la pestaña `Actions` y espera a que finalice `Publicar en GitHub Pages`.
6. GitHub mostrará la URL publicada, normalmente `https://TU-USUARIO.github.io/facturacion-el-hortal/`.

## Instalar en Android

1. Abre la URL publicada en Google Chrome.
2. Abre el menú de tres puntos.
3. Pulsa `Instalar aplicación` o `Añadir a pantalla de inicio`.

## Datos y privacidad

- El repositorio no contiene clientes ni facturas reales.
- Los datos se guardan localmente en el navegador de cada dispositivo.
- PC y tablet no se sincronizan automáticamente.
- Usa `Copia JSON` para hacer copias y trasladar los datos entre dispositivos.
- No subas al repositorio copias JSON, CSV exportados con clientes/facturas ni documentos PDF reales.

## Actualizaciones

Al subir cambios a la rama `main`, GitHub Actions vuelve a publicar la web. El service worker conserva una copia offline y elimina la versión anterior cuando cambia el identificador de caché.
