import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDividerComponent } from './custom-divider.component';

describe('CustomDividerComponent', () => {
  let component: CustomDividerComponent;
  let fixture: ComponentFixture<CustomDividerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDividerComponent]
    });
    fixture = TestBed.createComponent(CustomDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
