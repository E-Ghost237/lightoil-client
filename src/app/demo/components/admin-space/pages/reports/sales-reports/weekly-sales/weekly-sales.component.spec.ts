import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklySalesComponent } from './weekly-sales.component';

describe('WeeklySalesComponent', () => {
  let component: WeeklySalesComponent;
  let fixture: ComponentFixture<WeeklySalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklySalesComponent]
    });
    fixture = TestBed.createComponent(WeeklySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
