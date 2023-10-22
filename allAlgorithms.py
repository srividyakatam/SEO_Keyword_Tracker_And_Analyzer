import time
import requests
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
import re
import nltk
from collections import Counter
from sufarray import SufArrayPD
from suffix_trees import STree

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
            st = STree.STree(text)  # Create a suffix tree from the text

            word_counts = Counter(words)
            keywords = [word for word, count in word_counts.most_common(num_keywords)]

            text_elements = soup.find_all('p')

            extracted_lines = []
            for i, element in enumerate(text_elements):
                if i < num_lines:
                    line = element.get_text()
                    words = split_text_into_words(line)
                    extracted_lines.extend(words)

            return keywords, extracted_lines, sarray, st
        else:
            return None, None, None, None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None, None, None

def rabin_karp_string_search(keyword, text):
    # Rabin-Karp search implementation
    # Initialize variables
    keyword = keyword.lower()  # Convert keyword to lowercase for case-insensitive search
    text = ' '.join(text).lower()

    prime = 101  # A prime number for hashing
    keyword_hash = sum(ord(char) for char in keyword)  # Compute the hash of the keyword
    text_hash = 0

    keyword_len = len(keyword)
    text_len = len(text)
    occurrences = []

    # Calculate the initial text hash
    for i in range(keyword_len):
        text_hash += ord(text[i])

    for i in range(text_len - keyword_len + 1):
        if text_hash == keyword_hash and text[i:i + keyword_len] == keyword:
            occurrences.append(i)

        if i < text_len - keyword_len:
            # Update the text hash using rolling hash
            text_hash = (text_hash - ord(text[i])) + ord(text[i + keyword_len])

    return occurrences

def kmp_search(keyword, text):
    # Knuth-Morris-Pratt search implementation
    # Initialize variables
    keyword = keyword.lower()  # Convert keyword to lowercase for case-insensitive search
    keyword_len = len(keyword)

    # Join the list of lowercase words into a single lowercase string
    text = ' '.join(text).lower()

    # Build the KMP failure function (partial match table)
    failure = [0] * keyword_len
    j = 0
    for i in range(1, keyword_len):
        while j > 0 and keyword[i] != keyword[j]:
            j = failure[j - 1]
        if keyword[i] == keyword[j]:
            j += 1
        failure[i] = j

    # Perform the KMP search
    occurrences = []
    j = 0
    for i in range(len(text)):
        while j > 0 and text[i] != keyword[j]:
            j = failure[j - 1]
        if text[i] == keyword[j]:
            j += 1
        if j == keyword_len:
            start = i - j + 1
            occurrences.append(start)
            j = failure[j - 1]

    return occurrences


def naive_string_search(keyword, text):
    # Naive String Matching search implementation
    # Initialize variables
    keyword = keyword.lower()  # Convert keyword to lowercase for case-insensitive search
    keyword_len = len(keyword)
    text = ' '.join(text).lower()

    occurrences = []
    text_len = len(text)

    for i in range(text_len - keyword_len + 1):
        if text[i:i + keyword_len] == keyword:
            occurrences.append(i)

    return occurrences

def suffix_tree_search(keyword, text_lines):
    # Suffix Tree search implementation
    text = ' '.join(text_lines)
    keyword = keyword.lower()
    text = text.lower()

    # Build a Suffix Tree from the text
    st = STree.STree(text)

    # Search for the keyword in the Suffix Tree
    occurrences = [pos for pos in st.find_all(keyword)]

    return occurrences


def main():
    url = input("Enter the website URL: ")
    num_keywords = int(input("Enter the number of keywords to extract: "))
    num_lines = int(input("Enter the number of text lines to extract: "))

    extracted_keywords, extracted_lines, sarray, st = extract_keywords_and_text_lines(url, num_keywords, num_lines)

    if extracted_keywords:
        print(f"Top {num_keywords} Keywords from the website:")
        for i, keyword in enumerate(extracted_keywords, 1):
            print(f"{i}. {keyword}")

        selected_algorithm = input("Select a search algorithm (rabin_karp, kmp, naive, suffix_tree): ").strip()

        if selected_algorithm == "rabin_karp":
            selected_search = rabin_karp_string_search
        elif selected_algorithm == "kmp":
            selected_search = kmp_search
        elif selected_algorithm == "naive":
            selected_search = naive_string_search
        elif selected_algorithm == "suffix_tree":
            selected_search = suffix_tree_search

        else:
            print("Invalid algorithm selection.")
            return

        selected_keyword = input(f"Enter the keyword to search using {selected_algorithm}: ").strip().lower()

        start_time = time.time()
        keyword_occurrences = selected_search(selected_keyword, extracted_lines)
        elapsed_time = time.time() - start_time

        if keyword_occurrences:
            print(f"Occurrences of '{selected_keyword}' in the All Words from the website:")
            print(keyword_occurrences)  # Output the list of positions
            print(f"Execution time for {selected_algorithm} search: {elapsed_time} seconds")
        else:
            print(f"'{selected_keyword}' not found in the All Words from the website.")
    else:
        print("Failed to extract keywords from the website.")

if __name__ == "__main__":
    main()
