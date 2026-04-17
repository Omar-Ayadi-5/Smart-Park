import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Required for JWT signing; set SECRET_KEY in .env for production
    SECRET_KEY = os.getenv("SECRET_KEY")