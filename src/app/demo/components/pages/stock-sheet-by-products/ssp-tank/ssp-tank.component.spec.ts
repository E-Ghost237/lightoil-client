import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SspTankComponent } from './ssp-tank.component';

describe('SspTankComponent', () => {
  let component: SspTankComponent;
  let fixture: ComponentFixture<SspTankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SspTankComponent]
    });
    fixture = TestBed.createComponent(SspTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
