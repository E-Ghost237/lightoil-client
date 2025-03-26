import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualPerformancesComponent } from './annual-performances.component';

describe('AnnualPerformancesComponent', () => {
  let component: AnnualPerformancesComponent;
  let fixture: ComponentFixture<AnnualPerformancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnualPerformancesComponent]
    });
    fixture = TestBed.createComponent(AnnualPerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
