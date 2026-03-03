# SGT - Sistema de Gestión de Traslados 🏥

Plataforma profesional optimizada para la logística interna hospitalaria y gestión de traslados de pacientes en tiempo real.

## 🚀 Características

- **Gestión Multi-rol**: Roles específicos para Sectores, Camilleros y Administradores.
- **Tiempo Real**: Sincronización inmediata de solicitudes y estados mediante Supabase.
- **Optimizado para Móviles**: Interfaz fluida para camilleros en movimiento.
- **Acceso por PIN**: Sistema de acceso rápido y seguro por sectores.
- **Analíticas e Historial**: Control total de tiempos y flujos de trabajo.

## 🛠️ Tecnologías

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **UI/UX**: Componentes personalizados con animaciones optimizadas.

## 🏁 Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/tu-usuario/gestion-traslados.git
   cd gestion-traslados
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env.local` con tus credenciales de Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Base de Datos**:
   Ejecuta el script `schema.sql` en tu editor SQL de Supabase para crear las tablas y políticas necesarias.

5. **Iniciar el servidor**:

   ```bash
   npm run dev
   ```

## 📈 Próximas Mejoras

- Notificaciones Push en tiempo real.
- Integración profunda con sistemas HIS mediante API.
- Generación automática de reportes de eficiencia.

---
Desarrollado con ❤️ para optimizar la salud pública.
