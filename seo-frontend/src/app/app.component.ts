import {Component, ViewChild} from '@angular/core';
import {CloudData, TagCloudComponent} from "angular-tag-cloud-module";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ANALYSE_URL, APIResponse} from "./constants";
import {BehaviorSubject} from "rxjs";
import {response} from "./test";
import {MatDialog} from "@angular/material/dialog";
import {DialogContent} from "./dialog-content.component";
import {ChartConfiguration, ChartData} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import { MatDialogRef } from '@angular/material/dialog';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title: string = 'SEO Keyword Tracker and Analyzer'
  @ViewChild('tagCloudComponent', {static: true}) tagCloudComponent!: TagCloudComponent;
  cloudData: CloudData[] = Array.from({length: 100}, (_, i) => {
    let weight = Math.floor(Math.random() * 10)
    return {
      text: `Tag ${i}`,
      weight,
      rotate: Math.floor(Math.random() * 90) - 45,
      tooltip: `${weight} occurrences`,
    }
  });
  formgroup: FormGroup = new FormGroup({
    url: new FormControl('', [Validators.required,
      Validators.pattern('^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$')]),
    algorithm: new FormControl(''),
  });
  urlData = new BehaviorSubject<APIResponse | undefined>(undefined)
  loading: boolean = false;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: true,
  };
  public barChartPlugins = [DataLabelsPlugin];
  public barChartData!: ChartData<'bar'>
  
  text: string = '';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {
    this.urlData.next(response)
    // @ts-ignore
    window.home = this;
    this.urlData.subscribe(newRes => {
      if (!newRes) {
        return
      }
      console.log({newRes})

      const sortedKeys = Object.keys(newRes.all_counter)
        .sort((a, b) => newRes.all_counter[b] - newRes.all_counter[a])

      const top10Keys = sortedKeys.slice(0, 10)
      this.barChartData = {
        labels: top10Keys,
        datasets: [
          {
            data: top10Keys.map(key => newRes.all_counter[key])
            ,
            label: 'Top Keywords'
          },
        ]
      }
      const top100 = sortedKeys.slice(0, 100)
      const max_weight = newRes.all_counter[top100[0]]
      this.cloudData = top100.map(key => {
        let weight = newRes.all_counter[key] / max_weight * 10
        return {
          text: key,
          weight,
          // rotate: Math.floor(Math.random() * 90) - 45,
          tooltip: `${newRes.all_counter[key]} occurrences`,
        }
      })
      setTimeout(() => {
        this.tagCloudComponent && this.tagCloudComponent.reDraw()
      }, 1000)
      this.loading = false
    })
  }

  get state() {
    return this.urlData.value
  }

  log(eventType: string, e?: any) {
    console.log(eventType, e);
  }

  analyseURL() {
    console.log(this.formgroup.value)
    this.loading = true
    this.http.post<APIResponse>(ANALYSE_URL, {
      //url: 'https://' + this.form('url'),
      url: this.form('url'),
    }).subscribe(res => {
      this.urlData.next(res)
      this.loading = false
    })
  }

  form(param: string): string {
    return this.formgroup.get(param)?.value || ""
  }

  setUrl(subpage: string) {
    this.formgroup.get('url')?.setValue(subpage.replaceAll('https://', ""))
  }

  /*displayContent() {
    this.dialog.open(DialogContent, {
      data: this.state?.text
    });
  
    const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
      data: this.state?.text, // Pass the current text to the dialog
    });
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        // Update the text variable with the user-entered text
        this.text = result;

        this.urlData.next(response)
        // @ts-ignore
        window.home = this;
        this.urlData.subscribe(newRes => {
        if (!newRes) {
        return
        }
        console.log({newRes})


        
        const sortedKeys = Object.keys(newRes.all_counter)
        .sort((a, b) => newRes.all_counter[b] - newRes.all_counter[a])

        const top10Keys = sortedKeys.slice(0, 10)
        data: top10Keys.map(key => newRes.all_counter[key])
        // Call the Rabin-Karp algorithm with the updated text
        const keyword = 'your_keyword'; // Replace with the desired keyword
        const occurrences = this.rabin_karp_string_search(keyword, this.text);
  
        // Handle the occurrences as needed
      });
    });
  } */
