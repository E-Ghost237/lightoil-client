import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowMeterDetailsComponent } from './flow-meter-details.component';

describe('FlowMeterDetailsComponent', () => {
  let component: FlowMeterDetailsComponent;
  let fixture: ComponentFixture<FlowMeterDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlowMeterDetailsComponent]
    });
    fixture = TestBed.createComponent(FlowMeterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
