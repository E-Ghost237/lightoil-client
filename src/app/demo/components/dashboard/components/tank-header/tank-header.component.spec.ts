import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankHeaderComponent } from './tank-header.component';

describe('TankHeaderComponent', () => {
  let component: TankHeaderComponent;
  let fixture: ComponentFixture<TankHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TankHeaderComponent]
    });
    fixture = TestBed.createComponent(TankHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
