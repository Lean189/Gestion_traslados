# Configuración de Supabase

Para que el sistema funcione, sigue estos pasos:

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ve al **SQL Editor** y haz clic en **"+ New Query"**.
3. Pega el contenido del archivo `schema.sql` que está en la raíz de este proyecto.
4. **IMPORTANTE**: Haz clic en el botón azul **"Run"** (o presiona `Ctrl + Enter`). No uses el botón "Explain", ya que ese solo sirve para analizar una sola consulta a la vez, no para crear tablas.
5. Ve a **Project Settings > API** y copia la `Project URL` y la `anon public key`.
6. Crea un archivo `.env.local` en la raíz de este proyecto (usando como base `.env.local.example`) y pega allí tus claves.
7. **PASO CRUCIAL PARA TIEMPO REAL**:
    *   En el panel de Supabase, ve a **Database > Publications** (en el menú lateral izquierdo).
    *   Verás una fila llamada `supabase_realtime`. Haz clic en ella.
    *   Haz clic en **"Edit"** o **"Select tables"**.
    *   Busca la tabla `transfers` y activa el interruptor.
    *   Guarda los cambios.
8. Reinicia el servidor de desarrollo (`npm run dev`).

## Estructura de la Base de Datos
- `sectors`: Lugares del sanatorio (Guardia, UTI, Imágenes).
- `transfer_types`: Métodos de traslado (Camilla, Silla).
- `transfers`: El registro principal de todas las solicitudes.
