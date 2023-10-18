import {Component} from '@angular/core';
import {CloudData, CloudOptions} from "angular-tag-cloud-module";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
    algorithm: new FormControl('', [Validators.required]),
  });

  constructor() {
    // @ts-ignore
    window.home = this;
  }

  log(eventType: string, e?: any) {
    console.log(eventType, e);
  }
}
