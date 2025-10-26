from fastapi import FastAPI

app = FastAPI(title="Datax API", version="0.1")

@app.get("/")
def root():
    return {"message": "Welcome to Datax API"}
