# Guía de Implementación del Agente Autónomo Ejecutivo

## 1. Requisitos previos
- Python 3.8+
- Cuenta de Google Cloud Platform
- Acceso a BotFather de Telegram
- Entorno virtual recomendado

## 2. Configuración de APIs

### Google API
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar:
   - Gmail API
   - Google Calendar API
3. Crear credenciales OAuth 2.0
4. Descargar archivo `credentials.json`

### Telegram Bot
1. Hablar con [@BotFather](https://t.me/BotFather)
2. Ejecutar `/newbot` y seguir instrucciones
3. Copiar el token proporcionado

## 3. Instalación
```bash
pip install python-dotenv google-api-python-client python-telegram-bot
```

## 4. Ejecución
```bash
python aae_framework.py
```

## 5. Protocolo de seguridad
- Nunca comprometer credenciales
- Rotar tokens cada 90 días
- Usar entorno virtual