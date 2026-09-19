from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
from PIL import Image
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import shutil
import uuid
import json
from datetime import datetime

# ============================================================
# GEOSENSE BACKEND
# SIH26227
# Semantic Retrieval and Multi-Temporal Change Analysis
# of Satellite Imagery
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

IMAGE_DIR = BASE_DIR / "data" / "images"
METADATA_DIR = BASE_DIR / "data" / "metadata"
RESULT_DIR = BASE_DIR / "results"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
METADATA_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="GeoSense API",
    description="Backend for Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery",
    version="1.0.0"
)

# ============================================================
# CORS - Allows React frontend to communicate with FastAPI
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".tif",
    ".tiff"
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def valid_image(filename):
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def load_metadata():

    file = METADATA_DIR / "images.json"

    if not file.exists():
        return []

    try:
        return json.loads(
            file.read_text(encoding="utf-8")
        )
    except Exception:
        return []


def save_metadata(data):

    file = METADATA_DIR / "images.json"

    file.write_text(
        json.dumps(data, indent=4),
        encoding="utf-8"
    )


def image_vector(path):

    try:

        image = Image.open(path).convert("RGB")

        image = image.resize((64, 64))

        array = np.asarray(
            image,
            dtype=np.float32
        )

        array = array / 255.0

        return array.flatten()

    except Exception:

        return None


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "GeoSense Backend is running!",
        "project": "Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery",
        "problem_statement": "SIH26227"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "backend": "FastAPI",
        "offline": True
    }


# ============================================================
# PROJECT INFORMATION
# ============================================================

@app.get("/project-info")
def project_info():

    return {

        "project": "GeoSense",

        "problem_statement": "SIH26227",

        "theme": "Space Technology",

        "category": "Software",

        "features": [
            "Satellite image upload",
            "Local image storage",
            "Semantic text search",
            "Image similarity search",
            "Multi-temporal change analysis",
            "Change map generation",
            "Offline processing",
            "REST API"
        ]
    }


# ============================================================
# UPLOAD SATELLITE IMAGE
# ============================================================

