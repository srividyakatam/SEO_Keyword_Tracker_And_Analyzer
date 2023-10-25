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

import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

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
      url: 'https://' + this.form('url'),
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

  displayContent() {
    this.dialog.open(DialogContent, {
      data: this.state?.text
    })
  }

  iterate(top_keywords: { [p: string]: number } | undefined) {
    if (!top_keywords) return []
    return Object.keys(top_keywords || {})
      .sort((a, b) => top_keywords[b] - top_keywords[a])
      .map(key => {
        return {
          key,
          value: top_keywords[key]
        }
      })
  }
}

