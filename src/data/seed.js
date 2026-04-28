// Seed data built from real n8n workflow JSONs
// Run via: node src/data/seed-runner.js  (after configuring .env)

export const WORKFLOWS = [
  // ──────────────────────────────────────────────────
  // 1. Clasificador Inteligente de Leads
  // ──────────────────────────────────────────────────
  {
    slug: "clasificador-leads",
    order: 1,
    title: {
      es: "Clasificador Inteligente de Leads",
      en: "Intelligent Lead Classifier",
    },
    category: {
      es: "Ventas & CRM",
      en: "Sales & CRM",
    },
    summary: {
      es: "Recibe leads por formulario, los clasifica por intención y sentimiento con GPT-4o-mini, y los enruta automáticamente a Slack, Gmail y Google Sheets según su categoría.",
      en: "Receives leads via form, classifies them by intent and sentiment using GPT-4o-mini, and automatically routes them to Slack, Gmail, and Google Sheets by category.",
    },
    integrations: ["n8n Form", "OpenAI", "Slack", "Gmail", "Google Sheets"],
    nodes: 19,
    connections: 15,
    canvas: [
      { id: "n1", x: 0,    y: 80,  type: "trigger", label: "Formulario",     icon: "📝", desc: { es: "Trigger de formulario: captura nombre, email, teléfono y mensaje del lead entrante.", en: "Form trigger: captures name, email, phone and message from incoming lead." } },
      { id: "n2", x: 200,  y: 80,  type: "app",     label: "Normalizar",     icon: "⚙️", desc: { es: "Nodo Set que mapea los campos del formulario a variables limpias (name, email, message, phone).", en: "Set node that maps form fields to clean variables (name, email, message, phone)." } },
      { id: "n3", x: 400,  y: 80,  type: "if",      label: "Filtrar",        icon: "🔍", desc: { es: "Filtra emails de @platzi.com para excluir tráfico interno de pruebas.", en: "Filters @platzi.com emails to exclude internal test traffic." } },
      { id: "n4", x: 600,  y: 80,  type: "ai",      label: "Clasificar IA",  icon: "🤖", desc: { es: "Agente GPT-4o-mini que categoriza el mensaje en: info, demo, compra o soporte.", en: "GPT-4o-mini agent that categorizes the message into: info, demo, purchase, or support." } },
      { id: "n5", x: 800,  y: 80,  type: "if",      label: "Ruta Intención", icon: "🔀", desc: { es: "Switch que enruta el lead a la rama correcta según la categoría asignada por la IA.", en: "Switch that routes the lead to the correct branch based on the AI-assigned category." } },
      { id: "n6", x: 1000, y: 0,   type: "app",     label: "Slack Demo",     icon: "💬", desc: { es: "Notifica al canal #sellers en Slack cuando un lead solicita una demo.", en: "Notifies the #sellers Slack channel when a lead requests a demo." } },
      { id: "n7", x: 1000, y: 84,  type: "app",     label: "Gmail Info",     icon: "📧", desc: { es: "Envía email automático con información del producto al lead que pidió info.", en: "Sends automatic product information email to the lead who requested info." } },
      { id: "n8", x: 1000, y: 168, type: "ai",      label: "Sentimiento",    icon: "🧠", desc: { es: "LLM Chain con GPT-4o-mini que analiza el sentimiento: Positive, Negative o Aggressive.", en: "LLM Chain with GPT-4o-mini that analyzes sentiment: Positive, Negative, or Aggressive." } },
      { id: "n9", x: 1200, y: 84,  type: "if",      label: "Ruta Sentim.",   icon: "🔀", desc: { es: "Switch que clasifica al lead de soporte por tono: positivo envía respuesta IA, negativo y agresivo generan alertas especiales.", en: "Switch classifying support lead by tone: positive sends AI response, negative and aggressive generate special alerts." } },
    ],
    edges: [
      ["n1","n2"],["n2","n3"],["n3","n4"],["n4","n5"],
      ["n5","n6"],["n5","n7"],["n5","n8"],["n8","n9"],
    ],
    forWho: {
      es: "Equipos de ventas que reciben leads por formulario web y necesitan priorizar y responder automáticamente según la intención del mensaje. Ideal para startups con volumen medio-alto de contactos inbound.",
      en: "Sales teams receiving leads via web forms who need to automatically prioritize and respond based on message intent. Ideal for startups with medium-to-high inbound contact volume.",
    },
    howItWorks: {
      es: "El flujo arranca con un trigger de formulario nativo de n8n. Un nodo Set normaliza los campos. Un Filter excluye emails internos de @platzi.com. Luego un agente GPT-4o-mini clasifica el mensaje en cuatro intenciones: info, demo, compra, soporte. Un Switch enruta cada intención a su rama: demo notifica a #sellers en Slack, info envía email con recursos, compra dispara un email de bienvenida + notificación Slack + recordatorio de seguimiento con Wait, y soporte pasa por un segundo agente que analiza sentimiento (Positive/Negative/Aggressive) para personalizar la respuesta.",
      en: "The flow starts with an n8n native form trigger. A Set node normalizes fields. A Filter excludes internal @platzi.com emails. Then a GPT-4o-mini agent classifies the message into four intents: info, demo, purchase, support. A Switch routes each intent to its branch: demo notifies #sellers on Slack, info sends a resources email, purchase triggers a welcome email + Slack notification + follow-up reminder with Wait, and support runs through a second sentiment analysis agent (Positive/Negative/Aggressive) to personalize the response.",
    },
    highlights: {
      es: [
        "Doble capa de IA: intención con un agente + sentimiento con LLM Chain",
        "Rama de compra incluye nodo Wait para recordatorio de seguimiento diferido",
        "Filtro de emails internos (@platzi.com) para aislar tráfico real",
        "Respuesta personalizada generada por IA para soporte positivo",
        "Registro final de leads en Google Sheets para análisis",
      ],
      en: [
        "Dual AI layer: intent via agent + sentiment via LLM Chain",
        "Purchase branch includes Wait node for deferred follow-up reminder",
        "Internal email filter (@platzi.com) to isolate real traffic",
        "AI-generated personalized response for positive support cases",
        "Final lead registration in Google Sheets for analysis",
      ],
    },
    howToSetup: {
      es: [
        "Crea credenciales en n8n: OpenAI API, Slack OAuth2, Gmail OAuth2, Google Sheets OAuth2",
        "Activa el formulario nativo de n8n y copia la URL pública",
        "En el nodo Switch de compra, ajusta el ID del canal de Slack (#sellers)",
        "Configura el ID de la hoja de Google Sheets para el nodo 'Guardar en Sheet'",
        "Activa el workflow y prueba enviando un formulario de prueba",
      ],
      en: [
        "Create credentials in n8n: OpenAI API, Slack OAuth2, Gmail OAuth2, Google Sheets OAuth2",
        "Activate the n8n native form and copy the public URL",
        "In the purchase Switch node, adjust the Slack channel ID (#sellers)",
        "Set the Google Sheets spreadsheet ID in the 'Guardar en Sheet' node",
        "Activate the workflow and test by submitting a test form",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Cuenta OpenAI con créditos", "Workspace Slack", "Gmail OAuth2", "Google Sheets"],
      en: ["n8n self-hosted or cloud", "OpenAI account with credits", "Slack workspace", "Gmail OAuth2", "Google Sheets"],
    },
  },

  // ──────────────────────────────────────────────────
  // 2. Asistente Interno - Flujo Principal
  // ──────────────────────────────────────────────────
  {
    slug: "asistente-interno",
    order: 2,
    title: {
      es: "Asistente Interno — Flujo Principal",
      en: "Internal Assistant — Main Flow",
    },
    category: {
      es: "Automatización Interna",
      en: "Internal Automation",
    },
    summary: {
      es: "Portal web de peticiones internas con webhook dual (GET muestra formulario, POST procesa). Valida el mensaje, llama sub-workflows modulares para clasificar y registrar la tarea en Slack, Notion, Gmail o Sheets.",
      en: "Internal requests web portal with dual webhook (GET shows form, POST processes). Validates the message, calls modular sub-workflows to classify and register the task in Slack, Notion, Gmail, or Sheets.",
    },
    integrations: ["Webhook", "Slack", "Sub-workflows"],
    nodes: 9,
    connections: 7,
    canvas: [
      { id: "n1", x: 0,   y: 80,  type: "trigger", label: "Webhook",         icon: "🌐", desc: { es: "Webhook dual: GET sirve el formulario HTML al usuario, POST recibe los datos enviados.", en: "Dual webhook: GET serves the HTML form to the user, POST receives the submitted data." } },
      { id: "n2", x: 200, y: 0,   type: "app",     label: "Formulario HTML", icon: "📋", desc: { es: "Respond to Webhook que devuelve el formulario HTML con diseño moderno directamente en el navegador.", en: "Respond to Webhook that returns a modern HTML form directly in the browser." } },
      { id: "n3", x: 200, y: 160, type: "app",     label: "Extraer Datos",   icon: "⚙️", desc: { es: "Nodo Set que extrae usuario, mensaje, prioridad (detecta 'urgente'), fecha y execution_id del workflow.", en: "Set node that extracts user, message, priority (detects 'urgente'), date and workflow execution_id." } },
      { id: "n4", x: 400, y: 160, type: "if",      label: "¿Mensaje válido?",icon: "🔍", desc: { es: "IF que valida que el mensaje no esté vacío y tenga más de 10 caracteres antes de procesar.", en: "IF that validates the message is not empty and has more than 10 characters before processing." } },
      { id: "n5", x: 600, y: 80,  type: "app",     label: "Sub: Clasificar", icon: "🔗", desc: { es: "ExecuteWorkflow que llama al sub-workflow 'sub_clasificar_mensaje' con Gemini para categorizar el mensaje.", en: "ExecuteWorkflow that calls the 'sub_clasificar_mensaje' sub-workflow with Gemini to categorize the message." } },
      { id: "n6", x: 800, y: 80,  type: "app",     label: "Sub: Registrar",  icon: "🔗", desc: { es: "ExecuteWorkflow que llama al sub-workflow 'sub-enrutado' para registrar la tarea en el canal correcto.", en: "ExecuteWorkflow that calls the 'sub-enrutado' sub-workflow to register the task in the correct channel." } },
      { id: "n7", x: 1000, y: 80, type: "app",     label: "Responder OK",    icon: "📤", desc: { es: "Respond to Webhook que devuelve JSON de confirmación: {'estado': 'ok'} al cliente.", en: "Respond to Webhook returning confirmation JSON: {'estado': 'ok'} to the client." } },
    ],
    edges: [
      ["n1","n2"],["n1","n3"],["n3","n4"],["n4","n5"],["n5","n6"],["n6","n7"],
    ],
    forWho: {
      es: "Equipos internos de empresa que necesitan un canal centralizado para enviar peticiones a TI, Legal o Facilities. El formulario web evita el uso de Slack o email para solicitudes no estructuradas.",
      en: "Internal company teams needing a centralized channel to submit requests to IT, Legal, or Facilities. The web form avoids using Slack or email for unstructured requests.",
    },
    howItWorks: {
      es: "El webhook acepta tanto GET como POST. En GET, devuelve un formulario HTML inline con diseño moderno. En POST, extrae los datos del body, detecta automáticamente si el mensaje contiene 'urgente' para asignar prioridad alta, valida que el mensaje sea suficientemente largo, y luego llama secuencialmente a dos sub-workflows: uno que clasifica el tema (IT/Legal/Facilities/Otro) y otro que registra y enruta la tarea al canal apropiado.",
      en: "The webhook accepts both GET and POST. On GET, it returns an inline HTML form with modern design. On POST, it extracts body data, auto-detects if the message contains 'urgente' to assign high priority, validates the message is long enough, and then sequentially calls two sub-workflows: one that classifies the topic (IT/Legal/Facilities/Other) and another that registers and routes the task to the appropriate channel.",
    },
    highlights: {
      es: [
        "Webhook dual GET/POST que sirve el formulario y procesa la petición en el mismo endpoint",
        "Detección automática de prioridad alta mediante keyword 'urgente'",
        "Arquitectura modular: el flujo principal orquesta sub-workflows independientes",
        "Manejo de errores: mensajes inválidos reciben respuesta estructurada con detalle del error",
        "Trazabilidad completa: guarda execution_id y fecha en cada petición",
      ],
      en: [
        "Dual GET/POST webhook that serves the form and processes the request at the same endpoint",
        "Automatic high-priority detection via 'urgente' keyword",
        "Modular architecture: main flow orchestrates independent sub-workflows",
        "Error handling: invalid messages receive structured response with error detail",
        "Full traceability: saves execution_id and date for every request",
      ],
    },
    howToSetup: {
      es: [
        "Activa el workflow y copia la URL del webhook",
        "Comparte la URL con tu equipo para acceder al formulario vía GET",
        "Asegúrate de que los sub-workflows 'sub_clasificar_mensaje' y 'sub-enrutado' estén activos",
        "Configura las credenciales de Slack en el nodo de error fallback",
      ],
      en: [
        "Activate the workflow and copy the webhook URL",
        "Share the URL with your team to access the form via GET",
        "Ensure sub-workflows 'sub_clasificar_mensaje' and 'sub-enrutado' are active",
        "Configure Slack credentials in the error fallback node",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Workspace Slack", "Sub-workflows activos (clasificar + enrutar)"],
      en: ["n8n self-hosted or cloud", "Slack workspace", "Active sub-workflows (classify + route)"],
    },
  },

  // ──────────────────────────────────────────────────
  // 3. Sub: Clasificar Mensaje
  // ──────────────────────────────────────────────────
  {
    slug: "sub-clasificar",
    order: 3,
    title: {
      es: "Sub-workflow: Clasificar Mensaje",
      en: "Sub-workflow: Classify Message",
    },
    category: {
      es: "Sub-workflow / IA",
      en: "Sub-workflow / AI",
    },
    summary: {
      es: "Sub-workflow reutilizable que recibe un mensaje de texto y usa Gemini con structured output para clasificarlo en IT, Legal, Facilities u Otro, devolviendo categoría, confianza y tema detectado.",
      en: "Reusable sub-workflow that receives a text message and uses Gemini with structured output to classify it as IT, Legal, Facilities, or Other, returning category, confidence, and detected topic.",
    },
    integrations: ["Google Gemini", "Structured Output"],
    nodes: 5,
    connections: 4,
    canvas: [
      { id: "n1", x: 0,   y: 64, type: "trigger", label: "Entrada",         icon: "▶️", desc: { es: "ExecuteWorkflow Trigger: punto de entrada del sub-workflow, recibe el campo 'mensaje' del flujo padre.", en: "ExecuteWorkflow Trigger: sub-workflow entry point, receives the 'mensaje' field from the parent flow." } },
      { id: "n2", x: 200, y: 64, type: "ai",      label: "Agente Gemini",   icon: "✨", desc: { es: "Agente con Gemini que clasifica el mensaje en IT, Legal, Facilities u Otro con instrucciones de sistema específicas.", en: "Gemini agent that classifies the message into IT, Legal, Facilities, or Other with specific system instructions." } },
      { id: "n3", x: 400, y: 64, type: "app",     label: "Output Parser",   icon: "📋", desc: { es: "Structured Output Parser que fuerza la respuesta a JSON: {categoria, confianza, tema_detectado}.", en: "Structured Output Parser that forces the response to JSON: {categoria, confianza, tema_detectado}." } },
      { id: "n4", x: 600, y: 64, type: "app",     label: "Normalizar",      icon: "⚙️", desc: { es: "Nodo Edit Fields que extrae los campos del output parseado y los expone limpiamente para el flujo padre.", en: "Edit Fields node that extracts fields from the parsed output and exposes them cleanly for the parent flow." } },
    ],
    edges: [["n1","n2"],["n2","n3"],["n3","n4"]],
    forWho: {
      es: "Desarrolladores de n8n que necesitan un módulo de clasificación de texto reutilizable. Se puede llamar desde cualquier flujo padre que necesite categorizar mensajes internos.",
      en: "n8n developers needing a reusable text classification module. Can be called from any parent flow that needs to categorize internal messages.",
    },
    howItWorks: {
      es: "El sub-workflow recibe el mensaje como input. Un agente con Gemini como LLM analiza el contenido y devuelve la categoría usando un Structured Output Parser que garantiza el formato JSON. El nodo Edit Fields limpia la salida para que el flujo padre reciba directamente categoria, confianza y tema_detectado.",
      en: "The sub-workflow receives the message as input. A Gemini-powered agent analyzes the content and returns the category using a Structured Output Parser that guarantees JSON format. The Edit Fields node cleans the output so the parent flow directly receives categoria, confianza, and tema_detectado.",
    },
    highlights: {
      es: [
        "Structured Output Parser garantiza JSON válido sin postprocesamiento manual",
        "Gemini como LLM principal con fallback configurable",
        "Devuelve nivel de confianza además de la categoría",
        "Diseñado para ser reutilizado por múltiples flujos padre",
      ],
      en: [
        "Structured Output Parser guarantees valid JSON without manual post-processing",
        "Gemini as primary LLM with configurable fallback",
        "Returns confidence level in addition to category",
        "Designed to be reused by multiple parent flows",
      ],
    },
    howToSetup: {
      es: [
        "Asegúrate de tener credenciales de Google Gemini (PaLM API) en n8n",
        "Activa el workflow — no necesita configuración adicional",
        "Llámalo desde otro workflow con ExecuteWorkflow pasando el campo 'mensaje'",
      ],
      en: [
        "Ensure you have Google Gemini (PaLM API) credentials in n8n",
        "Activate the workflow — no additional configuration needed",
        "Call it from another workflow via ExecuteWorkflow passing the 'mensaje' field",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Credenciales Google Gemini (PaLM API)"],
      en: ["n8n self-hosted or cloud", "Google Gemini (PaLM API) credentials"],
    },
  },

  // ──────────────────────────────────────────────────
  // 4. Sub: Enrutado de Peticiones
  // ──────────────────────────────────────────────────
  {
    slug: "sub-enrutado",
    order: 4,
    title: {
      es: "Sub-workflow: Enrutado de Peticiones",
      en: "Sub-workflow: Request Routing",
    },
    category: {
      es: "Sub-workflow / Integraciones",
      en: "Sub-workflow / Integrations",
    },
    summary: {
      es: "Sub-workflow que recibe la categoría y datos de una petición y la registra en el canal correcto: IT→Slack, Legal→Notion, Facilities→Gmail, Otro→Sheets. Las urgentes activan un agente IA con MCP para agendar cita en Calendar.",
      en: "Sub-workflow that receives request category and data and registers it in the correct channel: IT→Slack, Legal→Notion, Facilities→Gmail, Other→Sheets. Urgent ones trigger an AI agent with MCP to schedule a Calendar appointment.",
    },
    integrations: ["Slack", "Notion", "Gmail", "Google Sheets", "Google Calendar", "Google Gemini", "MCP"],
    nodes: 12,
    connections: 10,
    canvas: [
      { id: "n1", x: 0,    y: 80,  type: "trigger", label: "Entrada",          icon: "▶️", desc: { es: "ExecuteWorkflow Trigger con 7 inputs: categoria, prioridad, usuario, mensaje, ejecution_id, fecha, If_prioridad.", en: "ExecuteWorkflow Trigger with 7 inputs: categoria, prioridad, usuario, mensaje, ejecution_id, fecha, If_prioridad." } },
      { id: "n2", x: 200,  y: 80,  type: "if",      label: "Switch Categoría", icon: "🔀", desc: { es: "Switch que enruta a IT, Legal, Facilities o fallback (Otro) según la categoría recibida.", en: "Switch that routes to IT, Legal, Facilities, or fallback (Other) based on the received category." } },
      { id: "n3", x: 400,  y: 0,   type: "app",     label: "Slack (IT)",       icon: "💬", desc: { es: "Envía mensaje al canal #support de Slack con los detalles de la solicitud IT.", en: "Sends message to Slack #support channel with IT request details." } },
      { id: "n4", x: 400,  y: 84,  type: "app",     label: "Notion (Legal)",   icon: "📓", desc: { es: "Crea página en base de datos Notion 'Legal Request' con estado 'en tramite', fecha y mensaje.", en: "Creates page in Notion 'Legal Request' database with status 'en tramite', date and message." } },
      { id: "n5", x: 400,  y: 168, type: "app",     label: "Gmail (Facilities)",icon: "📧",desc: { es: "Envía email al responsable de Facilities con los detalles de la solicitud.", en: "Sends email to the Facilities manager with request details." } },
      { id: "n6", x: 400,  y: 252, type: "app",     label: "Sheets (Otro)",    icon: "📊", desc: { es: "Registra la petición en Google Sheets como fallback para categorías no reconocidas.", en: "Registers the request in Google Sheets as fallback for unrecognized categories." } },
      { id: "n7", x: 600,  y: 0,   type: "if",      label: "Filtrar Urgente",  icon: "🔍", desc: { es: "Filter que solo deja pasar peticiones con prioridad='alta' para activar el agente IA.", en: "Filter that only passes through requests with priority='alta' to activate the AI agent." } },
      { id: "n8", x: 800,  y: 0,   type: "ai",      label: "Agente IA+MCP",   icon: "🤖", desc: { es: "Agente Gemini con acceso al MCP Server: agenda evento en Google Calendar y envía email de confirmación.", en: "Gemini agent with MCP Server access: schedules event in Google Calendar and sends confirmation email." } },
    ],
    edges: [
      ["n1","n2"],["n2","n3"],["n2","n4"],["n2","n5"],["n2","n6"],
      ["n3","n7"],["n7","n8"],
    ],
    forWho: {
      es: "Organizaciones que manejan múltiples canales de soporte interno y quieren que las peticiones lleguen automáticamente al equipo correcto según su naturaleza.",
      en: "Organizations managing multiple internal support channels who want requests to automatically reach the correct team based on their nature.",
    },
    howItWorks: {
      es: "Recibe los datos procesados del flujo principal. Un Switch enruta por categoría: IT va a Slack, Legal crea una página en Notion, Facilities envía un email y Otro guarda en Sheets. Paralelamente, si la solicitud IT tiene prioridad alta, un Filter la pasa a un agente Gemini que usa el MCP Server para acceder a Google Calendar, agendar una cita de soporte y enviar el email de confirmación HTML.",
      en: "Receives processed data from the main flow. A Switch routes by category: IT goes to Slack, Legal creates a Notion page, Facilities sends an email, and Other saves to Sheets. In parallel, if the IT request has high priority, a Filter passes it to a Gemini agent that uses the MCP Server to access Google Calendar, schedule a support appointment, and send the HTML confirmation email.",
    },
    highlights: {
      es: [
        "Cuatro canales de registro independientes activados por categoría",
        "Integración con MCP Server para acceso a herramientas externas desde el agente IA",
        "Escalada automática para peticiones urgentes con agendamiento en Calendar",
        "Email HTML de confirmación generado por el agente con enlace Google Meet",
        "Nodo 'Extraer origen' para trazabilidad del canal que procesó la petición",
      ],
      en: [
        "Four independent registration channels activated by category",
        "MCP Server integration for external tool access from the AI agent",
        "Automatic escalation for urgent requests with Calendar scheduling",
        "HTML confirmation email generated by the agent with Google Meet link",
        "'Extraer origen' node for traceability of the channel that processed the request",
      ],
    },
    howToSetup: {
      es: [
        "Configura credenciales: Slack OAuth2, Notion API, Gmail OAuth2, Google Sheets OAuth2, Google Calendar OAuth2",
        "Actualiza el ID de la base de datos de Notion para 'Legal Request'",
        "Asegúrate de que el MCP Server workflow esté activo",
        "Ajusta el email del responsable de Facilities en el nodo Gmail",
      ],
      en: [
        "Configure credentials: Slack OAuth2, Notion API, Gmail OAuth2, Google Sheets OAuth2, Google Calendar OAuth2",
        "Update the Notion database ID for 'Legal Request'",
        "Ensure the MCP Server workflow is active",
        "Adjust the Facilities manager email in the Gmail node",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Slack, Notion, Gmail, Google Sheets, Google Calendar", "MCP Server workflow activo", "Google Gemini credentials"],
      en: ["n8n self-hosted or cloud", "Slack, Notion, Gmail, Google Sheets, Google Calendar", "Active MCP Server workflow", "Google Gemini credentials"],
    },
  },

  // ──────────────────────────────────────────────────
  // 5. MyChatBot — Resumen de Notas de Voz
  // ──────────────────────────────────────────────────
  {
    slug: "mychatbot",
    order: 5,
    title: {
      es: "MyChatBot — Resumen de Notas de Voz",
      en: "MyChatBot — Voice Note Summarizer",
    },
    category: {
      es: "Bots & Asistentes",
      en: "Bots & Assistants",
    },
    summary: {
      es: "Bot de Telegram que recibe notas de voz, las transcribe con Gemini 2.5 Flash y genera un resumen en 3-4 frases directas. Responde en el mismo chat del usuario.",
      en: "Telegram bot that receives voice notes, transcribes them with Gemini 2.5 Flash and generates a 3-4 sentence direct summary. Replies in the same user chat.",
    },
    integrations: ["Telegram", "Google Gemini"],
    nodes: 8,
    connections: 7,
    canvas: [
      { id: "n1", x: 0,   y: 64, type: "trigger", label: "Telegram Trigger", icon: "📱", desc: { es: "Telegram Trigger que escucha mensajes entrantes del bot @Liln8nbot.", en: "Telegram Trigger listening for incoming messages from the @Liln8nbot bot." } },
      { id: "n2", x: 200, y: 64, type: "app",     label: "Confirmar OK",     icon: "✅", desc: { es: "Responde 'Dame un momento' al usuario como reply inmediato para confirmar que recibió el audio.", en: "Replies 'Dame un momento' to the user as immediate reply to confirm audio was received." } },
      { id: "n3", x: 400, y: 64, type: "if",      label: "¿Es Audio?",       icon: "🎙️", desc: { es: "IF que filtra solo mensajes con nota de voz adjunta (reply_to_message.voice existe).", en: "IF that filters only messages with an attached voice note (reply_to_message.voice exists)." } },
      { id: "n4", x: 600, y: 64, type: "app",     label: "Descargar Audio",  icon: "⬇️", desc: { es: "Nodo Telegram que descarga el archivo de audio usando el file_id de la nota de voz.", en: "Telegram node that downloads the audio file using the voice note file_id." } },
      { id: "n5", x: 800, y: 64, type: "ai",      label: "Transcribir",      icon: "✨", desc: { es: "Nodo Google Gemini en modo audio (gemini-2.5-flash) que transcribe el binario de audio a texto.", en: "Google Gemini node in audio mode (gemini-2.5-flash) that transcribes the audio binary to text." } },
      { id: "n6", x: 1000,y: 64, type: "ai",      label: "Resumir IA",       icon: "🤖", desc: { es: "Agente con Gemini 2.5 Flash Lite que condensa la transcripción en 3-4 frases directas y sin rodeos.", en: "Agent with Gemini 2.5 Flash Lite that condenses the transcription into 3-4 direct, no-fluff sentences." } },
      { id: "n7", x: 1200,y: 64, type: "app",     label: "Enviar Respuesta", icon: "📤", desc: { es: "Nodo Telegram que envía el resumen generado por la IA al chat del usuario.", en: "Telegram node that sends the AI-generated summary to the user's chat." } },
    ],
    edges: [["n1","n2"],["n2","n3"],["n3","n4"],["n4","n5"],["n5","n6"],["n6","n7"]],
    forWho: {
      es: "Profesionales que reciben muchas notas de voz por Telegram y quieren extraer la información clave sin escucharlas completas. Ideal para equipos remotos, gerentes o freelancers.",
      en: "Professionals receiving many Telegram voice notes who want to extract key information without listening to them fully. Ideal for remote teams, managers, or freelancers.",
    },
    howItWorks: {
      es: "El bot recibe cualquier mensaje de Telegram. Primero confirma recepción con 'Dame un momento'. Luego un IF filtra solo los mensajes que contienen nota de voz. El nodo Telegram descarga el archivo binario, Gemini 2.5 Flash lo transcribe directamente desde el binario sin conversión previa, y finalmente un agente con Gemini 2.5 Flash Lite resume la transcripción en 3-4 frases directas que se envían de vuelta al chat.",
      en: "The bot receives any Telegram message. First confirms receipt with 'Dame un momento'. Then an IF filters only messages containing a voice note. The Telegram node downloads the binary file, Gemini 2.5 Flash transcribes it directly from binary without prior conversion, and finally an agent with Gemini 2.5 Flash Lite summarizes the transcription into 3-4 direct sentences sent back to the chat.",
    },
    highlights: {
      es: [
        "Transcripción nativa de audio con Gemini 2.5 Flash sin conversión de formato",
        "Dos modelos Gemini especializados: Flash para transcripción, Flash Lite para resumen",
        "Confirmación inmediata al usuario para mejorar la experiencia",
        "Filtro IF que ignora mensajes de texto y solo procesa notas de voz",
      ],
      en: [
        "Native audio transcription with Gemini 2.5 Flash without format conversion",
        "Two specialized Gemini models: Flash for transcription, Flash Lite for summary",
        "Immediate user confirmation to improve experience",
        "IF filter that ignores text messages and only processes voice notes",
      ],
    },
    howToSetup: {
      es: [
        "Crea un bot en Telegram vía @BotFather y obtén el token",
        "Configura las credenciales de Telegram y Google Gemini en n8n",
        "Activa el webhook del trigger de Telegram",
        "Envía una nota de voz al bot para probar",
      ],
      en: [
        "Create a Telegram bot via @BotFather and get the token",
        "Configure Telegram and Google Gemini credentials in n8n",
        "Activate the Telegram trigger webhook",
        "Send a voice note to the bot to test",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Bot de Telegram con token", "Google Gemini API con billing (para audio)"],
      en: ["n8n self-hosted or cloud", "Telegram bot with token", "Google Gemini API with billing (for audio)"],
    },
  },

  // ──────────────────────────────────────────────────
  // 6. MCP Server — Herramientas de IA
  // ──────────────────────────────────────────────────
  {
    slug: "mcp-server",
    order: 6,
    title: {
      es: "MCP Server — Herramientas de IA",
      en: "MCP Server — AI Tools",
    },
    category: {
      es: "MCP / Infraestructura IA",
      en: "MCP / AI Infrastructure",
    },
    summary: {
      es: "Servidor MCP (Model Context Protocol) que expone 4 herramientas a agentes de IA: fecha/hora actual, creación de eventos en Google Calendar, búsqueda web con SerpAPI y envío de emails via Gmail.",
      en: "MCP (Model Context Protocol) server exposing 4 tools to AI agents: current date/time, Google Calendar event creation, web search with SerpAPI, and email sending via Gmail.",
    },
    integrations: ["MCP Protocol", "Google Calendar", "Gmail", "SerpAPI"],
    nodes: 5,
    connections: 4,
    canvas: [
      { id: "n1", x: 0,   y: 126, type: "trigger", label: "MCP Trigger",   icon: "🔌", desc: { es: "MCP Server Trigger en el path '/herramientas' que expone las herramientas a cualquier agente compatible con MCP.", en: "MCP Server Trigger at path '/herramientas' that exposes tools to any MCP-compatible agent." } },
      { id: "n2", x: 220, y: 0,  type: "app",     label: "Fecha/Hora",   icon: "🕐", desc: { es: "DateTimeTool que devuelve la fecha y hora actuales al agente que lo invoca.", en: "DateTimeTool that returns the current date and time to the invoking agent." } },
      { id: "n3", x: 220, y: 84, type: "app",     label: "Crear Evento", icon: "📅", desc: { es: "Google Calendar Tool que agenda eventos con título descriptivo, asistentes y enlace Google Meet automático.", en: "Google Calendar Tool that schedules events with descriptive title, attendees and automatic Google Meet link." } },
      { id: "n4", x: 220, y: 168,type: "http",    label: "SerpAPI",      icon: "🔎", desc: { es: "HTTP Request Tool que consulta SerpAPI para búsquedas web en tiempo real desde el agente IA.", en: "HTTP Request Tool that queries SerpAPI for real-time web searches from the AI agent." } },
      { id: "n5", x: 220, y: 252,type: "app",     label: "Enviar Email", icon: "📧", desc: { es: "Gmail Tool que permite al agente enviar emails con destinatario, asunto y cuerpo generados por IA.", en: "Gmail Tool that allows the agent to send emails with AI-generated recipient, subject and body." } },
    ],
    edges: [["n1","n2"],["n1","n3"],["n1","n4"],["n1","n5"]],
    forWho: {
      es: "Desarrolladores que construyen agentes de IA en n8n y necesitan exponer herramientas reales (calendario, email, búsqueda) via MCP para que los agentes puedan usarlas de forma autónoma.",
      en: "Developers building AI agents in n8n who need to expose real tools (calendar, email, search) via MCP so agents can use them autonomously.",
    },
    howItWorks: {
      es: "El MCP Server Trigger escucha en el path '/herramientas' y expone cuatro herramientas: DateTimeTool para contexto temporal, Google Calendar Tool con $fromAI() para que el agente infiera los parámetros del evento, HTTP Request Tool contra SerpAPI para búsquedas, y Gmail Tool para envío de emails. Cualquier agente n8n con un nodo MCP Client apuntando a esta URL puede invocar estas herramientas.",
      en: "The MCP Server Trigger listens at path '/herramientas' and exposes four tools: DateTimeTool for temporal context, Google Calendar Tool with $fromAI() so the agent infers event parameters, HTTP Request Tool against SerpAPI for searches, and Gmail Tool for email sending. Any n8n agent with an MCP Client node pointing to this URL can invoke these tools.",
    },
    highlights: {
      es: [
        "Implementación completa del protocolo MCP en n8n sin código externo",
        "Uso de $fromAI() en cada herramienta para inferencia automática de parámetros",
        "Google Calendar crea eventos con Google Meet integrado automáticamente",
        "El servidor es reutilizable por múltiples agentes en distintos workflows",
        "SerpAPI integrado para búsquedas web en tiempo real",
      ],
      en: [
        "Full MCP protocol implementation in n8n without external code",
        "Use of $fromAI() in each tool for automatic parameter inference",
        "Google Calendar creates events with integrated Google Meet automatically",
        "The server is reusable by multiple agents in different workflows",
        "SerpAPI integrated for real-time web searches",
      ],
    },
    howToSetup: {
      es: [
        "Configura credenciales: Google Calendar OAuth2, Gmail OAuth2, SerpAPI Query Auth",
        "Activa el workflow y copia la URL del MCP endpoint",
        "En cualquier agente n8n, añade un nodo MCP Client con esa URL",
        "El agente podrá invocar las 4 herramientas automáticamente",
      ],
      en: [
        "Configure credentials: Google Calendar OAuth2, Gmail OAuth2, SerpAPI Query Auth",
        "Activate the workflow and copy the MCP endpoint URL",
        "In any n8n agent, add an MCP Client node pointing to that URL",
        "The agent will be able to invoke all 4 tools automatically",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Google Calendar OAuth2", "Gmail OAuth2", "Cuenta SerpAPI"],
      en: ["n8n self-hosted or cloud", "Google Calendar OAuth2", "Gmail OAuth2", "SerpAPI account"],
    },
  },

  // ──────────────────────────────────────────────────
  // 7. Consultas SQL — Agente de Reclutamiento
  // ──────────────────────────────────────────────────
  {
    slug: "consultas-sql",
    order: 7,
    title: {
      es: "Agente de Reclutamiento — Consultas Firestore",
      en: "Recruitment Agent — Firestore Queries",
    },
    category: {
      es: "IA & Base de Datos",
      en: "AI & Database",
    },
    summary: {
      es: "Agente conversacional (chat público) que analiza candidatos en Firestore para el proyecto Candydatos. Identifica perfiles de alto potencial (React/Tailwind) y resume sus fortalezas con formato Telegram.",
      en: "Conversational agent (public chat) that analyzes candidates in Firestore for the Candydatos project. Identifies high-potential profiles (React/Tailwind) and summarizes their strengths in Telegram format.",
    },
    integrations: ["Google Gemini", "Firebase Firestore", "n8n Chat"],
    nodes: 4,
    connections: 3,
    canvas: [
      { id: "n1", x: 0,   y: 64, type: "trigger", label: "Chat Trigger",    icon: "💬", desc: { es: "Chat Trigger público de n8n que abre una interfaz de chat embebible para el reclutador.", en: "n8n public Chat Trigger that opens an embeddable chat interface for the recruiter." } },
      { id: "n2", x: 200, y: 64, type: "ai",      label: "Agente IA",       icon: "🤖", desc: { es: "Agente Gemini Flash Lite con instrucciones especializadas: identifica candidatos React/Tailwind como 'alto potencial' y formatea con emojis para Telegram.", en: "Gemini Flash Lite agent with specialized instructions: identifies React/Tailwind candidates as 'high potential' and formats with emojis for Telegram." } },
      { id: "n3", x: 400, y: 64, type: "app",     label: "Firestore Tool",  icon: "🔥", desc: { es: "Firestore Tool que consulta la colección 'applications' del proyecto 'candydatos' con limit configurable.", en: "Firestore Tool that queries the 'applications' collection of the 'candydatos' project with configurable limit." } },
    ],
    edges: [["n1","n2"],["n2","n3"]],
    forWho: {
      es: "Reclutadores técnicos que almacenan candidatos en Firestore y necesitan hacer consultas en lenguaje natural para encontrar perfiles con tecnologías específicas.",
      en: "Technical recruiters storing candidates in Firestore who need to query in natural language to find profiles with specific technologies.",
    },
    howItWorks: {
      es: "El Chat Trigger público expone una interfaz conversacional. El agente Gemini recibe la pregunta del reclutador y, cuando detecta que necesita datos de candidatos, invoca el Firestore Tool para consultar la colección 'applications'. Las instrucciones de sistema definen reglas: candidatos con React o Tailwind son 'Alto Potencial' (🚀), se resaltan sus 'strengths' del campo fit_check, y la respuesta usa formato Markdown para Telegram.",
      en: "The public Chat Trigger exposes a conversational interface. The Gemini agent receives the recruiter's question and, when it detects the need for candidate data, invokes the Firestore Tool to query the 'applications' collection. System instructions define rules: candidates with React or Tailwind are 'High Potential' (🚀), their 'strengths' from the fit_check field are highlighted, and the response uses Telegram Markdown format.",
    },
    highlights: {
      es: [
        "Reglas de negocio embebidas en el system prompt del agente",
        "Identificación automática de candidatos React/Tailwind como 'Alto Potencial'",
        "Formato de respuesta optimizado para Telegram con emojis y negritas",
        "Consultas en lenguaje natural sin necesidad de escribir código",
        "retry automático con 5 segundos de espera si Gemini falla",
      ],
      en: [
        "Business rules embedded in agent system prompt",
        "Automatic identification of React/Tailwind candidates as 'High Potential'",
        "Response format optimized for Telegram with emojis and bold text",
        "Natural language queries without writing code",
        "Automatic retry with 5-second wait if Gemini fails",
      ],
    },
    howToSetup: {
      es: [
        "Configura credenciales de Google Gemini y Firestore Service Account",
        "Actualiza el projectId de Firestore con tu proyecto ('candydatos' en este caso)",
        "Activa el workflow — el chat está disponible públicamente en la URL del trigger",
        "Prueba preguntando: '¿Qué candidatos tienen React?'",
      ],
      en: [
        "Configure Google Gemini and Firestore Service Account credentials",
        "Update the Firestore projectId with your project ('candydatos' in this case)",
        "Activate the workflow — the chat is publicly available at the trigger URL",
        "Test by asking: 'Which candidates have React?'",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Google Gemini API", "Firebase Firestore con Service Account"],
      en: ["n8n self-hosted or cloud", "Google Gemini API", "Firebase Firestore with Service Account"],
    },
  },

  // ──────────────────────────────────────────────────
  // 8. AI Agent Chat — Con Memoria y Búsqueda Web
  // ──────────────────────────────────────────────────
  {
    slug: "ai-chat-agent",
    order: 8,
    title: {
      es: "AI Agent Chat — Memoria + Búsqueda Web",
      en: "AI Agent Chat — Memory + Web Search",
    },
    category: {
      es: "Bots & Asistentes",
      en: "Bots & Assistants",
    },
    summary: {
      es: "Agente conversacional con GPT-4o-mini, memoria de ventana deslizante y búsqueda web en tiempo real vía SerpAPI. Responde preguntas con contexto de conversación persistente.",
      en: "Conversational agent with GPT-4o-mini, sliding window memory and real-time web search via SerpAPI. Answers questions with persistent conversation context.",
    },
    integrations: ["OpenAI", "SerpAPI", "n8n Memory"],
    nodes: 5,
    connections: 4,
    canvas: [
      { id: "n1", x: 0,   y: 84, type: "trigger", label: "Chat Trigger",  icon: "💬", desc: { es: "Chat Trigger de n8n que inicia la sesión conversacional con el agente.", en: "n8n Chat Trigger that starts the conversational session with the agent." } },
      { id: "n2", x: 220, y: 84, type: "ai",      label: "AI Agent",      icon: "🤖", desc: { es: "Agente principal con GPT-4o-mini que coordina el uso de memoria y herramientas para responder.", en: "Main agent with GPT-4o-mini that coordinates the use of memory and tools to respond." } },
      { id: "n3", x: 440, y: 0,  type: "ai",      label: "GPT-4o-mini",   icon: "🧠", desc: { es: "LLM OpenAI GPT-4o-mini conectado como modelo de lenguaje del agente.", en: "OpenAI GPT-4o-mini LLM connected as the agent's language model." } },
      { id: "n4", x: 440, y: 84, type: "ai",      label: "Memoria",       icon: "🧩", desc: { es: "Buffer Window Memory que mantiene el historial de la conversación en una ventana deslizante.", en: "Buffer Window Memory that maintains conversation history in a sliding window." } },
      { id: "n5", x: 440, y: 168,type: "http",    label: "SerpAPI",       icon: "🔎", desc: { es: "SerpAPI Tool que permite al agente buscar en Google en tiempo real para respuestas actualizadas.", en: "SerpAPI Tool that allows the agent to search Google in real-time for up-to-date answers." } },
    ],
    edges: [["n1","n2"],["n2","n3"],["n2","n4"],["n2","n5"]],
    forWho: {
      es: "Desarrolladores que quieren una plantilla base de agente conversacional con memoria y búsqueda web lista para personalizar con system prompt, herramientas adicionales o integración con bases de datos.",
      en: "Developers wanting a base template for a conversational agent with memory and web search ready to customize with system prompt, additional tools, or database integration.",
    },
    howItWorks: {
      es: "El Chat Trigger inicia la sesión. El agente GPT-4o-mini tiene acceso a tres recursos: su LLM directamente, una memoria tipo Buffer Window que recuerda los últimos N mensajes de la conversación, y SerpAPI como herramienta de búsqueda web. Si la pregunta requiere información actualizada, el agente invoca SerpAPI; si necesita contexto previo, consulta la memoria.",
      en: "The Chat Trigger initiates the session. The GPT-4o-mini agent has access to three resources: its LLM directly, a Buffer Window Memory that remembers the last N conversation messages, and SerpAPI as a web search tool. If the question requires updated information, the agent invokes SerpAPI; if it needs prior context, it consults the memory.",
    },
    highlights: {
      es: [
        "Basado en template oficial n8n #1954 con mejoras",
        "Buffer Window Memory para contexto persistente entre turnos",
        "SerpAPI para búsqueda web en tiempo real",
        "Arquitectura limpia lista para añadir más herramientas",
      ],
      en: [
        "Based on official n8n template #1954 with improvements",
        "Buffer Window Memory for persistent context between turns",
        "SerpAPI for real-time web search",
        "Clean architecture ready to add more tools",
      ],
    },
    howToSetup: {
      es: [
        "Configura credenciales de OpenAI y SerpAPI en n8n",
        "Activa el workflow",
        "Abre el chat desde la URL del trigger y empieza a conversar",
        "Personaliza el system prompt en el nodo AI Agent para tu caso de uso",
      ],
      en: [
        "Configure OpenAI and SerpAPI credentials in n8n",
        "Activate the workflow",
        "Open the chat from the trigger URL and start conversing",
        "Customize the system prompt in the AI Agent node for your use case",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Cuenta OpenAI con créditos", "Cuenta SerpAPI"],
      en: ["n8n self-hosted or cloud", "OpenAI account with credits", "SerpAPI account"],
    },
  },

  // ──────────────────────────────────────────────────
  // 9. Error Workflow Genérico
  // ──────────────────────────────────────────────────
  {
    slug: "error-workflow",
    order: 9,
    title: {
      es: "Error Workflow Genérico",
      en: "Generic Error Workflow",
    },
    category: {
      es: "Observabilidad",
      en: "Observability",
    },
    summary: {
      es: "Workflow de manejo global de errores que captura fallos de cualquier workflow que lo tenga configurado como errorWorkflow y envía una alerta inmediata con URL de ejecución y mensaje de error al canal #workflow-fallido de Slack.",
      en: "Global error handling workflow that captures failures from any workflow configured to use it as errorWorkflow and sends an immediate alert with execution URL and error message to the Slack #workflow-fallido channel.",
    },
    integrations: ["Slack", "n8n Error Trigger"],
    nodes: 2,
    connections: 1,
    canvas: [
      { id: "n1", x: 0,   y: 64, type: "trigger", label: "Error Trigger", icon: "🚨", desc: { es: "Error Trigger que se activa cuando cualquier workflow configurado con este como errorWorkflow falla.", en: "Error Trigger that activates when any workflow configured with this as errorWorkflow fails." } },
      { id: "n2", x: 200, y: 64, type: "app",     label: "Alerta Slack",  icon: "💬", desc: { es: "Envía mensaje al canal #workflow-fallido de Slack con la URL de ejecución y el mensaje de error.", en: "Sends message to Slack #workflow-fallido channel with execution URL and error message." } },
    ],
    edges: [["n1","n2"]],
    forWho: {
      es: "Cualquier desarrollador de n8n que quiera observabilidad centralizada de errores sin configurar manejo de errores en cada workflow individualmente.",
      en: "Any n8n developer wanting centralized error observability without configuring error handling in each workflow individually.",
    },
    howItWorks: {
      es: "Cuando cualquier workflow falla y tiene este workflow configurado como su errorWorkflow en Settings, el Error Trigger se activa automáticamente. Un único nodo Slack envía la URL de ejecución y el mensaje de error al canal #workflow-fallido para que el equipo pueda investigar rápidamente.",
      en: "When any workflow fails and has this workflow configured as its errorWorkflow in Settings, the Error Trigger activates automatically. A single Slack node sends the execution URL and error message to the #workflow-fallido channel so the team can quickly investigate.",
    },
    highlights: {
      es: [
        "Un solo workflow de error centralizado para toda la instancia n8n",
        "URL de ejecución directa para ir al error con un clic desde Slack",
        "Configurado como errorWorkflow en: Clasificador Leads, MyChatBot, Asistente Interno, Consultas SQL",
        "Mínimo y efectivo: solo 2 nodos para máxima confiabilidad",
      ],
      en: [
        "Single centralized error workflow for the entire n8n instance",
        "Direct execution URL to go to the error with one click from Slack",
        "Configured as errorWorkflow in: Clasificador Leads, MyChatBot, Asistente Interno, Consultas SQL",
        "Minimal and effective: only 2 nodes for maximum reliability",
      ],
    },
    howToSetup: {
      es: [
        "Activa este workflow y copia su ID",
        "En cada workflow que quieras monitorear, ve a Settings → Error Workflow y selecciona este",
        "Configura credenciales de Slack OAuth2 si no están configuradas",
        "Actualiza el ID del canal #workflow-fallido si tu workspace tiene otro ID",
      ],
      en: [
        "Activate this workflow and copy its ID",
        "In each workflow you want to monitor, go to Settings → Error Workflow and select this one",
        "Configure Slack OAuth2 credentials if not already configured",
        "Update the #workflow-fallido channel ID if your workspace has a different ID",
      ],
    },
    requirements: {
      es: ["n8n self-hosted o cloud", "Workspace Slack con canal #workflow-fallido"],
      en: ["n8n self-hosted or cloud", "Slack workspace with #workflow-fallido channel"],
    },
  },
];

export const I18N = {
  nav: {
    work:    { es: "Workflows",  en: "Workflows" },
    cases:   { es: "Casos",      en: "Cases" },
    about:   { es: "Acerca de",  en: "About" },
    contact: { es: "Contacto",   en: "Contact" },
  },
  hero: {
    eyebrow:   { es: "Portafolio · n8n automations", en: "Portfolio · n8n automations" },
    title_a:   { es: "Automatizaciones",             en: "Automations" },
    title_b:   { es: "que trabajan",                 en: "that work" },
    title_c:   { es: "mientras duermes",             en: "while you sleep" },
    sub:       { es: "Procesos que se ejecutan solos, 24/7. Construidos con n8n: agentes IA, integraciones reales y sin código frágil. Listos para adaptar a tu negocio.", en: "Processes that run on their own, 24/7. Built with n8n: AI agents, real integrations and no brittle code. Ready to adapt to your business." },
    cta_primary:   { es: "Ver workflows", en: "See workflows" },
    cta_secondary: { es: "Hablemos",      en: "Get in touch" },
  },
  stats: [
    { v: "9",    k: { es: "workflows en producción", en: "production workflows" } },
    { v: "6+",   k: { es: "integraciones reales",    en: "real integrations" } },
    { v: "3",    k: { es: "modelos de IA usados",    en: "AI models used" } },
    { v: "100%", k: { es: "open para adaptar",       en: "open to adapt" } },
  ],
  work: {
    title:      { es: "Workflows",          en: "Workflows" },
    sub:        { es: "Flujos reales de producción — no demos", en: "Real production flows — not demos" },
    filter_all: { es: "Todos",              en: "All" },
    nodes:      { es: "nodos",              en: "nodes" },
  },
  cases: {
    title: { es: "Casos de uso", en: "Use cases" },
    sub:   { es: "Qué puedes automatizar", en: "What you can automate" },
    list: [
      { t: { es: "Clasificación de leads",        en: "Lead classification"        }, d: { es: "Recibe contactos, clasifícalos por intención y enrútalos automáticamente.", en: "Receive contacts, classify by intent and route them automatically." } },
      { t: { es: "Asistente interno",             en: "Internal assistant"         }, d: { es: "Portal de peticiones con categorización IA y registro en Notion/Sheets.", en: "Request portal with AI categorization and Notion/Sheets registration." } },
      { t: { es: "Bot conversacional",            en: "Conversational bot"         }, d: { es: "Agentes con memoria, búsqueda web y manejo de notas de voz.", en: "Agents with memory, web search and voice note handling." } },
      { t: { es: "Infraestructura IA",            en: "AI infrastructure"          }, d: { es: "Servidor MCP que expone herramientas a múltiples agentes.", en: "MCP server exposing tools to multiple agents." } },
    ],
  },
  about: {
    title: { es: "Sobre mí",  en: "About me" },
    body:  { es: "Builder de automatizaciones con n8n self-hosted. Diseño flujos que conectan IA, APIs y herramientas reales para resolver problemas de negocio concretos.", en: "Automation builder with self-hosted n8n. I design flows connecting AI, APIs and real tools to solve concrete business problems." },
  },
  contact: {
    title: { es: "¿Tienes un proceso que automatizar?", en: "Have a process to automate?" },
    sub:   { es: "Cuéntame tu caso y vemos si n8n puede resolverlo.", en: "Tell me your case and we'll see if n8n can solve it." },
    name:  { es: "Nombre",   en: "Name" },
    email: { es: "Email",    en: "Email" },
    msg:   { es: "Mensaje",  en: "Message" },
    send:  { es: "Enviar",   en: "Send" },
    sent:  { es: "¡Enviado!", en: "Sent!" },
  },
  footer: {
    built: { es: "Construido con n8n + React", en: "Built with n8n + React" },
  },
};
