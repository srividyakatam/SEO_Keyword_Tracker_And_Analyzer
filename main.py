from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
import nltk
from wordcloud import WordCloud
import base64
from PIL import Image
from io import BytesIO

# Create a Flask application instance
app = Flask(__name__)

# Download 'punkt' and 'stopwords' resources from NLTK
nltk.download('punkt')
nltk.download('stopwords')

# Function to extract keywords from a given URL
def extract_keywords_from_url(url, num_keywords=5):
    try:
        # Send an HTTP GET request to the URL
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the HTML content of the page
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find and extract the text from the page
            text = soup.get_text()

            # Tokenize the text into words
            words = word_tokenize(text)

            # Filter out stopwords (common words that are not keywords)
            stop_words = set(stopwords.words('english'))
            words = [word.lower() for word in words if word.isalpha() and word.lower() not in stop_words]

            # Count the frequency of each word
            word_freq = Counter(words)

            # Get the most common words as keywords
            keywords = word_freq.most_common(num_keywords)

            return [(keyword, count) for keyword, count in keywords]

        else:
            return "Failed to retrieve the URL. Status code: " + str(response.status_code)

    except Exception as e:
        return str(e)

# Function to generate a word cloud from keywords
def generate_word_cloud(keywords):
    text = ' '.join([keyword for keyword, _ in keywords])
    wordcloud = WordCloud(width=1000, height=500, background_color='white').generate(text)

    if wordcloud:
        # Convert the Word Cloud image to a base64 encoded string
        buffered = BytesIO()
        wordcloud.to_image().save(buffered, format="PNG")
        wordcloud_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return wordcloud_base64
    else:
        return None

# Route for the root URL ("/") for both GET and POST requests
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        url = request.form["url"]
        num_keywords = int(request.form["num_keywords"])
        keywords = extract_keywords_from_url(url, num_keywords)
        keywordCountMap = {keyword: count for keyword, count in keywords}

        wordcloud_base64 = generate_word_cloud(keywords)

        # Render the HTML template with the extracted keywords and the word cloud image
        return render_template("index.html", keywords=keywords, wordcloud_base64=wordcloud_base64, url=url, keywordCountMap=keywordCountMap)

    # If it's a GET request, display an empty form
    return render_template("index.html", keywords=None, wordcloud_base64=None, url=None, keywordCountMap={})

# Run the Flask application if this script is the main module
if __name__ == "__main__":
    app.run(debug=True)
