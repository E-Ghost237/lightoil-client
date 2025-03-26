import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeSalesComponent } from './cumulative-sales.component';

describe('CumulativeSalesComponent', () => {
  let component: CumulativeSalesComponent;
  let fixture: ComponentFixture<CumulativeSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CumulativeSalesComponent]
    });
    fixture = TestBed.createComponent(CumulativeSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
