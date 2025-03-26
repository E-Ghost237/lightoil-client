import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HbtTankComponent } from './hbt-tank.component';

describe('HbtTankComponent', () => {
  let component: HbtTankComponent;
  let fixture: ComponentFixture<HbtTankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HbtTankComponent]
    });
    fixture = TestBed.createComponent(HbtTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
