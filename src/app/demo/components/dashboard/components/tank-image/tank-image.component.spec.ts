import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankImageComponent } from './tank-image.component';

describe('TankImageComponent', () => {
  let component: TankImageComponent;
  let fixture: ComponentFixture<TankImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TankImageComponent]
    });
    fixture = TestBed.createComponent(TankImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