/*
  displayContent() {
    // Open the dialog to allow the user to enter text
    const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
      data: this.state?.text, // Pass the current text to the dialog
    });
  
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        // Update the text variable with the user-entered text
        this.text = result;
  
        this.urlData.next(response);
        // @ts-ignore
        window.home = this;
        this.urlData.subscribe(newRes => {
          if (!newRes) {
            return;
          }
          console.log({ newRes });
  
          const sortedKeys = Object.keys(newRes.all_counter)
            .sort((a, b) => newRes.all_counter[b] - newRes.all_counter[a]);
  
          const top10Keys = sortedKeys.slice(0, 10);
  
          // Execute Rabin-Karp algorithm for each keyword in top10Keys
          top10Keys.forEach(keyword => {
            const occurrences = this.rabin_karp_string_search(keyword, this.text);
            // Handle the occurrences as needed for each keyword
            console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
          });
        });
      }
    });
  }
  
  rabin_karp_string_search(keyword: string, text: string): number[] {
    // Rabin-Karp search implementation
    // Initialize variables
    keyword = keyword.toLowerCase(); // Convert keyword to lowercase for case-insensitive search
    text = text.toLowerCase();

    const prime = 101; // A prime number for hashing
    let keyword_hash = 0;
    let text_hash = 0;

    const keywordLen = keyword.length;
    const textLen = text.length;
    const occurrences: number[] = [];

    // Calculate the initial text hash
    for (let i = 0; i < keywordLen; i++) {
      text_hash += text.charCodeAt(i);
    }

    for (let i = 0; i < textLen - keywordLen + 1; i++) {
      if (text_hash === keyword_hash && text.slice(i, i + keywordLen) === keyword) {
        occurrences.push(i);
      }

      if (i < textLen - keywordLen) {
        // Update the text hash using rolling hash
        text_hash = text_hash - text.charCodeAt(i) + text.charCodeAt(i + keywordLen);
      }
    }

    return occurrences;
  } */

  /*displayContent() {
    // Open the dialog to allow the user to enter text
    const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
      data: this.state?.text, // Pass the current text to the dialog
    });
  }

  totalTimeTaken: number | undefined;
  executeRabinKarpForTop10Keywords() {
    const startTime = performance.now();
    // Ensure top10Keys is available here
    const top10Keys = this.getTop10Keywords(); // Define a method to get top10Keys
  
    if (top10Keys.length === 0) {
      console.log('top10Keys is empty.');
      const endTime = performance.now();
      this.totalTimeTaken = endTime - startTime;
      return;
    }
  
    // Open the dialog to allow the user to enter text
    const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
      data: this.state?.text, // Pass the current text to the dialog
    });
  
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        // Iterate through top10Keys and execute Rabin-Karp for each keyword
        top10Keys.forEach(keyword => {
          const occurrences = this.rabin_karp_string_search(keyword, result);
          // Handle the occurrences as needed for each keyword
          console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
        });
        const endTime = performance.now();
      this.totalTimeTaken = endTime - startTime;

      // Print the total time taken
      console.log(`Total time taken: ${this.totalTimeTaken} milliseconds`);
      }
    });
  }*/

  iterate(top_keywords: { [p: string]: number } | undefined) {
    if (!top_keywords) return []
    return Object.keys(top_keywords || {})
      .sort((a, b) => top_keywords[b] - top_keywords[a])
      .map(key => {
        return {
          key,
          value: top_keywords[key]
        }
      });
  }
  

  getTop10Keywords(): string[] {
    const sortedKeys = Object.keys(this.state?.all_counter || {})
      .sort((a, b) => (this.state?.all_counter?.[b] ||0)- (this.state?.all_counter?.[a]||0));
  
    return sortedKeys.slice(0, 10);
  }

  /*
  dialogText: string = '';
  displayContent() {
    // Open the dialog to allow the user to enter text
    const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
      data: this.text // Pass the current text to the dialog
    });
  
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        // Update the dialogText variable with the user-entered text
        this.dialogText = result;
  
        // Call the Rabin-Karp algorithm with the updated text
        const top10Keys = this.getTop10Keywords();
        top10Keys.forEach(keyword => {
          const occurrences = this.rabin_karp_string_search(keyword, this.dialogText);
          // Handle the occurrences as needed
          console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
        });
      }
    });
  }

  totalTimeTaken: number | undefined;
  executeRabinKarpForTop10Keywords() {
    const startTime = performance.now();
    const top10Keys = this.getTop10Keywords();
  
    if (top10Keys.length === 0) {
      console.log('top10Keys is empty.');
      const endTime = performance.now();
      this.totalTimeTaken = endTime - startTime;
      return;
    }
  
    // Ensure dialogText contains the text input from the dialog
    const dialogText = this.dialogText;
  
    // Iterate through top10Keys and execute Rabin-Karp for each keyword
    top10Keys.forEach(keyword => {
      const occurrences = this.rabin_karp_string_search(keyword, dialogText);
      // Handle the occurrences as needed for each keyword
      console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
    });
  
    const endTime = performance.now();
    this.totalTimeTaken = endTime - startTime;
  
    // Print the total time taken
    console.log(`Total time taken: ${this.totalTimeTaken} milliseconds`);
  }
  
  executekmpSearchTop10Keywords() {
    const startTime = performance.now();
    const top10Keys = this.getTop10Keywords();
  
    if (top10Keys.length === 0) {
      console.log('top10Keys is empty.');
      const endTime = performance.now();
      this.totalTimeTaken = endTime - startTime;
      return;
    }
  
    // Ensure dialogText contains the text input from the dialog
    const dialogText = this.dialogText;
  
    // Iterate through top10Keys and execute Rabin-Karp for each keyword
    top10Keys.forEach(keyword => {
      const occurrences = this.kmpSearch(keyword, dialogText);
      // Handle the occurrences as needed for each keyword
      console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
    });
  
    const endTime = performance.now();
    this.totalTimeTaken = endTime - startTime;
  
    // Print the total time taken
    console.log(`Total time taken: ${this.totalTimeTaken} milliseconds`);
  }
  */

  dialogText: string = '';

