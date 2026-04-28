# flowcraft — n8n Workflow Portfolio

Landing page personal de Jesús Vargas Guerra para mostrar automatizaciones construidas con [n8n](https://n8n.io/). Incluye visualización interactiva de workflows, panel de administración, soporte bilingüe (ES/EN) y temas de color.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Authentication |
| Estilos | CSS puro (sin framework) |
| Deploy | Firebase Hosting |

## Estructura del proyecto

```
├── src/
│   ├── components/
│   │   ├── Canvas.jsx          # Canvas SVG interactivo estilo n8n
│   │   └── TweaksPanel.jsx     # Panel flotante de ajustes (densidad, acento, idioma)
│   ├── pages/
│   │   ├── Landing.jsx         # Página principal con todas las secciones
│   │   └── admin/
│   │       ├── Login.jsx       # Login del panel admin
│   │       ├── Layout.jsx      # Layout del panel admin
│   │       ├── WorkflowList.jsx
│   │       └── WorkflowForm.jsx
│   ├── hooks/
│   │   └── useAuth.js          # Hook de autenticación Firebase
│   ├── context/
│   │   └── LangContext.jsx     # Contexto de idioma
│   ├── services/
│   │   └── workflows.js        # CRUD de workflows en Firestore
│   ├── data/
│   │   └── seed.js             # Datos de workflows + strings i18n
│   ├── firebase.js             # Inicialización Firebase (usa variables de entorno)
│   ├── App.jsx                 # Router principal
│   └── index.css               # Estilos globales
├── workflows/                  # JSONs exportados de n8n (referencia)
├── public/
│   └── favicon.svg
├── .env.example                # Plantilla de variables de entorno
└── firebase.json               # Configuración Firebase Hosting
```

## Secciones de la landing

- **Nav** — Navegación con toggle de idioma y CTA
- **Hero** — Canvas animado de fondo con el primer workflow
- **Stats** — Métricas destacadas
- **Work Grid** — Grilla de workflows con filtro por categoría
- **Detail Page** — Vista completa de cada workflow: canvas interactivo, descripción, cómo funciona, configuración y workflows relacionados
- **Cases** — Casos de uso reales
- **About** — Perfil + stack técnico
- **Contact** — Formulario que abre cliente de email
- **Footer** — Redes sociales y créditos

## Funcionalidades del canvas

El componente `WorkflowCanvas` renderiza un grafo SVG de los nodos y conexiones de cada workflow:

- Animación de flujo en tiempo real (`animated`)
- Zoom a nodo con click (`selectable`)
- Pan con drag cuando está zoomed in
- Navegación con flechas del teclado (nodo anterior/siguiente)
- Modo thumbnail para las tarjetas de la sección "Más workflows" (`thumbnail`)
- Hover con highlight de edges conectados

## Panel de administración

Ruta: `/admin` (requiere login con Firebase Auth)

Permite crear, editar y eliminar workflows. Los datos se guardan en Firestore y se leen en la landing automáticamente como fallback al seed local.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAIL=
VITE_GEMINI_API_KEY=
```

> **Importante:** El archivo `.env` está en `.gitignore` y nunca debe commitearse.

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Cargar datos de seed a Firestore (requiere credenciales configuradas)
npm run seed
```

## Deploy

El proyecto está configurado para Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Workflows incluidos

Los 9 workflows del portafolio cubren:

- Agente de chat con IA (OpenAI / Gemini)
- Clasificador inteligente de leads
- Asistente interno con sub-workflows modulares
- Consultas SQL automatizadas
- MCP Server personalizado
- Error handling genérico reutilizable
- Chatbot conversacional
- Sub-workflow de enrutado
- Sub-workflow de clasificación de mensajes

## Contacto

**Jesús Vargas Guerra** — n8n builder & automation engineer

- GitHub: [github.com/lilseniorj](https://github.com/lilseniorj)
- LinkedIn: [linkedin.com/in/jesusvarguer18](https://www.linkedin.com/in/jesusvarguer18/)
- Email: jesusvarguer18@gmail.com
