import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankOutletReportsComponent } from './tank-outlet-reports.component';

describe('TankOutletReportsComponent', () => {
  let component: TankOutletReportsComponent;
  let fixture: ComponentFixture<TankOutletReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TankOutletReportsComponent]
    });
    fixture = TestBed.createComponent(TankOutletReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
