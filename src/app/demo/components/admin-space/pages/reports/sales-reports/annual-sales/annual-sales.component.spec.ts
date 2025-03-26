import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualSalesComponent } from './annual-sales.component';

describe('AnnualSalesComponent', () => {
  let component: AnnualSalesComponent;
  let fixture: ComponentFixture<AnnualSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnualSalesComponent]
    });
    fixture = TestBed.createComponent(AnnualSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
