import base64
import re
import time
from collections import Counter
from io import BytesIO

import nltk
import requests
from bs4 import BeautifulSoup
from flask import Flask, request
from flask import jsonify
from flask_cors import CORS
from nltk.corpus import stopwords
from wordcloud import WordCloud

from algorithms import algo_funcs
from keywords import getKeywordIdeas

app = Flask(__name__)
CORS(app)

nltk.download("punkt")
nltk.download("stopwords")


# Utility Functions

# Function to split text into words and remove stopwords
def split_text_into_words(text):
    # Preprocess the text
    text = text.lower()
    words = re.split(r"\W+", text)
    stop_words = set(stopwords.words("english"))
    return [word for word in words if word.lower() not in stop_words and len(word) > 1]


# Function to generate a word cloud from keywords
def generate_word_cloud(keywords):
    text = " ".join([keyword for keyword, _ in keywords])
    wordcloud = WordCloud(width=1000, height=500, background_color="white").generate(text)

    if wordcloud:
        # Convert the Word Cloud image to a base64 encoded string
        buffered = BytesIO()
        wordcloud.to_image().save(buffered, format="PNG")
        wordcloud_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return wordcloud_base64
    else:
        return None


def extract_keywords_and_text_lines(soupp, num_keywords):
    raw_text = ""
    for tag in soupp.find("body").find_all(string=True, recursive=True):
        raw_text += "{} ".format(tag.text)
    alldata = split_text_into_words(raw_text)
    word_counts = Counter(alldata)
    return word_counts.most_common(num_keywords), alldata, raw_text, word_counts


@app.route("/")
def test():
    return "Hello World!"


# Get URL Text
@app.route("/analyse", methods=["POST"])
def analyse():
    # app.run(host="127.0.0.1", port=5001, debug=True)
    base_url = request.json.get("url")
    if not base_url:
        return jsonify({"error": "Missing URL parameter"}), 400
    r = requests.get(base_url)
    soup = BeautifulSoup(r.text, "html.parser")
    subpages = set()
    for link in soup.find_all("a"):
        href = link.get("href")
        # Filter and format the subpage URLs
        if href and href.startswith("/"):
            full_url = f"{base_url.rstrip('/')}{href}"
            subpages.add(full_url)
    print("subpages", list(subpages))
    top, data, raw_text, all_counter = extract_keywords_and_text_lines(soup, 20)
    algodetails = []
    for algo, func in algo_funcs.items():
        start_time = time.perf_counter()
        for key, _ in top:
            func(key, data)
        end_time = time.perf_counter()
        algodetails.append({"name": algo, "time": end_time - start_time})

    recommended_url = getKeywordIdeas(None, base_url)
    recommended_top_keys = getKeywordIdeas(list(map(lambda x: x[0], top[:20])), None)
    filtered_reco = []
    for each in all_counter.most_common(20):
        filtered_reco.extend(
            list(filter(lambda rec: each[0] in rec['text'] and each[0] != rec['text'], recommended_top_keys))[:10])

    return jsonify({"text": raw_text,
                    "subpages": list(subpages),
                    "top_keywords": dict(top),
                    "algorithms": algodetails,
                    "recommended_top_keys": filtered_reco,
                    "recommended_url": recommended_url[:300],
                    "all_counter": all_counter
                    })


if __name__ == "__main__":
    app.run(port=5001)
