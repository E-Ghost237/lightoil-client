import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankListByTypeComponent } from './tank-list-by-type.component';

describe('TankListByTypeComponent', () => {
  let component: TankListByTypeComponent;
  let fixture: ComponentFixture<TankListByTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TankListByTypeComponent]
    });
    fixture = TestBed.createComponent(TankListByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
