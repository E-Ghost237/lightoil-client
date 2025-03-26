import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicesTreatmentComponent } from './indices-treatment.component';

describe('IndicesTreatmentComponent', () => {
  let component: IndicesTreatmentComponent;
  let fixture: ComponentFixture<IndicesTreatmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndicesTreatmentComponent]
    });
    fixture = TestBed.createComponent(IndicesTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