@app.post("/upload")
async def upload_image(

    file: UploadFile = File(...),

    year: str = Form("unknown"),

    location: str = Form("unknown"),

    description: str = Form("")
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    if not valid_image(file.filename):

        raise HTTPException(
            status_code=400,
            detail="Unsupported image format"
        )

    image_id = uuid.uuid4().hex[:8]

    extension = Path(
        file.filename
    ).suffix.lower()

    safe_name = (
        Path(file.filename)
        .stem
        .replace(" ", "_")
    )

    filename = (
        f"{image_id}_{safe_name}{extension}"
    )

    save_path = IMAGE_DIR / filename

    with open(save_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    metadata = load_metadata()

    image_info = {

        "id": image_id,

        "filename": filename,

        "original_filename": file.filename,

        "year": year,

        "location": location,

        "description": description,

        "uploaded_at": datetime.now().isoformat()
    }

    metadata.append(image_info)

    save_metadata(metadata)

    return {

        "success": True,

        "message":
            "Satellite image uploaded successfully",

        "image": image_info
    }


# ============================================================
# LIST ALL IMAGES
# ============================================================

@app.get("/images")
def list_images():

    metadata = load_metadata()

    return {

        "count": len(metadata),

        "images": metadata
    }


# ============================================================
# GET IMAGE
# ============================================================

@app.get("/images/{filename}")
def get_image(filename: str):

    path = IMAGE_DIR / filename

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return FileResponse(path)


# ============================================================
# SEMANTIC TEXT SEARCH
#
# Lightweight offline prototype.
# Later this endpoint can use CLIP + FAISS.
# ============================================================

@app.get("/search")
def semantic_search(

    query: str,

    limit: int = 10
):

    metadata = load_metadata()

    if not metadata:

        return {

            "query": query,

            "count": 0,

            "results": []
        }

    documents = []

    for item in metadata:

        text = " ".join([

            str(item.get(
                "filename",
                ""
            )),

            str(item.get(
                "year",
                ""
            )),

            str(item.get(
                "location",
                ""
            )),

            str(item.get(
                "description",
                ""
            ))
        ])

        documents.append(text)

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        vectors = vectorizer.fit_transform(

            documents + [query]

        )

        image_vectors = vectors[:-1]

        query_vector = vectors[-1]

        scores = cosine_similarity(

            query_vector,

            image_vectors

        )[0]

    except Exception:

        return {

            "query": query,

            "count": 0,

            "results": []
        }

    indices = np.argsort(scores)[::-1]

    results = []

    for index in indices[:limit]:

        if scores[index] > 0:

            result = metadata[index].copy()

            result["similarity_score"] = round(

                float(scores[index]),

                4

            )

            results.append(result)

    return {

        "query": query,

        "count": len(results),

        "results": results
    }


# ============================================================
# IMAGE SEARCH
# ============================================================

@app.post("/image-search")
async def image_search(

    file: UploadFile = File(...),

    limit: int = 5
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No image provided"
        )

    if not valid_image(file.filename):

        raise HTTPException(
            status_code=400,
            detail="Invalid image format"
        )

    temp_path = (

        RESULT_DIR /

        f"temp_{uuid.uuid4().hex}.png"

    )

    with open(temp_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    query_vector = image_vector(
        temp_path
    )

    if query_vector is None:

        temp_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to process image"
        )

    results = []

    for image_file in IMAGE_DIR.iterdir():

        if image_file.suffix.lower() not in ALLOWED_EXTENSIONS:

            continue

        vector = image_vector(
            image_file
        )

        if vector is None:

            continue

        score = cosine_similarity(

            [query_vector],

            [vector]

        )[0][0]

        results.append({

            "filename":
                image_file.name,

            "similarity_score":
                round(
                    float(score),
                    4
                )
        })

    results.sort(

        key=lambda x:
            x["similarity_score"],

        reverse=True
    )

    temp_path.unlink(
        missing_ok=True
    )

    return {

        "message":
            "Image similarity search completed",

        "count":
            min(
                limit,
                len(results)
            ),

        "results":
            results[:limit]
    }


# ============================================================
# MULTI-TEMPORAL CHANGE ANALYSIS
# ============================================================

@app.post("/change-analysis")
async def change_analysis(

    before: UploadFile = File(...),

    after: UploadFile = File(...)
):

    before_path = (

        RESULT_DIR /

        f"before_{uuid.uuid4().hex}.png"

    )

    after_path = (

        RESULT_DIR /

        f"after_{uuid.uuid4().hex}.png"

    )

    with open(before_path, "wb") as buffer:

        shutil.copyfileobj(
            before.file,
            buffer
        )

    with open(after_path, "wb") as buffer:

        shutil.copyfileobj(
            after.file,
            buffer
        )

    try:

        before_image = Image.open(

            before_path

        ).convert("RGB")

        after_image = Image.open(

            after_path

        ).convert("RGB")

        width = min(

            before_image.width,

            after_image.width

        )

        height = min(

            before_image.height,

            after_image.height

        )

        before_image = before_image.resize(

            (width, height)

        )

        after_image = after_image.resize(

            (width, height)

        )

        before_array = np.asarray(

            before_image,

            dtype=np.float32

        )

        after_array = np.asarray(

            after_image,

            dtype=np.float32

        )

        difference = np.abs(

            after_array -

            before_array

        ).mean(axis=2)

        threshold = 30

        changed = (

            difference > threshold

        )

        total_pixels = changed.size

        changed_pixels = int(

            changed.sum()

        )

        change_percentage = (

            changed_pixels /

            total_pixels

        ) * 100

        change_map = np.zeros(

            (height, width, 3),

            dtype=np.uint8

        )

        change_map[changed] = [

            255,

            0,

            0

        ]

        result_name = (

            f"change_map_"

            f"{uuid.uuid4().hex[:8]}"

            f".png"

        )

        result_path = (

            RESULT_DIR /

            result_name

        )

        Image.fromarray(

            change_map

        ).save(result_path)

        return {

            "success": True,

            "message":
                "Multi-temporal change analysis completed",

            "analysis": {

                "width":
                    width,

                "height":
                    height,

                "changed_pixels":
                    changed_pixels,

                "total_pixels":
                    total_pixels,

                "change_percentage":
                    round(

                        float(
                            change_percentage
                        ),

                        2

                    ),

                "threshold":
                    threshold
            },

            "change_map":
                f"/results/{result_name}"

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=
                f"Change analysis failed: {str(e)}"

        )

    finally:

        before_path.unlink(
            missing_ok=True
        )

        after_path.unlink(
            missing_ok=True
        )


# ============================================================
# SERVE CHANGE MAP
# ============================================================

@app.get("/results/{filename}")
def get_result(filename: str):

    path = RESULT_DIR / filename

    if not path.exists():

        raise HTTPException(

            status_code=404,

            detail="Result not found"

        )

    return FileResponse(path) 