displayContent() {
  // Open the dialog to allow the user to enter text
  const dialogRef: MatDialogRef<DialogContent, string | undefined> = this.dialog.open(DialogContent, {
    data: this.text // Pass the current text to the dialog
  });

  dialogRef.afterClosed().subscribe((result: string | undefined) => {
    if (result) {
      // Update the dialogText variable with the user-entered text
      this.dialogText = result;
      
      // You can choose which algorithm to execute based on user selection
      if (this.selectedAlgorithm === 'Rabin-Karp') {
        this.executeRabinKarpForTop10Keywords();
      } else if (this.selectedAlgorithm === 'KMP') {
        this.executekmpSearchTop10Keywords();
      }
    }
  });
}

totalTimeTaken: number | undefined;
rabinKarpOutput: string | undefined;
suffixTreeOutput: string | undefined;
suffixArrayOutput: string | undefined;
naiveStringMatchingOutput: string | undefined;
kmpOutput: string | undefined;
selectedAlgorithm = 'Rabin-Karp'; // Initialize with Rabin-Karp as default

executeRabinKarpForTop10Keywords() {
  const startTime = performance.now();
  const top10Keys = this.getTop10Keywords();

  if (top10Keys.length === 0) {
    console.log('top10Keys is empty.');
    const endTime = performance.now();
    this.totalTimeTaken = endTime - startTime;
    return;
  }

  // Ensure dialogText contains the text input from the dialog
  const dialogText = this.dialogText;

  // Iterate through top10Keys and execute Rabin-Karp for each keyword
  top10Keys.forEach(keyword => {
    const occurrences = this.rabin_karp_string_search(keyword, dialogText);
    // Handle the occurrences as needed for each keyword
    console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
  });

  const endTime = performance.now();
  this.totalTimeTaken = endTime - startTime;

  // Print the total time taken
  console.log(`Total time taken: ${this.totalTimeTaken} milliseconds`);
  this.rabinKarpOutput = this.totalTimeTaken.toFixed(6).toString();
}

