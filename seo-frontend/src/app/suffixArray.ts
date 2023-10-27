class SuffixArray {
  private text: string;
  private suffixArray: number[];

  constructor(text: string) {
    this.text = text;
    this.suffixArray = this.buildSuffixArray(text);
  }

  private buildSuffixArray(text: string): number[] {
    const suffixes: string[] = [];

    for (let i = 0; i < text.length; i++) {
      suffixes.push(text.slice(i));
    }

    suffixes.sort();

    const suffixArray: number[] = [];

    for (const suffix of suffixes) {
      suffixArray.push(text.length - suffix.length);
    }

    return suffixArray;
  }

  public findOccurrences(keyword: string): number[] {
    keyword = keyword.toLowerCase();
    const occurrences: number[] = [];
    const keywordLen: number = keyword.length;

    for (let i: number = 0; i < this.suffixArray.length; i++) {
      const suffix = this.text.slice(this.suffixArray[i]);
      if (suffix.startsWith(keyword)) {
        occurrences.push(this.suffixArray[i]);
      }
    }

    return occurrences;
  }
}
