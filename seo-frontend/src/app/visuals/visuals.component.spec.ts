import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualsComponent } from './visuals.component';

describe('VisualsComponent', () => {
  let component: VisualsComponent;
  let fixture: ComponentFixture<VisualsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisualsComponent]
    });
    fixture = TestBed.createComponent(VisualsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