executekmpSearchTop10Keywords() {
  const startTime = performance.now();
  const top10Keys = this.getTop10Keywords();

  if (top10Keys.length === 0) {
    console.log('top10Keys is empty.');
    const endTime = performance.now();
    this.totalTimeTaken = endTime - startTime;
    return;
  }

  // Ensure dialogText contains the text input from the dialog
  const dialogText = this.dialogText;

  // Iterate through top10Keys and execute KMP search for each keyword
  top10Keys.forEach(keyword => {
    const occurrences = this.kmpSearch(keyword, dialogText);
    // Handle the occurrences as needed for each keyword
    console.log(`Keyword: ${keyword}, Occurrences: `, occurrences);
  });

  const endTime = performance.now();
  this.totalTimeTaken = endTime - startTime;


  // Print the total time taken
  console.log(`Total time taken: ${this.totalTimeTaken} milliseconds`);
  this.kmpOutput = this.totalTimeTaken.toFixed(6).toString();
}

  

  rabin_karp_string_search(keyword: string, text: string): number[] {
    // Rabin-Karp search implementation
    // Initialize variables
    keyword = keyword.toLowerCase(); // Convert keyword to lowercase for case-insensitive search
    text = text.toLowerCase();

    const prime = 101; // A prime number for hashing
    let keyword_hash = 0;
    let text_hash = 0;

    const keywordLen = keyword.length;
    const textLen = text.length;
    const occurrences: number[] = [];

    // Calculate the initial text hash
    for (let i = 0; i < keywordLen; i++) {
      text_hash += text.charCodeAt(i);
    }

    for (let i = 0; i < textLen - keywordLen + 1; i++) {
      if (text_hash === keyword_hash && text.slice(i, i + keywordLen) === keyword) {
        occurrences.push(i);
      }

      if (i < textLen - keywordLen) {
        // Update the text hash using rolling hash
        text_hash = text_hash - text.charCodeAt(i) + text.charCodeAt(i + keywordLen);
      }
    }

    return occurrences;
  }
  
  kmpSearch(keyword: string, text: string): number[] {
    // Convert keyword and text to lowercase for case-insensitive search
    keyword = keyword.toLowerCase();
    text = text.toLowerCase();
  
    const keywordLen = keyword.length;
    const textLen = text.length;
  
    // Build the KMP failure function (partial match table)
    const failure: number[] = new Array(keywordLen).fill(0);
    let j = 0;
    for (let i = 1; i < keywordLen; i++) {
      while (j > 0 && keyword[i] !== keyword[j]) {
        j = failure[j - 1];
      }
      if (keyword[i] === keyword[j]) {
        j++;
      }
      failure[i] = j;
    }
  
    // Perform the KMP search
    const occurrences: number[] = [];
    j = 0;
    for (let i = 0; i < textLen; i++) {
      while (j > 0 && text[i] !== keyword[j]) {
        j = failure[j - 1];
      }
      if (text[i] === keyword[j]) {
        j++;
      }
      if (j === keywordLen) {
        const start = i - j + 1;
        occurrences.push(start);
        j = failure[j - 1];
      }
    }
  
    return occurrences;
  }
  

  
  
  executeSuffixTree(){

  }
  executeSuffixArray(){}
  executeNaive_String_Matching(){}
  executeKMP(){}
//rabinKarpOutput: string | undefined;
//suffixTreeOutput: string | undefined;

  // Add variables for other algorithms as needed
    
//selectedAlgorithm: string = 'Rabin-Karp'; // Default to Rabin-Karp

onAlgorithmSelected(event: any) {
  this.selectedAlgorithm = event.value;
}
showAlgorithmOutput: boolean = false;


executeAlgorithm() {
  this.showAlgorithmOutput = true;
  if (this.selectedAlgorithm === 'Rabin-Karp') {
    this.executeRabinKarpForTop10Keywords();
  } else if (this.selectedAlgorithm === 'Suffix Tree') {
    this.executeSuffixTree(); // Implement the Suffix Tree logic
  } else if (this.selectedAlgorithm === 'Suffix Array') {
    this.executeSuffixArray(); // Implement the Suffix Tree logic
  } else if (this.selectedAlgorithm === 'Naive String Matching') {
    this.executeNaive_String_Matching(); // Implement the Suffix Tree logic
  } else if (this.selectedAlgorithm === 'KMP') {
    this.executekmpSearchTop10Keywords(); // Implement the Suffix Tree logic
  }

}

showCharts() {
  this.showAlgorithmOutput = false;
  
  
  this.executeRabinKarpForTop10Keywords;
  this.executeSuffixArray;
  this.executeSuffixTree;
  this.executeNaive_String_Matching;
  this.executekmpSearchTop10Keywords;
  // Reset the results
  /*this.rabinKarpOutput = undefined;
  this.suffixTreeOutput = undefined;
  this.suffixArrayOutput = undefined;
  this.naiveStringMatchingOutput = undefined;
  this.kmpOutput = undefined;

  // Execute all selected algorithms
  if (this.selectedAlgorithm === 'Rabin-Karp') {
    this.executeRabinKarpForTop10Keywords();
  } else if (this.selectedAlgorithm === 'Suffix Tree') {
    this.executeSuffixTree();
  } else if (this.selectedAlgorithm === 'Suffix Array') {
    this.executeSuffixArray();
  } else if (this.selectedAlgorithm === 'Naive String Matching') {
    this.executeNaive_String_Matching();
  } else if (this.selectedAlgorithm === 'KMP') {
    this.executekmpSearchTop10Keywords();
  }*/
  this.rabinKarpOutput
  this.suffixTreeOutput 
  this.suffixArrayOutput
  this.naiveStringMatchingOutput 
  this.kmpOutput
}


}



