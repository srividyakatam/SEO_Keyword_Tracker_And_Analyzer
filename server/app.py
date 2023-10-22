from collections import Counter
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from keywords import getKeywordIdeas
app = Flask(__name__)
CORS(app)


@app.route("/")
def test():
    return "Hello World!"


# Get URL Text
@app.route("/getURLText", methods=["GET"])
def getURLText():
    base_url = request.args.get("url")
    print(base_url)
    r = requests.get(base_url)
    soup = BeautifulSoup(r.text, "html.parser")
    subpages = set()
    for link in soup.find_all("a"):
        href = link.get("href")
        # Filter and format the subpage URLs
        if href and href.startswith("/"):
            full_url = f"{base_url.rstrip('/')}{href}"
            subpages.add(full_url)
    word_counter={}
    counter=Counter(soup.text.split())
    return jsonify({"text": soup.text, "subpages": list(subpages),
                    "keywords":getKeywordIdeas(None,base_url), "word_counter":counter.most_common(10)})


# Run App
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
