from suffix_trees import STree


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


# Each function should have the same signature:
# - keyword: the keyword to search for
# - extracted_lines: the list of extracted lines from the text
algo_funcs = {
    "rabin_karp": rabin_karp_string_search,
    "kmp": kmp_search,
    "naive": naive_string_search,
    "suffix_tree": suffix_tree_search
}
