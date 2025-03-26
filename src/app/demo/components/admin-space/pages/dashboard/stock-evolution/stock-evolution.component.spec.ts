import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEvolutionComponent } from './stock-evolution.component';

describe('StockEvolutionComponent', () => {
  let component: StockEvolutionComponent;
  let fixture: ComponentFixture<StockEvolutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockEvolutionComponent]
    });
    fixture = TestBed.createComponent(StockEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
