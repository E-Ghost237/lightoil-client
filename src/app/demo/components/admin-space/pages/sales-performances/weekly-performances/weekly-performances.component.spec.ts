import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyPerformancesComponent } from './weekly-performances.component';

describe('WeeklyPerformancesComponent', () => {
  let component: WeeklyPerformancesComponent;
  let fixture: ComponentFixture<WeeklyPerformancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklyPerformancesComponent]
    });
    fixture = TestBed.createComponent(WeeklyPerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
