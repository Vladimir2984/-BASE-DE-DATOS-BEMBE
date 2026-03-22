"""
Módulo para integración con APIs externas (ejemplo: OpenWeatherMap)
"""
import os
import requests
import logging
from dotenv import load_dotenv
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv("aae_config.env")

class WeatherModule:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/3.0/onecall"
        # Coordenadas y nombre de Saint Petersburg por defecto
        self.city = "Saint Petersburg"
        self.lat = 59.9343  # Latitud
        self.lon = 30.3351  # Longitud
        self.units = "metric"  # Celsius
        self.exclude = "minutely,hourly"  # Excluir datos no necesarios
    
    def fetch_weather(self):
        """Obtiene datos de clima desde OpenWeatherMap One Call API"""
        if not self.api_key:
            logger.error("Falta clave de API de OpenWeatherMap en .env")
            return None
        
        try:
            params = {
                "lat": self.lat,
                "lon": self.lon,
                "exclude": self.exclude,
                "appid": self.api_key,
                "units": self.units
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()  # Levanta error para códigos HTTP 4xx/5xx
            
            weather_data = response.json()
            logger.info(f"Clima actual en {self.city}: {weather_data['current']['temp']}°C")
            return weather_data
        
        except requests.exceptions.ConnectionError:
            logger.error("Error de conexión con OpenWeatherMap")
        except requests.exceptions.Timeout:
            logger.error("Timeout al conectar con OpenWeatherMap")
        except requests.exceptions.HTTPError as e:
            logger.error(f"Error HTTP: {e.response.status_code} - {e.response.reason}")
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
        
        return None
    
    def check(self):
        """Método compatible con el framework AAE"""
        weather = self.fetch_weather()
        if weather and weather["current"]["temp"] > 30:
            return Status(requires_action=True)  # Ejemplo: alerta si temperatura >30°C
        return Status(requires_action=False)
    
    def generate_alert(self):
        """Genera alerta para el módulo Telegram"""
        weather = self.fetch_weather()
        if weather:
            return f"⚠️ Alerta: Temperatura alta en {self.city} ({weather['current']['temp']}°C)"
        return "⚠️ Alerta: No se pudo obtener datos de clima"

class Status:
    def __init__(self, requires_action):
        self.requires_action = requires_action

# Ejemplo de uso
if __name__ == "__main__":
    weather_module = WeatherModule()
    weather_module.fetch_weather()