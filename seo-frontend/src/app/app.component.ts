import {Component, ViewChild} from '@angular/core';
import {CloudData, CloudOptions, TagCloudComponent} from "angular-tag-cloud-module";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ANALYSE_URL, APIResponse} from "./constants";
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter',
          [style({opacity: 0}), stagger('100ms', animate('1s ease-out', style({opacity: 1})))],
          {optional: true}
        ),
        query(':leave',
          animate('1s', style({opacity: 0})),
          {optional: true}
        )
      ])
    ])
  ]
})
export class AppComponent {

  @ViewChild('tagCloudComponent', {static: true}) tagCloudComponent!: TagCloudComponent;
  options: CloudOptions = {
    width: 1,
    height: 1000,
    overflow: true,
    zoomOnHover: {
      scale: 1.2,
      transitionTime: 0.3,
    },
    realignOnResize: true,
    step: 1,
    randomizeAngle: true,
  };

  data: CloudData[] = Array.from({length: 100}, (_, i) => {
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
  showiFrame = true;
  loading: boolean = true;
  loading_messages = [
    "Fetching URL",
    "Analysing URL",
    "Generating Word Cloud",
    "Done"
  ]

  constructor(
    private http: HttpClient
  ) {
    // @ts-ignore
    window.home = this;
  }

  log(eventType: string, e?: any) {
    console.log(eventType, e);
  }

  analyseURL() {
    console.log(this.formgroup.value)
    this.loading = true
    this.http.post<APIResponse>(ANALYSE_URL, {
      url: this.formgroup.value.url,
    }).subscribe(res => {
      console.log(res)
      const sortedKeys = Object.keys(res.all_counter).sort((a, b) => res.all_counter[b] - res.all_counter[a]);

      const top100 = sortedKeys.slice(0, 100)
      const max_weight = res.all_counter[top100[0]]
      this.data = top100.map(key => {
        let weight = res.all_counter[key] / max_weight * 10
        return {
          text: key,
          weight,
          rotate: Math.floor(Math.random() * 90) - 45,
          tooltip: `${res.all_counter[key]} occurrences`,
        }
      })
      this.tagCloudComponent.reDraw()
      this.loading = false
    })
  }
}
