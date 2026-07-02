"""FinSight — FastAPI entrypoint."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from db import client as mongo_client, ensure_indexes  # noqa: E402
from routes import router as api_router  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger: logging.Logger = logging.getLogger("finsight")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("FinSight starting up...")
    try:
        await ensure_indexes()
    except Exception as e:
        logger.exception("ensure_indexes failed: %s", e)
    yield
    logger.info("FinSight shutting down...")
    mongo_client.close()


app: FastAPI = FastAPI(title="FinSight API", lifespan=lifespan)

root_api: APIRouter = APIRouter(prefix="/api")
root_api.include_router(api_router)
app.include_router(root_api)

# CORS: allow credentials so httpOnly cookies are sent by the browser.
# When credentials are true we must NOT use "*"; we use the explicit origin
# from CORS_ORIGINS (comma-separated).
_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if not _origins:
    _origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
