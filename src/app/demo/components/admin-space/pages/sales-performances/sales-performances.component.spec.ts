import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPerformanceComponent } from './sales-performances.component';

describe('SalesPerformanceComponent', () => {
  let component: SalesPerformanceComponent;
  let fixture: ComponentFixture<SalesPerformanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesPerformanceComponent]
    });
    fixture = TestBed.createComponent(SalesPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
