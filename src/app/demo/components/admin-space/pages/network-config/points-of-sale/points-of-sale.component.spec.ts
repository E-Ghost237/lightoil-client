import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsOfSaleComponent } from './points-of-sale.component';

describe('PointsOfSaleComponent', () => {
  let component: PointsOfSaleComponent;
  let fixture: ComponentFixture<PointsOfSaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointsOfSaleComponent]
    });
    fixture = TestBed.createComponent(PointsOfSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
