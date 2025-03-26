import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyPerformancesComponent } from './monthly-performances.component';

describe('MonthlyPerformancesComponent', () => {
  let component: MonthlyPerformancesComponent;
  let fixture: ComponentFixture<MonthlyPerformancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyPerformancesComponent]
    });
    fixture = TestBed.createComponent(MonthlyPerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
