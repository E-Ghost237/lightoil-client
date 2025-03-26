import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySalesComponent } from './daily-sales.component';

describe('DailySalesComponent', () => {
  let component: DailySalesComponent;
  let fixture: ComponentFixture<DailySalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailySalesComponent]
    });
    fixture = TestBed.createComponent(DailySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
