from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import analyze, health
from app.core.config import settings

app = FastAPI(title="POVA AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["system"])
app.include_router(analyze.router, prefix="/api", tags=["analysis"])

@app.get("/")
async def root():
    return {"message": "POVA AI Service is online"}
