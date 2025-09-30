HEAD
# Mio Automation (Public Snapshot)
Este mirror se construye desde `mirror-include.txt` y se actualiza en cada push.
Contiene solo archivos no sensibles para entender la arquitectura y aplicar parches.

﻿# mio-automation

Arquitectura modular para automatizar WhatsApp, reservas y HotelRunner.

## Servicios
- **core-bot** (Node): Webhooks de WhatsApp, plantillas, lógica de conversación.
- **brain** (Node): Capa de conocimiento (p.ej. Google Sheets) y fallback a GPT.
- **gmail-ingestor** (Python): Lee correos de nuevas reservas y notifica al bot.
- **hr-phone-worker** (Python): Usa Appium/Selenium para leer teléfono desde HotelRunner App.
- **jobs** (Node): Reintentos, tareas programadas y health checks.

## Cómo correr
1. Copia .env.example a .env y completa tus tokens.
2. docker compose up --build
3. Webhooks de prueba:
   - core-bot: http://localhost:3000/health
   - brain:    http://localhost:3010/health
## 📂 Índice de Repositorios
> Esta sección sirve como referencia rápida para saber dónde está cada repo relacionado (local y remoto).  
> Siempre actualizar si se mueve la carpeta local o cambia la URL remota.

### Repos principales
- **mio-automation (Privado)**
  - Local: `E:\DESARROLLOS\mio-automation`
  - Remoto: git@github.com:JoseM48/mio-automation.git
  - Notas: Repo principal con configuración, .env y servicios internos.

- **mio-automation-public (Mirror público)**
  - Local: `E:\DESARROLLOS\mio-automation-public`
  - Remoto: https://github.com/JoseM48/mio-automation-public.git
  - Notas: Mirror sin claves ni datos sensibles, para parches y despliegues públicos.

---

### Otros proyectos en desarrollo
- **whatsapp-gpt-bot**
  - Local: `E:\DESARROLLOS\whatsapp-gpt-bot`
  - Remoto: *(pendiente)*  
  - Notas: Bot experimental de WhatsApp con integración GPT.

- **whatsapp-webhook**
  - Local: `E:\DESARROLLOS\whatsapp-webhook`
  - Remoto: *(pendiente)*  
  - Notas: Servicio para pruebas con webhooks de WhatsApp.

- **lector_gmail**
  - Local: `E:\DESARROLLOS\lector_gmail`
  - Remoto: *(pendiente)*  
  - Notas: Scripts en Python para leer correos de nuevas reservas.

- **Scraping**
  - Local: `E:\DESARROLLOS\Scraping`
  - Remoto: *(pendiente)*  
  - Notas: Scripts varios de scraping (posible integración con reservas o datos externos).

---

### Herramientas / Dependencias
- **Node**
  - Local: `E:\DESARROLLOS\Node`
  - Notas: Entorno Node.js y pruebas de librerías.

- **Appium / Appium 2 / Appium Inspector**
  - Local: `E:\DESARROLLOS\Appium*`
  - Notas: Herramientas para pruebas automáticas con móviles (HotelRunner App).

- **Android Studio**
  - Local: `E:\DESARROLLOS\Android Studio`
  - Notas: IDE para emuladores Android y debugging.

- **Malwarebytes**
  - Local: `E:\DESARROLLOS\Malwarebytes`
  - Notas: Seguridad.

- **CPU Z**
  - Local: `E:\DESARROLLOS\CPU Z`
  - Notas: Herramienta de diagnóstico del sistema.

---

### Archivos útiles
- **credenciales.txt.txt**  
- **cert del 3202882608.txt**  
- **conexion_google_sheets.py**  
- **python-3.11.9-amd64.exe**  
- **Datos importantes.txt**  
- **CLAVE PARA RENDER**  

*(Estos archivos están en la raíz de `E:\DESARROLLOS\`. Recomendado: moverlos a una subcarpeta `docs/privado/` dentro de `mio-automation` o añadirlos a `.gitignore` para mayor orden y seguridad).*
93a2143 (chore(mirror): incluir snapshot completo post-robocopy)
