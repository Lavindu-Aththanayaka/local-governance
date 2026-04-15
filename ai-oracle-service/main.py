from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Define the expected format of the incoming request
class ReportData(BaseModel):
    report_id: str
    text: str

# A basic mock function to simulate AI text moderation
def analyze_text(text: str):
    text_lower = text.lower()
    # Simple keyword check for demonstration
    bad_words = ["spam", "fake", "idiot", "scam"]

    if any(word in text_lower for word in bad_words):
        return {"trust_score": 10, "is_spam": True}

    # If it looks like a normal civic report
    return {"trust_score": 95, "is_spam": False}

@app.post("/moderate/text")
def moderate_text(report: ReportData):
    # Run the analysis
    result = analyze_text(report.text)

    # Return the result in a clean JSON format
    return {
        "report_id": report.report_id,
        "trust_score": result["trust_score"],
        "is_spam": result["is_spam"]
    }
