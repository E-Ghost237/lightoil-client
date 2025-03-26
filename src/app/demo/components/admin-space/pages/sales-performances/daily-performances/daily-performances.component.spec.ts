import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPerformancesComponent } from './daily-performances.component';

describe('DailyPerformancesComponent', () => {
  let component: DailyPerformancesComponent;
  let fixture: ComponentFixture<DailyPerformancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyPerformancesComponent]
    });
    fixture = TestBed.createComponent(DailyPerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
