import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPerformancesChartsComponent } from './sales-performances-charts.component';

describe('SalesPerformancesChartsComponent', () => {
  let component: SalesPerformancesChartsComponent;
  let fixture: ComponentFixture<SalesPerformancesChartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesPerformancesChartsComponent]
    });
    fixture = TestBed.createComponent(SalesPerformancesChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
