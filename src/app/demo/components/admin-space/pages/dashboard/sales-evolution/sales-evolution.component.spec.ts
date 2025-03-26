import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesEvolutionComponent } from './sales-evolution.component';

describe('SalesEvolutionComponent', () => {
  let component: SalesEvolutionComponent;
  let fixture: ComponentFixture<SalesEvolutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesEvolutionComponent]
    });
    fixture = TestBed.createComponent(SalesEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
