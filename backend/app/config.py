import os

class Config:
    # Configuration centralisée via variables d’environnement (fichier `.env` en dev).
    # En prod (Render, etc.), ces variables sont injectées par la plateforme.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY")