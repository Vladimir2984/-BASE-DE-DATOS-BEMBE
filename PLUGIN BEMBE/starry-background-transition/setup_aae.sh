#!/bin/bash
echo "Instalando Agente Autónomo Ejecutivo (AAE)"

# Crear entorno virtual
python -m venv aae_env
source aae_env/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install python-dotenv google-api-python-client python-telegram-bot

# Configurar variables de entorno
if [ ! -f .env ]; then
    echo "Creando archivo .env"
    cp aae_config.env .env
    echo "Por favor edita el archivo .env con tus credenciales"
fi

echo "Instalación completada. Para iniciar:"
echo "source aae_env/bin/activate && python aae_framework.py"