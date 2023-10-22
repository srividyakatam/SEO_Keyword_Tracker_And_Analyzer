import time

import requests
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
import re
import nltk
from collections import Counter
from sufarray import SufArrayPD  # Import the SufArrayPD from your library

nltk.download('stopwords')

def split_text_into_words(text):
    words = re.split(r'\W+', text)
    return [word for word in words if word]

def extract_keywords_and_text_lines(url, num_keywords, num_lines):
    try:
        response = requests.get(url)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            text = ' '.join([element.get_text() for element in soup.find_all(string=True)])

            stop_words = set(stopwords.words('english'))
            words = [word.lower() for word in split_text_into_words(text) if word.lower() not in stop_words]

            sarray = SufArrayPD(text)  # Create a suffix array from the text

            word_counts = Counter(words)
            keywords = [word for word, count in word_counts.most_common(num_keywords)]

            text_elements = soup.find_all('p')

            extracted_lines = []
            for i, element in enumerate(text_elements):
                if i < num_lines:
                    line = element.get_text()
                    words = split_text_into_words(line)
                    extracted_lines.extend(words)

            return keywords, extracted_lines, sarray
        else:
            return None, None, None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None, None

url = input("Enter the website URL: ")
num_keywords = int(input("Enter the number of keywords to extract: "))
num_lines = int(input("Enter the number of text lines to extract: "))

extracted_keywords, extracted_lines, sarray = extract_keywords_and_text_lines(url, num_keywords, num_lines)

if extracted_keywords:
    print(f"Top {num_keywords} Keywords from the website:")
    for i, keyword in enumerate(extracted_keywords, 1):
        print(f"{i}. {keyword}")

    selected_keyword = int(input(f"Select a keyword by entering its number (1 to {num_keywords}): "))

    if 1 <= selected_keyword <= num_keywords:
        keyword_to_lookup = extracted_keywords[selected_keyword - 1].lower()

        start_time = time.time()
        # Find all occurrences of the keyword manually
        keyword_occurrences = [i for i in range(len(extracted_lines)) if extracted_lines[i].lower().startswith(keyword_to_lookup)]
        elapsed_time = time.time() - start_time

        if keyword_occurrences:
            print(f"Occurrences of '{keyword_to_lookup}' in the All Words from the website:")
            print(keyword_occurrences)  # Output the list of positions
            print(f"Execution time for Suffix Array Search: {elapsed_time} seconds")
        else:
            print(f"'{keyword_to_lookup}' not found in the All Words from the website.")
    else:
        print("Invalid keyword selection.")
else:
    print("Failed to extract keywords from the website.")

print(sarray)