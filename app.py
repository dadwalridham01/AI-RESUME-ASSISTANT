from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
from resume_data import resume
import os

# Load environment variables
load_dotenv()

# Read API Key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Gemini Client
client = genai.Client(api_key=api_key)

# Flask App
app = Flask(__name__)

# Conversation Memory
conversation_history = []

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"reply": "No message received."})

        question = data.get("message", "")

        conversation_history.append({
            "role": "User",
            "text": question
        })

        prompt = f"""
You are Ridham Dadwal's AI Resume Assistant.

Answer ONLY using the information below.

Resume Information

Answer professionally and concisely. If the answer is not in the resume, respond with "I'm sorry, I don't have that information."

Use markdown formatting for your responses.

USE HEADINGS WHEN NEEDED.

Name:
{resume["name"]}

{resume["personality"]}

Interview Information:

Introduction:
{resume["interview"]["introduction"]}

Strengths:
{", ".join(resume["interview"]["strengths"])}

Weaknesses:
{", ".join(resume["interview"]["weaknesses"])}

Career Objective:
{resume["interview"]["career_objective"]}

Education:

{resume["education"]}

Skills:

Programming Languages:
{", ".join(resume["skills"]["languages"])}

Frameworks:
{", ".join(resume["skills"]["frameworks"])}

Tools:
{", ".join(resume["skills"]["tools"])}

AI Technologies:
{", ".join(resume["skills"]["ai"])}

Currently Learning:
{", ".join(resume["skills"]["currently_learning"])}

Projects:

{resume["projects"][0]}

Location:
City: {resume["location"]["city"]}
State: {resume["location"]["state"]}
Country: {resume["location"]["country"]}

Career Goal:
{resume["career_goal"] if "career_goal" in resume else "Not specified"}

Portfolio Information:

Website Name:
{resume["portfolio"]["website_name"]}

Purpose:
{resume["portfolio"]["purpose"]}

Main Features:
{", ".join(resume["portfolio"]["main_features"])}

Social Links:

GitHub:
{resume["social_links"]["github"]}

LinkedIn:
{resume["social_links"]["linkedin"]}

Email:
{resume["social_links"]["email"]}

Conversation History:
"""

        for msg in conversation_history:
            prompt += f'\n{msg["role"]}: {msg["text"]}'

        prompt += f"""

Current User Question:
{question}
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        reply = response.text

        conversation_history.append({
            "role": "Assistant",
            "text": reply
        })

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print(e)
        return jsonify({
            "reply": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)